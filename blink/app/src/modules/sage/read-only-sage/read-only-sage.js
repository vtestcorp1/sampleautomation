/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Read only sage.
 */

'use strict';

blink.app.controller('ReadOnlySageController', ['$scope', 'Logger', 'events',
    function ($scope, Logger, events) {
        var logger = Logger.create('read-only-sage-controller');

        $scope.sageExpanded = false;

        $scope.onSageBarClick = function () {
            if ($scope.canTextFitInSageBar($scope.queryText)) {
                return;
            }


            $scope.sageExpanded = !$scope.sageExpanded;
        };
    }]);

blink.app.directive('blinkReadOnlySage', ['$rootScope', 'Logger', 'events', 'sageUtil',
    function ($rootScope, Logger, events, sageUtil) {
        var _logger = Logger.create('blink-read-only-sage');

        function linker(scope, element, attrs) {

            var $sageTextElem = $('div.bk-sage-real-input', element);

            scope.canTextFitInSageBar = function (text) {
                return !text || sageUtil.getPixelWidthOfSageInputString(text) <= $sageTextElem.width();
            };

        // This is the same event that sage emits on load. We emit the same event because this is used at various places
        // in the app.
            scope.$emit(events.SAGE_LOADED_U);
        }

        return {
            restrict: 'E',
            replace: true,
            scope: {
                queryText: '='
            },
            link: linker,
            templateUrl: 'src/modules/sage/read-only-sage/read-only-sage.html',
            controller: 'ReadOnlySageController'
        };
    }]);
