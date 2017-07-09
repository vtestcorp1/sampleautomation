/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for Headline Viz
 */

'use strict';

blink.app.directive('blinkVizHeadline', ['debugInfoCollector',
    'events',
    'Logger',
    'jsonConstants',
    'perfMeter',
    'serviceNames',
    'util',
    function (debugInfoCollector,
              events,
              Logger,
              jsonConstants,
              perfMeter,
              serviceNames,
              util) {

        var _logger = Logger.create('headline-ui');

        function render(scope, $headline) {
            var headlineModel = scope.viz.getModel();
            perfMeter.reportVizRendered(headlineModel.getId());
            scope.onRenderComplete(headlineModel, true);

            return false;
        }

        function linker (scope, $el) {
            $el.addClass('bk-viz-headline');

            var headlineModel = scope.viz.getModel();

            var headlineColumn;
            if (headlineModel && headlineModel.getColumn()) {
                headlineColumn = headlineModel.getColumn();
            }

        /**
         *
         * @param {boolean=} triggerReflow If true, the reflow is forcibly, triggered after rendering.
         */
            scope.viz.render = scope.render = function (triggerReflow) {
                var startTime = (new Date()).getTime();
                var debugInfo = {
                    type: 'vizRender',
                    timestamp: startTime,
                    url: scope.viz.getModel().getTitle()
                };
                var reflowRequired = render(scope, $el);
                debugInfoCollector.collect(serviceNames.RENDER, debugInfo);
                if (reflowRequired || !!triggerReflow) {
                    scope.$emit(events.LAYOUT_REFLOW_REQUIRED_U);
                }
            };

            if (headlineColumn && (headlineColumn.isDateColumn() || headlineColumn.isTimeColumn())) {
                $el.addClass('bk-date-headline');
            }

            scope.$on('$destroy', function () {
                if (!scope.viz.getModel()) {
                    return;
                }
            // See above note for color
                var firstHeadlineSource = scope.viz.getModel().getColumn().getSources().first();
                if (firstHeadlineSource) {
                    util.removeColorEntryForGuid(firstHeadlineSource.columnId);
                }
            });
        }

        return {
            restrict: 'E',
            scope: {
                viz: '=',
                onRenderComplete: '='
            },
            link: linker,
            controller: 'HeadlineController',
            templateUrl: 'src/modules/viz-layout/viz/headline/headline.html'
        };
    }]);
