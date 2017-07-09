/**
 * Copyright: ThoughtSpot Inc. 2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for sage-dropdown
 */
'use strict';

var ITEM_CONTAINER_SELECTOR = '.bk-multi-section-item-container';
var LOADING_INDICATOR_SELECTOR = '.bk-repeat-loading-indicator';
var VIEW_ALL_SELECTOR = '.bk-repeat-view-all-label';
var PAGING_SIZE = 5;


describe('Expandable section spec', function () {
    var $rootScope,
        $compile,
        actionSpy,
        ctrl,
        deferred,
        expandSpy,
        items,
        scope,
        directiveElement,
        MultiExpandableSectionComponent,
        sectionClickSpies;

    var basePathSection = getBasePath(document.currentScript.src) + 'navigable-expandable-section';

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

        System.import(basePathSection).then(function(module){
            inject(function ($injector, $q) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                deferred = $q.defer();
            });
            MultiExpandableSectionComponent = module.default;
            sectionClickSpies =  [
                jasmine.createSpy('section 0'),
                jasmine.createSpy('section 1'),
                jasmine.createSpy('section 2')
            ];

            expandSpy = jasmine.createSpy('actionSpy');

            items = generateSectionItems('a', 'as', 5);
            ctrl = new MultiExpandableSectionComponent(
                    items,
                    'title',
                    _.noop,
                    'src/common/widgets/multi-sections-navigable-list/base-item-template.html',
                    function() {
                        return deferred.promise.then(function(){
                            console.log(items);
                            return items
                        });
                    }
                );
            directiveElement = getCompiledElement();
            done();
        }).catch(function(error) {
            done.fail(error);
        });
    });

    afterEach(function(done) {
        System.delete(
            System.normalizeSync(basePathSection));
        //Hack(Ashish): Does not work on Chrome 52 without this, some issue
        //with Chrome/systemJS, https://github.com/systemjs/systemjs/issues/1372.
        setTimeout(done, 0);
    });

    function getCompiledElement() {
        scope = $rootScope.$new();
        scope.ctrl = ctrl;
        var element = angular.element('<bk-multi-expandable-section bk-ctrl="ctrl">' +
            '</bk-multi-expandable-section>');
        var compiledElement = $compile(element)(scope);
        scope.$digest();
        return compiledElement;
    }

    it('should show only the desired amount of items', function(){
        expect(directiveElement.find(ITEM_CONTAINER_SELECTOR).length).toBe(PAGING_SIZE);
    });

    it('should show all items, once button is clicked', function(){
        directiveElement.find(VIEW_ALL_SELECTOR).click();
        deferred.resolve();
        scope.$digest();
        expect(directiveElement.find(ITEM_CONTAINER_SELECTOR).length).toBe(items.length);
    });

    it('should show promise while promise is not resolved', function(){
        directiveElement.find(VIEW_ALL_SELECTOR).click();
        scope.$digest();
        expect(directiveElement.find(LOADING_INDICATOR_SELECTOR).length).toBe(1);
        deferred.resolve();
        scope.$digest();
        expect(directiveElement.find(LOADING_INDICATOR_SELECTOR).length).toBe(0);
        // loading indicator should be away
    });
    it('should reset its state', function() {
        directiveElement.find(VIEW_ALL_SELECTOR).click();
        deferred.resolve();
        scope.$digest();
        ctrl.resetState();
        scope.$digest();
        expect(directiveElement.find(ITEM_CONTAINER_SELECTOR).length).toBe(PAGING_SIZE);
    });
});
