/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Joy Dutta (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for file upload controller
 */
'use strict';

/* global mockLoadingIndicator */
describe('File upload controller', function() {
    var $scope = null,
        $qService = null,
        eventsService = null,
        alertConstantsService = null,
        fileUploadServiceService = null,
        fileUploadCtrl = null,
        mockEvent = {
            target: {
                result: ''
            }
        },
        mockCSVFile = {
            type: 'text/csv',
            name: 'test.csv'
        },
        mockUploadConfig,
        mockFileReader,
        originalFileReader = window.FileReader;

    beforeEach(module('blink.app'));

    beforeEach(inject(function ($rootScope, $controller, $q, events, alertConstants, fileUploadService) {
        $scope = $rootScope.$new();
        $scope.getUploadConfig = function () {
            return mockUploadConfig;
        };
        $qService = $q;
        eventsService = events;
        alertConstantsService = alertConstants;
        fileUploadServiceService = fileUploadService;

        fileUploadCtrl = $controller('Html5FileUploadController', {
            $scope: $scope,
            loadingIndicator: mockLoadingIndicator()
        });


        mockFileReader = angular.noop;
        mockFileReader.fileWasRead = false;
        mockFileReader.prototype.readAsText = function (file) {
            mockFileReader.fileWasRead = true;
        };
        window.FileReader = mockFileReader;
    }));

    afterEach(function () {
        window.FileReader = originalFileReader;
    });

    it('should log error and do nothing when no config is found', function () {
        $scope.uploadFile(mockCSVFile);
        expect(mockFileReader.fileWasRead).toBeFalsy();
    });

    it('should log error and do nothing when no targetPath is provided', function () {
        mockUploadConfig = {};
        $scope.uploadFile(mockCSVFile);
        expect(mockFileReader.fileWasRead).toBeFalsy();
    });

    it('should log error and do nothing when no filename is provided', function () {
        mockUploadConfig = {
            targetPath: '/foo'
        };
        $scope.uploadFile(mockCSVFile);
        expect(mockFileReader.fileWasRead).toBeFalsy();
    });

    it('should read a csv file with onFileLoad', function () {
        mockUploadConfig = {
            onFileLoad: angular.noop
        };
        $scope.uploadFile(mockCSVFile);
        expect(mockFileReader.fileWasRead).toBeTruthy();
    });

    // Note(joy): if some other test redefines window then there could be a problem.
    it('should read a csv file', function () {
        mockUploadConfig = {
            targetPath: '/foo',
            fileName: 'bar'
        };
        $scope.uploadFile(mockCSVFile);
        expect(mockFileReader.fileWasRead).toBeTruthy();
    });

    it('should check for valid file extension', function () {
        // When no file extension is provided, should upload the file
        mockUploadConfig = {
            onFileLoad: angular.noop
        };
        $scope.uploadFile(mockCSVFile);
        expect(mockFileReader.fileWasRead).toBeTruthy();

        // reset variable
        mockFileReader.fileWasRead = false;
        expect(mockFileReader.fileWasRead).toBeFalsy();

        // For valid extension, should read file
        mockUploadConfig.validFileExtensions = ['csv'];
        $scope.uploadFile(mockCSVFile);
        expect(mockFileReader.fileWasRead).toBeTruthy();

        // reset variable
        mockFileReader.fileWasRead = false;
        expect(mockFileReader.fileWasRead).toBeFalsy();

        // For invalid extension, should call with error message
        mockUploadConfig.validFileExtensions = ['txt'];
        mockUploadConfig.onFileUploadClientValidation = jasmine.createSpy();

        expect(mockUploadConfig.onFileUploadClientValidation.calls.count()).toBe(0);
        $scope.uploadFile(mockCSVFile);
        expect(mockUploadConfig.onFileUploadClientValidation.calls.count()).toBe(1);
        expect(mockUploadConfig.onFileUploadClientValidation.calls.mostRecent().args[0]).toBeFalsy();
        expect(mockUploadConfig.onFileUploadClientValidation.calls.mostRecent().args[1].message).toMatch('Invalid');
        expect(mockFileReader.fileWasRead).toBeFalsy();
    });

    it('should check correct target path is being provided to file upload service', function () {
        mockFileReader = function() {
            this.readAsText = function (file) {
                mockFileReader.fileWasRead = true;
                this.onload({
                    target: {
                        result: 0
                    }
                });
            };
        };
        window.FileReader = mockFileReader;

        mockUploadConfig = {
            targetPath: '/dataLoadPath',
            fileName: 'mock.csv'
        };
        spyOn($scope, 'uploadFile').and.callThrough();
        spyOn(fileUploadServiceService, 'uploadFileContent');
        $scope.uploadFile(mockCSVFile);
        expect($scope.uploadFile).toHaveBeenCalled();
        expect(fileUploadServiceService.uploadFileContent).toHaveBeenCalled();
        expect(fileUploadServiceService.uploadFileContent.calls.mostRecent().args[0]).toMatch('/dataLoadPath');
    });
});

