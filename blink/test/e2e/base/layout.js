/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview E2E utilities related to layout tests
 */

/*eslint no-undef: 0 */

'use strict';

var GRID = '.bk-answer-canvas .bk-grid';

var startChartDrag = angular.scenario.dsl('startChartDrag', function () {
    /**
     * @param {string} chartSelector
     * @param {Object=} dragParams
     */
    return function (chartSelector, dragParams) {
        dragParams = dragParams || {};
        var x = dragParams.x || 0,
            y = dragParams.y || 100;
        return this.addFutureAction('start dragging chart', function (appWindow, $document, done) {
            appWindow.$(chartSelector || CHART_VIZ + ' .bk-viz-header').simulate('mousedown');
            appWindow.$(appWindow).simulate('mousemove', { clientX: x, clientY: y });
            done();
        });
    };
});

var endChartDrag = angular.scenario.dsl('endChartDrag', function () {
    /**
     * @param {string} chartSelector
     */
    return function (chartSelector) {
        return this.addFutureAction('end dragging chart', function (appWindow, $document, done) {
            appWindow.$(chartSelector || CHART_VIZ + ' .bk-viz-header').simulate('mouseup');
            done();
        });
    };
});

var dragChart = angular.scenario.dsl('dragChart', function () {
    /**
     * @param {string} chartSelector
     * @param {Object=} dragParams
     */
    return function (chartSelector, dragParams) {
        dragParams = dragParams || {};
        var x = dragParams.x || 100,
            y = dragParams.y || 100;
        return this.addFutureAction('Drag chart', function (appWindow, $document, done) {
            appWindow.$(chartSelector || CHART_VIZ + ' .bk-viz-header').simulate('drag', { dx: x, dy: y });
            done();
        });
    };
});

var scrollAnswerCanvasBy = angular.scenario.dsl('scrollAnswerCanvasBy', function () {
    /**
     * @param {number} scrollDistancePixel
     */
    return function (scrollDistancePixel) {
        this.addFutureAction('scroll answer', function (appWindow, $document, done) {
            var parentContainer = '.bk-answer';
            appWindow.$(parentContainer + ' .bk-answer-canvas')[0].scrollTop += scrollDistancePixel;
            appWindow.$(parentContainer + ' .bk-answer-canvas').trigger('scroll');
            done();
        });
    };
});

var resizeVizHeight = angular.scenario.dsl('resizeVizHeight', function () {
    return function (vizSelector, resizeY) {
        this.addFutureAction('resize viz ' + vizSelector, function (appWindow, $document, done) {
            var $chart = appWindow.$(vizSelector),
                mouseDownX = Math.round($chart.offset().left) + 20,
                mouseDownY = Math.round($chart.offset().top) + $chart.height() - 10,
                targetY = mouseDownY + resizeY;
            $chart.simulate('mousemove', { clientX: mouseDownX, clientY: mouseDownY });
            $chart.simulate('mousedown', { clientX: mouseDownX, clientY: mouseDownY });
            // TODO(steph): Look into why the test using this resizeViz started flaking out randomly and needed the
            // following hack of numMoves.
            var numMoves = 2;
            for (var i = 0; i < numMoves; ++i) {
                var interim = mouseDownY + (targetY - mouseDownY) * (i + 1) / numMoves;
                $chart.simulate('mousemove', { clientX: mouseDownX, clientY: interim });
            }
            $chart.simulate('mouseup', { clientX: mouseDownX, clientY: targetY});
            done();
        });
    };
});

var resizeVizWidth = angular.scenario.dsl('resizeVizWidth', function () {
    return function (vizSelector, resizeX) {
        this.addFutureAction('resize viz ' + vizSelector, function (appWindow, $document, done) {
            var $chart = appWindow.$(vizSelector),
                mouseDownX = Math.round($chart.offset().left) + $chart.width() - 20,
                mouseDownY = Math.round($chart.offset().top) + $chart.height() - 10,
                targetX = mouseDownX + resizeX;
            $chart.simulate('mousemove', { clientX: mouseDownX, clientY: mouseDownY });
            $chart.simulate('mousedown', { clientX: mouseDownX, clientY: mouseDownY });
            // TODO(steph): Look into why the test using this resizeViz started flaking out randomly and needed the
            // following hack of numMoves.
            var numMoves = 2;
            for (var i = 0; i < numMoves; ++i) {
                var interim = mouseDownX + (targetX - mouseDownX) * (i + 1) / numMoves;
                $chart.simulate('mousemove', { clientX: interim, clientY: mouseDownY });
            }
            $chart.simulate('mouseup', { clientX: targetX, clientY: mouseDownY});
            done();
        });
    };
});

var headlineAggregationMenu = angular.scenario.dsl('headlineAggregationMenu', function () {
    return function (parentHeadline, position) {
        var chain = {};
        chain.select = function (val) {
            if (position === undefined) {
                position = 0;
            }

            return this.addFutureAction('Selecting ' + val + ' in headline aggregation menu in headline "' + parentHeadline + '"', function (appWindow, $document, done) {
                var $ = appWindow.$;
                var $select = $($document.find(parentHeadline + ' .bk-headline-aggregate')).eq(position);

                $select.find("option").filter(function () {
                    return $(this).text().trim() == val;
                }).prop('selected', "selected");
                $select.trigger('change');

                done(null, {});
            });
        };
        return chain;
    };
});
