/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * @fileoverview This file is used to display list of related links available for a visualization.
 * When a customer clicks on relate action in visualization action menu, the list of shown related links
 * is powered by this controller.
 */

'use strict';

blink.app.factory('RelatedLinkListController', ['blinkConstants',
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

        var RelatedLinkListController = function (onRowClick, onRefresh, vizOwnerId) {
            var blinkStrings = strings.metadataListPage.relatedLinks;

            this.ownerId = vizOwnerId;

            var columns =  [
                listUtils.columns.nameCol,
                listUtils.columns.authorCol,
                listUtils.columns.descriptionCol,
                listUtils.columns.dateModifiedCol,
            ];

            var filters = [
                listFiltersService.standardFilters.authorFilter
            ];

            var actionItems = [
                listActionUtil.getDeleteAction(this)
            ];

            RelatedLinkListController.__super.call(
                this,
                blinkStrings,
                jsonConstants.metadataType.RELATED_LINK,
                columns,
                filters,
                actionItems,
                onRowClick,
                onRefresh
            );

            // Attach the ownerId value to prototype so that we can access the value
            // when calling RelatedLinkListController.prototype.processHeaders.
            RelatedLinkListController.prototype.ownerId = vizOwnerId;
        };

        util.inherits(RelatedLinkListController, MetadataListController);

        RelatedLinkListController.prototype.getDeleteUserAction = function() {
            return new UserAction(UserAction.DELETE_RELATED_LINK);
        };

        // MetadataList controller fetches header items of a given type. In this case RELATED_LINK.
        // This function processHeaders filters down that list with given visualization as owner.
        // TODO(manoj): Add a ownerIds param in metadata/list API so that this filter can be pushed
        // down in callosum rather than filtering in blink side.
        RelatedLinkListController.prototype.processHeaders = function(headers) {
            var self = this;
            return headers.filter(function(header) {
                return header.owner === self.ownerId;
            });
        };

        return RelatedLinkListController;
    }]);

