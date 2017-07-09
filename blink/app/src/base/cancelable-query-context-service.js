/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to allow preventing user navigating away from unsaved changes
 */

'use strict';

blink.app.factory('cancelableQueryContextService', ['$http',
    'env',
    'jsUtil',
    'Logger',
    function ($http,
          env,
          jsUtil,
          Logger) {
        var me = {},
            _logger = Logger.create('cancelable-query-context-service'),
            canceledQueryIds = {};
        var namespacedPendingQueryIds = {};
        var defaultNamespace = '{default}';
        var pendingQueryIdToNamespace = {};

        function cancelQueries(queryIds) {
            if (queryIds.length === 0) {
                return;
            }

            queryIds.each(function(queryId){
                canceledQueryIds[queryId] = 1;
            });

        //can't use command API here as that would cause circular dependency between this module and command module
            $http({
                method: 'POST',
                url: env.callosumBasePath + '/data/cancel',
                data: {
                    cancelid: JSON.stringify(queryIds)
                }
            });
        }

        me.getNewQueryId = function (namespace) {
            namespace = namespace || defaultNamespace;
            var queryId = jsUtil.generateUUID();
            pendingQueryIdToNamespace[queryId] = namespace;
            namespacedPendingQueryIds[namespace] = namespacedPendingQueryIds[namespace] || {};
            namespacedPendingQueryIds[namespace][queryId] = 1;
            return queryId;
        };

        me.markQueryCompleted = function (queryId) {
            var namespace = pendingQueryIdToNamespace[queryId];
            delete namespacedPendingQueryIds[namespace][queryId];
            delete canceledQueryIds[queryId];
        };

        function cancelPendingQueries(nameSpace) {
            var queryIds = [];
            if (!!nameSpace) {
                queryIds = Object.keys(namespacedPendingQueryIds[nameSpace] || {});
                delete namespacedPendingQueryIds[nameSpace];
            } else {
                Object.keys(namespacedPendingQueryIds).forEach(function(ns) {
                    var queriesInNamespace = Object.keys(namespacedPendingQueryIds[ns]);
                    Array.prototype.push.apply(queryIds, queriesInNamespace);
                });
                namespacedPendingQueryIds = {};
                pendingQueryIdToNamespace = {};
            }

            _logger.log('canceling queries', queryIds.length, queryIds);
            //Note(sunny): at this point we assume that all cancellations went fine,
            // we don't keep track of what was not cancelled, nor do we re-try
            return cancelQueries(queryIds);
        }

        me.cancelPendingQueriesInNamespace = function(nameSpace) {
            if (!nameSpace) {
                _logger.error('Use cancel all pending queries');
                return;
            }
            return cancelPendingQueries(nameSpace);
        };

        me.cancelAllPendingQueries = function () {
            return cancelPendingQueries();
        };

        me.wasQueryCanceled = function (queryId) {
            return Object.has(canceledQueryIds, queryId);
        };

        me.cancelQueries = cancelQueries;

        return me;
    }]);
