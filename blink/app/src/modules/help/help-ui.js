/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vijay Ganesan (vijay@thoughtspot.com)
 *
 * @fileoverview View for the user preferences page.
 */

'use strict';

blink.app.directive('blinkHelp', [function () {

    return {
        restrict: 'A',
        replace: true,
        scope: {},
        templateUrl: 'src/modules/help/help.html',
        controller: 'HelpController'

    };

}]);
