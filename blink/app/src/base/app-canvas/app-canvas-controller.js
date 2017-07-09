/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com), Joy Dutta (joy@thoughtspot.com), Vibhor Nanavati (vibhor@thoughtspot.com)
 *         Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Controller for the app canvas.
 * The app canvas is the section of the app to which directives are added / removed
 * as needed based on the current route, allowing users to navigate within the app.
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('enableCommentService', 'This flag enables comment service', false);

/* eslint max-params: 1 */
blink.app.controller('AppCanvasController', ['$scope',
    'A3DashboardComponent',
    'AnswerComponent',
    'SavedAnswerComponent',
    'AggregatedWorksheetEditorComponent',
    'AnswerReplayComponent',
    'cancelableQueryContextService',
    'dialog',
    'env',
    'HomeComponent',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'navService',
    'PinboardReportsListComponent',
    'RelatedLinkComponent',
    'ScheduleReportComponent',
    'SlackRegisterComponent',
    'routeService',
    'sessionService',
    'UserPreferenceComponent',
    'util',
    'vizRenderQueueService',
    function ($scope,
              A3DashboardComponent,
              AnswerComponent,
              SavedAnswerComponent,
              AggregatedWorksheetEditorComponent,
              AnswerReplayComponent,
              cancelableQueryContextService,
              dialog,
              env,
              HomeComponent,
              jsonConstants,
              loadingIndicator,
              Logger,
              navService,
              PinboardReportsListComponent,
              RelatedLinkComponent,
              ScheduleReportComponent,
              SlackRegisterComponent,
              routeService,
              sessionService,
              UserPreferenceComponent,
              util,
              vizRenderQueueService) {

        var _logger = Logger.create('app-canvas-controller'),
            canvasUrl = {
                'admin': 'src/modules/admin/admin-page.html',
                'cluster-status': 'src/modules/clusterstatus/cluster-status-page.html',
                'debug': 'src/modules/debug/debug-page.html',
                'help': 'src/modules/help/help-page.html',
                'data': 'src/modules/metadata-list/data-management/data-management-page.html',
                'answers': 'src/modules/metadata-list/answers/answers-list-page.html',
                'pinboards': 'src/modules/metadata-list/pinboards/pinboards-list-page.html',
                'pinboard': 'src/base/app-canvas/pages/pinboard.html',
                'insight': 'src/base/app-canvas/pages/insight.html',
                'worksheet': 'src/base/app-canvas/pages/worksheet.html',
                'importdata': 'src/modules/user-data/import-wizard/import-wizard-page.html',
                'slack-auth': 'src/modules/slack/slack-auth.html',
                'create-schema': 'src/modules/user-data/create-schema/create-schema-page.html',
                'importdatasource': 'src/modules/data-sources/import-data/import-data-page.html',
                'schema-viewer': 'src/base/app-canvas/pages/schema-viewer.html'
            },
            canvasPrivileges = {
                'admin': [
                    jsonConstants.privilegeType.ADMINISTRATION
                ],
                'importdata': [
                    jsonConstants.privilegeType.ADMINISTRATION,
                    jsonConstants.privilegeType.USERDATAUPLOADING
                ],
                'schema-viewer': [
                    jsonConstants.privilegeType.ADMINISTRATION
                ],
                'worksheet': [
                    jsonConstants.privilegeType.ADMINISTRATION,
                    jsonConstants.privilegeType.DATAMANAGEMENT
                ],
                'schedule': [
                    jsonConstants.privilegeType.ADMINISTRATION,
                    jsonConstants.privilegeType.JOBSCHEDULING
                ]
            };

        var canvasComponents = {
            'aggregated-worksheet': AggregatedWorksheetEditorComponent,
            'answer': AnswerComponent,
            'home': HomeComponent,
            'insights': A3DashboardComponent,
            'related-link': RelatedLinkComponent,
            'replay-answer': AnswerReplayComponent,
            'saved-answer': SavedAnswerComponent,
            'schedules': PinboardReportsListComponent,
            'schedule': ScheduleReportComponent,
            'slack-register': SlackRegisterComponent,
            'user-preference': UserPreferenceComponent
        };

        $scope.canvasUrl = canvasUrl;

        function isOnAnswerCanvas(canvasState) {
            return canvasState === blink.app.canvasStates.ANSWER || canvasState === blink.app.canvasStates.SAVED_ANSWER ||
            canvasState === blink.app.canvasStates.WORKSHEET || canvasState === blink.app.canvasStates.AGGREGATED_WORKSHEET;
        }

    /**
     * Given the current page state, show / hide the appropriate directives
     * as defined in the CANVAS_MODULES Json, among the following:
     *      - sage
     *      - home
     *      - answers
     *      - pinboards
     *      - answer-panel
     *      - pinboard
     *      - etc..
     */
        function updateCanvas(routeChange) {
            var newRoute = routeChange.current;
            vizRenderQueueService.clearQueue();
            // only deal with valid canvas state
            if (!newRoute.canvasState) {
                return;
            }

            if (newRoute.canvasState === $scope.canvasState) {
                if ($scope.innerCtrl) {
                    $scope.innerCtrl.onCanvasStateChange(newRoute.params);
                }
                return;
            }
            cancelableQueryContextService.cancelAllPendingQueries();
            loadingIndicator.clear();
            var canvasState = newRoute.canvasState;
            delete $scope.innerCtrl;

            if (!hasCanvasStatePermission(canvasState)) {
                navService.goToHome();
            }

            var canvasModuleUrl = canvasUrl[canvasState];
            if (!canvasModuleUrl) {
                _logger.info('Unhandled canvas state: ', canvasState);
            }

            $scope.canvasState = canvasState;
            $scope.canvasSubstate = newRoute.canvasSubstate;

            if (!isOnAnswerCanvas(canvasState)) {
            // Any global state cleanup should live here.
                util.resetColorMap();
            }
            var component = canvasComponents[canvasState];
            if (!!component) {
                $scope.innerCtrl = new component();
            }
        }

    /**
     * Returns whether the current user has permission to access a certain canvas state
     *
     * This function use the canvasPrivileges variable, which maps
     * route to an array of JS objects whose keys are route and values are privileges
     * needed to access this route. OR semantic
     *
     * @param  {string}  canvasState  A canvas state
     * @return {boolean}              True if user has permission to navigate to this canvas state
     */
        function hasCanvasStatePermission(canvasState) {
            var privileges = canvasPrivileges[canvasState];
            if (privileges) {
                return privileges.any(function (privilege) {
                    return sessionService.hasPrivilege(privilege);
                });
            }
            return true;
        }

        $scope.routeChangeSubsciption =
            routeService.onRouteChange.subscribe(updateCanvas);

    // switch panel based on current route
        updateCanvas({
            current: routeService.getRouteParameters()
        });

        $scope.debugInfo = {
            commitId: blink.commitId,
            gitBranch: blink.gitBranch,
            timestamp: blink.buildTimeStamp
        };
        $scope.showDebugModeBanner = Logger.isDebugLogEnabled() && $scope.debugInfo.commitId;

        $scope.$on("$destroy", function() {
            $scope.routeChangeSubsciption.unsubscribe();
            delete $scope.innerCtrl;
        });
    }]);
