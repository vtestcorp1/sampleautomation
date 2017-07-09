/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Logger for blink
 *
 * Angular's $log supports log(), info(), warn() and error() of which first two give same output.
 * warn() adds an icon, and error() shows a red message with stack trace. We build wrappers on top of these methods
 *
 * This logger service provides a create method. A simple use case:
 *
 * var _logger = Logger.create('foo-bar');
 *
 * Unmutes all following log actions in this scope
 * _logger.unmute();
 *
 * _logger.info('hello'); // outputs 'INFO time foo-bar incident-id file name:line number:column number] hello'
 *
 * Guidelines for using different levels (thanks Vijay for this awesome description!):
 *
 * ERROR: the system is in distress, customers are probably being affected (or will soon be) and the fix probably requires
 * human intervention. The "2AM rule" applies here- if you're on call, do you want to be woken up at 2AM if this condition
 * happens? If yes, then log it as "error".
 *
 * WARN: an unexpected technical or business event happened, customers may be affected, but probably no immediate human
 * intervention is required. On call people won't be called immediately, but support personnel will want to review these
 * issues asap to understand what the impact is. Basically any issue that needs to be tracked but may not require
 * immediate intervention.
 *
 * INFO: things we want to see at high volume in case we need to forensically analyze an issue. System lifecycle events
 * (system start, stop) go here. "Session" lifecycle events (login, logout, etc.) go here. Significant boundary events
 * should be considered as well (e.g. database calls, remote API calls). Typical business exceptions can go here
 * (e.g. login failed due to bad credentials). Any other event you think you'll need to see in production at high volume
 * goes here.
 *
 * DEBUG: just about everything that doesn't make the "info" cut... any message that is helpful in tracking the flow
 * through the system and isolating issues, especially during the development and QA phases. We use "debug" level logs
 * for entry/exit of most non-trivial methods and marking interesting events and decision points inside methods.
 *
 * TRACE: we don't use this often, but this would be for extremely detailed and potentially high volume logs that you
 * don't typically want enabled even during normal development. Examples include dumping a full object hierarchy, logging
 * some state during every iteration of a large loop, etc
 */

'use strict';

blink.app.factory('Logger', [
    '$log',
    'env',
    'logReporter',
    'stackTraceService',
    function ($log,
              env,
              logReporter,
              stackTraceService) {

        var me = {},
            _loggers = {};

    /**
     * Logging levels
     * @type {{TRACE: number, DEBUG: number, INFO: number, WARN: number, ERROR: number}}
     */
        me.logLevel = {
            TRACE: 4,
            DEBUG: 3,
            INFO: 2,
            WARN: 1,
            ERROR: 0
        };

    /**
     * Map of log level to string representation
     * @type {{}}
     */
        me.logLevelToString = {};
        for (var prop in me.logLevel) {
            if (me.logLevel.hasOwnProperty(prop)) {
                me.logLevelToString[me.logLevel[prop]] = prop;
            }
        }
        var clientLogLevel = me.logLevel[env.clientLogLevel.toUpperCase()];

    // TODO (Shikhar) - use util after you get rid of circular dependency thing
        function getCurrentDateTime() {
            var d = new Date();
            return ((d.getHours() < 10) ? '0' : '') + d.getHours() + ':' +
            ((d.getMinutes() < 10) ? '0' : '') + d.getMinutes() + ':' +
            ((d.getSeconds() < 10) ? '0' : '') + d.getSeconds() + '.' +
            d.getMilliseconds();
        }

    /**
     * @constructor
     * @param {string} name
     */
        var _logger = function (name) {

        /**
         * @type {string}
         * @private
         */
            this._msgPrefix = name ? '(' + name + ')' : '';

        /**
         * @type {boolean}
         * @private
         */
            this._muted = true;

        /**
         * Map of (file, line number, column number) to counter for everyN call
         * @type {{}}
         * @private
         */
            this._everyNMap = {};
        };

        _logger.prototype = {};

    /**
     * Mute logging for this instance
     * @return this for chaining
     */
        _logger.prototype.unmute = function () {
            this._muted = false;
            return this;
        };

    /**
     * @param {string} msg
     * @return {string}
     * @private
     */
        _logger.prototype._getFormattedMessage = function (msg, logLevel, shallIncludeIncidentId, idxInStackTrace) {
            var incidentIdMsg = '';
            idxInStackTrace = idxInStackTrace || 6;
            // TODO(Jasmeet): Bring back support for incident id in logger.
            // if (shallIncludeIncidentId) {
            //     incidentIdMsg = workflowManagementService.getCurrentWorkflowId();
            // }

            var callSiteDetails = stackTraceService.print()[idxInStackTrace].split("/").last();
            return me.logLevelToString[logLevel] + ' ' + getCurrentDateTime() + ' ' + this._msgPrefix + ' ' +
            incidentIdMsg + ' ' + callSiteDetails + (msg ? '] ' + msg : '');
        };

    /**
     * We always log warn and error even if they are muted.
     * @param logLevel
     * @returns {boolean}
     */
        _logger.prototype.canLog = function (logLevel) {
            return logLevel <= clientLogLevel && (logLevel <= me.logLevel.WARN || !this._muted);
        };

        _logger.prototype.logMessages = function (args, $logFn, logLevel) {
            if (!this.canLog(logLevel)) {
                return;
            }

            args[0] = this._getFormattedMessage(args[0], logLevel, true);
            logReporter.reportLog('', me.logLevelToString[logLevel], args);
            // logReporter.reportLog(workflowManagementService.getCurrentWorkflowId(), me.logLevelToString[logLevel], args);
            $logFn.apply(_logger, args);
        };

    /**
     * Wrapper for $log.log() with trace level
     * @param msg
     */
        _logger.prototype.trace = function (msg) {
            this.logMessages(arguments, $log.log, me.logLevel.TRACE);
        };

    /**
     * Wrapper for $log.log() with debug level
     * @param msg
     */
        _logger.prototype.debug = function (msg) {
            this.logMessages(arguments, $log.log, me.logLevel.DEBUG);
        };

    /**
     * Use debug()
     * @deprecated
     */
        _logger.prototype.log = _logger.prototype.debug;

    /**
     * Wrapper for $log.info() with info level
     * @param msg
     */
        _logger.prototype.info = function (msg) {
            this.logMessages(arguments, $log.info, me.logLevel.INFO);
        };

    /**
     * Wrapper for $log.warn() with warn level
     *
     * @param {string} msg The log message
     */
        _logger.prototype.warn = function (msg) {
            this.logMessages(arguments, $log.warn, me.logLevel.WARN);
        };

    /**
     * Wrapper for $log.error() with error level
     *
     * @param {string}  msg  The log message
     */
        _logger.prototype.error = function (msg) {
            var args = arguments;
        // args is not an Array
            args[args.length] = stackTraceService.print();
            args.length++;
            this.logMessages(args, $log.error, me.logLevel.ERROR);
        };

        _logger.prototype.logException = function (exception) {
            if (!exception) {
                return;
            }

            this.logMessages([exception.message, stackTraceService.print({e: exception})], $log.error, me.logLevel.ERROR);
        };

    /**
     * For a given call site (file, line number and column number), logs with uniform probability over the freq given,
     * The first call is always logged.
     * @param logLevel
     * @param freq
     * @param msg
     */
        _logger.prototype.everyN = function (logLevel, freq, msg) {
            if (!this.canLog(logLevel) || freq < 0) {
                return;
            }

            var key = stackTraceService.print()[4].split("/").last();
            if (!this._everyNMap.hasOwnProperty(key)) {
                this._everyNMap[key] = 0;
            }

            if (this._everyNMap[key] > 0 && Math.floor(Math.random() * freq) > 0) {
                return;
            }

            ++this._everyNMap[key];

            var fn;
            switch (logLevel) {
                case me.logLevel.TRACE:
                case me.logLevel.DEBUG:
                    fn = $log.log;
                    break;
                case me.logLevel.INFO:
                    fn = $log.info;
                    break;
                case me.logLevel.WARN:
                    fn = $log.warn;
                    break;
                default:
                    fn = $log.error;
            }

            var args = arguments;
            for (var i = 0; i < args.length - 2; i++) {
                args[i] = args[i + 2];
            }
            args.length = args.length - 2;

            this.logMessages(args, fn, logLevel);
        };

    /**
     * Wrapper for console.time() with log level debug.
     */
        _logger.prototype.time = function (msg) {
            if (!me.isDebugLogEnabled() || !console || !console.time) { return; }
            console.time(msg);
        };

    /**
     * Wrapper for console.timeEnd() with log level debug.
     */
        _logger.prototype.timeEnd = function (msg) {
            if (!me.isDebugLogEnabled() || !console || !console.timeEnd) { return; }
            console.timeEnd(msg);
        };

    /**
     * Wrapper for console.group() with log level debug.
     */
        _logger.prototype.group = function (msg) {
            if (!me.isDebugLogEnabled() || !console || !console.group) { return; }
            console.group(msg);
        };

    /**
     * Wrapper for console.groupEnd() with log level debug.
     */
        _logger.prototype.groupEnd = function (msg) {
            if (!me.isDebugLogEnabled() || !console || !console.groupEnd) { return; }
            console.groupEnd(msg);
        };

        me.create = function (name) {
            if (!_loggers[name]) {
                _loggers[name] = new _logger(name);
            }
            var shouldUnmute = (env.log === 'all' || env.log.split(',').any(function (loggerName) { return name.indexOf(loggerName) >= 0; }));
            if (shouldUnmute) {
                _loggers[name].unmute();
            }
            return _loggers[name];
        };

        me.setClientLogLevel = function (level) {
            clientLogLevel = level;
        };

        me.isDebugLogEnabled = function () {
            return me.logLevel.DEBUG <= clientLogLevel;
        };

        me.ProfileMessages = {
            API_CALL_PREAMBLE: 'Api call',
            SAGE_THRIFT_CALL: 'Sage thrift call',
            SAGE_SERVER_LATENCY: 'Sage server latency',
            SAGE_RESPONSE_PROCESSING: 'Sage response processing',
            SAGE_DROPDOWN_RENDERING: 'Sage dropdown rendering',
            ANSWER_MODEL_PARSING: 'Parsing Answer Model',
            CHART_VIZ_PROCESSING_PREAMBLE: 'Processing data for Chart Viz',
            CHART_VIZ_CHART_TYPE_SUPPORT_COMPUTATION_PREAMBLE: 'Computing supported chart types for Chart Viz',
            CHART_VIZ_RENDER_PREAMBLE: 'Rendering for Highcharts Viz',
            FILTER_VIZ_PROCESSING_PREAMBLE: 'Processing data for Filter Viz',
            FILTER_VIZ_RENDER: 'Rendering for Filter Viz',
            TABLE_VIZ_PROCESSING_PREAMBLE: 'Processing data for Table Viz',
            TABLE_VIZ_RENDER_PREAMBLE: 'Rendering for Table Viz'
        };

        return me;
    }]);
