/**
/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Implementation of the sage dropdown directive on an sage input element.
 */

'use strict';

blink.app.directive('sageAutocomplete', ['$parse',
    '$q',
    '$timeout',
    'angularUtil',
    'blinkConstants',
    'strings',
    'events',
    'eventTracker',
    'env',
    'Logger',
    'perfEvents',
    'safeApply',
    'sageUtil',
    'util',
    function ($parse,
              $q,
              $timeout,
              angularUtil,
              blinkConstants,
              strings,
              events,
              eventTracker,
              env,
              Logger,
              perfEvents,
              safeApply,
              sageUtil,
              util) {
        var _logger = Logger.create('sage-autocomplete');

    // TODO(vibhor/shikhar): Break the linker into multiple child functions.
        function linker(scope, $inputEl, attrs, modelCtrl) {
            var autocompleteConfig = scope.$eval(attrs.sageAutocomplete);

            var DROPDOWN_AUTO_CLOSE_DELAY = autocompleteConfig.dropdownAutoCloseDelay || -1;

        // binding to a variable that indicates if matches are being retrieved asynchronously
        // TODO(shikhar/vibhor) Can be used to show a loading indicator in the sage bar
            var isLoadingSetter = $parse(attrs.completionsLoading).assign || angular.noop;

        // Model setter executed upon match selection
            var $setModelValue = $parse(attrs.ngModel).assign;

            var canAutoCloseDropdown = $parse(attrs.canAutoCloseDropdown);

            var hideDropdownTimer = null;

            var listWithInputAsList = [];

            var dummyInputList = {
                items: ['dummy']
            };

            var hasFocus = false;
            $inputEl.bind('blur', function (evt) {
                hasFocus = false;
                safeApply(scope);
            });

            $inputEl.bind('mousedown', function (evt) {
                onSageInputChanged(modelCtrl.$viewValue || '');
                safeApply(scope);
            });

            function openDropdown() {
                onSageInputChanged(modelCtrl.$viewValue || '');
                safeApply(scope);
            }

            $inputEl.bind('sageAutocomplete.openDropdown', function () {
                openDropdown();
            });

            $inputEl.bind('sageAutocomplete.closeDropdown', function () {
                resetDropdownScope();
                safeApply(scope);
            });

            var resetHoverState = function () {
                scope.hoverItemIdx = -1;
                scope.hoverListIdx = -1;
            };

            var resetDropdownScope = function() {
                scope.completionSections = [];
                scope.activeIdx = 0;
                scope.activeListIdx = -1;
                scope.isValidPopupList = false;
                listWithInputAsList = [];
                scope.mouseInsideDropdown = false;
                scope.showDropdown = true;

                resetHoverState();
            };

            var initDropdownScope = function () {
            // TODO(shikhar): Comment why?
                listWithInputAsList = [dummyInputList].concat(scope.completionSections);
                scope.isValidPopupList = true;
                scope.formatters = autocompleteConfig.formatters;
            };


            // A particular dropdown item has been selected, by clicking or by pressing enter.
            scope.select = function (activeIdx, activeListIdx, closeDropdown) {
                $inputEl.focus();

                // Is a valid item from the list
                if (activeIdx > -1
                    && activeListIdx > -1
                    && activeListIdx < scope.completionSections.length) {
                    var item = scope.completionSections[activeListIdx].items[activeIdx];
                    var list = scope.completionSections[activeListIdx];

                    if (list.type === sageUtil.CompletionType.ObjectResult) {
                        autocompleteConfig.objectResultCallback(item);
                    } else if (list.type === sageUtil.CompletionType.Feedback) {
                        autocompleteConfig.feedbackResultCallback(item);
                    } else {
                        populateInputFromCompletion(item);
                        autocompleteConfig.queryCompletionCallback(item, closeDropdown);
                    }
                }
            };

            function getQueryCompletionSectionIndex(completionSections) {
                return completionSections.findIndex(function(section){
                    return section.type === sageUtil.CompletionType.QueryCompletion;
                });
            }

            function getQueryCompletionSection(completionSections) {
                var queryCompletionSectionIndex = getQueryCompletionSectionIndex(completionSections);
                if (queryCompletionSectionIndex < 0) {
                    return null;
                }
                return completionSections[queryCompletionSectionIndex];
            }

        /**
         *
         * @param {Object[]} completionSections
         * @returns {Object} An object with properties `listIndex` and `itemIndex` specifying
         * the completion section index the exact match completion belongs to and the index
         * of the item within its list, respectively
         */
            function getUniqueExactMatchQueryCompletion(completionSections) {
                var queryCompletionSectionIndex = getQueryCompletionSectionIndex(completionSections);
                if (queryCompletionSectionIndex < 0) {
                    return null;
                }

                var queryCompletionSection = completionSections[queryCompletionSectionIndex];
                for (var i=0; i<queryCompletionSection.items.length; ++i) {
                    var queryCompletion = queryCompletionSection.items[i];
                // we want to ignore folded completions as they are by definition non-unique
                    if (!queryCompletion.isFoldedCompletion() && queryCompletion.isExactMatch()) {
                        return {
                            listIndex: queryCompletionSectionIndex,
                            itemIndex: i
                        };
                    }
                }
                return null;
            }

            scope.getMoreCompletions = function () {
                var deferred = $q.defer();
            // TODO(vibhor/sunny): Figure out a way to pass a parameter to this function from the caller in html.

                var existingQueryCompletionsSection = getQueryCompletionSection(scope.completionSections);
                if (!existingQueryCompletionsSection || !existingQueryCompletionsSection.items.length) {
                    deferred.resolve();
                    return deferred.promise;
                }

                autocompleteConfig.getMoreCompletions(existingQueryCompletionsSection).then(function () {
                    deferred.resolve();
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            };

            var HOT_KEYS = [
                blinkConstants.keyCodes.UP_ARROW,
                blinkConstants.keyCodes.DOWN_ARROW,
                blinkConstants.keyCodes.ENTER_KEY,
                blinkConstants.keyCodes.TAB_KEY
            ];

            var DROPDOWN_TRIGGER_KEYS = [
                blinkConstants.keyCodes.UP_ARROW,
                blinkConstants.keyCodes.DOWN_ARROW,
                blinkConstants.keyCodes.TAB_KEY
            ];

            function getCaretPos() {
                return {
                    selectionStart: $inputEl[0].selectionStart,
                    selectionEnd: $inputEl[0].selectionEnd || $inputEl[0].selectionStart
                };
            }

            function setCaretPos(selectionStart, selectionEnd) {
                selectionEnd = selectionEnd || selectionStart;
                $inputEl[0].selectionStart = selectionStart;
                $inputEl[0].selectionEnd = selectionEnd;
            }

            function updateDropdownActiveItem(effActiveListIdx, activeIdx) {
                scope.activeListIdx = effActiveListIdx - 1;
                scope.activeIdx = activeIdx;

                scope.$digest();
            }

            function updateSageOnArrowKeyNav(effActiveListIdx, activeIdx) {
                updateDropdownActiveItem(effActiveListIdx, activeIdx);

                var list = scope.completionSections[scope.activeListIdx],
                    item = list && list.items[scope.activeIdx];

            // If cannot auto-complete then show the user-entered text
                if (scope.activeListIdx == -1) {
                    $inputEl.val(modelCtrl.$viewValue);
                    return;
                }

            // Show the label in the input box
                $inputEl.val(autocompleteConfig.formatters.itemToString(item, null));
                setCaretPos(autocompleteConfig.formatters.itemToPrefixString(item).length);
                $inputEl.trigger('sageAutocomplete.changeActiveElementOnArrowKeys', [scope.activeListIdx, scope.activeIdx]);
            }

         //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
            $inputEl.bind('keydown', function (evt) {
                var effActiveListIdx, activeIdx, item, evtDesc, listIdx, itemIdx;

                if (HOT_KEYS.indexOf(evt.which) === -1) {
                    return;
                }

                evt.preventDefault();

            //typeahead is open and an "interesting" key was pressed
                if (scope.completionSections.length === 0 && evt.which !== blinkConstants.keyCodes.ENTER_KEY) {
                    if (DROPDOWN_TRIGGER_KEYS.indexOf(evt.which) === -1) {
                        return;
                    }
                    openDropdown();
                    return;
                }

            // If the user presses down or up arrow key after user hover over an item, we want to start from this
            // hovered-over element
                if (scope.hoverListIdx > -1 &&
                (evt.which === blinkConstants.keyCodes.DOWN_ARROW || evt.which === blinkConstants.keyCodes.UP_ARROW)) {
                    scope.activeIdx = scope.hoverItemIdx;
                    scope.activeListIdx = scope.hoverListIdx;

                    resetHoverState();
                }

            // It might happen that the dropdown closes due to timer, etc, and then the user presses any of the HOT_KEYS.
            // In this case, we again show the dropdown.
                scope.showDropdown = true;

            // We are guaranteed that atleast one list would have length > 0 due to validity check that we
            // perform in getMatchesAsync. This avoids infinite loop in various events.
                switch (evt.which) {
                    case blinkConstants.keyCodes.DOWN_ARROW:
                // TODO(shikhar): If the dropdown is not open, then this event should open the dropdown and return.
                        effActiveListIdx = scope.activeListIdx + 1;
                        activeIdx = scope.activeIdx;

                        if (activeIdx >= listWithInputAsList[effActiveListIdx].items.length - 1) {
                    // reached end of current list
                            do {
                                effActiveListIdx = (effActiveListIdx + 1) % listWithInputAsList.length;
                            } while (!listWithInputAsList[effActiveListIdx].items.length);
                            activeIdx = 0;
                        } else {
                            activeIdx++;
                        }

                        updateSageOnArrowKeyNav(effActiveListIdx, activeIdx);
                        break;
                    case blinkConstants.keyCodes.UP_ARROW:
                        effActiveListIdx = scope.activeListIdx + 1;
                        activeIdx = scope.activeIdx;
                        if (activeIdx === 0) {
                    // reached the top of the current list
                            do {
                                effActiveListIdx = (effActiveListIdx ? effActiveListIdx : listWithInputAsList.length) - 1;
                            } while (!listWithInputAsList[effActiveListIdx].items.length);

                            activeIdx = listWithInputAsList[effActiveListIdx].items.length - 1;
                        } else {
                            activeIdx--;
                        }

                        updateSageOnArrowKeyNav(effActiveListIdx, activeIdx);
                        break;
                    case blinkConstants.keyCodes.ENTER_KEY:
                        if (scope.activeIdx === -1 || scope.activeListIdx === -1) {
                            var firstQueryCompletion = getFirstQueryCompletion();
                            safeApply(scope, function () {
                                autocompleteConfig.sageBarEnterCallback(firstQueryCompletion);
                            });
                        } else {
                            safeApply(scope, function () {
                                scope.select(scope.activeIdx, scope.activeListIdx, true);
                            });
                        }
                        break;
                    case blinkConstants.keyCodes.TAB_KEY:
                        // If any suggestion is highlighted, TAB does nothing.
                        if (scope.activeIdx !== -1 && scope.activeListIdx !== -1) {
                            return;
                        }

                        var firstQueryCompletion = getFirstQueryCompletion();
                        if (!!firstQueryCompletion && autocompleteConfig
                                .canFillCompletionOnSageBar(firstQueryCompletion)) {
                            populateInputFromCompletion(firstQueryCompletion);
                            safeApply(scope, function () {
                                autocompleteConfig.sageBarTabCallback(firstQueryCompletion);
                            });
                        }

                        break;
                }
            });


            function getFirstQueryCompletion() {
                var firstQueryCompletion;
                var firstList = scope.completionSections[0];
                if (firstList.type != sageUtil.CompletionType.ObjectResult
                    && firstList.type != sageUtil.CompletionType.Feedback) {
                    firstQueryCompletion = firstList.items[0];
                }
                return firstQueryCompletion;
            }

            function populateInputFromCompletion(item) {
                var label = autocompleteConfig.formatters.itemToString(item);
                var preCursorPos = getCaretPos();

                var needCaretPositionRestore = preCursorPos.selectionStart < $inputEl.val().length;
                $setModelValue(scope, label);
                if (needCaretPositionRestore) {
                    util.executeInNextEventLoop(function () {
                        // Restore the cursor position to the end of new selection.
                        var restoredCursorPosition =
                            autocompleteConfig.formatters.itemToPrefixString(item).length;
                        setCaretPos(restoredCursorPosition);
                    });
                }

            }

            function scheduleAutoCloseDropdown() {
                if (env.e2eTest || DROPDOWN_AUTO_CLOSE_DELAY === -1) {
                    return;
                }

                if (hideDropdownTimer) {
                    $timeout.cancel(hideDropdownTimer);
                }
                hideDropdownTimer = $timeout(function () {
                    hideDropdownTimer = null;

                // close dropdown only if there is no active element
                    if (scope.activeListIdx > -1 || scope.mouseInsideDropdown || !canAutoCloseDropdown(scope)) {
                        scheduleAutoCloseDropdown();
                    } else {
                        scope.showDropdown = false;
                    }
                }, DROPDOWN_AUTO_CLOSE_DELAY);
            }

            var waitTime = 100;
            var timeoutPromise;
            function onSageInputChanged(inputValue) {
                autocompleteConfig.onEdit();
                hasFocus = true;
                if (waitTime > 0) {
                    if (timeoutPromise) {
                        $timeout.cancel(timeoutPromise);  // cancel previous timeout
                    }
                    timeoutPromise = $timeout(function () {
                        getMatchingCompletionsAsync(inputValue, env.maxNumCompletionsInSage);
                    }, waitTime);
                } else {
                    getMatchingCompletionsAsync(inputValue, env.maxNumCompletionsInSage);
                }
            }

            function getMatchingCompletionsAsync(inputValue, maxCompletions) {
                var deferred = $q.defer();

                isLoadingSetter(scope, true);

                autocompleteConfig.getCompletions(maxCompletions).then(function (dropdownSections) {
                    isLoadingSetter(scope, false);
                // It might happen that several async queries were in progress if a user were typing fast
                // but we are interested only in responses that correspond to the current view value
                    if (inputValue === modelCtrl.$viewValue && hasFocus) {

                    // Check if there is at least one valid section.
                        var isValid = true;
                        if (!dropdownSections || !dropdownSections.length) {
                            isValid = false;
                        } else {
                            var numZeroLengthLists = 0;
                            for (var idx = 0; idx < dropdownSections.length; idx++) {
                                dropdownSections[idx].items = dropdownSections[idx].items || [];
                                if (dropdownSections[idx].items.length) {
                                    break;
                                }
                                numZeroLengthLists++;
                            }
                            if (numZeroLengthLists === dropdownSections.length) {
                                isValid = false;
                            }
                        }

                        if (isValid) {
                            resetDropdownScope();

                            scope.completionSections = dropdownSections;
                            initDropdownScope();
                            scope.query = inputValue;
                            scheduleAutoCloseDropdown();
                        } else {
                            resetDropdownScope();
                        }
                    }

                    deferred.resolve();

                }, function (error) {
                    _logger.warn('Query completions failed for', inputValue);
                    resetDropdownScope();
                    isLoadingSetter(scope, false);
                    deferred.reject(error);
                });

                return deferred.promise;
            }

            resetDropdownScope();

            scope.query = null;


        //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
        //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
            modelCtrl.$parsers.unshift(function (inputValue) {
                if (inputValue !== null) {
                    onSageInputChanged(inputValue);
                } else {
                    isLoadingSetter(scope, false);
                    resetDropdownScope();
                }

                return inputValue;
            });

        //pop-up element used to display matches
            var dropDownEl = angular.element('<sage-dropdown></sage-dropdown>');
            dropDownEl.attr({
                matches: 'completionSections',
                formatters: 'formatters',
                active: 'activeIdx',
                'active-list': 'activeListIdx',
                'hover-item': 'hoverItemIdx',
                'hover-list': 'hoverListIdx',
                'mouse-inside-dropdown': 'mouseInsideDropdown',
                select: 'select(activeIdx, activeListIdx)',
                query: 'query',
                'is-valid-popup-list': 'isValidPopupList',
                'get-item-template-url': 'autocompleteConfig.getItemTemplateUrl',
                'list-header-template-url': autocompleteConfig.listHeaderTemplateUrl,
                'ng-show': 'showDropdown',
                'get-lineage-dropdown': 'getLineageDropdown',
                'get-completion-tooltip': 'getCompletionTooltip',
                'get-more-completions': 'getMoreCompletions',
                'has-data-sources' : 'hasDataSources'
            });

            var $dropDownEl = angularUtil.getCompiledElement(dropDownEl, scope);
            $inputEl.after($dropDownEl);

            scope.getLineageDropdown = sageUtil.getLineageDropdown;

        /**
         * @param completion
         * @returns {string}
         */
            scope.getCompletionTooltip = function (completion) {
            // this is used to show tooltips on sage dropdown suggestions
            // currently there is no use case for it (the last one was
            // disabled by SCAL-5426). still keeping the code around
            // for any future needs.
                return '';
            };

        }

        return {
            require:'ngModel',
            restrict: 'A',
            link: linker
        };
    }]);

blink.app.directive('sageDropdown', ['Logger', 'blinkConstants', 'strings', function (Logger, blinkConstants, strings) {
    var _logger = Logger.create('sage-dropdown');

    function linker(scope, $container, attrs) {
        scope.listHeaderTemplateUrl = attrs.listHeaderTemplateUrl;
        var $dropdownElem = $container.find('.bk-dropdown-lists');

        scope.isOpen = function () {
            return scope.isValidPopupList;
        };

        scope.blinkConstants = blinkConstants;
        scope.strings = strings;

        scope.isActive = function (matchIdx, listIdx) {
            if (scope.hoverList > -1) {
                return scope.hoverItem == matchIdx && scope.hoverList == listIdx;
            }
            return scope.active == matchIdx && scope.activeList == listIdx;
        };

        scope.selectHoverState = function (matchIdx, listIdx) {
            scope.hoverItem = matchIdx;
            scope.hoverList = listIdx;
        };

        scope.selectMatch = function (activeIdx, activeListIdx) {
            scope.select({
                activeIdx:activeIdx,
                activeListIdx: activeListIdx
            });
        };

        scope.onMouseEnter = function () {
            scope.mouseInsideDropdown = true;
        };

        scope.onMouseLeave = function () {
            scope.mouseInsideDropdown = false;
        };

        scope.isScrollActive = function () {
            var dropdownElem = $dropdownElem[0];
            var hasScrollBar = dropdownElem.scrollHeight > dropdownElem.clientHeight;
            var onBottomOfScrollbar =
                (dropdownElem.scrollHeight - dropdownElem.scrollTop - dropdownElem.offsetHeight) < 1;
            return hasScrollBar && !onBottomOfScrollbar;
        };
    }

    return {
        restrict: 'E',
        scope:{
            matches:'=',
            query:'=',
            active:'=',
            activeList: '=',
            hoverItem: '=',
            hoverList: '=',
            isValidPopupList: '=',
            position:'=',
            formatters: '=',
            mouseInsideDropdown: '=',
            select:'&',
            getItemTemplateUrl: '&',
            getLineageDropdown: '&',
            getCompletionTooltip: '&',
            getMoreCompletions: '&',
            hasDataSources: '='
        },
        replace: true,
        templateUrl: 'src/modules/sage/sage-dropdown/sage-dropdown.html',
        link: linker
    };
}]);

