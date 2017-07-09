/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Blink positionable widget unit tests
 *
 */

'use strict';

describe('Blink Positionable widget', function () {

    var rootScope, compile,scope, _window,popover,compiledElement,_BlinkPositionablePopover;
    var html = "<div class='anchor'></div>";
    var MOUSE_POPOVER_DELTA = 20; // see blink-positionable-popover.js

    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    beforeEach(inject(function($rootScope, $compile, $window,BlinkPositionablePopover) {
        rootScope = $rootScope;
        compile = $compile;
        _window = $window;
        _BlinkPositionablePopover = BlinkPositionablePopover;
        scope = rootScope.$new();
        compiledElement = compile(html)(scope);
        popover = new _BlinkPositionablePopover(null, ['bk-positionable-tooltip']);
        scope.$digest();
    }));

    function defineBrowserWindow(scrollTop,scrollLeft,width,height) {
        spyOnJqueryElement(window,'height',height );
        spyOnJqueryElement(window,'width',width);
        spyOnJqueryElement(window,'scrollTop',scrollTop);
        spyOnJqueryElement(window,'scrollLeft',scrollLeft);
    }

    // $(window) returns a new object when called, e.g : $(window) == $(window) return false,
    // we must override prototype methods of jquery
    function spyOnJqueryElement(target,methodName,value) {
        spyOn($.prototype, methodName).and.callFake(function() {
            var original = $.prototype[methodName];
            if (this[0] === target ) {
                return value;
            } else {
                return original.apply(this, arguments);
            }
        });
    }

    it("Should change visibility of element after click",function() {
        var el = $(document).find('.bk-positionable-tooltip');
        expect(el.length).toBe(1);
        popover.hide();
        expect(angular.element('.bk-positionable-tooltip').css('display')).toBe('none');
        popover.show();
        expect(angular.element('.bk-positionable-tooltip').css('display')).not.toBe('none');
    });

    it("Should handle correctly the overflowing of the popover",function() {

        var overflowX = 150, standardX = 10, overflowY = 150, standardY = 10;

        defineBrowserWindow(0,0,101,101);

        spyOnJqueryElement(popover.$popover[0].children[0] ,'outerWidth',40);
        spyOnJqueryElement(popover.$popover[0].children[0] ,'outerHeight',40);

        //when popover overflow on bottom and right side
        popover.show(overflowX,overflowY);
        expect(popover.scope.x).toBeLessThan(overflowX);
        expect(popover.scope.y).toBeLessThan(overflowY);

        //when popover overflow on bottom side
        popover.show(standardX,overflowY,'');
        expect(popover.scope.x).toBe(standardX + MOUSE_POPOVER_DELTA);
        expect(popover.scope.y).toBeLessThan(overflowX);

        //when popover overflow on left side
        popover.show(overflowX,standardY,'');
        expect(popover.scope.x).toBeLessThan(overflowY);
        expect(popover.scope.y).toBe(standardY + MOUSE_POPOVER_DELTA);

        //when popover does not overflow
        popover.show(10,10,'');
        expect(popover.scope.x).toBe(standardX + MOUSE_POPOVER_DELTA);
        expect(popover.scope.y).toBe(standardY + MOUSE_POPOVER_DELTA);

    });

    it('should be appended to body if no anchor is passed',function() {
        expect(popover.$popover.parent().prop('tagName')).toBe('BODY');
    });

    it('should have the data inserted correctly in it',function(){
        var data = {
            'key1' : 'value1',
            'key2' : 'value2'
        };
        popover.show(10,10,data);

        angular.forEach(data, function(value,key) {
            key = key + ":";
            expect($(document).find('span:contains("'+key+'")').length).toBe(1);
            expect($(document).find('span:contains("'+value+'")').length).toBe(1);
        });

        // when popover is emptied
        popover.hide();

        // content is hidden
        angular.forEach(data, function(value,key) {
            key = key + ":";
            expect($(document).find('span:contains("'+key+'")').length).toBe(0);
            expect($(document).find('span:contains("'+value+'")').length).toBe(0);
        });
    });

});
