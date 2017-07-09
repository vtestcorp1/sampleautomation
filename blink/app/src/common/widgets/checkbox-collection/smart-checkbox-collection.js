/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Widget for showing checkbox collection.
 **/

'use strict';

blink.app.component('blinkSmartCheckboxCollection', {
    bindings: {
        bkCtrl: '<'
    },
    controller: blink.app.DynamicController,
    templateUrl: 'src/common/widgets/checkbox-collection/smart-checkbox-collection.html'
}
);
