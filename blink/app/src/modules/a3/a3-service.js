/**
 * Copyright: ThoughtSpot Inc. 2015
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service to interact with AutoComplete server (Sage Server) for a3 analysis.
 */

'use strict';

blink.app.factory('a3Service', ['$q',
    'env',
    'Logger',
    function($q,
             env,
             Logger) {

        var _logger = Logger.create('auto-complete-service'),
            _transport = new Thrift.Transport(env.sageBasePathV2),
            _protocol  = new Thrift.Protocol(_transport),
            _timeout = env.a3Timeout;

        var a3Client = new thrift.Sage.AutoComplete.AutoCompleteV2Client(_protocol);

        function getThriftRequest(a3Request) {
            var request = new thrift.common.ThriftRequest();
            request.request = sage.serialize(a3Request);
            return request;
        }

        /**
         * Creates a default callback handler for sage calls.
         * @param deferred
         * @returns {{success: Function, error: Function,
     * timeout:(_defaultEnv.sageTimeout|*|me.sageTimeout|t.sageTimeout)}}
         */
        function getDefaultCallbackHandlers (deferred) {
            return {
                success: function(sageResponse) {
                    _logger.debug('sage response success', sageResponse);
                    deferred.resolve(sageResponse);
                },
                error: function(jqueryXhr, textStatus, errorThrown) {
                    _logger.error('sage response failure', jqueryXhr, textStatus, errorThrown);
                    deferred.reject(errorThrown);
                },
                timeout: _timeout
            };
        }

        /**
         *
         * @param request ThriftRequest wrapping VisualizationAnalysisRequest in request.
         * @returns {ThriftResponse} Wrapping VisualizationAnalysisResponse in response.
         * @constructor
         */
        function triggerVisualizationAnalysis(request) {
            request = getThriftRequest(request);
            _logger.warn('Use of deprecated API');
            var defer = $q.defer();

            a3Client.A3VisualizationAnlysis(
                request,
                getDefaultCallbackHandlers(defer)
            );

            return defer.promise;
        }

        /**
         *
         * @param request ThriftRequest wrapping A3Request in request.
         * @returns {ThriftResponse} Wrapping A3Response in response.
         * @constructor
         */
        function triggerA3Analysis(request) {
            request = getThriftRequest(request);
            var defer = $q.defer();

            a3Client.A3Analysis(
                request,
                getDefaultCallbackHandlers(defer)
            );

            return defer.promise;
        }


        /**
         *
         * @param request ThriftRequest wrapping DataAnalysisRequest in request.
         * @returns {ThriftResponse} Wrapping DataAnalysisResponse in response.
         * @constructor
         */
        function triggerDataAnalysis(request) {
            request = getThriftRequest(request);
            _logger.warn('Use of deprecated API');
            var defer = $q.defer();

            a3Client.A3DataAnalysis(
                request,
                getDefaultCallbackHandlers(defer)
            );

            return defer.promise;
        }

        return {
            triggerVisualizationAnalysis: triggerVisualizationAnalysis,
            triggerDataAnalysis: triggerDataAnalysis,
            triggerA3Analysis: triggerA3Analysis
        };
    }
]);
