/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview UI for row level security filters
 */

'use strict';

blink.app.factory('RowLevelSecurityController',['$q',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'strings',
    'dateUtil',
    'dialog',
    'jsonConstants',
    'ListModel',
    'listUtils',
    'metadataService',
    'metadataUtil',
    'rlsRuleEditorPopupService',
    'UserAction',
    function($q,
         alertConstants,
         alertService,
         blinkConstants,
         strings,
         dateUtil,
         dialog,
         jsonConstants,
         ListModel,
         listUtils,
         metadataService,
         metadataUtil,
         rlsRuleEditorPopupService,
         UserAction) {


        function RowLevelSecurityController(sourceId, rules, onChange) {
            this.strings = strings.rlsRuleEditor;
            this._sourceId = sourceId;
            this._rules = rules;
            this.onRowClick = this.addUpdateRule.bind(this);

            var columns = [
                listUtils.rlsColumns.nameCol,
                listUtils.rlsColumns.descriptionCol,
                listUtils.rlsColumns.dateModifiedCol,
                listUtils.rlsColumns.authorCol
            ];

            var filterFunction = function(item, filterText) {
                return item.values.name.indexOf(filterText) >= 0;
            };
            var titleFunction = function() {
                return strings.rlsRuleEditor.RULES;
            };

            this.listModel = new ListModel(columns, [], filterFunction, titleFunction, true);

            var self = this;
            this.actionBtns = [
                {
                    icon: blinkConstants.metadataListPage.actions.delete.icon,
                    text: strings.metadataListPage.actions.delete.text,

                    isEnabled: function(rows) {
                        return rows.length > 0;
                    },
                    onClick: function(rows) {
                        var idsToDelete = rows.map(function(row) {
                            return row.values.id;
                        });

                        var displayNameForMetadataType = metadataUtil
                        .getDisplayNameForMetadataType(jsonConstants.metadataType.TABLE_FILTER);
                        var canHaveContent = metadataUtil.canMetadataTypeHaveContent(this.metadataType);
                        var messages = canHaveContent
                        ? strings.alert.dataDeletionAlertMessages.withoutDependents
                        : strings.alert.dataDeletionAlertMessages.withoutContent;

                        var singular = rows.length === 1,
                            message = singular ? messages.singular.assign({itemName: rows[0].values.name})
                            : messages.plural.assign({itemType: displayNameForMetadataType});

                        dialog.show({
                            title: 'Confirm delete',
                            confirmBtnLabel: 'Delete',
                            message: message,
                            onConfirm: function() {
                                var userAction = new UserAction(UserAction.DELETE_RLS_RULE);
                                metadataService.deleteMetadataItems(
                                idsToDelete,
                                jsonConstants.metadataType.TABLE_FILTER
                            ).
                                then(function() {
                                    var data = self.listModel.getData().filter(function (item) {
                                        return rows.indexOf(item) < 0;
                                    });
                                    self.listModel.setData(data);
                                    alertService.showUserActionSuccessAlert(userAction);
                                    self._onChange();
                                }, function (response) {
                                    alertService.showUserActionFailureAlert(userAction, response);
                                });
                                return true;
                            }
                        });
                    }
                }
            ];

            this.onChange = onChange || angular.noop;
            this._populateRules();
        }

        RowLevelSecurityController.prototype.areRulesDefined = function () {
            return this.listModel.getData().length > 0;
        };

        RowLevelSecurityController.prototype.getActionBtns = function () {
            return this.actionBtns;

        };

        RowLevelSecurityController.prototype.createNewRow = function() {
            var row = {
                onClick: this.addUpdateRule.bind(this),
                values: {}
            };
            this.listModel.addItem(row);
            return row;
        };

        function updateRowWithData(row, data) {
            row.values = data.header;
            row.rule = data;
            row.isIncomplete = !data.complete;
        }

        RowLevelSecurityController.prototype._populateRules = function () {
            var self = this;
            self._rules.forEach(function (filter) {
                var row = self.createNewRow();
                updateRowWithData(row, filter);
            });
        };

        RowLevelSecurityController.prototype.update = function(row, ruleModel) {
            var self = this;

            return metadataService.save(
            jsonConstants.metadataType.TABLE_FILTER,
            ruleModel.getDefinition()
        ).
            then(function(response) {
                row = row || self.createNewRow();
                updateRowWithData(row, response.data);
                rlsRuleEditorPopupService.hide();
                self._onChange();
            });
        };

        RowLevelSecurityController.prototype._onChange = function () {
            var rules = this.listModel.getData().map(function(row) {
                return row.rule;
            });
            this.onChange(rules);
        };

        RowLevelSecurityController.prototype.addUpdateRule = function (row) {

            rlsRuleEditorPopupService.show(
            (!!row) ? row.rule : null,
            this._sourceId,
            this.update.bind(this, row)
        );
        };

        return RowLevelSecurityController;
    }]);
