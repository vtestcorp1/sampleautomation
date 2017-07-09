/**
 * Copyright: ThoughtSpot Inc. 2014-2015
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *         Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview Controller to handle drilling in viz.
 */

'use strict';

blink.app.controller('MenuItemDrillController', ['$scope',
    '$q',
    '$rootScope',
    'autoCompleteObjectUtil',
    'blinkConstants',
    'strings',
    'vizContextMenuUtil',
    'events',
    'Logger',
    'SageTokenOptions',
    'util',
    function ($scope,
          $q,
          $rootScope,
          autoCompleteObjectUtil,
          blinkConstants,
          strings,
          vizContextMenuUtil,
          events,
          Logger,
          SageTokenOptions,
          util) {
        var _logger = Logger.create('drill-options-controller');

        var initDone = false;
        var initInProgress = false;
        var sageClient = $scope.contextMenuData.sageClient;
        var drillType = $scope.contextMenuData.type;
        var filterQueryTransformations = [];

        // For vizLevel type, we don't have to make column value transformations
        if (drillType !== strings.DRILL_TYPE_VIZ_LEVEL) {
            filterQueryTransformations = filterQueryTransformations.concat(
                vizContextMenuUtil.createQueryTransformations(
                    $scope.contextMenuData.columnValuePairs,
                    $scope.contextMenuData.unfilteredColumns,
                    {
                        includeColumnAggregations: true,
                        includeFilteredColumns: false,
                        answerModel: $scope.contextMenuData.documentModel
                    }));
        }

        // Append a 'by/for-each' keyword at the end to fetch attribute suggestions that user can
        // drill down by.
        filterQueryTransformations.push(sage.QueryTransform.createAddEmptyGroupByTransformation());

        var sageTokenOptions = new SageTokenOptions(
            sageClient,
            filterQueryTransformations,
            false /* do not show measures */);

        $scope.strings = strings;
        $scope.showDrillOptions = false;

        var DRILL_ITEM_MAX_TOKEN_LENGTH = 23,
            DRILL_ITEM_MAX_LINEAGE_LENGTH = 18,
            DRILL_OPTIONS_HEIGHT = 240,
            DRILL_SUB_MENU_ID = vizContextMenuUtil.VizContextMenuOptionType.DRILL;

        function getDropdownItemTooltipText(rtoken) {
            var tokenText = rtoken.getTokenText(),
                immediateLineage = rtoken.getImmediateLineage();
            //no need to show tooltip unless there is a truncation in either token text or lineage
            if (tokenText.length <= DRILL_ITEM_MAX_TOKEN_LENGTH
                && immediateLineage.length < DRILL_ITEM_MAX_LINEAGE_LENGTH) {
                return '';
            }
            return '{tokenText} ({lineage})'.assign({
                tokenText: tokenText,
                lineage: immediateLineage
            });
        }

        function getDrillDataCompletionFromToken(token) {
            var tokenText = util.truncate(token.getTokenText(), DRILL_ITEM_MAX_TOKEN_LENGTH),
                lineage = util.truncate(token.getImmediateLineage(), DRILL_ITEM_MAX_LINEAGE_LENGTH),
                tooltip = getDropdownItemTooltipText(token);
            return {
                tokenText: tokenText,
                lineage: lineage,
                tooltipText: tooltip,
                data: token
            };
        }

        function getDrillDataCompletionsFromTokens(searchedTokens) {
            return searchedTokens.map(function (rtoken) {
                return getDrillDataCompletionFromToken(rtoken);
            });
        }

        function expandOrCollapseDrillOptions(shouldExpand) {
            if (!$scope.contextSubMenuConfig || !$scope.contextSubMenuConfig.positionConfig) {
                _logger.error('invalid context menu position config');
                return;
            }

            if (!shouldExpand) {
                $scope.$emit(events.CONTEXT_MENU_RESET);
                return;
            }

            var expandUp = false;
            if ($scope.contextSubMenuConfig.positionConfig.spaceLeftBelow < DRILL_OPTIONS_HEIGHT) {
                expandUp = true;
            }

            $scope.$emit(events.EXPAND_AND_SET_ACTIVE_SUBMENU, DRILL_SUB_MENU_ID, expandUp);
        }

        $scope.toggleDrillOptions = function () {
            $scope.showDrillOptions = !$scope.showDrillOptions;

            if (drillType != strings.DRILL_TYPE_VIZ_LEVEL) {
                expandOrCollapseDrillOptions($scope.showDrillOptions);
            }

            if (initInProgress || initDone) {
                return;
            }

            // If we reach there, then it must be the case that we have never initialized the
            // items. We do it now.
            initInProgress = true;

            sageTokenOptions.getDrillableTokens()
                .then(function (tokenItems) {
                    $scope.items = getDrillDataCompletionsFromTokens(tokenItems);
                    initDone = true;
                })
                .finally(function() {
                    initInProgress = false;
                });
        };

        $scope.handleDrillSearch = function (searchText) {
            return sageTokenOptions.getSearchedTokens(searchText)
                .then(function(searchedTokens) {
                    $scope.items = getDrillDataCompletionsFromTokens(searchedTokens);
                }, function(err) {
                });
        };

        $scope.handleDrillCompletionClick = function (item) {
            if (!item || !item.data) {
                _logger.error('drill operation clicked on null item');
                return;
            }
            var tokens = sageTokenOptions.getOriginalTokens();
            tokens.push(item.data);

            // chart config should be unlocked on drill (SCAL-4718)
            $rootScope.$broadcast(events.UNLOCK_VIZ_CONFIG_D);

            var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
            tableRequest.setInputTokens(tokens);
            sageClient.editTable(tableRequest);

            $scope.close(vizContextMenuUtil.VizContextMenuOptionType.DRILL);
        };
    }]);
