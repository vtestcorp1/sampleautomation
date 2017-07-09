/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for pinboard answer model
 */

'use strict';

describe('pinboard answer model spec', function() {
    var jsonConstants, PinboardAnswerModel;

    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            jsonConstants = $injector.get('jsonConstants');
            PinboardAnswerModel = $injector.get('PinboardAnswerModel');
        });
    });

    it('should retain permission details', function() {
        var pinboardJson = blink.app.fakeData.pinboard1;
        var pinboardAnswerModelJson = angular.copy(pinboardJson);

        var pinboardAnswerModel = new PinboardAnswerModel(pinboardAnswerModelJson);

        var mockPermission = {
            mockProperty: true
        };

        pinboardAnswerModel.setPermission(mockPermission);

        var metadataJson = pinboardAnswerModelJson[jsonConstants.REPORT_BOOK_METADATA_KEY];
        var newPBModel = pinboardAnswerModel.fromMetadataJson(metadataJson);

        expect(newPBModel.getPermission()).toEqual(mockPermission);
    });
});
