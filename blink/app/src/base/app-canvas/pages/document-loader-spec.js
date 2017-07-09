/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Unit tests for document loader.
 */

'use strict';
/* eslint camelcase: 1 */

describe('document loader', function() {

    beforeEach(module('blink.app'));

    var DocumentLoader, jsonConstants, alertService,
        pinboardMetadataUtil, $q, $rootScope, navService, metadataPermissionService;
    beforeEach(inject(
        function(_DocumentLoader_, _jsonConstants_, _alertService_,
                 _pinboardMetadataUtil_, _$q_, _$rootScope_, _navService_, _metadataPermissionService_) {
            DocumentLoader = _DocumentLoader_;
            jsonConstants = _jsonConstants_;
            alertService = _alertService_;
            pinboardMetadataUtil = _pinboardMetadataUtil_;
            $q = _$q_;
            $rootScope = _$rootScope_;
            navService = _navService_;
            metadataPermissionService = _metadataPermissionService_;
        }
    ));

    function getFakePinboardModel() {
        return jasmine.createSpyObj(
            'documentModel',
            ['getAuthorId', 'getContextAnswerIds', 'setPermission']
        );
    }

    it('should show alert if pinboard loading fails except on home page', function(done) {
        spyOn(alertService, 'showUserActionFailureAlert');
        var documentLoader = new DocumentLoader(null, true);
        spyOn(pinboardMetadataUtil, 'getModelMetadata').and.returnValue($q.reject({}));
        documentLoader.loadDocument('abc', jsonConstants.metadataType.PINBOARD_ANSWER_BOOK).then(
            function() {
            },
            function(response) {
                expect(alertService.showUserActionFailureAlert).toHaveBeenCalled();

                alertService.showUserActionFailureAlert.calls.reset();
                spyOn(navService, 'isAtHome').and.returnValue(true);
                documentLoader.loadDocument('abc', jsonConstants.metadataType.PINBOARD_ANSWER_BOOK).then(
                    function() {
                    },
                    function(response) {
                        expect(alertService.showUserActionFailureAlert).not.toHaveBeenCalled();
                        done();
                    }
                );
                $rootScope.$apply();
            }
        );
        $rootScope.$apply();
    });

    it('should show alert if fetching pinboard permissions failed', function(done) {
        spyOn(alertService, 'showUserActionFailureAlert');
        spyOn(pinboardMetadataUtil, 'getModelMetadata').and.returnValue(
            $q.when({data: getFakePinboardModel()})
        );
        spyOn(metadataPermissionService, 'getEffectivePermissionsByType').and.returnValue(
            $q.reject({})
        );
        var documentLoader = new DocumentLoader(null, true);
        documentLoader.loadDocument('abc', jsonConstants.metadataType.PINBOARD_ANSWER_BOOK).then(
            function() {
            },
            function(response) {
                expect(alertService.showUserActionFailureAlert).toHaveBeenCalled();
                done();
            }
        );
        $rootScope.$apply();
    });
});
