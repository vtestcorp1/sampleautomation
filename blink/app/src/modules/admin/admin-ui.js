/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author:
 *
 * @fileoverview View for the admin page.
 */

'use strict';

blink.app.directive('blinkAdmin', [function () {

    function linker (scope, $el) {

    }

    return {
        restrict: 'A',
        replace: true,
        scope: {},
        link: linker,
        templateUrl: 'src/modules/admin/admin.html',
        controller: 'AdminController'
    };

}]);
