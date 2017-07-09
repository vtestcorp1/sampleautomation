/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating chart details.
 */

import _ from 'lodash';
import {BlinkRange} from 'src/base/base-types/base-types';
import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire, Provide} from 'src/base/decorators';
import {VisualizationColumnModel} from 'src/modules/callosum/model/visualization-column';
import {VisualizationModel} from 'src/modules/viz-layout/viz/visualization-model';
import {QueryData} from '../../../callosum/model/query-data';
import {ChartAxisConfig} from './chart-axis-config';
import {
    getBackendConfiguration,
    setBackendConfiguration
} from './chart-axis-config-mapping-service';
import * as chartDataProcessor from './chart-data-processor-service';
import {ChartQueryDefinition} from './chart-query-definition';
import {GeoFilterObject} from './geomap/base/geo-filter-objects';

let bestChartAxisConfigService = ngRequire('bestChartAxisConfigService');
let chartPersistedStore = ngRequire('chartPersistedStore');
let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let chartUtilService = ngRequire('chartUtilService');
let currencyUtil = ngRequire('currencyUtil');
let dateUtil = ngRequire('dateUtil');
let defaultChartConfigService = ngRequire('defaultChartConfigService');
let jsonConstants = ngRequire('jsonConstants');
let Logger : any = ngRequire('Logger');
let util = ngRequire('util');
let sessionService = ngRequire('sessionService');

declare let flags: any;

@Provide('ChartModel')
export class ChartModel extends VisualizationModel {
    private static EFFECTIVE_ID_DEFINITION_SCHEMA_CHANGE_VERSION = '3.4';

    public getLabelForNumericColumn = ChartModel.getLabelForNumericColumn;
    public chartType;
    public distinctYAxisColumnNames;
    public chart: any;

    protected _logger: any = Logger.create('chart-model');
    protected _columnEffectiveIdToColumn;

    private _allColumnsMap : {[id: string] : VisualizationColumnModel};
    private _hasNoData;
    private _hasError;
    private _unsupportedDataError;
    private _computedMetaInformation;
    private _bestAxisColumnConfigForChartType;
    private _xAxisColumns;
    private _yAxisColumns;
    private _legendColumns;
    private _radialColumn;
    private _columnsInChartDataNotOnAnyAxis;
    private _contextOptions;
    private _dataModel;
    private _queryDefinitions;
    private _dataArray;

    private allowChartTypeChangeOnDataLoad: boolean;

    public static getLabelForNumericColumn(value, column, allColumnValuesOnAxis,
                                           formattingOverrides) {
        var isDouble = column.isDoubleColumn(),
            nDecimal,
            noShorten = false;
        if (isDouble) {
            if (allColumnValuesOnAxis && allColumnValuesOnAxis.length > 1) {
                // here we don't use the precision of column but compute
                // it for the values Highcharts has decided to put on the labels.
                nDecimal = util.getMinDifferentiatingPrecision(
                    allColumnValuesOnAxis,
                    blinkConstants.decimalPrecision.MAX
                );

                if (column.isEffectivelyPercent()) {
                    nDecimal = Math.max(0, nDecimal - 2);
                }
            } else {
                nDecimal = blinkConstants.decimalPrecision.MIN;
            }
            noShorten = nDecimal > 0;
        }
        return column.getDataFormatter()(value, Object.assign({
            noShorten: noShorten,
            isDouble: isDouble,
            nDecimal: nDecimal
        }, formattingOverrides));
    }

    /**
     * Maps the highcharts axis tickPosition.info metadata to blink date formatting.
     * @param unitName {string} name of the unit by which ticks are spaced
     * @param count {Number} number of __unitName__s axis ticks are spaced by
     * @returns {string}
     */
    private static getDateFormatForAxisTickUnitName(unitName, count, totalAxisTickCount, options) {
        var format;
        if (unitName === 'millisecond') {
            format = 'MM/dd/yyyy HH:mm:ss.SS';
        }
        if (unitName === 'second') {
            format = 'MM/dd/yy HH:mm:ss';
        }
        if (unitName === 'minute') {
            format = 'MM/dd/yy HH:mm';
        }
        if (unitName === 'hour') {
            format = 'MM/dd/yy HH';
        }
        if (unitName === 'day') {
            format = 'MM/dd/yy';
        }
        if (unitName === 'week') {
            format = 'MM/dd/yyyy';
        }
        if (unitName === 'month') {
            if (count >= 3) {
                format = 'qqq, yy';
            } else {
                format = 'MMM yy';
            }
        }
        if (unitName === 'year') {
            format = 'yyyy';
        }

        format = format || 'MM/dd/yy';

        if (totalAxisTickCount > 1 && options && options.omitYear) {
            format = format.replace(/y/gi, '');
        }

        return _.trim(format, '/');
    }

    private static areComparableRanges(min1, max1, min2, max2) {
        var mid1 = (min1 + max1)/ 2,
            mid2 = (min2 + max2) / 2,
            range1 = Math.abs(max1 - min1),
            range2 = Math.abs(max2 - min2);

        // Note(sunny): this is a rather arbitrary measure of "comparable" ranges.
        // will need improvement
        return Math.abs(mid1 - mid2) <= Math.min(range1, range2) * 2;
    }

    private static isPrimarySortOnXAxisColumns(xAxisColumns, yAxisColumns, ascendingOnly) {
        var maxXAxisColSortIndex = Number.NEGATIVE_INFINITY;
        for (var i=0; i<xAxisColumns.length; i++) {
            var xAxisColumn = xAxisColumns[i];

            if (!xAxisColumn.isSorted()) {
                // all x-axis columns must be sorted
                return false;
            }
            if (!!ascendingOnly && !xAxisColumn.isAscendingSort()) {
                return false;
            }
            maxXAxisColSortIndex = Math.max(maxXAxisColSortIndex, xAxisColumn.getSortIndex());
        }

        // none of the y-axis columns should be sorted with a sort index
        // lower than any x-axis column
        return yAxisColumns.none(function(yAxisColumn){
            return yAxisColumn.isSorted() && yAxisColumn.getSortIndex() < maxXAxisColSortIndex;
        });
    }

    constructor(public params: any) {
        super(params);
        this.allowChartTypeChangeOnDataLoad = false;
        this._allColumnsMap = {};
        let allColumns = params.allColumns || [];
        allColumns.forEach((column)  => {
            if (!!column) {
                this._allColumnsMap[column.getGuid()] = column;
            }
        });
        this._init();
        let data = params.vizData;
        if (!!data) {
            this.updateData(data);
        }

        if (this.getSchemaVersion() < ChartModel.EFFECTIVE_ID_DEFINITION_SCHEMA_CHANGE_VERSION) {
            if (this.getYAxisColumns().length > 1) {
                this.clearVisibleSeriesIds();
            }
        }
    }

    public getQueryDefinitions() : Array<ChartQueryDefinition> {
        return this._queryDefinitions;
    }

    public setQueryDefinitions(queryDefinitions : Array<ChartQueryDefinition>) {
        this._queryDefinitions = queryDefinitions;
    }

    public getChartType () {
        return this.chartType;
    }

    public getValidChartTypes() {
        return Object.keys(this._bestAxisColumnConfigForChartType);
    }

    public setChartType (chartType) {
        var axisConfig = {
            xAxisColumns: this.getXAxisColumns(),
            yAxisColumns: this.getYAxisColumns(),
            legendColumns: this.getLegendColumns(),
            radialColumn: this.getRadialColumn()
        };
        var isChartTypeSupportedOnCurrentConfig = chartTypeSpecificationService
            .validateAxisConfig(chartType, axisConfig);

        if (this.isConfigurationLocked() && isChartTypeSupportedOnCurrentConfig) {
            this.chartType = chartType;
            this.getJson().chartType = chartType;
            chartPersistedStore.persistChartTypeAndAxisConfig(this);
            // SCAL-8917 : There are changes made to the series object like chart type etc
            // which causes issues in the case where a legend is hidden and re displayed.
            if (!this.hasNoData()) {
                this._dataModel = chartDataProcessor.getDataModel(this);
            }
            this._unsupportedDataError = chartTypeSpecificationService
                .getChartDataValidationError(this);
            return false;
        } else if (!!this._bestAxisColumnConfigForChartType[chartType]) {
            this.setIsConfigurationLocked(false);
            var bestAxisConfig = this._bestAxisColumnConfigForChartType[chartType];
            this.setIsYAxisShared(false);
            this.chartType = chartType;
            this.getJson().chartType = chartType;

            var newChartAxisConfig = new ChartAxisConfig(
                bestAxisConfig.xAxisColumns,
                bestAxisConfig.yAxisColumns,
                bestAxisConfig.legendColumns,
                bestAxisConfig.radialColumn
            );

            this.updateAxisConfig(newChartAxisConfig);

            setBackendConfiguration(
                this,
                newChartAxisConfig
            );

            this.clearData();
            this.getContainingAnswerModel().getCurrentAnswerSheet().clearDataForViz(this.getId());
            chartPersistedStore.persistChartTypeAndAxisConfig(this);
            this._unsupportedDataError = chartTypeSpecificationService
                .getChartDataValidationError(this);
            return true;
        } else if (isChartTypeSupportedOnCurrentConfig) {
            // In case where the user views the attribute by attribute, there are cases chart types
            // that dont suggest any best config as they are not suited to show that chart based on
            // metadata.
            // But the user here has capability to still select the chart in cases where they are
            // certain the data does not have issues like more than 1 y-value for x.
            // eg Query : "username age".
            this.chartType = chartType;
            this.getJson().chartType = chartType;
            chartPersistedStore.persistChartTypeAndAxisConfig(this);
            // SCAL-8917 : There are changes made to the series object like chart type etc
            // which causes issues in the case where a legend is hidden and re displayed.
            if (!this.hasNoData()) {
                this._dataModel = chartDataProcessor.getDataModel(this);
            }
            this._unsupportedDataError = chartTypeSpecificationService
                .getChartDataValidationError(this);
        } else {
            this._logger
                .error('tried to set chart type that is not possible with the current answer');
        }
    }

    public updateAxisConfigAndSetBackendConfig(chartAxisConfig) {
        this.updateAxisConfig(chartAxisConfig);
        setBackendConfiguration(this, chartAxisConfig);
        chartPersistedStore.persistChartTypeAndAxisConfig(this);
    }

    public defaultConfigExistsForAnswer () {
        return !!this.chartType;
    }

    public hasNoData () {
        return this._hasNoData;
    }

    public getEffectiveIdToColumnMap () {
        return this._columnEffectiveIdToColumn;
    }

    public getDataArray () : QueryData[] {
        return this._dataArray;
    }

    public updateData (newVizData) {
        super.updateData.call(this, (newVizData && newVizData[0]) || null);

        this._hasNoData = false;
        if (!newVizData || !Array.isArray(newVizData)) {
            this._hasNoData = true;
            return;
        }

        newVizData.forEach((dataset) => {
            if (!dataset.data) {
                this._hasError = true;
                this._hasNoData = true;
            }
            if (dataset.data && !dataset.data.length) {
                this._hasNoData = true;
            }
        });

        if (this._hasError || this._hasNoData) {
            return;
        }

        this._dataArray = newVizData.map((dataJson) => {
            return new QueryData(dataJson);
        });

        // TODO(Jasmeet): Try to get rid of reparsing in case of data update.
        this.parseDefinition(this);
        chartPersistedStore.persistChartTypeAndAxisConfig(this);

        this._dataModel = chartDataProcessor.getDataModel(this);

        // Metadata for data should be computed after data is processed.
        this._computedMetaInformation = chartDataProcessor.computeMetaDataInformation(this);
        this._bestAxisColumnConfigForChartType = bestChartAxisConfigService
            .computeChartTypesToBestAxisConfigMap(this);

        let unsupportedDataError = chartTypeSpecificationService.getChartDataValidationError(this);
        if (!this.allowChartTypeChangeOnDataLoad) {
            this._unsupportedDataError = unsupportedDataError;
        } else if (!!unsupportedDataError) {
            var candidateChartType = this.getChartTypeWithNoDataErrors();
            if (!!candidateChartType) {
                this.chartType = candidateChartType;
                this.getJson().chartType = candidateChartType;
            } else {
                this._unsupportedDataError = unsupportedDataError;
            }
        } else {
            this._unsupportedDataError = unsupportedDataError;
        }

        this._determineYAxisSharing();
    }

    public getComparableMeasureColumns () {
        var measureColumns = this.getMeasureColumns();
        if (measureColumns.length <= 1) {
            return null;
        }
        var self = this,
            allPairs = util.getAllCombinationsOfSize(measureColumns, 2);
        return allPairs.find(function(pair){
                var col1 = pair[0],
                    col2 = pair[1];
                return self._measureColumnsHaveComparableRange(col1, col2);
            }) || null;
    }

    public isXAxisMeasure () {
        return this._xAxisColumns.length === 1 && (this._xAxisColumns[0].isEffectivelyNumeric());
    }

    public isYAxisMeasure () {
        return this._yAxisColumns.all(function(column){
            return column.isEffectivelyNumeric();
        });
    }

    public isYAxisDateOrTime () {
        return this._yAxisColumns.all(function(column) {
            return column.isDateColumn() || column.isTimeColumn();
        });
    }

    public _isXAxisDate () {
        return this._xAxisColumns.length === 1 && this._xAxisColumns[0].isDateColumn();
    }

    public getLegendCardinality () {
        var configOptions = chartTypeSpecificationService.configOptions(this.getChartType());
        var displayYValuesWithLegendSeries = configOptions.displayYValuesWithLegendSeries;
        var yAxisColumns = this.getYAxisColumns();
        if (yAxisColumns.length > 1) {
            if (displayYValuesWithLegendSeries) {
                var legendSeriesCount = !!this._dataModel.uniqueLegendValues
                    ? this._dataModel.uniqueLegendValues.length
                    : 0;
                return legendSeriesCount + yAxisColumns.length - 1;
            } else {
                return yAxisColumns.length;
            }
        }
        return !!this._dataModel.uniqueLegendValues ?
            this._dataModel.uniqueLegendValues.length
            : 0;
    }

    public getXAxisCardinality () {
        return this._dataModel.xValueToRawValues ?
            this._dataModel.xValueToRawValues.length
            : 0;
    }

    public hasError () {
        return this._hasError;
    }

    public getUnsupportedDataError () {
        return this._unsupportedDataError;
    }

    public doesNotSupportData () {
        return !!this._unsupportedDataError;
    }

    /**
     * Returns true if there is any possible combination of the columns across the axes
     * which supports the chart type
     * __type__
     * @param type {chartTypeSpecificationService.chartTypes}
     * @returns {*|boolean}
     */
    public isChartTypeSupported (type) {
        var axisConfig = {
            xAxisColumns: this.getXAxisColumns(),
            yAxisColumns: this.getYAxisColumns(),
            legendColumns: this.getLegendColumns(),
            radialColumn: this.getRadialColumn()
        };

        // In case where the user views the attribute by attribute, there are cases chart types
        // that dont suggest any best config as they are not suited to show that chart based on
        // metadata.
        // But the user here has capability to still select the chart in cases where they are
        // certain the data does not have issues like more than 1 y-value for x.
        // eg Query : "username age".
        return _.has(this._bestAxisColumnConfigForChartType, type)
            || chartTypeSpecificationService.validateAxisConfig(type, axisConfig);
    }

    public yAxisColumnHasSorting () {
        return this.getYAxisColumns().some(function(column){
            return column.isUserSorted();
        });
    }

    public getYAxisColumn (distinctNameIdentifier) {
        return this._yAxisColumns[this.distinctYAxisColumnNames.indexOf(distinctNameIdentifier)];
    }

    public getYAxisColumnById (outputGuid: string) : VisualizationColumnModel {
        return this._yAxisColumns.find((column) => {
            return column.getSageOutputColumnId() === outputGuid;
        });
    }

    // NOTE: The semantics of this function are:
    // Whether the column matching the guid would be grouped on legend columns or not.
    public isYColumnGroupedByLegendColumns(columnId: string) : boolean {
        let yAxisColumns = this.getYAxisColumns();
        return yAxisColumns.length > 0 ? yAxisColumns[0].getId() === columnId : true;
    }

    public getColumns () {
        return _.values(this._allColumnsMap);
    }

    public getColumn (columnGuid) {
        return this._allColumnsMap[columnGuid];
    }

    public getVizColumns () {
        let allColumns = this.getColumns();
        if (!!allColumns.length) {
            return allColumns;
        }

        return this.getVisualizedColumns() || [];
    }

    public getVisualizedColumns () {
        var allIncludedColumns = [this._xAxisColumns,
            this._yAxisColumns,
            this._legendColumns,
            this._columnsInChartDataNotOnAnyAxis].flatten();

        if (this._radialColumn) {
            allIncludedColumns.push(this._radialColumn);
        }
        return allIncludedColumns;
    }

    public getChartedMeasureColumns () {
        return this.getVisualizedColumns().filter(function(column) {
            return column.isEffectivelyNumeric();
        });
    }

    public getChartedAttributeColumns () {
        return this.getVisualizedColumns().filter(function(column) {
            return column.isEffectivelyNonNumeric();
        });
    }

    public getXAxisColumns () : VisualizationColumnModel[] {
        return this._xAxisColumns;
    }

    public getYAxisColumns () : VisualizationColumnModel[] {
        return this._yAxisColumns;
    }

    public getLegendColumns () : VisualizationColumnModel[] {
        return this._legendColumns;
    }

    public getRadialColumn () : VisualizationColumnModel {
        return this._radialColumn;
    }

    public getAxisConfig() : ChartAxisConfig {
        return new ChartAxisConfig(
            this._xAxisColumns,
            this._yAxisColumns,
            this._legendColumns,
            this._radialColumn
        );
    }

    public getCategoryColumnNotOnAxis () {
        // In the current model there is a possibility that there is not column
        // put on category in backend config.
        // In that case any unused attribute will be put into category,
        // this is a minimum requirement.
        // When the data comes back from the backend at that point the config
        // should reflect the state where there is a column in chart data
        // which is not on any axis config.
        // This is currently consumed to add tooltip information
        // Eg: Scatter plot with measures on x and y.
        return this._columnsInChartDataNotOnAnyAxis[0];
    }
    public getMeasureColumn (idx) {
        var measureColumns = this.getMeasureColumns();
        if (idx < 0 || idx >= measureColumns.length) {
            return null;
        }
        return measureColumns[idx];
    }
    public getMeasureColumns () {
        return this.getColumns().filter(function (column) {
            return column.isEffectivelyNumeric() && !column.isGroupingColumn();
        });
    }
    public getTimeSeriesColumns () {
        return this.getColumns().filter(function (column) {
            return column.isDateColumn() && column.isAscendingSort();
        });
    }
    public getAttributeColumns () {
        return this.getColumns().filter(function (column) {
            return column.isEffectivelyNonNumeric() || column.isGroupingColumn();
        });
    }

    public isColAttribute(column) {
        return column.isEffectivelyNonNumeric() || column.isGroupingColumn();
    }

    public getSortedAttributeColumns () {
        function compareAttributeCardinality (a, b, indexA, indexB) {
            if (!_.isNumber(a) || !_.isNumber(b)) {
                this._logger.error('Cardinality for column not defined');
            }
            if (a < 0 && b >= 0) {
                return 1;
            }
            if (b < 0 && a >= 0) {
                return -1;
            }
            if (a < 0 && b < 0 || a === b) {
                return indexA - indexB;
            }
            return a - b;
        }
        var timeSeriesColumns = this.getTimeSeriesColumns();
        var attributeColumns = this.getAttributeColumns().subtract(timeSeriesColumns);
        var cardinalityData = this.getCardinalityData();

        var effectiveIdToOriginalIndex = util.mapArrayToHash(
            attributeColumns,
            function(column){
                return column.getSageOutputColumnId();
            }, function(column, index){
                return index;
            });

        var sortedAttributeColumns = attributeColumns.sort(function(col1, col2){
            var colId1 = col1.getSageOutputColumnId(),
                colId2 = col2.getSageOutputColumnId(),
                colCardinality1 =  cardinalityData[colId1],
                colCardinality2 =  cardinalityData[colId2],
                index1 = effectiveIdToOriginalIndex[colId1],
                index2 = effectiveIdToOriginalIndex[colId2];

            return compareAttributeCardinality(colCardinality1, colCardinality2, index1, index2);
        });

        return sortedAttributeColumns;
    }

    public getCardinalityData () {
        return this._computedMetaInformation.colCardinality;
    }

    public getSeries () {
        // NOTE: It is possible that the data model is not yet defined.
        return (this._dataModel && this._dataModel.series) || [];
    }

    public getGeoObjects(): GeoFilterObject[] {
        var geoObjects = [];
        var filterModels = this.getContainingAnswerModel()
                                .getCurrentAnswerSheet()
                                .getFilterVisualizations();
        for (let i = 0; i < filterModels.length; i++) {
            if (filterModels[i].isSupportedByGeoMaps()) {
               geoObjects.push.apply(geoObjects, filterModels[i].getGeoObjects());
            }
        }
        return geoObjects;
    }

    public getDataModel () {
        return this._dataModel;
    }

    /**
     * Updates the names of all the series visible in chart-ui.
     * The list is persisted if the parent answer is saved.
     * @param seriesNames {Array}
     */
    public setVisibleSeriesIds (seriesNames) {
        this.setUserData('visibleSeriesNames', seriesNames);
    }

    /**
     * Clears the persistable list of visible series names
     */
    public clearVisibleSeriesIds () {
        this.clearUserData('visibleSeriesNames');
    }

    /**
     * Returns the list of all the series visible in the chart-ui as previously set.
     * In case of saved answer this might be something that was set in another session.
     * null is returned if no previously set list of names was found
     * (e.g. when a fresh answer is being loaded)
     * @returns {Array}
     */
    public getVisibleSeriesIds () {
        return this.getUserData('visibleSeriesNames');
    }

    /**
     * Returns custom set colors on the series in a chart. this Tist is persisted.
     * @returns {Object}
     */
    public getSeriesColors () : {[seriesId: string]: string} {
        return this.getUserData('seriesColors') || {};
    }

    /**
     * Sets the color for a seriesId
     * @param seriesId
     * @param color
     */
    public setSeriesColor (seriesId, color) {
        var seriesColors = this.getSeriesColors();
        seriesColors[seriesId] = color;
        this.setUserData('seriesColors', seriesColors);
    }

    public getMultiColorSeriesColors()
    : {[seriesId: string]: {[xAxisColumnHash: string]: string[]}} {
        return this.getUserData('multiColorSeriesColors') || {};
    }

    public setMultiColorSeriesColors(
        seriesId: string,
        xAxisColumnHash: string,
        colors: string[]
    ) {
        let multiColorSeriesColors = this.getMultiColorSeriesColors();
        if (!multiColorSeriesColors[seriesId]) {
            multiColorSeriesColors[seriesId] = {};
        }
        multiColorSeriesColors[seriesId][xAxisColumnHash] = colors;
        this.setUserData('multiColorSeriesColors', multiColorSeriesColors);
    }

    /**
     * Clears the persistable list of series colors
     */
    public clearSeriesColors () {
        this.clearUserData('seriesColors');
    }

    /**
     * sets whether the y-axes of the chart (if more than one) are to share their scale
     * @param yAxisShared {boolean}
     */
    public setIsYAxisShared (yAxisShared) {
        this.setUserData('yAxisShared', yAxisShared);

        var multiYAxis = this.getYAxisColumns().length > 1;
        if (multiYAxis) {
            this.getSeries().each(function(series, index){
                series.yAxis = yAxisShared ? 0 : index;
            });
        }
    }

    /**
     * Returns whether the y-axes of the chart (if more than one) are to share their scale
     * @returns {boolean}
     */
    public isYAxisShared () {
        return this.getUserData('yAxisShared');
    }

    /**
     * Toggles the y-axis sharing state of the chart
     */
    public toggleIsYAxisShared () {
        this.setIsYAxisShared(!this.isYAxisShared());
    }

    /**
     * Gets the number of YAxis for the chart
     */
    public getNumberOfYAxes () {
        return (this.isYAxisShared()) ? 1 : this.getYAxisColumns().length;
    }

    /**
     * Sets highcharts axes extremes/zoom state
     * @param xAxisExtremes {Array} each item of array is a map with keys [min, max]
     * @param yAxisExtremes {Array} each item of array is a map with keys [min, max]
     */
    public setAxisExtremes (xAxisExtremes, yAxisExtremes) {
        this.setUserData('axisExtremes', {
            x: xAxisExtremes,
            y: yAxisExtremes
        });
    }

    public clearAxisExtremes () {
        this.clearUserData('axisExtremes');
    }

    public _getAxisExtremes (axis) {
        var extremes = this.getUserData('axisExtremes');
        if (!extremes) {
            return null;
        }
        return extremes[axis];
    }

    /**
     * Returns the saved x-axes (note plural) extremes/zoom state
     * @returns {Array}
     */
    public getXAxisExtremes () {
        return this._getAxisExtremes('x');
    }

    /**
     * Returns the saved y-axes (note plural) extremes/zoom state
     * @returns {*}
     */
    public getYAxisExtremes () {
        return this._getAxisExtremes('y');
    }

    public setYAxisRange(range: BlinkRange) {
        this.setUserData('yAxisRange', range);
    }

    public getYAxisRange() : BlinkRange {
        return this.getUserData('yAxisRange');
    }

    public hasUserDefinedYAxisRange() : boolean {
        let yAxisRange = this.getYAxisRange() || new BlinkRange(null, null);
        return _.isNumber(yAxisRange.min) || _.isNumber(yAxisRange.max);
    }

    /**
     * Setter/Getter for Chart Zoomed boolean.
     * @param isZoomed
     * @returns {null}
     */
    public isZoomedIn (isZoomed?: boolean) : boolean {
        if(arguments.length > 0) {
            this.setUserData('isZoomed', !!isZoomed);
            return isZoomed;
        } else {
            return this.getUserData('isZoomed') || null;
        }
    }


    public isDataLabelsEnabled () {
        return !!this.getUserData('dataLabels');
    }

    public isDataLabelsEnabledSetByUser () {
        return !_.isUndefined(this.getUserData('dataLabels'));
    }

    public isDataLabelsVisibilityUserSet () {
        return this.hasUserData('dataLabels');
    }

    public setDataLabelsEnabled (enabled) {
        this.setUserData('dataLabels', !!enabled);
    }

    public columnsMakeTimeSeries (xAxisColumns, yAxisColumns, includingDescending) {
        return xAxisColumns.length === 1 && xAxisColumns[0].isDateColumn()
            && (includingDescending || xAxisColumns[0].isAscendingSort())
            && ChartModel.isPrimarySortOnXAxisColumns(
                xAxisColumns, yAxisColumns, !includingDescending);
    }

    /**
     * Returns true, if the chart has date column as x-axis.
     *
     * @return {boolean}
     */
    public isTimeSeries(includingDescending) {
        return this.columnsMakeTimeSeries(
            this._xAxisColumns, this._yAxisColumns, includingDescending);
    }

    public isXAxisOrdinalBased () {
        var chartType = this.getChartType();

        if (chartTypeSpecificationService.useOrdinalXAxis(chartType)) {
            return true;
        }

        var useMeasureAsOrdinal =
            chartTypeSpecificationService.useMeasureOnXAxisAsOrdinal(chartType);

        return !((this.isXAxisMeasure() && !useMeasureAsOrdinal) || this.isTimeSeries(false));
    }

    public isYAxisOrdinalBased () {
        return !this.isYAxisMeasure() && !this.isYAxisDateOrTime();
    }

    /**
     * Returns true if the chart data is primarily sorted on the x-axis column.
     *
     * @return {boolean}
     */
    public isPrimarySortOnXAxisColumns (ascendingOnly) {
        return ChartModel.isPrimarySortOnXAxisColumns(
            this._xAxisColumns, this._yAxisColumns, !!ascendingOnly);
    }

    /**
     * Returns a list of values of all x-axis columns for a given index x.
     * Note that unlike legends we can't map between formatted composite value
     * and raw data because the formatted composite value can change over time
     * (even without chart reload), e.g., in a time series granularity decreased
     * with the decrease in the width available to the chart.
     * @param x {Number} the index in unique x values' list
     * @returns {Array}
     */
    public getRawXAxisValues (x) {
        if (!this.isXAxisOrdinalBased()) {
            return [x];
        }

        var rawValues = this._dataModel.xValueToRawValues[x];
        if (!rawValues) {
            this._logger.warn('no raw values found for formatted x-axis value', x);
        }
        return rawValues.map(function(valueObjects){
            return valueObjects.value;
        });
    }

    /**
     *  Returns a value for a given index y, and a given column from the y-axis underlying coluns
     *  Currently the mapping of y values is different from the mapping of x values, which
     *  brings a different implementation for this method
     *
     * @param y {Number} the index or value of the unique y values list
     * @param column {ColumnModel} column of the y axis
     * @returns value - Single value for the given axis and column
     */
    public getRawYAxisValueForColumn (y, column) {
        // Note that there is no sense in returning the two values of the differents columns
        // of the y axis. These values are not grouped, like in x axis, you just have
        // 2 different y axises. This explains the added column parameter, which is
        // needed to discriminate between the different columns of the y-axis

        // if column is numeric, we already have the good value
        if (column.isEffectivelyNumeric()) {
            return y;
        }
        // if column is not numeric, we must fetch the value
        var rawValue = this._dataModel.yValueToRawValues[column.getDataRowIndex()][y].value;
        if (!rawValue) {
            this._logger.warn('no raw values found for formatted y-axis value', y);
        }
        return rawValue;
    }

    public getRawLegendValues (compositeLegendValue) {
        var rawValues = this._dataModel.compositeLegendValueToRawValues[compositeLegendValue];
        if (!rawValues) {
            this._logger.warn('no raw values found for formatted legend value',
                compositeLegendValue);
        }
        return rawValues;
    }

    public getLegendColumnValues () {
        return this._dataModel.uniqueLegendValues || [];
    }

    public columnHasInfinityValues (column) {
        return this._dataModel.columnHasInfinityValues[column.getDataRowIndex()];
    }
    public columnHasMinusInfinityValues (column) {
        return this._dataModel.columnHasMinusInfinityValues[column.getDataRowIndex()];
    }

    public getContextOptions () {
        return this._contextOptions || {};
    }

    public setContextOptions (newOptions) {
        if(!this._contextOptions) {
            this._contextOptions = {};
        }
        $.extend(true, this._contextOptions, newOptions);
    }

    public _getXAxisValuesAt (x) {
        return this._dataModel.xValueToRawValues[x];
    }

    public _getYAxisValuesAt (colIdx, y) {
        return this._dataModel.yValueToRawValues[colIdx][y];
    }

    public _hasXAxisValuesAt (x) {
        return this._dataModel.xValueToRawValues.hasOwnProperty(x);
    }

    // TODO (Ashish): Move this label naming/handling logic to its own service.
    public getXAxisLabelAt (x, allXValuesOnLabels, options) {
        var firstXAxisColumn = this.getXAxisColumns()[0];
        var primarySortOnXAxis = this.isPrimarySortOnXAxisColumns(true);
        var useMeasureAsOrdinal =
            chartTypeSpecificationService.useMeasureOnXAxisAsOrdinal(this.getChartType());

        if (this.isXAxisMeasure()) {
            // for measure x-axis we pass on real x-values to highcharts
            // iff the column is sorted, we use index-in-array approach otherwise.
            // we want to, however, format the real value as number in both the cases
            if (!useMeasureAsOrdinal) {
                return ChartModel.getLabelForNumericColumn(
                    x, firstXAxisColumn, allXValuesOnLabels, void 0);
            } else {
                // highcharts can send an index value that is 1 more than
                // the number of values we have.
                // Note(sunny): this check is redundant after the fix for SCAL-4695
                if (!this._hasXAxisValuesAt(x)) {
                    return '';
                }

                // mapping all labels on the x-axis for each label makes this
                // a quadratic cost call but it is okay because the number of labels
                // on the x-axis is never too high.
                var self = this,
                    realXValues = allXValuesOnLabels && allXValuesOnLabels.map(function(index){
                            if (!self._hasXAxisValuesAt(index)) {
                                return null;
                            }
                            return self._getXAxisValuesAt(index)[0].value;
                        }).compact();

                return ChartModel.getLabelForNumericColumn(
                    this._getXAxisValuesAt(x)[0].value,
                    firstXAxisColumn,
                    realXValues,
                    void 0
                );
            }
        }

        // on zooming in too much highcharts can try to generate intermediate points
        // for everything but ascending timeseries we are going to look up this value
        // in our array of raw values and don't allow generated intermediate values
        if(!_.isInteger(x) && !this.isTimeSeries(false)) {
            return '';
        }

        // highcharts doesn't like x-axis in descending order so we can't use raw timestamp values
        // for timeseries (so we use index-in-data-array approach).
        // However we still want to use formatting for descending timeseries
        // so we handle that case specially in the same code branch
        if (this.isTimeSeries(true)) {
            // NOTE(vibhor): If the data is not primarily sorted on the date column,
            // then we can't really show a bucketed timeseries axis.
            // This is because 2 labels such as "Q2 1992" and "Q1 1993" gives an impression
            // that the data point between the 2 labels fit in that timeframe.
            // However, if the data is sorted on some other key, then this is not necessarily true.
            var timestampValue,
                format,
                isAscendingTimeSeries = this.isTimeSeries(false),
                isXAxisOrdinalBased = this.isXAxisOrdinalBased();

            if (isAscendingTimeSeries && !isXAxisOrdinalBased) {
                timestampValue = x;
            } else {
                if (!this._hasXAxisValuesAt(x)) {
                    return '';
                }
                timestampValue = this._getXAxisValuesAt(x)[0].value;
            }

            // Bucket computation only needed for data primarily sorted on date column.
            if (primarySortOnXAxis) {
                // NOTE(vibhor): The reason this daily bucket format is different from
                // the default format above is because these dates are ordered and
                // they should all be within the same year if they are within a given window.

                // NOTE(sunny): We could avoid re-calculating tickIntervalInMillis
                // each time we need to format but since we know that highcharts limits
                // the ticks (and hence label values) to a small number we can expect
                // the amount of recalculations to be small independent of the size of the dataset.
                if (!allXValuesOnLabels || allXValuesOnLabels.length === 0
                    || !allXValuesOnLabels.info) {
                    // we don't have enough points to deduce the current bucket size on x-axis.
                    // but we know that the granularity is upper capped by the aggregations
                    // on the column. the column data formatter respects the
                    // query induced aggregation so we directly invoke it
                    return firstXAxisColumn.getDataFormatter()(timestampValue, options);
                }

                format = ChartModel.getDateFormatForAxisTickUnitName(
                    allXValuesOnLabels.info.unitName,
                    allXValuesOnLabels.info.count,
                    allXValuesOnLabels.length,
                    options
                );
            }
            format = format || firstXAxisColumn.getFormatPattern();
            return dateUtil.formatDate(timestampValue, format);
        }

        // TODO(vibhor): This function should look for any overlapping labels
        // and use a different format if possible.
        // Today, we simply use formattingConstants.MAX_LABEL_LENGTH to truncate.
        // The biggest date format should be under that limit.
        var xValues = this._getXAxisValuesAt(x);
        if (_.isUndefined(xValues)) {
            this._logger.everyN(Logger.logLevel.WARN, 10, 'invalid x-axis value', x);
            return '';
        }

        return chartUtilService.formatCompositeColumnValue(this, xValues);
    }

    public getYAxisLabelForAttribute (column, y) {
        if(column.isDateColumn() || column.isTimeColumn()) {
            return dateUtil.formatDate(y, column.getFormatPattern());
        }
        var yValue = this._getYAxisValuesAt(column.getDataRowIndex(), y);
        // We need this check as sometimes highcharts calls formatter with value: -1
        if(!yValue) {
            return;
        }
        if(!yValue.value) {
            return (yValue.value === 0) ? 0 : '{Null}';
        }
        return yValue.value;
    }

    /**
     * @param {Object} params
     * @param {VisualizationColumnModel} params.yAxisColumn
     * @param {number} params.y  the y value to return formatted label for
     * @param {Array.<number>=} params.allYValuesOnLabels all y values that will be shown
     * on the y-axis.
     * When this array is provided extra shortening is done on the label if it can be
     * determined (using allYValuesOnLabels) that the shortening won't cause information loss.
     * @param {Object=} params.formattingOverrides overrides to be passed to numericFormatter.
     * @returns {*}
     */
    public getYAxisLabel (params) {
        var yAxisColumn = params.yAxisColumn,
            y = params.y,
            allYValuesOnLabels = params.allYValuesOnLabels || [],
            formattingOverrides = params.formattingOverrides || {};
        // for charts where some of the values are very large the smaller values
        // will appear too close to 0 if all the values are positive these
        // small y values will be too close to the x-axis.
        // highcharts fixes this by stretching the y-axis into negative values,
        // effectively adding empty space below y=0
        // While we want to keep this feature we don't want to show ticks
        // with negative values on the y-axis (SCAL-1429)
        if (y < 0 && this.getMinYValue(yAxisColumn) >= 0) {
            return '';
        }
        return ChartModel.getLabelForNumericColumn(
            y, yAxisColumn, allYValuesOnLabels, formattingOverrides);
    }

    public getMaxXValue (xAxisColumn) {
        if (!this.isXAxisMeasure() && !this._isXAxisDate()) {
            this._logger.error('max/min of x axis is supported only when x-axis is a measure/date');
            return Number.POSITIVE_INFINITY;
        }
        return this._dataModel.maxColumnValues[xAxisColumn.getDataRowIndex()];
    }

    public getMinXValue (xAxisColumn) {
        if (!this.isXAxisMeasure() && !this._isXAxisDate()) {
            this._logger.error('max/min of x axis is supported only when x-axis is a measure/date');
            return Number.NEGATIVE_INFINITY;
        }
        return this._dataModel.minColumnValues[xAxisColumn.getDataRowIndex()];
    }

    public getMaxYValue (yAxisColumn) {
        var dataRowIndex = yAxisColumn.getDataRowIndex();
        if (!!this._dataModel.maxColumnValues && dataRowIndex >= 0) {
            var maxValue = this._dataModel.maxColumnValues[yAxisColumn.getDataRowIndex()];
            return isNaN(maxValue) ? Number.POSITIVE_INFINITY : maxValue;
        }
        return Number.POSITIVE_INFINITY;
    }

    public getMinYValue (yAxisColumn) {
        var dataRowIndex = yAxisColumn.getDataRowIndex();
        if (!!this._dataModel.minColumnValues && dataRowIndex >= 0) {
            var minValue = this._dataModel.minColumnValues[yAxisColumn.getDataRowIndex()];
            return isNaN(minValue) ? Number.NEGATIVE_INFINITY : minValue;
        }
        return Number.NEGATIVE_INFINITY;
    }

    public getMaxRadialValue () {
        return this._dataModel.maxRadialValue;
    }

    public getMinRadialValue () {
        return this._dataModel.minRadialValue;
    }

    public equals (that) {
        if (this === that) {
            return true;
        }

        // Hack(sunny): Models with Json marked as dirty are not equal to any other model
        // This is used to refresh the model/chart locally (e.g. in case of axes change)
        var thisJson = this.getJson();
        if (thisJson._backendConfigChanged) {
            delete thisJson._backendConfigChanged;
            return false;
        }

        var thatJson = that.getJson();
        if (thatJson._backendConfigChanged) {
            delete thatJson._backendConfigChanged;
            return false;
        }

        if (!VisualizationModel.areModelsEqual(this, that)) {
            return false;
        }

        return true;
    }

    public downloadedChartContainsLegend() {
        var configOptions = chartTypeSpecificationService.configOptions(this.chartType, this);

        if (this._legendColumns.length || this._yAxisColumns.length > 1) {
            if (!configOptions.legendDisabled) {
                return true;
            }
        }

        return !!configOptions.containsNativeLegend;
    }

    public shouldNotShowLegend () {
        var configOptions = chartTypeSpecificationService.configOptions(this.chartType, this);
        return !!configOptions.doNotShowLegend;
    }

    public getBatchSize(): number {
        let chartSpecificBatchSize;
        if (chartTypeSpecificationService.isGeoChartType(this.chartType)) {
            chartSpecificBatchSize = sessionService.getGeoDataBatchSize();
        } else {
            chartSpecificBatchSize =
                chartTypeSpecificationService.configOptions(this.chartType, this).batchSize;
        }
        return flags.getValue('dataBatchSize') || chartSpecificBatchSize || super.getBatchSize();
    }

    public isDataSetComplete() {
        return this.getDefaultQueryData().length === this.getTotalRowCount()
            && this.getSamplingRatio() === 1;
    }

    public isYAxisStackedAsPercent () {
        return !!this.getUserData(jsonConstants.IS_STACKED_AS_PERCENT);
    }

    public toggleShowYAxisAsPercent () {
        if (this.isYAxisStackedAsPercent()) {
            this.clearUserData(jsonConstants.IS_STACKED_AS_PERCENT);
        } else {
            this.setUserData(jsonConstants.IS_STACKED_AS_PERCENT, true);
        }
    }

    public isHeatmapOverlayed() {
        return !!this.getUserData(jsonConstants.IS_HEATMAP_OVERLAYED);
    }

    public setIsHeatmapOverlayed(isOverlayed = false) {
        this.setUserData(jsonConstants.IS_HEATMAP_OVERLAYED, isOverlayed);
    }

    public get pivotState() {
        return this.getUserData(jsonConstants.PIVOT_STATE);
    }

    public set pivotState(state) {
        this.setUserData(jsonConstants.PIVOT_STATE, state);
    }

    public getDefaultQueryData () {
        let dataArray = this.getDataArray();
        let defaultQueryData = dataArray && dataArray[0];
        return defaultQueryData && defaultQueryData.getData();
    }

    public getAutoTitle () {
        let yAxisColumns = this.getYAxisColumns();
        let xAxisColumns = this.getXAxisColumns();
        let legendColumns = this.getLegendColumns();
        let radialColumn = this.getRadialColumn();
        var title = yAxisColumns.map((column) => { return column.getName();}).join(', ');
        if (radialColumn) {
            title += ' ';
            title += blinkConstants.AND;
            title += ' ';
            title += radialColumn.getName();
        }
        title += ' ';
        title += blinkConstants.BY;
        title += ' ';
        title += xAxisColumns.map((column) => {return column.getName();}).join(', ');
        if (legendColumns && legendColumns.length) {
            title += ' ';
            title += blinkConstants.AND;
            title += ' ';
            title += legendColumns.map((column) => {return column.getName();}).join(', ');
        }

        return title;
    }

    //region Chart Configuration
    // This section contains function related to changes to chart type and axis config.
    public getCurrentAxisConfig() {
        return {
            xAxisColumns: this.getXAxisColumns(),
            yAxisColumns: this.getYAxisColumns(),
            legendColumns: this.getLegendColumns(),
            radialColumn: this.getRadialColumn()
        };
    }

    public setAllowChartTypeChangeOnDataLoad(allowChartTypeChangeOnDataLoad) {
        this.allowChartTypeChangeOnDataLoad = allowChartTypeChangeOnDataLoad;
    }

    public getYSEOPConfig() : any {
        let yseopConfig = {
            extensionVersion: '2',
            charts: []
        };

        let chartConfig = chartTypeSpecificationService.getYSEOPConfig(this);
        yseopConfig.charts.push(chartConfig);
        return yseopConfig;
    }

    public getXAxisColumnsHash() : string {
        return this.getXAxisColumns()
            .map((col) => {
                return col.getGuid();
            })
            .join(',');
    }
    private getChartTypeWithNoDataErrors() {
        var axisConfig = this.getCurrentAxisConfig();
        var self = this;
        var previousChartType = this.getChartType();
        //TODO(Jasmeet):
        // 1. More elaborated check for type ?
        // 2. Capability to initialize New datamodel from raw data without incurring a
        // network call.
        let chartType = chartTypeSpecificationService.chartTypesInDisplayOrder.find(
            function(chartType){
                let isConfigValid = chartTypeSpecificationService.validateAxisConfig(
                    chartType,
                    axisConfig
                );
                if (!isConfigValid) {
                    return false;
                }
                let dataError = chartTypeSpecificationService.getChartDataValidationError(
                    self,
                    chartType
                );

                let isNewProviderCompatible = chartTypeSpecificationService.areProvidersEqual(
                    previousChartType,
                    chartType);

                return !dataError && isNewProviderCompatible;
            }
        );

        return chartType;
    }
    //endregion

    private parseDefinition (chartModel: ChartModel) {
        var handleBackwardCompatibility = function() {
            var estimatedCardinality = chartModel._xAxisColumns[0].getUniqueCount();
            if (estimatedCardinality > -1 && estimatedCardinality < 12) {
                chartModel.chartType = chartTypeSpecificationService.chartTypes.COLUMN;
            } else {
                chartModel.chartType = chartTypeSpecificationService.chartTypes.LINE;
            }
            var axisConfig = new ChartAxisConfig(
                chartModel._xAxisColumns,
                chartModel._yAxisColumns,
                chartModel._legendColumns,
                chartModel._radialColumn
            );

            setBackendConfiguration(chartModel,axisConfig);
        };
        // cleanup existing configs.
        chartModel._xAxisColumns = [];
        chartModel._yAxisColumns = [];
        chartModel._legendColumns = [];
        chartModel._radialColumn = null;
        // This is possible in the cases like scatter plot with measures
        // on x and y and the attribute is plotted, but this is not exposed in the axis config.
        chartModel._columnsInChartDataNotOnAnyAxis = [];
        var chartJson = chartModel.getJson();

        if (!!chartJson.chartType) {
            chartModel.chartType = chartJson.chartType;
        }

        var allColumns = chartModel.getColumns();
        var backendConfigInfo = getBackendConfiguration(chartModel);

        if (backendConfigInfo === false) {
            chartModel._hasError = true;
            return;
        }

        chartModel._xAxisColumns = backendConfigInfo.xAxisColumns;
        chartModel._yAxisColumns = backendConfigInfo.yAxisColumns;
        chartModel._legendColumns = backendConfigInfo.legendColumns;
        chartModel._radialColumn = backendConfigInfo.radialColumn;
        chartModel._columnsInChartDataNotOnAnyAxis =
            backendConfigInfo.columnsInChartDataNotOnAnyAxis;
        chartModel._columnEffectiveIdToColumn = backendConfigInfo.allColumns
            .reduce((idToColumnMap, column) => {
                idToColumnMap[column.getSageOutputColumnId()] = column;
                return idToColumnMap;
            }, {});
        _.extend(chartModel._allColumnsMap, chartModel._columnEffectiveIdToColumn);
        chartModel._queryDefinitions = backendConfigInfo.queryDefinitions;

        // Update all columns provided by answer with the latest definitions.
        allColumns.forEach((potentialMatchingColumn, index) => {
            var matchingColumn = backendConfigInfo.allColumns.find(function(column) {
                return potentialMatchingColumn.getSageOutputColumnId() ===
                    column.getSageOutputColumnId();
            });
            if (!!matchingColumn) {
                allColumns[index] = matchingColumn;
            }
        });

        // NOTE:
        // - This is added to support cases if there is any backend which does not
        // have axis config client state.
        // - This works as this is set before data is fetched due to liposuction.
        // - If we need to support this for even without liposuction we need to come
        // up with new code which computes axis config using all
        // the provided columns given chart type.
        // - We also check that this is only done when chart type is set because
        // this is only needed in case of saved answer.
        if (!!backendConfigInfo.shouldUpdateBackendConfig && !!chartModel.chartType) {
            this._logger.warn('Backend Config found with no axis config info,' +
                ' hence defaulting to basic chart');
            handleBackwardCompatibility();
        }
    }

    private _init () {
        this._hasError = false;
        this._unsupportedDataError = null;
        this.chartType = null;
        // axis config columns
        this._xAxisColumns = [];
        this._yAxisColumns = [];
        this._legendColumns = [];
        this._radialColumn = null;
        // This is possible in the cases like scatter plot with measures on x and y and
        // the attribute is plotted, but this is not exposed in the axis config.
        this._columnsInChartDataNotOnAnyAxis = [];

        this._computedMetaInformation = {};

        this._hasNoData = !this._vizData.data || this._vizData.data.length === 0;

        this.parseDefinition(this);

        this._computedMetaInformation = chartDataProcessor.computeMetaDataInformation(this);

        if (this._computedMetaInformation === false) {
            this._hasError = true;
            return;
        }

        // If server doesnt report any chart type then compute defaults.
        if (!this.chartType) {
            var axisConfigAndChartType = defaultChartConfigService.getDefaultAxisConfigAndChartType(
                this
            );

            // also set this in definition
            if (!!axisConfigAndChartType.chartType) {
                this.chartType = axisConfigAndChartType.chartType;
                this.getJson().chartType = axisConfigAndChartType.chartType;
                this.allowChartTypeChangeOnDataLoad = true;

                var newChartAxisConfig = new ChartAxisConfig(
                    axisConfigAndChartType.axisConfig.xAxisColumns,
                    axisConfigAndChartType.axisConfig.yAxisColumns,
                    axisConfigAndChartType.axisConfig.legendColumns,
                    axisConfigAndChartType.axisConfig.radialColumn
                );

                this.updateAxisConfig(newChartAxisConfig);
                this.clearVisibleSeriesIds();

                // If blink needs to set the axis config then the data from the previous fetch
                // need not be valid anymore so it is cleared to keep state consistent.
                this._columnsInChartDataNotOnAnyAxis = [];
                this._vizData.data = [];
                this._hasNoData = true;

                setBackendConfiguration(
                    this,
                    axisConfigAndChartType.axisConfig
                );
            }
        }

        this._bestAxisColumnConfigForChartType =
            bestChartAxisConfigService.computeChartTypesToBestAxisConfigMap(this);

        // this._xAxisColumns.length is checked for the cases where server sends data
        // and client decides the chart is not needed and doesnt set the axis config and chart type.
        if (!this.hasNoData() && this._xAxisColumns.length) {
            this._dataModel = chartDataProcessor.getDataModel(this);
            this._determineYAxisSharing();
            this._unsupportedDataError =
                chartTypeSpecificationService.getChartDataValidationError(this);
        }

        chartPersistedStore.persistChartTypeAndAxisConfig(this);
    }

    private updateAxisConfig(chartAxisConfig) {
        if (!util.areArraysSameSet(chartAxisConfig.legendColumns, this.getLegendColumns())) {
            this.clearVisibleSeriesIds();
        }

        var yAxisColumns = this.getYAxisColumns();
        var hasMultiYAxisLegend = !!yAxisColumns ? yAxisColumns.length > 1 : false;
        if (hasMultiYAxisLegend
            && !util.areArraysSameSet(chartAxisConfig.yAxisColumns, this.getYAxisColumns())) {
            this.clearVisibleSeriesIds();
        }

        this._xAxisColumns = chartAxisConfig.xAxisColumns;
        this._yAxisColumns = chartAxisConfig.yAxisColumns;
        this._legendColumns = chartAxisConfig.legendColumns;
        this._radialColumn = chartAxisConfig.radialColumn;
    }

    private _measureColumnsHaveComparableRange (col1, col2) {
        // This is populated after data is processed
        // so any call before that returns false by default.
        if (!this._computedMetaInformation || !this._computedMetaInformation.columnIdToMax) {
            return false;
        }
        var colId1 = col1.getSageOutputColumnId(),
            colId2 = col2.getSageOutputColumnId(),
            max1 = this._computedMetaInformation.columnIdToMax[colId1],
            min1 = this._computedMetaInformation.columnIdToMin[colId1],
            max2 = this._computedMetaInformation.columnIdToMax[colId2],
            min2 = this._computedMetaInformation.columnIdToMin[colId2];
        return ChartModel.areComparableRanges(min1, max1, min2, max2);
    }

    private _determineYAxisSharing () {
        // if the value is already set, don't change it
        if (!_.isUndefined(this.isYAxisShared())) {
            return;
        }
        var yAxisColumns = this.getYAxisColumns();
        if (yAxisColumns.length <= 1) {
            return;
        }

        // Must have same currency setting in order to share y-axis.
        if (!currencyUtil.haveIdenticalCurrencyTypeInfo(yAxisColumns)) {
            return;
        }

        // if all columns are growth columns always link y-axes by default
        var allGrowthColumns = yAxisColumns.every(function(column){
            return column.isGrowth();
        });
        if (allGrowthColumns) {
            this.setIsYAxisShared(true);
            return;
        }

        // if all columns are unitless and have comparable ranges link y-axes by default
        // Note (sunny): currently we assume that dimensionless <=> aggr of count
        var allUnitlessColumns = yAxisColumns.every(function(column){
            var aggrType = column.getEffectiveAggregateType();
            return aggrType === util.aggregateTypes.TOTAL_COUNT
                || aggrType === util.aggregateTypes.UNIQUE_COUNT;
        });
        if (!allUnitlessColumns) {
            return;
        }

        for (var i=0; i<yAxisColumns.length - 1; i++) {
            var column = yAxisColumns[i],
                nextColumn = yAxisColumns[i + 1];
            if (!this._measureColumnsHaveComparableRange(column, nextColumn)) {
                return;
            }
        }

        this.setIsYAxisShared(true);
    }
}
