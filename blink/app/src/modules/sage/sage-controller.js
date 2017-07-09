/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com), Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Controller for Sage
 */

'use strict';

blink.app.controller('SageController', ['$scope',
    '$q',
    'autoCompleteObjectUtil',
    'blinkConstants',
    'strings',
    'env',
    'events',
    'Logger',
    'navService',
    'sageDataScopeService',
    'sageUtil',
    'userDialogs',
    'util',
    function ($scope,
          $q,
          autoCompleteObjectUtil,
          blinkConstants,
          strings,
          env,
          events,
          Logger,
          navService,
          sageDataScopeService,
          sageUtil,
          userDialogs,
          util) {

        var _logger = Logger.create('sage-controller'),
            INITIAL_MAX_OBJECT_RESULTS = 3;

    /**
     * @type {AnswerSageClient}
     */
        var _sageClient = $scope.sageClient;
    /**
     * @type {SageModel}
     */
        var _sageModel;

    // Note (Rahul): This private state flag represents that the next auto-complete suggestions list
    // should not require fetching data from sage. Current there are 2 cases where this is needed.
    // 1. For multi-step join path resolution we have all the suggestions at clients end itself.
    // 2. On select callback from dropdown, we update tokens and its suggestions can directly be used in dropdown.
        var _skipServerRoundTrip;

        function initializeModel() {
            _sageModel = _sageClient.getSageModel();
            _skipServerRoundTrip = false;
            initializeScopeProperties();
            processSageModel();
        }

        function initializeScopeProperties() {

        /**
         * To track if user is typing or deleting
         * @type {string}
         */
            $scope.prevSageInput = '';

        /**
         * Tied to the input element
         * @type {string}
         */
            $scope.sageInput = '';

        /**
         * Tied to the ghost input element in the middle layer between real input and the token layer.
         * Acts as a shadow of the input, and provides the ghost suggestion. For example,
         * sageInput is 'reve' but sageInputGhost is 'revenue'
         * @type {string}
         */
            $scope.sageInputGhost = '';

        /**
         * This boolean controls if the error indicator for error/warning/suggestion shall be shown as activated or not
         * at the left edge of sage bar.
         *
         * @type {boolean}
         */
            $scope.sageStickyBubbleShowing = false;
        }

        function configureScopeMethods() {

            $scope.getTokens = function () {
                return _sageModel.tokens;
            };

        // this is called for each keystroke in sage input.
            $scope.getSageCompletionForAutocomplete = function (callback) {

                handleSageInputChange();

                if (!$scope.isGhostTextApplicable()) {
                    $scope.shouldShowInputGhost = false;
                }

                var onSuccess = function() {
                    if ($scope.isGhostTextApplicable()) {
                        $scope.shouldShowInputGhost = true;
                    }
                    callback();
                };

                var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                tableRequest.setInputTokens(_sageModel.tokens);
                tableRequest.setCurrentlyEditedToken(_sageModel.tokenUnderCaret);
                tableRequest.setCursorOffsetInToken(_sageModel.caretPositionFromTokenStart);
                _sageClient.editTable(tableRequest, true)
                .then(onSuccess);
            };

            $scope.showIntelligentAlert = function (params) {
            // Early terminate in the case of suggestions.
                if (_sageModel.sageResponseErrorInfo.severity == 3) {
                    return;
                }

            // If bubble is already showing, then hide it
                if ($scope.sageStickyBubbleShowing) {
                    $scope.$broadcast(events.HIDE_SAGE_BUBBLE_D, true);
                    $scope.sageStickyBubbleShowing = false;
                    return;
                }

                var errorInfo = _sageModel.sageResponseErrorInfo;
                params = params || {};

                $scope.$broadcast(events.SHOW_SAGE_BUBBLE_D, {
                    content: errorInfo.errorMessage,
                    severity: errorInfo.severity,
                    isSticky: true,
                    force: !!params.force,
                    onShow: function() {
                    // Deactivate the error indicator when showing the message bubble
                        $scope.sageStickyBubbleShowing = true;
                    },
                    onHide: function() {
                        $scope.sageStickyBubbleShowing = false;
                    }
                });
            };

        /**
         * Used to determine if bk-error/warning and bk-error/warning-last classes can be added to ghost tokens for underlining purposes.
         *
         * @param {sage.RecognizedToken} rToken
         * @param {number} tokenIndex
         * @param {boolean} shallCheckForLastToken
         * @param {number} severity - error or warning
         * @return {boolean}
         */
            function isVisibleErrorOrWarningToken(rToken, tokenIndex, shallCheckForLastToken, severity) {
                var errorInfo = _sageModel.sageResponseErrorInfo,
                    possible = rToken.isUnrecognized()
                    && !!errorInfo.errorMessage
                    && errorInfo.severity == severity;
                if (!shallCheckForLastToken) {
                    return possible && tokenIndex < (errorInfo.errorMessagePosition + errorInfo.errorSpan);
                } else {
                    return possible && tokenIndex === (errorInfo.errorMessagePosition + errorInfo.errorSpan - 1);
                }
            }


            $scope.isVisibleErrorToken = function (rToken, tokenIndex, shallCheckForLastToken) {
                return isVisibleErrorOrWarningToken(rToken, tokenIndex, shallCheckForLastToken,
                sage.ErrorSeverity.ERROR);
            };

            $scope.isVisibleWarningToken = function (rToken, tokenIndex, shallCheckForLastToken) {
                return isVisibleErrorOrWarningToken(rToken, tokenIndex, shallCheckForLastToken,
                sage.ErrorSeverity.WARNING);
            };

            $scope.isJoinPathWorkingToken = function (rToken, tokenIndex) {
                if (!_sageModel.needsJoinPathDisambiguation()) {
                    return false;
                }
                return tokenIndex === _sageModel.joinDisambiguationHelper.getWorkingTokenIndex();
            };

            $scope.requestJoinPathChoices = function () {
                var copyOfTokens = angular.copy(_sageModel.tokens);
                if (_sageModel.dropdownTokenIndex < 0 || _sageModel.dropdownTokenIndex >= copyOfTokens.length) {
                    _logger.error('Unexpected token under cursor', _sageModel.dropdownTokenIndex);
                    return;
                }
                var tokenUnderCursor = copyOfTokens[_sageModel.dropdownTokenIndex];
                tokenUnderCursor.setExplicitJoinPathEdit(true);

                var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                tableRequest.setInputTokens(copyOfTokens);
                _sageClient.editTable(tableRequest);
            };

            function shouldShowSmallDropdown() {
            // Show small dropdown if any of the following is true:
            // 1. Edit in the middle.
            // 2. User screen already has a result for a prior query and is building on the query with 3 or more tokens.
            // 3. (Catch all) if the total length of sage query exceeds 30% of sage bar width (on a really small screen).
                return ($scope.showSmallDropdownForInputLength()) ||
                (_sageModel.tokens.length > env.numTokensThresholdForSmallDropdown) ||
                getExpectedCaretPosition() < $scope.sageInput.length;
            }

            $scope.autocompleteConfig = {
                onEdit: function () {
                    $scope.onEdit();
                },
                listHeaderTemplateUrl: 'src/modules/sage/sage-dropdown/sage-dropdown-header.html',
                dropdownAutoCloseDelay: -1,
                getItemTemplateUrl: function (item, list) {
                    if (!list) {
                        return;
                    }
                    switch (list.type) {
                        case sageUtil.CompletionType.ObjectResult:
                            return 'src/modules/sage/sage-dropdown/sage-object-result-dropdown-item.html';
                        case sageUtil.CompletionType.Feedback:
                            return 'src/modules/sage/sage-dropdown/sage-feedback-dropdown-item.html';
                        default:
                            if (item.isSearchHistoryCompletion()) {
                                return 'src/modules/sage/sage-dropdown/sage-search-history-dropdown-item.html';
                            }
                            return 'src/modules/sage/sage-dropdown/sage-default-dropdown-item.html';
                    }
                },
                formatters: {
                    itemToPrefixString: function (queryCompletion) {
                        if (!queryCompletion) {
                            return '';
                        }

                        var prefixString = queryCompletion.getPrefixTokensQueryString();
                        if (prefixString) {
                            return prefixString + ' ' + queryCompletion.getNewTokensQueryString() + ' ';
                        }

                        return queryCompletion.getNewTokensQueryString() + ' ';
                    },
                    itemToString: function (queryCompletion) {
                        return queryCompletion.getQueryStringDropdown();
                    },
                    getMatchHighlightClass: function () {
                        return 'resolved-token';
                    }
                },
                getCompletions: function (maxCompletions) {
                    var deferred = $q.defer();

                    var $dropdown = $('.bk-dropdown-wrapper');

                    var onSageModelUpdated = function () {

                        function getSageFeedbackList () {
                            var feedbackList = {};
                            feedbackList.type = sageUtil.CompletionType.Feedback;
                            feedbackList.displayText = strings.sageUserFeedback.GIVE_FEEDBACK;
                        // Insert one dummy object.
                            feedbackList.items = [{}];
                            return feedbackList;
                        }

                        var lists = [],
                            hasErrorsOrWarns = false,
                            shdShowSmallDropdown = shouldShowSmallDropdown();
                        if (angular.isDefined(_sageModel.sageResponseErrorInfo.severity)
                        && (_sageModel.sageResponseErrorInfo.severity !== sage.ErrorSeverity.SUGGESTION)
                        && _sageModel.sageResponseErrorInfo.errorMessagePosition === _sageModel.dropdownTokenIndex) {
                        // We only show error for the cases when suggestions are for the index where the error is present.
                            hasErrorsOrWarns = true;
                        }

                        if (_sageModel.needsJoinPathDisambiguation()) {
                            hasErrorsOrWarns = true;
                            shdShowSmallDropdown = true;
                        }

                        var queryCompList = {};
                        var queryCompListSyn = {};
                        queryCompListSyn.items = [];
                        queryCompList.type = sageUtil.CompletionType.QueryCompletion;
                        queryCompList.items = getMainQueryCompletions();
                        var result = util.splitMatchingObjectsOfArray(queryCompList.items,
                        function(compl) {
                            return compl.isSynonymCompletion();
                        }, true
                    );
                        queryCompListSyn.items = result.matching;
                        queryCompList.items = result.nonMatching;
                        var hasAnyRewriteCompletion = queryCompList.items.any(function(compl) {
                            return compl.isRewriteCompletion();
                        });

                        if (hasAnyRewriteCompletion || queryCompListSyn.items.length > 0) {
                            shdShowSmallDropdown = false;
                        }

                    // Determine if any completion has user typed search text.
                        var hasUserSearchText = queryCompList.items.any(function (compl) {
                            return !!compl.getSearchText();
                        });

                        queryCompList.paging = {
                            pageSize: env.maxNumCompletionsInSage,
                            allowExpansion: hasUserSearchText || shdShowSmallDropdown,
                            showAllInSecondPage: true
                        };

                    // In case of error or warning, we want to set a higher limit.
                        if (hasErrorsOrWarns) {
                            queryCompList.paging.pageSize = env.maxCompletionsInSageForAmbiguity;
                        }

                        queryCompList.css = 'bk-completions-list';
                        queryCompList.requiresFullLineage = _sageModel.requiresFullLineage;
                    // Set attributes for synonym completion section.
                        queryCompListSyn.paging = queryCompList.paging;
                        queryCompListSyn.css = 'bk-completions-list';
                        queryCompListSyn.requiresFullLineage = _sageModel.requiresFullLineage;
                        queryCompListSyn.type = sageUtil.CompletionType.SynonymCompletion;

                        lists.push(queryCompList);
                        lists.push(queryCompListSyn);

                        var hasAtLeastOneSuggestion = (queryCompList.items.length + queryCompListSyn.items.length) > 0;

                        if (hasErrorsOrWarns) {
                            queryCompList.type =
                            _sageModel.sageResponseErrorInfo.severity === sage.ErrorSeverity.ERROR ?
                                sageUtil.CompletionType.ErrorQueryCompletion : sageUtil.CompletionType.WarnQueryCompletion;
                            queryCompList.errorInfo = _sageModel.sageResponseErrorInfo;
                        } else if ($scope.canEditJoinPath) {
                            queryCompList.type = sageUtil.CompletionType.EditJoinPath;
                            shdShowSmallDropdown = true;
                            queryCompList.misc = {
                                tokenForEditMapping: _sageModel.tokens[_sageModel.dropdownTokenIndex],
                                requestJoinPathEdit: function () {
                                    $scope.closeDropDown();
                                    $scope.requestJoinPathChoices();
                                }
                            };
                        }

                        if (queryCompList.items.any(function (compl) {
                            return compl.isOutOfScopeCompletion();
                        })) {
                            queryCompList.type = sageUtil.CompletionType.OutOfScopeCompletion;
                            _sageModel.sageResponseErrorInfo.severity = sage.ErrorSeverity.SUGGESTION;
                        }

                        if (!shdShowSmallDropdown) {
                            var objectResultList = {};
                            objectResultList.type = sageUtil.CompletionType.ObjectResult;
                            objectResultList.items = _sageModel.objectResults;
                            objectResultList.paging = {
                                pageSize: INITIAL_MAX_OBJECT_RESULTS,
                                showAllInSecondPage: true,
                                allowExpansion: true
                            };
                            lists.push(objectResultList);
                        }

                        if (_sageClient.isSageUserFeedbackEnabled() &&
                        hasAtLeastOneSuggestion) {
                            lists.push(getSageFeedbackList());
                        }

                        if (shdShowSmallDropdown) {
                            $dropdown.css('left', $scope.getLeftPosition());
                            $dropdown.css('right', '');
                            queryCompList.smallMode = true;
                            queryCompListSyn.smallMode = true;
                        } else {
                            $dropdown.css('left', -35);
                        }

                        deferred.resolve(lists);
                    };

                    if (!_skipServerRoundTrip) {
                        $scope.getSageCompletionForAutocomplete(onSageModelUpdated, maxCompletions);
                    } else {
                        onSageModelUpdated();
                        _skipServerRoundTrip = false;
                    }

                    return deferred.promise;
                },
                getMoreCompletions: function (suggestionSection) {
                    var deferred = $q.defer();

                    var successCallback = function() {
                        suggestionSection.items = _sageModel.queryCompletions;
                        suggestionSection.requiresFullLineage = suggestionSection.requiresFullLineage ||
                        _sageModel.requiresFullLineage;

                        deferred.resolve();
                    };
                    var errorCallback = function() {
                        deferred.reject();
                    };

                    var tableRequest = sageUtil.getViewMoreRequest(_sageModel);
                    _sageClient.editTable(tableRequest, true)
                    .then(successCallback, errorCallback);

                    return deferred.promise;
                },
                canFillCompletionOnSageBar: function (item) {
                // If there is no ghost showing, can not fill.
                    if (!$scope.shouldShowInputGhost || !$scope.sageInputGhost) {
                        return false;
                    }

                    var fullCompletionText = this.formatters.itemToString(item);
                // Full completion only makes sense if the current sage input is a prefix of it
                    if (fullCompletionText.indexOf($scope.sageInput.trim()) !== 0) {
                        return false;
                    }

                    return true;
                },
                updateQueryWithQueryCompletion: function (queryCompletion) {
                    var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();

                    var tokens = queryCompletion.getAllTokens();
                    _sageModel.setTokens(tokens);

                    tableRequest.setInputTokens(tokens);
                    tableRequest.setCurrentlyEditedToken(_sageModel.tokens.length);
                    _sageClient.editTable(tableRequest, true)
                        .then(function() {
                            $scope.openDropDown();
                        });
                },
                sageBarTabCallback: function (queryCompletion) {
                    this.updateQueryWithQueryCompletion(queryCompletion);
                },
                sageBarEnterCallback: function (queryCompletion) {
                    // Case 1:
                    // Single unrecognized token and use likes(This is a non folded completion)
                    // the first suggestion and presses enter.
                    // System selects first suggestion
                    // Case 2:
                    // User is seeing MJP resolution.
                    // Currently search doctor doesnt help here so noop. TBD PM/Design
                    // Case 3: Valid query displayed
                    // Box the sage bar
                    // Default:
                    // Open search doctor.

                    if (_sageModel.needsJoinPathDisambiguation()) {
                        // case 2
                        // TBD
                    } else if (_sageModel.hasUnrecognizedTokens()) {
                        if (_sageModel.hasOneUnrecognizedTokens() &&
                            (!!queryCompletion
                            && !queryCompletion.isFoldedCompletion())) {
                            // case 1
                            $scope.select(0, 0, true /*close dropdown*/);
                            $scope.removeFocus();
                            $scope.closeDropDown();
                        } else {
                            // default case
                            $scope.removeFocus();
                            $scope.closeDropDown();
                            var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();

                            tableRequest.setInputTokens(_sageModel.tokens);
                            tableRequest.setCurrentlyEditedToken(_sageModel.tokenUnderCaret);
                            _sageClient.editTable(tableRequest, true)
                                .then(function() {
                                    $scope.onForceInvalidSearch(_sageModel);
                                });
                        }
                    } else {
                        // valid query, box tokens
                        $scope.removeFocus();
                        $scope.closeDropDown();
                    }
                },
                objectResultCallback: function (completion) {
                    var objectUrl = '{type}/{id}'.assign({
                        type: completion.isAnswer() ? 'saved-answer' : 'pinboard',
                        id: completion.getId()
                    });
                    navService.goToPath(objectUrl);
                },
                feedbackResultCallback: function () {
                    userDialogs.showSageFeedbackDialog(_sageClient.getReplayRequest(), function () {
                        $scope.setFocus();
                    });
                },
                joinPathResultCallback: function (queryCompletion) {
                    // User selected a choice from join dropdown, close it and it will be reopened again either as a
                    // result of a new sage response (when MJP is completed) or it will be reopened for the next set
                    // of choices (see below).
                    $scope.closeDropDown();
                    _sageModel.joinDisambiguationHelper.getCurrentQuestion().selectedOption = queryCompletion.getJoinOption();
                    var nextChoices = _sageModel.joinDisambiguationHelper.pruneChoicesAndUpdateQuestion(queryCompletion.getJoinOption());
                    if (nextChoices) {
                        _sageModel.dropdownTokenIndex = _sageModel.joinDisambiguationHelper.getWorkingTokenIndex();
                        // We are in the middle of MJP workflow and there are more steps to be completed, we want to
                        // continue showing the remaining steps from join choices instead of using the completions from
                        // server (server completions will be from before MJP triggered).
                        _skipServerRoundTrip = true;
                        // Wait for new choices to be computed and available before opening dropdown again.
                        util.executeInNextEventLoop(function () {
                            $scope.openDropDown();
                        });
                    } else {

                        var tableRequest =  sageUtil.getTableRequestForStandardCompletion(
                            _sageModel.tokens,
                            _sageModel.tokens.length);

                        dispatchSageRequestFromCompletion(
                            tableRequest,
                            false /* dont close dropdown*/ );
                    }
                },
                queryCompletionCallback: function (queryCompletion, closeDropDown) {
                    if (_sageModel.needsJoinPathDisambiguation() &&
                        queryCompletion.getCompletionType() === sage.QueryCompletion.CompletionTypes.JOIN) {
                        this.joinPathResultCallback(queryCompletion);
                    } else {
                        // we update currentModel sageModel based on the tokens of the completion
                        _sageModel.updateTokensFromCompletion(queryCompletion, _sageModel);
                        // tableRequest properties are purely based on sageModel
                        var tableRequest = sageUtil.getTableRequestForCompletion(queryCompletion, _sageModel);
                        dispatchSageRequestFromCompletion(
                            tableRequest,
                            closeDropDown);
                    }
                }
            };

            function dispatchSageRequestFromCompletion(tableRequest, closeDropDown) {
                _sageClient.editTable(tableRequest, true)
                    .then(function () {
                        _skipServerRoundTrip = true;
                        // dropdown can be closed due to some heuristics
                        if (!closeDropDown) {
                            $scope.openDropDown();
                        }
                    });
            }


            $scope.isSageSeverityError = function () {
                return _sageModel.sageResponseErrorInfo &&
                _sageModel.sageResponseErrorInfo.severity === sage.ErrorSeverity.ERROR;
            };

            $scope.shouldShowBoxLayer = function () {
                if (!_sageModel.queryFragments || !_sageModel.queryFragments.length) {
                    return false;
                }

                if ($scope.sageBarHasFocus || !$scope.sageInput) {
                    return false;
                }

                return true;
            };

            $scope.onMouseOverQueryFragment = function (evt, queryFragment) {
                if (!queryFragment.hasTokensOfSameKind()) {
                    return;
                }

                var anchorToken = queryFragment.getAnchorToken();

                if (!anchorToken) {
                    return;
                }

                $scope.$broadcast(events.SHOW_SAGE_BUBBLE_D, {
                    content: new util.NameValuePairs(anchorToken.getTokenMetaInfo()).getTemplate(),
                    isSticky: false,
                    force: true,
                    onShow: angular.noop,
                    onHide: angular.noop
                });
            };
            $scope.onMouseOutOfQueryFragment = function () {
                $scope.$broadcast(events.HIDE_SAGE_BUBBLE_D, true);
            };
        }

        function configureScopeHandlers() {
            $scope.$watch(function dataSourcesWatch() {
                return sageDataScopeService.getSources();
            }, function dataSourcesWatchAction(newValue, oldValue) {
                if (util.areArraysSameSet(newValue, oldValue)) {
                    return;
                }
                $scope.sageInputGhost = '';
                $scope.hasDataSources = newValue.length;
            }, true);

            $scope.sageInput = _sageModel.getCompleteSageInput(false);


            _sageClient.addSageModelUpdateCallback(processSageModel);

            $scope.$on('$destroy', function() {
                _sageClient.removeSageModelUpdateCallback(processSageModel);
            });

            $scope.$watch(function() {
                return _sageClient.sageModel;
            }, function(newSageModel) {
                initializeModel();
            });
        }

    /**
     * Returns where we expect caret to be after the scope.$apply call finishes.
     * @returns {number}
     */
        function getExpectedCaretPosition() {
        // Since $scope.getCateInfo is part of linker, it may not be defined
        // by the time of this call. If it is, use it.
            if ($scope.getCaretInfo) {
                var caretInfo = $scope.getCaretInfo();
            // If the cursor is in selection mode, use the mid point of the selection as the caret position for sage
            // to generate suggestions.
                return Math.floor((caretInfo.start + caretInfo.end)/2);
            }
        // If everything else fails, just use the end of input.
            return $scope.sageInput.length;
        }

    /**
     * set the input tokens correctly based on changed sage input.
     */
        function handleSageInputChange() {
        // (TODO: Rahul) SageModel Update, Can be removed.
            _sageModel.updateTokensOnInputChange($scope.sageInput, getExpectedCaretPosition());
            sageUtil.setTokensPosition($scope.sageInput, _sageModel.tokens, getExpectedCaretPosition());
            _sageModel.updateHasSpaceAfter($scope.sageInput);
            $scope.updateCaretState();
        }

    /**
     * Set the ghost input which concat of recognized tokens plus the expansion candidate token if any.
     *
     * Note that ghost can only be at the end of input given then current logic. It would be VERY tricky to offer
     * ghost in the middle because that will lead to alignment issues because width of space in the front layer input element
     * may not be same as the width of a ghost character in the middle layer input element.
     *
     * Example: user typed "cou". Language completions list has first item "count". Ghost input will be "count"
     * which will be shown such that "cou" is normal text color and "nt" is shaded because "count" in ghost input layer (middle layer) is shaded.
     * Suppose user typed "reve" and no language completions for this, but first item in data completions is "revenue". Ghost input will
     * be "revenue". Another case - user typed "forest l" and data completions list has ["forest", "forest light", ...]. Then ghost
     * input will be "forest light".
     */
        function setGhostInput() {
            if ($scope.canShowSageGhostForInputLength && !$scope.canShowSageGhostForInputLength()) {
                $scope.sageInputGhost = '';
                return;
            }

            if (getExpectedCaretPosition() < $scope.sageInput.length) {
                $scope.sageInputGhost = '';
                return;
            }

            if (!_sageModel.queryCompletions || !_sageModel.queryCompletions.length) {
                $scope.sageInputGhost = '';
                return;
            }

            var firstCompl = _sageModel.queryCompletions[0],
                suffixStr = firstCompl.getSuffixTokensQueryString();

            if (!!suffixStr) {
                $scope.sageInputGhost = '';
                return;
            }

            var newTokens = firstCompl.getNewTokens();

        // no ghost if no candidate token for expansion
            if (!newTokens || !newTokens.length) {
                $scope.sageInputGhost = '';
                return;
            }

        // won't be empty since a candidate token exists at this point
            var currentPartialInput = _sageModel.getCurrentPartialInput(),
                currentPartialInputIsEmpty = currentPartialInput.trim() === '',
                numTrailingSpacesSageInput = $scope.sageInput ?
            $scope.sageInput.length - util.stringTrimRight($scope.sageInput).length : 0,
                effCurrentPartialInput = currentPartialInput.trim();

            for (var i = 0; i < numTrailingSpacesSageInput && !currentPartialInputIsEmpty; i++) {
                effCurrentPartialInput += ' ';
            }

        // If the completion being used for ghost does not have any prefix tokens (except when user is starting
        // a new query), then it is a case of query rewrite ("revenue customer region top" or growth).
            if ($scope.sageInput != currentPartialInput && !firstCompl.getPrefixTokens().length) {
                $scope.sageInputGhost = '';
                return;
            }

        // Check if the current partial input is a prefix of first new token
            if (!newTokens[0].getPlaceholderText() && newTokens[0].getTokenTextLowerCase().indexOf(effCurrentPartialInput) !== 0) {
                $scope.sageInputGhost = '';
                return;
            }

            var ghostPostfix = newTokens.map(function (token) {
                return (token.getPlaceholderText() || token.getTokenTextLowerCase());
            }).join(' ');

            var ghostSuggestionText = ghostPostfix.substring(effCurrentPartialInput.length),
                sageInputHasTrailingSpace = util.hasTrailingSpace($scope.sageInput);

            $scope.sageInputGhost = $scope.sageInput;

            if (currentPartialInputIsEmpty && !!$scope.sageInput && !sageInputHasTrailingSpace) {
                $scope.sageInputGhost += ' ' + ghostSuggestionText;
            } else {
                $scope.sageInputGhost += ghostSuggestionText;
            }

            _logger.log('sage input ghost: ', $scope.sageInputGhost);
        }

        function getMainQueryCompletions() {
            if (_sageModel.needsJoinPathDisambiguation()) {
                return _sageModel.joinDisambiguationHelper.getSuggestions();
            }

            return _sageModel.queryCompletions;
        }

    // Note(Shikhar) - determining by length is not correct, For eg we have revenue quantity. Now we cut/paste foo bar,
    // it would close. Revisit this.
        function canAutoCloseDropdown(dropdownTokenIndex, newTokens) {
            var tokenToTest;
            if (dropdownTokenIndex >= 0 && dropdownTokenIndex < _sageModel.tokens.length) {
                tokenToTest = newTokens[dropdownTokenIndex];
            } else {
                tokenToTest = newTokens[_sageModel.tokens.length - 1];
            }

            return !angular.isDefined(tokenToTest) || tokenToTest.isEmpty() || !tokenToTest.isUnrecognized();
        }

        function canEditJoinPath(dropdownTokenIndex, newTokens) {
        // TODO (Vibhor, from Shikhar) - Sometimes, dropdownToken.canEditJoinPath() is true but there are no ambiguities paths
        // provided by sage. In that case, we should not color the token orange
            if (dropdownTokenIndex >= 0 && dropdownTokenIndex < newTokens.length) {
                var dropdownToken = newTokens[dropdownTokenIndex];
                if (dropdownToken.canEditJoinPath()) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        function processSageModel() {
            var newTokens = _sageModel.tokens;

            var dropdownTokenIndex = _sageModel.dropdownTokenIndex;
            var isSageResponseSuccess = _sageModel.sageResponseErrorInfo.error == sage.ErrorCode.SUCCESS;

            $scope.canAutoCloseDropdown = isSageResponseSuccess && canAutoCloseDropdown(dropdownTokenIndex, newTokens);
            $scope.canEditJoinPath = canEditJoinPath(dropdownTokenIndex, newTokens);

        // Do all book-keeping here
            $scope.$broadcast(events.HIDE_SAGE_BUBBLE_D, true);

            sageUtil.setTokensPosition($scope.sageInput, _sageModel.tokens, getExpectedCaretPosition());
        // compute the css properties for the tokens, this will modify _sageModel.tokens
            sageUtil.computeGhostTokenPositions(_sageModel.tokens, $scope.sageInput);

        // the expansion candidate token will be visible in ghost input layer
            setGhostInput();

            if (_sageModel.shouldOverrideTokenText) {
            // update the prev input
                $scope.prevSageInput = $scope.sageInput;
                var includePlaceholderToken = false;
                $scope.sageInput = _sageModel.getCompleteSageInput(includePlaceholderToken);
            }

            if (_sageModel.needsJoinPathDisambiguation()) {
                _skipServerRoundTrip = true;
            // If we are in the MJP workflow part, then we want to show the join path choices as completions and not
            // want the completions from server (server completions will be from before MJP triggered).
            // Short-circuit when join disambiguation is needed (there is nothing else to process at this point).

                util.executeInNextEventLoop(function() {
                    $scope.openDropDown();
                });
            } else {
                $scope.onSearchCorrected();
            }
        }

        initializeModel();
        configureScopeMethods();
        configureScopeHandlers();
    }]);
