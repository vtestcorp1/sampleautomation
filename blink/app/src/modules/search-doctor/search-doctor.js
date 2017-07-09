/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Directive for the Search Doctor Page
 */

'use strict';

blink.app.controller('SearchDoctorController', ['$scope',
    '$rootScope',
    'autoCompleteObjectUtil',
    'autoCompleteService',
    'blinkConstants',
    'strings',
    'carouselContent',
    'Logger',
    'sageUtil',
    'sessionService',
    function($scope,
             $rootScope,
             autoCompleteObjectUtil,
             autoCompleteService,
             blinkConstants,
             strings,
             carouselContent,
             Logger,
             sageUtil,
             sessionService) {
        var _logger = Logger.create('Search Doctor Controller');

        $scope.carousel =  new carouselContent('helpTip', [
            {
                contentUrl: 'src/common/widgets/carousel/templates/help-tip/search-video-tip.html',
                active: true
            },
            {
                contentUrl: 'src/common/widgets/carousel/templates/help-tip/advanced-search-tip.html'
            },
            {
                contentUrl: 'src/common/widgets/carousel/templates/help-tip/know-your-data-tip.html'
            },
            {
                contentUrl: 'src/common/widgets/carousel/templates/help-tip/choose-sources-tip.html'
            }
        ], 'help-tip');

        $scope.objectResultsTitle = null;

        $scope.objectResults = [];
        $scope.queryCompletions = [];

        $scope.errorState = null;

        var _joinDisambiguationHelper;
        var _currentTokens;

        var ERROR_STATES = {
            UNRECOGNIZED_TOKEN_NO_SUGGESTIONS: {
                message: 'Sorry, we did not understand <b>\"{1}\"</b>',
                css: 'layout2'
            },
            UNRECOGNIZED_TOKEN_WITH_SUGGESTIONS: {
                message: 'Sorry, we did not understand <b>\"{1}\"</b>',
                css: 'layout1'
            },
            AMBIGUITY: {
                message: '<b>\"{1}\"</b> can be interpreted in multiple ways',
                css: 'layout1'
            }
        };

    /**
     *
     * @param {sage.ACTableResponse} tableResponse
     */
        var processTableResponse = function(tableResponse) {
            _currentTokens = tableResponse.getNewTokens();

            var allTokenRecognized = _currentTokens.none(function(token) {
                return token.isUnrecognized();
            });

            if (allTokenRecognized) {
                var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                tableRequest.setInputTokens(_currentTokens);

                $scope.sageClient.editTable(tableRequest);
                $scope.onSearchCorrected();
                return;
            }

            sageUtil.preProcessQueryCompletions(tableResponse);

            $scope.objectResultsTitle = strings.searchDoctor.SIMILAR_SEARCHES_MESSAGE;

            $scope.queryCompletions = sageUtil.getQueryCompletions(tableResponse);

            $scope.queryCompletions.requiresFullLineage = tableResponse.hasDuplicatesInQueryCompletionShortLineages();

            _joinDisambiguationHelper = sageUtil.setupSageForJoinDisambiguation(tableResponse, function (resolvedTokens) {
                $scope.sageClient.editTable(resolvedTokens);
                $scope.onSearchCorrected();
            });

            if (!!_joinDisambiguationHelper) {
                $scope.queryCompletions = _joinDisambiguationHelper.getSuggestions();
            }

            $scope.errorState = !!_joinDisambiguationHelper ? ERROR_STATES.AMBIGUITY :
            !!$scope.queryCompletions.length ? ERROR_STATES.UNRECOGNIZED_TOKEN_WITH_SUGGESTIONS : ERROR_STATES.UNRECOGNIZED_TOKEN_NO_SUGGESTIONS;
        };

    /**
     *
     * @param {Array.<sage.RecognizedToken>} tokens
     */
        var processTokens = function(tokens, exactMatchOnly) {
            var context = $scope.sageClient.getContext();
            var currentIndex = $scope.sageClient.getCurrentIndex();

            var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
            tableRequest.setInputTokens(tokens);
            tableRequest.setExactMatchOnly(!!exactMatchOnly);

            var dataScopeTables = tableRequest.getDataScopeLogicalTables();
            var tables = context.getTables();
            tables.forEach(function(table, index) {
                if (index < currentIndex && dataScopeTables.indexOf(table) < 0) {
                    dataScopeTables.push(table.getId());
                }
            });

            autoCompleteService.editTable(context, currentIndex, tableRequest)
            .then(function(sageResponse) {
                var answerResponse = sageResponse.answerResponse;
                $scope.objectResultsTitle = strings.searchDoctor.SIMILAR_SEARCHES_MESSAGE;

                $scope.objectResults = answerResponse.getObjectResults();

                var tableResponse = answerResponse.getTableResponse();

                processTableResponse(tableResponse);
            },
            function() {
                _logger.warn('Search Doctor Failure !!!');
            });
        };

        $scope.isLayoutClass = function(cssClass) {
            return $scope.errorState && ($scope.errorState.css == cssClass);
        };

        $scope.getHeaderMessage = function() {
            if (!_currentTokens || !_currentTokens.length) {
                return '';
            }

            var alertToken;
            if (!!_joinDisambiguationHelper) {
                var index = _joinDisambiguationHelper.getWorkingTokenIndex();
                alertToken = _currentTokens[index];
            } else {
                alertToken = _currentTokens.find(function(token) {
                    return token.isUnrecognized();
                });
            }
            if (!alertToken) {
                return '';
            }
            return $scope.errorState.message.assign(alertToken.getTokenTextLowerCase());
        };

        $scope.$watch('model', function(model) {
            $scope.objectResultsTitle = strings.searchDoctor.SIMILAR_SEARCHES_MESSAGE;

            $scope.objectResults = model.objectResults;
            $scope.queryCompletions = model.queryCompletions;

            $scope.queryCompletions.requiresFullLineage = model.requiresFullLineage;

            $scope.errorState = !!_joinDisambiguationHelper ? ERROR_STATES.AMBIGUITY :
            !!$scope.queryCompletions.length ? ERROR_STATES.UNRECOGNIZED_TOKEN_WITH_SUGGESTIONS : ERROR_STATES.UNRECOGNIZED_TOKEN_NO_SUGGESTIONS;

            if (!$scope.objectResults.length) {
                var emptyContext = autoCompleteObjectUtil.getNewACContext();
                var emptyTableRequest = autoCompleteObjectUtil.getNewACTableRequest();

                autoCompleteService.addTable(emptyContext, emptyTableRequest)
                .then(function(sageResponse) {
                    var answerResponse = sageResponse.answerResponse;
                    $scope.objectResultsTitle = strings.searchDoctor.EXPLORE_SEARCHES_MESSAGE;
                    $scope.objectResults = answerResponse.getObjectResults();
                },
                function() {
                    _logger.warn('Search Doctor Failure !!!');
                });
            }
        });

        $scope.onClickQueryCompletion = function(queryCompletion) {
            var exactMatchOnly = false;
            if (queryCompletion.isFoldedCompletion()) {
                queryCompletion.getNewTokens().each(function(token) {
                    token.markUnrecognized();
                });
                exactMatchOnly = true;
            }
            if (_joinDisambiguationHelper &&
            queryCompletion.getCompletionType() === sage.QueryCompletion.CompletionTypes.JOIN) {
                _joinDisambiguationHelper.getCurrentQuestion().selectedOption = queryCompletion.getJoinOption();
                var nextChoices = _joinDisambiguationHelper.pruneChoicesAndUpdateQuestion(queryCompletion.getJoinOption());
                if (nextChoices) {
                    $scope.queryCompletions = _joinDisambiguationHelper.getSuggestions();
                }
                return;
            }

            processTokens(queryCompletion.getAllTokens(), exactMatchOnly);
        };

        $scope.isSearchHelpRestricted = function() {
            return sessionService.isSearchHelpRestricted();
        }
    }]);

blink.app.directive('searchDoctor', [function() {
    return {
        restrict: 'E',
        scope: {
            sageClient: '=',
            model: '=',
            onSearchCorrected: '='
        },
        controller: 'SearchDoctorController',
        templateUrl: 'src/modules/search-doctor/search-doctor.html'
    };
}]);
