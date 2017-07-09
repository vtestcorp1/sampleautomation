/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview utility functions for sage business logic
 */

'use strict';

blink.app.factory('sageUtil', ['autoCompleteObjectUtil',
    'util',
    'Logger',
    'JoinDisambiguationHelper',
    'env',
    'fontMetricService',
    'sageDataScopeService',
    function (autoCompleteObjectUtil,
              util,
              Logger,
              JoinDisambiguationHelper,
              env,
              fontMetricService,
              sageDataScopeService
    ) {

        var _logger = Logger.create('sage-util');

        var me = {};

        var MAX_MORE_COMPLETIONS = 100;

    /**
     * Return a word array given a token array. One token can have multiple words.
     * @param {Array.<sage.RecognizedToken} tokens
     */
        me.tokensToWords = function (tokens) {
            return tokens.map(function (t) {
                return t.getTokenTextLowerCase().split(' ');
            })
            .reduce(function (p, c) {
                return p.concat(c);
            }, []);
        };

    /**
     * @param {Array.<string>} words
     * @return {Array.<sage.RecognizedToken>}
     */
        me.wordsToUnrecognizedTokens = function (words) {
            return words.map(function (word) {
                return sage.RecognizedToken.createUnrecognizedToken(word);
            });
        };

    /**
     * Trim out empty unrecognized tokens from the right. Modifies tokens array.
     *
     * @param {Array.<sage.RecognizedToken>} tokens
     */
        me.removeTrailingUnrecognizedEmptyTokens = function (tokens) {
            while (tokens.length > 0) {
                var lastToken = tokens[tokens.length - 1];
                if (lastToken.isUnrecognized() && !lastToken.getTokenText()) {
                    tokens.pop();
                } else {
                    break;
                }
            }
            return tokens;
        };
        /**
         * Transform tokens by comparing the tokens with current input.
         * Suppose the tokens are [revenue, part name, container], all of them are recognized tokens.
         * Now imagine the user modified 'part name' to 'part ame'.
         * The resulting token array will look like [revenue, _part_, _ame_, container] where _foo_ means an unrecognized token.
         *
         * @param {Array.<string>} untrimmedInputWords
         * @param {Array.<sage.RecognizedToken>} tokens
         * @return {Array.<sage.RecognizedToken>}
         */
        me.getTokensFromWords = function (untrimmedInputWords, tokens) {

            // Important: no trailing empty words or tokens
            // The logic of this function will break if either the input word array has a trailing empty string, or
            // the tokens array has a trailing empty unrecognized token. Keep track of whether the input had
            // a trailing space, because then the final token list should contain an empty unrecognized token.
            // Note(chab) we are going to ged rid of that in the new sage version

            var inputWords = util.arrayTrimRight(untrimmedInputWords),
                wasTrimmed = (inputWords.length < untrimmedInputWords.length),
                _tokens = me.removeTrailingUnrecognizedEmptyTokens(tokens);

            function getTokens(tokens) {
                // if we have no tokens, all words are considered as unrecognized tokens
                if (!tokens.length) {
                    return me.wordsToUnrecognizedTokens(inputWords);
                }


                // we want to create unrecognized tokens from the input, there can be 2 situations
                // 1. User changed some tokens, so we need to find which tokens are now unrecognized
                // 2. User Input is after all already present tokens
                for (var i = 0; i < tokens.length; i++) {
                    var rt = tokens[i];
                    var rtTokensArr = me.parseSageBarText(rt.getTokenTextLowerCase()); // switch to sge bar text
                    if (util.isPrefixArray(rtTokensArr, inputWords)) {
                        while (rtTokensArr.length) {
                            rtTokensArr.shift();
                            inputWords.shift();
                        }
                    } else {
                        // first token mismatch. see if rest of the tokens are present in the rest of the array. if not, skip
                        // the next token and retry for the tokens after that. this way we can find which last set of tokens
                        // are still present in the input, aligned to the end.
                        var newUnrecognizedTokens;
                        for (var j = i; j < tokens.length; j++) {
                            var lastFewTokens = tokens.slice(j),
                                lastFewTokensAsWordsArray = me.tokensToWords(lastFewTokens);
                            if (util.isPostfixArray(lastFewTokensAsWordsArray, inputWords)) {
                                // seems like things changed between the i-th and j-th tokens.
                                // It could be one of the following:
                                //  1. just another char added/deleted to a token
                                //  2. space added in the middle of a word making it two words.
                                //  3. space removed between two words. This means two words joined.
                                //  4. A larger set of char added or deleted through cut or  paste operations.
                                //
                                var end = lastFewTokensAsWordsArray.length;
                                var numUnmatchedWords = inputWords.length - end,
                                    unmatchedWords = inputWords.slice(0, numUnmatchedWords);
                                newUnrecognizedTokens = me.wordsToUnrecognizedTokens(unmatchedWords);
                                // tokens i..j-1 should be replaced by unrecognized tokens using the unmatched words
                                return tokens.slice(0, i).concat(newUnrecognizedTokens).concat(lastFewTokens);
                            }
                        }
                        // tokens j..end did not match anywhere in rest of input. so all the rest of input words will become
                        // unrecognized tokens
                        newUnrecognizedTokens = me.wordsToUnrecognizedTokens(inputWords);
                        return tokens.slice(0, i).concat(newUnrecognizedTokens);
                    }
                }
                // user typed after the tokens
                return tokens.concat(me.wordsToUnrecognizedTokens(inputWords));
            }
            tokens = getTokens(_tokens);
            if (wasTrimmed) {
                tokens.push(sage.RecognizedToken.createUnrecognizedToken());
            }
            return tokens;
        };


        me.getPixelWidthOfSageInputString = function (txt) {
            var font = '14px Regular,helvetica neue,helvetica,Arial,sans-serif';
            return fontMetricService.getTextWidth(txt, font);
        };

    /**
     * This token sets absolute position for ghost tokens. It assumes that the tokens have startPosition
     * correctly populated (number of characters before this token in sageInput).
     * @param tokens
     * @param sageInput
     */
        me.computeGhostTokenPositions = function (tokens, sageInput) {
            angular.forEach(tokens, function (token, i) {
                var widthOfInputBeforeThisToken;
                if (token.isNonEmptyUnrecognizedToken() && i > 0 && tokens[i - 1].isNonEmptyUnrecognizedToken()) {
                    widthOfInputBeforeThisToken = me.getPixelWidthOfSageInputString(
                    sageInput.slice(0, tokens[i - 1].startPosition + tokens[i - 1].getTokenTextLowerCase().length));
                } else {
                    widthOfInputBeforeThisToken = me.getPixelWidthOfSageInputString(
                    sageInput.slice(0, token.startPosition));
                }
                var widthOfInputUntilEndOfThisToken = me.getPixelWidthOfSageInputString(
                sageInput.slice(0, token.startPosition + token.getTokenTextLowerCase().length));
                if (!token.cssProperties) {
                    token.cssProperties = {};
                }
                angular.extend(token.cssProperties, {
                    position: 'absolute',
                    left: widthOfInputBeforeThisToken,
                    width: widthOfInputUntilEndOfThisToken - widthOfInputBeforeThisToken
                });
            });
        };


    /**
     * Recognized tokens have many fields, but if the three fields compared here match then for all intents they can be
     * considered equivalent.
     * @param {sage.RecognizedToken} token1
     * @param {sage.RecognizedToken} token2
     * @returns {boolean}
     */
        me.equalRecognizedTokens = function (token1, token2) {
            if (token1.isUnrecognized()) {
                if (token2.isUnrecognized()) {
                    return token1.getTokenTextLowerCase() === token2.getTokenTextLowerCase();
                } else {
                    return false;
                }
            }
            return token1.getTokenTextLowerCase() === token2.getTokenTextLowerCase() &&
            token1.getTypeEnum() === token2.getTypeEnum() && token1.guid === token2.guid;
        };


    /**
     * Given an input string, break it into words by looking for space('') or
     * operators (=, <, >, <=, >=, !=). If we find an operator anywhere even if we don't have space separating them
     * we want them to become separate words. The return object gives us all the words.
     * If the caret is not overlapping with any token then, we create an empty token at the caret so that server knows
     * that we are trying to generate a completion for that spot.
     * @param {string} inputString
     * @param {number=} caretPosition
     * @returns {Array}
     */
        me.parseSageBarText = function (inputString, caretPosition) {
            caretPosition = caretPosition === null ? inputString.length : caretPosition;
            var result = [],
                wordStart = 0;
            for (var i = 0, l = inputString.length; i < l; ++i) {
                switch (inputString[i]) {
                    case ' ':
                        if (wordStart < i || (wordStart === i && i === caretPosition)) {
                            result.push(inputString.slice(wordStart, i));
                        }
                        wordStart = i + 1;
                        break;
                    case '!':
                // If we have a != here, we will take that as a new token.
                        if (inputString.length > i + 1 && inputString[i + 1] == '=') {
                            if (wordStart < i) {
                                result.push(inputString.slice(wordStart, i));
                            }
                            result.push('!=');
                            wordStart = i + 2;
                    // Since we are eating one more char, we want to increment i one extra time.
                            ++i;
                        }
                        break;
                    case '=':
                        if (wordStart < i) {
                            result.push(inputString.slice(wordStart, i));
                        }
                        result.push('=');
                        wordStart = i + 1;
                        break;
                    case '<':
                    case '>':
                        if (wordStart < i) {
                            result.push(inputString.slice(wordStart, i));
                        }
                        var word = inputString[i],
                            wordLength = 1;
                        if (inputString.length > i + 1 && inputString[i + 1] == '=') {
                            word = word.concat("=");
                            wordLength = 2;
                        }
                        result.push(word);
                        wordStart = i + wordLength;
                        if (wordLength == 2) {
                    // Since we are eating one more char, we want to increment i one extra time.
                            ++i;
                        }
                        break;
                    default:
                }
            }
            if (wordStart < inputString.length) {
                result.push(inputString.slice(wordStart));
            }
        // If we have trailing space and cursor is at the end, or the string is empty, we add a trailing empty word.
            if (result.length === 0 ||
            (inputString[inputString.length - 1] == ' '
                && caretPosition === inputString.length)) {
                result.push('');
            }
            return result;
        };

    /**
     * Find the contiguous suffix recognized tokens and its corresponding string. The suffix is calculated till we reach
     * the caret position, an unrecognized token or extensible token which has caret within it or at the boundary (See
     * assumptions).
     * Spaces in the input string are included only when they are between
     * 2 recognized tokens (NOT empty or unrecognized), both of which should be after the caret.
     * Here is the behaviour: 1. quantity__ab|c__revenue or qua|ntity__revenue. This would return [revenue] and revenue
     * (and not __revenue).
     *
     * Assumption:
     * 1. Input tokens should not have any empty token
     * 2. For extensible tokens - Unlike while calculating prefix tokens, we do not have to see the character before the
     * the extensible token. For eg, revenue > 10 and we paste/type something before 10, caret would always be at the end
     * of this new substring: revenue > abc|10. Because we don't include extensible tokens even if caret is at the boundary,
     * we are fine.
     *
     * TODO (Shikhar) - make this function pvt and update the unit test to use the public method partitionInput...
     *
     * Note: In future, if we want to bring notion of empty token again, you can check this:
     * http://mothership:8080/#/c/9238/2 (patch set 2)
     * It also has unit tests for the same.
     *
     * @param inputStrLwrCase - input string in lower case
     * @param tokens
     * @param caretPosition
     * @returns {{suffixTokens: Array, suffixLen: number}}
     */
        me.getSuffixRecognizedTokensInfo = function (inputStrLwrCase, tokens, caretPosition) {
            var currentEndPos = inputStrLwrCase.length - 1,
                suffixObj = {
                    suffixTokens: [],
                    suffixLen: 0
                };

            if (currentEndPos < 0 || !tokens.length || caretPosition >= inputStrLwrCase.length) {
                return suffixObj;
            }

            for (var i = tokens.length - 1; i >= 0; i--) {
                var token = tokens[i];
                if (token.isUnrecognized()) {
                    if (token.isEmpty()) {
                        _logger.warn('Empty token found while calculating suffix tokens');
                        _logger.debug('Empty token found while calculating suffix tokens', inputStrLwrCase, tokens, caretPosition);
                    }
                    return suffixObj;
                }

            // Remove white spaces at the end of each token
                var k = currentEndPos;
                for (; k >= 0 && inputStrLwrCase[k] == ' '; k--) {
                    if (k == caretPosition) {
                        return suffixObj;
                    }
                }

                currentEndPos = k;

                if (currentEndPos < 0) {
                    return suffixObj;
                }

                var tokenStr = token.getTokenTextLowerCase();
                for (var j = tokenStr.length - 1; j >= 0; j--, currentEndPos--) {
                    if (inputStrLwrCase[currentEndPos] != tokenStr[j] || currentEndPos - caretPosition < 0) {
                        return suffixObj;
                    }
                }

            // If the caret is at the beginning of an extensible token, we don't include it.
                if (token.isExtensible() && currentEndPos + 1 === caretPosition) {
                    return suffixObj;
                }

                suffixObj.suffixTokens.unshift(token);
                suffixObj.suffixLen = inputStrLwrCase.length - currentEndPos - 1;
            }

            return suffixObj;
        };

    /**
     * Dual of getSuffixRecognizedTokensInfo. Finds the contiguous prefix recognized tokens and its corresponding string.
     * The prefix is calculated till we reach the caret position, unrecognized token or extensible token if it has
     * non-space character immediately after it (See Note)
     * Spaces in the input string are included only when they are between 2 recognized tokens (NOT empty or unrecognized),
     * both of which should be before the caret.
     * Here is the behaviour: 1. quantity__ab|c__revenue or quantity__re|venue. This would return [quantity] and quantity
     * (and not quantity__).
     *
     * Assumption: Input tokens should not have any empty token
     *
     * Note: Special treatment of extensible token:
     * Suppose user types revenue > 1, 1 is recognized. Now he adds 0: revenue > 10|. We detect 1 is extensible and see
     * the next char. If it is non-space, we don't include 1 in the prefix tokens. We do not check caret for this case.
     * So 'revenue > 1| ' would include "1" as prefix as it has space after it.
     *
     * TODO (Shikhar) - make this function pvt and update the unit test to use the public method partitionInput...
     *
     * @param inputStrLwrCase - input string in lower case
     * @param tokens
     * @param caretPosition
     * @returns {{prefixTokens: Array, prefixLen: number}}
     */
        me.getPrefixRecognizedTokensInfo = function (inputStrLwrCase, tokens, caretPosition) {
            var currentStartPos = 0,
                prefixObj = {
                    prefixTokens: [],
                    prefixLen: 0
                },
                effectiveInputLength = inputStrLwrCase.length;

            if (effectiveInputLength <= 0 || !tokens.length || caretPosition <= 0) {
                return prefixObj;
            }

            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                if (token.isUnrecognized()) {
                    if (token.isEmpty()) {
                        _logger.warn('Empty token found while calculating prefix tokens');
                        _logger.debug('Empty token found while calculating prefix tokens', inputStrLwrCase, tokens, caretPosition);
                    }
                    return prefixObj;
                }

            // remove spaces before each token in the input string
                var k = currentStartPos;
                for (; k < effectiveInputLength && inputStrLwrCase[k] == ' '; k++) {
                // >= coz this case: caretPos = 0
                    if (k >= caretPosition - 1) {
                        return prefixObj;
                    }
                }

                currentStartPos = k;

                if (currentStartPos >= effectiveInputLength) {
                    return prefixObj;
                }

                var tokenStr = token.getTokenTextLowerCase();
                for (var j = 0; j < tokenStr.length; j++, currentStartPos++) {
                    if (inputStrLwrCase[currentStartPos] != tokenStr[j] || currentStartPos >= caretPosition) {
                        return prefixObj;
                    }
                }

                if (currentStartPos > effectiveInputLength) {
                    _logger.error('current start position great than length');
                    return prefixObj;
                }

            // If the token is extensible (in the example "1"), don't include it if:
            // 1. it is the end of the string, like revenue > 1|
            // 2. it has non space char after it, like revenue > 10| (Here we added 0 after 1)
                if (token.isExtensible() && (currentStartPos == effectiveInputLength || inputStrLwrCase[currentStartPos] != ' ')) {
                    return prefixObj;
                }

                prefixObj.prefixTokens.push(token);
                prefixObj.prefixLen = currentStartPos;
            }

            return prefixObj;
        };

    /**
     * For the given caret position, partitions the inout tokens and strings into contiguous recognized tokens before
     * caret, after caret, mid-unresolved tokens and mid0unresolved string
     * @param inputStrLwrCase
     * @param tokens
     * @param caretPosition
     * @returns {{tokensBeforeCaret: *, tokensAfterCaret: *, unresolvedTokens: (*|Array|string|Blob|UTILS.slice|slice),
     * unresolvedStringStartIndex: number, unresolvedStringLength: number}}
     */
        me.partitionInputBasedOnCaret = function (inputStrLwrCase, tokens, caretPosition) {
            var suffixObj = me.getSuffixRecognizedTokensInfo(inputStrLwrCase, tokens, caretPosition),
                prefixObj = me.getPrefixRecognizedTokensInfo(inputStrLwrCase, tokens, caretPosition);

            return {
                tokensBeforeCaret: prefixObj.prefixTokens,
                tokensAfterCaret: suffixObj.suffixTokens,
                unresolvedTokens: tokens.slice(prefixObj.prefixTokens.length, tokens.length - suffixObj.suffixTokens.length),
                unresolvedStringStartIndex: prefixObj.prefixLen,
                unresolvedStringLength: inputStrLwrCase.length - (prefixObj.prefixLen + suffixObj.suffixLen)
            };
        };

    /**
     * Traverses the input string character wise and gives starting position to each token.
     *
     * Note - this function is called for the tokens in response - not useful to call it during the request.
     *
     * Assumption: Empty token can only come if it is the one being edited
     *
     * @param inputStr
     * @param tokens
     * @param caretPosition
     */
        me.setTokensPosition = function (inputStr, tokens, caretPosition) {
            var hasSeenFirstEmptyToken = false;

            if (!tokens.length) {
                return;
            }

            var origStrLength = inputStr.length,
                tokenIndex = 0;

            for (var i = 0; i < origStrLength && tokenIndex < tokens.length;) {
            // There can be an empty token only if it is the one being edited
                if (tokens[tokenIndex].isEmpty()) {
                    if (hasSeenFirstEmptyToken) {
                        _logger.error('More than one empty token found while calculating tokens positions');
                        _logger.debug('More than one empty token found while calculating tokens positions', inputStr, tokens);
                        break;
                    } else {
                        tokens[tokenIndex].startPosition = caretPosition;
                        hasSeenFirstEmptyToken = true;
                    }

                    tokenIndex++;
                    continue;
                }

            // Note: Make sure to first check for emptyToken (tokens[tokenIndex].isEmpty()) and then empty char
                if (inputStr[i] == ' ') {
                    i++;
                    continue;
                }

                tokens[tokenIndex].startPosition = i;
                i += tokens[tokenIndex].getTokenTextLowerCase().length;
                tokenIndex++;
            }

        // It might happen that string has completed, but there is still token left. This should only happen if the last
        // token is empty. Consider: "revenue" and [revenue, empty]
            if (tokenIndex < tokens.length) {
                if (!tokens[tokenIndex].isEmpty() || hasSeenFirstEmptyToken) {
                    _logger.debug('While calculating starting position, string finished but tokens left', inputStr,
                tokens, caretPosition);
                    _logger.warn('While calculating starting position, string finished but tokens left', inputStr);
                    return;
                }
                tokens[tokenIndex].startPosition = caretPosition;
            }
        };

    /**
     * Processes tableResponse to give QueryCompletions
     *
     * @param {sage.ACTableResponse} tableResponse
     * @returns {Array.<sage.QueryCompletion>}
     */
        me.getQueryCompletions = function(tableResponse) {
            var completions = tableResponse.getQueryCompletions() || [];
            completions.forEach(function (comp) {
                var suffixTokens = comp.getSuffixTokensFromNewTokens(tableResponse.getNewTokens());
                var allTokens = comp.getQuery().concat(suffixTokens);
                comp.setAllTokens(allTokens);
            });

            return completions;
        };

        me.CompletionType = {
            // QueryCompletion
            QueryCompletion: 'QueryCompletion',
            ErrorQueryCompletion: 'ErrorQueryCompletion',
            WarnQueryCompletion: 'WarnQueryCompletion',
            EditJoinPath: 'EditJoinPath',
            OutOfScopeCompletion: 'OutOfScopeCompletion',
            SynonymCompletion: 'SynonymCompletion',
            SearchHistoryCompletion: 'SearchHistoryCompletion',

            // Non-QueryCompletion
            ObjectResult: 'ObjectResult',
            Feedback: 'Feedback'
        };

    /**
     * Given a QueryCompletion, dropdown mode and list type (small/big where big is default), returns the string
     * @param {sage.QueryCompletion} queryCompletion
     * @param {boolean} smallMode
     * @param {Object} list
     * @returns {string}
     */
        me.getLineageDropdown = function (queryCompletion, smallMode, list) {
            var str = '',
                listType = list.type;
            var requiresFullLineage = list.requiresFullLineage;
        // In case the completion is a synonym completion, full lineage is shown when the
        // completion at the drop down index is a synonym.
            if (listType == me.CompletionType.SynonymCompletion) {
                var completionToken = queryCompletion.getAllTokens()[queryCompletion.getNumPrefixTokens()];
                var metadata = completionToken.getTokenMetadata();
                if (metadata.name.length === 0 ||
                completionToken.getTokenText() === metadata.name) {
                    requiresFullLineage = false;
                } else {
                    requiresFullLineage = true;
                }
            }
            str = queryCompletion.getLineage(!!requiresFullLineage) || '';

            if (!str.trim()) {
                return '';
            }

            return str.escapeHTML();
        };

    /**
     *
     * @param {sage.ACTableResponse} tableResponse
     */
        me.preProcessQueryCompletions = function(tableResponse) {
            var queryCompletions = tableResponse.getQueryCompletions();
            if (!queryCompletions || !queryCompletions.length) {
                _logger.debug('No query completions found in the sage response', tableResponse);
                return;
            }

            if (queryCompletions.length <= env.maxNumCompletionsInSage) {
                _logger.info('All completions can fit, no folding is needed', queryCompletions.length);
                return;
            }

        // Per SCAL-6472, if there are any duplicate suggestions from sage that are not as a result of an exact match
        // we should fold them into one suggestion with a "(4 matches)" help text.
        // However, when user selects one of those options, we will show all the matching suggestions.
            var suggestionStringPresenceMap = {};

            queryCompletions.forEach(function (completion, i) {
                // Folding is supported for only single token suggestions.
                if (completion.getNewTokens().length === 1) {
                    var suggestionString = completion.getNewTokensNormalizedQueryString().toLowerCase();
                    if (!suggestionStringPresenceMap.hasOwnProperty(suggestionString)) {
                        suggestionStringPresenceMap[suggestionString] = [];
                    }
                    suggestionStringPresenceMap[suggestionString].push(completion);
                }
            });

            if (Object.values(suggestionStringPresenceMap).length === 1 &&
                Object.values(suggestionStringPresenceMap)[0].length === queryCompletions.length) {
                // For the case when all suggestions are the same we are not folding,
                // in that case we also want to delete the numDuplicates
                // field because that is being used in places to check for folding
                return;
            }

            Object.values(suggestionStringPresenceMap).forEach(function (similarCompletions) {
                var numDuplicates = similarCompletions.length;
                if (numDuplicates > 1) {
                    var firstCompletion = similarCompletions.shift();
                    var tokenIndex = firstCompletion.getNumPrefixTokens();
                    var originalToken = firstCompletion.getQuery()[tokenIndex];
                    var replacementToken = sage.RecognizedToken
                        .createUnrecognizedToken(originalToken.token);
                    firstCompletion.getQuery()[tokenIndex] = replacementToken;
                    var indexOfFirstCompletion = queryCompletions.indexOf(firstCompletion);
                    var foldedCompletion = new sage.FoldedQueryCompletion(firstCompletion);
                    foldedCompletion.setNumDuplicates(numDuplicates);
                    queryCompletions[indexOfFirstCompletion] = foldedCompletion;
                    similarCompletions.forEach(function (completion) {
                        _.remove(queryCompletions, completion);
                    });
                }
            })
        };


    /**
     * Sets up the scope for join disambiguation. Also returns the sage dropdown item config needed to show
     * the "mapping" button and label.
     *
     * @param {sage.ACTableResponse} tableResponse
     * @param {function} joinCompleteCallback
     */
        me.setupSageForJoinDisambiguation = function(tableResponse, joinCompleteCallback) {
            if (!me.doesSageNeedJoinDisambiguation(tableResponse)) {
                return;
            }

            var _joinDisambiguationHelper = new JoinDisambiguationHelper({
                joinPathCollections: tableResponse.getJoinPathAmbiguities(),
                tokens: tableResponse.getNewTokens()
            }, JoinDisambiguationHelper.modes.EMBEDDED_IN_SAGE, joinCompleteCallback);
            _joinDisambiguationHelper.init();

            return _joinDisambiguationHelper;
        };

    /**
     * @param {Array.<sage.RecognizedToken>} tokens
     * @return {String}
     */
        me.tokensToQuery = function(tokens) {
            return tokens.map(function(token) {
                return token.getTokenTextLowerCase();
            }).join(' ');
        };

    /**
     * @param {Array.<sage.RecognizedToken>} tokens
     * @returns {Array.<sage.RecognizedToken>} tokens
     */
        me.getPrefixRecognizedTokens = function(tokens) {
            var firstUnrecognizedTokenIndex = tokens.findIndex(function(token) {
                return token.isUnrecognized();
            });
            if (firstUnrecognizedTokenIndex == -1) {
                firstUnrecognizedTokenIndex = tokens.length;
            }
            return tokens.slice(0, firstUnrecognizedTokenIndex);
        };

    /**
     * Returns true if the sage response contains any join ambiguities.
     *
     * @param {sage.ACTableResponse} tableResponse
     * @returns {boolean}
     */
        me.doesSageNeedJoinDisambiguation = function(tableResponse) {
            return tableResponse.getJoinPathAmbiguities() && tableResponse.getJoinPathAmbiguities().length > 0;
        };

    /**
     * Gets the table hash key in context for table at given index.
     * @param sageContext {sage.ACContext}
     * @param index {number}
     * @returns {string}
     */
        me.getHashKey = function(sageContext, index) {
            if (!sageContext) {
                return null;
            }
            var tables = sageContext.getTables();
            var currentTable = tables[index];
            return currentTable.getHashKey();
        };

    /**
     * The sage model's accessible tables give us all tables that has join paths from
     * the current query in the worksheet/answer. There is another set of tables which
     * is the selected tables from the left panel. The effective data scope is the
     * intersection of the 2.
     *
     * @param sageModel
     */
        me.getEffectiveDataScope = function(sageModel) {
            var dataScope = sageDataScopeService.getSources().slice(0);
            if (!!sageModel && !!sageModel.getAccessibleTables()) {
                var accessibleTables = sageModel.getAccessibleTables();
                dataScope = dataScope.intersect(accessibleTables);
            }

            return dataScope;
        };

        me.getViewMoreRequest = function(sageModel) {
            var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
            tableRequest.setInputTokens(sageModel.tokens);
            // SCAL-18922 4.2.1 Sage auto-complete crash loop.
            //
            // When getting more completions blink was sending token under caret
            // as currently edited token which could be incorrect.
            // It is possible that the user is typing at end of text but with
            // some unrecognized tokens in the middle etc.
            // When getting more completions for any postions using the
            // completionStartPosition is an accurate value.
            // We can assume blink works with 2 operating indexes
            // 1. based on the user cursor(token under caret etc)
            // 2. based on where sage suggest user to fix things.(competionPosition)
            tableRequest.setCurrentlyEditedToken(sageModel.completionStartPosition);
            tableRequest.setCursorOffsetInToken(sageModel.caretPositionFromTokenStart);
            tableRequest.setExactMatchOnly(sageModel.showingExactMatches);
            tableRequest.setMaxCompletions(MAX_MORE_COMPLETIONS);

            return tableRequest;
        };

        me.getTableRequestForStandardCompletion = function(tokens, currentlyEditedToken) {
            var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
            tableRequest.setInputTokens(tokens);
            tableRequest.setCurrentlyEditedToken(currentlyEditedToken);
            return tableRequest;
        };

        me.getTableRequestForFoldingCompletion = function(sageModel, numDuplicates) {
            var tableRequest = this.getTableRequestForStandardCompletion(
                sageModel.tokens,
                sageModel.completionStartPosition);
            tableRequest.setExactMatchOnly(true);
            tableRequest.setMaxCompletions(numDuplicates);
            return tableRequest;
        };

        me.getTableRequestForCompletion = function(queryCompletion, sageModel) {
            if (queryCompletion.isFoldedCompletion()) {
                return this.getTableRequestForFoldingCompletion(
                    sageModel,
                    queryCompletion.getNumDuplicates()
                );
            } else {
                return this.getTableRequestForStandardCompletion(
                    sageModel.tokens,
                    sageModel.completionStartPosition + 1
                )
            }
        };

        return me;
    }
]);
