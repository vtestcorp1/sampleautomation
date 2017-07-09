/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Directive for implementing the columns panel component of sage data panel.
 */

'use strict';

blink.app.directive('sageDataColumns', [
    function () {
        return {
            restrict: 'E',
            scope: {
                panelComponent: '=component',
                columnPanelComponentConfig: '='
            },
            controller: 'SageDataColumnsController',
            templateUrl: 'src/modules/sage/data-panel/sage-data-columns/sage-data-columns.html'
        };
    }]);
