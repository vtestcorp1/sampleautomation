/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  job-metadata-component-spec
 *
 */

'use strict';

describe('Job creation/update form', function () {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var $rootScope,
        $compile,
        Component;


    var job = {
        backingProto: {
            name : 'testName',
            description: 'testDescription'
        },
        getName: function() { return this.backingProto.name; },
        getDescription: function() { return this.backingProto.description; },
        getFormatType: function() { return 1; }
    };

    /* eslint camelcase: 1 */
    beforeEach(inject(function(
        _$rootScope_,
        _$compile_,
        _JobMetadataComponent_) {
        /* eslint camelcase: 1 */
        $rootScope = _$rootScope_;
        /* eslint camelcase: 1 */
        $compile = _$compile_;
        /* eslint camelcase: 1 */
        Component = _JobMetadataComponent_;
    }));

    describe('verify state', function () {
        it('should have field correctly setted', function(){
            var controller = new Component();
            controller.setJob(job);
            var elm = angular.element('<bk-job-metadata bk-ctrl="ctrl"></bk-job-metadata>');
            var scope = $rootScope.$new();
            scope.ctrl = controller;
            $compile(elm)(scope);
            scope.$digest();
            var elementToTest = elm.find('input');
            expect(elementToTest.val()).toBe(job.getName());
            elementToTest = elm.find('textarea');
            expect(elementToTest.val()).toBe(job.getDescription());
            expect(elm.find('.bk-form-radio.bk-selected:contains("PDF")').length).toBe(1);
            expect(elm.find('.bk-form-radio:contains("CSV")').length).toBe(1);
        });

        it('should have CSV disabled if tables are unavailable', function() {
            var controller = new Component();
            controller.setJob(job);
            controller.hasNoTable = true;
            var elm = angular.element('<bk-job-metadata bk-ctrl="ctrl"></bk-job-metadata>');
            var scope = $rootScope.$new();
            scope.ctrl = controller;
            $compile(elm)(scope);
            scope.$digest();
            expect(elm.find('.bk-form-radio.bk-disabled:contains("CSV")').length).toBe(1);
            expect(elm.find('.bk-warning').length).toBe(1);
        });

        it('should be able to click on CSV and PDF', function() {
            var controller = new Component();
            controller.setJob(job);
            controller.hasNoTable = false;
            var elm = angular.element('<bk-job-metadata bk-ctrl="ctrl"></bk-job-metadata>');
            var scope = $rootScope.$new();
            scope.ctrl = controller;
            $compile(elm)(scope);
            scope.$digest();
            elm.find('.bk-form-radio:contains("CSV")').click();
            scope.$digest();
            expect(elm.find('.bk-form-radio.bk-selected:contains("CSV")').length).toBe(1);
            elm.find('.bk-form-radio:contains("PDF")').click();
            scope.$digest();
            expect(elm.find('.bk-form-radio.bk-selected:contains("PDF")').length).toBe(1);
        });
    });
});
