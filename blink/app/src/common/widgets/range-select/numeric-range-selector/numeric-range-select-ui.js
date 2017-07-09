/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Directive for numeric range selection.
 */

'use strict';

blink.app.controller('NGNumericRangeSelectController', ['$scope',
    'Logger',
    'NumericRangeSelectController',
    function ($scope,
          Logger,
          NumericRangeSelectController) {
        var _logger = Logger.create('numeric-range-select-ui');
        if (!$scope.ctrl) {
            _logger.error('No controller passed in');
        }
    // NOTE(Jasmeet): We dont use angular.merge here as that doesnt copy prototype functions.
        $.extend(true, $scope, $scope.ctrl);
    }]);

blink.app.directive('blinkNumericRangeSelect', ['Logger',
    function (Logger) {
        var _logger = Logger.create('blinkNumericRangeSelect');

        return {
            restrict: 'E',
            scope: {
                ctrl: '='
            },
            templateUrl: 'src/common/widgets/range-select/numeric-range-selector/numeric-range-select.html',
            controller: 'NGNumericRangeSelectController'
        };
    }]);
