/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Color picker widget unit tests
 *
 */

'use strict';

describe('Color picker widget', function () {

    var rootScope, compile, _window;
    var html = "<color-picker  class='bk-legend-marker' fill='true' ng-model='picker.color'></color-picker>";

    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    beforeEach(inject(function($rootScope, $compile, $window) {
        rootScope = $rootScope;
        compile = $compile;
        _window = $window;
    }));

    afterEach(function(){
        $('.colorpicker').remove();
    });

    it("Should change visibility of element after click",function() {
        var scope = rootScope.$new();
        var compiledElement = compile(html)(scope);
        scope.$digest();
        compiledElement.click();
        var el = $(document).find('.colorpicker');

        expect(el.hasClass('colorpicker-visible')).toBeTruthy();
        $(document).trigger('mousedown');
        expect(el.hasClass('colorpicker-visible')).toBeFalsy();
    });

    it("should be able to set its background color correctly", function() {
        var scope = rootScope.$new();
        scope.picker = { color : 'rgba(1, 2, 3, 0)'};

        var compiledElement = compile(html)(scope);
        scope.$digest();
        compiledElement.click();

        var el = compiledElement.find('.bk-color-picker-fill');
        expect(el.attr('style')).toBe('background-color: rgba(1, 2, 3, 0);');
    });
});

