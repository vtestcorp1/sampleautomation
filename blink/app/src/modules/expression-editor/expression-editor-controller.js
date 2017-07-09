/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Controller for Expression editor
 */

'use strict';

blink.app.controller('ExpressionEditorController', ['$scope',
    '$q',
    'autoCompleteObjectUtil',
    'autoCompleteService',
    'blinkConstants',
    'strings',
    'ExpressionEditorModel',
    'Logger',
    'safeApply',
    'util',
    function ($scope,
          $q,
          autoCompleteObjectUtil,
          autoCompleteService,
          blinkConstants,
          strings,
          ExpressionEditorModel,
          Logger,
          safeApply,
          util) {
        var logger = Logger.create('expression-editor-controller');

    // TODO(sunny): move all of these scope variables to
    // inside expression model


        $scope.isRemoteCallPending = false;

        function updateOnSageResponse(sageResponse) {
            var currentSageQuery = $scope.expressionEditorModel.getFormulaExpression();
            $scope.expressionEditorModel = $scope.expressionEditorModel.createUpdatedModelFromSageResponse(sageResponse);

            var formulaExpression = $scope.expressionEditorModel.getFormulaExpression();
        // encoded query is empty unless the formula is a valid one
            if (!!formulaExpression && sage.serialize(formulaExpression).length) {
                if(formulaExpression !== currentSageQuery) {
                    $scope.onValidExpression({
                        expressionEditorModel: $scope.expressionEditorModel
                    });
                }
            } else {
                $scope.onInvalidExpression();
            }
        }

        function getSageAutoCompleteResponse (tokens, underCaretTokenIndex, caretPositionFromTokenStart) {
            var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
            tableRequest.setInputTokens(tokens);
            tableRequest.setCurrentlyEditedToken(underCaretTokenIndex);
            tableRequest.setCursorOffsetInToken(caretPositionFromTokenStart);
            tableRequest.setDataScopeLogicalTables($scope.expressionEditorModel.dataScope);
            tableRequest.setIsRowSecurityFormula(!!$scope.expressionEditorModel.isRLS);
            if(!!$scope.expressionEditorModel.isRLS) {
                tableRequest.setDataScopeForcedRoot($scope.expressionEditorModel.dataScope[0]);
            }

            return autoCompleteService.updateExpression(
            tableRequest,
            $scope.expressionEditorModel.getSageContext(),
            $scope.expressionEditorModel.getFormulaId()
        );
        }

        $scope.syncModelWithSage = function (tokens, callback) {

            $scope.isRemoteCallPending = true;

            var uiVersionNumberAtRequest = $scope.getUIVersionNumber(),
                inputText = $scope.getCurrentInputText(),
                cursorPosition = $scope.getCursorPosition();

            logger.debug('getSageAutoCompleteResponse with arguments', tokens, tokens.map('getTokenText'), cursorPosition);

            getSageAutoCompleteResponse(tokens, cursorPosition.currentlyEditedTokenIndex, cursorPosition.offsetInTokenText)
            .then(function(sageResponse){
                var expressionResponse = sageResponse.answerResponse;
                $scope.isRemoteCallPending = false;
                var uiVersionNumberAtResponse = $scope.getUIVersionNumber();
                if (uiVersionNumberAtRequest < uiVersionNumberAtResponse) {
                    logger.debug('ui state has changed since the call was made, ignoring sage response', uiVersionNumberAtRequest, uiVersionNumberAtResponse);
                    return;
                }
                if ($scope.getCurrentInputText() !== inputText) {
                    logger.debug('input has changed since the query was fired, ignoring response');
                    return;
                }

                updateOnSageResponse(expressionResponse);

                if (!!callback) {
                    callback(expressionResponse);
                }

            }, function(error){
                $scope.isRemoteCallPending = false;
                logger.error('error in getting suggestion', error);
            });

            safeApply($scope);
        };

        function isCurrentExpressionValid() {
            return $scope.expressionEditorModel && !!$scope.expressionEditorModel.getFormulaExpression();
        }

        $scope.getExpressionMessage = function () {
            if ($scope.hasValidationErrors()) {
                return $scope.getValidationErrors()[0];
            } else if ($scope.hasIncompleteExpression()) {
                return strings.expressionEditorPanel.EXPRESSION_INCOMPLETE;
            } else if ($scope.hasValidCompleteExpression()) {
                return strings.expressionEditorPanel.EXPRESSION_VALID;
            }
        };

        $scope.getValidationErrors = function () {
            if (!$scope.expressionEditorModel) {
                return [];
            }
            return $scope.expressionEditorModel.getCompletionErrorMessages().map('escapeHTML');
        };

        $scope.shouldShowValidationMessage = function () {
            return $scope.getSageTokens().length > 0;
        };

        $scope.hasValidationErrors = function () {
            return $scope.getValidationErrors().length > 0;
        };

        $scope.hasValidCompleteExpression = function () {
            return !$scope.isRemoteCallPending && isCurrentExpressionValid();
        };

        $scope.hasIncompleteExpression = function () {
            return $scope.isRemoteCallPending || (!isCurrentExpressionValid() && $scope.getSageTokens().length > 0);
        };
    }]);

