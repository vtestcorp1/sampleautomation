/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 *
 * @fileoverview
 *
 *
 *
 */

'use strict';

blink.app.factory('GroupItemListController', ['$q',
    'AdminItemListController',
    'alertConstants',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'userGroupActionService',
    'util',
    function($q,
         AdminItemListController,
         alertConstants,
         blinkConstants,
         strings,
         jsonConstants,
         userGroupActionService,
         util) {

        var GroupItemListController = function (onRowClick, onRefresh) {

            GroupItemListController.__super.call(
            this,
            strings.metadataListPage.groups,
            onRowClick,
            onRefresh,
            jsonConstants.metadataType.GROUP
        );

        };
        util.inherits(GroupItemListController, AdminItemListController);

        GroupItemListController.prototype.showConfirmDeleteDialog = function(groupModels) {
            return GroupItemListController.__super.prototype.showConfirmDeleteDialog.call(this,
            groupModels,
            strings.alert.GROUP_DELETE_DIALOG_MESSAGE_SINGULAR,
            strings.alert.GROUP_DELETE_DIALOG_MESSAGE_PLURAL,
            strings.alert.GROUP_DELETE_DIALOG_TITLE
        );
        };

        GroupItemListController.prototype.delete = function(userModels) {
            return userGroupActionService.deleteGroups(userModels);
        };

        return GroupItemListController;
    }]);
