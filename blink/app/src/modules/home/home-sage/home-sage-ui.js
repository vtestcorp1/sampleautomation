/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for Home Page Sage
 */

'use strict';

blink.app.directive('blinkHomeSage', [

    function () {
        return {
            restrict: 'A',
            replace: true,
            scope: {},
            templateUrl: 'src/modules/home/home-sage/home-sage.html',
            controller: 'HomeSageController'
        };
    }
]);
