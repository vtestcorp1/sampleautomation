/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich
 *
 * @fileoverview View for the debug page.
 */

'use strict';

blink.app.directive('blinkLoggersManagement', [function () {

    return {
        restrict: 'E',
        templateUrl: 'src/modules/debug/loggers-management.html',
        controller: 'LoggersManagementController'
    };

}]);
