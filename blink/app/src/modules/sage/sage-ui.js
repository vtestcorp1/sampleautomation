/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview View for Sage
 */

'use strict';

blink.app.directive('blinkSage', ['$filter',
    '$timeout',
    'autoCompleteObjectUtil',
    'Logger',
    'env',
    'util',
    'sageUtil',
    'events',
    'session',
    'safeDigest',
    'safeApply',
    function ($filter,
              $timeout,
              autoCompleteObjectUtil,
              Logger,
              env,
              util,
              sageUtil,
              events,
              session,
              safeDigest,
              safeApply) {

        function linker(scope, element, attrs) {
            var logger = Logger.create('sage-ui');

            var $inputEl = $('input.bk-sage-real-input', element),
                $ghostTokensWrapperEl = $('.bk-sage-ghost-tokens', element),
                $ghostInputEl = $('.bk-sage-real-input-ghost', element),
                mousemoveTimer = null,
            // delay for processing mouse move events
                MOUSEMOVE_RESPONSE_DELAY = 100, // msecs

                MAX_DROPDOWN_WIDTH = 250;

            scope.getCaretInfo = function () {
                return $inputEl.range();
            };

            function getSageInputElemWidth () {
                return $inputEl.width();
            }

            function getLastSageTokenEndPosition() {
                var tokens = scope.sageClient.getSageModel().tokens,
                    left = 0;
                if (!tokens || !tokens.length) {
                    return 0;
                }

                var lastToken = tokens[tokens.length - 1];
                if (lastToken.cssProperties) {
                    left = tokens[tokens.length - 1].cssProperties.left + tokens[tokens.length - 1].cssProperties.width;
                } else {
                    left = sageUtil.getPixelWidthOfSageInputString(scope.sageInput);
                }

                return left;
            }

            scope.showSmallDropdownForInputLength = function () {
                return getLastSageTokenEndPosition() > 0.3 * getSageInputElemWidth();
            };

            scope.canShowSageGhostForInputLength = function () {
                return !scope.isSageSeverityError() && (!scope.sageInput ||
                    sageUtil.getPixelWidthOfSageInputString(scope.sageInput) < getSageInputElemWidth());
            };

            scope.getLeftPosition = function () {
                var sageModel = scope.sageClient.getSageModel();

                var inputElWidth = getSageInputElemWidth(),
                    tokens = sageModel.tokens,
                    dropDownLeft = 0;

                if (!!tokens) {
                    var left;
                    var matchingToken = sageModel.dropdownTokenIndex < tokens.length
                        ? tokens[sageModel.dropdownTokenIndex] : null;
                    // NOTE: Css properties here are set in the processSageModel inside sage controller.
                    // There is a possibility that they are not set before the getCompletions call is made
                    // by the drop down which in turn calls this function.
                    // TODO(Jasmeet): Remove the setting of css properties from the sage controller.
                    if (!!matchingToken && matchingToken.cssProperties) {
                        left = tokens[sageModel.dropdownTokenIndex].cssProperties.left;
                    } else {
                        // If dropDownTokenIndex was out of bounds, lets position based on the right of the last token.
                        left = getLastSageTokenEndPosition();
                    }

                    if (left !== null && left < inputElWidth - MAX_DROPDOWN_WIDTH) {
                        dropDownLeft = left;
                    } else {
                        dropDownLeft = inputElWidth - MAX_DROPDOWN_WIDTH;
                    }
                }

                return dropDownLeft;
            };

            // By default we do not ask for only exact matches
            scope.requestOnlyExactMatches = false;

            scope.mouseEnterOnInput = function () {
                scope.isMouseOverInput = true;
            };

            scope.mouseLeaveOnInput = function () {
                scope.isMouseOverInput = false;
                scope.$broadcast(events.HIDE_SAGE_BUBBLE_D);
            };

            scope.removeFocus = function() {
                $inputEl.blur();
            };

            scope.setFocus = function() {
                $inputEl.focus();
            };

            $inputEl.mousemove(function (e) {
                if (mousemoveTimer) {
                    $timeout.cancel(mousemoveTimer);
                    mousemoveTimer = null;
                }
                // Note(joy): can't put this in an else since the previous block can activate this block
                if (!mousemoveTimer) {
                    mousemoveTimer = $timeout(function () {
                        mousemoveTimer = null;
                        if (!scope.isMouseOverInput) {
                            return;
                        }

                        // This takes case of misalignment between input and ghost layer
                        $ghostTokensWrapperEl.scrollLeft($inputEl.scrollLeft());

                        var activeTokenInfo = getActiveTokenInfoUnderCursor(e),
                            activeToken = activeTokenInfo.token,
                            bubbleShown = false;
                        if (!!activeToken) {
                            var bubbleContent = new util.NameValuePairs(activeToken.getTokenMetaInfo()).getTemplate(),
                                severity = 0,
                                errorInfo = scope.sageClient.getSageModel().sageResponseErrorInfo,
                                activeTokenIndex = activeTokenInfo.tokenIndex;
                            if (activeToken.isUnrecognized()
                                && !!errorInfo.errorMessage
                                && activeTokenIndex >= errorInfo.errorMessagePosition
                                && activeTokenIndex <= errorInfo.errorMessagePosition + errorInfo.errorSpan) {
                                // no bubble content for unrecognized token when there is no error message from sage server relevant for this token
                                bubbleContent = errorInfo.errorMessage;
                                severity = errorInfo.severity;
                            }
                            if (!!bubbleContent) {
                                scope.$broadcast(events.SHOW_SAGE_BUBBLE_D, {
                                    content: bubbleContent,
                                    severity: severity,
                                    isSticky: false,
                                    force: true,
                                    onShow: angular.noop,
                                    onHide: angular.noop
                                });
                                bubbleShown = true;
                            }
                        }

                        if (!bubbleShown) {
                            scope.$broadcast(events.HIDE_SAGE_BUBBLE_D);
                        }
                    }, MOUSEMOVE_RESPONSE_DELAY);
                }
            });

            $inputEl.blur(function () {
                scope.sageBarHasFocus = false;
                scope.tokenIndexWithCursor = -1;
            });

            $inputEl.focus(function () {
                scope.sageBarHasFocus = true;
            });

            // TODO (Shikhar) - is this needed?
            if (scope.sageInput) {
                if ($.browser.msie) {
                    // HACK(vibhor): We need this timeout to be able to give IE opportunity to render sage bar and then set the
                    // input manually to be able to set the cursor in the right position.
                    $timeout(function () {
                        $inputEl.val(scope.sageInput);
                    }, 500);
                } else {
                    $inputEl.val(scope.sageInput);
                }
            }

            /**
             * @param mouseEvt
             * @return {Object}
             */
            function getActiveTokenInfoUnderCursor(mouseEvt) {
                var ghostTokenEls = $('.bk-sage-ghost-token'),
                    activeToken = null,
                    activeTokenIndex = -1;
                angular.forEach(ghostTokenEls, function (el, i) {
                    var $el = $(el),
                        elPageLeft = $el.offset().left;
                    $el.removeClass('bk-highlight-active');
                    // pageX and elPageLeft use the top left corner of the window as origin
                    if (mouseEvt.pageX >= elPageLeft && mouseEvt.pageX <= elPageLeft + el.offsetWidth) {
                        $el.addClass('bk-highlight-active');
                        activeToken = scope.getTokens()[i];
                        activeTokenIndex = i;
                    }
                });
                return {
                    token: activeToken,
                    tokenIndex: activeTokenIndex
                };
            }

            function showGhostLayers(show) {
                var visibility = show ? '' : 'hidden';
                $ghostTokensWrapperEl.css('visibility', visibility);
                $ghostInputEl.css('visibility', visibility);
            }

            /**
             * Whenever a token is found to be in error and underlined in red, we show the "no match" sage bubble positioned
             * horizontally in the middle of the underlined token.
             *
             * @param {number} errorTokenIndex
             *
             * @return {number} the left position
             */
            scope.getTokenLeftPosition = function (errorTokenIndex) {
                var errorTokenEl = $('.bk-sage-ghost-token')[errorTokenIndex];
                return errorTokenEl ? errorTokenEl.offsetLeft : 0;
            };

            /**
             * @param {number} errorTokenIndex
             *
             * @return {number} the right position
             */
            scope.getTokenWidth = function (errorTokenIndex) {
                var errorTokenEl = $('.bk-sage-ghost-token')[errorTokenIndex];
                return errorTokenEl ? $(errorTokenEl).width() : 0;
            };

            // Note(joy): Figure out why jQuery's offset().left gives a higher value than offsetLeft.
            scope.getLastTokenRightPosition = function () {
                var $lastToken = $('.bk-sage-ghost-token:last');
                return $lastToken.length ? $lastToken[0].offsetLeft + $lastToken.width() : 0;
            };

            scope.showGhostLayers = showGhostLayers;

            scope.openDropDown = function () {
                $inputEl.trigger('sageAutocomplete.openDropdown');
            };

            scope.closeDropDown = function () {
                $inputEl.trigger('sageAutocomplete.closeDropdown');
                scope.shouldShowInputGhost = false;
            };

            $inputEl.bind('sageAutocomplete.changeActiveElementOnArrowKeys', function (evt, listIndex, elemIndex) {
                if (listIndex >= 0 && elemIndex >= 0) {
                    scope.shouldShowInputGhost = false;
                    safeApply(scope);
                } else {
                    if (scope.isGhostTextApplicable()) {
                        scope.shouldShowInputGhost = true;
                        safeApply(scope);
                    }
                }
            });

            scope.isGhostTextApplicable = function () {
                if (!scope.sageInputGhost) {
                    return false;
                }

                return scope.sageInputGhost.indexOf($inputEl.val()) === 0;
            };

            // Sage is now ready for action.
            scope.$emit(events.SAGE_LOADED_U);

            util.executeInNextEventLoop(function () {
                if (scope.sageSearchOnInit) {
                    $inputEl.focus();
                    scope.openDropDown();
                } else {
                    $inputEl.blur();
                }
            });

            scope.tokenIndexWithCursor = -1;

            scope.isTokenTargetOfCursor = function (token, index) {
                // When selecting options from dropdown, we update the input dom value but not update the model until
                // user confirms. In that case, we do not want to turn on any caret based underlining.
                if ($inputEl.val() != scope.sageInput) {
                    return false;
                }

                // If we have not found a token that can claim to contain the token, no token is eligible to get
                // that style.
                if (scope.tokenIndexWithCursor < 0) {
                    return false;
                }

                // If the token to test is unrecognized and it is part of the series of unrecognized tokens that includes
                // the cursor, then we want to highlight this token as well.
                if (token.isNonEmptyUnrecognizedToken() && isInProximityOfUnrecognizedTokenWithCursor(index)) {
                    return true;
                }

                // Finally, the token itself that contains the cursor.
                return index === scope.tokenIndexWithCursor;
            };

            function isInProximityOfUnrecognizedTokenWithCursor(testIndex) {
                var sageModel = scope.sageClient.getSageModel();

                if (isNaN(testIndex) || isNaN(scope.tokenIndexWithCursor) ||
                    scope.tokenIndexWithCursor < 0 || scope.tokenIndexWithCursor >= sageModel.tokens.length) {
                    return false;
                }

                var tokenWithCursor = sageModel.tokens[scope.tokenIndexWithCursor];

                if (!tokenWithCursor.isNonEmptyUnrecognizedToken()) {
                    return false;
                }

                // Finds whether the test token is in the range of contiguous unrecognized tokens, one of which is the
                // cursor target token.
                var startIndex, endIndex;
                if (testIndex <= scope.tokenIndexWithCursor) {
                    startIndex = testIndex;
                    endIndex = scope.tokenIndexWithCursor;
                } else {
                    startIndex = scope.tokenIndexWithCursor;
                    endIndex = testIndex;
                }

                for (var i = startIndex; i <= endIndex; ++i) {
                    if (!sageModel.tokens[i].isNonEmptyUnrecognizedToken()) {
                        return false;
                    }
                }

                return true;
            }

            scope.updateCaretState = function () {
                var sageModel = scope.sageClient.getSageModel();

                scope.tokenIndexWithCursor = -1;
                // On a range selection, do not bother maintaining any caret based highlighting state.
                if ($inputEl[0].selectionStart != $inputEl[0].selectionEnd) {
                    return;
                }

                if (!sageModel || !sageModel.tokens || !sageModel.tokens.length) {
                    return;
                }


                // Each token has been annotated with the start position within the input string. This is done by
                // controller calling sageUtil.setTokenPositions().
                // We traverse the whole array and find the token that contains the current cursor position.
                // TODO(vibhor): Using range map, this can be reduced to logN search.

                var cursorPos = $inputEl[0].selectionStart,
                    tokens = sageModel.tokens,
                    numTokens = tokens.length;

                for (var i = 0; i < numTokens; ++i) {
                    var boundaryStart = tokens[i].startPosition,
                        boundaryEnd = boundaryStart + tokens[i].getTokenText().length;

                    // For recognized tokens, we consider the position just before and just after the token as not inside
                    // the context of token and show completions that will add to the query before and after the token
                    // respectively.
                    // However, for an unrecognized token (or series of such tokens), we want to consider the boundaries
                    // as well for suggesting matches to bind the token(s).
                    // The underline caret state should reflect that too.
                    if (tokens[i].isNonEmptyUnrecognizedToken()) {
                        boundaryEnd++;
                        boundaryStart--;
                    }

                    if (cursorPos > boundaryStart && cursorPos < boundaryEnd) {
                        scope.tokenIndexWithCursor = i;
                        break;
                    }
                }
            };

            function handleLeftRightArrowKeys(evt) {
                if (evt.which != $.ui.keyCode.LEFT && evt.which != $.ui.keyCode.RIGHT) {
                    return;
                }

                safeApply(scope, function () {
                    scope.updateCaretState();
                    scope.openDropDown();
                });
            }

            $inputEl.on('keydown', util.debounce(handleLeftRightArrowKeys, 250));

            scope.hideBoxLayer = function (queryFragment) {
                if (!$inputEl || !$inputEl.length) {
                    return;
                }

                // Normalize the sage input to get rid of any extra white spaces.
                scope.sageInput = (scope.sageClient.getSageModel().tokens || []).map('getTokenTextLowerCase').join(' ').trim();
                // When ui is asked to hide the box layer, it is assumed that the focus should come back to the
                // input element. However, just calling focus() once is not good enough because when out of focus
                // the parent of input element is hidden. Thus focus will unhide the elements but not bring the cursor
                // in focus.
                //
                // First focus call to unhide the input element parent dom tree.
                $inputEl.focus();
                var startCursorPos = scope.sageInput.length,
                    endCursorPos = startCursorPos;

                // If a query fragment was clicked to hide the box layer, then we need to find the corresponding word
                // positions in the sage input that we can use to highlight with caret.
                if (queryFragment) {
                    startCursorPos = queryFragment.getStartCursorPosition();
                    endCursorPos = queryFragment.getEndCursorPosition();
                }
                util.executeInNextEventLoop(function () {
                    // Second focus to actually set the cursor on input element.
                    $inputEl.focus();
                    // Restore the caret position(s) to reflect the user click.
                    $inputEl[0].selectionStart = startCursorPos;
                    $inputEl[0].selectionEnd = endCursorPos;
                    if (!queryFragment || queryFragment.isReplacable()) {
                        scope.openDropDown();
                    }
                });

                scope.resetExpandedBoxLayer();
                element.find('.bk-boxed-token-layer br[data-auto-inserted]').remove();
            };

            scope.onQueryFragmentClick = function ($event, queryFragment) {
                $event.stopPropagation();
                scope.hideBoxLayer(queryFragment);
            };

            scope.onQueryFragmentDeletion = function ($event, queryFragment) {
                $event.stopPropagation();

                var sageModel = scope.sageClient.getSageModel();

                // using a temp copies here to prevent corruption of the sage cache.
                var tempQueryFragments = angular.copy(sageModel.queryFragments),
                    tempTokens = angular.copy(sageModel.tokens);
                tempQueryFragments.splice(tempQueryFragments.indexOf(queryFragment), 1);
                tempTokens.splice(queryFragment.getStartTokenPosition(), queryFragment.getNumTokens());

                var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                tableRequest.setInputTokens(tempTokens);
                scope.sageClient.editTable(tableRequest);
            };

            scope.doesBoxLayerHaveMultiLines = function () {
                var $boxLayer = element.find('.bk-boxed-token-layer');
                if (!$boxLayer.length) {
                    return false;
                }
                return $boxLayer.outerHeight() < $boxLayer[0].scrollHeight;
            };

            var SAGE_BAR_DEFAULT_HEIGHT = element.height();
            scope.onMouseOverSageBar = function () {
                if (!scope.shouldShowBoxLayer()) {
                    return;
                }

                if (!scope.doesBoxLayerHaveMultiLines()) {
                    return;
                }

                var $boxLayer = element.find('.bk-boxed-token-layer');

                // Delta between the display height and scrollable container height is the amount to increase the
                // container height.
                // There are 2 things that need to be updated here:
                // 1. Container of the phrase boxes (.bk-boxed-token-layer)
                // 2. The sage-bar inner container (so that we can make it appear that whole sage bar ui has expanded).
                //
                // Ideally, we would just expand the content and the container should automatically adjust but because
                // there are components that are absolutely positioned in this DOM heirarchy, we do the following.
                var newBottom = SAGE_BAR_DEFAULT_HEIGHT - $boxLayer[0].scrollHeight;
                $boxLayer.css('bottom', newBottom + 'px');
                $boxLayer.addClass('bk-expanded');

                var $sageInner = element.find('.bk-sage-inner'),
                    sageHeight = $sageInner.height();

                $sageInner.height(sageHeight - newBottom);
            };

            scope.resetExpandedBoxLayer = function () {
                element.find('.bk-boxed-token-layer').css('bottom', 0 + '').removeClass('bk-expanded');
                element.find('.bk-sage-inner').height(SAGE_BAR_DEFAULT_HEIGHT);
            };

            scope.onMouseOutOfSageBar = function () {
                scope.resetExpandedBoxLayer();
            };
        }

        return {
            restrict: 'E',
            replace: true,
            scope: {
                sageClient: '=',
                //Note (Shikhar/Vibhor) - & would be better option here. But we found out that in certain  cases this was
                // null even though model was non-null.
                sageSearchOnInit: '=',
                onForceInvalidSearch: '=',
                onSearchCorrected: '=',
                onEdit: '='
            },
            link: linker,
            templateUrl: 'src/modules/sage/sage.html',
            controller: 'SageController'
        };
    }]);
