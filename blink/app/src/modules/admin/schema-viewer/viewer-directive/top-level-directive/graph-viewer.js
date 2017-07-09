/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * This top level directive build the HTML page
 * for different type of graphs.
 * Type handled are
 * * full schema
 * * worksheet
 * * answer
 *
 * @fileoverview Graph-viewer Directive
 */

'use strict';

blink.app.directive('graphViewer', ['$routeParams',
    'GraphViewerController',
    function($routeParams, GraphViewerController) {
        // As this directive is on a top-level page, we cannot pass a controller to this directive,
        // so we instantiate the controller directly
        function linker(scope) {
            scope.ctrl = new GraphViewerController($routeParams.type, $routeParams.objectId);
        }

        return {
            restrict: 'E',
            bindToController: true,
            link: linker,
            templateUrl: 'src/modules/admin/schema-viewer/viewer-directive/top-level-directive/graph-viewer.html'
        };
    }
]);

