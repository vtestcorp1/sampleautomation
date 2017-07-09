/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides a service that maps callosum chart axis config to
 * UI axis config and vice versa.
 */


'use strict';

import _ from 'lodash';
import {ngRequire, Provide} from 'src/base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import {ChartAxisConfig} from './chart-axis-config';
import {ChartModel} from './chart-model';
import {getQueriesDefinitions,
    getUniqueIdForVizCol, setQueriesDefinition} from './chart-type-specification-service';

let chartBackwardCompatibilityService = ngRequire('chartBackwardCompatibilityService'),
    chartUtilService = ngRequire('chartUtilService'),
    Logger = ngRequire('Logger');
let logger;

Provide('chartAxisConfigMappingService')({
    setBackendConfiguration,
    getBackendConfiguration
});

export function setBackendConfiguration (
    chartModel: ChartModel,
    axisConfig: ChartAxisConfig
) : void {
    if (!logger) {
        logger = Logger.create('chart-axis-config-mapping-service');
    }
    // clear axis state on all columns
    let allColumns: Array<VisualizationColumnModel> = chartModel.getColumns();
    allColumns.each((column) =>
        chartUtilService.setChartAxisInClientState(column, chartUtilService.ChartAxis.NONE));
    axisConfig.xAxisColumns.each((column) =>
        chartUtilService.setChartAxisInClientState(column, chartUtilService.ChartAxis.X));
    axisConfig.yAxisColumns.each((column) =>
        chartUtilService.setChartAxisInClientState(column, chartUtilService.ChartAxis.Y));
    axisConfig.legendColumns.each((column) =>
        chartUtilService.setChartAxisInClientState(column, chartUtilService.ChartAxis.Z));

    if (axisConfig.radialColumn) {
        chartUtilService.setChartAxisInClientState(
            axisConfig.radialColumn,
            chartUtilService.ChartAxis.R
        );
    }
    // define base query
    setQueriesDefinition(axisConfig, chartModel);
}

export function getBackendConfiguration (chartModel) {
    if (!logger) {
        logger = Logger.create('chart-axis-config-mapping-service');
    }

    let chartJson = chartModel.getJson(),
        configurations = {
        [chartUtilService.ChartAxis.X]: {},
        [chartUtilService.ChartAxis.Y]: {},
        [chartUtilService.ChartAxis.Z]: {},
        [chartUtilService.ChartAxis.R]: null,
        columnsInChartDataNotOnAnyAxis: {},
        allColumns: {}
    }, queryDefinitions = getQueriesDefinitions(chartModel,
        chartJson.chartConfigurations ? chartJson.chartConfigurations : []);

    queryDefinitions.forEach((queryDefn) => {
        queryDefn.getColumnsInDataOrder().forEach((column) => {
            const uniqueIdForVizCol = getUniqueIdForVizCol(column);
            configurations.allColumns[uniqueIdForVizCol] = column;
            let axisClientState = chartUtilService.getChartAxisFromClientState(column);
            switch (axisClientState) {
                case chartUtilService.ChartAxis.X:
                case chartUtilService.ChartAxis.Y:
                case chartUtilService.ChartAxis.Z:
                    configurations[axisClientState][uniqueIdForVizCol] = column;
                    break;
                case chartUtilService.ChartAxis.R:// that would be nice if we can have an array
                    configurations['r'] = column; // TS complain otherwise
                    break;
                // NOTE: This condition here allows default to go to hidden to
                // support backward compatibility.
                default:
                    configurations.columnsInChartDataNotOnAnyAxis[uniqueIdForVizCol] = column;
                    break;
            }
        });
    });

    let backendConfigurations: any = {
        allColumns: _.values(configurations.allColumns),
        xAxisColumns: _.values(configurations[chartUtilService.ChartAxis.X]),
        yAxisColumns: _.values(configurations[chartUtilService.ChartAxis.Y]),
        legendColumns: _.values(configurations[chartUtilService.ChartAxis.Z]),
        radialColumn: configurations['r'],
        columnsInChartDataNotOnAnyAxis: _.values(configurations.columnsInChartDataNotOnAnyAxis),
        queryDefinitions
    };

    let hasNoXandYColumns = backendConfigurations.xAxisColumns.length === 0 &&
            backendConfigurations.yAxisColumns.length === 0;

// This is a fail safe logic in cases where the axis config is not available on server.
// We also check chartType here as whenever chart type is set in model the axis
// configuration should be set. Otherwise in case of adhoc answer we dont want to set
// the x and y with fail safe logic.
    if (hasNoXandYColumns && !!chartModel.chartType
    ) {
        logger.warn('No Columns found for X and Y axis from client state axis config');
        backendConfigurations.chartModel = chartModel;
        return chartBackwardCompatibilityService
            .backwardCompatibleConfig
            .bind(backendConfigurations)();
    }
    return backendConfigurations;
}
