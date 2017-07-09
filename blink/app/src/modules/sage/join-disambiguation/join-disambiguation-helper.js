/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A helper service to enable join disambiguation. See details of MJP in
 *      sage/join-disambiguation/join-disambiguation.js
 */

'use strict';

blink.app.factory('JoinDisambiguationHelper', ['blinkConstants',
    'strings',
    'Logger',
    'util',
    function (blinkConstants,
          strings,
          Logger,
          util) {
        var _logger = Logger.create('join-disambiguation-helper');

        function getNewToken(sageTokens, tokenIndex) {
            if (!sageTokens.length || tokenIndex >= sageTokens.length || tokenIndex < 0) {
                return null;
            }
            return sageTokens[tokenIndex];
        }

    /**
     * Class that encapsulates the list of already answered questions and allows methods to retrieve items from history
     * and manage history.
     *
     * @constructor
     */
        function SelectionHistory() {
            this._historyList = [];
        }

    /**
     * Returns the user selected option for the last answered question in history.
     *
     * @return {Object}
     */
        SelectionHistory.prototype.getLastSelectionLink = function () {
            if (!this._historyList.length) {
                _logger.warn('No previous selections found');
                return null;
            }

            var lastSelection = this._historyList.last();
            if (!lastSelection.question || !lastSelection.question.selectedOption ||
            !lastSelection.question.selectedOption.link) {
                _logger.warn('No link found in the last selection in history', lastSelection);
                return null;
            }

            return lastSelection.question.selectedOption.link;
        };

    /**
     * Returns the index of history item that is about the given question.
     *
     * @param {Object} question
     * @return {number}
     * @private
     */
        SelectionHistory.prototype._findItemIndexWithQuestion = function (question) {
            return this._historyList.findIndex(function (item) {
                return item.question === question;
            });
        };

    /**
     *
     * @param {string} pathType
     * @return {boolean}
     */
        SelectionHistory.prototype.hasQuestionsForPathType = function (pathType) {
            return this._historyList.any(function (item) {
                return item.question && item.question.pathType === pathType;
            });
        };

    /**
     * If the user is currently at an earlier entry in the history, this method will return the next item from history
     * (which may have been already answered by the user).
     *
     * @param {Object} currentQuestion
     * @returns {Object=}
     */
        SelectionHistory.prototype.getNextItem = function (currentQuestion) {
            var indexOfCurrentQuestion = this._findItemIndexWithQuestion(currentQuestion);

            if (indexOfCurrentQuestion < 0 || indexOfCurrentQuestion + 1 >= this._historyList.length) {
                return null;
            }

            return this._historyList[indexOfCurrentQuestion + 1];
        };

    /**
     * If user is navigated to an earlier item in the history, she may choose to change the answer to that question and
     * thus change the future history.
     * In such event, the current history from this point on should be wiped out.
     *
     * @param {Object} question
     */
        SelectionHistory.prototype.deleteHistoryItemsAfter = function (question) {
            var currentItemIndexInPreviousList = this._findItemIndexWithQuestion(question);

            if (currentItemIndexInPreviousList >= 0) {
                var numPops = this._historyList.length - currentItemIndexInPreviousList;
                for (var i = 0; i < numPops; ++i) {
                    this._historyList.pop();
                }
            }
        };

    /**
     *
     * @return {Array}
     */
        SelectionHistory.prototype.getHistoryList = function () {
            return this._historyList;
        };

    /**
     *
     * @param {Object} item
     */
        SelectionHistory.prototype.pushItemToHistory = function (item) {
            this._historyList.push(item);
        };

    /**
     * DisambiguationWorkflow class implements the multi-question join disambiguation workflow.
     *
     * The flow of class methods usage is as follows:
     * 1. question1 = worfklow.init(initialSetOfChoices);
     * 2. // get updated choices based on user's answer for question1
     * 3. nextQuestion = workflow.updateQuestion(updatedChoices);
     * 4. repeat #2 and #3 until only one choice left.
     * 5. workflow.finishDisambiguation();
     *
     * @param {Object} params Parameters needed to construct the disambiguation workflow.
     *
     * @param {number} params.newTokenIndex Index into the sage tokens list for token that caused this join disambiguation.
     * @param {Array} params.originalSageTokens The list of sage tokens
     * @param {Function} params.onCompleteFn Callback to invoke when disambiguation workflow is finished.
     * @param {SelectionHistory} params.history
     *
     * @constructor
     */
        function DisambiguationWorkflow(params) {
            this._newTokenIndex = params.newTokenIndex;
            this._originalSageTokens = params.originalSageTokens;
        // Making a copy of the original tokens as the tokens being worked  during the wokflow upon
        // will be modified and may be inconsistent during the workflow
            this._tokens = angular.copy(this._originalSageTokens);
            this._onComplete = params.onCompleteFn;
            this._history = params.history;
            this.workflowType = params.workflowType;
        }

    /**
     *
     * @param {Array.<sage.JoinPathChoice>} initialChoices
     * @return {Object=}
     */
        DisambiguationWorkflow.prototype.init = function (initialChoices) {
            this._newToken = getNewToken(this._tokens, this._newTokenIndex);

            if (this._tokens.length < 1) {
                _logger.error('No token needs join path disambiguation or too few tokens to create joins');
                return null;
            }

        // ClosestExistingToken is the nearest token to the new added token which has its join path
        // affected by addition of this new token.
        // We calculate it from the affected token array provided with each choice.
        // Also, the claim is that this array is same for all the choices, this is because a new token
        // addition shifts only one of the roots and the affected tokens are tokens previously rooted
        // at that root.
            var firstChoice = initialChoices[0];
            var affectedIndices = firstChoice.getAffectedExistingTokens();
            this._closestExistingTokenIndex = util.getLargestNumberSmallerThan(affectedIndices, this._newTokenIndex);
            if (this._closestExistingTokenIndex === void 0) {
                this._closestExistingTokenIndex = util.getSmallestNumberLargerThan(affectedIndices, this._newTokenIndex);
            }
            this._closestExistingToken = this._tokens[this._closestExistingTokenIndex];

            return this.updateQuestion(initialChoices);
        };

    /**
     * A special function to detect if the LTR fragment across all choices are same.
     * See above for description of LTR and RTL fragments in a join tree.
     *
     * @param {Array.<sage.JoinPathChoice>} currentChoices
     * @return {boolean}
     */
        function isDoneWithLTR(currentChoices) {
            if (!currentChoices.length) {
                _logger.warn('No choices left to continue');
                return false;
            }

            if (currentChoices.length === 1) {
                return true;
            }

            var firstChoicePathForNewToken = currentChoices[0].getPathForNewToken();

            for (var i = 1; i < currentChoices.length; ++i) {
                if (!firstChoicePathForNewToken && currentChoices[i].getPathForNewToken()) {
                    return false;
                }

                if (firstChoicePathForNewToken &&
                !firstChoicePathForNewToken.isEqual(currentChoices[i].getPathForNewToken())) {
                    return false;
                }
            }

            return true;
        }

        var defineMappingPrefaceTextTemplates = {
            NEW_TOKEN: 'Map the columns you are adding from "{1}" table:',
            EXISTING_TOKENS: 'Map the existing worksheet columns from "{1}" table:'
        };

        var editMappingPrefaceTextTemplates = {
            EXISTING_TOKENS: 'Now, map rest of the worksheet columns from "{1}" table:'
        };

        DisambiguationWorkflow.prototype.isUserDefiningNewJoins = function () {
            return this.workflowType === blinkConstants.joinWorkflow.types.DEFINE_MAPPING;
        };

        DisambiguationWorkflow.prototype.isUserEditingJoins = function () {
            return this.workflowType === blinkConstants.joinWorkflow.types.EDIT_MAPPING;
        };

        DisambiguationWorkflow.prototype._updateQuestion = function (currentChoices, leafToken, isNewTokenPath) {
            var terminalToken = leafToken.isValueToken() ? leafToken.getColumnName().toLowerCase() : leafToken.getTokenTextLowerCase();
        // If user is defining new joins, we want to use the table names as the context in the workflow.
        // If user is editing joins and we require user to makes choices for tokens other than the requested one, we
        // want to use the table names.
            if (this.isUserDefiningNewJoins() || !isNewTokenPath) {
                terminalToken = leafToken.getTableName();
            }

            var distinctIncomingEdgesToLeaf = [],
                maxDistanceFromLeaf = 0,
                distanceFromLeaf = 0;

        // Compute max distance from leaf across all choices.
            var choiceWithMaxDistanceFromLeaf = currentChoices.max(function (choice) {
                var path = isNewTokenPath ? choice.getPathForNewToken() : choice.getAppendPathForExistingTokens();
                if (!path || path.isEmpty()) {
                    return 0;
                }

                return path.getJoins().length;
            });

            var pathWithMaxDistance = isNewTokenPath ? choiceWithMaxDistanceFromLeaf.getPathForNewToken()
            : choiceWithMaxDistanceFromLeaf.getAppendPathForExistingTokens();
            if (!pathWithMaxDistance.isEmpty()) {
                maxDistanceFromLeaf = pathWithMaxDistance.join.length;
            }

        // From the current set of choices and the given leaf node, figure out the distinct paths leading to the leaf.
        // Those paths can be the direct edges coming into leaf or edges coming into a parent of leaf.
        //
        // If we have moved beyond the max distance from leaf, then there is only one path leading to the leaf from a
        // root that is common to all choices.

            while (distinctIncomingEdgesToLeaf.length <= 1 && distanceFromLeaf < maxDistanceFromLeaf) {
                distinctIncomingEdgesToLeaf = currentChoices.map(function (choice) {
                // If the choice does not have a non-empty path, it must be that the leaf is a potential root.
                // Add this as a distinct edge to leaf of size 0.
                    var path = isNewTokenPath ? choice.getPathForNewToken() : choice.getAppendPathForExistingTokens();

                    if (!path || path.isEmpty()) {
                        return {
                            type: 'root',
                            node: choice.getRootTableGuid()
                        };
                    }

                    var joins = path.getJoins();
                // If we have moved so far away from the leaf that there is one such choice that ends at this node,
                // we may end up with a path diversion.
                // Note that this can not happen with an empty path choice described above. Also it can not happen
                // that there are 2 choices of same length with different terminating points and still end up in this
                // logic. This is because those cases would have created path diversion much closer to leaf.
                    if (joins.length < distanceFromLeaf + 1) {
                        return {
                            type: 'root',
                            node: choice.getRootTableGuid()
                        };
                    }

                // A regular incoming edge into the current node.
                    return {
                        type: 'link',
                        join: joins[joins.length - distanceFromLeaf - 1]
                    };
                }).unique(function (item) {
                // Take a unique of all incoming edges into leaf (all direct or all indirect).
                // An edge that doesn't have a join guid is either 0-size (rooted at leaf) or it is a
                // 0-size (rooted at a terminalNode parent). A terminalNode parent of leaf is a node where
                // diversions terminate.
                    return item.join && item.join.getGuid() || null;
                });

                distanceFromLeaf++;
            }

            var prefaceText;
            if (this.isUserDefiningNewJoins()) {
                prefaceText = isNewTokenPath ? defineMappingPrefaceTextTemplates.NEW_TOKEN :
                defineMappingPrefaceTextTemplates.EXISTING_TOKENS;
            } else if (this.isUserEditingJoins() && !isNewTokenPath) {
                prefaceText = editMappingPrefaceTextTemplates.EXISTING_TOKENS;
            }

            if (!!prefaceText) {
                prefaceText = prefaceText.assign(leafToken.getTableName());
            }

        // If the leaf token was already used to ask an earlier question, use the previous selection now to continue
        // in the context.
            if (this._history.getHistoryList().length && this._history.hasQuestionsForPathType(isNewTokenPath)) {
                var lastSelectionLink = this._history.getLastSelectionLink();
                if (lastSelectionLink) {
                    terminalToken = lastSelectionLink.getName();
                    prefaceText = '';
                }
            }

        // If user is editing a join path and we are asking them to make choices for that token, no additional context
        // is needed.
            if (this.isUserEditingJoins() && isNewTokenPath) {
                prefaceText = '';
            }

            var question = {
                selectedOption: null,
                pathType: isNewTokenPath,
                prefaceText: prefaceText,
                terminalToken: terminalToken,
                options: []
            };

            var usedLinkNames = {},
                optionTextTpl = '{terminalToken} of {linkName}';
            if (distinctIncomingEdgesToLeaf.length > 1) {
            // Create an option for each distinct edge coming into the terminal token.
                distinctIncomingEdgesToLeaf.each(function (edge, index) {
                // If this is a 0-size edge, then selecting this option would mean getting all values of this column
                // without any foreign key relationships.
                    if (edge.type === 'root') {
                        question.options.push({
                            text: 'All types of {1}'.assign(question.terminalToken.capitalize()),
                            choices: currentChoices,
                            root: edge.node
                        });
                        return;
                    }
                    var linkName = edge.join.getName().capitalize(),
                        tableName = edge.join.source && edge.join.source.name || '';
                    if (!usedLinkNames.hasOwnProperty(linkName)) {
                        usedLinkNames[linkName] = [];
                    }

                    usedLinkNames[linkName].push(index);
                // If this is a regular edge, then selecting this option would mean selecting a primary-foreign key
                // relationship.
                    question.options.push({
                        text: optionTextTpl.assign({
                            terminalToken: question.terminalToken.capitalize(),
                            linkName: linkName
                        }),
                        tableName: tableName,
                        link: edge.join,
                        choices: currentChoices
                    });
                });

                Object.values(usedLinkNames).each(function (indices) {
                    if (indices.length <= 1) {
                        return;
                    }

                    indices.each(function (index) {
                        if (index >= question.options.length) {
                            return;
                        }

                        question.options[index].showTableName = true;
                    });
                });
            }

            return question;
        };

    /**
     *
     * @param {Array.<sage.JoinPathChoice>}currentChoices
     * @return {Object=}
     */
        DisambiguationWorkflow.prototype.updateQuestion = function (currentChoices) {
            if (!isDoneWithLTR(currentChoices)) {
            //TODO (Rahul): Clean up this reliance on field name here.
                return {
                    workingTokenIndex: this._newTokenIndex,
                    question: this._updateQuestion(currentChoices, this._newToken, true)
                };
            }

            return {
                workingTokenIndex: this._closestExistingTokenIndex,
                question: this._updateQuestion(currentChoices, this._closestExistingToken, false)
            };
        };

    /**
     *  Find the path in the token's paths list that has the same root table as the leaf table in the append path.
     *
     *  For example, user had already typed in "state" from the Region table (old root). But as a result of a new
     *  join choice, the new root is a City table. So we have to update that path by appending the path from City to
     *  Region.
     *
     * @param {sage.RecognizedToken} token
     * @param {sage.JoinPath} appendPath
     */
        function updateTokenJoinPath(token, appendPath) {
        // If the token didn't have a join path, then flag that error.
        // This is because even if the token's table is the query root, it must have a JoinPath object with empty joins.
            if (!token.getJoinPaths() || !token.getJoinPaths().length) {
                _logger.error('Found an existing token without a join path!', token);
                return;
            }

        // TODO(Jasmeet): Figure out the ancestor business.
            token.getJoinPaths().filter(function (joinPath) {
                return appendPath.isAncestorOf(joinPath);
            }).map(function (affectedPath) {
                affectedPath.attachToNewRoot(appendPath);
            });
        }

    // HACK(vibhor): Since sage only sends a single new token index and worksheet bulk column addition can have multiple
    // new tokens added at once, we need to fix the remaining tokens' join paths too.
        function fixJoinPathForUntrackedTokens(allTokens, affectTokensIndexList, newTokenWithPath, rootIndex, newTokenGuid) {
        // Finding the set of all tokens that inherit the join path from the token for which the
        // join paths have been resolved.
            var tokensToInheritJoinPath = allTokens.filter(function (tok, i) {
                var tokenPath = tok.getJoinPaths();
            // TODO(Jasmeet): What is this untracked token business and why does it not work with
            // chasm trap
                if (tokenPath && tokenPath.length > 0) {
                    return false;
                }
                if (affectTokensIndexList && affectTokensIndexList.any(i)) {
                    return false;
                }
            // In case of query completions the new token (for which the join path is updated) may
            // not come from the same source as the other tokens in the completion. Therefore, we
            // do not update the join path for such tokens.
            // Eg. for a query - "revenue" we may suggest "revenue weekday fl customer region".
            // Since, "weekday fl" has multiple join paths from Lineorder to Date. It is therefore
            // disambiguated using MJP. "customer region" comes from the customers table and
            // therefore should not inherit the join path of "weekday fl".
                if (tok.getSourceGuid() != newTokenWithPath.getSourceGuid()) {
                    return false;
                }

                return true;
            });

            var newTokenJoinPath = newTokenWithPath.getJoinPaths()[rootIndex];
            var canEditJoinPath = newTokenWithPath.canEditJoinPath();

            tokensToInheritJoinPath.each(function (token) {
                token.setJoinPathAtIndex(newTokenJoinPath, rootIndex);
                token.setCanEditJoinPath(canEditJoinPath);
            });

        }

    /**
     * Sage server needs the selected join path choice to be reflected in all the sage tokens.
     * As a result, we update the "newly added token" that caused the ambiguity with the choice,
     * but also update the path for existing tokens that might be affected due to this choice.
     *
     * There are three steps involved in the below workflow:
     * Step 1: fix first new token
     * Step 2: fix other new tokens. (fixJoinPathForUntrackedTokens)
     * Step 3: fix existing tokens.
     *
     * If new tokens are not present we only need to do step 3.
     *
     * @param {Object} choice
     * @param {number} rootIndex
     */
        DisambiguationWorkflow.prototype.updateTokensWithJoinPathChoice = function (choice, rootIndex) {
            var resolvedSageTokens = this._tokens;

            var newlyAddedToken = getNewToken(resolvedSageTokens, this._newTokenIndex);
            var affectedTokensList = choice.getAffectedExistingTokens();

            if(!!newlyAddedToken) {
            // step 1. (See comment above for details)
                newlyAddedToken.setJoinPathAtIndex(choice.getPathForNewToken(), rootIndex);
                newlyAddedToken.setCanEditJoinPath(choice.isNewTokenEditable());
            // end step 1.
            // step 2.
                fixJoinPathForUntrackedTokens(resolvedSageTokens, affectedTokensList, newlyAddedToken, rootIndex);
            //end step 2.
            }

            if (!affectedTokensList) {
                return resolvedSageTokens;
            }

        // step 3.
            var oldTokensEditable = choice.areOldTokensEditable();
            affectedTokensList.each(function (affectedTokenIndex) {
                if (affectedTokenIndex < resolvedSageTokens.length && affectedTokenIndex >= 0) {
                // Only server should reset the bit but if server wants the old tokens to be editable, then they
                // should be marked as editable.
                    if (oldTokensEditable) {
                        resolvedSageTokens[affectedTokenIndex].setCanEditJoinPath(true);
                    }
                    updateTokenJoinPath(resolvedSageTokens[affectedTokenIndex], choice.getAppendPathForExistingTokens());
                }
            });
        };

        DisambiguationWorkflow.prototype.finishDisambiguation = function () {
            this._onComplete(this._tokens);
        };


    /**
     * A wrapper class that puts the DisambiguationWorkflow and SelectionHistory classes together to drive the multiple
     * join path disambiguation scenario.
     *
     * @param {Object} ambiguityInput
     * @param {Function} onCompleteFn
     * @constructor
     */
        function JoinDisambiguationHelper(ambiguityInput, mode, onCompleteFn) {
            this._ambiguityInput = ambiguityInput;
            this._mode = mode;
            this._currentAmbiguityIndex = 0;

            var workflowType = blinkConstants.joinWorkflow.types.INVALID_TYPE;
            if (angular.isDefined(ambiguityInput.workflowType)) {
                workflowType = ambiguityInput.workflowType;
            }
            this._selectionHistory = new SelectionHistory();
            this._workflow = new DisambiguationWorkflow({
                newTokenIndex: ambiguityInput.joinPathCollections[this._currentAmbiguityIndex].getNewTokenIndex(),
                originalSageTokens: ambiguityInput.tokens,
                workflowType: workflowType,
                onCompleteFn: onCompleteFn,
                history: this._selectionHistory
            });
        }

        JoinDisambiguationHelper.modes = {
        // The in-sage experience implies that there is no history pre-populated for change mapping use case or
        // finish disambiguation callback is invoked as soon as the last option is selected.
            EMBEDDED_IN_SAGE: 0,

        // The explicit mode implies that user will be seeing a navigateable history and the history will be pre-populated
        // with history when change mapping. In this mode, user needs to click a 'Done' button to finish disambiguation.
            EXPLICIT_MODE: 1
        };

    /**
     *
     * @return {SelectionHistory}
     */
        JoinDisambiguationHelper.prototype.getSelectionHistory = function () {
            return this._selectionHistory;
        };

        JoinDisambiguationHelper.prototype._getMatchingPathForPrePopulatingHistory = function () {
            if (this._canAutoFinish()) {
                return null;
            }

            if (this._mode !== JoinDisambiguationHelper.modes.EXPLICIT_MODE) {
                return null;
            }

            if (!this._ambiguityInput.documentTokens) {
                return null;
            }

            if (!angular.isDefined(this._workingTokenIndex)) {
                _logger.warn('Expected working token index to be defined');
                return null;
            }

            var tokenIndex = this._workingTokenIndex,
                tokens = this._ambiguityInput.documentTokens;

            if (tokenIndex < 0 || tokenIndex >= tokens.length) {
                return null;
            }

            var joinPathCollections = this._ambiguityInput.joinPathCollections;
            var currentJoinPathCollection = joinPathCollections[this._currentAmbiguityIndex];
            var rootIndex = currentJoinPathCollection.getRootIndex();
            var workingToken = tokens[tokenIndex];
            var joinPaths = workingToken.getJoinPaths();
            var workingTokenPath = !!joinPaths ? joinPaths[rootIndex] : null;

            if (!workingTokenPath) {
                _logger.warn('Found a token in document without a join path', workingToken);
                return null;
            }

            var ambiguityInput = this._ambiguityInput;
            var filteredChoices = ambiguityInput.joinPathCollections[this._currentAmbiguityIndex]
            .getJoinPathCandidates()
            .filter(function (choice) {
                if (choice.getPathForNewToken() &&
                    choice.getPathForNewToken().isPrefixOf(workingTokenPath)) {
                    return true;
                }

                return false;
            });

            if (filteredChoices.length !== 1) {
            // If there are multiple choices that match the working token path prefix, then we can't prepopulate history.
            // This should never happen, ideally.
                _logger.warn('Found the editable token path which matches multiple choices', filteredChoices);
                return null;
            }

            var choice = filteredChoices.first();
            if (!choice) {
                _logger.warn('Found a null choice in the list of matching choices');
                return null;
            }

            return choice.getPathForNewToken();
        };

        function getMatchingOptionFromExistingPath(currentQuestion, matchingPath, optIndex) {
            if (!currentQuestion || !currentQuestion.options || !currentQuestion.options.length || !matchingPath) {
                return null;
            }

            var options = currentQuestion.options;
            if (!angular.isDefined(optIndex)) {
                return options.find(function (option) {
                    if (!option.root) {
                        return false;
                    }

                    return option.root === matchingPath.root.guid;
                });
            }

            if (!matchingPath.join || optIndex < 0 || optIndex >= matchingPath.join.length) {
                _logger.warn('Index out of bound', optIndex, matchingPath.join.length);
                return null;
            }

            var join = matchingPath.join[optIndex];
            return options.find(function (option) {
                if (!option.link) {
                    return false;
                }

                return option.link.getGuid() === join.getGuid();
            });
        }

        JoinDisambiguationHelper.prototype.setOptionForExistingPath = function (currentQuestion, matchingPath, optIndex) {
            var matchingOption = getMatchingOptionFromExistingPath(currentQuestion, matchingPath, optIndex);
            if (!matchingOption) {
                return null;
            }

            currentQuestion.selectedOption = matchingOption;
            return this.pruneChoicesAndUpdateQuestion(matchingOption);
        };

        JoinDisambiguationHelper.prototype._prePopulateHistory = function () {
            var matchingPathForHistory = this._getMatchingPathForPrePopulatingHistory();
            if (!matchingPathForHistory) {
                return false;
            }

            var initQuestion = this._currentQuestion,
                currentQuestion = initQuestion;

            if (!matchingPathForHistory.join || !matchingPathForHistory.join.length) {
                this.setOptionForExistingPath(currentQuestion, matchingPathForHistory);
            } else {
            // Since the questions are always built from leaf to root, we need to reverse traverse the join path of a token
            // (those are always root -> leaf).
                for (var i = matchingPathForHistory.join.length - 1; i >= 0; i--) {
                    currentQuestion = this.setOptionForExistingPath(currentQuestion, matchingPathForHistory, i);
                // In case the questions only pertain to a prefix
                    if (!currentQuestion && i > 0) {
                        _logger.warn('CHECK FAIL: Fewer choices than joins in the existing path');
                        return false;
                    }
                }
            }

            if (this._selectionHistory.length) {
            // After having pre-populated the history, we want to move user back to the first item in the history.
                this.selectItemFromHistory(this._selectionHistory.getHistoryList().first());
            }
            return true;
        };

    /**
     * Initializes the workflow and history and computes the initial question of join disambiguation workflow.
     * @return {Object|null} Returns the initial question object.
     */
        JoinDisambiguationHelper.prototype.init = function () {
            var res = this._workflow.init(this._ambiguityInput.joinPathCollections[this._currentAmbiguityIndex].getJoinPathCandidates());
            if (!res) {
                return null;
            }

            this._workingTokenIndex = res.workingTokenIndex;
            this._currentQuestion = res.question;
            this._prePopulatedHistory = this._prePopulateHistory();
            return res.question;
        };

        JoinDisambiguationHelper.prototype.getJoinPathCollections = function() {
            return this._ambiguityInput.joinPathCollections;
        };

        JoinDisambiguationHelper.prototype.isHistoryPrePopulated = function () {
            return !!this._prePopulatedHistory;
        };

        JoinDisambiguationHelper.prototype.getSuggestions = function() {
            var currentQuestion = this.getCurrentQuestion();
            if (!currentQuestion) {
                return [];
            }

            var workingTokenIndex = this.getWorkingTokenIndex();
            var sageNewTokens = this.getAllTokens();
            var numPrefixTokens = workingTokenIndex;
            var numSuffixTokens = sageNewTokens.length - workingTokenIndex - 1;

            var self = this;
            return currentQuestion.options.map(function (option) {
                return new sage.JoinAmbiguityQueryCompletion({
                    workingTokenIndex: workingTokenIndex,
                    joinChoice: option,
                    allTokens: sageNewTokens,
                    numPrefixTokens: numPrefixTokens,
                    numSuffixTokens: numSuffixTokens,
                    history: self.getSelectionHistory().getHistoryList()
                });
            });
        };

    /**
     * Given choices without this option selected, this function will filter out choices that do not apply to this
     * option.
     *
     * @param {Object} selectedOption
     * @return {Array.<sage.JoinPathChoice>}
     */
        function getPrunedChoices(selectedOption) {
            var shouldPruneLTR = !isDoneWithLTR(selectedOption.choices);  /* LTR: true, RTL: false */
            return selectedOption.choices.filter(function (choice) {
                if (selectedOption.link) {
                    return choice.containsLink(selectedOption.link.getGuid(), shouldPruneLTR);
                }

                return choice.getRootTableGuid() === selectedOption.root;
            });
        }

        JoinDisambiguationHelper.prototype._canAutoFinish = function () {
            return this._mode === JoinDisambiguationHelper.modes.EMBEDDED_IN_SAGE;
        };

    /**
     * Given the selected option for current question, prunes out the remaining choices and computes an updated question.
     *
     * @param {Object} selectedOption The option to use for pruning choices.
     * @returns {Object|null} Returns the updated question for the applied choice.
     */
        JoinDisambiguationHelper.prototype.pruneChoicesAndUpdateQuestion = function (selectedOption) {
            var currentChoices = getPrunedChoices(selectedOption);

            var question = this._currentQuestion;
        // User selected a new option which caused us to prune the current available choices further. Any future
        // history based on old selections are now invalid. So purge the future history.
            this._selectionHistory.deleteHistoryItemsAfter(question);
        // At this point, if we are changing the history, the pre-populated history is thrown away.
            this._prePopulatedHistory = false;
        // Add the current choice to history.
            this._selectionHistory.pushItemToHistory({
                question: question,
                tokenIndex: this._workingTokenIndex,
                text: selectedOption.text
            });

            if (currentChoices.length === 1 && this._currentAmbiguityIndex === this._ambiguityInput.joinPathCollections.length - 1) {
                if (this._canAutoFinish()) {
                    this.finish(currentChoices[0]);
                }
                return null;
            }

            if (currentChoices.length === 1) {
                var joinPathCollection = this._ambiguityInput.joinPathCollections[this._currentAmbiguityIndex];

                var rootIndex = joinPathCollection.getRootIndex();
                this._workflow.updateTokensWithJoinPathChoice(currentChoices[0], rootIndex);

                this._currentAmbiguityIndex++;
                joinPathCollection = this._ambiguityInput.joinPathCollections[this._currentAmbiguityIndex];
                currentChoices = joinPathCollection.getJoinPathCandidates();
            }

            var res = this._workflow.updateQuestion(currentChoices);

            this._currentQuestion = res.question;
            this._workingTokenIndex = res.workingTokenIndex;
            return res.question;
        };

    /**
     * Resurrects an already answered question from history
     *
     * @param {Object} item
     * @return {Object} The question corresponding to the history item.
     */
        JoinDisambiguationHelper.prototype.selectItemFromHistory = function (item) {
            this._currentQuestion = item.question;
            return this._currentQuestion;
        };

    /**
     * Returns the current question of the disambiguation workflow.
     * @return {Object}
     */
        JoinDisambiguationHelper.prototype.getCurrentQuestion = function () {
            return this._currentQuestion;
        };

    /**
     * Gets the index of the token which user is trying to answer the join questions on.
     *
     * @return {number}
     */
        JoinDisambiguationHelper.prototype.getWorkingTokenIndex = function () {
            return this._workingTokenIndex;
        };

    /**
     *
     * @return {Array.<sage.RecognizedToken>} Returns list of tokens that are used to solve the join path ambiguity.
     */
        JoinDisambiguationHelper.prototype.getAllTokens = function () {
            return this._ambiguityInput && this._ambiguityInput.tokens;
        };

        JoinDisambiguationHelper.prototype.finish = function (choice) {
            if (!choice) {
                if (!this._currentQuestion) {
                    _logger.error('No workflow question to choose from.');
                    return;
                }
                if (!this._currentQuestion.selectedOption) {
                    _logger.error('Trying to finish workflow without selecting final option.');
                    return;
                }

                var choices = getPrunedChoices(this._currentQuestion.selectedOption);
                if (choices.length > 1) {
                    _logger.error('Trying to finish workflow before the last step.');
                    return;
                }

                choice = choices[0];
            }

            var joinPathCollection = this._ambiguityInput.joinPathCollections[this._currentAmbiguityIndex];
            var rootIndex = joinPathCollection.getRootIndex();

            this._workflow.updateTokensWithJoinPathChoice(choice, rootIndex);
            this._workflow.finishDisambiguation();
            this._currentQuestion = null;
            this._workingTokenIndex = -1;
        };

        return JoinDisambiguationHelper;
    }]);
