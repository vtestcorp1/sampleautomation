/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for metadata api service.
 */

'use strict';

describe('metadata service', function () {
    var $httpBackend, pinboardMetadataService, jsonConstants, sessionService;

    beforeEach(function () {
        module('blink.app');
        inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            pinboardMetadataService = $injector.get('pinboardMetadataService');
            jsonConstants = $injector.get('jsonConstants');
            sessionService = $injector.get('sessionService');
            sessionService.getUserGuid = function () {
                return {data:'1234'};
            };
        });
    });

    var expectedResponse = 'modified pinboard';
    it('should post a request to add visualization', function () {
        $httpBackend.expectPOST('/callosum/v1/metadata/pinboard/addvisualization',
            'content=%7B%7D&vizid=vizId&tgtbookid=pinboard').respond();
        pinboardMetadataService.addVizToPinboard('vizId', 'pinboard', {})
            .then(function (response) {
                expect(response.data).toBeUndefined();
            });
        $httpBackend.flush();
    });

    it('should post a request to delete a visualization', function () {
        $httpBackend.expectPOST('/callosum/v1/metadata/pinboard/edit/deletefrompinboard',
            'tgtbookid=pinboard&vizid=%5B%22vizId%22%5D').respond(expectedResponse);

        pinboardMetadataService.deleteVizFromPinboard('vizId', 'pinboard')
            .then(function (response) {
                expect(response.data).toBe(expectedResponse);
            });
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
