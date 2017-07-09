/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview View for checkbox filter.
 */

'use strict';

blink.app.controller('NGCheckboxFilterController', ['$scope',
    'Logger',
    function ($scope,
          Logger) {
        var _logger = Logger.create('checkbox-filter-ui');
        if (!$scope.ctrl) {
            _logger.error('No controller passed in');
        }
    // NOTE(Jasmeet): We dont use angular.merge here as that doesnt copy prototype functions.
        $.extend($scope, $scope.ctrl);
    }]);

blink.app.directive('blinkCheckboxFilterV2', ['Logger',
    function (Logger) {
        var _logger = Logger.create('checkbox-filter-ui');

        return {
            restrict: 'E',
            scope: {
                ctrl: '='
            },
            controller: 'NGCheckboxFilterController',
            templateUrl: 'src/modules/viz-layout/viz/filter-v2/checkbox-filter/checkbox-filter.html'
        };
    }]);
