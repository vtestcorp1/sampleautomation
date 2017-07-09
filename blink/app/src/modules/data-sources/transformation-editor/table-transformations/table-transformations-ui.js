/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview directive for editing transformations
 */

'use strict';

blink.app.directive("blinkTableTransformations", [function() {
    return {
        restrict: 'EA',
        templateUrl: 'src/modules/data-sources/transformation-editor/table-transformations/table-transformations.html',
        controller: 'TableTransformationsController',
        scope: {
            transformations: '=',
            dsMetadata: '=',
            getTableColumns: '=',
            tables: '='
        }
    };
}]);
