/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Widget for showing checkbox collection.
 * Parameters:
 * checkboxItems {[Object]}: collection of checkbox items.
 * Object.title {string}: [optional] title of the checkbox.
 * Object.isChecked {boolean}: state of the checkbox.
 */

'use strict';

blink.app.component(
    'blinkCheckboxCollection',
    {
        bindings: {
            bkCtrl: '<'
        },
        controller: blink.app.DynamicController,
        templateUrl: 'src/common/widgets/checkbox-collection/checkbox-collection.html'
    }
);
