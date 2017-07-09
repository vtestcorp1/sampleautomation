/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Directive for table viz column menu trigger button.
 */

'use strict';

blink.app.directive('columnMenuButton', ['blinkConstants', 'strings', function (blinkConstants, strings) {

    function linker (scope) {
        scope.strings = strings.filtersMessages;
    }

    return {
        restrict: 'E',
        replace: true,
        link: linker,
        scope: {
            columnModel: '=',
            tableModel: '='
        },
        templateUrl: 'src/modules/viz-layout/viz/table/column-menu/button/column-menu-button.html'
    };

}]);
