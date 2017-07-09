/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Directive for data explorer.
 *
 * Directive Attributes:
 *   data: List of data items,
 *   selectedTableId: the initially selected item id,
 *   hideTableList: Whether to hide the list displaying table names,
 *   mode: which mode to open in, possible values are:
 *      PropView, DataView, RelationshipView
 */

'use strict';

blink.app.directive('blinkDataExplorer', ['angularUtil',
    function (angularUtil) {

        function linker(scope, $explorer, attrs) {

            var $tableContainer = $explorer.find('.bk-table-detail');

            scope.inSelectionMode = !!scope.getSelectableColumnPredicate();
            scope.tableName = '';
            if (scope.tableConfig && scope.inSelectionMode) {
                scope.tableConfig.selectableColumnPredicate = scope.getSelectableColumnPredicate();
            }

            scope.$on('$routeChangeSuccess', function () {
                clear();
            });

            function clear(clearSelection) {
                $explorer.hide();
                if (clearSelection) {
                    scope.lastSelectedColumn = void 0;
                }

                if (angular.isDefined(scope.lastSelectedColumn)) {
                    var selectedTableId = scope.selectedTableId;
                    if (!selectedTableId) {
                        return;
                    }
                }
                if(!!scope.onNavigateAway) {
                    scope.onNavigateAway();
                }
            }

            scope.onViewAllClick = function() {
                scope.hideExplorer();
            };

            scope.cancelSelection = function () {
                clear();
            };
            scope.saveSelection = function () {
                clear();
            };

            scope.hasTableUI = function () {
                if (!$tableContainer.length) {
                    return false;
                }
            // If the addTableUI was previously called, it would have added a blinkVizTable directive element that
            // would have added a 'bk-explorer-table' node as part of the table html.
            // Test for its presence.
                return $tableContainer.find('.bk-explorer-table').length > 0;
            };

            var $slickGridElement;
            scope.addTableUI = function () {
                if (!$tableContainer.length) {
                    return;
                }

                if ($slickGridElement) {
                // NOTE(vibhor): Until we figure out why the slickgrid-table directive doesn't update the table ui on
                // the model change watch, we destroy the previous instance and create a new one. The issue mostly
                // has to do with how slick grid api is used to change the definition.
                    if ($slickGridElement.isolateScope()) {
                        $slickGridElement.isolateScope().$destroy();
                    }
                    $slickGridElement.remove();
                }

                $slickGridElement = $('<blink-slick-grid-table class="bk-explorer-table" table-model="tableModel" ' +
                'config="tableConfig"></blink-slick-grid-table>');
                $tableContainer.append($slickGridElement);
                $slickGridElement = angularUtil.getCompiledElement($slickGridElement, scope);
            };

            scope.removeTableUI = function() {
                return $tableContainer.find('.bk-explorer-table').remove();
            };

            scope.getExplorerTitle = function () {
                return attrs.explorerTitle || 'Explore data';
            };

            scope.lastSelectedColumn = null;
            scope.onColumnSelect = function (selectedColumn) {
                scope.lastSelectedColumn = selectedColumn;
            };

            scope.init();

        }

        return {
            restrict: 'E',
            scope: {
                getSelectableColumnPredicate: '&selectableColumnPredicate',
                onNavigateAway: '&',
                onSave: '&',
                data: '=',
                selectedTableId: '=',
                hideTableList: '@',
                hideExplorer: '=',
                mode: '='
            },
            link: linker,
            replace: false,
            templateUrl: 'src/modules/data-explorer/data-explorer.html',
            controller: 'DataExplorerController'
        };
    }]);
