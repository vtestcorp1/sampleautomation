/**
 * Copyright: Thoughtspot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A simple single action type menu button. The menu can contain multiple sub-menus.
 */

'use strict';

blink.app.directive('blinkButtonMenu', [function () {

    // All the configuration of a menu is passed in as a json object through 'menu' attribute.
    // The configuration options are as follows:
    // - btnLabel: Menu button name
    // - className: A top level class name to be applied on the menu widget
    // - btnArrowClass: Additional style class to be applied on the dropdown button arrow
    // - inactive: true if the menu needs to appear as disabled.
    // - keepMenuOpenOnSelect: true if the menu body should remain open when item is selected. Defaults to false.
    // - submenus: An list of submenu objects. Each submenu object is itself a list of configuration with following options:
    //     - label: Label of the item in submenu
    //     - iconClass: Class name to decorate the icon for the submenu item
    //     - event: Name of the event to be broadcasted when clicked.

    function linker(scope) {
        scope.onMenuItemClick = function (eventType, isDisabled) {
            if (scope.isBusy() || isDisabled) {
                return;
            }
            scope.$emit(eventType);
        };
    }

    return {
        restrict: 'E',
        scope: {
            menu: '=',
            isBusy: '&busy'
        },
        link: linker,
        templateUrl: 'src/common/widgets/menu/button-menu.html'
    };
}]);
