/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview An expandable list directive for Object sage query suggestions
 */

'use strict';

blink.app.controller('QueryCompletionController', ['$scope', '$rootScope', 'sageUtil', 'events',
    function($scope, $rootScope, sageUtil, events) {
        $scope.getLineageDropdown = sageUtil.getLineageDropdown;

        $scope.onItemClick = function(queryCompletion) {
            $scope.onClick(queryCompletion);
        };
    }]);

blink.app.directive('queryCompletions', [function() {
    return {
        restrict: 'E',
        scope: {
            queryCompletions: '=',
            onClick: '='
        },
        controller: 'QueryCompletionController',
        templateUrl: 'src/modules/search-doctor/query-completions.html'
    };
}]);
