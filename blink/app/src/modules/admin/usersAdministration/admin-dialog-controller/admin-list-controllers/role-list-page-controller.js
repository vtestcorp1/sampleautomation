/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 *
 * @fileoverview
 *
 */

'use strict';

blink.app.factory('RoleItemListController', ['$q',
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

        var RoleItemListController = function (onRowClick, onRefresh) {

            RoleItemListController.__super.call(
            this,
            strings.metadataListPage.roles,
            onRowClick,
            onRefresh,
            jsonConstants.metadataType.ROLE
        );
        };


        util.inherits(RoleItemListController, AdminItemListController);
        RoleItemListController.prototype.showConfirmDeleteDialog = function(roleModels) {
            return RoleItemListController.__super.prototype.showConfirmDeleteDialog.apply(this,
            roleModels,
            strings.alert.ROLE_DELETE_DIALOG_MESSAGE_SINGULAR,
            strings.alert.ROLE_DELETE_DIALOG_MESSAGE_PLURAL,
            strings.alert.ROLE_DELETE_DIALOG_TITLE
        );
        };

        RoleItemListController.prototype.delete = function(models) {
            return userGroupActionService.deleteRoles(models);
        };

        RoleItemListController.prototype.refreshList = function() {};

        return RoleItemListController;
    }]);
