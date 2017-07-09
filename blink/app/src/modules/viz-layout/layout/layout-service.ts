/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview: Layout service which can be used to layout an array of layout Tiles.
 *
 * The API for this class consists of these primary methods:
 *
 * 1. [Constructor]:         Provide the $container and needed callbacks.
 * 2. [redraw(layoutTiles)]: Calling this method will redraw the canvas with
 *                           the supplied layoutTiles, newer ones will be added,
 *                           deleted will be removed
 *                           and existing will continue untouched.
 * 3. [tilesInViewport]: Returns an array of tiles inside the current viewport.
 * 4. [reflow]:          To reflow the tiles in the layout.
 * 5. [resizeTile]:      When a tile is resized, this should be called by the user of this
 *                       service to inform the service and trigger a reflow, also do bookkeeping.
 *
 * PS: There is an underlying assumption that the tiles are uniquely identified by a supplied id.
 */
import _ from 'lodash';
import {ngRequire, Provide} from 'src/base/decorators';

let Logger = ngRequire('Logger');
let util = ngRequire('util');

let CANVAS_SCROLL_DELAY = 250,
    VIEWPORT_TOLERANCE_FRACTION = 0.25, // Stretch the viewport to eager load some vizs.
    HOLE_CONSIDERATION_THRESHOLD_WIDTH = 1280,
    FINE_X_ADJUST_THRESHOLD = 1,
    DRAG_ITEM_EVENT = 'dragItemPositioned';

declare var Draggabilly;
declare var Packery;

export interface TileLayout {
    order: number; // The order in the layout.
    size: string;  // The size of a tile.
    id: string; // id of a tile, this does not change throughout the lifetime of a tile.
    height: number;
    width: number;
    x: number; // The relative x-position, used to retain position in viewport > hole_threshold.
    y: number;
}

export interface TileElement {
    id: string;
    $node: JQuery;
}


@Provide('LayoutService')
export class LayoutService {
    private idToTile : { [key:string]: TileElement } = {};
    private idToTileLayout: { [key:string]:TileLayout } = {};
    private currentViewportRect : ClientRect = null;
    private layoutTiles : TileLayout[];
    private packery;
    private logger = Logger.create('layout-service');
    private $content: JQuery;
    // A user have some empty holes in the layout, we only consider them for larger viewports.
    private shouldConsiderHoles: boolean = $(window).width() >= HOLE_CONSIDERATION_THRESHOLD_WIDTH;

    /**
     * Constructor for the service
     * The service expects to be instanciated with a root $answer node with the following children:
     *     .bk-answer-content (Container for all the visualizations)
     * @param {Object} $container       The jQuery object corresponding to the container managed
     *                                  this is the element on which scroll's would be defined.
     * @param {Function} getTileElement
     * @param {Function} onTileDestroyed  Callback called when tile is removed.
     * @param {Function} [Output callback]onLayoutReflowDone
     * @param {Function} [Output callback]onViewportChanged
     */
    constructor(private $container : JQuery,
                private getTileElement: (id: string) => Promise<TileElement>,
                private onTileDestroyed: (tile: TileElement) => void,
                private onLayoutReflowDone: (evt) => void,
                private onViewportChanged: () => void) {
        this.init();
    }

    /**
     * Redraws the layout
     */
    public redraw(layoutTiles : { [id:string]:TileLayout }, allowEdit: boolean) {
        if (!this.$content) {
            return;
        }

        this.logger.log('Rendering answer with layout data', this);

        // The vizs array will contain all the vizs of the new answer
        this.layoutTiles = this.getLayout(layoutTiles);
        this.idToTileLayout = layoutTiles;
        var tileBuckets = this.getLayoutTilesBucketedIntoNewDeletedAndExisting(
            this.layoutTiles
        );
        var tilePromises : Promise<TileElement>[] = [];
        var self = this;

        tileBuckets.deletedIds.forEach(function (vizId) {
            self.removeTile(vizId);
        });

        tileBuckets.newIds.forEach(function (vizId) {
            var promise = self.createTile(vizId);
            tilePromises.push(promise);
        });

        Promise.all<TileElement>(tilePromises).then(function(tileElems) {
            if(tileElems.length === 0) {
                self.onLayoutReflow();
                return;
            }

            var tileNodes = tileElems.map((t) => {return t.$node[0];});
            util.executeInNextEventLoop(function() {
                //Append the created tiles to the container.
                self.$content.append(tileNodes);
                util.executeInNextEventLoop(function () {
                    //Once appended, add it to packery
                    self.packery.appended(tileNodes);
                    // Now for each tile element, we need to adjust finer
                    // positions and attach drag events.
                    tileElems.forEach(function(tileElement) {
                        self.idToTile[tileElement.id] = tileElement;
                        var $node = tileElement.$node[0];
                        var layoutTile = self.idToTileLayout[tileElement.id];
                        // Finer adjustment done when this flag is true.
                        if(self.shouldConsiderHoles && layoutTile.x < 1) {
                            var item = self.packery.getItem($node);
                            // Set the finer 'x' coordinate. Only when the difference is above the
                            // threshold, this thresholding is required to circumvent
                            // decimal rounding errors in packery,
                            // https://github.com/metafizzy/packery/issues/401
                            var finerX = layoutTile.x * self.packery.packer.width;
                            if (Math.abs(finerX - item.rect.x) > FINE_X_ADJUST_THRESHOLD) {
                                item.rect.x = finerX;
                            }
                        }
                        if(!!allowEdit) {
                            // If editing allowed, attach the drag events.
                            var draggie = new Draggabilly( $node, {
                                scrollContainer: self.$container,
                                autoScrollThreshold: 120
                            });
                            tileElement.$node.data('draggabilly', draggie);
                            self.packery.bindDraggabillyEvents(draggie);
                        }
                    });
                    self.packery.shiftLayout();
                });
            });
        });

        self.logger.timeEnd('Layout service rendering');
    }

    public resetLayout() {
        this.packery.layout();
    }

    // Reflows the previous call to render.
    public reflow() {
        if (!this.$content || !this.layoutTiles) {
            return;
        }

        this.logger.log('Reflowing the existing layout', this);

        var self = this;
        util.executeInNextEventLoop(function() {
            self.packery.shiftLayout();
        });
        this.currentViewportRect = this.getCurrentViewportRect();
    }

    public isTileInViewport(id : string) {
        if (!this.idToTile.hasOwnProperty(id)) {
            return false;
        }
        var $node = this.idToTile[id].$node;
        if (!$node) {
            this.logger.warn('viz not found', id);
            return false;
        }

        let tileRect = $node[0].getBoundingClientRect();
        let tileTop = tileRect.top;
        let tileBottom = tileRect.bottom;

        let viewportHeight = this.currentViewportRect.height;
        let viewportBuffer = viewportHeight * VIEWPORT_TOLERANCE_FRACTION;
        let effectiveViewportTop = this.currentViewportRect.top - viewportBuffer;
        let effectiveViewportBottom = this.currentViewportRect.bottom + viewportBuffer;

        return tileBottom > effectiveViewportTop && tileTop < effectiveViewportBottom;
    }

    public getTiles(): TileLayout[] {
        return this.layoutTiles.slice();
    }

    public getTilesInViewport(): TileLayout[] {
        if (!this.layoutTiles) {
            return [];
        }
        return this.layoutTiles.filter((layoutTile: TileLayout) => {
            return this.isTileInViewport(layoutTile.id);
        });
    }

    public onTileResized(id: string, newSize) {
        //If id or Size are not defined, the tile resizing is not persisted.
        if(!!id && !!newSize) {
            var viz = this.idToTileLayout[id];
            viz.size = newSize;
        }
        // Give time to the new size of the tile to take effect
        // before reflowing the layout.
        util.executeInNextEventLoop(() => {
            this.packery.layout();
        });
    }

    public disableDragging() {
        this.packery.isEnabled = false;
    }

    public enableDragging() {
        this.packery.isEnabled = true;
    }

    private init() : void {
        this.$container.scroll(
            _.debounce(
                () => {
                    if (!this.layoutTiles || !this.layoutTiles.length) {
                        return;
                    }
                this.updateViewport();
                this.onViewportChanged();
            }, CANVAS_SCROLL_DELAY));

        this.$content = this.$container.find('.tile-container');
        this.packery = new Packery(this.$content[0], {
            itemSelector: '.bk-packable',
            columnWidth: '.grid-sizer',
            percentPosition: true,
            transitionDuration: '0.2s',
            gutter: '.gutter-sizer'
        });
        this.$content.on('layoutComplete', this.onLayoutReflow);
        this.$content.on(DRAG_ITEM_EVENT, this.onLayoutReflow);
        $(window).on('resize', () => {
            this.shouldConsiderHoles = $(window).width() >= HOLE_CONSIDERATION_THRESHOLD_WIDTH;
        });
    }

    private getCurrentViewportRect() : ClientRect {
        // NOTE: Container of the pinboard can be of an arbitrary size so we
        // get an overlap of body and the container.
        // Eg. In case of homepage where we attain an unified flow from the
        // search div and pinboard, pinboard is of the full height needed to view
        // Now that could throw of the logic here as all tiles will be in the
        // viewport. So we get an intersection with the body.
        let containerRect = this.$container[0].getBoundingClientRect();
        let bodyRect = document.body.getBoundingClientRect();
        let overlapRect = util.getOverlappingBoundingRect(containerRect, bodyRect);
        return overlapRect;
    }

    private updateViewport() {
        this.currentViewportRect = this.getCurrentViewportRect();
    }

    private createTile(id) : Promise<TileElement> {
        return this.getTileElement(id);
    }

    private onLayoutReflow = (evt : JQueryEventObject | any = {type: void 0}) => {
        var self = this;
        var isDragged = evt.type === DRAG_ITEM_EVENT;
        self.packery.items.forEach(function(item, i) {
            var elem = item.element;
            var id = elem.getAttribute('id');
            var layoutTile = self.idToTileLayout[id];
            layoutTile.order = i;
            if(self.shouldConsiderHoles) {
                layoutTile.x = item.rect.x / self.packery.packer.width;
            } else {
                // Reset the x fraction, 1 denotes auto layouting.
                layoutTile.x = 1;
            }
        });
        this.updateViewport();
        this.onLayoutReflowDone(isDragged);
    }

    /**
     * Given idToTile (containing the vizs from previous answer) and layout (containing vizs
     * from current answer), will return the bucket of new vizs,
     * the deleted viz ids and existing viz ids.
     *
     * @param  {Array}  layout  The new layout
     * @return {Object}
     */
    private getLayoutTilesBucketedIntoNewDeletedAndExisting(layout: Array<TileLayout>) {
        var tilesNotInLayout = _.assign({}, this.idToTile),
            vizBuckets = {
                newIds: [],
                exisitingIds: [],
                deletedIds: []
            };
        var self = this;

        layout.forEach(function(layoutTile) {
            var id = layoutTile.id;
            if (!id) {
                return;
            }

            if (!_.has(self.idToTile, id)) {
                vizBuckets.newIds.push(id);
            } else {
                vizBuckets.exisitingIds.push(id);
                delete tilesNotInLayout[id];
            }
        });

        vizBuckets.deletedIds = Object.keys(tilesNotInLayout);
        return vizBuckets;
    }

    private removeTile(id : string) {
        if (this.idToTile.hasOwnProperty(id)) {
            var tile = this.idToTile[id];
            this.packery.remove(tile.$node);
            this.packery.shiftLayout();
            this.onTileDestroyed(tile);
            delete this.idToTile[id];
        }
    }

    private getLayout(layoutTiles : { [id:string]:TileLayout }) : TileLayout[] {
        var layout : TileLayout[] = <TileLayout[]>_.values(layoutTiles);
        // This puts tiles where 'order' is undefined(new tiles) at the end.
        return _.sortBy(layout, 'order');
    }
}
