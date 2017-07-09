/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Service to get cluster status.
 */

'use strict';

blink.app.factory('clusterStatusService', ['$http',
    'alertService',
    'Logger',
    'messageService',
    'UserAction',
    'util',
    function ($http,
          alertService,
          Logger,
          messageService,
          UserAction,
          util) {

        var ORION_PAGE = '/periscope/orion/getstats',
            SNAPSHOT_PAGE = '/periscope/orion/listsnapshots',
            FALCON_SUMMARY_PAGE = '/periscope/falcon/getsummary',
            FALCON_DETAIL_PAGE = '/periscope/falcon/getstats',
            SAGE_SUMMARY_PAGE = '/periscope/sage/getsummary',
            SAGE_DETAIL_TABLE_PAGE = '/periscope/sage/combinedtableinfo',
            ALERT_PAGE = '/periscope/alert/getalerts',
            EVENT_PAGE = '/periscope/alert/getevents';

        var logger = Logger.create('cluster-status-service');

        function fetchData(url, successInfo, userAction) {
            return $http.get(url).then(function(response) {
                logger.debug(successInfo, response);
                return response.data;
            }, function(errorResponse) {
                alertService.showUserActionFailureAlert(userAction, {});
                logger.error(errorResponse);
                return errorResponse;
            });
        }

        function getSearchStatsSummary() {
            return fetchData(
            SAGE_SUMMARY_PAGE,
            'Sage summary fetch succeeded',
            new UserAction(UserAction.SEARCH_SUMMARY)
        );
        }

        function getSearchDetailTable() {
            return fetchData(
            SAGE_DETAIL_TABLE_PAGE,
            'Sage tables detail fetch succeeded',
            new UserAction(UserAction.SEARCH_DETAIL_TABLE)
        );
        }

        function getDatabaseStatsSummary() {
            return fetchData(
            FALCON_SUMMARY_PAGE,
            'Falcon summary fetch succeeded',
            new UserAction(UserAction.DATABASE_SUMMARY)
        );
        }

        function getDatabaseStatsDetail() {
            return fetchData(
            FALCON_DETAIL_PAGE,
            'Falcon detail fetch succeeded',
            new UserAction(UserAction.DATABASE_DETAIL)
        );
        }

        function getClusterStatsSummary() {
            var orionData = fetchData(
            ORION_PAGE,
            'Cluster summary fetch succeeded',
            new UserAction(UserAction.CLUSTER_SUMMARY)
        );
            var snapshotData = fetchData(
            SNAPSHOT_PAGE,
            'Snapshot list fetch succeeded',
            new UserAction(UserAction.CLUSTER_DETAIL_SNAPSHOT)
        );
            return util.getAggregatedPromise([orionData, snapshotData]);
        }

        function getClusterDetailInfo() {
            return fetchData(
            ORION_PAGE,
            'Cluster summary fetch succeeded',
            new UserAction(UserAction.CLUSTER_DETAIL_INFO)
        );
        }

        function getClusterDetailLog() {
            return fetchData(
            ORION_PAGE,
            'Cluster summary fetch succeeded',
            new UserAction(UserAction.CLUSTER_DETAIL_LOG)
        );
        }

        function getClusterDetailSnapshot() {
            return fetchData(
            SNAPSHOT_PAGE,
            'Snapshot list fetch succeeded',
            new UserAction(UserAction.CLUSTER_DETAIL_SNAPSHOT)
        );
        }

        function getAlertSummary() {
            return fetchData(
            ALERT_PAGE,
            'Alert information fetch succeeded',
            new UserAction(UserAction.ALERT_SUMMARY)
        );
        }

        function getEventSummary() {
            return fetchData(
            EVENT_PAGE,
            'Event information fetch succeeded',
            new UserAction(UserAction.EVENT_SUMMARY)
        );
        }

        function getAlertsDetailsAlerts()  {
            return fetchData(
            ALERT_PAGE,
            'Alert information fetch succeeded',
            new UserAction(UserAction.ALERTS_DETAILS_ALERTS)
        );
        }

        function getAlertsDetailsEvents()  {
            return fetchData(
            EVENT_PAGE,
            'Event information fetch succeeded',
            new UserAction(UserAction.ALERTS_DETAILS_EVENTS)
        );
        }

        function getAlertsDetailsNotifications() {
            return fetchData(
            EVENT_PAGE,
            'Event information fetch succeeded',
            new UserAction(UserAction.ALERTS_DETAILS_EVENTS)
        );
        }

        return {
            getSearchStatsSummary: getSearchStatsSummary,
            getSearchDetailTable: getSearchDetailTable,
            getDatabaseStatsSummary: getDatabaseStatsSummary,
            getDatabaseStatsDetail: getDatabaseStatsDetail,
            getClusterStatsSummary: getClusterStatsSummary,
            getClusterDetailInfo: getClusterDetailInfo,
            getClusterDetailLog: getClusterDetailLog,
            getClusterDetailSnapshot: getClusterDetailSnapshot,
            getAlertSummary: getAlertSummary,
            getEventSummary: getEventSummary,
            getAlertsDetailsAlerts: getAlertsDetailsAlerts,
            getAlertsDetailsEvents: getAlertsDetailsEvents,
            getAlertsDetailsNotifications: getAlertsDetailsNotifications
        };
    }]);
