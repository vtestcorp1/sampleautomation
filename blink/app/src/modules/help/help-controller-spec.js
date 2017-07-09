/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Unit test for help controller
 */

'use strict';

describe('HelpController', function() {
    var _$scope,
        _$controller,
        _helpKeywords,
        _$httpBackend,
        mockReleaseVersion = "Unit Test";

    beforeEach(function() {
        module('blink.app');

        inject(function($rootScope, $controller, helpKeywords, $httpBackend) {
            _$scope = $rootScope.$new();
            _$controller = $controller;
            _helpKeywords = helpKeywords;
            _$httpBackend = $httpBackend;
        });

        _$httpBackend.expectGET('/release').respond(mockReleaseVersion);
        var ctrl = _$controller('HelpController', { $scope: _$scope, helpKeywords: _helpKeywords });

    });

    it('should retrieve basic keywords example text', function(){
        expect(_$scope.keywordHelpDefinition.basic[0].example[0].text).toBe(_helpKeywords.helpKeywordsJson.basic.sets[0].keywords[0].examples[0].text);
    });

    it('should have border bottom class after a set ends', function() {
        expect(_$scope.keywordHelpDefinition.basic[0].cssBottomBorder).toBeTruthy();
    });

    it('should retrieve time keywords keyword title', function() {
        expect(_$scope.keywordHelpDefinition.time[0].keywordSetName).toBe(_helpKeywords.helpKeywordsJson.time.sets[1].keywords[0].keywordSetName);
        expect(_$scope.keywordHelpDefinition.basic[0].keywordSetName).toBe(undefined);
    });

    it('should retrieve basic keywords', function(){
        expect(_$scope.keywordHelpDefinition.basic[0].example[0].keyword).toBe(_helpKeywords.helpKeywordsJson.basic.sets[0].keywords[0].keyword);
    });

    it('should calculate correct start and length for highlighted text', function(){
        expect(_$scope.keywordHelpDefinition.time[0].example[0].highlight[0].size).toBe(8);
        expect(_$scope.keywordHelpDefinition.time[0].example[0].highlight[0].start).toBe(10);
    });

});

