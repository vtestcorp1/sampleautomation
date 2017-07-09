/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 *
 * @fileoverview
 *
 * Base class for list displayed in admin section. All these lists
 * end up doing call to metadata services.
 *
 */

'use strict';

blink.app.factory('AdminItemListController', ['$q',
    'AdminItemModel',
    'alertService',
    'blinkConstants',
    'strings',
    'confirmDialog',
    'env',
    'jsonConstants',
    'listActionUtil',
    'listUtils',
    'loadingIndicator',
    'MetadataListController',
    'metadataService',
    'UserAction',
    'util',
    function($q,
         AdminItemModel,
         alertService,
         blinkConstants,
         strings,
         confirmDialog,
         env,
         jsonConstants,
         listActionUtil,
         listUtils,
         loadingIndicator,
         MetadataListController,
         metadataService,
         UserAction,
         util) {

        var BATCH_SIZE = isNaN(env.metadataBatchSize) ? 20 : parseInt(env.metadataBatchSize, 10);

    /**
     *
     * @param strings  {Array}
     * @param onRowClick {function}
     * @param onRefresh {function}
     * @param metadataType {string}
     * @constructor
     */
        var AdminItemListController = function (strings, onRowClick, onRefresh, metadataType) {
            var columns =  [
                listUtils.adminColumns.userNameCol,
                listUtils.adminColumns.userDisplayNameCol,
                listUtils.adminColumns.userDateModifiedCol
            ];

            var filters = [];

            var actionItems = [
                listActionUtil.getDeleteAction(this)
            ];

            AdminItemListController.__super.call(
            this,
            strings,
            metadataType,
            columns,
            filters,
            actionItems,
            onRowClick,
            onRefresh,
            null,
            jsonConstants.metadataTypeSort.NAME,
            false
        );

            this.stickers = null;
        };
        util.inherits(AdminItemListController, MetadataListController);

        AdminItemListController.prototype.canDelete = function() {
            return true;
        };

        AdminItemListController.prototype.showConfirmDeleteDialog = function(items,
                                                                         singularMessage,
                                                                         pluralMessage,
                                                                         dialogTitle) {
            var itemName = items[0].getDisplayName();
            var itemNum = items.length;
            var message = (itemNum == 1) ? singularMessage.assign(itemName) :
            pluralMessage;

            return confirmDialog.show(dialogTitle, message);
        };

        AdminItemListController.prototype.refreshList = function(pageNumber) {
            loadingIndicator.show();
            var self = this;
            return self.loadData(pageNumber)
            .finally(function(){
                loadingIndicator.hide();
            });
        };

        AdminItemListController.prototype.processHeaders = function(headers) {
            return headers.map(function(header){
                return AdminItemModel.fromHeaderJson(header);
            });
        };

        return AdminItemListController;
    }]);
