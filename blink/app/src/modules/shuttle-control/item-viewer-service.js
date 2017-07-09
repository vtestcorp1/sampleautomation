/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Utility service for the shuttle control
 */

"use strict";

blink.app.factory('itemViewerService', [function () {
    var CheckedStates = {
        checked: 'checked',
        unchecked: 'unchecked',
        partial: 'partial'
    };

    var isItemChecked = function (item) {
        return item.checkedState === CheckedStates.checked;
    };

    var isItemPartiallyChecked = function (item) {
        return item.checkedState === CheckedStates.partial;
    };

    var isItemUnchecked = function (item) {
        return item.checkedState === CheckedStates.unchecked;
    };

    var toggleSelectionState = function (item) {
        if(!isItemUnchecked(item)) {
            item.checkedState = CheckedStates.unchecked;
        } else {
            item.checkedState = CheckedStates.checked;
        }
    };

    return {
        CheckedStates: CheckedStates,
        isItemChecked: isItemChecked,
        isItemPartiallyChecked: isItemPartiallyChecked,
        isItemUnchecked: isItemUnchecked,
        toggleSelectionState: toggleSelectionState
    };
}]);
