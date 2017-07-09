/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview directive for icon only button
 * icon {icons class name}: Icon for the button.
 * tooltip {tooltip}: Tooltip text for icon buttons.
 * isDisabled {boolean}: To enable or disable button.

 */
'use strict';

blink.app.directive('bkIconButton', [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            icon: '@',
            tooltip: '=',
            isDisabled: '=',
            isSelected: '=',
            isBorderless: '='
        },
        templateUrl: 'src/common/widgets/buttons/icon-button/icon-button.html'
    };
}]);
