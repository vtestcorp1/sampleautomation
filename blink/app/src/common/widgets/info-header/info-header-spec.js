/**
 * Copyright: ThoughtSpot Inc. 2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for Action-Links list
 */
'use strict';

describe('Info header component spec', function () {
    var $rootScope,
        $compile,
        ctrl,
        scope,
        directiveElement;

    var basePath = getBasePath(document.currentScript.src) + 'info-header-component';

    beforeEach(function (done) {
        module('blink.app');
        System.import(basePath).then(function (module) {
            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
            });
            ctrl = new module.default('text');
            directiveElement = getCompiledElement();
            done();
        }).catch(function (error) {
            done.fail(error);
        });
    });

    afterEach(function(done) {
        System.delete(
            System.normalizeSync(basePath));
        //Hack(Ashish): Does not work on Chrome 52 without this, some issue
        //with Chrome/systemJS, https://github.com/systemjs/systemjs/issues/1372.
        setTimeout(done, 0);
    });

    function getCompiledElement() {
        scope = $rootScope.$new();
        scope.ctrl = ctrl;
        var element = angular.element('<bk-info-header bk-ctrl="ctrl">' +
            '</bk-info-header>');
        var compiledElement = $compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    it('should render header', function () {
        expect(directiveElement.find('.bk-info-header').length).toBe(1);
        expect(directiveElement.find('.bk-info-header-text').text().trim()).toBe('text');
    });
});
