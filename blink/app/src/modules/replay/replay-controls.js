/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jordie Hannel (jordie@thoughtspot.com)
 *
 * @fileoverview Service to abstract high-level UI interactions for replays.
 */

'use strict';

/* eslint camelcase: 1 */
blink.app.factory('replayControls', ['$q',
    '$timeout',
    '$rootScope',
    'angularUtil',
    'blinkConstants',
    'strings',
    'chartTypeSpecificationService',
    'Logger',
    'navAlertService',
    'replayRunner',
    'safeApply',
    'uiControls',
    'util',
    function($q,
             $timeout,
             $rootScope,
             angularUtil,
             blinkConstants,
             strings,
             chartTypeSpecificationService,
             Logger,
             navAlertService,
             replayRunner,
             safeApply,
             uiControls,
             util) {

        var DELAY_1 = 150,
            DELAY_2 = 300,
            DELAY_3 = 600,
            DELAY_4 = 1200,
            DELAY_5 = 1800,
            SEARCH_ITEM_LIMIT = 6,
            ANSWER_UPDATE_TIMEOUT = 5000,
            CHART_TYPE_CHECK_DURATION = 500;

        var _logger = Logger.create('replay-service');
        var chartTypes = chartTypeSpecificationService.chartTypes;
        var atValidSubquery;

        function delayFor(duration) {
            var deferred = $q.defer();

            $timeout(
            function() {
                replayRunner.checkIfPaused()
                    .then(deferred.resolve);
            },
            duration
        );

            return deferred.promise;
        }

        function shortDelay() {
            return delayFor(DELAY_1);
        }

        function mediumDelay() {
            return delayFor(DELAY_2);
        }

        function longDelay() {
            return delayFor(DELAY_3);
        }

        function getClickEffectDiv(contents) {
            return '<div blink-click-effect ' + contents + '></div>';
        }

        function clickWithEffect(element, clickElement, fakeClick) {
            if (!element || !element.offset()) {
                return $q.when();
            }

            clickElement = clickElement || element;

            var offset = element.offset();
            var xPos = offset.left + element.width()/2;
            var yPos = offset.top + element.height()/2;
            if (xPos === 0 || yPos === 0) {
                return $q.when();
            }

            var deferred = $q.defer();

            var _scope = $rootScope.$new();
            _scope.yPos = yPos;
            _scope.xPos = xPos;
            _scope.onDone = function() {
                _$clickEffect.remove();
                if (!fakeClick) {
                    uiControls.queueClick(clickElement).then(deferred.resolve);
                } else {
                    deferred.resolve();
                }
            };

            var _$clickEffect = $(getClickEffectDiv('xpos="xPos" ypos="yPos" on-done="onDone"'));
            var $body = $('body');
            $body.append(_$clickEffect);
            angularUtil.getCompiledElement(_$clickEffect, _scope);
            safeApply(_scope);

            return deferred.promise;
        }

        function selectSource(sourceGuid) {
            var sourceToSelect = uiControls.getSourceWithGuid(sourceGuid);

            if (sourceToSelect && !sourceToSelect.find('.bk-checkbox').hasClass('bk-checked')) {
                return longDelay()
                .then(function() {
                    return clickWithEffect(sourceToSelect);
                })
                .then(function() {
                    return delayFor(DELAY_4);
                });
            } else {
                throw new Error('could not select source');
            }
        }

        function deselectSource(sourceGuid) {
            var sourceToDeselect = uiControls.getSourceWithGuid(sourceGuid);

            if (sourceToDeselect && sourceToDeselect.find('.bk-checkbox').hasClass('bk-checked')) {
                return longDelay()
                .then(function() {
                    return clickWithEffect(sourceToDeselect);
                })
                .then(function() {
                    return delayFor(DELAY_4);
                });
            } else {
                throw new Error('could not deselect source');
            }
        }

    /**
     * types text into input
     *
     * @param {Object} input
     * @param {str} text
     */
        function typeDataSource(text) {
        // need new promise to translate reject -> resolve from asyncEach
            var outerDeferred = $q.defer();

            uiControls.dataSourceInputElement().element().val('');

            util.asyncEach(text, function(letter, index) {

                if (uiControls.dataSourceItems().length < SEARCH_ITEM_LIMIT) {
                    return $q.reject({ canContinue: false });
                }

                uiControls.dataSourceInputElement().append(letter);

                return shortDelay() // DO NOT REMOVE - needs to be executed in next event loop
                .then(replayRunner.checkIfPaused)
                .then(function() {
                    if (uiControls.dataSourceItems().length < SEARCH_ITEM_LIMIT) {
                        return $q.reject({ canContinue: false });
                    } else {
                        return $q.when();
                    }
                });

            }).then(outerDeferred.resolve, outerDeferred.resolve);

            return outerDeferred.promise;
        }

        function ensureAllSourcesShown() {
            return simulateNavigation(uiControls.navigators.showAllSources);
        }

        function deselectAllDataSources() {
            var operations = [
                uiControls.navigators.clearDataSourceSelections,
                uiControls.navigators.confirmClearSearch
            ];

            return simulateNavigations(operations);
        }

    /**
     * visually iterates down suggestions until given one is found
     *
     * @param {Array} suggestions - assumes these DOM elements are onscreen
     * @param {Object} suggestion
     * @param {number} suggIndex
     */
        function tabToSuggestion(suggestions, suggestion, suggIndex) {
            var classes = suggestions[suggIndex].className;
            suggestions[suggIndex].className += ' active';
            return replayRunner.checkIfPaused()
            .then(mediumDelay)
            .then(function() {
                if (suggestions[suggIndex] == suggestion) {
                    return $q.when();
                } else {
                    suggestions[suggIndex].className = classes;
                    return tabToSuggestion(suggestions,suggestion,suggIndex+1);
                }
            });
        }

    /**
     * picks given suggestion from dropdown, then checks for disambiguation
     *
     * @param {Object} suggestion
     * @param {str} queryText
     * @param {str} tokenText
     * @param {Object} token
     */
        function pickSuggestion(suggestion, queryText, tokenText, token, remainingTokens) {
            var sageInput = uiControls.sageInputElement();

            return tabToSuggestion(sageInput.getSageSuggestions(), suggestion, 0)
            .then(longDelay)
            .then(replayRunner.checkIfPaused)
            .then(function() {
                // make sure the sage suggestions AND answer itself have been updated
                var suggestionsChange = sageInput.onSuggestionsChange();

                uiControls.queueClick($(suggestion));

                return suggestionsChange;
            })
            .finally(
                function() {
                    return checkSageSuggestions(queryText, tokenText, token, remainingTokens);
                }
            );
        }

        function tokensAreDifferent(remainingToken, matchTokenText, matchTokenGuid) {
            return (!!remainingToken.guid
            && remainingToken.guid.length
            && remainingToken.guid !== matchTokenGuid)
            || (remainingToken.replayText !== matchTokenText);
        }

        function getMatchingSuggestion(remainingTokens, suggestions) {
            for (var i = 0; i < suggestions.length; i++) {
                try {
                    var match = $(suggestions[i]).scope().match;
                    var matchTokens = match.getNewTokens();
                    var isMatch = true;
                    for (var j = 0; j < matchTokens.length; j++) {
                        var matchTokenText = matchTokens[j].getToken().toLowerCase();
                        var matchTokenGuid = matchTokens[j].getGuid();
                        if (tokensAreDifferent(remainingTokens[j], matchTokenText, matchTokenGuid)) {
                            isMatch = false;
                            break;
                        }
                    }
                    if (isMatch) {
                        return suggestions[i];
                    }
                } catch (err) {
                    _logger.error('Failed to process suggestion ' + i, err);
                }
            }

            return null;
        }

    /**
     * iteratively checks suggestions and selects correct one until sage text is fully processed
     *
     * @param {str} queryText
     * @param {str} phraseText
     * @param {Object} token
     */
        function checkSageSuggestions(queryText, phraseText, token, remainingTokens) {
            var deferred = $q.defer();

            var sageInput = uiControls.sageInputElement();
            var suggestions = sageInput.getSageSuggestions();

        // all text in sage bar is recognized and disambiguated
            if (atValidSubquery()) {
                if (sageInput.val()[sageInput.val().length - 1] != ' ') {
                    sageInput.setVal(sageInput.val() + ' ');
                }
                deferred.resolve();
            } else if (suggestions.length === 0) {
                if (queryText === sageInput.val()) {
                    sageInput.append(' ', deferred.reject);
                } else {
                    deferred.reject();
                }
            }
        // handle join path disambiguation
            else if (sageInput.val().length > 0 && sageInput.hasMJP()) {
                var disambigSuggestion = getDisambiguateSuggestion(token);
                if (disambigSuggestion) {
                    pickSuggestion(disambigSuggestion, queryText, phraseText, token, remainingTokens)
                    .then(deferred.resolve, deferred.reject);
                } else {
                    throw new Error('Could not disambiguate join path!');
                }
            }
        // check for correct suggestions
            else {
                var suggestion = getMultipleMatchesSuggestion(suggestions, phraseText);

                if (!(suggestion)) {
                    suggestion = getMatchingSuggestion(remainingTokens, suggestions);
                }

                if (suggestion) {
                    pickSuggestion(suggestion, queryText, phraseText, token, remainingTokens)
                    .then(deferred.resolve, deferred.reject);
                } else if (sageInput.val().trim().length === queryText.length) {
                // view all suggestions.
                    var viewMore = sageInput.getViewMoreSuggestion();
                    if (viewMore) {
                        uiControls.highlightElement(viewMore);

                        replayRunner.checkIfPaused()
                        .then(longDelay)
                        .then(function() {
                            uiControls.unhighlightElement(viewMore);

                            var suggestionsChange = sageInput.onSuggestionsChange();

                            return clickWithEffect(viewMore).then(function() {
                                return suggestionsChange;
                            });
                        })
                        .then(function() {
                            checkSageSuggestions(queryText, phraseText, token, remainingTokens)
                            // if all text is typed and token is not found,
                            // need to keep typing
                                .then(deferred.resolve, deferred.resolve);
                        });
                    } else {
                        deferred.reject();
                    }
                } else {
                    deferred.reject();
                }
            }
            return deferred.promise;
        }

        function textForToken(token, tokens, i) {
            if (token.isValueToken()
            && token.getDataType() === sage.DataType.CHAR
            && token.getToken().charAt(0) !== '"'
            && token.getToken().charAt(0) !== "'"
            && i > 0
            && tokens[i-1].isOperatorToken()) {
                return "'" + token.getToken().toLowerCase() + "'";
            }
            return token.getToken().toLowerCase();
        }

        function addReplayTextToTokens(tokens) {
            return tokens.map(function(token, i, tokens) {
                var tokenText = textForToken(token, tokens, i);
                token.replayText = tokenText;
                return token;
            });
        }

        function replayTextFromTokens(tokens) {
            return tokens.map(function(token) {
                return token.replayText;
            }).join(' ');
        }

        function getNextTokenIndex(tokens) {
            var nextTokenIndex = -1;
            var sageInput = uiControls.sageInputElement();

            tokens.forEach(function(token, i, tokens) {
                var prevTokens = tokens.slice(0, i + 1);
                if (nextTokenIndex < 0
                && sageInput.val().toLowerCase().indexOf(replayTextFromTokens(prevTokens)) < 0) {
                    nextTokenIndex = i;
                }
            });

            return nextTokenIndex;
        }

        function getValidLengths(tokens) {
            var sageInput = uiControls.sageInputElement();
            var currentLength = sageInput.val().length;

            var validLengths = [];
            tokens.forEach(function(token, i, tokens) {
                var prevTokens = tokens.slice(0, i + 1);
                var length = replayTextFromTokens(prevTokens).length;
                if (length > currentLength) {
                    validLengths.push(length);
                }
            });

            return validLengths;
        }

        function enterSageTokens(tokens) {
            function enterNextToken() {
                tokens = addReplayTextToTokens(tokens);

                var nextTokenIndex = getNextTokenIndex(tokens);
                var validLengths = getValidLengths(tokens);

                if (nextTokenIndex < 0) {
                    return $q.when();
                }

                var text = replayTextFromTokens(tokens);

                atValidSubquery = function() {
                    var sageInput = uiControls.sageInputElement();
                    return validLengths.indexOf(sageInput.val().trim().length) > -1
                    && sageInput.allResolved();
                };

                return enterSageText(text, tokens.slice(nextTokenIndex, tokens.length))
                .then(enterNextToken);
            }

            return enterNextToken();
        }

    /**
     * Enters str into sage bar, using suggestions/disambiguation
     *
     * @param {Object} token
     */
        function enterSageText(text, remainingTokens) {
            var sageInput = uiControls.sageInputElement();
            var firstToken = remainingTokens[0];
            var firstTokenText = firstToken.getToken().toLowerCase().trim();
            var queryText = sageInput.val().toLowerCase().trim();
            if (queryText.length > 0) {
                queryText += ' ';
            }
            queryText += firstTokenText;

            function lookForToken() {
                return replayRunner.checkIfPaused()
                .then(function() {
                    return checkSageSuggestions(queryText, text, firstToken, remainingTokens);
                })
                .then(
                    function() {
                        return delayFor(DELAY_3);
                    },
                    function() {
                        var strPos = sageInput.val().length;

                        return sageInput.append(text.slice(strPos, strPos+1))
                            .then(function() {
                                return lookForToken();
                            });
                    }
                );
            }

            return lookForToken();
        }

    /**
     * looks for relevant suggestion with multiple matches
     *
     * @param {Array} suggestions
     * @param {str} tokenText
     * @return matching suggestion or null
     */
        function getMultipleMatchesSuggestion(suggestions, tokenText) {
            for (var i = 0; i < suggestions.length; i++){
                try {
                    var match = $(suggestions[i]).scope().match;
                    var detailText = match.getLineage().toLowerCase();
                    var suggestedToken = match.getNewTokensQueryString().toLowerCase();
                    if (suggestedToken === tokenText && detailText.indexOf('matches') > -1) {
                        return suggestions[i];
                    }
                } catch (err) {
                    _logger.log(err);
                }
            }
            return null;
        }

    /**
     * looks for relevant disambiguation suggestion
     *
     * @param {Object} token - current token being matched
     * @return matching suggestion or null
     */
        function getDisambiguateSuggestion(token) {
            var suggestions = uiControls.sageInputElement().getSageSuggestions();
        // TODO(Jordie) : Evaluate support for chasm trap where we have multiple roots.
            var joinPath = token.getJoinPaths()[0];

            for (var i = 0; i < suggestions.length; i++) {
                try {
                    var match = $(suggestions[i]).scope().match;
                    if (match.getCompletionType() === sage.QueryCompletion.CompletionTypes.JOIN) {
                        var linkGuid = match.getJoinOption().link.getGuid();
                        if (joinPath.containsLink(linkGuid)) {
                            return suggestions[i];
                        }

                    } else if (match.getCompletionType() === sage.QueryCompletion.CompletionTypes.BASE) {
                        var matchGuid = match.getNewTokens()[0].guid;
                        if (matchGuid === token.guid) {
                            return suggestions[i];
                        }
                    }
                } catch (err) {
                    _logger.log(err);
                }
            }

            return null;
        }

        function asyncEach(arr, promiseFn) {
            if (!arr.length) {
                return $q.when();
            }

            return util.asyncEach(arr, promiseFn);
        }

        function waitForTableSelected() {
            return uiControls.waitFor(
            'table type selected',
            function() {
                return uiControls.getCurrentVizType() === chartTypes.TABLE;
            }
        );
        }

        function checkForCorrectChartType(vizType) {
            return uiControls.waitFor(
            'checking for correct chart type',
            function() {
                return uiControls.getCurrentVizType() === vizType;
            },
            CHART_TYPE_CHECK_DURATION,
            true
        );
        }

        function waitForCorrectChartType(vizType) {
            return uiControls.waitFor(
            'waiting for correct chart type',
            function() {
                return uiControls.getCurrentVizType() === vizType;
            }
        );
        }

        function selectCorrectChartType(vizType) {
            return simulateNavigation(uiControls.navigators.openChartTypeSelector)
            .then(longDelay)
            .then(function() {
                return clickWithEffect(uiControls.chartTypeSelectorButton(vizType));
            })
            .then(function() {
                return waitForCorrectChartType(vizType);
            })
            .then(longDelay)
            .then(function() {
                return simulateNavigation(uiControls.navigators.closeChartTypeSelector);
            });
        }

        function selectVizType(vizType) {
            if(!vizType) {
                return $q.when();
            }

            if (vizType === uiControls.getCurrentVizType()) {
                return $q.when();
            }

            if (vizType === chartTypes.TABLE) {
                return clickWithEffect($(uiSelectors.TABLE_TYPE_SELECTOR))
                .then(waitForTableSelected);
            }

            return clickWithEffect($(uiSelectors.CHART_SELECTOR_BUTTON_SELECTOR))
            .then(function() {
                return checkForCorrectChartType(vizType);
            })
            .then(
                function() {
                    return $q.when();
                },
                function() {
                    return selectCorrectChartType(vizType);
                }
            );
        }

        function typePhraseInInputUntil(phrase, input, untilFn) {
            phrase = phrase.toLowerCase();
            if (phrase.length === 0 || untilFn()) {
                return $q.when();
            }
            input.val(input.val() + phrase.slice(0,1));
            input.trigger('change');
            return mediumDelay()
            .then(function() {
                return typePhraseInInputUntil(phrase.slice(1), input, untilFn);
            });
        }

        function doDefaultConfig(vizConfig) {
            return configureVizForType(chartTypes.BAR, vizConfig);
        }

        function configureVizForType(vizType, vizConfig) {

            function openChartConfigMenu() {
                return longDelay()
                .then(function() {
                    return clickWithEffect($(uiSelectors.CHART_CONFIG_MENU_BUTTON));
                })
                .then(longDelay);
            }

            function closeChartConfigMenu() {
                return longDelay()
                .then(function() {
                    return clickWithEffect($(uiSelectors.CHART_CONFIG_MENU_BUTTON));
                })
                .then(longDelay);
            }

            function selectCol(col, colChoicesFn) {
                var choices = colChoicesFn();
                for (var i = 0; i < choices.length; i++) {
                    if ($(choices[i]).scope().$parent.column.getBaseColumnGuid() === col.guid) {
                        return clickWithEffect($(choices[i]));
                    }
                }
            }

            function selectColFromInput(col, input, colChoicesFn) {
                return typePhraseInInputUntil(
                col.name,
                input,
                function() {
                    var choices = colChoicesFn();
                    return choices.length > 0 && choices.length < 3;
                }
            )
                .then(longDelay)
                .then(function() {
                    return selectCol(col, colChoicesFn);
                })
                .then(longDelay);
            }

            function getElemForCol(selector, col) {
                var selectedCols = $(selector).find(uiSelectors.UI_SELECT_SELECTED_ITEMS);
                for (var i = 0; i < selectedCols.length; i++) {
                    if ($(selectedCols[i]).scope().$item.getBaseColumnGuid() == col.getBaseColumnGuid()) {
                        return $(selectedCols[i]);
                    }
                }
                return null;
            }

            function setChartConfigColumns(cols, currentColumns, configSelector, isDryRun) {
                var guidsToSelect = cols.map(function(col) {
                    return col.guid;
                });

                var selectedGuids = [];
                var colsToRemove = [];
                for (var i = 0; i < currentColumns.length; i++) {
                    var vizCol = currentColumns[i];
                    var colName = vizCol.getName();
                    var colGuid = vizCol.getBaseColumnGuid();

                    selectedGuids.push(colGuid);

                    if (guidsToSelect.indexOf(colGuid) === -1) {
                        colsToRemove.push(currentColumns[i]);
                    }
                }

                var colsToSelect = cols.filter(function(col) {
                    return selectedGuids.indexOf(col.guid) === -1;
                });

                if (isDryRun) {
                    return (colsToRemove.length + colsToSelect.length) > 0;
                }

                return asyncEach(
                    colsToRemove,
                    function(col) {
                        var elemToRemove = getElemForCol(configSelector, col);
                        return clickWithEffect(elemToRemove.find(uiSelectors.UI_SELECT_REMOVE_SELECTOR));
                    }
                ).then(function() {
                    return asyncEach(
                        colsToSelect,
                        function(col) {
                            return selectColFromInput(
                                col,
                                $(configSelector).find('input'),
                                function() {
                                    return $(configSelector).find(uiSelectors.UI_SELECT_CHOICE_SELECTOR);
                                }
                            );
                        }
                    );
                });
            }

            function getCurrentXAxisColumns() {
                return $(uiSelectors.ANSWER_PAGE).scope().$ctrl.chartEditorComponent.chartModel.getXAxisColumns();
            }

            function setXAxisColumns(isDryRun) {
                return setChartConfigColumns(
                    vizConfig.xAxisCols,
                    getCurrentXAxisColumns(),
                    uiSelectors.X_AXIS_INPUT_SELECTOR,
                    isDryRun
                );
            }

            function getCurrentYAxisColumns() {
                return $(uiSelectors.ANSWER_PAGE).scope().$ctrl.chartEditorComponent.chartModel.getYAxisColumns();
            }

            function setYAxisColumns(isDryRun) {
                return setChartConfigColumns(
                    vizConfig.yAxisCols,
                    getCurrentYAxisColumns(),
                    uiSelectors.Y_AXIS_INPUT_SELECTOR,
                    isDryRun
                );
            }

            function getCurrentLegendColumns() {
                return $(uiSelectors.ANSWER_PAGE).scope().$ctrl.chartEditorComponent.chartModel.getLegendColumns();
            }

            function setLegendColumns(isDryRun) {
                return setChartConfigColumns(
                    vizConfig.legendCols,
                    getCurrentLegendColumns(),
                    uiSelectors.LEGEND_AXIS_INPUT_SELECTOR,
                    isDryRun
                );
            }

            function setIsYAxisShared(isDryRun) {
                if (!angular.isDefined(vizConfig.isYAxisShared)) {
                    return isDryRun ? false : $q.when();
                }

                var axisSharingEnabled =
                $(uiSelectors.Y_AXIS_SHARING_BUTTON_SELECTOR).hasClass(uiSelectors.Y_AXIS_SHARING_ENABLED_CLASS);

                if (isDryRun) {
                    return vizConfig.isYAxisShared !== axisSharingEnabled;
                }

                if (vizConfig.isYAxisShared !== axisSharingEnabled) {
                    return clickWithEffect($(uiSelectors.Y_AXIS_SHARING_BUTTON_SELECTOR));
                }

                return $q.when();
            }

            function setRadialColumn(isDryRun) {
                var currentRadialCol =
                $(uiSelectors.RADIAL_ELEMENT_SELECTOR).scope().$ctrl.selectedAxisConfig.radialColumn;

                var needsChange = currentRadialCol.getBaseColumnGuid() !== vizConfig.radialCol.guid;

                if (!needsChange) {
                    return (isDryRun ? false : $q.when());
                }

                var colToSelect =
                $(uiSelectors.RADIAL_ELEMENT_SELECTOR).find(uiControls.optionContaining(vizConfig.radialCol.name));
                colToSelect.attr('selected','selected');

            // to avoid digest in progress error
                util.executeInNextEventLoop(function() {
                    $(uiSelectors.RADIAL_ELEMENT_SELECTOR).trigger('change');
                });

                return mediumDelay();
            }

            function doConfigSteps(steps) {
            // if non of the steps need execution, return
                if (steps.all(function(step) {
                    return !(step(true));
                })) {
                    return $q.when();
                }

                return openChartConfigMenu()
                .then(function() {
                    return util.asyncEach(
                        steps,
                        function(step) {
                            return step(false);
                        }
                    );
                })
                .then(closeChartConfigMenu);
            }

            function configXYLegend() {
                var steps = [
                    setXAxisColumns,
                    setYAxisColumns,
                    setLegendColumns,
                    setIsYAxisShared
                ];

                return doConfigSteps(steps);
            }

            function configXYLegendSize() {
                var steps = [
                    setXAxisColumns,
                    setYAxisColumns,
                    setLegendColumns,
                    setIsYAxisShared,
                    setRadialColumn
                ];

                return doConfigSteps(steps);
            }

            function configXY() {
                var steps = [
                    setXAxisColumns,
                    setYAxisColumns
                ];

                return doConfigSteps(steps);
            }

            function configXYSize() {
                var steps = [
                    setXAxisColumns,
                    setYAxisColumns,
                    setRadialColumn
                ];

                return doConfigSteps(steps);
            }

            function configGeo() {
                return configXYLegend();
            }

            var configMethods = {};

            configMethods[chartTypes.TABLE] = angular.noop;

            configMethods[chartTypes.GEO_AREA] = configGeo;
            configMethods[chartTypes.GEO_BUBBLE] = configGeo;
            configMethods[chartTypes.GEO_HEATMAP] = configGeo;
            configMethods[chartTypes.GEO_EARTH_AREA] = configGeo;
            configMethods[chartTypes.GEO_EARTH_BUBBLE] = configGeo;
            configMethods[chartTypes.GEO_EARTH_BAR] = configGeo;
            configMethods[chartTypes.GEO_EARTH_HEATMAP] = configGeo;
            configMethods[chartTypes.GEO_EARTH_GRAPH] = configGeo;

            configMethods[chartTypes.BAR] = configXYLegend;
            configMethods[chartTypes.COLUMN] = configXYLegend;
            configMethods[chartTypes.STACKED_COLUMN] = configXYLegend;
            configMethods[chartTypes.PARETO] = configXYLegend;
            configMethods[chartTypes.LINE] = configXYLegend;
            configMethods[chartTypes.AREA] = configXYLegend;
            configMethods[chartTypes.SCATTER] = configXYLegend;
            configMethods[chartTypes.WATERFALL] = configXYLegend;
            configMethods[chartTypes.STACKED_AREA] = configXYLegend;
            configMethods[chartTypes.LINE_COLUMN] = configXYLegend;

            configMethods[chartTypes.BUBBLE] = configXYLegendSize;

            configMethods[chartTypes.PIE] = configXY;

            configMethods[chartTypes.TREEMAP] = configXYSize;
            configMethods[chartTypes.HEATMAP] = configXYSize;

        // Call appropriate config method for viz type
            return configMethods[vizType]();
        }

        function configureViz(vizType, vizConfig) {
            return selectVizType(vizType)
            .then(function() {
                try {
                    return configureVizForType(vizType, vizConfig);
                } catch (err1) {
                    try {
                        return doDefaultConfig(vizConfig);
                    } catch (err2) {
                        return $q.when();
                    }
                }
            });
        }

        function simulateNavigations(operations, shouldClickParent) {
            return util.asyncEach(operations, function(operation, index) {
                var parent = false;
                if (shouldClickParent) {
                    parent = shouldClickParent[index];
                }
                return simulateNavigation(operation, parent);
            });
        }

        function simulateNavigation(navigator, shouldClickParent) {
            if (navigator.inState()) {
                return $q.when();
            } else {

                return uiControls.waitFor(
                    navigator.getElement,
                    function() {
                        return navigator.getElement().length > 0;
                    }
                )
                .then(replayRunner.checkIfPaused)
                .then(function() {

                    var clickElement = shouldClickParent ? navigator.getElement().parent() : navigator.getElement();
                    return clickWithEffect(clickElement, null, true);

                })
                .then(function() {
                    return uiControls.navigate(navigator);
                })
                .then(function() {
                    return delayFor(DELAY_4);
                });
            }
        }

    /**
     * utilities to navigate
     */
        var navigators = {

            goToAnswer: function() {
                return simulateNavigation(uiControls.navigators.goToAnswer);
            },

            goHome: function() {
                return simulateNavigation(uiControls.navigators.goHome);
            },

            openSageDataSourceDialog: function() {
                var operations = [
                    uiControls.navigators.showSageDataSourcePanel,
                    uiControls.navigators.showSageDataSourceDialog
                ];

                return simulateNavigations(operations, [false, true]);
            },

            closeSageDataSourceDialog: function() {
                var operations = [
                    uiControls.navigators.hideSageDataSourceDialog,
                    uiControls.navigators.hideSageDataSourcePanel
                ];

                return simulateNavigations(operations, [true, false]);
            }
        };

        return {
        // Functions
            selectSource: selectSource,
            deselectSource: deselectSource,
            deselectAllDataSources: deselectAllDataSources,
            typeDataSource: typeDataSource,
            enterSageText: enterSageText,
            enterSageTokens: enterSageTokens,
            navigators: navigators,
            clickWithEffect: clickWithEffect,
            configureViz: configureViz,
            ensureAllSourcesShown: ensureAllSourcesShown
        };

    }]);
