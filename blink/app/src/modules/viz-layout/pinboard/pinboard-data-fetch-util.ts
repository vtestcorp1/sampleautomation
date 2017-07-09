import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire} from '../../../base/decorators';
import {VisualizationModel} from '../viz/visualization-model';
import IPromise = angular.IPromise;
import _ from 'lodash';
import {getTemplateCacheKey, getTextTemplate} from '../../yseop-service';

let $q = ngRequire('$q');
let $templateCache = ngRequire('$templateCache');
let alertService = ngRequire('alertService');
let clusterStatusService = ngRequire('clusterStatusService');
let dataService = ngRequire('dataService');
let jsonConstants = ngRequire('jsonConstants');
let Logger = ngRequire('Logger');
let pinboardMetadataService = ngRequire('pinboardMetadataService');
let UserAction = ngRequire('UserAction');

export function fetchData(pbVizId: string,
                          referencedVizModel: VisualizationModel,
                          answerModel: any,
                          snapshotId: string,
                          isAutoCreated: boolean): IPromise<void> {
    var _logger = Logger.create('pinboard-data-fetch-util');

    var vizType = referencedVizModel.getVizType().toLowerCase(),
        vizSubtype = referencedVizModel.getVizSubtype(),
        dataPromise = null;

    if (vizType === jsonConstants.VIZ_TYPE_GENERIC) {
        switch (vizSubtype) {
            case jsonConstants.genericVizSubtype.SEARCH_SUMMARY_VIZ:
                dataPromise = clusterStatusService.getSearchStatsSummary();
                break;
            case jsonConstants.genericVizSubtype.SEARCH_DETAIL_TABLE_VIZ:
                dataPromise = clusterStatusService.getSearchDetailTable();
                break;
            case jsonConstants.genericVizSubtype.DATABASE_SUMMARY_VIZ:
                dataPromise = clusterStatusService.getDatabaseStatsSummary();
                break;
            case jsonConstants.genericVizSubtype.DATABASE_DETAIL_VIZ:
                dataPromise = clusterStatusService.getDatabaseStatsDetail();
                break;
            case jsonConstants.genericVizSubtype.CLUSTER_SUMMARY_VIZ:
                dataPromise = clusterStatusService.getClusterStatsSummary();
                break;
            case jsonConstants.genericVizSubtype.CLUSTER_DETAIL_INFO_VIZ:
                dataPromise = clusterStatusService.getClusterDetailInfo();
                break;
            case jsonConstants.genericVizSubtype.CLUSTER_DETAIL_LOG_VIZ:
                dataPromise = clusterStatusService.getClusterDetailLog();
                break;
            case jsonConstants.genericVizSubtype.CLUSTER_DETAIL_SNAPSHOT_VIZ:
                dataPromise = clusterStatusService.getClusterDetailSnapshot();
                break;
            case jsonConstants.genericVizSubtype.ALERT_SUMMARY_VIZ:
                dataPromise = clusterStatusService.getAlertSummary();
                break;
            case jsonConstants.genericVizSubtype.EVENT_SUMMARY_VIZ:
                dataPromise = clusterStatusService.getEventSummary();
                break;
            case jsonConstants.genericVizSubtype.ALERT_DETAIL_ALERTS_VIZ:
                dataPromise = clusterStatusService.getAlertsDetailsAlerts();
                break;
            case jsonConstants.genericVizSubtype.ALERT_DETAIL_EVENTS_VIZ:
                dataPromise = clusterStatusService.getAlertsDetailsEvents();
                break;
            case jsonConstants.genericVizSubtype.ALERT_DETAIL_NOTIFICATIONS_VIZ:
                dataPromise = clusterStatusService.getAlertsDetailsNotifications();
                break;
            default:
                _logger.error('Unknown generic viz subtype', vizSubtype);
        }
    } else {
        var userAction = new UserAction(UserAction.FETCH_VIZ_DATA);
        var pinVizModel = referencedVizModel.getReferencingViz();
        var overrideQuestion = pinVizModel.getOverrideQuestion();
        var isSnapshot = !!snapshotId;
        var vizDataParams = {
            offset: referencedVizModel.getSavedDataOffset(),
            overrideQuestion: overrideQuestion
        };
        var dataPromiseCall = isSnapshot ?
            pinboardMetadataService.getPinboardSnapshot(
                answerModel,
                pinVizModel,
                answerModel._header.id,
                snapshotId,
                pbVizId) :
            dataService.getDataForViz(
                answerModel,
                pinVizModel,
                vizDataParams);
        dataPromise =
            dataPromiseCall.then(function(response) {
                return response.data;
            }, function(response) {
                if (isSnapshot && response === dataService.errorCodes.VIZ_DATA_EMPTY) {
                    return [[]];
                }
                if (!response.isIgnored) {
                    _logger.error('error in getting data for referencedViz', response);
                }
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
    }

    if (dataPromise === null) {
        _logger.error('Data promise is null when loading pinboard viz.');
        return;
    }

    var shouldLoadYSEOPTemplate = referencedVizModel.getVizType() === blinkConstants.vizTypes.CHART
        && isAutoCreated;
    dataPromise = dataPromise
        .then(function (newVizData) {
            referencedVizModel.setDataLoadFailed(false);
            var containingAnswerModel = referencedVizModel.getContainingAnswerModel();
            var answerSheet = containingAnswerModel.getCurrentAnswerSheet();
            answerSheet.setDataForViz(
                pbVizId,
                jsonConstants.VIZ_TYPE_PINBOARD.toUpperCase(),
                newVizData
            );
            referencedVizModel.updateData(newVizData);
            return;
        });
    if (shouldLoadYSEOPTemplate) {
        dataPromise = dataPromise
            .then(function() {
                return getTextTemplate((<any> referencedVizModel).getYSEOPConfig());
            })
            .then(function(textTemplate) {
                var templateCacheKey = getTemplateCacheKey(referencedVizModel.getId());
                $templateCache.put(templateCacheKey, textTemplate);
            });
    }
    return dataPromise.then(_.noop, function (error) {
        referencedVizModel.setDataLoadFailed(true);
        return $q.reject(error);
    });
}
