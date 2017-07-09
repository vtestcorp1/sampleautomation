/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';

blink.app.factory('PinboardListController', ['blinkConstants',
    'strings',
    'jsonConstants',
    'listActionUtil',
    'listFiltersService',
    'listUtils',
    'MetadataListController',
    'sessionService',
    'UserAction',
    'util',
    function(blinkConstants,
             strings,
             jsonConstants,
             listActionUtil,
             listFiltersService,
             listUtils,
             MetadataListController,
             sessionService,
             UserAction,
             util) {

        var PinboardListController = function (onRowClick, onRefresh) {
            var blinkStrings = strings.metadataListPage.pinboards;
            //var constants = blinkConstants.metadataListPage.pinboards;

            var columns =  [
                listUtils.columns.nameCol,
                listUtils.columns.authorCol,
                listUtils.columns.descriptionCol,
                listUtils.columns.dateModifiedCol,
                listUtils.columns.stickersCol(
                    this.canTag.bind(this),
                    this.unassignTag.bind(this)
                )
            ];

            var filters = [
                listFiltersService.standardFilters.authorFilter
            ];

            var actionItems = [
                listActionUtil.getTagAction(this),
                listActionUtil.getDeleteAction(this),
                listActionUtil.getShareAction(this)
            ];

            if (sessionService.isMetadataMigrationEnabled() && sessionService.hasAdminPrivileges()) {
                actionItems.push(listActionUtil.getExportAction(this));
                actionItems.push(listActionUtil.getImportAction(this));
            }

            PinboardListController.__super.call(
                this,
                blinkStrings,
                jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
                columns,
                filters,
                actionItems,
                onRowClick,
                onRefresh,
                listFiltersService.standardFilters.stickers,
                void 0,
                void 0,
                false
            );
        };

        util.inherits(PinboardListController, MetadataListController);

        PinboardListController.prototype.getDeleteUserAction = function() {
            return new UserAction(UserAction.DELETE_PINBOARDS);
        };

        return PinboardListController;
    }]);
