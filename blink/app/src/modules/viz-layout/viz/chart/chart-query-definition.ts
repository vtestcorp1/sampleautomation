/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class to represent a query representation of a chart.
 *
 * Blink communicates with callosum in the terminology of category, series and values.
 *
 * These columns are used to generate a query in callosum.
 */

'use strict';

import {ngRequire, Provide} from '../../../../base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';

let chartUtilService = ngRequire('chartUtilService');

@Provide('ChartQueryDefinition')
export class ChartQueryDefinition {
    public categories: Array<VisualizationColumnModel>;
    public series: Array<VisualizationColumnModel>;
    public values: Array<VisualizationColumnModel>;
    public columnsInDataOrder: Array<VisualizationColumnModel>;
    public xAxisColumns: Array<VisualizationColumnModel>;
    public yAxisColumns: Array<VisualizationColumnModel>;
    public legendColumns: Array<VisualizationColumnModel>;
    public radialColumn: VisualizationColumnModel;

    static getColumnsFromBucket(bucket) : Array<VisualizationColumnModel> {
        let columns: Array<VisualizationColumnModel> = [];
        if (!bucket || !bucket.columns || !bucket.columns.length) {
            return columns;
        }

        return bucket.columns.map((columnJson) => {
            if (!columnJson || !Object.keys(columnJson).length) {
                console.error('Column Json doesn\'t have any properties');
                return;
            }
            return new VisualizationColumnModel(columnJson, null, null);
        });
    }

    static generateQueryFromJson(categories, series, values) : ChartQueryDefinition {
        let categoryColumns: Array<VisualizationColumnModel> =
            this.getColumnsFromBucket(categories);
        let seriesColumn : Array<VisualizationColumnModel> = this.getColumnsFromBucket(series);
        let valueColumns : Array<VisualizationColumnModel> = this.getColumnsFromBucket(values);
        let queryDefinition = new ChartQueryDefinition(categoryColumns, seriesColumn, valueColumns);
        let hasError = queryDefinition.getColumnsInDataOrder().some((column) => !column);
        return hasError ? null : queryDefinition;
    }

    constructor (
        categories: Array<VisualizationColumnModel> = [],
        series: Array<VisualizationColumnModel> = [],
        values: Array<VisualizationColumnModel> = []
    ) {
        this.categories = categories;
        this.series = series;
        this.values = values;

        this.columnsInDataOrder = [];
        Array.prototype.push.apply(this.columnsInDataOrder, this.series);
        Array.prototype.push.apply(this.columnsInDataOrder, this.categories);
        Array.prototype.push.apply(this.columnsInDataOrder, this.values);

        this.xAxisColumns = [];
        this.yAxisColumns = [];
        this.legendColumns = [];

        this.columnsInDataOrder.forEach((column, index) => {
            column.setDataRowIndex(index);
            switch (chartUtilService.getChartAxisFromClientState(column)) {
                case chartUtilService.ChartAxis.X:
                    this.xAxisColumns.push(column);
                    break;
                case chartUtilService.ChartAxis.Y:
                    this.yAxisColumns.push(column);
                    break;
                case chartUtilService.ChartAxis.Z:
                    this.legendColumns.push(column);
                    break;
                case chartUtilService.ChartAxis.R:
                    this.radialColumn = column;
                    break;
                default:
                    break;
            }
        });
    }
    public getColumnsInDataOrder() : Array<VisualizationColumnModel> {
        return this.columnsInDataOrder;
    }
}
