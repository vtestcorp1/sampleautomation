/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This directive draws a schema on the canvas
 *
 * Look at the baseGraphViewerController for more information
 *
 */

'use strict';

blink.app.directive('schemaCanvasViewer', function() {

    return {
        restrict: 'AE',
        scope: {
            ctrl: '='
        },
        controller: 'NGSchemaCanvasViewer'
    };
});

blink.app.controller('NGSchemaCanvasViewer', ['$scope',
    'Logger',
    function ($scope,
              Logger) {
        var _logger = Logger.create('schema-navigation-ui');

        if (!$scope.ctrl) {
            _logger.error('No controller passed in');
        }
        $.extend($scope, $scope.ctrl);
    }
]);
