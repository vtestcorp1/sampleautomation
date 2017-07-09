/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating headline visualization details.
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('suppress_NA_Headlines', 'If true, anytime there is a N/A headline it will be suppressed', false);

blink.app.factory('HeadlineModel', ['HeadlineColumnModel',
    'Logger',
    'strings',
    'util',
    'VisualizationModel',
    function (HeadlineColumnModel,
              Logger,
              strings,
              util,
              VisualizationModel) {

        var _logger = Logger.create('headline-model');


        var HeadlineModel = function (params) {
            HeadlineModel.__super.call(this, params);
            this._columns = this.getJson().columns.map(function(col){
                return col.column;
            });
            this._init();
        };

        util.inherits(HeadlineModel, VisualizationModel);

        HeadlineModel.prototype.createVizColumns = function () {
            var vizModel = this;
            var aggregates = this.getAggregates();

            return this.getColumns().map(function (c, idx) {
                var colData = vizModel.getColumnData(idx);
                return new HeadlineColumnModel(c, idx, colData, aggregates);
            });
        };

        HeadlineModel.prototype._init = function () {
            if (!this.getColumns() || !this.getColumns().length) {
            // TODO Change this to use _logger.error. As of now, _logger.error doesn't stop  execution
            // the way throw does, and also doesn't trigger the unit test .toThrow() expectation
                throw 'Column definition missing in headline viz';
            }

        // In headline, we ignore columns other than the first one.
            this._column = this.getVizColumns()[0];
            this._column.setData(this._vizData && this._vizData.data ? this._vizData.data.map('0'): []);

            if (this.getAggregateSize(0) > 0 && !this.hasNoData() &&
            (this._vizData.data.length != this.getAggregateSize(0))) {
            // TODO Change this to user _logger.error
                throw "Number of headline data values doesn't match number of aggregates";
            }
        };

        HeadlineModel.prototype.getVisualizedColumns = function() {
            return [this.getVizColumns()[0]];
        };

        HeadlineModel.prototype.updateData = function (vizData) {
            HeadlineModel.__super.prototype.updateData.call(this, vizData);
            this._init();
        };

        HeadlineModel.prototype.hasNoData = function () {
            if (!this._vizData || !this._vizData.data || !this._vizData.data.length) {
                return true;
            }

            return false;
        };

        HeadlineModel.prototype.hasError = function () {
        //headline model does not expect errors in the data
            return false;
        };

    /**
     * Returns the headline column
     *
     * @return {Object}
     */
        HeadlineModel.prototype.getColumn = function () {
            return this._column;
        };

        HeadlineModel.prototype.getColumns = function () {
            return this._columns;
        };

        HeadlineModel.prototype.getHeadlineTeslaTitle = function () {
            return this._column.getName(false);
        };

    /**
     * Returns the name of the column
     *
     * @return {string}
     */
        HeadlineModel.prototype.getColumnName = function () {
            return this._column.getName();
        };

    /**
     * Returns the unformatted aggregate value for a certain column and aggregate index
     *
     * @param {number}  dataValueIndex The index of the data value. For ranges, indexes are 0 and 1.
     * @return {string=}
     */
        HeadlineModel.prototype.getDataValueUnformatted = function (dataValueIndex) {
            if (!this.getColumns()) {
                return null;
            }
            var data = this._vizData.data;
            dataValueIndex = dataValueIndex || 0;
            if (data && data.length && data[dataValueIndex] && data[dataValueIndex].length) {
                return data[dataValueIndex][this._column.getDataRowIndex()];
            }

            return null;
        };

        HeadlineModel.prototype.shouldBeSuppressedInUI = function () {
        /* global flags */
            if (!flags.getValue('suppress_NA_Headlines')) {
                return false;
            }
            return this.isDataNodeEmpty();
        };

        HeadlineModel.prototype.isDataNodeEmpty = function () {
        // Callosum models headline such that multiple column aggregations can be sent into a single headline.
        // That is not the case currently however and so we always look at the first summary.
            var totalSummaries = this.getAggregateSize(0);
        // Furthermore, for the same column, callosum can send multiple summaries (one for each aggregation type).
            for (var i = 0; i < totalSummaries; ++i) {
                var value = this.getDataValueUnformatted(i);
                if (!angular.isDefined(value) || value === null) {
                    return true;
                }
            }
            return false;
        };

    /**
     * Returns the aggregate value for a certain column and aggregate index
     *
     * @param {number}  dataValueIndex The index of the data value. For ranges, indexes are 0 and 1.
     * @return {string}
     */
        HeadlineModel.prototype.getDataValueFormatted = function (dataValueIndex) {
            var dataValue = this._column.convertValueFromBackend(
            this.getDataValueUnformatted(dataValueIndex),
            this.getAggregateType(dataValueIndex));
            if (dataValue === null) {
                return null;
            }
        // we don't use the decimal precision of column for headline columns as it
        // does not make sense for 1 or 2 data points as in headline data
            return '' + this._column.getDataFormatter(this.getAggregateType(dataValueIndex))(dataValue);
        };

    /**
     *
     * @return {number}
     */
        HeadlineModel.prototype.getAggregateSize = function () {
            var vizJson = this.getJson();
            if (!vizJson.columns.length) {
                return 0;
            }

            if (vizJson.columns && vizJson.columns.length && vizJson.columns[0].aggrs) {
                return vizJson.columns[0].aggrs.length;
            }
            return 0;
        };

    /**
     * Get the type for an aggregate
     *
     * @param {number}  aggrIndex   The index of the aggregate. For ranges, indexes are 0 and 1.
     * @return {string}
     */
        HeadlineModel.prototype.getAggregateType = function (aggrIndex) {
            if (this.getAggregateSize() <= 0) {
                return null;
            }

            var vizJson = this.getJson();
            aggrIndex = aggrIndex || 0;
            if (vizJson.columns && vizJson.columns.length && vizJson.columns[0].aggrs && vizJson.columns[0].aggrs.length) {
                return vizJson.columns[0].aggrs[aggrIndex];
            }
        };

    /**
     * Set the type for an aggregate
     *
     * @param {number} aggrIndex   The index of the aggregate. For ranges, indexes are 0 and 1.
     * @param {string} aggrType
     */
        HeadlineModel.prototype.setAggregateType = function (aggrIndex, aggrType, expandIfNeeded) {
            if (this.getAggregateSize() <= aggrIndex || aggrIndex < 0) {
                if (!expandIfNeeded) {
                    _logger.error('Can not set aggregate type for out of bound index', aggrIndex);
                    return;
                }
                this.addAggregate(aggrType);
                return;
            }

            var vizJson = this.getJson();
            aggrIndex = aggrIndex || 0;
            if (vizJson.columns && vizJson.columns.length && vizJson.columns[0].aggrs && vizJson.columns[0].aggrs.length) {
                vizJson.columns[0].aggrs[aggrIndex] = aggrType;
            }
        };

    /**
     *
     * @return {Array}
     */
        HeadlineModel.prototype.getAggregates = function () {
            var vizJson = this.getJson();
            if (vizJson.columns && vizJson.columns.length && vizJson.columns[0].aggrs) {
                return vizJson.columns[0].aggrs;
            }

            return [];
        };

    /**
     *
     * Adds a new aggr line to headline definition.
     * @param {string} aggrType
     */
        HeadlineModel.prototype.addAggregate = function (aggrType) {
            var vizJson = this.getJson();
            if (vizJson.columns && vizJson.columns.length && vizJson.columns[0].aggrs) {
                vizJson.columns[0].aggrs.push(aggrType);
            }
        };

    /**
     * Removes aggregate at index idx.
     *
     * @param {number} idx The position of the aggregate to be removed from the list of aggregates.
     */
        HeadlineModel.prototype.removeAggregate = function (idx) {
            var vizJson = this.getJson();
            if (vizJson.columns && vizJson.columns.length && vizJson.columns[0].aggrs &&
            idx >= 0 && idx < vizJson.columns[0].aggrs.length) {
                vizJson.columns[0].aggrs.splice(idx, 1);
            }

            var data = this._vizData.data;
            if (data && data.length && idx >= 0 && idx < data.length) {
                return data.splice(idx, 1);
            }
        };

    /**
     * Get the label displayed in the UI for an aggregate
     *
     * @param {number}  aggrIndex   The index of the aggregate. For ranges, indexes are 0 and 1.
     * @return {string}
     */
        HeadlineModel.prototype.getAggregateLabel = function (aggrIndex) {
            var type = this.getAggregateType(aggrIndex);
            if (type === null) {
                return '';
            }
            return util.getAggregateLabel(type);
        };

    /**
     * Return true if this headline is a summary of a table viz. When there are only measures in the Sage bar,
     * no table viz is displayed. The headlines in this case are not summaries of table data, rather global
     * summaries.
     *
     * @return {boolean}
     */
        HeadlineModel.prototype.isTableSummary = function () {
            var vizJson = this.getJson();
            if (!vizJson.columns.length) {
                return false;
            }

            if (vizJson.columns && vizJson.columns.length) {
                return vizJson.columns[0].tableSummary;
            }
            return false;
        };

    /**
     * Returns true iff the headline should show a select box for summary aggregation
     * @returns {boolean}
     */
        HeadlineModel.prototype.shouldShowSummaryAggregates = function () {
            if (this.getColumn().isDateColumn() || this.getColumn().isTimeColumn()) {
                return false;
            }
            var vizJson = this.getJson();
            return !!vizJson.showSummaryAggrs;
        };

        HeadlineModel.prototype.getSupportedSummaryTypes = function () {
            return this._column.getSupportedAggregationTypes();
        };

        HeadlineModel.prototype.getTitle = function() {
            if (!this.isPinboardViz()) {
                var skipPrefix = !this.isTableSummary();
                return this.getColumn().getName(skipPrefix);
            } else {
                if (!this.isTitleUserDefined()) {
                    var column = this.getColumn(),
                        colNameWithAggregate = column.getName(false),
                        headlineAggregateLabel = util.aggregateTypeLabels[this.getAggregateType()],
                        headlineTitle = strings.dataViz.headline.AGGREGATED_HEADLINE_TITLE.assign(
                            headlineAggregateLabel,
                            colNameWithAggregate
                        );

                    var isRangeHeadline = this.getAggregates().some(function(aggr){
                        return aggr === util.aggregateTypes.RANGE;
                    });
                    if (isRangeHeadline) {
                        headlineTitle = colNameWithAggregate;
                    }

                    return headlineTitle.capitalize();

                } else {
                    return HeadlineModel.__super.prototype.getTitle.call(this);
                }
            }
        };

        return HeadlineModel;
    }]);
