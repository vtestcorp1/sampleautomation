/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import _ from 'lodash';


import {ngRequire} from '../../base/decorators';
import {ChartModel} from '../viz-layout/viz/chart/chart-model';
import {ChartLink, ChartNode, isChartLink}
    from '../viz-layout/viz/chart/networks/network-chart-data-model';
import {
    ContextMenuInputPointBase, ContextMenuInputValue,
    getVizContextMenuItems, sortContextMenuItems, VizContextMenuItem
} from './viz-context-menu-util';

let Logger = ngRequire('Logger');
let logger: any;

class ChartContextMenuInputPoint extends ContextMenuInputPointBase {
    public push(value: ContextMenuInputValue) {
        this.allValues.push(value);
        if (value.column.isAttribute()) {
            this.filteredValues.push(value);
        } else {
            this.unfilteredValues.push(value);
        }
    }
}

interface ChartContextMenuInput {
    clickedPoint: ChartContextMenuInputPoint;
    selectedPoints: Array<ChartContextMenuInputPoint>;
    menuItems: Array<VizContextMenuItem>;
}

function getContextMenuInputPoint(
    chartModel: ChartModel,
    chartPoint: any
): ChartContextMenuInputPoint {
    let contextMenuInputPoint = new ChartContextMenuInputPoint();
    logger = logger || Logger.create('chart-context-menu-util');

    // Add radial value
    let radialColumn = chartModel.getRadialColumn();
    if (radialColumn && chartPoint.z !== void 0) {
        let radialContextMenuValue = new ContextMenuInputValue(radialColumn, chartPoint.z);
        contextMenuInputPoint.push(radialContextMenuValue);
    }

    // Add y values
    let valueColumnId = !!chartPoint.series.userOptions
        ? chartPoint.series.userOptions.valueColumnIdentifier
        : chartPoint.series.valueColumnIdentifier;
    let yAxisColumn = chartModel.getYAxisColumnById(valueColumnId);
    let yAxisSelectedValue = chartModel.getRawYAxisValueForColumn(chartPoint.y, yAxisColumn);
    if (yAxisSelectedValue !== void 0) {
        let yContextMenuValue = new ContextMenuInputValue(yAxisColumn, yAxisSelectedValue);
        contextMenuInputPoint.push(yContextMenuValue);
    }

    // Add x values
    let xAxisColumns = chartModel.getXAxisColumns();
    let xAxisRawValues = chartModel.getRawXAxisValues(chartPoint.x);

    if (xAxisColumns.length !== xAxisRawValues.length) {
        logger.error('mismatch between the lengths of xAxis columns and xAxis raw values');
        return null;
    }
    xAxisColumns.forEach((xAxisColumn, index) => {
        let xAxisContextMenuInputValue =
            new ContextMenuInputValue(xAxisColumn, xAxisRawValues[index]);
        contextMenuInputPoint.push(xAxisContextMenuInputValue);
    });

    // Add legend values
    let isPointGroupedByLegend = chartModel.isYColumnGroupedByLegendColumns(
        yAxisColumn.getId()
    );

    if (isPointGroupedByLegend) {
        let legendColumns = chartModel.getLegendColumns();
        let blinkSeriesId = !!chartPoint.series.userOptions
            ? chartPoint.series.userOptions.blinkSeriesId
            : chartPoint.series.blinkSeriesId;
        let legendRawValues = chartModel.getRawLegendValues(blinkSeriesId) || [];

        if (legendColumns.length !== legendRawValues.length) {
            logger.error('mismatch between the lengths of legend columns and legend raw values');
            return null;
        }

        legendColumns.forEach((legendColumn, index) => {
            let contextMenuInputValue =
                new ContextMenuInputValue(legendColumn, legendRawValues[index]);
            contextMenuInputPoint.push(contextMenuInputValue);
        });
    }

    // Add category value
    // TODO(Jasmeet): SCAL-16896: Remove this when hidden category column is removed.
    // NOTE: if condition to check against xAxis column is inherited and is legacy. Not sure
    // why is this needed.
    let categoryColumn = chartModel.getCategoryColumnNotOnAxis();
    let categoryValue = chartPoint.categoryName;
    if (xAxisColumns.length >= 1
        && xAxisColumns[0] !== categoryColumn
        && categoryValue !== void 0) {
        let contextMenuInputValue = new ContextMenuInputValue(categoryColumn, categoryValue);
        contextMenuInputPoint.push(contextMenuInputValue);
    }

    return contextMenuInputPoint;
}

function getInputForChartContextMenu(
    chartModel: ChartModel,
    clickedPoint: any,
    selectedPoints: Array<any>,
    isChasmTrapQuery,
): ChartContextMenuInput {
    let clickContextMenuPoint = getContextMenuInputPoint(chartModel, clickedPoint);
    let selectedPointsContextMenuPoint = selectedPoints.map((point) => {
        return getContextMenuInputPoint(chartModel, point);
    });

    let menuItems = getVizContextMenuItems(
        chartModel,
        clickContextMenuPoint,
        selectedPointsContextMenuPoint,
        isChasmTrapQuery
    );
    return {
        clickedPoint: clickContextMenuPoint,
        selectedPoints: selectedPointsContextMenuPoint,
        menuItems: sortContextMenuItems(_.values(menuItems))
    };
}

function getContextMenuInputPointForNetwork(chartModel: ChartModel,
                                           networkElement: ChartLink | ChartNode) {
    let contextMenuInputPoint = new ChartContextMenuInputPoint();
    // TS will downcast node appropriately
    if (isChartLink(networkElement)) {
        let link: ChartLink = networkElement,
            measureColumn = chartModel.getYAxisColumns()[0],
            measureValue = link.value;
        contextMenuInputPoint.push(new ContextMenuInputValue(measureColumn, measureValue));
        [link.source, link.target]
            .forEach((node) =>
                contextMenuInputPoint.push(
                    getContextMenuInputValueFromNode(node, chartModel)
                ));
    } else {
        let xAxisContextMenuInputValue = getContextMenuInputValueFromNode(networkElement,
            chartModel);
        contextMenuInputPoint.push(xAxisContextMenuInputValue);
    }
    return contextMenuInputPoint;
}

function getContextMenuInputValueFromNode(node, chartModel) {
    return new ContextMenuInputValue(
        chartModel.getXAxisColumns()[node.baseColumnIndex],
        node.name);
}

function getInputForNetworkContextMenu(chartModel: ChartModel,
                                       node: ChartNode | ChartLink,
                                       isChasmTrapQuery: boolean = false) : ChartContextMenuInput {
    let clickContextMenuPoint = getContextMenuInputPointForNetwork(
        chartModel,
        node);
    let menuItems = getVizContextMenuItems(
        chartModel,
        clickContextMenuPoint,
        [],
        isChasmTrapQuery
    );

    //Note(chab) for now, we do not allow multiple points selections
    return {
        clickedPoint: clickContextMenuPoint,
        selectedPoints: [],
        menuItems: sortContextMenuItems(_.values(menuItems))
    };
}

export {
    ChartContextMenuInputPoint,
    ChartContextMenuInput,
    getInputForChartContextMenu,
    getInputForNetworkContextMenu
};
