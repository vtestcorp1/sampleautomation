/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview An attribute directive that adds additional capabilites
 * to ui-select directive.
 */

'use strict';

blink.app.directive('blinkSelect', ['$parse', 'util', function ($parse, util) {
    function linker(scope, $element, attrs, $select) {
        var onDropDownToggleCallback = $parse(attrs.onDropDownToggled);
        if (!!onDropDownToggleCallback) {
            scope.$watch(
                function(){
                    return $select.open;
                },
                function (isOpen) {
                    onDropDownToggleCallback(scope, {
                        isOpen: isOpen
                    });
                }
            );
        }
    }

    return {
        restrict: 'A',
        require: 'uiSelect',
        link: linker
    };
}]);
