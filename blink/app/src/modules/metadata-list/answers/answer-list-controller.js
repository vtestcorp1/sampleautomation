/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';

blink.app.factory('AnswerListController', ['blinkConstants',
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

        var AnswerListController = function (onRowClick, onRefresh) {
            var blinkStrings = strings.metadataListPage.answers;

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
                listActionUtil.getDeleteAction(this)
            ];

            if(!sessionService.isAnswerDisabled()){
                actionItems.push(listActionUtil.getShareAction(this));
            }

            if (sessionService.isMetadataMigrationEnabled() && sessionService.hasAdminPrivileges()) {
                actionItems.push(listActionUtil.getExportAction(this));
                actionItems.push(listActionUtil.getImportAction(this));
            }

            AnswerListController.__super.call(
            this,
            blinkStrings,
            jsonConstants.metadataType.QUESTION_ANSWER_BOOK,
            columns,
            filters,
            actionItems,
            onRowClick,
            onRefresh,
            listFiltersService.standardFilters.stickers
        );
        };
        util.inherits(AnswerListController, MetadataListController);

        AnswerListController.prototype.getDeleteUserAction = function() {
            return new UserAction(UserAction.DELETE_ANSWERS);
        };

        return AnswerListController;
    }]);
