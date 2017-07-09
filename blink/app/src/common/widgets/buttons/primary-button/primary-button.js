/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview directive for primary button
 * text {text class name}: Text for the button.
 * icon {icons class name}:[optional] Icon for the button.
 * isDisabled {boolean}: To enable or disable button.
 */

'use strict';

blink.app.directive('bkPrimaryButton', [function () {

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
        templateUrl: 'src/common/widgets/buttons/primary-button/primary-button.html'
    };
}]);
