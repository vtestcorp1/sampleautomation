/**
 * Created by jasmeet on 2/4/16.
 */

/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com), Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Implementation of filters component of the sage data panel.
 */

'use strict';

blink.app.controller('NGFilterPanelController', ['$scope',
    'Logger',
    function ($scope,
              Logger) {
        var _logger = Logger.create('filter-panel-ui');
        if (!$scope.ctrl) {
            _logger.error('No controller passed in');
        }

        $scope.$watch(function(){
            return $scope.ctrl;
        }, function() {
            $.extend($scope, $scope.ctrl);
        });
    }]);

blink.app.directive('filterPanel', [function () {
    return {
        restrict: 'E',
        scope: {
            ctrl: '='
        },
        controller: 'NGFilterPanelController',
        templateUrl: 'src/modules/filter-panel/filter-panel.html'
    };
}]);
