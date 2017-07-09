/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for Home Page Dashboard
 */

'use strict';

blink.app.directive('blinkHomeDashboard', [function () {

    function linker(scope) {
        scope.init();
    }

    return {
        restrict: 'E',
        link: linker,
        replace: true,
        templateUrl: 'src/modules/home/home-dashboard/home-dashboard.html',
        controller: 'HomeDashboardController'
    };

}]);
