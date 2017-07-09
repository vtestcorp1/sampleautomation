/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';

blink.app.component('metadataListPage',
    {
        bindings: {
            bkCtrl: '<'
        },
        transclude: true,
        controller: blink.app.DynamicController,
        templateUrl: 'src/modules/metadata-list/metadata/metadata-list-page.html'
    }
);
