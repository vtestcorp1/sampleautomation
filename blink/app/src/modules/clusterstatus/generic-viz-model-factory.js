/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview A factory to create generic-viz instances of given viz sub-type. Currently, generic-viz represents
 * service information which is provided by periscope. This factory parses the raw data from periscope and interprets it
 * into visualizations showing in cluster status page.
 */

'use strict';

blink.app.factory('genericVizModelFactory', ['AlertDetailAlertsVizModel',
    'AlertDetailEventsVizModel',
    'AlertDetailNotificationsVizModel',
    'AlertSummaryVizModel',
    'ClusterDetailInfoVizModel',
    'ClusterDetailLogVizModel',
    'ClusterDetailSnapshotVizModel',
    'ClusterSummaryVizModel',
    'DatabaseDetailVizModel',
    'DatabaseSummaryVizModel',
    'EventSummaryVizModel',
    'jsonConstants',
    'Logger',
    'SearchDetailTableVizModel',
    'SearchSummaryVizModel',
    function (AlertDetailAlertsVizModel,
    AlertDetailEventsVizModel,
    AlertDetailNotificationsVizModel,
    AlertSummaryVizModel,
    ClusterDetailInfoVizModel,
    ClusterDetailLogVizModel,
    ClusterDetailSnapshotVizModel,
    ClusterSummaryVizModel,
    DatabaseDetailVizModel,
    DatabaseSummaryVizModel,
    EventSummaryVizModel,
    jsonConstants,
    Logger,
    SearchDetailTableVizModel,
    SearchSummaryVizModel) {

        var logger = Logger.create('generic-viz-model-factory');

        function createGenericVizModel(vizModelSubtype, vizContent) {
            switch (vizModelSubtype) {
                case jsonConstants.genericVizSubtype.SEARCH_SUMMARY_VIZ:
                    return new SearchSummaryVizModel(vizContent);
                case jsonConstants.genericVizSubtype.SEARCH_DETAIL_TABLE_VIZ:
                    return new SearchDetailTableVizModel(vizContent);
                case jsonConstants.genericVizSubtype.DATABASE_SUMMARY_VIZ:
                    return new DatabaseSummaryVizModel(vizContent);
                case jsonConstants.genericVizSubtype.DATABASE_DETAIL_VIZ:
                    return new DatabaseDetailVizModel(vizContent);
                case jsonConstants.genericVizSubtype.CLUSTER_SUMMARY_VIZ:
                    return new ClusterSummaryVizModel(vizContent);
                case jsonConstants.genericVizSubtype.CLUSTER_DETAIL_INFO_VIZ:
                    return new ClusterDetailInfoVizModel(vizContent);
                case jsonConstants.genericVizSubtype.CLUSTER_DETAIL_LOG_VIZ:
                    return new ClusterDetailLogVizModel(vizContent);
                case jsonConstants.genericVizSubtype.CLUSTER_DETAIL_SNAPSHOT_VIZ:
                    return new ClusterDetailSnapshotVizModel(vizContent);
                case jsonConstants.genericVizSubtype.ALERT_SUMMARY_VIZ:
                    return new AlertSummaryVizModel(vizContent);
                case jsonConstants.genericVizSubtype.EVENT_SUMMARY_VIZ:
                    return new EventSummaryVizModel(vizContent);
                case jsonConstants.genericVizSubtype.ALERT_DETAIL_ALERTS_VIZ:
                    return new AlertDetailAlertsVizModel(vizContent);
                case jsonConstants.genericVizSubtype.ALERT_DETAIL_EVENTS_VIZ:
                    return new AlertDetailEventsVizModel(vizContent);
                case jsonConstants.genericVizSubtype.ALERT_DETAIL_NOTIFICATIONS_VIZ:
                    return new AlertDetailNotificationsVizModel(vizContent);
                default:
                    logger.error('Unknown generic viz subtype', vizModelSubtype);
                    return null;
            }
        }

        return {
            createGenericVizModel: createGenericVizModel
        };
    }]);
