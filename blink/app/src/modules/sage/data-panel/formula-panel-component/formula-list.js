/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Formula List
 * - Accessible from left panel in the worksheet view
 */

'use strict';

blink.app.controller('FormulaListController', [ '$scope',
    'blinkConstants',
    'strings',
    'events',
    'formulaEditorPopupService',
    'util',
    'worksheetBuilder',
    function($scope,
             blinkConstants,
             strings,
             events,
             formulaEditorPopupService,
             util,
             worksheetBuilder
    ) {
        $scope.getTitle = function() {
            return strings.dataPanel.FORMULAE_TITLE;
        };

        $scope.showHeaderAddButton = function () {
            return !$scope.readOnly;
        };

        $scope.headerAddButtonTooltip = function () {
            if ($scope.hasWorksheetModel()) {
                return strings.dataPanel.CREATE_FORMULA_TOOLTIP;
            }
            return strings.dataPanel.CREATE_FORMULA_NO_COLUMN_TOOLTIP;
        };

        $scope.getFormulae = function () {
            var client = _.get($scope, ['documentConfig', 'sageClient'], null);
            var context = !!client ? client.getContext() : null;
            var formulae = !!context ? context.getFormulae() : [];
            return formulae;
        };

        $scope.onAddButtonClick = function () {
            if ($scope.readOnly) {
                return;
            }
            $scope.$emit(events.ADD_FORMULA_COLUMN_U);
        };

        $scope.removeFormulaFromContext = function (sageFormula) {
            worksheetBuilder.removeFormula(sageFormula, $scope.documentConfig);
        };

        $scope.addFormulaToWorksheet = function (sageFormula) {
            worksheetBuilder.addFormulaToWorksheet(sageFormula, $scope.documentConfig);
        };

        $scope.onFormulaEdit = function(sageFormula) {
            if ($scope.readOnly) {
                return;
            }

            $scope.$emit(events.ADD_FORMULA_COLUMN_U, sageFormula);
        };

        $scope.hasWorksheetModel = function() {
            return !!$scope.worksheetModel;
        };

        util.registerOneShotEventListener($scope, events.LIST_RENDERED_U, function(event) {
            event.stopPropagation();
            $scope.$emit(events.LEFT_PANEL_COMPONENT_RENDERED_U);
        });
    }]);

blink.app.directive('formulaList', ['blinkConstants', 'strings', function (blinkConstants, strings) {
    var linker = function(scope, $el, attrs) {
        scope.getName = function () {
            return strings.dataPanel.FORMULAE_TITLE;
        };
    };

    return {
        restrict: 'E',
        templateUrl: 'src/modules/sage/data-panel/formula-panel-component/formula-list.html',
        link: linker,
        controller: 'FormulaListController',
        scope: {
            readOnly: '=',
            dataSources: '=',
            worksheetModel: '=',
            documentConfig: '='
        },
        replace: true
    };
}]);
