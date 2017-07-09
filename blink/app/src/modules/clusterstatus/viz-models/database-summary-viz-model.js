/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating falcon status summary.
 */

'use strict';

blink.app.factory('DatabaseSummaryVizModel', ['blinkConstants',
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

        var logger = Logger.create('database-summary-viz-model');

        function DatabaseSummaryVizModel(params) {
            DatabaseSummaryVizModel.__super.call(this, params);
        }
        util.inherits(DatabaseSummaryVizModel, GenericVizModel);

    // Data will be loaded when this function gets called.
        DatabaseSummaryVizModel.prototype.updateData = function(data) {
            angular.extend(this, data);
        };

        DatabaseSummaryVizModel.prototype.getStatus = function() {
            return this.status;
        };

        DatabaseSummaryVizModel.prototype.getNumTables = function() {
            return this.numTables;
        };

        DatabaseSummaryVizModel.prototype.getNumRows = function() {
            return this.numRows;
        };

        DatabaseSummaryVizModel.prototype.getNumReadyTables = function() {
            return this.numReady;
        };

        DatabaseSummaryVizModel.prototype.getNumInProgressTables = function() {
            return this.numInProgress;
        };

        DatabaseSummaryVizModel.prototype.getNumStaleTables = function() {
            return this.numStale;
        };

        DatabaseSummaryVizModel.prototype.getNumErrorTables = function() {
            return this.numError;
        };

        DatabaseSummaryVizModel.prototype.getLastUpdateTime = function() {
            return dateUtil.formatDate(this.lastUpdateTime, strings.adminUI.DEFAULT_TIME_FORMAT);
        };

        DatabaseSummaryVizModel.prototype.getNumLoadedInLastDay = function() {
            return this.numLoadedInLastDay;
        };

        return DatabaseSummaryVizModel;
    }]);
