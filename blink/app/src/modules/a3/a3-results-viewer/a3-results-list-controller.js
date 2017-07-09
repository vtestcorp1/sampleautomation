/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi(jasmeet@thoughtspot.com)
 *
 * @fileoverview Metadata list controller for A3 pinboards.
 */

'use strict';

blink.app.factory('A3ResultsListController', ['blinkConstants',
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

        var A3ResultsListController = function (onRowClick, onRefresh) {
            var blinkStrings = strings.metadataListPage.pinboards;

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

            A3ResultsListController.__super.call(
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
                true
            );
        };

        // TODO(Jasmeet): Add TTL and create time to this page.
        // Add filter based on auto created.
        util.inherits(A3ResultsListController, MetadataListController);

        A3ResultsListController.prototype.getDeleteUserAction = function() {
            return new UserAction(UserAction.DELETE_PINBOARDS);
        };

        return A3ResultsListController;
    }]);
