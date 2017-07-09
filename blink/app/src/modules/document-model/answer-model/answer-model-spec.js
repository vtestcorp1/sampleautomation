/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for answer model
 */

'use strict';

/* global xit */
describe('answer model:', function() {
    var jsonConstants, AnswerModel;

    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            jsonConstants = $injector.get('jsonConstants');
            AnswerModel = $injector.get('AnswerModel');
        });
    });

    it('should return a json for answer model constants', function() {
        expect(jsonConstants).toEqual(jasmine.any(Object));
        expect(jsonConstants.DATA_KEY).toEqual('data');
    });

    it('should return a constructor for answer model', function() {
        expect(AnswerModel).toEqual(jasmine.any(Function));
    });

    it('should ignore incomplete details if the complete flag is set to true: SCAL-11624', function(){
        var answerModelJson = blink.app.fakeData['/callosum/v1/answer'];
        answerModelJson = angular.copy(answerModelJson);

        var answerModel;

        answerModelJson.reportBookMetadata.complete = true;
        answerModelJson.reportBookMetadata.incompleteDetail = [{}];
        answerModel = new AnswerModel(answerModelJson);
        expect(answerModel.isCorrupted()).toBe(false);

        answerModelJson.reportBookMetadata.complete = false;
        answerModelJson.reportBookMetadata.incompleteDetail = [];
        answerModel = new AnswerModel(answerModelJson);
        expect(answerModel.isCorrupted()).toBe(true);

        answerModelJson.reportBookMetadata.complete = false;
        answerModelJson.reportBookMetadata.incompleteDetail = [{}];
        answerModel = new AnswerModel(answerModelJson);
        expect(answerModel.isCorrupted()).toBe(true);

    });

    //TODO(Rahul): Fix the fakedata answer for these tests.
    xit('should return a valid answer model', function() {
        var answerModelJson = blink.app.fakeData['/callosum/v1/answer'];
        var answerModel = new AnswerModel(answerModelJson);

        var viz = answerModel.getVizById('efac269a-c188-4a8e-a452-c497d81fd204');
        expect(viz.getName()).toEqual('Headline Viz revenue');
        expect(viz.getVizType()).toEqual('HEADLINE');
        expect(viz.getDataValueFormatted()).toBeDefined();
    });

    xit('should retain permissions detail', function(){
        var answerModelJson = blink.app.fakeData['/callosum/v1/answer'];
        var answerModel = new AnswerModel(answerModelJson);

        var mockPermission = {
            mockProperty: true
        };

        answerModel.setPermission(mockPermission);

        var metadataJson = answerModelJson[jsonConstants.REPORT_BOOK_METADATA_KEY];
        var newAnswerModel = answerModel.fromMetadataJson(metadataJson);

        expect(newAnswerModel.getPermission()).toEqual(mockPermission);
    });

    it('should return the correct sage question information', function () {
        var answerModelJson = blink.app.fakeData['/callosum/v1/answer'];
        var answerModel = new AnswerModel(answerModelJson);

        var quesInfo = answerModel.getQuestionInfo(),
            quesText = answerModel.getQuestionText();

        expect(quesInfo).not.toBe(undefined);
        expect(quesInfo.text).toBe('revenue');
        expect(quesInfo.text).toBe(quesText);
    });

    it('should ignore introduction of answer-mode when comparing for changes: SCAL-15974', function(){
        var oldSheetJson, newSheetJson, hasChanged;

        newSheetJson = {reportContent: {sheets: [{header: {clientState: {}}}]}};
        newSheetJson
            .reportContent
            .sheets[0]
            .header
            .clientState[jsonConstants.CLIENT_STATE_VIZ_SELECTION_ANSWER_MODE_KEY] = 'abc';

        // client state is not present
        oldSheetJson = {reportContent: {sheets: [{header: {}}]}};
        // static method
        hasChanged = AnswerModel.prototype.hasVizSelectionChanged(
            oldSheetJson,
            newSheetJson
        );
        expect(hasChanged).toBe(false);

        // client state is present but doesn't have the key
        oldSheetJson = {reportContent: {sheets: [{header: {clientState: {}}}]}};
        // static method
        hasChanged = AnswerModel.prototype.hasVizSelectionChanged(
            oldSheetJson,
            newSheetJson
        );
        expect(hasChanged).toBe(false);
    });

    it('should ignore multiColorSeries when comparing for changes', function() {
        var model1 = {
            header: {
                resolvedObjects: {
                    abcd: {
                        header: {
                            clientState: {
                            }
                        },
                        vizContent: {
                        }
                    }
                }
            }
        };

        var model2 = _.cloneDeep(model1);
        model2.header.resolvedObjects.abcd.header.clientState.multiColorSeriesColors =
            ['#f1f1f1', '#f2f2f2'];

        expect(AnswerModel.prototype.metadataEquals(model1, model2)).toBe(true);
    });
});

describe('Minimal AnswerModel spec with mocks:', function() {
    var jsonConstants, AnswerModel, AnswerSheetModel;

    // Create a mockModule module to host the factory for all the mocks.
    var mockModule = angular.module('answerSheetMock', []);

    // Mock out AnswerSheetModel.
    mockModule.factory('AnswerSheetModel', function() {
        var me = function() {};
        return me;
    });

    mockModule.factory('DocumentModel', function () {
        var me = function() {};
        return me;
    });

    beforeEach(function() {
        module('blink.app');
        // This load will override the real definitions with the mocks specified above.
        module('answerSheetMock');
        inject(function($injector) {
            AnswerSheetModel = $injector.get('AnswerSheetModel');
            AnswerModel = $injector.get('AnswerModel');
            jsonConstants = $injector.get('jsonConstants');
        });
    });

    it('should throw for a json without answer sheets', function() {
        expect(function() {
            new AnswerModel();
        }).toThrow();

        var answerJson = {};
        expect(function() {
            new AnswerModel(answerJson);
        }).toThrow();

        answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY] = {};
        expect(function() {
            new AnswerModel(answerJson);
        }).toThrow();

        answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.REPORT_BOOK_CONTENT_KEY] = {};
        expect(function() {
            new AnswerModel(answerJson);
        }).toThrow();

        answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.REPORT_BOOK_CONTENT_KEY][jsonConstants.SHEETS_KEY] = [];
        expect(function() {
            new AnswerModel(answerJson);
        }).not.toThrow();
    });

    it('should return null for getAnswerSheet with invalid index', function() {
        var answerJson = {};
        answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY] = {};
        answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.REPORT_BOOK_CONTENT_KEY] = {};
        answerJson[jsonConstants.REPORT_BOOK_METADATA_KEY][jsonConstants.REPORT_BOOK_CONTENT_KEY][jsonConstants.SHEETS_KEY] = [];
        answerJson[jsonConstants.REPORT_BOOK_DATA_KEY] = {};

        var answer = new AnswerModel(answerJson);
        expect(answer.getCurrentAnswerSheet()).toBeNull();
    });
});

describe('AnswerSheetModel spec', function() {
    var AnswerSheetModel,
        jsonConstants;

    // Create a mockModule module to host the factory for all the mocks.
    var mockModule = angular.module('vizMockModel', []);

    // Mock out VisualizationModel
    mockModule.factory('VisualizationModel', function() {
        var me = function() { };
        me.prototype.getId = function(id) { return 'id'; };
        me.Column = function () { };
        return me;
    });

    beforeEach(function() {
        module('blink.app');
        // This load will override the real definitions with the mocks specified above.
        module('vizMockModel');
        inject(function($injector) {
            AnswerSheetModel = $injector.get('AnswerSheetModel');
            jsonConstants = $injector.get('jsonConstants');
        });
    });

    it('should throw if no sheet json is provided', function() {
        // TODO(vibhor): Figure out how to verify the thrown error message in Jasmine.
        expect(function() {
            new AnswerSheetModel();
        }).toThrow();
    });

    it('should throw if empty sheet json is provided', function() {
        expect(function() {
            new AnswerSheetModel({});
        }).toThrow();
    });

    it('should throw if no header is provided in sheet json', function() {
        var sheetJson = {};
        sheetJson[jsonConstants.SHEETCONTENT_KEY] = {};
        expect(function() {
            new AnswerSheetModel(sheetJson);
        }).toThrow();
    });

    it('should throw if no id is provided in header of sheet json', function() {
        var sheetJson = {};
        sheetJson[jsonConstants.HEADER_KEY] = {};
        expect(function() {
            new AnswerSheetModel(sheetJson);
        }).toThrow();
    });

    it('should throw if no vizContainer is provided in sheet json', function() {
        var sheetJson = {};
        sheetJson[jsonConstants.HEADER_KEY] = { id: 'foo' };
        sheetJson[jsonConstants.SHEETCONTENT_KEY] = {};
        expect(function() {
            new AnswerSheetModel(sheetJson);
        }).toThrow();
    });

    it('should throw if no visualizations are provided in sheet json', function() {
        var sheetJson = {
            header: { id: 'foo' },
            sheetContent: { vizContainer: { } }
        };
        expect(function() {
            new AnswerSheetModel(sheetJson);
        }).toThrow();
    });
});
