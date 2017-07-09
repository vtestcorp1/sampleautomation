/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich
 *
 * @fileoverview View for the debug page.
 */

'use strict';

blink.app.directive('blinkMemcacheManagement', [function () {

    return {
        restrict: 'E',
        templateUrl: 'src/modules/debug/memcache-management.html',
        controller: 'MemcacheManagementController'
    };

}]);
