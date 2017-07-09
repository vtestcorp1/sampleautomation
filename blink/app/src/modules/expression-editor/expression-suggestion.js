/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Data model for expression suggestions.
 */

'use strict';

blink.app.factory('ExpressionSuggestion', ['Logger', 'expressionUtil', 'util',
    function(Logger, expressionUtil, util) {
        var RIGHT_ARROW_CHARACTER = '\u2192';

        var logger = Logger.create('expression-suggestion');

        function ExpressionSuggestion(suggestionToken, joinChoice, historyList) {
            this.suggestionToken = suggestionToken;
            this.joinChoice = joinChoice || null;
            this.historyList = historyList || null;

            this.links = null;
            if (this.historyList) {
                this.links = historyList.map(function(historyItem){
                    return historyItem.question.selectedOption.link.getDisplayName();
                }).join(', ');
            }
        }

        ExpressionSuggestion.prototype.getSuggestionToken = function () {
            return this.suggestionToken;
        };

        ExpressionSuggestion.prototype.getSuggestionTokenText = function () {
            return this.suggestionToken.getTokenTextLowerCase();
        };

        ExpressionSuggestion.prototype.getLineage = function () {
            if (!!this.joinChoice) {
                return this.joinChoice.root ? 'All types' : this.joinChoice.link.getDisplayName();
            }
            return this.suggestionToken.getImmediateLineage();
        };

        ExpressionSuggestion.prototype.getLinks = function () {
            return this.links;
        };

        ExpressionSuggestion.prototype.getTokenCssClass = function () {
            return expressionUtil.getTokenDisplayCSSClass(this.suggestionToken);
        };

        ExpressionSuggestion.prototype.getHelpDataForFunctionSuggestion = function () {
            if (!this.suggestionToken.isFunctionToken()) {
                logger.warn('getHelpForFunctionToken may be called for function tokens only');
                return '';
            }
            return expressionUtil.getHelpDataForFunction(this.suggestionToken.getTokenTextLowerCase());
        };

        ExpressionSuggestion.prototype.getMetaInfoHtml = function() {
            if (this.suggestionToken.isDataToken()) {
                return new util.NameValuePairs(this.suggestionToken.getTokenMetaInfo()).getTemplate();
            } else {
                return '<span class="suggestion-name" ng-class="suggestion.getTokenCssClass()">{1}</span>'.assign(this.getSuggestionTokenText());
            }
        };

        ExpressionSuggestion.createSuggestionsFromJoinDisambiguationHelper = function (joinDisambiguationHelper, currentToken) {
            var currentQuestion = joinDisambiguationHelper.getCurrentQuestion();
            if (!currentQuestion) {
                return [];
            }

            var historyList = joinDisambiguationHelper.getSelectionHistory().getHistoryList();

            return currentQuestion.options.map(function(joinChoice){
                return new ExpressionSuggestion(currentToken, joinChoice, historyList);
            });
        };

        ExpressionSuggestion.createSuggestionsFromTokenCompletions = function (tokenCompletions) {
            return tokenCompletions.map(function(tokenCompletion){
                return new ExpressionSuggestion(tokenCompletion.getRecognizedToken());
            });
        };

        return ExpressionSuggestion;

    }]);
