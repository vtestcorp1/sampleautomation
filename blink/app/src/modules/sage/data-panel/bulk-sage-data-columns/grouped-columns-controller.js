/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Directive for implementing the columns panel component of sage data panel.
 */

'use strict';

blink.app.controller('GroupedColumnsController', ['$scope',
    'perfMeter',
    'strings',
    'worksheetBuilder',
    'util',
    function ($scope,
          perfMeter,
          strings,
          worksheetBuilder,
          util) {
        var _selectedColumns = [];
        function areAllColumnsInGroupSelected(group) {
            if (group.columns.length !== _selectedColumns.length || !_selectedColumns.length) {
                return false;
            }

            return _selectedColumns[0].getOwner() === group.sourceId;
        }

        $scope.onGroupClick = function (sourceObject) {
            if (!sourceObject.expanded) {
                sourceObject.expanded = true;
            // If the list is being expanded, wait for one event loop for the dom to render the list before selecting
            // all columns.
                util.executeInNextEventLoop(function () {
                    $scope.selectAllColumnsInGroup(sourceObject);
                });
                return;
            }

            if (areAllColumnsInGroupSelected(sourceObject)) {
                $scope.clearAllColumnsInGroup(sourceObject);

            // HACK(vibhor): Truly, the selectable directive should provide a deselectAll method that will trigger
            // onSelectionChange. But because we can assume that the only thing needed here is to clear selected cols,
            // we take a shortcut.
                _selectedColumns = [];
            } else {
                $scope.selectAllColumnsInGroup(sourceObject);
            }
        };

        $scope.toggleGroup = function (sourceId, sourceObject) {
            sourceObject.expanded = !sourceObject.expanded;
        // If the table is collapsed and any of its columns were selected, clear those
            if (!sourceObject.expanded) {
                if (_selectedColumns.length && _selectedColumns[0].getOwner() === sourceId) {
                    _selectedColumns = [];
                }
            }
        };

        $scope.onSelectionChange = function (selectedColumns, sourceId) {
            _selectedColumns = selectedColumns || [];
            $scope.clearAllGroupsExcept(sourceId);
        };

        $scope.getSelectedColumns = function () {
            return _selectedColumns;
        };

        $scope.hasAnySelectedColumns = function () {
            return _selectedColumns.length;
        };

        $scope.clearSelectedColumns = function () {
            $scope.clearAllGroupsExcept();
            _selectedColumns = [];
        };

        function addColumns(columns) {
            var firstColumnSourceTableId = columns[0].getOwner();
            var metric = 'worksheet-add-columns-from-source-' + firstColumnSourceTableId;
            perfMeter.markGenericMetricReady(metric);
            worksheetBuilder.addColumns(columns, $scope.panelComponent.getDocumentConfig())
            .then(function() {
                perfMeter.reportGenericMetricFinished(metric);
            });
            $scope.clearSelectedColumns();
        }

        $scope.addSelectedColumns = function () {
            if (!$scope.hasAnySelectedColumns()) {
                return;
            }
            addColumns(_selectedColumns);
        };

        $scope.addColumn = function (col) {
            addColumns([col]);
        };

        $scope.$on('focus-out-sage-columns', function () {
            $scope.clearSelectedColumns();
        });

    }]);
