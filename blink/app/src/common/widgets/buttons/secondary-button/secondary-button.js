/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview directive for secondary button
 * text {text class name}: Text for the button.
 * icon {icons class name}:[optional] Icon for the button.
 * isDisabled {boolean}: To enable or disable button.
 */

'use strict';

blink.app.directive('bkSecondaryButton', [function () {

    return {
        restrict: 'E',
        replace: true,
        scope: {
            text: '@',
            icon: '@',
            tooltip: '@',
            tooltipPlacement: '@',
            isDisabled: '=',
            isBusy: '=',
            reverseTextIcon: '='
        },
        templateUrl: 'src/common/widgets/buttons/secondary-button/secondary-button.html'
    };
}]);
