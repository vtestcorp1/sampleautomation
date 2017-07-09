/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview controller for transformation management
 */

'use strict';

blink.app.controller("TableTransformationsController", ["$scope",
    'blinkConstants',
    'strings',
    'dialog',
    'ListModel',
    'listUtils',
    'transformationEditorPopupService',
    function($scope,
         blinkConstants,
         strings,
         dialog,
         ListModel,
         listUtils,
         transformationEditorPopupService) {

    //region Globals
        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;
        var tables = $scope.tables;
    //endregion

    //region UI Methods
        $scope.showTransformationsEditor = function(existingTransformationModel) {
            existingTransformationModel = existingTransformationModel || {};

            transformationEditorPopupService.show(
            existingTransformationModel,
            $scope.dsMetadata,
            onUpsertTransform,
            tables,
            $scope.getTableColumns
        );
        };

        $scope.isTransformationNotDefined = function () {
            return $scope.transformations.length === 0;
        };
    //endregion

    //region UI Helpers
        function onUpsertTransform(transformationModel) {
        //Only add a new transformation to the lists if its not
        //present already.
            if($scope.transformations.any(transformationModel)) {
                return;
            }

            $scope.transformations.push(transformationModel);
        }

        function showCannotDeleteDialog() {
            dialog.show({
                title: strings.importData.CANNOT_DELETE,
                message: strings.importData.CANNOT_DELETE_TRANSFORMATION,
                confirmBtnLabel: 'OK',
                skipCancelBtn: true
            });
        }

        function removeTransformation(rows) {
            Array.prototype.remove.apply($scope.transformations, rows.map(function(row) {
                return row;
            }));
        }
    //endregion

    //region UI Configurations
        var columns = [
            listUtils.columns.transformationEditorColumnCol,
            listUtils.columns.transformationEditorTableCol,
            listUtils.columns.transformationEditorExpressionCol
        ];
        var filterFunction = function(row, filterText) {
            if (!filterText || !filterText.length) {
                return true;
            }

            var regex = new RegExp(filterText.escapeRegExp(), 'gi');
            return !!row.name.match(regex);
        };

        $scope.onRowClick = function(row) {
            $scope.showTransformationsEditor(row);
        };

        $scope.listModel = new ListModel(
        columns,
        $scope.transformations,
        filterFunction,
        void 0,
        true
    );

        var deleteActionButton =  {
            icon: blinkConstants.metadataListPage.actions.delete.icon,
            text: strings.metadataListPage.actions.delete.text,
            onClick: removeTransformation,
            isEnabled: function(rows) {
                return rows.length > 0;
            }
        };

        $scope.actionItems = [deleteActionButton];
    //endregion
    }]);
