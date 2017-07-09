/**
 * Copyright: ThoughtSpot Inc. 2013-2014
 * Author: Stephane Kiss (stephane@thoughtspot.com), Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview View for the app canvas.
 * The app canvas is the section of the app to which directives are added / removed
 * as needed based on the current route, allowing users to navigate within the app.
 */

'use strict';

blink.app.directive('blinkAppCanvas', ['navService', 'events', function (navService, events) {

    return {
        restrict: 'A',
        replace: true,
        scope: {},
        templateUrl: 'src/base/app-canvas/app-canvas.html',
        controller: 'AppCanvasController'
    };
}]);
