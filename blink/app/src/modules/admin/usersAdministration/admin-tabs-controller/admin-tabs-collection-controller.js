/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Controller showing admin tabs
 *
 * Parameters:
 * options {[Object]}: definition of tabs
 * Object.tabName {string}: [optional] title of the checkbox.
 * Object.tabId {boolean}: state of the checkbox.
 * Object.checkedItems [{string}]
 * Object.listController {AdminListController}
 * Object.countMessage
 *
 */

'use strict';

blink.app.factory('AdminTabsCollectionController', ['AdminTabModel',
    'strings',
    function (AdminTabController,
              strings) {
        /**
         *
         * @param {Array<AdminTabModel> tabModels
         * @constructor
         */
        function AdminTabsCollectionController(adminTabModels) {
            this.tabModels = adminTabModels;
            this.strings = strings;
        }

        return AdminTabsCollectionController;
    }
]);

blink.app.component('adminTabsCollection', {
    bindings: {
        bkCtrl: '<'
    },
    controller: blink.app.DynamicController,
    templateUrl: 'src/modules/admin/usersAdministration/admin-tabs-controller/admin-tabs-collection.html'
}
);
