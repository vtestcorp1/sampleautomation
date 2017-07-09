/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Formula List
 * - Accessible from left panel in the answer view
 */

'use strict';

blink.app.controller('AnswerFormulaListController', ['$scope',
    'events',
    function($scope, events) {
        $scope.isExpanded = false;

        $scope.shouldShowFormulaList = function() {
            var formulae = $scope.sageClient.getContext().getFormulae();
            return !!formulae && formulae.length > 0;
        };

        $scope.onFormulaClick = function(formula) {
            $scope.formulaHandler(formula);
        };

        $scope.getFormulaList = function() {
            return $scope.sageClient.getContext().getFormulae();
        };

        $scope.onFormulaDblClick = function(formula) {
            var addFormulaTransform = sage.QueryTransform.createAddColumnTransformation({
                columnGuid: formula.getId()
            });
            $scope.sageClient.transformTable([addFormulaTransform])
                .then($scope.onSuccess);
        };
        $scope.removeFormula = function(formula) {
            $scope.sageClient.removeFormula(formula);
        };
    }]);

blink.app.directive('answerFormulaList', function () {
    return {
        restrict: 'E',
        templateUrl: 'src/modules/sage/data-panel/answer-formula-panel-component/answer-formula-list.html',
        controller: 'AnswerFormulaListController',
        scope: {
            sageClient: '=',
            formulaHandler: '=',
            onSuccess: '='
        }
    };
});
