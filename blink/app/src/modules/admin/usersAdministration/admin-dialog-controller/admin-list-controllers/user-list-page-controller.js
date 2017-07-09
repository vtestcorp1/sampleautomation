/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 *
 * @fileoverview
 *
 */

'use strict';

blink.app.factory('UserItemListController', ['$q',
    'AdminItemListController',
    'alertConstants',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'listUtils',
    'userGroupActionService',
    'util',
    function($q,
         AdminItemListController,
         alertConstants,
         blinkConstants,
         strings,
         jsonConstants,
         listUtils,
         userGroupActionService,
         util) {

        var UserItemListController = function (onRowClick, onRefresh, assignAction) {

            UserItemListController.__super.call(
            this,
            strings.metadataListPage.users,
            onRowClick,
            onRefresh,
            jsonConstants.metadataType.USER
        );
            this.columns.unshift(listUtils.adminColumns.userAvatarCol);
            this.actionItems.push(assignAction);
        };
        util.inherits(UserItemListController, AdminItemListController);

        UserItemListController.prototype.showConfirmDeleteDialog = function(userModels) {
            return UserItemListController.__super.prototype.showConfirmDeleteDialog.call(this,
            userModels,
            strings.alert.USER_DELETE_DIALOG_MESSAGE_SINGULAR,
            strings.alert.USER_DELETE_DIALOG_MESSAGE_PLURAL,
            strings.alert.USER_DELETE_DIALOG_TITLE
        );
        };

        UserItemListController.prototype.delete = function(userModels) {
            return userGroupActionService.deleteUsers(userModels);
        };

        return UserItemListController;
    }]);
