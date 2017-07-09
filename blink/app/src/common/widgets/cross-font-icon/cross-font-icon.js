/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview directive for cross icons button
 */

'use strict';

blink.app.directive('bkCrossIcon', [function () {

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'src/common/widgets/cross-font-icon/cross-font-icon.html'
    };
}]);
