/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';

blink.app.factory('RlsRuleEditorController',['alertService',
    'blinkConstants',
    'strings',
    'ExpressionEditorModel',
    'loadingIndicator',
    'tableFilterUtil',
    'RlsRuleModel',
    'rowLevelSecurityExamplesData',
    'UserAction',
    function(alertService,
         blinkConstants,
         strings,
         ExpressionEditorModel,
         loadingIndicator,
         tableFilterUtil,
         RlsRuleModel,
         rowLevelSecurityExamplesData,
         UserAction) {
        function RlsRuleEditorController(rule, tableId, onSave, onCancel) {
            var sageContext = null, formulaId = "", isRLS = true;
            this.expressionEditorModel = new ExpressionEditorModel(
            [tableId],
            sageContext,
            formulaId,
            isRLS
        );
            this.ruleModel = new RlsRuleModel(angular.copy(rule));
            this.ruleModel.setOwner(tableId);
            this.ruleModel.generateId();
            this.props = {};
            this.props.name = this.ruleModel.getName();
            this.props.desc = this.ruleModel.getDescription();
            this.expressionEditorModel.setNewTokens(this.ruleModel.getTokens());
            this.onSave = onSave || angular.noop;
            this.onCancel = onCancel || angular.noop;
            this.blinkConstants = blinkConstants;
            this.strings = strings;
            this.examplesTreeData = rowLevelSecurityExamplesData;
        }

        RlsRuleEditorController.prototype.onInvalidRule = function () {
            this.props.isRuleValid = false;
        };

        RlsRuleEditorController.prototype.onValidRule = function (expressionEditorModel) {
            this.props.isRuleValid = true;
            this.ruleModel.setTokens(expressionEditorModel.getNewTokens());
            this.ruleModel.setExpression(expressionEditorModel.getFormulaExpression());
        };

        RlsRuleEditorController.prototype.isSaveRuleEnabled = function () {
            return this.props.isRuleValid && !!this.props.name;
        };

        RlsRuleEditorController.prototype.saveRule = function () {
            if(!this.isSaveRuleEnabled()) {
                return;
            }
            var self = this;
            self.ruleModel.setName(this.props.name);
            self.ruleModel.setDescription(this.props.desc);
            var userAction = new UserAction(UserAction.SAVE_RLS_RULE);
            tableFilterUtil.addRuleToTable(self.ruleModel).
            then(function (sageResponse) {
                var response = sageResponse.answerResponse;
                self.ruleModel.setFilterToken(response.getFilterToken());
                self.ruleModel.setExpression(response.getExpression());
                return self.ruleModel;
            }).
            then(self.onSave).
            then(function() {
                alertService.showUserActionSuccessAlert(userAction);
                self.saveError = null;
            }, function (response) {
                self.saveError =
                    alertService.getUserActionFailureAlertContent(userAction, response);
            });
        };

        RlsRuleEditorController.prototype.editJoinPath = function () {
            var filterToken = this.ruleModel.getFilterToken();
            filterToken.setExplicitJoinPathEdit(true);
            this.ruleModel.setFilterToken(filterToken);
            this.saveRule();
        };

        RlsRuleEditorController.prototype.getPlaceholder = function () {
            return this.strings.rlsRuleEditor.RULE_NAME_PLACEHOLDER;
        };

        RlsRuleEditorController.prototype.showRuleAssistant = function () {
            this.props.isRuleAssistantOpen = true;
        };

        RlsRuleEditorController.prototype.closeRuleAssistant = function () {
            this.props.isRuleAssistantOpen = false;
        };

        return RlsRuleEditorController;
    }]);
