/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Spec for schema-navigation directive
 *
 *
 */

'use strict';

describe('Schema-navigation directive', function() {
    /* eslint camelcase: 1 */
    var $compile,
        $rootScope,
        $scope;
    var testedCtrl;
    var compiledElement;
    var listItems;
    var items = [
        {
            id: 'a',
            getName: function() { return 'a'; }
        },
        {
            id: 'b',
            getName: function() { return 'b'; }
        }
    ];

    var listElementSelector = '.content li.schema-navigation-row';


    var templates = {
        "navigation-list": '"<navigation-list style="height:400px" bk-ctrl="ctrl"/>"'
    };

    beforeEach(function() {
        module('blink.app');

        inject(function(_$compile_, _$rootScope_, _$httpBackend_, SchemaNavigationListController) {
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            var ctrl = SchemaNavigationListController;

            listItems = items.map(function(item){
                return new ctrl.buildListItem(item, item.id);
            });
            testedCtrl = new ctrl(listItems, angular.noop, angular.noop, 'Tables');

            $scope = $rootScope.$new();
            $scope.ctrl = testedCtrl;
            compiledElement = $compile(templates['navigation-list'])($scope);
        });
    });


    it('displays the right title', function() {
        // Compile a piece of HTML containing the directive
        $scope.$digest();
        expect(compiledElement.find('h3').html()).toBe('Tables');
    });

    it('displays the right number of element', function() {
        // Compile a piece of HTML containing the directive
        $scope.$digest();
        expect(compiledElement.find(listElementSelector).length).toBe(items.length);

    });

    it('should trigger callback on click', function(){
        spyOn(testedCtrl, 'itemClicked');

        $scope.$digest();

        compiledElement.find(listElementSelector).first().click();
        $scope.$digest();

        expect(testedCtrl.itemClicked.calls.count()).toEqual(1);
        expect(testedCtrl.itemClicked).toHaveBeenCalledWith(listItems[0]);
    });

    it('should trigger callback on double-click', function(){
        spyOn(testedCtrl, 'itemDblClicked');

        $scope.$digest();

        compiledElement.find('.content li.schema-navigation-row').first().dblclick();
        $scope.$digest();

        expect(testedCtrl.itemDblClicked.calls.count()).toEqual(1);
        expect(testedCtrl.itemDblClicked).toHaveBeenCalledWith(listItems[0]);
    });

    it('should filter elements', function(){
        $scope.$digest();
        compiledElement.find('.bk-search-input').val('a').trigger('input');

        $scope.$digest();

        expect(compiledElement.find(listElementSelector).length).toBe(1);

        compiledElement.find('.bk-search-input').val('z').trigger('input');

        expect(compiledElement.find(listElementSelector).length).toBe(0);
    });
});
