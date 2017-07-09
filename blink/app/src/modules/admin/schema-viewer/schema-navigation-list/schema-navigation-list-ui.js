/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This component displays a list of items with a search bar
 *
 */

'use strict';

blink.app.component('navigationList', {
    bindings: {
        bkCtrl: '<'
    },
    templateUrl: 'src/modules/admin/schema-viewer/schema-navigation-list/schema-navigation-list.html',
    controller: blink.app.DynamicController
});
