/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Formula assistant unit spec
 *
 */

'use strict';

describe('Formula Assistant unit', function () {

    var rootScope, compile, _window;
    var scope, el;
    var html = '<formula-assistant data="parentData" on-close="close()" title="title"></formula-assistant>';

    var data = blink.app.fakeData.formulaAssistant;


    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    beforeEach(inject(function($rootScope, $compile, $window) {
        rootScope = $rootScope;
        compile = $compile;
        _window = $window;

        scope = rootScope.$new();
        scope.parentData = data;
        scope.title = "assistant";
        scope.close = angular.noop;
        var element = compile(html)(scope);
        $('body').append(element);
        spyOn(scope, 'close');
        scope.$apply();

        el = $(document).find('.bk-formula-assistant-examples-tree');
    }));

    afterEach(function(){
        $('.bk-formula-assistant').remove();
    });

    it("Should display the formula assistant", function() {
        expect(el.length).toBe(1);
        expect(el.find('ol[ng-model="data.children"]').length).toBe(data.children.length);
        expect(el.find('li li').length).toBe(data.children[0].children.length);
    });

    it("should display the right value", function(){
        expect(el.find('li li').eq(0).text().trim()).toEqual(data.children[0].children[0].displayValue);
        expect(el.find('li li').eq(1).text().trim()).toEqual(data.children[0].children[1].value);
    });

    it("should be close on callback", function() {
        expect(scope.close.calls.count()).toBe(0);
        expect($(document).find('.bk-formula-assistant-close-button').length).toBe(1);

        $(document).find('.bk-formula-assistant-close-button').click();
        rootScope.$digest();

        expect(scope.close.calls.count()).toBe(1);
    });
});

