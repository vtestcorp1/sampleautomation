/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Directive for data-filter management
 */

'use strict';

blink.app.directive("blinkDataFilters", [function() {

    return {
        restrict: 'E',
        templateUrl: 'src/modules/data-sources/data-filters/data-filters.html',
        controller: 'BlinkDataFilterController',
        scope: {
            filters: '=',
            tables: '=',
            getTableColumns: '='
        }
    };
}]);

