/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi
 *
 * @fileoverview Directive for relationship popup
 */

'use strict';

blink.app.directive('relationshipPopup', [function () {
    return {
        restrict: 'E',
        replace:true,
        scope: {
            // Id of the source table to build relationships on.
            tableId: '=',
            // List of all the sources to be used as target. Only used if isAdHocRelationshipBuilder is set
            sourceIds: '=',
            // If the relationship builder is used of ad hoc queries.(QoQ)
            isAdHocRelationshipBuilder: '=',
            sageContext: '=',
            hide: '='
        },
        templateUrl: 'src/common/relationship/relationship-popup.html'
    };
}]);
