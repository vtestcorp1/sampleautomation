/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview directive for base button
 * Parameters:
 * buttonClass {css class}: Button type class.
 * buttonText {string}:[optional] Text for the button.
 * buttonIcon {icons class name}:[optional] Icon for the button.
 * buttonTooltip {tooltip}: Tooltip text for icon buttons.
 * isDisabled {boolean}: To enable or disable button.
 */

'use strict';

blink.app.directive('bkButton', [function () {
    function linker(scope, $el) {

        $el.bind('click', function (e) {
            if (scope.isDisabled){
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    return {
        restrict: 'E',
        replace: true,
        link: linker,
        scope: {
            buttonClass: '@',
            buttonText: '@',
            buttonIcon: '@',
            buttonTooltip: '@',
            buttonTooltipPlacement: '@',
            isDisabled: '=',
            isSelected: '=',
            isBusy: '=',
            isBorderless: '=',
            reverseTextIcon: '='
        },
        controller: 'buttonController',
        templateUrl: 'src/common/widgets/buttons/base-button/button.html'
    };
}]);
