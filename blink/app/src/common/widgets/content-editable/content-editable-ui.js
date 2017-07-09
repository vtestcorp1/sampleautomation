/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Content-editable widget
 */

'use strict';

blink.app.directive('blinkContentEditable', ['$parse',
    '$window',
    'blinkConstants',
    'strings',
    'safeApply',
    'safeDigest',
    'Logger',
    'util',
    function ($parse,
          $window,
          blinkConstants,
          strings,
          safeApply,
          safeDigest,
          Logger,
          util) {
        var _logger = Logger.create('content-editable');

        function linker(scope, $el, attrs, ngModel) {
            var originalText,
                originalDesc,
                isBeforeEditDefined = !!attrs.beforeEditMode,
                beforeEditMode = $parse(attrs.beforeEditMode),
                isValidationDefined = !!attrs.validateInput,
                validateInput = $parse(attrs.validateInput),
                _$inputEl = $el.find('input'),
                _$textAreaEl = $el.find('textarea');

            scope.blinkConstants = blinkConstants;
            scope.strings = strings;

            scope.contentClicked = function ($event) {
                if(scope.isBeingEdited) {
                    $event.stopPropagation();
                }

                if (scope.isExternal()) {
                    return;
                }

            // A hook to prevent the content-editable to react to a click on the element unless the caller predicate
            // is passed.
            // For example, if the caller needs to verify something before the content-editable input is turned on,
            // the caller can supply a 'before-edit-mode' attribute. If it returns false, then we short-circuit.
            // See sharable-item.html for a sample use.
                if (isBeforeEditDefined && !beforeEditMode(scope.$parent)) {
                    return;
                }

                scope.changeEditMode(true);
                originalText = scope.text || '';
                originalDesc = scope.description || '';
            };


            function bindEvents(bind) {
                if (bind) {
                    angular.element($window).on('mousedown.contenteditable', function (event) {
                        if ($(event.target).closest($el).length) {
                            return;
                        }
                        scope.changeEditMode(false);
                        scope.isReadOnly = scope.isExternal();
                        safeDigest(scope);
                    });
                } else {
                    angular.element($window).off('mousedown.contenteditable');
                }
            }

            scope.getSize = function () {
            // When computing the length of the input box, we count 'm', 'w', and all upper case
            // characters as of length 2, otherwise input box's width will not be enough to contain them.
                return _$inputEl.val().length + _$inputEl.val().replace(/[^mwA-Z]/g, "").length;
            };

            function inputInvalid() {
                var text = scope.text || '';
                return (isValidationDefined && (validateInput(scope.$parent) !== null)
                || (scope.disallowEmpty && text.trim().length === 0));
            }

            function onBlur($event) {
                safeApply(scope, function () {
                    if (inputInvalid()) {
                        scope.reset();
                    } else {
                        scope.submit();
                    }
                });
            }

            _$inputEl.on('blur', onBlur);
            _$textAreaEl.on('blur', onBlur);

            _$inputEl.keyup(function(e) {
                if (e.keyCode === $.ui.keyCode.ENTER) {
                    scope.changeEditMode(false);
                    $(this).trigger("blur");
                }
            });

        // SCAL-11261 block event propagation when user is editing a field
            _$inputEl.keydown(function(e) {
                e.stopPropagation();
            });

            _$textAreaEl.keydown(function(e) {
                e.stopPropagation();
            });

            $el.on('mousemove.contenteditable', function(e) {
                if(scope.isBeingEdited) {
                    e.stopPropagation();
                }
            });

            $el.on('mousedown.contenteditable', function(e) {
                if(scope.isBeingEdited) {
                    e.stopPropagation();
                }
            });


            $el.on('blink.contenteditable.edit', function () {
                originalText = scope.text || '';
                originalDesc = scope.description || '';
                scope.isReadOnly = false;
                scope.changeEditMode(true);
                util.executeInNextEventLoop(function() {
                    _$inputEl.focus();
                });
            });

            scope.reset = function () {
                if (angular.isDefined(originalText)) {
                    scope.error = null;
                    scope.text = originalText;
                }
                if (angular.isDefined(originalDesc)) {
                    scope.error = null;
                    scope.description = originalDesc;
                }

            };

            scope.submit = function () {
                if (inputInvalid()) {
                    if (isValidationDefined) {
                        scope.error = validateInput(scope.$parent);
                    }
                    return;
                }

                scope.error = null;
                scope.text = (scope.text) ? scope.text.trim() : '';
                scope.description = (scope.description) ? scope.description.trim() : '';
                if (scope.text !== originalText && angular.isDefined(originalText) ||
                scope.description !== originalDesc && angular.isDefined(originalDesc)) {
                    originalText = scope.text;
                    originalDesc = scope.description;
                    scope.onChange({tableName: scope.text, tableDescription: scope.description});
                }
            };

            scope.isReadOnly = scope.isExternal();

            scope.onTextChange = function() {
                scope.error = null;
            };

            scope.fullSpan = angular.isDefined(attrs.fullspan);
            scope.autoShowEditable = angular.isDefined(attrs.autoShowEditable);
            scope.disallowEmpty = angular.isDefined(attrs.disallowEmpty);

            scope.isDescEnabled = angular.isDefined(attrs.description);

            scope.changeEditMode = function(newEditMode) {
                if (newEditMode != scope.isBeingEdited) {
                    scope.isBeingEdited = newEditMode;
                    bindEvents(newEditMode);
                    scope.onEditModeChange({
                        editMode: newEditMode
                    });
                }
            };

            scope.$on('$destroy', function(){
                bindEvents(false);
            });

        }
        return {
            restrict: 'AE',
            require: 'ngModel',
            replace: true,
            scope: {
                text: '=?ngModel',
                isNotEditable: '&notEditable',
                isExternal: '&external',
                getPlaceHolderText: '&placeholder',
                onChange: '&',
                onEditModeChange: '&',
                mouseEntered: '&',
                mouseLeft: '&',
                description: '=?'
            },
            templateUrl: 'src/common/widgets/content-editable/content-editable.html',
            controller: 'ContentEditableController',
            link: linker
        };
    }]);

blink.app.controller('ContentEditableController', ['$scope', function ($scope) {

}]);
