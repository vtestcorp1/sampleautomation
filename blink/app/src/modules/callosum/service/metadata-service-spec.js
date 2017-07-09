/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for metadata api service.
 */

'use strict';

describe('metadata service', function () {
    var $httpBackend, metadataService, jsonConstants, sessionService;

    beforeEach(function () {
        module('blink.app');
        inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
            metadataService = $injector.get('metadataService');
            jsonConstants = $injector.get('jsonConstants');
            sessionService = $injector.get('sessionService');
            sessionService.getUserGuid = function () {
                return {data:'1234'};
            };
        });
    });

    var _pinboards = [1, 2, 3],
        apiResponse1 = {
            headers: _pinboards
        };

    it('should get a request to fetch pinboard list model from api', function() {
        var filterParams = {
            "autoCreated" : false // Do not show a3 insights pinboard.
        };
        var expectedGet = '/callosum/v1/metadata/list?auto_created=false&showhidden=false&sortascending=false&type=PINBOARD_ANSWER_BOOK';
        $httpBackend.expectGET(expectedGet).respond(apiResponse1);
        metadataService.getMetadataListModel(
            jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            filterParams)
            .then(function(r) {
                expect(r.data.getItems()).toEqual(_pinboards);
            });
        $httpBackend.flush();
    });

    var createResponse = 'created';
    it('should post a request to create a pinboard', function() {
        $httpBackend
            .expectPOST('/callosum/v1/metadata/create', 'type=PINBOARD_ANSWER_SHEET&name=my+pinboard&description=my+description')
            .respond(createResponse);
        metadataService.createMetadataObject(
            jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            'my pinboard',
            'my description'
        ).then(function(r) {
            expect(r.data).toBe(createResponse);
        });
        $httpBackend.flush();
    });

    var addRelatedLinkResponse = {};
    it('should post a request to add a related link with a visualization', function() {
        $httpBackend
            .expectPOST('/callosum/v1/metadata/addrelatedlink', 'name=name&description=description&srcVizId=srcVizId&dstAnswerBookId=dstAnswerBookId&content=content&dstVizId=dstVizId')
            .respond(addRelatedLinkResponse);
        metadataService.addRelatedLink(
            'name', 'description', 'srcVizId', 'dstAnswerBookId', 'dstVizId', 'content'
        ).then(function(r) {
            expect(r.data).equal(addRelatedLinkResponse);
        });
        $httpBackend.flush();
    });

    it('should post a request to add a related link without a visualization', function() {
        $httpBackend
            .expectPOST('/callosum/v1/metadata/addrelatedlink', 'name=name&description=description&srcVizId=srcVizId&dstAnswerBookId=dstAnswerBookId&content=content')
            .respond(addRelatedLinkResponse);
        metadataService.addRelatedLink(
            'name', 'description', 'srcVizId', 'dstAnswerBookId', '', 'content'
        ).then(function(r) {
            expect(r.data).equal(addRelatedLinkResponse);
        });
        $httpBackend.flush();
    });

    var updateRelatedLinkResponse = {};
    it('should post a request to update a related link with a visualization', function() {
        $httpBackend
            .expectPOST('/callosum/v1/metadata/updaterelatedlink', 'id=id&name=name&description=description&srcVizId=srcVizId&dstAnswerBookId=dstAnswerBookId&content=content&dstVizId=dstVizId')
            .respond(updateRelatedLinkResponse);
        metadataService.updateRelatedLink(
            'id', 'name', 'description', 'srcVizId', 'dstAnswerBookId', 'dstVizId', 'content'
        ).then(function(r) {
            expect(r.data).equal(updateRelatedLinkResponse);
        });
        $httpBackend.flush();
    });

    var updateRelatedLinkResponse = {};
    it('should post a request to update a related link without a visualization', function() {
        $httpBackend
            .expectPOST('/callosum/v1/metadata/updaterelatedlink', 'id=id&name=name&description=description&srcVizId=srcVizId&dstAnswerBookId=dstAnswerBookId&content=content')
            .respond(updateRelatedLinkResponse);
        metadataService.updateRelatedLink(
            'id', 'name', 'description', 'srcVizId', 'dstAnswerBookId', '', 'content'
        ).then(function(r) {
            expect(r.data).equal(updateRelatedLinkResponse);
        });
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});
