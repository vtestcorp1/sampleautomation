/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component for showing filter checkbox collection.
 **/

'use strict';

blink.app.component('blinkCheckboxFilterV3',
    {
        bindings: {
            bkCtrl: '<'
        },
        controller: blink.app.DynamicController,
        templateUrl:
            'src/modules/viz-layout/viz/filter-v2/checkbox-filter-v3/checkbox-filter-v3.html'
    }
);
