/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for nav
 */

'use strict';

blink.app.directive('blinkNav', [function () {

    return {
        restrict: 'A',
        scope: {},
        templateUrl: 'src/modules/nav/nav.html',
        controller: 'NavController'
    };
}]);
