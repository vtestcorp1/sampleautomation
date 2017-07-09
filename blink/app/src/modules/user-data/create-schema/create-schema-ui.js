/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Create Schema component
 */

"use strict";

blink.app.directive('createSchema', [function() {
    return {
        link: function(scope, $el) {
            var QUERY_ITEM_HEIGHT = 51;

            scope.expandQueryItem = function(queryItem, idx) {
                if(scope.expandedQueryItem) {
                    scope.expandedQueryItem.isExpanded = false;
                }
                scope.expandedQueryItem = queryItem;
                scope.expandedQueryItem.isExpanded = true;

                // Scroll the clicked item into view.
                var $queryList = $el.find('.query-list');
                $queryList.scrollTop(QUERY_ITEM_HEIGHT * (idx - 1));
            };

            scope.collapseQueryItem = function($evt, queryItem) {
                scope.expandedQueryItem.isExpanded = false;
                scope.expandedQueryItem = null;
                $evt.stopPropagation();
            };

        },
        scope: {},
        restrict: 'E',
        templateUrl: 'src/modules/user-data/create-schema/create-schema.html',
        controller: 'CreateSchemaController'
    };
}]);
