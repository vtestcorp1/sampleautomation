/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview UI for adding bulk filters.
 */

'use strict';

blink.app.controller('NGBulkFilterController', ['$scope',
    'Logger',
    function ($scope,
          Logger) {
        var _logger = Logger.create('bulk-filter-ui');
        if (!$scope.ctrl) {
            _logger.error('No controller passed in');
        }
    // NOTE(Jasmeet): We dont use angular.merge here as that doesnt copy prototype functions.
        $.extend($scope, $scope.ctrl);
    }]);

blink.app.directive('bulkFilterV2', function () {
    return {
        restrict: 'E',
        scope: {
            ctrl:'='
        },
        controller: 'NGBulkFilterController',
        templateUrl: 'src/modules/viz-layout/viz/filter-v2/bulk-filter/bulk-filter.html'
    };
});
