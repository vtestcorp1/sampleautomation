/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview TODO
 */

'use strict';

blink.app.directive('addNewItem', ['$parse', 'util', 'safeApply', 'Logger', function ($parse, util, safeApply, Logger) {
    var _logger = Logger.create('add-new-item');

    var States = {
        SHOW_ADD_BTN: 'SHOW_ADD_BTN',
        SHOW_SPINNER: 'SHOW_SPINNER',
        SHOW_NAME_INPUT: 'SHOW_NAME_INPUT'
    };

    function linker(scope, $el, attrs) {
        var isValidationDefined = !!attrs.validateInput,
            validateInput = $parse(attrs.validateInput);
        scope.currentState = States.SHOW_ADD_BTN;
        scope.newItem = {
            name: ''
        };
        scope.onAddBtnClick = function () {
            util.executeInNextEventLoop(function () {
                var $input = $el.find('input');
                $input.focus();
                $input.on('blur', function () {
                    if (scope.newItem.name.trim()) {
                        scope.onComplete();
                    } else {
                        scope.moveStateTo(States.SHOW_ADD_BTN);
                        safeApply(scope);
                    }
                });
            });

            scope.moveStateTo(States.SHOW_NAME_INPUT);
        };

        scope.moveStateTo = function (state) {
            if (state == States.SHOW_NAME_INPUT) {
                scope.newItem.name = '';
            }
            scope.currentState = state;
        };

        scope.onComplete = function () {
            if (isValidationDefined) {
                scope.inputError = validateInput(scope.$parent, {
                    itemName: scope.newItem.name
                });
                if (!!scope.inputError) {
                    return;
                }
            }

            scope.newItem.name = (scope.newItem.name) ? scope.newItem.name.trim() : '';
            scope.moveStateTo(States.SHOW_SPINNER);
            scope.onAdd({
                itemName: scope.newItem.name
            }).then(function(label) {
                scope.moveStateTo(States.SHOW_ADD_BTN);
            },
            function(error) {
                _logger.error('Unable to add new label', error);
                scope.moveStateTo(States.SHOW_ADD_BTN);
            });
        };

        scope.onTextChange = function() {
            scope.inputError = null;
        };
    }

    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            onAdd: '&'
        },
        templateUrl: 'src/common/widgets/add-new-item/add-new-item.html',
        link: linker
    };
}]);
