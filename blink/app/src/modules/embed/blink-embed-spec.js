/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Unit tests for ThoughtSpot embedded view.
 */

'use strict';

describe('Embedding', function() {

    var $scope, elem, mocked$Route,
        mockDocumentId = 'document-id';

    function MockedDocumentLoader() {}

    beforeEach(function () {
        mocked$Route = {
            current: {
                params: {}
            }
        };

        MockedDocumentLoader.prototype.loadDocument = jasmine.createSpy('loadDocument');

        module('blink.app');

        module(function ($provide) {
            $provide.value('$route', mocked$Route);
            $provide.value('DocumentLoader', MockedDocumentLoader);
        });

        inject(function ($rootScope, $compile) {
            $scope = $rootScope.$new();

            var template = '<blink-embed></blink-embed>';
            elem = $compile(angular.element(template))($scope);
            $('body').append(elem);

            // directive's scope is the child of _$scope
            $rootScope.$digest();
            $scope = elem.scope().$$childHead;
        });
    });

    afterEach(function(){
        $('body').empty();
    });

    it('should mark config as invalid if document id is not provided', function(){
        expect($scope.isEmbedConfigurationValid()).toBe(false);
        mocked$Route.current.params.documentId = mockDocumentId;
        $scope.$root.$digest();
        expect($scope.isEmbedConfigurationValid()).toBe(true);
    });

    it('should load document with the correct id', function(){
        expect(MockedDocumentLoader.prototype.loadDocument).not.toHaveBeenCalled();
        mocked$Route.current.params.documentId = mockDocumentId;
        $scope.$root.$digest();
        expect(MockedDocumentLoader.prototype.loadDocument).toHaveBeenCalled();
        expect(MockedDocumentLoader.prototype.loadDocument.calls.mostRecent().args[0]).toBe(mockDocumentId);
    });

    it('should load new document on route change', function(){
        mocked$Route.current.params.documentId = mockDocumentId;
        $scope.$root.$digest();
        expect(MockedDocumentLoader.prototype.loadDocument).toHaveBeenCalled();
        expect(MockedDocumentLoader.prototype.loadDocument.calls.mostRecent().args[0]).toBe(mockDocumentId);

        var secondMockDocumentId = 'document-id-2';
        mocked$Route.current.params.documentId = secondMockDocumentId;
        $scope.$root.$digest();
        expect(MockedDocumentLoader.prototype.loadDocument.calls.mostRecent().args[0]).toBe(secondMockDocumentId);
    });

    it('should set correct pinboard page config', function(){
        mocked$Route.current.params.documentId = mockDocumentId;

        mocked$Route.current.params.vizId = void 0;
        $scope.$root.$digest();
        expect($scope.pinboardPageConfig.vizIdsToShow).toBe(null);
        expect($scope.pinboardPageConfig.disallowTileRemoval).toBe(true);
        expect($scope.pinboardPageConfig.disallowTileMaximization).toBe(true);
        expect($scope.pinboardPageConfig.disallowVizContextEdit).toBe(true);
        expect($scope.pinboardPageConfig.disallowVizEmbedding).toBe(true);
        expect($scope.pinboardPageConfig.disallowLayoutChanges).toBe(true);

        var mockVizId = 'viz-id';
        mocked$Route.current.params.vizId = mockVizId;
        $scope.$root.$digest();
        expect($scope.pinboardPageConfig.vizIdsToShow).toEqual([mockVizId]);
        expect($scope.pinboardPageConfig.disallowTileRemoval).toBe(true);
        expect($scope.pinboardPageConfig.disallowTileMaximization).toBe(true);
        expect($scope.pinboardPageConfig.disallowVizContextEdit).toBe(true);
        expect($scope.pinboardPageConfig.disallowVizEmbedding).toBe(true);
        expect($scope.pinboardPageConfig.disallowLayoutChanges).toBe(true);
    });
});
