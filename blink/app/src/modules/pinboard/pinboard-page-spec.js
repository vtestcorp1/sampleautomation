/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for pinboard page
 */
'use strict';

describe('Pinboard Page', function() {
    var basePath = getBasePath(document.currentScript.src);
    var pinboardPageController;
    var rootScope;
    var scope;
    var events;
    var util;
    var AnswerModel;
    var PinboardAnswerModel;
    var controller;

    beforeEach(function(done) {
        module('blink.app');

        inject(function ($controller, _$rootScope_, _events_, _util_, _PinboardAnswerModel_, _AnswerModel_) {
            controller = $controller;
            events = _events_;
            rootScope = _$rootScope_;
            util = _util_;
            AnswerModel = _AnswerModel_;
            PinboardAnswerModel = _PinboardAnswerModel_;
            scope = rootScope.$new();
        });
        done();
    });

    it('should reuse render state on pinboard update from viz context', function () {
        jasmine.getFixtures().fixturesPath = 'base/test/unit/testdata';
        var dataNode = {};
        var pinboardMetadataJson = JSON.parse(jasmine.getFixtures().read('pinboard_answer_book_1.json'));
        pinboardMetadataJson.reportContent.sheets.each(function(sheet){
            dataNode[sheet.header.id] = {
                vizData: {}
            };
        });
        var pinboardJson = {
            completionRatio: 1,
            reportBookData: dataNode,
            reportBookMetadata: pinboardMetadataJson
        };
        var pinboardModel = new PinboardAnswerModel(pinboardJson);

        var answerMetadataJson = JSON.parse(jasmine.getFixtures().read('question_answer_book_1.json'));
        answerMetadataJson.reportContent.sheets.each(function(sheet){
            dataNode[sheet.header.id] = {
                vizData: {}
            };
        });
        var answerJson = {
            completionRatio: 1,
            reportBookData: dataNode,
            reportBookMetadata: answerMetadataJson
        };
        var answerModel = new AnswerModel(answerJson);

        var visualizations = pinboardModel.getCurrentAnswerSheet().getVisualizations();
        var firstPBViz = Object.values(visualizations)[0];
        // Matching the answer sheet model's id to make sure answerSheetModel is matched.
        answerModel.getCurrentAnswerSheet().setId(firstPBViz.getAnswerSheetId());
        Object.values(visualizations).forEach(function (viz) {
            var referencedViz = viz.getReferencedVisualization();
            referencedViz.setRenderReady(true);
            referencedViz.setSecondaryRenderReady(true);
        });

        pinboardPageController = controller('PinboardPageController', {
            $scope: scope
        });

        scope.onModelUpdateSuccess = _.noop;

        scope.loadPinboardModel(pinboardModel);
        scope.metadataConfig.model = pinboardModel;

        scope.contextOptions = {};
        scope.onPinboardUpdatedFromVizContext(firstPBViz.getId(),
            pinboardModel,
            answerModel);

        var updatedPinboardModel = scope.getCurrentPinboardModel();
        var updatedVisualizations = updatedPinboardModel.getCurrentAnswerSheet().getVisualizations();
        Object.keys(updatedVisualizations).forEach(function (pbVizId) {
            var isUpdatedViz = (pbVizId === firstPBViz.getId());
            var referencedViz = updatedVisualizations[pbVizId].getReferencedVisualization();
            expect(referencedViz.isRenderReady()).toBe(!isUpdatedViz);
            expect(referencedViz.isSecondaryRenderReady()).toBe(!isUpdatedViz);
        })
    });
});

