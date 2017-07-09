/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Currency type editor for a logical column.
 */

'use strict';

blink.app.component('bkCurrencyTypeEditor',  {
    bindings: {
        bkCtrl: '<'
    },
    controller: blink.app.DynamicController,
    templateUrl: 'src/modules/data-explorer/currency-type-editor/currency-type-editor.html'
});
