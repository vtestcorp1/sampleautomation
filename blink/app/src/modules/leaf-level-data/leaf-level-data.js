/**
 * Copyright: ThoughtSpot Inc. 2014-2015
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *         Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview
 * Controller and directive for showing leaf level data view.
 */

'use strict';

blink.app.controller('LeafLevelDataController', ['$scope',
    '$q',
    '$timeout',
    'alertService',
    'autoCompleteService',
    'answerService',
    'AddColumnsMenuComponent',
    'blinkConstants',
    'callosumTypes',
    'strings',
    'dataService',
    'jsonConstants',
    'Logger',
    'sageDataSourceService',
    'tableUtil',
    'UserAction',
    'util',
    function ($scope,
          $q,
          $timeout,
          alertService,
          autoCompleteService,
          answerService,
          AddColumnsMenuComponent,
          blinkConstants,
          callosumTypes,
          strings,
          dataService,
          jsonConstants,
          Logger,
          sageDataSourceService,
          tableUtil,
          UserAction,
          util) {
        var _logger = Logger.create('leaf-level-data-controller');

        var documentModel;
        sageDataSourceService.invalidateCache();

        $scope.showColumnMenu = false;

        $scope.onClickAddColumnsBtn = function () {
            this.showColumnMenu = !this.showColumnMenu;
        };

        $scope.onClickDownloadBtn = function () {
            if (!documentModel) {
                return;
            }

            var tableModel = documentModel.getCurrentAnswerSheet().getTableVisualizations()[0],
                tableId = tableModel.getId();

            var userAction = new UserAction(UserAction.FETCH_LEAF_LEVEL_DATA);
            dataService.downloadExcelFile(documentModel, tableId, null /*format*/, true/*leafLevel*/)
                .then(angular.noop, function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                });
        };

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

        function getTransformations() {
            var transformations = [];
            var colsToAddMap = $scope.addColumnsMenuComponent.getColumnsToAddMap();
            var colsToRemoveMap = $scope.addColumnsMenuComponent.getColumnsToRemoveMap();

            Object.values(colsToAddMap).each(function (colInfo) {
                transformations.push(sage.QueryTransform.createAddColumnTransformation({
                    columnGuid: colInfo.colId,
                    joinPath: colInfo.joinPath
                }));
            });

            Object.values(colsToRemoveMap).each(function (colInfo) {
                transformations.push(sage.QueryTransform.createRemoveColumnTransformation({
                    columnGuid: colInfo.colId,
                    joinPath: colInfo.joinPath
                }));
            });

            return transformations;
        }

        function updateTable(docModel) {
            _logger.info('starting updating table model');

            $scope.slickTableModelInfo = null;

            if (!docModel) {
                _logger.error('Found a null document model. Removing table from the view');
                return;
            }

            var tableModel = docModel.getCurrentAnswerSheet().getTableVisualizations()[0];
            if (!tableModel) {
                _logger.error('Found a document model with no table');
                return;
            }

            var slickTableModelInfo = tableModel.toSlickgridTableInfo();

            if (!slickTableModelInfo || !slickTableModelInfo.model) {
                _logger.error('no slick grid model found, doc id:', docModel.getId());
                return;
            }

            _logger.trace('init slick table model object', slickTableModelInfo);
            _logger.info('ending updating table model');

            // Currently blink-slick-grid-table does not handle change of table model. So we reinstantiate the directive again.
            // We have to do this in next event loop so that setting $scope.slickTableModelInfo to null and to slickTableModelInfo
            // happen in different angular scope cycles.
            util.executeInNextEventLoop(function () {
                $scope.slickTableModelInfo = slickTableModelInfo;
            });
        }

        $scope.confirmSelection = function () {
            var sageContext = documentModel.getSageContext(),
                sageContextIndex = documentModel.getSageContextIndex(),
                transformations = getTransformations();
            if (!transformations.length) {
                return;
            }

            var processAnswerResponse = function (sageResponse) {
                var answerResponse = sageResponse.answerResponse;

                var questionParams = {};
                questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = answerResponse.getContext();
                questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = sageContextIndex;

                var optionalParams = {
                    includeData: true,
                    leafData: true,
                    requestType: callosumTypes.RequestTypes.DATA_SHOW_UNDERLYING_VIZ
                };
                var userAction = new UserAction(UserAction.FETCH_ANSWER);
                return answerService.getAnswer(questionParams, optionalParams)
                    .then(function (response) {
                        return response.data;
                    }, function (response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        return $q.reject(response.data);
                    });
            };

            var processAnswerModel = function (answerModel) {
                documentModel = answerModel;
                updateTable(documentModel);
                $scope.addColumnsMenuComponent.clearChangesMap();
                $scope.showColumnMenu = false;
            };

            autoCompleteService.transformTable(sageContext, sageContextIndex, transformations)
                .then(processAnswerResponse)
                .then(processAnswerModel, function () {
                    _logger.error('Error updating the table');
                });
        };


        /**
         * Updates the summary information. For eg, adds formatted values.
         */
        function updateSummaryInfo() {
            var summaryInfo = $scope.getSummaryInfo();
            if (!summaryInfo) {
                return;
            }
            summaryInfo.each(function (colInfo) {
                colInfo.formattedValue = tableUtil.getFormattedValue(colInfo.column, colInfo.value, true);
            });
        }

        $scope.init = function () {
            documentModel = $scope.getInitDocumentModel();
            if (!documentModel) {
                _logger.error('Init called called without document model');
                _logger.debug($scope.getSummaryInfo());
                return;
            }

            _logger.info('Init row detail controller');
            _logger.debug('Initial row level info: summary, tokens, doc id', $scope.getSummaryInfo(),
                documentModel.getRecognizedTokens(), documentModel.getId());
            _logger.trace('init document model', documentModel);

            updateSummaryInfo();
            updateTable(documentModel);
            $scope.addColumnsMenuComponent = new AddColumnsMenuComponent(
                documentModel,
                $scope.confirmSelection);
        };
    }]);

blink.app.directive('leafLevelData', ['$timeout',
    'blinkConstants',
    'strings',
    'Logger',
    function ($timeout,
          blinkConstants,
          strings,
          Logger) {
        var _logger = Logger.create('leaf-level-data');

        var NUM_COLUMNS_PER_ROW = 3;

        var TOTAL_HEIGHT_CONFIRM_BTN = 40,
            // This is the sum of all y-spaces that is around add column menu.
            // This includes space takes by the tip of menu, etc.
            // This also includes margin of the content container
            TOTAL_EXTRA_VERTICAL_SPACE_ADD_COLUMN_MENU = 55,
            // This is the minimum height of the menu list (not the menu container element)
            MENU_CONTENT_MIN_HEIGHT = 45;

        function getCustomizationClass(summaryLength) {
            var numRows = Math.ceil(summaryLength / NUM_COLUMNS_PER_ROW);
            return 'num-rows-' + Math.min(numRows, 4);
        }

        function linker(scope, $el, attrs) {
            var summaryInfo = scope.getSummaryInfo(),
                summaryAbsent = false;
            if (!summaryInfo || !summaryInfo.length) {
                summaryAbsent = true;
            }

            scope.blinkConstants = blinkConstants;
            scope.strings = strings;

            scope.customizationClass = getCustomizationClass(summaryAbsent ? 0 : summaryInfo.length);

            scope.init();
        }

        return {
            restrict: 'E',
            replace: true,
            scope: {
                getInitDocumentModel: '&initDocumentModel',
                getSummaryInfo: '&summaryInfo'
            },
            link: linker,
            templateUrl: 'src/modules/leaf-level-data/leaf-level-data.html',
            controller: 'LeafLevelDataController'
        };
    }]);
