/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {getRouteParameter} from 'src/base/route-service';
import {CanvasComponent} from '../../base/app-canvas/canvas-component';
import {ScopedComponent} from '../../base/base-types/scoped-component';
import {Component, ngRequire} from '../../base/decorators';
import {PinboardViewState} from '../pinboard/pinboard-page-config';
import {RuntimeFilterComponent} from './filter/runtime-filter';
import {RelatedLinkCache, RelatedLinkCacheItem} from './related-link-cache';

let navService = ngRequire('navService');
let PinboardPageConfig = ngRequire('PinboardPageConfig');
let strings = ngRequire('strings');
let events = ngRequire('events');

/**
 * A related link is a mapping from source visualization to destination pinboard,visualization.
 * The destination visualization is optional and if specified then we show only that visualization
 * in the pinboard.
 *
 * RelatedLinkComponent powers the url path of '/related-link/:relatedLinkId' as specified in
 * app/src/base/app.js file
 * .when('/related-link/:relatedLinkId',
 *        {page: blink.app.pages.APP_CANVAS, canvasState: blink.app.canvasStates.RELATED_LINK})
 *
 * This component is created in app/src/base/app-canvas/app-canvas-controller.js to display html
 * elements of templateUrl: 'src/modules/related-link/related-link.html in APP_CANVAS.
 *
 * Send data across html pages:
 * From the source visualization we need to send two sets of data to relatedLink page.
 * - The selected context menu data of the source visualization that that will form the filters.
 * - The relatedLink data that is selected to get to the target pinboard, visualization and the
 *   column mappings.
 *
 * We use RelatedLinkCache service to store the item in memory
 * as well as flush it to session manager.
 *
 */
@Component({
    name: 'bkRelatedLink',
    templateUrl: 'src/modules/related-link/related-link.html'
})
class RelatedLinkComponent extends ScopedComponent implements CanvasComponent {

    private static routeParameter : string = 'relatedLinkId';
    private static cache : RelatedLinkCache = new RelatedLinkCache();

    public relatedLinkSessionStoreId : string = '';
    public relatedLinkName : string;
    public relatedLinkDescription : string;
    public pinboardId : string = '';
    public pinboardPageConfig : any;
    public singleVizMode : boolean = false;
    public vizId : string = '';
    public selectedFilterComponent : RuntimeFilterComponent;
    private selectedFilter: any;

    private cacheItem : RelatedLinkCacheItem;

    // runtime filter
    private runtimeFilterChoices : Array<RuntimeFilterComponent>;

    public constructor() {
        super();
        this.init();
        this.initRelatedItem();
        this.selectFilterItem();
    }

    public onCanvasStateChange(params: any) {
        this.initRelatedItem();
        this.selectFilterItem();
        this.displayPinboard();
    }

    public onFilterRowClicked() {
        this.onFilterRowSelected();
        let navMethod = navService.goToRelatedLink;
        navMethod(this.relatedLinkSessionStoreId, this.selectedFilter);
    }

    public selectFilterItem() {
        // read search parameters.
        let searchParams = navService.getSearch();
        let paramsString = JSON.stringify(searchParams);

        if (paramsString === '{}') {
            this.selectedFilterComponent = null;
        } else {
            // compare runtime params with existing selection if present.
            if (paramsString !== JSON.stringify(this.selectedFilter)) {
                // find a match with existing source filters.
                this.selectedFilterComponent = this.findMatchingFilterRow(paramsString);
            }
        }

        this.onFilterRowSelected();
    }

    public isConfigurationValid() : boolean {
        return !!this.pinboardId;
    }

    public isFilterRowSelected(): boolean {
        return !!this.selectedFilterComponent;
    }

    public getSelectRowAsRunTimeFilterMessage() : string {
        return strings.relatedLink.Select_Row_As_Runtime_Filter;
    }

    public getInvalidConfigurationMessage() : string {
        return strings.relatedLink.Invalid_Configuration_Message;
    }

    private onFilterRowSelected() {
        this.selectedFilter = this.selectedFilterComponent.filterRow.filter;
    }

    private findMatchingFilterRow(paramsString: any) {
        return this.runtimeFilterChoices.find( (filterComponent) => {
            return paramsString === JSON.stringify(filterComponent.filterRow.filter);
        });
    }

    private getCacheItem(key) : RelatedLinkCacheItem {
        return RelatedLinkComponent.cache.getObject(key);
    }

    private displayPinboard() {
        this.broadcast(events.RELOAD_PINBOARD_DATA);
    }

    private initRelatedItem() {

        if (!!this.runtimeFilterChoices) {
            // If we have the filter choices we are good.
            return;
        }

        // if we don't have the filter choices, initialize them from cache.
        this.relatedLinkSessionStoreId =
            getRouteParameter(RelatedLinkComponent.routeParameter);
        this.cacheItem = this.getCacheItem(this.relatedLinkSessionStoreId);
        if (!this.cacheItem) {
            // if we don't find the choices in cache, we are in invalid configuration state.
            return;
        }

        // initialize from cache.
        let relatedLink = this.cacheItem.relatedLink;
        this.relatedLinkName = relatedLink.name;
        this.relatedLinkDescription = relatedLink.description;
        this.pinboardId = relatedLink.dstPinboardId;
        this.vizId = relatedLink.dstVizId;
        if (this.vizId) {
            this.singleVizMode = true;
            this.pinboardPageConfig.vizIdsToShow = [this.vizId];
        } else {
            this.pinboardPageConfig.vizIdsToShow = null;
            this.singleVizMode = false;
        }
        this.runtimeFilterChoices = this.cacheItem.filters.map(filter => {
            return new RuntimeFilterComponent(filter);
        });
    }

    private init() {
        this.pinboardPageConfig = new PinboardPageConfig({
            vizIdsToShow: null,
            disallowTileRemoval: true,
            disallowTileMaximization: true,
            disallowVizContextEdit: true,
            disallowVizEmbedding: true,
            disallowLayoutChanges: true,
            inRelatedLinkView: true,
            readOnlyFilters: true,
            viewState: PinboardViewState.RELATED_LINK_STATE,
        });
    }
}

