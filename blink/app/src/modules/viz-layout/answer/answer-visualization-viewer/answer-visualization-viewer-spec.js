/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit tests for answer visualization viewer component.
 */

'use strict';

describe('Answer visualization viewer', function() {
    var AnswerVisualizationViewerComponent;
    var util;

    beforeEach(function(done) {
        module('blink.app');

        var moduleName = 'src/modules/viz-layout/answer/answer-visualization-viewer/' +
            'answer-visualization-viewer';
        System.import(moduleName)
            .then(function(module) {
                inject(function(_util_) {
                    util = _util_;
                });
                AnswerVisualizationViewerComponent = module.AnswerVisualizationViewerComponent;
                done();
            });
    });

    it('should not display viz marked ignoredForRendering', function() {
        var mockHeadlineModel = {
            shouldIgnoreRendering: function () {
                return true;
            }
        };
        var mockAnswerModel = {
            getCurrentAnswerSheet: function () {
                return {
                    getTableVisualizations: function () {
                        return [];
                    },
                    getChartVisualizations: function () {
                        return [];
                    },
                    getHeadlineVisualizations: function () {
                        return [mockHeadlineModel];
                    }
                };
            }
        };
        var vizsToDisplay = AnswerVisualizationViewerComponent.getVisualizationsToDisplay(
            mockAnswerModel,
            util.answerDisplayModes.TABLE
        );
        expect(vizsToDisplay.length).toBe(0);
    });

    it('should mark headline ignoredForRendering', function() {
        var setIgnoreRenderingSpy = jasmine.createSpy();
        var mockHeadlineModel = {
            getVizType: function() {
                return 'HEADLINE';
            },
            getId: function() {
                return 'id';
            },
            setIgnoreRendering: setIgnoreRenderingSpy
        };

        AnswerVisualizationViewerComponent.processData(
            {},
            [mockHeadlineModel],
            {
                headlineModels: [],
                renderPendingVizIds: {}
            }
        );
        expect(setIgnoreRenderingSpy).toHaveBeenCalled();
    });
});
