/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';

blink.app.factory('TableListController', ['$q',
    'alertConstants',
    'alertService',
    'MetadataListController',
    'blinkConstants',
    'strings',
    'dialog',
    'dependencyService',
    'dependencyDialogService',
    'jsonConstants',
    'listActionUtil',
    'listFiltersService',
    'listUtils',
    'loadingIndicator',
    'metadataUtil',
    'UserAction',
    'userDataService',
    'util',
    function($q,
         alertConstants,
         alertService,
         MetadataListController,
         blinkConstants,
         strings,
         dialog,
         dependencyService,
         dependencyDialogService,
         jsonConstants,
         listActionUtil,
         listFiltersService,
         listUtils,
         loadingIndicator,
         metadataUtil,
         UserAction,
         userDataService,
         util) {

        var TableListController = function (onRowClick, onRefresh) {
            var blinkStrings = strings.metadataListPage.dataManagement.tables;
            var constants = blinkConstants.metadataListPage.dataManagement.tables;

            var columns =  [
                listUtils.columns.nameCol,
                listUtils.columns.authorCol,
                listUtils.columns.descriptionCol,
                listUtils.columns.dateModifiedCol,
                listUtils.columns.sourceCol,
                listUtils.columns.stickersCol(
                this.canTag.bind(this),
                this.unassignTag.bind(this)
            )
            ];

            var filters = [
                listFiltersService.standardFilters.authorFilter,
                listFiltersService.standardFilters.typeFilter
            ];

            var actionItems = [
                listActionUtil.getTagAction(this),
                listActionUtil.getDeleteAction(this),
                listActionUtil.getShareAction(this)
            ];

            TableListController.__super.call(
            this,
            blinkStrings,
            jsonConstants.metadataType.LOGICAL_TABLE,
            columns,
            filters,
            actionItems,
            onRowClick,
            onRefresh,
            listFiltersService.standardFilters.stickers
        );
        };

        util.inherits(TableListController, MetadataListController);

        var metadataTypes = {
            WORKSHEET : jsonConstants.metadataType.subType.WORKSHEET,
            AGGR_WORKSHEET : jsonConstants.metadataType.subType.AGGR_WORKSHEET,
            IMPORTED: jsonConstants.metadataType.subType.IMPORTED_DATA,
            TABLE: jsonConstants.metadataType.subType.SYSTEM_TABLE
        };

        function showCannotDeleteSystemTablesDialog(tables) {
            var title = strings.metadataExplorer.cannotDelete;
            var message = strings.metadataExplorer.cannotDeleteReason;
            var items = tables.map(function(item) {
                return {
                    name: item.name
                };
            });

            var customData = {
                message: message,
                items: items
            };

            dialog.show({
                skipCancelBtn: true,
                confirmBtnLabel: 'OK',
                title: title,
                onConfirm: function () {
                    return true;
                },
                customBodyUrl: 'src/common/widgets/dialogs/templates/list-dialog.html',
                customData: customData
            });
        }

    /**
     * Remove the items which can be deleted.
     * @param rowsByTypeById
     */
        TableListController.prototype.removeDeletableItems = function(rowsByTypeById) {
        // collecting all items to delete
            var rowsById = angular.extend(
            {},
            rowsByTypeById[metadataTypes.IMPORTED],
            rowsByTypeById[metadataTypes.WORKSHEET],
            rowsByTypeById[metadataTypes.AGGR_WORKSHEET]
        );

            return this.showConfirmDeleteDialog(Object.values(rowsById))
            .then(function (result) {
                if (!result.shouldDelete) {
                    return $q.reject(result);
                }

                loadingIndicator.show();
            })
            .then(this.deleteItemsBasedOnType.bind(this, rowsByTypeById))
            .then(this.refreshList.bind(this))
            .finally(loadingIndicator.hide);
        };

    /**
     * This path should converge once callosum implements a single call
     * to delete all metadataItems, contains seperate calls for WORKSHEET and USER_DEFINED.
     * @param rowsByTypeById
     * @returns {Promise}
     */
        TableListController.prototype.deleteItemsBasedOnType = function(rowsByTypeById) {
            var worksheetRows = Object.values(rowsByTypeById[metadataTypes.WORKSHEET] || {}),
                aggrWorksheetRows = Object.values(rowsByTypeById[metadataTypes.AGGR_WORKSHEET] || {});
            worksheetRows = worksheetRows.concat(aggrWorksheetRows);
            var userDataIds = Object.keys(rowsByTypeById[metadataTypes.IMPORTED] || {});
            var promises = [];
            var userAction;
            if (worksheetRows.length > 0) {
                var deletionPromise = TableListController.__super.prototype.delete.call(this, worksheetRows);
                promises.push(deletionPromise);
            }
            if (userDataIds.length > 0) {
                userAction = new UserAction(UserAction.DELETE_TABLES);
                var deleteFilesPromise = userDataService.deleteUserDataFiles(userDataIds)
                .then(function (response) {
                    alertService.showUserActionSuccessAlert(userAction, response);
                    return response.data;
                }, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                });
                promises.push(deleteFilesPromise);
            }
            return util.getAggregatedPromise(promises);
        };

    /**
     * Confirm deletion of dependents.
     *
     * @param rows     items which the user selects to delete
     * @returns {Promise}           Which resolves if user confirms, rejects if user cancels
     */
        TableListController.prototype.showConfirmDeleteDialog = function(rows) {
            var rowIds = rows.map(function(row) {
                return row.id;
            });

            loadingIndicator.show();

            var self = this;

            var userAction = new UserAction(UserAction.FETCH_TABLE_DEPENDENTS);
            return dependencyService.getUniqueNonDeletedTableDependents(rowIds)
            .then(function(response) {
                loadingIndicator.hide();
                var dependents = response.data;

                var displayNameForMetadataType = metadataUtil.getDisplayNameForMetadataType(self.metadataType);
                var title,
                    messages,
                    message,
                    singular = rows.length == 1;

                if (dependents.length > 0) {
                    title = strings.alert.dataDeletionAlertMessages.cannotDelete;
                    messages = strings.alert.dataDeletionAlertMessages.withDependents;
                    message = singular ? messages.singular.assign({itemName:  rows[0].name})
                        : messages.plural.assign({itemType: displayNameForMetadataType});

                    dependencyDialogService.showDependencyDialog(title, message, dependents);
                    return {
                        shouldDelete: false,
                        haveDependents: true
                    };
                } else {
                    return TableListController.__super.prototype.showConfirmDeleteDialog.call(self, rows)
                        .then(function() {
                            return {
                                shouldDelete: true,
                                haveDependents: false
                            };
                        }, function() {
                            return {
                                shouldDelete: false,
                                haveDependents: false
                            };
                        });
                }
            }, function(response) {
                loadingIndicator.hide();
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        };

        TableListController.prototype.onDeleteAction = function(rows) {
            var rowsByTypeById = rows.reduce(function (result, row) {
                var type = row.type;
                if(!result[type]) {
                    result[type] = {};
                }
                result[type][row.id] = row;
                return result;
            }, {});

        // Cannot delete System tables from the UI yet.
            if(rowsByTypeById[metadataTypes.TABLE]) {
                showCannotDeleteSystemTablesDialog(Object.values(rowsByTypeById[metadataTypes.TABLE]));
            } else {
                this.removeDeletableItems(rowsByTypeById);
            }
        };

        return TableListController;
    }]);
