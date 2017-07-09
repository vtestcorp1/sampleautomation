/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Directive for implementing the columns panel component of sage data panel.
 */

'use strict';

blink.app.directive('bulkSageDataColumns', ['blinkConstants', 'strings', function (blinkConstants, strings) {
    function linker(scope, $el, attrs) {
        scope.selectAllColumnsInGroup = function (selectedGroup) {
            $el.find('[blink-selectable][id="{1}"]'.assign(selectedGroup.sourceId)).trigger('blinkSelectable.selectAll');
        };
        scope.clearAllColumnsInGroup = function (group) {
            $el.find('[blink-selectable][id="{1}"]'.assign(group.sourceId)).trigger('blinkSelectable.clearAll');
        };
        scope.clearAllGroupsExcept = function (excludedGroupId) {
            $el.find('[blink-selectable]:not([id="{1}"])'.assign(excludedGroupId)).trigger('blinkSelectable.clearAll');
        };
        scope.getTitle = function() {
            return strings.dataPanel.COLUMNS_TITLE;
        };

        scope.addColumnsBtnLabel = strings.ADD_COLUMNS;
    }

    return {
        restrict: 'E',
        link: linker,
        scope: {
            panelComponent: '=component'
        },
        controller: 'BulkSageDataColumnsController',
        templateUrl: 'src/modules/sage/data-panel/bulk-sage-data-columns/bulk-sage-data-columns.html'
    };
}]);
