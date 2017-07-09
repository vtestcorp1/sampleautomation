/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating sage status summary.
 */

'use strict';

blink.app.factory('SearchSummaryVizModel', ['blinkConstants',
    'strings',
    'dateUtil',
    'GenericVizModel',
    'Logger',
    'util',
    function (blinkConstants,
          strings,
    dateUtil,
    GenericVizModel,
    Logger,
    util) {

        var logger = Logger.create('search-summary-model'),
            DUMMY_CONST = 'DUMMY';


        function SearchSummaryVizModel(params) {
            SearchSummaryVizModel.__super.call(this, params);
            this.status = '';
            this.lastBuildFinish = 0;
            this.failTime = 0;
            this.failReason = '';
        }
        util.inherits(SearchSummaryVizModel, GenericVizModel);

    // Data will be loaded when this function gets called.
        SearchSummaryVizModel.prototype.updateData = function (data) {
            angular.extend(this, data);
        // These metrics needs to be expose later. Dummy data first.
            this.failTime = 0;
            this.failReason = 'TEST';
        };

        SearchSummaryVizModel.prototype.getStatus = function() {
            return this.status;
        };

        SearchSummaryVizModel.prototype.getLastBuildFinishTime = function() {
            return dateUtil.formatDate(this.lastBuildFinish, strings.adminUI.DEFAULT_TIME_FORMAT);
        };

        SearchSummaryVizModel.prototype.getNumReadyTables = function() {
            return this.numReady;
        };

        SearchSummaryVizModel.prototype.getNumInProgressTables = function() {
            return this.numBuildingAndServing + this.numBuildingAndNotServing + this.numNewTables;
        };

        SearchSummaryVizModel.prototype.getNumBuildingAndServing = function() {
            return this.numBuildingAndServing;
        };

        SearchSummaryVizModel.prototype.getNumBuildingAndNotServing = function() {
            return this.numBuildingAndNotServing;
        };

        SearchSummaryVizModel.prototype.getNumTokens = function() {
            return this.numberIndexedTokens;
        };

        SearchSummaryVizModel.prototype.getNumWorkers = function() {
            return this.numberActiveWorkers;
        };

        SearchSummaryVizModel.prototype.getFailReason = function() {
            return this.failReason;
        };

        SearchSummaryVizModel.prototype.getFailTime = function() {
            return this.failTime;
        };

        SearchSummaryVizModel.prototype.getFailTimeHumanReadable = function() {
            return dateUtil.formatDate(this.failTime, strings.adminUI.DEFAULT_TIME_FORMAT);
        };

        return SearchSummaryVizModel;
    }]);
