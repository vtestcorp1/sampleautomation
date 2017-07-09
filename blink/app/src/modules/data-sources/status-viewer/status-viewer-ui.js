/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Directive to display data-source status directive.
 */

'use strict';

blink.app.directive('blinkStatusViewer', [function () {

    return {
        restrict: 'E',
        scope: {
            itemDetails: '=',
            onHide: '=',
            refresh: '='
        },
        templateUrl: 'src/modules/data-sources/status-viewer/status-viewer.html',
        controller: 'StatusViewerController'
    };

}]);
