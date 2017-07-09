/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for metadata list model
 */

'use strict';

describe('metadata list model:', function() {
    var MetadataListModel;

    beforeEach(function() {
        module('blink.app');
        inject(function($injector, sessionService) {

            // Overwrite the getUserGuid function to mock it
            sessionService.getUserGuid = function () {
                return '1234';
            };

            MetadataListModel = $injector.get('MetadataListModel');
        });
    });

    it('should return a constructor for metadata list model', function() {
        expect(MetadataListModel).toEqual(jasmine.any(Function));
    });

    it('should return a valid metadata list', function() {
        var metadataListModelJson = blink.app.fakeData['/callosum/v1/metadata/list'];
        var metadataListModel = new MetadataListModel(metadataListModelJson);

        // test valid instance
        expect(metadataListModel).toEqual(jasmine.any(MetadataListModel));

        // test some values
        var questions = metadataListModel.getItems();
        expect(questions.length).toEqual(8);
    });
});
