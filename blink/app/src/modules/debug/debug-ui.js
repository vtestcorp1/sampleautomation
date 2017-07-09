/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich
 *
 * @fileoverview View for the debug page.
 */

'use strict';

blink.app.directive('blinkDebug', [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {},
        templateUrl: 'src/modules/debug/debug.html',
        controller: 'DebugController'
    };

}]);
