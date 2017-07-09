/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview View for the control to facilitate embedding of ThoughtSpot visualizations
 * on external websites.
 */

'use strict';

blink.app.directive('embeddingControl', [function() {
    return {
        restrict: 'E',
        scope: {
            vizModel: '='
        },
        controller: 'EmbeddingControlController',
        templateUrl: 'src/modules/embed/embedding-control/embedding-control.html'
    };
}]);
