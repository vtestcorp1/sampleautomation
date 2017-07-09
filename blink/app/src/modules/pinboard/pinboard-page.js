/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Controller for the pinboard page
 */

'use strict';

// TODO(Jasmeet): We use pinboard page for 2 things today.
// 1. Directly using it as a page when #/pinboard/id is requested in URL.
// 2. Reusable component that displays a pinboard and allows modifications.
// We can break this into 2 component which are parent child. And the chil will
// reused in other pages.
/* eslint max-params: 1 */
blink.app.directive('pinboardPage', [function () {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            hidePanel: '=',
            dontWatchUrl: '=',
            id: '=',
            pinboardPageConfig: '=?',
            onModelUpdateSuccess: '&',
            onModelUpdateFailure: '&',
            isInsightsPinboard: '='
        },
        templateUrl: 'src/modules/pinboard/pinboard-page.html',
        controller: 'PinboardPageController'
    };
}]);

blink.app.controller('PinboardPageController', ['$scope',
    '$q',
    '$route',
    '$rootScope',
    'A3InsightsSummaryComponent',
    'alertService',
    'answerMetadataUtil',
    'answerService',
    'autoCompleteObjectUtil',
    'autoCompleteService',
    'blinkAutoCompleteService',
    'blinkConstants',
    'callosumTypes',
    'dateUtil',
    'DocumentLoader',
    'events',
    'eventTracker',
    'FilterPanelController',
    'filterTransformationUtil',
    'filterUtil',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'metadataService',
    'perfEvents',
    'PinboardAnswerComponent',
    'pinboardMetadataService',
    'pinboardMetadataUtil',
    'PinboardPageConfig',
    'PinboardViewState',
    'QuestionModel',
    'sageDataSourceService',
    'strings',
    'UserAction',
    'util',
    'VizContextAnswerComponent',
    'workflowManagementService',
    function ($scope,
              $q,
              $route,
              $rootScope,
              A3InsightsSummaryComponent,
              alertService,
              answerMetadataUtil,
              answerService,
              autoCompleteObjectUtil,
              autoCompleteService,
              blinkAutoCompleteService,
              blinkConstants,
              callosumTypes,
              dateUtil,
              DocumentLoader,
              events,
              eventTracker,
              FilterPanelController,
              filterTransformationUtil,
              filterUtil,
              jsonConstants,
              loadingIndicator,
              Logger,
              metadataService,
              perfEvents,
              PinboardAnswerComponent,
              pinboardMetadataService,
              pinboardMetadataUtil,
              PinboardPageConfig,
              PinboardViewState,
              QuestionModel,
              sageDataSourceService,
              strings,
              UserAction,
              util,
              VizContextAnswerComponent,
              workflowManagementService) {
        var _logger = Logger.create('pinboard-page-controller');
        $scope.strings = strings;
        function showLoadingIndicator(loadingText) {
            loadingText = loadingText || 'Loading';
            loadingIndicator.show({
                loadingText: loadingText,
                showInstantly: true
            });
        }

        function hideLoadingIndicator() {
            loadingIndicator.hide();
        }

        function getSourceTableFromVizColumn(vizColumn) {
            var sourceIds = vizColumn.getReferencedTableIds();
            if (sourceIds.length != 1) {
                _logger.error('expect referencedTableIds to only be one for pb filter scenario.');
                return null;
            }
            return sourceIds[0];
        }

        function hasVizBeenModified(newVizModel, oldVizModel) {
            if (!oldVizModel) {
                return true;
            }
            if (oldVizModel.isCorrupted() != newVizModel.isCorrupted()) {
                return true;
            }

            var referencedViz = oldVizModel.getReferencedVisualization();
            if (!!referencedViz && referencedViz.didDataLoadFail()) {
                return true;
            }

            if (oldVizModel.isOlderComparedTo(newVizModel)) {
                return true;
            }
            return false;
        }

        var pinboardModel;
        var isMissingUnderlyingAccess;
        var isReadOnly;
        var filterModels = [];
        var vizIdToOriginalQuestionMap;
        var vizIdToEffectiveQuestionMap;
        var activeSourceId;
        var answerModelToRemove;
    // NOTE: In the case where user adds a new filter from left panel. We create a
    // answer model with that filter and update the sourceIdToAnswerModelMap. Now if
    // that filter is removed without adding any values we want to revert back to the
    // old answer model.
    // To achieve that we create a bound instance of setAnswerModelForSourceId with
    // the old answermodel and source id and execute in case of removal.
        var restoreAnswerModelOnEmptyFilterRemoval;

        var vizIdToAccessibleTablesMap = {};
        var sourceIdToAnswerModelMap = {};
        var sourceIdToFilterModelsMap = {};

        function resetFiltersState() {
            filterModels = [];
            vizIdToAccessibleTablesMap = {};
            sourceIdToAnswerModelMap = {};
            sourceIdToFilterModelsMap = {};
        }

        function setAnswerModelForSourceId(sourceId, answerModel) {
            sourceIdToAnswerModelMap[sourceId] = answerModel;
        }

    /**
     * Clones the current pinboard model and stitches the underlying answer model's selected visualization
     * into the clone.
     *
     * @param finalUnderlyingAnswerModel
     * @param pbVizId
     * @returns {*}
     */
        function stitchSelectedVizInPinboardClone(pinboardModelClone,
                                              finalUnderlyingAnswerModel,
                                              pbVizId,
                                              vizId,
                                              type) {
        // SCAL-8087 : In pinboards, a saved table cannot be edited to be displayed as a chart
        // Viz context controller captures the event when an underlying answer is changed. This is needed as the id
        // of the viz that the pinboard needs to refer can change.
        // Example 1 : user pinned a chart to a pinboard and while editing the underlying answer user navigated to the
        // table view and save the answer. In that case the pinboard needs update as the save call only updated the
        // saved answer backing that pinboard.
        // Example 2 : User pinned a chart, while modifying the underlying answer entered a query that didnt support
        // chart and then chart appeared again. In that case the viz id for the chart in the saved answer is changed and
        // the pinboard needs to update.
            var answerSheet = finalUnderlyingAnswerModel.getCurrentAnswerSheet();
            var selectionMode = answerSheet.getVizSelectionAnswerMode();
            var metadataJson = pinboardModelClone.getMetadataJson();

            var visualizations = metadataJson[jsonConstants.REPORT_BOOK_CONTENT_KEY][jsonConstants.SHEETS_KEY][0]
            [jsonConstants.SHEETCONTENT_KEY][jsonConstants.VISUALIZATIONS_KEY];

            if (selectionMode != util.answerDisplayModes.CHART && selectionMode != util.answerDisplayModes.TABLE) {
                selectionMode = util.answerDisplayModes.CHART;
            }

            var newViz;
            if(type === jsonConstants.VIZ_TYPE_HEADLINE.toUpperCase()) {
                var candidateViz = answerSheet.getVisualization(vizId);
                if (!!candidateViz && candidateViz.getVizType() === type) {
                    newViz = candidateViz;
                }
            } else {
                if (selectionMode == util.answerDisplayModes.CHART) {
                    var chartModelsMap = answerSheet.getVisualizationsOfType('CHART');
                    if (!!chartModelsMap && Object.keys(chartModelsMap).length > 0) {
                        newViz = chartModelsMap[Object.keys(chartModelsMap)[0]];
                    } else {
                        newViz = answerSheet.getTableVisualizations()[0];
                    }
                } else if (selectionMode == util.answerDisplayModes.TABLE) {
                    newViz = answerSheet.getTableVisualizations()[0];
                }
            }

            var answerSheetId = answerSheet.getId();
            var visualization = visualizations.find(function (visualization) {
                var vizContent = visualization[jsonConstants.VIZ_CONTENT_KEY];
            // NOTE: In case of generic viz they don't have any backing answersheet.
                var vizRefAnswerSheet = vizContent[jsonConstants.REF_ANSWER_SHEET_KEY];
                var isGenericViz = !vizRefAnswerSheet;
                return !isGenericViz &&
                vizRefAnswerSheet[jsonConstants.ID_KEY] == answerSheetId;
            });

            var vizContent = visualization[jsonConstants.VIZ_CONTENT_KEY];
            var vizRefAnswerSheet = vizContent[jsonConstants.REF_ANSWER_SHEET_KEY];
        // We delete the effective question as there is a possibility that we end up in
        // inconsistent state.
            delete vizContent[jsonConstants.EFFECTIVE_QUESTION_KEY];
            var oldVizId = visualization[jsonConstants.VIZ_CONTENT_KEY][jsonConstants.REF_VIZ_ID_KEY];
            visualization[jsonConstants.VIZ_CONTENT_KEY][jsonConstants.REF_VIZ_ID_KEY] = newViz.getId();
            vizRefAnswerSheet[jsonConstants.REF_ANSWER_SHEET_QUESTION_KEY] =
            answerSheet.getJson()[jsonConstants.SHEETCONTENT_KEY][jsonConstants.QUESTION_KEY];
            pinboardModelClone.replaceVizInObjectResolver(oldVizId, newViz);

            return pinboardModelClone;
        }

        // Upon pinboard model from viz context, the affected visualization is stitched
        // into the pinboard and the pinboard is saved.
        // Caveat: If in viz context viz could be pinned to the same pinboard, thus updated
        // pinboard model is used from the context.
        // Stitching currently clears visualization data for all vizs, so data and
        // render state is reused from the previous pinboard, except for the viz
        // for which the viz context update came, for that viz render state and data is cleared.
        function onPinboardUpdatedFromVizContext(pbVizId,
                                                 finalPinboardModel,
                                                 finalUnderlyingAnswerModel) {
            var pinboardModelClone = finalPinboardModel.clone();

            var vizId = $scope.contextOptions.vizId;
            var type = $scope.contextOptions.type;

            pinboardModel = stitchSelectedVizInPinboardClone(
                pinboardModelClone,
                finalUnderlyingAnswerModel,
                pbVizId,
                vizId,
                type
            );

            reusePinboardData($scope.metadataConfig.model, pinboardModel);
            reuseRenderReadyState($scope.metadataConfig.model, pinboardModel);
            pinboardModel.getCurrentAnswerSheet().clearDataForViz(pbVizId);
            var pbViz = pinboardModel.getCurrentAnswerSheet().getVisualization(pbVizId);
            pbViz.getReferencedVisualization().setRenderReady(false);
            pbViz.getReferencedVisualization().setSecondaryRenderReady(false);

            var answerSheet = pinboardModel.getCurrentAnswerSheet();
            var pinboardViz = answerSheet.getVisualization(pbVizId);

            vizIdToOriginalQuestionMap[pbVizId] = pinboardViz.getOriginalQuestion();
            vizIdToEffectiveQuestionMap[pbVizId] = null;

            populateSources()
            .then(populateAccessibleTables.bind(undefined, [pbVizId]))
            .then(upgradeEffectiveQuestions.bind(void 0, [pbVizId]))
            .then(savePinboard)
            .finally(function() {
                $scope.$broadcast(events.DOCUMENT_SAVED, pinboardModel);
            });
        }

        function handleFilterOpenRequest(logicalColumn, params) {
            workflowManagementService.terminateWorkflow();
            params = params || {};
            var aggr = params.aggr || sage.AggregationType.NONE;
            var onOpenComplete = params.onOpenComplete || angular.noop;
            var onOpenFailed = params.onOpenFailed || angular.noop;

            var matchingFilterModel = filterUtil.findMatchingFilterModel(
            logicalColumn,
            aggr,
            filterModels
        );

            if (!!matchingFilterModel) {
                activeSourceId = getSourceTableFromVizColumn(matchingFilterModel.getColumn());
                var filterId = matchingFilterModel.getId();
                $scope.metadataConfig.filterPanelController.showFilter(filterId);
                onOpenComplete();
            } else {
                addNewFilter(logicalColumn, aggr)
                .then(onOpenComplete, onOpenFailed);
            }
        }

        function saveOnServer() {
            return pinboardMetadataService.savePinboard(
            pinboardModel,
            vizIdToEffectiveQuestionMap,
            sourceIdToAnswerModelMap
        );
        }

    // SaveOverride is called by the sharable-item-controller on save button click/navigation away trigger.
    // It is supposed to return the promise resolving the raw json contents of the call. However, pinboard-page
    // also needs some processing on on saved Pinboard model formed from the response. So, we apply an additional
    // then on the same saveOnServer promise that is passed to the sharable-item controller.
        function saveOverride() {
            var saveOnServerPromise = saveOnServer();
            saveOnServerPromise
            .then(processSaveResponse);
            return saveOnServerPromise;
        }

    // Processing of save response involves -
    // 1. Creating a PinboardModel.
    // 2. Fixing pivot table viz (pinboardMetadataUtil processResponse does that).
    // 3. Updating local effectiveQuestions map
    // 4. Mark createdOnServer on the pinboard answers to denote that they have been saved on the server
    //    so that the server does not try to save it again in case we try to save it again.
    //
    // Also note that this function involves not network updates (except if needed in pivot viz fixing)
        function processSaveResponse(json) {
            var response = pinboardMetadataUtil.processResponse(json);
            var newPinboardModel = response.data;
            vizIdToEffectiveQuestionMap = newPinboardModel.getVizIdToEffectiveQuestionMap();
            Object.values(sourceIdToAnswerModelMap).forEach(function(answerModel) {
                answerModel.setCreatedOnServer();
            });
            reusePinboardData(pinboardModel, newPinboardModel);
            reuseRenderReadyState(pinboardModel, newPinboardModel);
            $scope.metadataConfig.model = pinboardModel = newPinboardModel;
            $scope.metadataConfig.pinboardAnswerController.render(newPinboardModel);
            return pinboardModel;
        }

        function savePinboard() {
            return saveOnServer()
            .then(processSaveResponse);
        }

        function savePinboardAs (name, description) {
            return pinboardMetadataService.saveAsPinboard(pinboardModel, vizIdToEffectiveQuestionMap,
            sourceIdToAnswerModelMap, name, description);
        }

        $scope.pinboardPageConfig = $scope.pinboardPageConfig || new PinboardPageConfig({});
        if ($scope.isInsightsPinboard) {
            $scope.pinboardPageConfig.isAutoCreated = true;
        }
        var pinboardAnswerController = new PinboardAnswerComponent($scope.pinboardPageConfig);

        $scope.metadataConfig = {
            documentType: blinkConstants.PINBOARD_TYPE,
            actionsMenuType: 'standard',
            canChangeLayout: true,
            model: null,
            hideTitle: !$scope.isInsightsPinboard,
            sageDataSourcesConfig: {
                sources: []
            },
            columnPanelComponentConfig: {
                displayAnswerFormula: false,
                showCheckMarks: false,
                disallowColumnAddition: true,
                disallowColumnSelection: true,
                noSourcesPlaceholderString: strings.pinboardFilter.NO_SOURCES_PLACEHOLDER,
                onColumnDblClick: handleFilterOpenRequest
            },
            leftPanelConfig: {
                title: strings.pinboardFilter.ADD_FILTER,
                hidePanelOnHeaderClick: true
            },
            ribbonConfig: {
                ribbonUrl: 'src/modules/pinboard/pinboard-ribbon.html',
                showRibbon: false
            },
            hidePanel: !!$scope.hidePanel,
            pinboardPageConfig: $scope.pinboardPageConfig,
            pinboardAnswerController: pinboardAnswerController,
            saveOverride: saveOverride,
            saveAsOverride: savePinboardAs,
            strings: strings.pinboardPage,
            isInsightsPinboard: $scope.isInsightsPinboard
        };

        function populateAccessibleTables(vizIds) {
            var accessibleTableRequests = vizIds.map(function(vizId){
                var question = vizIdToOriginalQuestionMap[vizId];
                return {
                    queryContext: question[jsonConstants.SAGE_CONTEXT_PROTO_KEY],
                    index: question[jsonConstants.SAGE_CONTEXT_INDEX_KEY]
                };
            });

            return autoCompleteService.batchGetAccessibleTables(accessibleTableRequests)
            .then(function(sageResponse) {
                var batchResponse = sageResponse.answerResponse;

                batchResponse.getResponse().forEach(function(response, index) {
                    var resp = response.getGetAccessibleTables();
                    var tables = resp.getTable();

                    var vizId = vizIds[index];
                    vizIdToAccessibleTablesMap[vizId] = util.mapArrayToBooleanHash(tables);
                });
            });
        }

        function populateSources () {
            if (!pinboardModel || isMissingUnderlyingAccess) {
                return $q.when();
            }
            var sources = pinboardModel.getUsedSources();
            return sageDataSourceService.getSourcesModels(sources)
            .then(function(sourceModels){
                var worksheetSourceIds = [];

                util.iterateObject(sourceModels, function(id, sourceModel) {
                    if (sourceModel && (sourceModel.getMetadataSubType()
                        === jsonConstants.metadataType.subType.WORKSHEET)) {
                        worksheetSourceIds.push(id);
                    }
                });

                var currentSourceCount = $scope.metadataConfig.sageDataSourcesConfig.sources.length;
                $scope.metadataConfig.sageDataSourcesConfig.sources.splice(0, currentSourceCount);

                Array.prototype.push.apply(
                    $scope.metadataConfig.sageDataSourcesConfig.sources,
                    worksheetSourceIds
                );
            });
        }

        function findNewVisualizationAffectedByPBFilters(vizIds) {
            var containsFilter = pinboardModel.containsFilter();
            if (containsFilter) {
                return vizIds.filter(function (vizId) {
                    var missingEffectiveQuestion = !vizIdToEffectiveQuestionMap[vizId];
                    if (!missingEffectiveQuestion) {
                        return false;
                    }
                    var answerSheet = pinboardModel.getCurrentAnswerSheet();
                    var filterSources = answerSheet.getFilterDataSources();
                    var accessibleTables = vizIdToAccessibleTablesMap[vizId];
                    var hasReachableFilter = filterSources.any(function (source) {
                        return accessibleTables[source];
                    });
                    return hasReachableFilter;
                });
            } else {
                return [];
            }
        }

        function upgradeEffectiveQuestions(vizIds) {
            var vizIdsToFix = findNewVisualizationAffectedByPBFilters(vizIds);
            if (vizIdsToFix.length) {
                var transformVizs = transformVisualizationsToBeFixed.bind(undefined, vizIdsToFix);
                return transformVizs();
            } else {
                return $q.resolve();
            }
        }

    // TODO(Rahul): Need to investigate on why pinboard viz modified timestamp is changed in saves on pinboard.
    // if that is fixed, this function can be used to save reportbook calls.
        function reusePinboardData(oldPinboardModel, newPinboardModel) {
            if (!newPinboardModel || !oldPinboardModel) {
                return;
            }
            var oldAnswerSheet = oldPinboardModel.getCurrentAnswerSheet();
            var newAnswerSheet = newPinboardModel.getCurrentAnswerSheet();
            newAnswerSheet.updateVizData(oldAnswerSheet.getSheetData());
        }

        function reuseRenderReadyState(oldPinboardModel, newPinboardModel) {
            if (!newPinboardModel || !oldPinboardModel) {
                return;
            }
            var oldAnswerSheet = oldPinboardModel.getCurrentAnswerSheet();
            var newAnswerSheet = newPinboardModel.getCurrentAnswerSheet();
            var oldVisualizations = oldAnswerSheet.getVisualizations();
            var newVisualizations = newAnswerSheet.getVisualizations();
            _.forIn(oldVisualizations, function(viz, id) {
                var matchingNewViz = newVisualizations[id];
                if (!!matchingNewViz) {
                    matchingNewViz.getReferencedVisualization().setRenderReady(
                        viz.getReferencedVisualization().isRenderReady()
                    );
                    matchingNewViz.getReferencedVisualization().setSecondaryRenderReady(
                        viz.getReferencedVisualization().isSecondaryRenderReady()
                    );
                }
            })
        }

    /**
     * Reinitializes the Controller state, on model reload.
     *
     * @param newModel
     * @param lastModel
     */
        function onModelUpdateSuccess(newModel, lastModel) {
            $scope.onModelUpdateSuccess({
                newModel: newModel,
                oldModel: lastModel
            });

            if (!newModel) {
                return;
            }

            pinboardModel = newModel;

            var permission = pinboardModel.getPermission();
            isReadOnly = permission.isReadOnly();
            resetFiltersState();
            isMissingUnderlyingAccess = permission.isMissingUnderlyingAccess();
            vizIdToOriginalQuestionMap = pinboardModel.getVizIdToQuestionMap(
                $scope.pinboardPageConfig.vizIdsToShow
            );
            vizIdToEffectiveQuestionMap = pinboardModel.getVizIdToEffectiveQuestionMap();
            var vizIds = Object.keys(vizIdToOriginalQuestionMap);

        // NOTE: We set the model in metadataConfig once it has been sanitized.
            populateSources()
            .then(populateAccessibleTables.bind(void 0, vizIds))
            .then(initFilterPanel)
            .then(function() {
                var vizIdsToFix = findNewVisualizationAffectedByPBFilters(vizIds);
                if (vizIdsToFix.length) {
                    var transformPromise = transformVisualizationsToBeFixed.bind(undefined, vizIdsToFix);
                    return transformPromise()
                        .then(savePinboard);
                } else {
                    return $q.resolve(newModel);
                }
            })
            .then(function(model) {
                if($scope.metadataConfig.model) {
                    reusePinboardData($scope.metadataConfig.model, model);
                    reuseRenderReadyState($scope.metadataConfig.model, model);
                }
                $scope.metadataConfig.model = model;
                if ($scope.isInsightsPinboard) {
                    $scope.metadataConfig.a3InsightsSummaryComponent =
                        new A3InsightsSummaryComponent(model);
                }
                $scope.metadataConfig.pinboardAnswerController.render(model);
            })
            .finally(function() {
                $scope.$broadcast(events.RELOAD_PINBOARD_D);
                hideLoadingIndicator();
            });
        }

        function onModelUpdateFailure(error) {
            hideLoadingIndicator();
            $scope.onModelUpdateFailure({
                error: error
            });
        }

        var documentLoader = new DocumentLoader(angular.noop, true);

        function showVizContext($evt, answerId, vizModel) {
            workflowManagementService.terminateWorkflow();
            $scope.$broadcast(events.SHOW_VIZ_CONTEXT_D);

            var contextOptions = _.isFunction(vizModel.getContextOptions)
                && vizModel.getContextOptions();

            contextOptions = contextOptions || {};
            contextOptions.isPinboardAnswerContext = true;
            contextOptions.type = vizModel.getVizType();
            contextOptions.vizId = vizModel.getId();
            var pbVizId = vizModel.getReferencingViz().getId();
            var vizName = vizModel.getTitle();
            $scope.vizContextAnswerComponent = new VizContextAnswerComponent(
                vizName,
                pinboardModel,
                answerId,
                pbVizId,
                clearVizContext,
                onPinboardUpdatedFromVizContext
            );
            $scope.contextOptions = contextOptions;
        }

    /**
     * Shows a dialog with the answer from which the viz originates
     *
     * @param {number} answerId     The id of the answer to display
     * @param {Object} vizModel     The model of the viz for which we're showing the viz context
     */
        $scope.$on(events.SHOW_VIZ_CONTEXT_U, showVizContext);

        $scope.$on(events.SHOW_VIZ_CONTEXT_USER_CONFIRMED_U, function($evt, pinboardModelModified, answerId, vizModel){
            showVizContext($evt, answerId, vizModel);
        });

        function clearVizContext() {
            $scope.vizContextAnswerComponent = null;
            $scope.$broadcast(events.HIDE_VIZ_CONTEXT_D);
        }

        $scope.$on('$routeChangeSuccess', function () {
            clearVizContext();
        });

        function reloadPinboard() {
        // 1. Find all visualizations in the current displayed pinboard and new pinboard.
        // 2. Compare current viz to new viz with same id.
        // 3. If at least one new viz is found by last modified time then reload is needed. We dont copy data for
        // vizs that are new.
        // 4. For all viz with same last modified copy over data from current viz to avoid extra data calls.
            var userAction = new UserAction(UserAction.FETCH_PINBOARD_DETAILS);
            var pinboardReloader = new DocumentLoader(angular.noop, true);
            return pinboardReloader.loadDocument(
            pinboardModel.getId(),
            jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            false
        );
        }

        $scope.$on(events.TILE_REMOVE_USER_CONFIRMED_U, function($evt, pinboardModelModified, vizModel){
            _logger.log(events.TILE_REMOVE_USER_CONFIRMED_U, vizModel, $scope.metadataConfig.model);

            var vizIdToRemove;
            if (!vizModel.getReferencingViz()) {
            // If no referencing viz is found, then the removed viz must be a corrupted pinboard viz itself.
                vizIdToRemove = vizModel.getId();
            } else {
                vizIdToRemove = vizModel.getReferencingViz().getId();
            }
            var userAction = new UserAction(UserAction.DELETE_VIZ_FROM_PINBOARD);
        // TODO: Can avoid reload on deleteVizFromPinboard
            pinboardMetadataService.deleteVizFromPinboard(vizIdToRemove, $scope.metadataConfig.model.getId())
            .then(function (response) {
                var newAnswerSheet = response.data;
                // On delete, we receive an updated answer sheet definition. In order to trigger the reflow of the
                // answer, we update the answerModel object.
                // The way we do this is to preserve the json backing the old answer data model and only modify the
                // sheet definition.
                var substitutions = [$scope.metadataConfig.model.getName()];
                alertService.showUserActionSuccessAlert(userAction, response, {substitutions: substitutions});
                reloadPinboard()
                    .then(onModelUpdateSuccess, onModelUpdateFailure);
            }, function (response) {
                var substitutions = [$scope.metadataConfig.model.getName()];
                alertService.showUserActionFailureAlert(userAction, response, {substitutions: substitutions});
                loadingIndicator.hide();
            });
        // Just started a callosum fetch and due to the repainting on load, the user needs a feedback.
            showLoadingIndicator();
        });

        function clearDataForViz(answerSheet, vizId) {
            answerSheet.clearDataForViz(vizId);
        }

        function clearDataForAllVizs() {
            var currentAnswerSheet = pinboardModel.getCurrentAnswerSheet();
            var vizs = currentAnswerSheet.getVisualizations();
            _.forOwn(vizs, function(value, key) {
                clearDataForViz(currentAnswerSheet, key);
            });
        }

        function clearRenderReadyForAllVizs() {
            var currentAnswerSheet = pinboardModel.getCurrentAnswerSheet();
            var vizs = currentAnswerSheet.getVisualizations();
            _.forOwn(vizs, function(value, key) {
                value.getReferencedVisualization().setRenderReady(false);
                value.getReferencedVisualization().setSecondaryRenderReady(false);
            });
        }

        $scope.$watch(function() {
            return $scope.dontWatchUrl ? 0 : $route.current.params.snapshotId;
        }, function(newSnapshotId){
            var pinboardId = $route.current.params.pinboardId;
            var oldSnapshotId = $scope.pinboardPageConfig.snapshotId;
            if (!newSnapshotId) {
            // if we navigated from valid snapshot to pinboard (no snapshot)
            //   then erase snapshot info and load base pinboard
                if (!!oldSnapshotId && !!pinboardId) {
                    $scope.pinboardPageConfig.snapshotId = null;
                    clearDataForAllVizs();
                    clearRenderReadyForAllVizs();
                    onLoadPinboard(pinboardId);
                }
                return;
            }
            $scope.pinboardPageConfig.snapshotId = newSnapshotId;
            isReadOnly = true;
            if (!!pinboardModel) {
                clearDataForAllVizs();
                clearRenderReadyForAllVizs();
            }
            onLoadPinboard(pinboardId);
        });

        $scope.$watch(function() {
            return $scope.dontWatchUrl ? $scope.id : $route.current.params.pinboardId;
        }, function(newDocId){
        // Note(sunny): This reset the flag used by foolscap to indicate
        // that the page loading is in progress.
            if (!window.bkAutomation) {
                window.bkAutomation = {};
            }
            window.bkAutomation.isPageLoaded = false;

        // if pinboard id is empty, or snapshot is specified then return
            if (!newDocId || !!($route.current.params.snapshotId)) {
                return;
            }
            onLoadPinboard(newDocId);
        });

        function onLoadPinboard(pinboardId) {
            $scope.pinboardLoadingTracker = eventTracker.trackEvent(
            perfEvents.PINBOARD_RENDERED,
                {
                    guid: pinboardId
                }
        );
            showLoadingIndicator();
            documentLoader.loadDocument(
            pinboardId,
            jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            true
        ).then(
            onModelUpdateSuccess,
            onModelUpdateFailure
        );
        }

    // TODO(jasmeet): refactor this to avoid using events
        $scope.$on(events.PINBOARD_RENDERED, function () {
        // Note(sunny): This tells foolscap that the pinboard
        // page is done loading
            if (!window.bkAutomation) {
                window.bkAutomation = {};
            }
            window.bkAutomation.isPageLoaded = true;

            // This is added to enable phantomJS to take screenshots of pinboards.
            // A screenshot is taken whenever this callback is called.
            if(_.isFunction(window.callPhantom)) {
                setTimeout(function() {
                    window.callPhantom('takeShot');
                }, 300);
            }

            if (!!$scope.pinboardLoadingTracker &&
            !$scope.pinboardLoadingTracker.isFinished()) {
                $scope.pinboardLoadingTracker.finish();
                $scope.pinboardLoadingTracker = null;
            }
        });

        $scope.$on(events.OPEN_FILTER_PANEL, function ($evt, params, onFilterOpenedCallback) {
            var handlerParams = {
                onOpenComplete: onFilterOpenedCallback,
                onOpenFailed: onFilterOpenedCallback
            };

            handleFilterOpenRequest(params.column, handlerParams);
        });

        function addNewFilter(logicalColumn, aggr) {
            var filterOperator;
            if (logicalColumn.isDateColumn()) {
                filterOperator = sage.CompareType.GE;
            }

            var filterTransformations = filterUtil.getFilterTokensByTransform(
                null,
                logicalColumn,
                null,
                aggr,
                filterOperator,
                true /* addWildcards */
            );

            filterTransformations.push(
                sage.QueryTransform.createAddColumnTransformation({
                    columnGuid: logicalColumn.getGuid(),
                    aggregation: aggr
                })
            );

            var sourceId = logicalColumn.getSourceId();
            activeSourceId = sourceId;
            var reusableAnswerModel = sourceIdToAnswerModelMap[sourceId];

            restoreAnswerModelOnEmptyFilterRemoval = setAnswerModelForSourceId.bind(
                void 0,
                activeSourceId,
                reusableAnswerModel
            );

            function transformEmptyTable(sageResponse){
                var answerResponse =  sageResponse.answerResponse;
                var emptyTableACContext = answerResponse.getContext();
                return autoCompleteService.transformTable(emptyTableACContext, 0, filterTransformations);
            }

            function transformTable() {
                var sageContext = reusableAnswerModel.getSageContext();
                return autoCompleteService.transformTable(sageContext, 0, filterTransformations);
            }

            function createFilterAnswerModel(sageResponse){
                var answerResponse =  sageResponse.answerResponse;
                var questionParams = {};
                questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = answerResponse.getContext();
                questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = 0;
                var params = {
                    requestType: callosumTypes.RequestTypes.PINBOARD_FILTER
                };
                return answerService.getAnswer(questionParams, params);
            }

            function updateFilterAnswerModel(sageResponse){
                var answerResponse = sageResponse.answerResponse;
                var questionParams = {};
                questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = answerResponse.getContext();
                questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = 0;
                var params = {
                    answerModel: reusableAnswerModel,
                    requestType: callosumTypes.RequestTypes.PINBOARD_FILTER
                };
                return answerService.getAnswer(questionParams, params);
            }

            function onAnswerModelFetch(response){
                var answerModel = response.data;
                updateFilterPanelFromFilterAnswer(answerModel);
                updateFilterController();
                var matchingFilterModel =
                    filterUtil.findMatchingFilterModel(logicalColumn, aggr, filterModels);

                $scope.metadataConfig.filterPanelController.showFilter(matchingFilterModel.getId());
            }

            // Add new filter flow.
            // Case 1: already a filter answer model.
            // Case 2: No filter answer model.
            // 1. Ensure answer model exists.
            // a. Create new context
            // b. Add table
            // 2. Add this filter to answer
            // a. transform table
            // b. Get a answer model.
            // 3. Trigger Join filter to vizs flow.
            // a. Find all visualizations that need to transform.
            // b. Add transform on each of them and store in a map join path choice.
            // 4. Update filter panel.
            // 5. Show the latest filter.
            if (!reusableAnswerModel) {
                var emptyACContext = autoCompleteObjectUtil.getNewACContext();
                var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                return autoCompleteService.addTable(emptyACContext, tableRequest)
                .then(transformEmptyTable)
                .then(createFilterAnswerModel)
                .then(onAnswerModelFetch);
            } else {
                return transformTable()
                .then(updateFilterAnswerModel)
                .then(onAnswerModelFetch);
            }
        }

        function updateAnswer(answerModel, sageResponse){
            var answerResponse = sageResponse.answerResponse;
            var questionParams = {};
            questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = answerResponse.getContext();
            questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = 0;

            var table = answerResponse.getContext().getTables()[0];
            var query = table.getQuery();

            if (!query) {
                answerModelToRemove = sourceIdToAnswerModelMap[activeSourceId];
                delete sourceIdToAnswerModelMap[activeSourceId];
                delete sourceIdToFilterModelsMap[activeSourceId];
                filterModels = Object.values(sourceIdToFilterModelsMap).flatten();
                updateFilterController();
                return $q.when();
            }

            var params = {
                answerModel: answerModel,
                requestType: callosumTypes.RequestTypes.PINBOARD_FILTER
            };

            return answerService.getAnswer(questionParams, params)
            .then(function(response){
                var newAnswer = response.data;
                updateFilterPanelFromFilterAnswer(newAnswer);
                updateFilterController();
                return newAnswer;
            });
        }

        function transformAnswerModel(answerModel, transformations){
            var sageContext = answerModel.getSageContext();
            var index = answerModel.getSageContextIndex();
            var updateAnswerModel = updateAnswer.bind(undefined, answerModel);

            return autoCompleteService.transformTable(sageContext, index, transformations)
            .then(updateAnswerModel);
        }

        function getTransformRequest(vizId, transformations, filterModels){
            filterModels.forEach(function(filterModel, index){
                var filterColumn = filterModel.getColumn();
                var filterColumnGuid = filterColumn.getBaseLogicalColumnGuid();
                var filterColumnAggr = filterColumn.getEffectiveAggregateType();
                var sageAggr = sage.AggregationType[filterColumnAggr];

                var filterTransforms = transformations[index];
                filterTransforms.forEach(function(transformation){
                    transformation.setTokenOutputGuid(null);
                    transformation.setColumnGuid(filterColumnGuid);
                    transformation.setAggregation(sageAggr);
                });
            });
            var netTransformations = transformations.flatten();
            var originalQuestion = vizIdToOriginalQuestionMap[vizId];

            var allVisualizations = pinboardModel.getCurrentAnswerSheet().getVisualizations();
            var pinboardViz = allVisualizations[vizId];
            var referencedViz = pinboardViz.getReferencedVisualization();
            var allColumns = referencedViz.getVizColumns();
            var lockDateBucketizationTransfromations = allColumns
            .filter(function(column){
                return column.isDateColumn();
            })
            .reduce(function(transformations, column){
                var sageOutputColumnGuid = column.getSageOutputColumnId();
                var timeBucket = column.getTimeBucket();
                var lockBucketization = sage.QueryTransform.createAddTimeBucketTransformation({
                    tokenOutputGuid: sageOutputColumnGuid,
                    timeBucket: dateUtil.timeBucketValueToSageValue[timeBucket]
                });
                transformations.unshift(lockBucketization);
                var removeBucketization = sage.QueryTransform.createRemoveTimeBucketTransformation({
                    tokenOutputGuid: sageOutputColumnGuid
                });
                transformations.unshift(removeBucketization);
                return transformations;
            }, []);

            Array.prototype.push.apply(
            lockDateBucketizationTransfromations,
            netTransformations
        );

            return {
                queryContext: originalQuestion[jsonConstants.SAGE_CONTEXT_PROTO_KEY],
                index: originalQuestion[jsonConstants.SAGE_CONTEXT_INDEX_KEY],
                transformations: lockDateBucketizationTransfromations
            };
        }

        function getApplicableFilterModels(vizId) {
            var accessibleTables = vizIdToAccessibleTablesMap[vizId];

        // Find all filter models that can be applied to this viz.
            var applicableFilterModels = [];
            util.iterateObject(sourceIdToFilterModelsMap, function (sourceId, filterModels) {
                if (accessibleTables[sourceId]) {
                    Array.prototype.push.apply(applicableFilterModels, filterModels);
                }
            });
            return applicableFilterModels;
        }

        function transformVisualizations(vizIds) {
            var transformationVizIds = vizIds.filter(function(vizId){
                var applicableFilterModels = getApplicableFilterModels(vizId);

            // In case there is no applicable filter on the visualization we should remove
            // the effective question.
                if (applicableFilterModels.length === 0) {
                    vizIdToEffectiveQuestionMap[vizId] = null;
                    var allVisualizations = pinboardModel.getCurrentAnswerSheet().getVisualizations();
                    var pinboardViz = allVisualizations[vizId];
                // We reset to orginal question to cover both cases: If the saved state has filters
                // then the override will show original answer instead of effective. And in case
                // there are no saved filters even then this will work.
                    pinboardViz.setOverrideQuestion(pinboardViz.getOriginalQuestion());
                    return false;
                }
                return true;
            });

            var transformRequests = transformationVizIds.map(function(vizId) {
                var applicableFilterModels = getApplicableFilterModels(vizId);

                var filterTransformations =
                filterTransformationUtil.getAllFilterTransformations(applicableFilterModels);

            // SCAL-13713: Ideally we would want to do AND condition between filter from
            // viz and filter from pinboard. Eg. Pinned query revenue region = asia
            // now when a filter on region is added as africa. We have 2 reasonable choices
            // 1. Run effective query revenue region = asia AND region = africa, this seems
            // like most natural interpretation but it is quite likely to yield a no data
            // result and reflects maybe thats not what user intends.
            // 2. Run effective query revenue region = africa. This seems to capture the user
            // intent better so we are going with this.
            // To achive this we are going to make a remove all filter on column from the
            // viz and then add the filters from pinboard.

                applicableFilterModels.forEach(function(fM, index) {
                    var filterColumn = fM.getColumn();
                    var filterColumnGuid = filterColumn.getBaseLogicalColumnGuid();
                    var filterColumnAggr = filterColumn.getEffectiveAggregateType();
                    var sageAggr = sage.AggregationType[filterColumnAggr];
                    var removeFilterTransformation =
                    sage.QueryTransform.createRemoveAllFilterTransformation({});

                    removeFilterTransformation.setTokenOutputGuid(null);
                    removeFilterTransformation.setColumnGuid(filterColumnGuid);
                    removeFilterTransformation.setAggregation(sageAggr);

                    filterTransformations[index].unshift(removeFilterTransformation);
                });

                return getTransformRequest(
                vizId,
                filterTransformations,
                applicableFilterModels
            );
            });

            return autoCompleteService.batchTransform(transformRequests)
                .then(function(sageResponse) {
                    var batchResponse = sageResponse.answerResponse;

                    batchResponse.getResponse().forEach(function(response, index) {
                        var answerResponse = response.getAnswer();

                        var vizId = transformationVizIds[index];
                        var originalQuestion = vizIdToOriginalQuestionMap[vizId];

                        var overrideQuestion = new QuestionModel();
                        overrideQuestion.setContext(answerResponse.getContext());
                        overrideQuestion.setContextIndex(originalQuestion.getContextIndex());
                        vizIdToEffectiveQuestionMap[vizId] = overrideQuestion;
                        var allVisualizations = pinboardModel.getCurrentAnswerSheet().getVisualizations();
                        allVisualizations[vizId].setOverrideQuestion(overrideQuestion);
                    });
                })
                .then(function(){
                    return vizIds;
                });
        }

        function transformVisualizationsToBeFixed(vizIds) {
            if (!vizIds || !vizIds.length) {
                _logger.error('No viz id passed to fix.');
                return $q.reject();
            }

            return transformVisualizations(vizIds);
        }

        function transformVisualizationsOnFilterChange() {
            if (!activeSourceId) {
                _logger.error('No active source Id set');
                return $q.reject();
            }

            var allVisualizationIds = Object.keys(vizIdToOriginalQuestionMap);
            var vizIdsToBeUpdated = allVisualizationIds.filter(function(vizId){
                var accessibleTables = vizIdToAccessibleTablesMap[vizId];
                return !!accessibleTables[activeSourceId];
            });

            return transformVisualizations(vizIdsToBeUpdated);
        }

        function requestPinboardDataUpdate(vizIds) {
            $scope.$broadcast(events.PINBOARD_VISUALIZATION_QUERY_CHANGED_D, vizIds);
            return $q.resolve();
        }

        function onFilterDone(queryTransformations, filterModel) {
            workflowManagementService.terminateWorkflow();
            pinboardModel.setHasUserTriggeredChanges(true);

            showLoadingIndicator();
            activeSourceId = getSourceTableFromVizColumn(filterModel.getColumn());

            var answerModel = filterModel.getContainingAnswerModel();

            transformAnswerModel(answerModel, queryTransformations)
            .then(transformVisualizationsOnFilterChange)
            .then(requestPinboardDataUpdate)
            .finally(hideLoadingIndicator);
        }

        function updateFilterController() {
            var isFilterPanelReadOnly = isMissingUnderlyingAccess;

            $scope.metadataConfig.filterPanelController = new FilterPanelController(
            filterModels,
            isFilterPanelReadOnly,
            onFilterRemoval,
            onFilterDone);

            if (!!$scope.pinboardPageConfig.readOnlyFilters) {
                $scope.metadataConfig.filterPanelController.isReadOnly = true;
            }
            $scope.metadataConfig.hasFilters = filterModels.length > 0;
            $scope.metadataConfig.ribbonConfig.showRibbon =
                $scope.pinboardPageConfig.viewState == PinboardViewState.RELATED_LINK_STATE ||
                $scope.pinboardPageConfig.viewState == PinboardViewState.PRINT_STATE ||
                $scope.metadataConfig.hasFilters || $scope.isInsightsPinboard;
        }

        function updateFilterPanelFromFilterAnswer(answerModel) {
            if (!answerModel) {
                _logger.error('Update only supported with a valid answer model');
            }
            var answerSheet = answerModel.getCurrentAnswerSheet();
            var filters = answerSheet.getFilterVisualizations();
            var filter = filters[0];
            var filterColumn = filter.getColumn();

            var sourceId = getSourceTableFromVizColumn(filterColumn);
            sourceIdToAnswerModelMap[sourceId] = answerModel;

            sourceIdToFilterModelsMap[sourceId] = filters;
            filterModels = Object.values(sourceIdToFilterModelsMap).flatten();
        }

        function initFilterPanel () {
            var sheet = pinboardModel && pinboardModel.getCurrentAnswerSheet();
            var filterAnswerModelId = sheet && sheet.getFilterAnswerIds();

            if (!filterAnswerModelId.length) {
                updateFilterController();
                return $q.when();
            }

            var answerLoader = new DocumentLoader(_.noop, true);
            var answerLoadPromises = filterAnswerModelId.map(function(answerId){
                var loadAnswerPromise = answerLoader.loadDocument(
                answerId,
                jsonConstants.metadataType.QUESTION_ANSWER_BOOK,
                false
            );

                return loadAnswerPromise.then(updateFilterPanelFromFilterAnswer);
            });

            return util.getAggregatedPromise(answerLoadPromises)
            .then(updateFilterController);
        }

        var onFilterRemoval = function(filterModel) {
            workflowManagementService.terminateWorkflow();
            pinboardModel.setHasUserTriggeredChanges(true);
            showLoadingIndicator();
            activeSourceId = getSourceTableFromVizColumn(filterModel.getColumn());
            var answerModel = filterModel.getContainingAnswerModel();
            var queryTransforms = filterTransformationUtil.getFilterRemovalTransformations(filterModel);
            queryTransforms.push(
                sage.QueryTransform.createRemoveColumnTransformation({
                    columnGuid: filterModel.getColumn().getBaseLogicalColumnGuid(),
                    aggregation: filterModel.getColumn().getEffectiveAggregateType()
                })
            );
            transformAnswerModel(answerModel, queryTransforms)
            .then(transformVisualizationsOnFilterChange)
            .then(requestPinboardDataUpdate)
            .finally(hideLoadingIndicator);
        };

        $scope.$on(events.RELOAD_PINBOARD_DATA, function() {
            var allVisualizations = pinboardModel.getCurrentAnswerSheet().getVisualizations();
            var vizIds = Object.keys(allVisualizations);
            requestPinboardDataUpdate(vizIds);
        });

        $scope.$on(events.REFLOW_PINBOARD, function(){
            $scope.metadataConfig.pinboardAnswerController.reflow();
        });

        $scope.$on("$destroy", function() {
            loadingIndicator.hide();
        });

        // TEST HOOKS
        $scope.onPinboardUpdatedFromVizContext = onPinboardUpdatedFromVizContext;
        $scope.getCurrentPinboardModel = function () {
            return pinboardModel;
        };
        $scope.loadPinboardModel = onModelUpdateSuccess;
    }]);
