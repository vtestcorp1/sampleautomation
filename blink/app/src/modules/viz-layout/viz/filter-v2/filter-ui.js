/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview A base filter directive. Which takes care of displaying a filter model.
 * It allows users to edit the model when permitted.
 */

'use strict';

blink.app.controller('NGFilterController', ['$scope',
    'Logger',
    function($scope,
         Logger){
        var _logger = Logger.create('filter-ui');
        if (!$scope.ctrl) {
            _logger.error('No controller passed in');
        }

        $scope.$watch(function(){
            return $scope.ctrl;
        }, function() {
            $.extend($scope, $scope.ctrl);
        });
    }]);

blink.app.directive('blinkFilterV2', ['Logger',
    function (Logger) {
        var _logger = Logger.create('filter-ui');

        return {
            restrict: 'E',
            scope: {
                ctrl: '='
            },
            templateUrl: 'src/modules/viz-layout/viz/filter-v2/filter.html',
            controller: 'NGFilterController'
        };
    }]);
