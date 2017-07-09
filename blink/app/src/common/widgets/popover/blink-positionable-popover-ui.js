/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Directive to show tooltip inside blink geomaps
 */

'use strict';
blink.app.directive('blinkPositionablePopover', [function () {
    function linker(scope, $el, attrs) {
    }

    return {
        restrict: 'A',
        link: linker,
        templateUrl: 'src/common/widgets/popover/blink-positionable-popover.html'
    };
}]);
