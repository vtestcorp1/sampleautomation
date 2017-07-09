/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview An expandable list directive for Object sage query suggestions
 */

'use strict';

blink.app.controller('ObjectListController', ['$scope', 'navService', function($scope, navService) {
    $scope.getMatchedQuestion = function(object) {
        if (object.isAnswer()) {
            return object.getQuestion();
        } else {
            if (object.getVisualizations().length > 0) {
                var matchedVisualization = object.getVisualizations()[0];
                return matchedVisualization.getQuestion();
            }
        }
    };

    $scope.onItemClick = function(object) {
        var objectUrl = '{type}/{id}'.assign({
            type: object.isAnswer() ? 'saved-answer' : 'pinboard',
            id: object.getId()
        });
        navService.goToPath(objectUrl);
    };

    $scope.hasSubtext = function(object) {
        var matchedQuestion = $scope.getMatchedQuestion(object);
        if (!matchedQuestion) {
            return false;
        }
        return !!matchedQuestion.getName();
    };
}]);

blink.app.directive('objectList', [function() {
    return {
        restrict: 'E',
        scope: {
            objects: '=',
            title: '='
        },
        controller: 'ObjectListController',
        templateUrl: 'src/modules/search-doctor/object-list.html'
    };
}]);
