/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller for base button
 */

'use strict';

blink.app.controller('buttonController', ['$scope', 'strings',
    function ($scope, strings) {

        $scope.setTooltip = function (tooltip) {
            return (!$scope.buttonText || $scope.isDisabled) ? tooltip : '';
        };
    }]);
