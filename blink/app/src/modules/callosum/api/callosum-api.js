/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot,com)
 *
 * @fileoverview This module is used by all the api services to make post and get Callosum Requests requests.
 */

'use strict';

blink.app.factory('Command', ['$rootScope',
    '$location',
    '$route',
    '$http',
    '$q',
    'alertConstants',
    'blinkConstants',
    'strings',
    'cancelableQueryContextService',
    'clientState',
    'debugInfoCollector',
    'env',
    'events',
    'Logger',
    'messageService',
    'navService',
    'session',
    'serviceNames',
    'util',
    'workflowManagementService',
    function ($rootScope,
              $location,
              $route,
              $http,
              $q,
              alertConstants,
              blinkConstants,
              strings,
              cancelableQueryContextService,
              clientState,
              debugInfoCollector,
              env,
              events,
              Logger,
              messageService,
              navService,
              session,
              serviceNames,
              util,
              workflowManagementService) {

        var CLIENT_TYPE_HEADER_KEY = 'X-Callosum-Client-Type';

        var _logger = Logger.create('command');
        var DEBUG_INFO_KEY_NAME = 'debugInfo';
    // Appends @after to the list of transforms @before.
        function appendTransform(before, after) {
        // Not guaranteed that the default transformation is an array.
            before = angular.isArray(before) ? before : [before];
            return before.concat(after);
        }

        var Command = function () {
            this._path = '';
            this._method = 'GET'; // default
            this._timeout = env.callosumTimeout;
            this._getParamsJson = {};
            this._postParamsJson = {};
            this._cached = false;

        /**
         * If true, then send the incident id saved in session.
         * @type {boolean}
         * @private
         */
            this._sendIncidentId = false;

        /**
         * If true, the request is tracked with a call id and can be ignored if another request with the same end point
         * was made with a higher call id.
         * @type {boolean}
         */
            this._isIgnorableRequest = false;

            this._isMultipart = false;
            this._formData = null;
        };

    /**
     * Monotonically increasing counter for callosum api calls. This is to manage overlapping callosum calls.
     * Suppose we made a call with id=0 and it is slow. We send another call with id=1 which returned
     * with data followed by data from first call. At this point of time, we would only like to process
     * data that came from the latest api call and ignore data from any prior calls.
     *
     * We send this call id in the header as X-Callosum-Call-Id. The response header reflects this value back.
     * We will ignore the response if the reflected call id does not match with the last used call id.
     *
     * The call ids are hashed by path so that we only enforce non-overlapping api calls for a given end point.
     *
     * @type {Object}
     */
        Command.callosumCallIds = {};

    /**
     * Generate and return a new call id for the given path
     *
     * @param {string} path
     * @return {number}
     */
        function generateCallId(path) {
            var callId;
            if (Command.callosumCallIds[path] === undefined) {
                Command.callosumCallIds[path] = 0;
            } else {
                Command.callosumCallIds[path]++;
            }
            callId = Command.callosumCallIds[path];
            _logger.log('set last callosum call id for path "' + path + '" to ', callId);
            return callId;
        }

    /**
     * Return the call id for the given path
     * @param path
     * @return {number}
     */
        function getCallId(path) {
            return Command.callosumCallIds[path] || 0;
        }

        Command.prototype.setIgnorable = function () {
            this._isIgnorableRequest = true;
            return this;
        };

    /**
     * @return this for chaining
     */
        Command.prototype.setPostMethod = function () {
            this._method = 'POST';
            return this;
        };

    /**
     * @return this for chaining
     */
        Command.prototype.setDeleteMethod = function () {
            this._method = 'DELETE';
            return this;
        };

    /**
     * @param {string} path
     * @return this for chaining
     */
        Command.prototype.setPath = function (path) {
            this._path = path;
            return this;
        };

    /**
     * @param {number} timeout
     * @return this for chaining
     */
        Command.prototype.setTimeout = function (timeout) {
            this._timeout = timeout;
            return this;
        };

    /**
     * @param {Object} getParamsJson
     * @return this for chaining
     */
        Command.prototype.setGetParams = function (getParamsJson) {
            if (!$.param(getParamsJson)) { return this; }
            angular.extend(this._getParamsJson, getParamsJson);
            return this;
        };

        Command.prototype.setIsMultipart = function(isMultipart) {
            this._isMultipart = isMultipart;
            return this;
        };

    /**
     * @param {Object} postParamsJson
     * @return this for chaining
     */
        Command.prototype.setPostParams = function (postParamsJson) {
            angular.extend(this._postParamsJson, postParamsJson);
            return this;
        };

        Command.prototype.setCached = function(cached) {
            this._cached = cached;
            return this;
        };

    /**
     * Executes the command resolves or rejects the deferred
     *
     */
        Command.prototype.run = function (deferred) {
            this.execute()
            .then(function (data) {
                deferred.resolve(data);
            }, function (error) {
                deferred.reject(error);
            });
        };

        Command.prototype._makeCancelable = function (params, cancellationNamespace) {
            if (this._path !== '/answer' && this._path !== '/data/reportbook') {
                return null;
            }
            this.cancelId = cancelableQueryContextService.getNewQueryId(cancellationNamespace);
            params.cancelid = JSON.stringify([this.cancelId]);
            return this.cancelId;
        };

    /**
     * Returns a promise object
     *
     */
        Command.prototype.execute = function (params) {
            var deferred = $q.defer();

            var cancelId = this._makeCancelable(
                this._method === 'GET' ? this._getParamsJson : this._postParamsJson,
                params && params.cancellationNamespace
            );

        // Add path prefix like /callosum/v1
            this._path = env.callosumBasePath + this._path;

            if (Logger.isDebugLogEnabled()) {
                if (this._method === 'GET') {
                    this._getParamsJson.debug = true;
                } else if (this._method === 'POST') {
                    this._postParamsJson.debug = true;
                }
            }

        // When the api returns, if the X-Callosum-Call-Id header does not match this value, ignore the results
            var thisPath = this._path,
                isIgnorableRequest = this._isIgnorableRequest,
                callId = isIgnorableRequest ? generateCallId(thisPath) : -1;

        // log the time profile to console
            var apiProfileMessage = Logger.ProfileMessages.API_CALL_PREAMBLE + ': ' + this._path;
            _logger.time(apiProfileMessage);

            var headersObj = {
                'X-Callosum-Call-Id': '' + callId,
                'X-Callosum-Ignore-Mem-Cache': env.ignoreCache,
                'X-Callosum-Ignore-Falcon-Cache': env.ignoreCache
            };

            headersObj[CLIENT_TYPE_HEADER_KEY] = clientState.getClientType();
            var blinkNetworkTrace = workflowManagementService.getNewNetworkTrace();
            blinkNetworkTrace.setUrl(this._path);
            headersObj['X-Callosum-trace-Id'] = blinkNetworkTrace.getChildTraceId();
            headersObj['X-Callosum-Incident-Id'] = workflowManagementService.getCurrentWorkflowId();

            var timeout = this._timeout;
            var startTime = (new Date()).getTime();
            var isCurrentlyLoggedIn = !!session.getInfo();
            var httpRequest;
            var debugInfo = {
                method: this._method,
                timestamp: startTime,
                url: this._path
            };
            blinkNetworkTrace.start();
            if (this._isMultipart) {
                var formData = new FormData();
                util.iterateObject(this._postParamsJson, function(key, value){
                    if (value !== void 0) {
                        formData.append(key, value);
                    }
                });

                headersObj['Content-Type'] = undefined;
                httpRequest = $http.post(this._path, formData, {
                    transformRequest: angular.identity,
                    params: this._getParamsJson,
                    headers: headersObj,
                    timeout: timeout
                });
            } else {
                httpRequest = $http({
                    method: this._method,
                    url: this._path,
                    params: this._getParamsJson,
                    data: this._postParamsJson,
                    headers: headersObj,
                    timeout: timeout,
                    cache: this._cached,
                    transformRequest: appendTransform(
                    $http.defaults.transformRequest,
                    function(data) {
                        debugInfo.requestSize = data.length;
                        return data;
                    }),
                    transformResponse: appendTransform(
                    function(value) {
                        debugInfo.responseSize = value.length;
                        return value;
                    },
                    $http.defaults.transformResponse)
                });
            }

            httpRequest.success(function (data, status, headers, config) {
                var responseCallId = headers('x-callosum-call-id');
                if (!responseCallId) {
                    _logger.warn('No call id found in callosum response');
                }
                blinkNetworkTrace.end();

                var requestCallId = isIgnorableRequest ? getCallId(thisPath) : -1;

                var isIgnored = (data && data.code === strings.CALLOSUM_CODE_CANCELED)
                || (cancelId && cancelableQueryContextService.wasQueryCanceled(cancelId))
                || angular.isDefined(responseCallId) && responseCallId !== null && responseCallId != requestCallId;

                if (cancelId) {
                    cancelableQueryContextService.markQueryCompleted(cancelId);
                }

                var response = {
                    data: data,
                    status: status,
                    headers: headers,
                    config: config,
                    traceId: headers('x-callosum-trace-id'),
                    isIgnored: isIgnored,
                    startTime: startTime
                };

                if (isIgnored) {
                    deferred.reject(response);
                } else {
                    deferred.resolve(response);
                }

                if (response.traceId) {
                    debugInfo.traceId = response.traceId;
                }
                if (response.data.hasOwnProperty(DEBUG_INFO_KEY_NAME)) {
                    debugInfo.debugInfo = _.clone(response.data[DEBUG_INFO_KEY_NAME]);
                }
                debugInfoCollector.collect(serviceNames.CALLOSUM, debugInfo);
                $rootScope.$broadcast(events.API_ALERT_D, response);
                _logger.debug(apiProfileMessage + '(debug info):', data.debugInfo);
                _logger.timeEnd(apiProfileMessage);
            }).error(function (data, status, headers, config) {
                var traceId = headers('x-callosum-trace-id');
                if (!!traceId) {
                    session.setTraceId(headers('x-callosum-trace-id'));
                } else {
                    session.clearTraceId();
                }

                blinkNetworkTrace.end();
                var endTime = (new Date()).getTime();
            // status <= 0 indicate the the http request was not completed, it could
            // mean could not complete the http request (time or could not connect)
                var isTimedout = status <= 0 && (endTime - startTime) >= timeout;
                var isIgnored = (status <= 0 && !isTimedout)
                || (data && data.code === strings.CALLOSUM_CODE_CANCELED)
                || (cancelId && cancelableQueryContextService.wasQueryCanceled(cancelId));

                if (cancelId) {
                    cancelableQueryContextService.markQueryCompleted(cancelId);
                }

                if (!data) {
                    data = {};
                    if (isTimedout) {
                        data.code = messageService.blinkGeneratedErrors.CALLOSUM_API_TIMEOUT;
                    } else {
                        data.code = messageService.blinkGeneratedErrors.CALLOSUM_UNKNOWN_ERROR;
                    }
                }

                var errorPayload = {
                    data: data,
                    status: status,
                    timedout: isTimedout,
                    traceId: session.getTraceId()
                };

                if (isIgnored) {
                    errorPayload.isIgnored = isIgnored;
                }
                deferred.reject(errorPayload);
                _logger.timeEnd(apiProfileMessage);

                debugInfoCollector.collect(serviceNames.CALLOSUM, {
                    data: data,
                    config: config,
                    status: status,
                    headers: headers,
                    startTime: startTime
                });

            // Note(joy): consider using response interceptors if that will make a cleaner isolation
                if (status === blinkConstants.HTTP_STATUS_NOT_LOGGED_IN) { // not logged in
                    if (navService.isEmbedded() && isCurrentlyLoggedIn) {
                    // If the user gets logged out of the session from within the embedded app for some reason,
                    // maintain the same state and notify the parent about the failure.
                        window.thoughtspot.notifyOnAuthExpiration();
                    } else if ($route.current.page !== blink.app.pages.LOGIN &&
                           $route.current.page !== blink.app.pages.PRINT) {
                        session.setLast401Path($location.$$path);
                        if (isCurrentlyLoggedIn) {
                            session.markAutomaticallyLoggedOut();
                        }
                        navService.goToLogin();
                    }
                } else {
                    $rootScope.$broadcast(events.API_ALERT_D, errorPayload);
                }
            });

            return deferred.promise;
        };

        return Command;
    }]);
