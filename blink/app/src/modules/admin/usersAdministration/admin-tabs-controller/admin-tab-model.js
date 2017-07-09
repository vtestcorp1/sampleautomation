/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Controller showing admin tabsd
 */

'use strict';

blink.app.factory('AdminTabModel', ['blinkConstants',
    'strings',
    'util',
    function (blinkConstants,
          strings,
          util) {

    /**
     *
     * @param {string} tabName
     * @param {string} tabId
     * @param Array{string} checkedItems - Id of checked items
     * @param {AdminListController} adminListController - Controller that manages a list of admin items
     * @param {Object} countMessage - Counting message in the tab header
     * @constructor
     */
        function AdminTabModel(tabName,
                           tabId,
                           checkedItems,
                           adminListController,
                           countMessage) {

            this.tabName = tabName;
            this.tabId = tabId;
            this.adminListController = adminListController;
            this.countedItems = checkedItems.length;
            this.countMessage = countMessage;
            this.countItem =  function() {
                return util.getPluralizedMessage(this.countMessage, this.countedItems);
            };
        }
        return AdminTabModel;
    }]);
