/**
 * Copyright: ThoughtSpot Inc. 2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for sage-dropdown
 */
'use strict';


var SECTION_SELECTOR = '.bk-section-container';
var ITEM_SELECTOR = '.bk-simple-item';
var TITLE_SELECTOR = ITEM_SELECTOR + ' .bk-title';
var SUBTITLE_SELECTOR = ITEM_SELECTOR + ' .bk-subtitle';
var ITEM_CONTAINER = '.bk-multi-section-item-container';
var HIGHLIGHT_CLASS = 'bk-active';


describe('Multi section dropdown spec', function () {
    var $rootScope,
        $compile,
        actionSpy,
        actionText,
        ctrl,
        scope,
        directiveElement,
        MultiSectionDropdown,
        Section,
        sections,
        sectionClickSpies;

    var basePathDropdown = getBasePath(document.currentScript.src) + 'multi-section-navigable-list';
    var basePathSection = getBasePath(document.currentScript.src) + 'navigable-section';

    function generateSectionItems(titlePrefix, subTitlePrefix, numberOfItems) {
        var sectionItems = [];
        for (var i = 0; i < numberOfItems; i++) {
            sectionItems.push({
                title: titlePrefix + i,
                subTitle: subTitlePrefix + i
            });
        }
        return sectionItems;
    }

    beforeEach(function (done) {

        module('blink.app');

        Promise.all([
            System.import(basePathDropdown),
            System.import(basePathSection)
        ]).then(function(modules){
            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
            });
            MultiSectionDropdown = modules[0].MultiSectionNavListComponent;
            Section = modules[1].NavigableSectionComponent;
            sectionClickSpies =  [
                jasmine.createSpy('section 0'),
                jasmine.createSpy('section 1'),
                jasmine.createSpy('section 2')
            ];
            sections = [
                generateSectionItems('a', 'as', 3),
                generateSectionItems('b', 'bs', 2),
                generateSectionItems('c', 'cs', 1)
            ].map(function(sectionItem, i) {

                return new Section(
                    sectionItem,
                    'title' + i,
                    sectionClickSpies[i]
                    );
            });

            actionSpy = jasmine.createSpy('actionSpy');
            actionText = 'actionText';

            ctrl = new MultiSectionDropdown(
                sections,
                false,
                [
                    {
                        text: actionText,
                        onClick: actionSpy
                    }
                ]
            );
            directiveElement = getCompiledElement();
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    afterEach(function(done) {
        System.delete(
            System.normalizeSync(basePathDropdown));
        System.delete(
            System.normalizeSync(basePathSection));
        //Hack(Ashish): Does not work on Chrome 52 without this, some issue
        //with Chrome/systemJS, https://github.com/systemjs/systemjs/issues/1372.
        setTimeout(done, 0);
    });

    function getCompiledElement() {
        scope = $rootScope.$new();
        scope.ctrl = ctrl;
        var element = angular.element('<bk-multi-section-nav-list bk-ctrl="ctrl">' +
            '</bk-multi-section-nav-list>');
        var compiledElement = $compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    it('should display three sections', function(){
        expect(directiveElement.find(SECTION_SELECTOR).length).toBe(3);
    });

    it('should display items in section', function(){
        expect(directiveElement.find(ITEM_SELECTOR).length).toBe(6);
    });

    it('should display correct title', function(){
        var title = ['a0', 'a1', 'a2', 'b0', 'b1', 'c0'];

        title.forEach(function(text, i) {
            expect(directiveElement.find(TITLE_SELECTOR + ':eq(' + i + ')').text().trim()).toBe(text);
        });
    });

    it('should display correct subtitle', function(){
        var subTitle = ['as0', 'as1', 'as2', 'bs0', 'bs1', 'cs0'];
        subTitle.forEach(function(text, i) {
            expect(directiveElement.find(SUBTITLE_SELECTOR + ':eq(' + i + ')').text().trim()).toBe(text);
        });
    });

    it('should move correctly in sections, going up', function(){
        //  triggerKeydown(directiveElement, 38) this does not work ?
        ctrl.keyPressed({keyCode:38});
        expect(ctrl.getHighlightedSectionIndex()).toBe(2);
        expect(ctrl.getHighlightedItemIndex()).toBe(0);
        ctrl.keyPressed({keyCode:38});
        expect(ctrl.getHighlightedSectionIndex()).toBe(1);
        expect(ctrl.getHighlightedItemIndex()).toBe(1);
        ctrl.keyPressed({keyCode:40});
        expect(ctrl.getHighlightedSectionIndex()).toBe(2);
        expect(ctrl.getHighlightedItemIndex()).toBe(0);
        ctrl.keyPressed({keyCode:40});
        expect(ctrl.getHighlightedSectionIndex()).toBe(0);
        expect(ctrl.getHighlightedItemIndex()).toBe(0);
    });
    it('should move correctly in sections, going down', function(){
        //  triggerKeydown(directiveElement, 38) this does not work ?
        ctrl.keyPressed({keyCode:40});
        expect(ctrl.getHighlightedSectionIndex()).toBe(0);
        expect(ctrl.getHighlightedItemIndex()).toBe(0);
        ctrl.keyPressed({keyCode:40});
        expect(ctrl.getHighlightedSectionIndex()).toBe(0);
        expect(ctrl.getHighlightedItemIndex()).toBe(1);
        ctrl.keyPressed({keyCode:40});
        expect(ctrl.getHighlightedSectionIndex()).toBe(0);
        expect(ctrl.getHighlightedItemIndex()).toBe(2);
        ctrl.keyPressed({keyCode:40});
        expect(ctrl.getHighlightedSectionIndex()).toBe(1);
        expect(ctrl.getHighlightedItemIndex()).toBe(0);
    });

    it('should highlight currently selected item', function() {
        ctrl.keyPressed({keyCode:38});
        scope.$digest();
        expect(directiveElement.find(SECTION_SELECTOR + ':eq(0)')
            .find(ITEM_CONTAINER  + ':eq(0)'))
            .not.toHaveClass(HIGHLIGHT_CLASS);
        expect(directiveElement.find(SECTION_SELECTOR + ':eq(2)')
            .find(ITEM_CONTAINER  + ':eq(0)'))
            .toHaveClass(HIGHLIGHT_CLASS);
    });

    it('should highlight currently selected item', function() {
        ctrl.keyPressed({keyCode:40});
        scope.$digest();
        expect(directiveElement.find(SECTION_SELECTOR + ':eq(0)')
            .find(ITEM_CONTAINER  + ':eq(0)'))
            .toHaveClass(HIGHLIGHT_CLASS);
        ctrl.keyPressed({keyCode:40});
        scope.$digest();
        expect(directiveElement.find(SECTION_SELECTOR + ':eq(0)')
            .find(ITEM_CONTAINER  + ':eq(1)'))
            .toHaveClass(HIGHLIGHT_CLASS);
        expect(directiveElement.find(SECTION_SELECTOR + ':eq(0)')
            .find(ITEM_CONTAINER  + ':eq(0)'))
            .not.toHaveClass(HIGHLIGHT_CLASS);
    });

    it('click handler should be called', function() {

        var passedArguments = [0, 1, 2, 0];
        passedArguments.forEach(function(arg, index){
            directiveElement.find(ITEM_CONTAINER + ':eq(' + index +')').click();
            scope.$digest();
            expect(sectionClickSpies[0]).toHaveBeenCalledWith(arg);
        });
    });

    it('click handler should be called when pressing return', function() {
        ctrl.keyPressed({keyCode:40});
        ctrl.keyPressed({keyCode:40});
        ctrl.keyPressed({keyCode:40});
        ctrl.keyPressed({keyCode:40});
        ctrl.keyPressed({keyCode:40});
        ctrl.keyPressed({keyCode:13});
        expect(sectionClickSpies[1]).toHaveBeenCalledWith(1);
    });

    /*
    it('if nothing is selected, call click handler with first item', function() {

    })
    */
});
