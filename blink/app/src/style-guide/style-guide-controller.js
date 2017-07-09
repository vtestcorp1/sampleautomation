/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview TS pattern library root controller.
 */

'use strict';

blink.app.controller('styleGuideController', ['$scope',
    function($scope) {
        $scope.isAppReady = function() {
            return blink.app.appReady;
        };
    }]);
