/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Directive for formula assistant
 */

'use strict';

blink.app.directive('formulaAssistant', [function () {
    function linker(scope, $el, attrs) {
        scope.selectedItem = null;
        scope.exampleData = null;

        scope.onLeafSelected = function (item) {
            scope.selectedItem = item;
            scope.exampleData = {};
            scope.selectedItem.children.each(function(exampleItem){
                scope.exampleData[exampleItem.type] = exampleItem.value;
            });
        };

        scope.isSelectedItem = function (item) {
            return scope.selectedItem === item;
        };

        scope.close = function () {
            if (scope.onCloseCallback) {
                scope.onCloseCallback();
            }
        };

        scope.getValue = function(item) {
            if (!!item.displayValue) {
                return item.displayValue;
            }
            return item.value;
        };
    }

    return {
        restrict: 'E',
        scope: {
            data: '=',
            onCloseCallback: '&onClose',
            title: '='
        },
        link: linker,
        templateUrl: 'src/modules/formula-editor/formula-assistant/formula-assistant.html'
    };
}]);
