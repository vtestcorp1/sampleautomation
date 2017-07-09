/**
 * Copyright Thoughtspot Inc. 2016
 * Author:  Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview: The Data model for the Pivot Table component.
 */

import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire, Provide} from 'src/base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import {ChartModel} from '../chart/chart-model';

let util = ngRequire('util');

export var areaToAxisMap = {
    column: 'legendColumns',
    row: 'xAxisColumns',
    data: 'yAxisColumns'
};

@Provide('PivotDataModel')
export class PivotDataModel {
    private _data;
    private _min: number = Number.POSITIVE_INFINITY;
    private _max: number = Number.NEGATIVE_INFINITY;
    private _count: number;
    private _rows : Array<any>;
    private _columns : Array<any>;
    private _measures: Array<any>;
    private _cardinalLimit : number = blinkConstants.pivotTable.CARDINALITY_LIMIT;
    private _columnIdToColumn : {[id: string] : VisualizationColumnModel}= {};
    private _dataRowIndexToColumn = {};

    private blinkAggTypesToPivotAggTypes = {
        [util.aggregateTypes.SUM] : 'sum',
        // For local aggregations, count is like sum.
        [util.aggregateTypes.TOTAL_COUNT] : 'sum',
        [util.aggregateTypes.UNIQUE_COUNT] : 'sum',
        [util.aggregateTypes.AVG] : 'avg',
        [util.aggregateTypes.MIN] : 'min',
        [util.aggregateTypes.MAX] : 'max'
    };

    constructor(private chartModel:ChartModel) {
        this._parseDefinitions(chartModel);
        this.processData(chartModel);
    }

    public getPivotDataSource() {
        return {
            fields: this.getFields(),
            store: this._data
        };
    }

    public hasMultipleMeasures() {
        return this._measures.length > 1;
    }

    public processData(chartModel : ChartModel) : void {
        let dataArray = chartModel.getDataArray();
        if(!dataArray || !dataArray[0]) {
            return;
        }

        let data = dataArray[0].getData();

        let cardinal = {};

        this._dataRowIndexToColumn = chartModel.getVisualizedColumns()
            .reduce((dataRowIndexToColumn, column) => {
                dataRowIndexToColumn[column.getDataRowIndex()] = column;
                return dataRowIndexToColumn;
            }, {});

        this._data = data.map((dataRow) => {
            return this._getDataRow(chartModel, dataRow, cardinal);
        });

        this._count = this._data.length;
    }

    private _parseDefinitions(chartModel) {

        var axisConfig = chartModel.getAxisConfig();
        this._rows = axisConfig[areaToAxisMap.row];
        this._columns = axisConfig[areaToAxisMap.column];
        this._measures = axisConfig[areaToAxisMap.data];

        this._columnIdToColumn = chartModel.getVizColumns().reduce((map, col) => {
            var name = col.getSageOutputColumnId();
            map[name] = col;
            return map;
        }, {});
    }

    private getFields() {
        let sortField;
        let summarySortOrder;
        let self = this;

        this._measures.forEach((measureCol) => {
            if(measureCol.isSorted()) {
                sortField = measureCol.getSageOutputColumnId(true);
                summarySortOrder = getSortOrder(measureCol);
            }
        });

        var columns = this._columns.map(col => {
            return {
                dataField: col.getSageOutputColumnId(),
                area: blinkConstants.pivotTable.Areas.COLUMN,
                isMeasure: col.isEffectivelyNumeric(),
                width: blinkConstants.pivotTable.COLUMN_WIDTH,
                caption: col.getSageOutputColumnId(),
                customizeText: dataFormatter.bind(null, col),
                sortBySummaryField: sortField,
                sortBy: 'value',
                sortingMethod: sortMethod,
                sortOrder: getSortOrder(col) || summarySortOrder
            };
        });

        var rows = this._rows.map(col => {
            return {
                dataField: col.getSageOutputColumnId(),
                area: blinkConstants.pivotTable.Areas.ROW,
                isMeasure: col.isEffectivelyNumeric(),
                width: blinkConstants.pivotTable.COLUMN_WIDTH,
                caption: col.getSageOutputColumnId(),
                customizeText: dataFormatter.bind(null, col),
                sortBySummaryField: sortField,
                sortBy: 'value',
                sortingMethod: sortMethod,
                sortOrder: getSortOrder(col) || summarySortOrder
            };
        });

        var measures = this._measures.map(col => {
            return {
                dataField: col.getSageOutputColumnId(),
                area: blinkConstants.pivotTable.Areas.DATA,
                isMeasure: col.isEffectivelyNumeric(),
                width: blinkConstants.pivotTable.COLUMN_WIDTH,
                caption: col.getSageOutputColumnId(),
                summaryType: self.getEffectiveAggrType(col),
                dataType: 'number',
                customizeText: dataFormatter.bind(null, col)
            };
        });

        return [].concat(columns).concat(rows).concat(measures);
    }

    private getEffectiveAggrType(col : VisualizationColumnModel) {
        let aggType = col.getTrueEffectiveAggregateType();
        return this.blinkAggTypesToPivotAggTypes[aggType];
    }

    private _getDataRow(chartModel: ChartModel, dataRow, cardinal) : Array<any> {
        return dataRow.reduce((row, data, idx) => {
            let column = this._dataRowIndexToColumn[idx];
            let colId = column.getSageOutputColumnId();
            let cSet = cardinal[colId] = cardinal[colId] || new Set();
            if (chartModel.isColAttribute(column)) {
                var specialFormat = util.getSpecialFormatData(data);
                data = (!!specialFormat)
                    ? specialFormat
                    : data + '';
                if (cSet.size < this._cardinalLimit) {
                    cSet.add(data);
                } else if(!cSet.has(data)) {
                    data = blinkConstants.OTHER_VALUE_PLACEHOLDER_LABEL;
                }
            } else {
                this.updateMinMax(data);
            }
            row[colId] = data;
            return row;
        }, {});
    }

    private updateMinMax(data) {
        this._min = (data < this._min) ? data : this._min;
        this._max = (data > this._max) ? data : this._max;
    }

    get min ():number {
        return this._min;
    }

    get max ():number {
        return this._max;
    }

    get count() : number {
        return this._count;
    }

    get data () {
        return this._data;
    }

    get rows () {
        return this._rows;
    }

    get columns () {
        return this._columns;
    }

    get columnIdToColumn () {
        return this._columnIdToColumn;
    }
}

/**
 * Comparator method which is used to sort an array containing
 * both strings and numbers. The numbers come before strings.
 * @param prev {Object}
 * @param next {Object}
 * @returns {number}
 */
function sortMethod(prev, next) {
    var a = prev.value;
    var b = next.value;

    a = (isNaN(a)) ? a : Number.parseFloat(a);
    b = (isNaN(b)) ? b : Number.parseFloat(b);

    if(_.isNumber(a) && _.isNumber(b)) {
        return a - b;
    }

    if(_.isString(a) && _.isString(b)) {
        return a.localeCompare(b);
    }

    if(_.isNumber(a)) {
        return -1;
    }

    return 1;
}

function dataFormatter(vizCol, params) {
    if(!_.isUndefined(params.value)) {
        var backendVal = vizCol.convertValueFromBackend(params.value);
        var formattedVal = vizCol.getDataFormatter()(backendVal, {
            noShorten: false,
            nDecimal: 2
        });
        return formattedVal + '';
    }
    return '';
}

function getSortOrder(vizCol: VisualizationColumnModel) {
    if(!vizCol.isSorted()) {
        return ;
    }

    return vizCol.isAscendingSort()
        ? blinkConstants.pivotTable.ascendingSort
        : blinkConstants.pivotTable.descendingSort;
}
