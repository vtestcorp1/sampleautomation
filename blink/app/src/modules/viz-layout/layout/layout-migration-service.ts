/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview: This module is responsible for migrating older layout tiles
 *                from old pinboard definitions to the new pinboard layouting.
 */

import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire, Provide} from 'src/base/decorators';
import {VisualizationModel} from '../viz/visualization-model';
import {TileLayout} from './layout-service';


var jsonConstants = ngRequire('jsonConstants');
// Constant screen width for Legacy pinboards
var GRID_WIDTH = 136;

var sizeThresholds = {
    small: 1024,
    large: 2048
};

export {
    migrateLayoutTiles
};

Provide('layoutMigrationService')({
    migrateLayoutTiles
});

function migrateLayoutTiles(layoutTiles : { [id: string] :TileLayout},
                            vizModels : {[id: string] : VisualizationModel}) {
    updateOrder(layoutTiles);
    updateSize(layoutTiles, vizModels);
}

function updateSize(layoutTiles : { [id: string] :TileLayout},
                    vizModels : {[id: string] : VisualizationModel}) {
    var layout = <TileLayout[]>_.values(layoutTiles);
    var scale = getScalingFactor(layout);
    layout.forEach(function (viz : TileLayout) {
        if(!!viz.size) {
            return;
        }
        var vizModel = vizModels[viz.id];
        var isHeadline =
            (vizModel.getVizType().toLowerCase() === jsonConstants.VIZ_TYPE_HEADLINE);
        if(isHeadline) {
            viz.size = blinkConstants.tileSizes.EXTRA_SMALL; // Single headline size.
            return;
        }

        var medium, small, large, mediumSmall, largeSmall;
        large = blinkConstants.tileSizes.LARGE;
        small = blinkConstants.tileSizes.SMALL;
        medium = blinkConstants.tileSizes.MEDIUM;
        mediumSmall = blinkConstants.tileSizes.MEDIUM_SMALL;
        largeSmall = blinkConstants.tileSizes.LARGE_SMALL;

        if(!viz.width || !viz.height) {
            viz.size = medium;
            return;
        }

        var size = viz.width * viz.height * scale;
        if(size < sizeThresholds.small) {
            viz.size = small;
        } else if( size > sizeThresholds.large) {
            viz.size = large;
        } else {
            viz.size = medium;
        }
    });
}


function updateOrder(layoutTiles : { [id: string] :TileLayout}) {
    var isAlreadyInNewLayout: boolean = _.values(layoutTiles).some((layout: TileLayout) => {
        return !_.isUndefined(layout.order);
    });
    if(isAlreadyInNewLayout) {
        return;
    }

    // If this is a user specified layout, we use the visual layout order scheme to show the slides.
    // The scheme is as follows:
    // 1. Break the slides into rows.
    // A row is identified with an anchor (the topmost available element)
    // and any tiles that overlap sufficiently with the anchor fall in the same row.
    // 2. Reorder each row tiles from left-> right.

    // First sort tiles from top->bottom.
    var tilesSortedOnY = _.values(layoutTiles).sort(function (t1: TileLayout, t2: TileLayout) {
        // Handling the case of y coord being 0 which is falsey. Legacy
        // Y-coord can never be negative. Similarly the order.
        var t1y = (t1.y === 0) ? -1 : t1.y;
        var t2y = (t2.y === 0) ? -1 : t2.y;
        // Tiles which do not have a 'y' are either newly added.
        // we put the tile at the end(new tile).
        var value1 = t1y || Number.POSITIVE_INFINITY;
        var value2 = t2y || Number.POSITIVE_INFINITY;
        var diff = value1 - value2;
        if (diff !== 0) {
            return diff;
        }

        return t1.x - t2.x;
    });

    // Then bucket tiles into rows.
    var rows = [];
    tilesSortedOnY.each(function (tile : TileLayout) {
        var currentRow = rows.last();
        // The first tile in sorted by Y always marks the first row.
        // However, if the current tile does not go in same row as the current row, then also start
        // a new row.
        if (!rows.length || !areInSameLayoutRow(currentRow.anchor, tile)) {
            rows.push({
                anchor: tile,
                tiles: [ tile ]
            });
            return;
        } else {
            currentRow.tiles.push(tile);
        }
    });

    // Reorder each row from left->right.
    var finalTileLayoutOrder = [];
    rows.each(function (row) {
        finalTileLayoutOrder = finalTileLayoutOrder
            .concat(row.tiles
                .sort(function (t1: TileLayout, t2: TileLayout) {
                    return t1.x - t2.x;
                })
            );
    });

    finalTileLayoutOrder.each(function (t, i) {
        t.order = i;
    });
}

function areInSameLayoutRow(t1, t2) {
    var anchor = t1, test = t2;
    if (t2.y < anchor.y) {
        anchor = t2;
        test = t1;
    }

    return test.y - anchor.y <= anchor.height / 2;
}

/**
 * This method is borrowed from the old layout-templates.js
 * @param layout
 * @returns {number}
 */
function getScalingFactor(layout: TileLayout[]) : number {
    var layoutLimits = getLayoutLimits(layout);
    var constants = blinkConstants.layout;

    var scale = GRID_WIDTH/Math.max(layoutLimits.x, constants.MIN_WIDTH);
    // guard against scaling down too much
    if (scale < 1) {
        var smallestWidth = layoutLimits.width;
        var smallestHeight = layoutLimits.height;
        if (smallestWidth * scale < constants.MIN_WIDTH) {
            scale = constants.MIN_WIDTH/smallestWidth;
        }
        if (smallestHeight * scale < constants.minHeight.DEFAULT) {
            scale = constants.minHeight.DEFAULT/smallestHeight;
        }
    }

    return scale;
}

function getLayoutLimits(layout: TileLayout[]) {
    var initLimits = {
        x: 0,
        width: Number.POSITIVE_INFINITY,
        height: Number.POSITIVE_INFINITY
    };

    return layout.reduce(function(limits, tile) {
        limits.x = (tile.x > limits.x) ? tile.x : limits.x;
        limits.width = (tile.width < limits.width) ? tile.width: limits.width;
        limits.height = (tile.height < limits.height) ? tile.height: limits.height;
        return limits;
    }, initLimits);
}
