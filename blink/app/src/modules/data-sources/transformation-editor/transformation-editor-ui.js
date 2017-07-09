/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview directive for editing transformations
 */

'use strict';

blink.app.directive('bkTransformationEditor', [function() {
    return {
        restrict: 'E',
        templateUrl: 'src/modules/data-sources/transformation-editor/transformation-editor.html',
        controller: 'TransformationEditorController',
        scope: {
            transformation: '=',
            dsMetadata: '=',
            onUpsertTransform: '=',
            tables: '=',
            onDone: '=',
            getTableColumns: '='
        }
    };
}
]);
