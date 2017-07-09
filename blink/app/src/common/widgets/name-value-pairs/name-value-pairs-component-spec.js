/**
 * Copyright: ThoughtSpot Inc. 2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for Name-Value Pair component
 */
'use strict';

var containerCssClass = '.bk-name-value-component',
    keyCssClass = '.bk-name',
    valueCssClass  = '.bk-value';

describe('Name value pair component', function () {
    var $rootScope,
        $compile,
        constructor,
        ctrl,
        scope,
        directiveElement;

    beforeEach(function (done) {
        module('blink.app');
        constructor = module.default;
        inject(function ($injector) {
            $rootScope = $injector.get('$rootScope');
            constructor = $injector.get('NameValuePairsComponent');
            $compile = $injector.get('$compile');
            ctrl = new constructor();
            directiveElement = getCompiledElement();
        });
        done();
    });

    function getCompiledElement() {
        scope = $rootScope.$new();
        scope.ctrl = ctrl;
        var element = angular.element('<bk-name-value-pairs bk-ctrl="ctrl"></bk-name-value-pairs>');
        var compiledElement = $compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    it('should display name and value with correct CSS classes', function(){
        ctrl.addNameValuePair('TESTNAME', 'TESTVALUE');
        scope.$digest();
        expect(directiveElement.find(containerCssClass).length).toBe(1);
        expect(directiveElement.find(keyCssClass).length).toBe(1);
        expect(directiveElement.find(valueCssClass).length).toBe(1);
        expect(directiveElement.find(keyCssClass).text().trim()).toBe('TESTNAME:');
        expect(directiveElement.find(valueCssClass).text().trim()).toBe('TESTVALUE');
    });

    it('should display multiple entries', function() {
        ctrl.addNameValuePair('TESTNAME', 'TESTVALUE');
        ctrl.addNameValuePair('TESTNAME2', 'TESTVALUE2');
        scope.$digest();
        expect(directiveElement.find(containerCssClass).length).toBe(2);
        expect(directiveElement.find(keyCssClass).length).toBe(2);
        expect(directiveElement.find(valueCssClass).length).toBe(2);
    });

    it('should remove correctly entry', function() {
        ctrl.addNameValuePair('TESTNAME', 'TESTVALUE');
        ctrl.addNameValuePair('TESTNAME2', 'TESTVALUE2');
        scope.$digest();
        expect(directiveElement.find(containerCssClass).length).toBe(2);
        expect(directiveElement.find(keyCssClass).length).toBe(2);
        expect(directiveElement.find(valueCssClass).length).toBe(2);
        ctrl.removeNameValuePair('TESTNAME');
        scope.$digest();
        expect(directiveElement.find(containerCssClass).length).toBe(1);
        expect(directiveElement.find(keyCssClass).length).toBe(1);
        expect(directiveElement.find(valueCssClass).length).toBe(1);
    });
});
