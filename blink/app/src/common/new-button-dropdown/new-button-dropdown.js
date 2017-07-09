/**
 * Copyright: ThoughtSpot Inc. 2014-2015
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview 'New' button with drop down used on list, admin and data pages.
 * Menu properties:
 * @param {string} title - (Optional) Title for button with 'New' as default title
 * @param {string} css - (Optional) CSS class to add any custom styles
 * @param {string} tooltip - (Optional) Tooltip text on button
 * @param {array} action - Dropdown items or a default onlick action for the button in case of no dropdown
 **/

'use strict';

blink.app.directive('newButtonDropdown', [function () {

    function linker(scope) {
        scope.onClick = function() {
            if (scope.menu.actions.length > 1) {
                scope.showNewButtonDropdown = !scope.showNewButtonDropdown;
            } else {
                scope.onMenuClick(scope.menu.actions[0]);
            }
        };

        scope.getTitle = function() {
            return scope.menu.title || 'New';
        };

        scope.onMenuClick = function (action) {
            if (!!action.isDisabled && action.isDisabled()) {
                return;
            }
            action.onClick();
        };

        scope.getTooltip = function (action) {
            if(!!action.isDisabled && action.isDisabled()) {
                return action.disabledTooltip || '';
            }
            return action.tooltip || '';
        };

        scope.hideNewButtonDropdown = function (){
            scope.showNewButtonDropdown = false;
        };
    }

    return {
        restrict: 'E',
        scope: {
            menu: '='
        },
        link: linker,
        templateUrl: 'src/common/new-button-dropdown/new-button-dropdown.html'
    };
}]);
