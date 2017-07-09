/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com), Vibhor Nanavati (vibhor@thoughtspot.com),
 *         Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Data model for Sage
 */

'use strict';

//TODO (Rahul): Introduce proper getters and setters
blink.app.factory('SageModel', ['Logger',
    'QueryFragment',
    'sageUtil',
    'util',
    function (Logger,
          QueryFragment,
          sageUtil,
          util) {

        var _logger = Logger.create('sage-model');

    /**
     * @constructor
     */
        var SageModel = function() {
        /**
         * @type {Array.<sage.RecognizedToken>}
         */
            this.tokens = [];

        /**
         * User typed "reve" to get a sage query. We should note that the unique token was "revenue"
         * @type {sage.RecognizedToken}
         */
            this.tokenForUniqueCompletion = null;

            this.tokenUnderCaret = 0;

            this.caretPositionFromTokenStart = 0;

            this._accessibleTables = null;

        ////////////////////////
            this.queryCompletions = [];
            this.dataCompletions = [];
            this.languageCompletions = [];
            this.objectResults = [];
            this.joinDisambiguationHelper = null;
            this.sageResponseErrorInfo = {};
            this.dropdownTokenIndex = 0;
            this.requiresFullLineage = false;
            this.shouldOverrideTokenText = true;
            this.showingExactMatches = false;
            this.completionStartPosition = -1;
        };

        SageModel.UNREC_TOKEN_PLACEHOLDER = '__UNRECOGNIZED__';

    /**
     * Clear the state.
     */
        SageModel.prototype.clear = function () {
            this.tokens = [];
            this.tokenForUniqueCompletion = null;
            this.tokenUnderCaret = 0;
            this.caretPositionFromTokenStart = 0;
            this._accessibleTables = null;

        ////////////////////////
            this.queryCompletions = [];
            this.objectResults = [];
            this.joinDisambiguationHelper = null;
            this.sageResponseErrorInfo = {};
            this.dropdownTokenIndex = 0;
        };

    /**
     * Return the concat of the tokens. But put a placeholder string for the first unrecognized token
     * so that it can be replaced dynamically by caller.
     * @param {boolean} includePlaceholderUnrecToken if false put empty string as placeholder
     * @return {string}
     */
        SageModel.prototype.getCompleteSageInput = function (includePlaceholderUnrecToken) {
            var usedUnrecTokenOnce = false;
            return this.tokens.map(function (rt) {
                if (rt.isUnrecognized() && !rt.isEmpty()) {
                    if (!!includePlaceholderUnrecToken && !usedUnrecTokenOnce) {
                        usedUnrecTokenOnce = true;
                        return SageModel.UNREC_TOKEN_PLACEHOLDER;
                    } else {
                        return '';
                    }
                }
                return rt.getTokenTextLowerCase();
            }).filter(function (str) {
                return !!str.length;
            }).join(' ');
        };

    /**
     * Return the concat of the recognized tokens. If tokenForUniqueCompletion is non-null, include it in the array too.
     * Example: user typed 'revenue cont' so the tokens are ['revenue', 'cont'] where 'cont' is unrecognized. At this point
     * we show results for 'revenue container' so the tokenForUniqueCompletion is 'container'. This function will return
     * tokens ['revenue', 'container'] in this case.
     *
     * @return {Array.<sage.RecognizedToken>}
     */
        SageModel.prototype.getOnlyRecognizedTokens = function (excludeTokenForUniqueCompletion) {
            var filteredTokens = this.tokens.filter(function (rt) {
                return !rt.isUnrecognized();
            });
            if (!excludeTokenForUniqueCompletion && this.tokenForUniqueCompletion) {
                filteredTokens.push(this.tokenForUniqueCompletion);
            }
            return filteredTokens;
        };

    /**
     * @param {Array.<sage.RecognizedToken>} tokens
     */
        SageModel.prototype.setTokens = function (tokens) {
            this.tokens = tokens || [];
        };
    /**
     * Return all tokens in the current sage model.
     *
     * @return {Array.<sage.RecognizedToken>}
     */
        SageModel.prototype.getTokens = function() {
            return this.tokens || [];
        };

    /**
     * If the tokens are ['revenue', 'part', 'n'] where the last 2 are unrecognized, return 'part n'.
     * Note: we must filter out trailing empty word unrecognized tokens.
     *
     * Assumption is that the unrecognized tokens are at the last.
     * @return {string}
     */
        SageModel.prototype.getCurrentPartialInput = function () {
            return this.tokens.filter(function (t) {
                return t.isUnrecognized() && !!t.getTokenText();
            }).map(function (t) {
                return t.getTokenTextLowerCase();
            }).join(' ');
        };

    /**
     * Example: user typed "revenue exte" and got a new sage query as sage assumed "extended price" as the second token.
     * This function should return "revenue extended price" in this case.
     *
     * This can also return a valid response like "revenue for" as a result of concatenation of existing tokens
     * [revenue, for] and null tokenForUniqueCompletion
     *
     * @return {string}
     */
        SageModel.prototype.getSageInputWithUniqueCompletion = function () {
        // Possible scenario: input 'revenue customer pho month' => constructedInput 'revenue __UNRECOGNIZED__ month'
        // in this case only extract 'revenue'
        // If __UNRECOGNIZED__ is the last word, then discard it but also consider tokenForUniqueCompletion.

            var constructedInput = this.getCompleteSageInput(true),
                firstUnrecTokenIndex = constructedInput.indexOf(SageModel.UNREC_TOKEN_PLACEHOLDER),
                isUnrecTokenInLast = util.isPostfix(SageModel.UNREC_TOKEN_PLACEHOLDER, constructedInput);

            if (firstUnrecTokenIndex >= 0) {
                constructedInput = constructedInput.substring(0, firstUnrecTokenIndex).trim();
                if (!isUnrecTokenInLast) {
                    return constructedInput;
                }
            }

            if (this.tokenForUniqueCompletion) {
                constructedInput = (constructedInput ? constructedInput + ' ' : '') + this.tokenForUniqueCompletion.getTokenTextLowerCase();
            }
            return constructedInput;
        };

    /**
     * Sets data structures related to caret info such as what is the token under the caret and what is the offset of
     * the caret within that token. It also puts an empty token to the tokens parameter if needed.
     *
     * Assumption: Empty token in input can come only if it is being edited
     *
     * @param inputStr
     * @param tokens
     * @param caretPosition
     * @param offsetNumToken - determines the offset to add to tokenUnderCaret that is calculated from given tokens.
     *        This is useful when tokens are a subset of all the tokens
     */
        SageModel.prototype.setCaretInfoAndAddEmptyTokenIfNeeded = function (inputStr, tokens, caretPosition, offsetNumToken) {
            offsetNumToken = offsetNumToken || 0;
            var tokenUnderCaret = -1,
                caretPositionFromTokenStart = 0,
                spaceToken;

            var origStrLength = inputStr.length;

            var i = 0,
                tokenIndex = 0;
            for (; i < origStrLength && tokenIndex < tokens.length;) {
            // There can be an empty token only if it is the one being edited or the last one.
                if (tokens[tokenIndex].isEmpty()) {
                    tokenUnderCaret = tokenIndex;
                    caretPositionFromTokenStart = 0;
                    break;
                }

            // Note: Make sure to first check for emptyToken (tokens[tokenIndex].isEmpty()) and then empty char
                if (inputStr[i] == ' ') {
                    i++;
                    continue;
                }

                var tokenLength = tokens[tokenIndex].getTokenTextLowerCase().length;

            // Consider this: revenue and quantity are recognized and abc is not. If it is quantity|revenue, then there
            // must be an empty token between these two, and none of quantity and revenue are being updated..hence we
            // only check for < or > and not =. If it is abc|revenue, then the token being edited is abc, therefore we
            // also allow =. Similarly we consider extensible tokens behavior same as unrecognized tokens. For eg:
            // revenue > 1|. We want that token under caret should be "1"
                if (((tokens[tokenIndex].isUnrecognized() || tokens[tokenIndex].isExtensible())
                && i <= caretPosition && i + tokenLength >= caretPosition) ||
                (!tokens[tokenIndex].isUnrecognized() && i < caretPosition && i + tokenLength > caretPosition)) {
                    tokenUnderCaret = tokenIndex;
                    caretPositionFromTokenStart = caretPosition - i;
                    break;
                }

            // Note(Shikhar): If the counter i equals caret position, then it must be the case that we are at the
            // beginning of a recognized token and there was no empty token.
                if (i === caretPosition) {
                    _logger.error('Caret should be at the start of a recognized token');
                    tokenUnderCaret = tokenIndex;
                    caretPositionFromTokenStart = 0;
                    break;
                }

                i += tokenLength;
                tokenIndex++;
            }

        // There might be a case when the empty token might be at the end, in which the string traversal finishes. So
        // we have to make a special check for that. eg, when the user clicks on empty sage bar
            if (tokenUnderCaret === -1 && i === origStrLength && tokenIndex < tokens.length && tokens[tokenIndex].isEmpty()) {
                tokenUnderCaret = tokenIndex;
                caretPositionFromTokenStart = 0;
            }

        // This is the case during copy/paste
        // eg: revenue quantity color. Now select all and paste revenue average revenue color|
        // Here we are sure that there is no previously empty token and this empty token is the one being edited.
        // In case when the query fragment is removed the origStrLength is less than caret position.
            if (tokenUnderCaret === -1 && caretPosition >= origStrLength) {
                spaceToken = sage.RecognizedToken.createUnrecognizedToken();
                spaceToken.setIsAutoInsertedSpace(true);
                tokens.push(spaceToken);
                tokenUnderCaret = tokens.length - 1;
                caretPositionFromTokenStart = 0;
            }

            if (tokenUnderCaret === -1) {
                _logger.error('No token under caret found');
            }

            this.tokenUnderCaret = tokenUnderCaret + offsetNumToken;
            this.caretPositionFromTokenStart = caretPositionFromTokenStart;

            _logger.debug('caret info: ', this.tokenUnderCaret, this.caretPositionFromTokenStart);
        };


        /**
         * Update the tokens of the sage model by using the tokens of a queryCompletion
         *
         * @param queryCompletion
         */
        SageModel.prototype.updateTokensFromCompletion = function(queryCompletion) {
            var queryCompletionNewTokens = queryCompletion.getNewTokens();
            var newTokens = queryCompletion.getPrefixTokens()
                .concat(queryCompletionNewTokens)
                .concat(queryCompletion.getSuffixTokens());

            this.setTokens(newTokens);

        };

    /**
     * Sets all the data structures in sage model that are needed to make the sage server call after input changes.
     * @param inputStr
     * @param caretPosition
     */
        SageModel.prototype.updateTokensOnInputChange = function (inputStr, caretPosition) {
            var tokens = this.tokens;

            _logger.debug('Start updateTokens on input change: input, tokens, caret', inputStr, tokens, caretPosition);

            inputStr = inputStr.toLowerCase();

        // filter all empty tokens
            tokens = tokens.filter(function (token) {
                return !token.isEmpty();
            });

        // Steps here:
        // 1. Find suffix and prefix recognized tokens
            var partitionObj = sageUtil.partitionInputBasedOnCaret(inputStr, tokens, caretPosition);

        // 2. Find the unresolved string and tokens that are between prefix and suffix
            var unresolvedInputStr = inputStr.substring(partitionObj.unresolvedStringStartIndex,
                partitionObj.unresolvedStringStartIndex + partitionObj.unresolvedStringLength);

            _logger.debug('Partitioned Object: ', partitionObj);

        // 3. Parse the unresolved text into words broken by delimiters
            var relativeCaretPos = caretPosition - partitionObj.unresolvedStringStartIndex;
            var inputWords = sageUtil.parseSageBarText(unresolvedInputStr, relativeCaretPos);
        // 4. Also form tokens from the parsed words
            var currentTokens = sageUtil.getTokensFromWords(inputWords.slice(), partitionObj.unresolvedTokens);
        // 5. Update caret information. We know caret can only lie in currentTokens
        // Note (Shikhar) - we can calculate the caret info in previous steps. Revisit it to improve performance.
        // Also IMP: this function might add an empty token to currentTokens - it makes sure that we
        // add that token where the caret is. Therefore, this function should not be called with allTokens, because
        // then we have to calculate where the position is to add the empty token.
            this.setCaretInfoAndAddEmptyTokenIfNeeded(unresolvedInputStr, currentTokens, relativeCaretPos,
            partitionObj.tokensBeforeCaret.length);

        // 6. Concat all tokens
            var allTokens = partitionObj.tokensBeforeCaret.concat(currentTokens).concat(partitionObj.tokensAfterCaret);

        // 7. Update sage model tokens
            this.setTokens(allTokens);

            _logger.debug('End updateTokens on input change: tokens', allTokens);
        };

        SageModel.prototype.updateHasSpaceAfter = function (inputStr) {
            var tokens = this.tokens;
            tokens.forEach(function (token) {
                var tokenIndex = token.getStartPosition();
                var tokenText = token.getTokenTextLowerCase();
                var tokenLength = !!tokenText ? tokenText.length : 0;
                var nextCharacter = inputStr[tokenIndex + tokenLength];
                if (!!nextCharacter) {
                    if (nextCharacter === ' ') {
                        token.setHasSpaceAfter(true);
                    } else {
                        token.setHasSpaceAfter(false);
                    }
                }
            });
        };

        SageModel.prototype.setAccessibleTables = function (accessibleTables) {
            this._accessibleTables = accessibleTables;
        };

        SageModel.prototype.getAccessibleTables = function () {
            return this._accessibleTables;
        };

        SageModel.prototype.createUnparsedQueryFragment = function (tokenList, fragmentStartIndex, fragmentLength) {
            var unparsedQF = new QueryFragment(tokenList, sage.PhraseDefinition.create(fragmentStartIndex, fragmentLength,
            sage.PhraseType.UNDEFINED_PHRASE));
            if (!!unparsedQF.getFullText().trim()) {
                this.queryFragments = this.queryFragments || [];
                this.queryFragments.push(unparsedQF);
            }

            return unparsedQF;
        };

    /**
     * Takes the phrase boundaries returned by sage and sets in this model a list of QueryFragment objects.
     * It also detects the set of trailing tokens that are left out from sage parsing and returns a single
     * unparsed QueryFragment object.
     *
     * @param {Array.<sage.RecognizedToken>} newTokens
     * @param {Array.<sage.PhraseDefinition>} phrases
     * @return {QueryFragment} The unparsed set of tokens as a query fragment.
     */
        SageModel.prototype.parseQueryFragments = function (newTokens, phrases) {
            this.queryFragments = [];
            if (!phrases) {
                return this.createUnparsedQueryFragment(newTokens, 0, newTokens.length);
            }

            this.queryFragments = phrases.map(function (p) {
                return new QueryFragment(newTokens, p);
            });

            if (!this.queryFragments || !this.queryFragments.length) {
                return this.createUnparsedQueryFragment(newTokens, 0, newTokens.length);
            }

        // Using the last query fragment, compute the list of trailing tokens that remained unparsed into phrases.
            var lastQF = this.queryFragments.last(),
                startIndexOfUnparsedSet = lastQF._startTokenPos + lastQF._numTokens,
                unparsedSetSize = newTokens.length - startIndexOfUnparsedSet;

            if (isNaN(startIndexOfUnparsedSet)) {
                _logger.warn('Could not determine query fragments');
                return this.createUnparsedQueryFragment(newTokens, 0, newTokens.length);
            }

            return this.createUnparsedQueryFragment(newTokens, startIndexOfUnparsedSet, unparsedSetSize);
        };

    /**
     *
     * @param {sage.FormattedTokens} formattedTokens
     */
        SageModel.prototype.updateUsingFormattedTokens = function (formattedTokens) {
            if (!formattedTokens) {
                _logger.error('Sage model update called with empty formattedTokens');
                return;
            }
            var tokens = formattedTokens.getTokens();
            var phrases = formattedTokens.getPhrases();
            this.setTokens(tokens);
            this.parseQueryFragments(tokens, phrases);
        };

    ////////////////////////////////////////////

        SageModel.prototype.needsJoinPathDisambiguation = function() {
            return !!this.joinDisambiguationHelper && !!this.joinDisambiguationHelper.getCurrentQuestion();
        };

        SageModel.prototype.hasUnrecognizedTokens = function() {
            return this.tokens.any(function(token) {
                return token.isNonEmptyUnrecognizedToken();
            });
        };

        SageModel.prototype.hasOneUnrecognizedTokens = function() {
            return this.tokens.filter(function (token) {
                return token.isNonEmptyUnrecognizedToken();
            }).length === 1;
        }

        SageModel.prototype.hasNonEmptyUnrecognizedTokensInTheMiddle = function() {
            var firstUnrecognizedIndex = this.tokens.findIndex(function(token) {
                return token.isUnrecognized() && !token.isEmpty();
            });
            var lastRecognizedIndex = util.findIndexFromLast(this.tokens, function(token) {
                return !token.isUnrecognized() && !token.isEmpty();
            });

            if (lastRecognizedIndex < 0 || firstUnrecognizedIndex < 0) {
                return false;
            }

            return firstUnrecognizedIndex < lastRecognizedIndex;
        };

        return SageModel;
    }]);
