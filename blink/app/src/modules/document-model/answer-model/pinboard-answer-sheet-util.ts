/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import _ from 'lodash';
import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire, Provide} from '../../../base/decorators';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {ChartModel} from '../../viz-layout/viz/chart/chart-model';
import {PinboardVizModel} from '../../viz-layout/viz/pinboard-viz-model';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';

let CorruptVizModel = ngRequire('CorruptVizModel');
let genericVizModelFactory = ngRequire('genericVizModelFactory');
let HeadlineModel = ngRequire('HeadlineModel');
let TableModel = ngRequire('TableModel');

Provide('pinboardAnswerSheetUtil')({
    getPinboardVisualizationModels,
    resolveReferencedGenericVisualization,
    getPinboardLayout
});

function getPinboardVisualizationModels(
    objectResolver,
    answerModel
) : {[key: string] : VisualizationModel} {
    if (!objectResolver) {
        return null;
    }

    let result = {};
    _.forIn(objectResolver, (resolvedVizContent, id) => {
        if (!resolvedVizContent) {
            result[id] = new CorruptVizModel({
                answerModel: answerModel
            });
            return;
        }

        switch (resolvedVizContent.vizContent
        && resolvedVizContent.vizContent.vizType.toLowerCase()) {
            case jsonConstants.VIZ_TYPE_HEADLINE:
                result[id] = new HeadlineModel({
                    vizJson: resolvedVizContent,
                    answerModel: answerModel
                });
                return;
            case jsonConstants.VIZ_TYPE_TABLE:
                result[id] = new TableModel({
                    vizJson: resolvedVizContent,
                    answerModel: answerModel
                });
                return;
            case jsonConstants.VIZ_TYPE_CHART:
                result[id] = new ChartModel({
                    vizJson: resolvedVizContent,
                    answerModel: answerModel
                });
                return;
            case jsonConstants.VIZ_TYPE_FILTER:
                result[id] = new VisualizationModel({
                    vizJson: resolvedVizContent,
                    answerModel: answerModel
                });
                return;
            default:
                return;
        }
    });

    return result;
}

function resolveReferencedGenericVisualization(
    subType,
    origJson,
    answerModel
) : VisualizationModel {
    return genericVizModelFactory.createGenericVizModel(subType, {
        vizJson: origJson,
        answerModel: answerModel
    });
}

/**
 * Checks whether a certain viz is in the layout array
 * @param {Object} layout   The layout array
 * @param {string} vizId    The id of the viz
 * @return {boolean | undefined}
 */
function vizIsInLayout(layout, vizId): boolean {
    if (!vizId) {
        return false;
    }
    let matchIndex = _.findIndex(layout, (tile: any) => {
        return tile[jsonConstants.ID_KEY] === vizId;
    });
    return matchIndex > -1;
}

function getPinboardLayout(
    originalLayout,
    visualizationMap: {[id: string]: PinboardVizModel},
    visualizationArray: PinboardVizModel[],
    flattenClusters: boolean,
    applyInsightsStyle: boolean
) {
    // Create layout tiles of vizs that dont have layout tiles.
    visualizationArray.forEach((viz: PinboardVizModel) => {
        let vizId = viz.getId();
        if (!vizIsInLayout(originalLayout, vizId)) {
            var layoutItem = {
                id: vizId
            };
            originalLayout.push(layoutItem);
        }
    });

    // Clean up the layout definition for stale definitions.
    // Filter the layout array to remove any viz that is not in the visualizations object
    var layout = originalLayout.filter(function (item) {
        let id = item[jsonConstants.ID_KEY];
        if (!id) {
            throw new Error('Invalid layout description in answersheet');
        }
        return visualizationMap.hasOwnProperty(id);
    });

    // Ids of pinboard vizs which are part on any cluster.
    let vizsInClusters = {};
    // Ids of pinboard vizs which refer to cluster viz.
    let clusterVizIds = {};
    _.forIn(visualizationMap, (viz: PinboardVizModel) => {
        let referencedViz = viz.getReferencedVisualization();
        if (referencedViz.getVizType() === jsonConstants.VIZ_TYPE_CLUSTER) {
            clusterVizIds[viz.getId()] = true;
            var refVizIds = referencedViz.getReferencedVizIds();
            refVizIds.forEach(function(id) {
                vizsInClusters[id] = true;
            });
        }
    });

    // Handle the flattening of clusters.
    if (flattenClusters) {
        layout = layout.filter(function (item) {
            return !clusterVizIds[item.id];
        });
    } else {
        // NOTE: We operate under the assumption that a viz will have only
        // one manifestation.
        // Eg 1: Viz part of a cluster will not show as a individual viz on
        // pinboard.
        // Eg 2: Same viz will not be part of multiple clusters.
        layout = layout.filter(function (item) {
            return !vizsInClusters[item.id];
        });
    }

    // TODO(Jasmeet): This logic needs to be moved to backend.
    // The intent here is to make first 2 unclustered tiles as large tiles
    // and also mark all clustered vizs as large tile. All remaining tiles
    // take the medium size by default.
    if (applyInsightsStyle) {
        let tileIndexWithSavedSize = _.findIndex(layout, (tile: any) => {
            return !!tile.size || !_.isNil(tile.order);
        });
        let hasUserAppliedStyle = tileIndexWithSavedSize > -1;
        if (!hasUserAppliedStyle) {
            let largeTileCount = 0;
            let MAX_LARGE_TILE = 2;
            layout.forEach((item, idx) => {
                let id = item[jsonConstants.ID_KEY];
                let increaseSize = false;
                if (clusterVizIds[id]) {
                    increaseSize = true;
                } else {
                    increaseSize = largeTileCount < MAX_LARGE_TILE;
                    if (increaseSize) {
                        largeTileCount++;
                    }
                }
                if (increaseSize) {
                    item.size = blinkConstants.tileSizes.LARGE;
                }
                item.order = idx;
            });
        }
    }

    return layout;
}

export {
    getPinboardVisualizationModels,
    resolveReferencedGenericVisualization,
    getPinboardLayout
};
