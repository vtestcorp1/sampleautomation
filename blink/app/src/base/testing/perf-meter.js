/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A metering object that keeps track of various events during
 *    life of a sage query-answer transaction and reports key performance metrics.
 */

// DEPRECATED
// perfMeter is deprecated, please use eventTracker
// see modules/performance/

'use strict';

var perfMeter = null;

blink.app.factory('perfMeter', ['$rootScope', function ($rootScope) {

    function currentTimeStamp() {
        return (new Date()).getTime();
    }

    function PerfMeter() {
        this.reset();
    }

    PerfMeter.prototype.reset = function () {
        this._pinboardRenderStartTime = {};
        this._pinboardRenderEndTime = {};
        this._genericMetricsStartTime = {};
        this._genericMetricsEndTime = {};
        this.resetAnswerMetrics();

        $rootScope.answerReady = false;
    };

    PerfMeter.prototype.resetAnswerMetrics = function () {
        this._sageRequestStartTime = this._sageRequestEndTime = 0;
        this._sageServerLatency = 0;
        this._answerMetadataRequestStartTime = this._answerMetadataRequestEndTime = 0;

        this._callosumServerMetadataLatencyInfo = null;

        this._reportbookDataRequests = {};

        this._renderableTiles = {};
        this._numRenderedTiles = 0;
        this._answerRenderStartTime = {};
        this._answerRenderEndTime = {};
    };

    PerfMeter.prototype.startSageRequest = function () {
        this.resetAnswerMetrics();
        this._sageRequestStartTime = currentTimeStamp();
    };

    PerfMeter.prototype.endSageRequest = function () {
        this._sageRequestEndTime = currentTimeStamp();
    };

    PerfMeter.prototype.getSageRequestDuration = function () {
        // Return micros to remain consistent with backend numbers.
        return 1000 * (this._sageRequestEndTime - this._sageRequestStartTime);
    };

    PerfMeter.prototype.setSageServerLatency = function (serverLatency) {
        this._sageServerLatency = serverLatency;
    };

    PerfMeter.prototype.getSageServerLatency = function () {
        return this._sageServerLatency;
    };

    PerfMeter.prototype.startAnswerMetadataRequest = function () {
        this._answerMetadataRequestStartTime = currentTimeStamp();
    };

    PerfMeter.prototype.endAnswerMetadataRequest = function () {
        this._answerMetadataRequestEndTime = currentTimeStamp();
    };

    PerfMeter.prototype.getAnswerMetadataRequestDuration = function () {
        // Return micros to remain consistent with backend numbers.
        return 1000 * (this._answerMetadataRequestEndTime - this._answerMetadataRequestStartTime);
    };

    PerfMeter.prototype.setCallosumServerMetadataLatencyInfo = function (callosumLatencyInfo) {
        this._callosumServerMetadataLatencyInfo = callosumLatencyInfo;
    };

    PerfMeter.prototype.getCallosumServerMetadataLatencyInfo = function () {
        return this._callosumServerMetadataLatencyInfo || {};
    };

    PerfMeter.prototype.registerRenderableTileIds = function (tileIds, mode) {
        var renderableTiles = this._renderableTiles;
        angular.forEach(tileIds, function (id) {
            renderableTiles[id] = { mode: mode };
        });
    };

    PerfMeter.prototype.markAnswerReadyForRendering = function (mode) {
        this._answerRenderStartTime[mode] = currentTimeStamp();
    };

    PerfMeter.prototype.markPinboardReadyForRendering = function () {
        this._pinboardRenderStartTime.total = currentTimeStamp();
    };

    PerfMeter.prototype.markPinboardVizReadyForRendering = function (vizId) {
        this._pinboardRenderStartTime[vizId] = currentTimeStamp();
    };

    PerfMeter.prototype.markGenericMetricReady = function (metric) {
        this._genericMetricsStartTime[metric] = currentTimeStamp();
    };

    PerfMeter.prototype.reportGenericMetricFinished = function (metric) {
        this._genericMetricsEndTime[metric] = currentTimeStamp();
    };

    PerfMeter.prototype.reportVizRendered = function (tileId) {
        var renderableTiles = this._renderableTiles;

        var mode;
        if (Object.has(renderableTiles, tileId)) {
            renderableTiles[tileId].rendered = true;
            mode = renderableTiles[tileId].mode;
        }

        if (!mode) {
            return;
        }

        var allTilesRendered = Object.keys(renderableTiles).filter(function (tileId) {
            return renderableTiles[tileId].mode === mode;
        }).all(function (tileId) {
            return !!renderableTiles[tileId].rendered;
        });

        if (allTilesRendered) {
            this._answerRenderEndTime[mode] = currentTimeStamp();
            $rootScope.answerReady = true;
        }
    };

    PerfMeter.prototype.reportPinboardVizRendered = function (vizId) {
        this._pinboardRenderEndTime[vizId] = currentTimeStamp();
        // If all visualizations reported as started are also reported as
        // finished, then we consider the whole pinboard rendered.
        var that = this;
        var pinboardRendered = Object.keys(this._pinboardRenderStartTime).reduce(
            function (result, key) {
                return result && (
                    key === 'total' ||
                    that._pinboardRenderEndTime.hasOwnProperty(key)
                );
            }, true);
        if (pinboardRendered) {
            this.reportPinboardRendered();
        }
    };

    PerfMeter.prototype.reportPinboardRendered = function () {
        this._pinboardRenderEndTime.total = currentTimeStamp();
    };

    PerfMeter.prototype.addReportbookDataRequest = function (mode, startTime, endTime, callosumDebugInfo) {
        this._reportbookDataRequests[mode] = {
            start: startTime,
            end: endTime,
            debugInfo: callosumDebugInfo
        };
    };

    PerfMeter.prototype.getReportbookDataDuration = function () {
        var duration = {};

        var reportbookDataRequests = this._reportbookDataRequests;
        Object.keys(reportbookDataRequests).each(function (mode) {
            duration[mode] = {
                callosum: reportbookDataRequests[mode].debugInfo,
                duration: 1000 * (reportbookDataRequests[mode].end - reportbookDataRequests[mode].start)
            };
        });

        return duration;
    };

    PerfMeter.prototype.getAnswerRenderDuration = function () {
        var durations = {};

        var answerRenderEndTime = this._answerRenderEndTime,
            answerRenderStartTime = this._answerRenderStartTime;
        Object.keys(answerRenderEndTime).each(function (mode) {
            // Return micros to remain consistent with backend numbers.
            durations[mode] = 1000 * (answerRenderEndTime[mode] - answerRenderStartTime[mode]);
        });

        return durations;
    };

    PerfMeter.prototype.getPinboardRenderDuration = function () {
        var durations = {};

        var pinboardRenderEndTime = this._pinboardRenderEndTime,
            pinboardRenderStartTime = this._pinboardRenderStartTime;
        Object.keys(pinboardRenderEndTime).each(function (viz) {
            // Return micros to remain consistent with backend numbers.
            durations[viz] = 1000 * (pinboardRenderEndTime[viz] - pinboardRenderStartTime[viz]);
        });

        return durations;
    };

    PerfMeter.prototype.getGenericRenderDuration = function () {
        var durations = {};

        var metricsEndTime = this._genericMetricsEndTime,
            metricsStartTime = this._genericMetricsStartTime;
        Object.keys(metricsEndTime).each(function (metric) {
            durations[metric] = 1000 * (metricsEndTime[metric] - metricsStartTime[metric]);
        });

        return durations;
    };

    if (!perfMeter) {
        perfMeter = new PerfMeter();
    }

    return perfMeter;
}]);
