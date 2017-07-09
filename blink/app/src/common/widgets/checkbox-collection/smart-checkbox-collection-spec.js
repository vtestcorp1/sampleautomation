/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Spec for SmartCheckboxCollectionController.
 */

'use strict';

describe('Smart checkbox collection spec', function() {
    var $rootScope = null,
        $compile,
        $q,
        SmartCheckboxCollectionController,
        SmartCheckboxCollectionConfig,
        template;

    var moduleName = 'src/common/widgets/checkbox-collection/smart-checkbox-collection-controller';
    var configModuleName = 'src/common/widgets/checkbox-collection/' +
        'smart-checkbox-collection-config';

    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());

    /* eslint camelcase: 1 */
    beforeEach(function(done) {
        Promise.all([
            System.import(moduleName),
            System.import(configModuleName)
        ])
            .then(function(modules) {
                inject(function (_$rootScope_,
                                 _$compile_,
                                 _$q_) {
                    $rootScope = _$rootScope_;
                    $compile = _$compile_;
                    SmartCheckboxCollectionController = modules[0].SmartCheckboxCollectionController;
                    SmartCheckboxCollectionConfig = modules[1].SmartCheckboxCollectionConfig;
                    $q = _$q_;
                    template = '<blink-smart-checkbox-collection bk-ctrl="ctrl"></blink-smart-checkbox-collection>';
                });
                done();
            }, function (error) {
                console.log('Errored', error.originalErr);
            });
    });

    afterEach(function(done) {
        System.delete(
            System.normalizeSync(moduleName));
        //Hack(Ashish): Does not work on Chrome 52 without this, some issue
        //with Chrome/systemJS, https://github.com/systemjs/systemjs/issues/1372.
        setTimeout(done, 0);
    });
    it('should init with default state', function () {
        var checkboxCollectionGetter = function () {
            return $q.when({checkboxItems: [
                {title: 'a', isChecked: true},
                {title: 'b', isChecked: false}
            ]});
        };

        var readOnlyCheckboxCollectionGetter = function () {
            return $q.when({checkboxItems: []});
        };

        var onChange = jasmine.createSpy();

        var smartCheckboxCollectionCtrl = new SmartCheckboxCollectionController(
            checkboxCollectionGetter,
            readOnlyCheckboxCollectionGetter,
            onChange
        );

        var elm = angular.element(template);
        var scope = $rootScope.$new();
        scope.ctrl = smartCheckboxCollectionCtrl;
        $compile(elm)(scope);
        scope.$digest();

        var $selectedCheckboxCollection = elm.find('.bk-selected-checkboxes');
        expect($selectedCheckboxCollection.length).toBe(1);

        var $selectedCheckbox = $selectedCheckboxCollection.find('.bk-checkbox');
        expect($selectedCheckbox.length).toBe(1);
        $selectedCheckbox.click();
        expect(onChange).toHaveBeenCalledWith('a', false, 0);

        var $unselectedCheckboxCollection = elm.find('.bk-unselected-checkboxes');
        expect($unselectedCheckboxCollection.length).toBe(1);

        var $unselectedCheckbox = $unselectedCheckboxCollection.find('.bk-checkbox');
        expect($unselectedCheckbox.length).toBe(1);
        $unselectedCheckbox.click();
        expect(onChange).toHaveBeenCalledWith('b', true, 0);
    });

    it('should init with sorted lists', function () {
        var checkboxCollectionGetter = function () {
            return $q.when({checkboxItems: [
                {title: 'd', isChecked: true},
                {title: 'c', isChecked: true},
                {title: 'b', isChecked: false},
                {title: 'a', isChecked: false}
            ]});
        };

        var readOnlyCheckboxCollectionGetter = function () {
            return $q.when({checkboxItems: []});
        };

        var onChange = jasmine.createSpy();

        var smartCheckboxCollectionCtrl = new SmartCheckboxCollectionController(
            checkboxCollectionGetter,
            readOnlyCheckboxCollectionGetter,
            onChange
        );

        var elm = angular.element(template);
        var scope = $rootScope.$new();
        scope.ctrl = smartCheckboxCollectionCtrl;
        $compile(elm)(scope);
        scope.$digest();

        var $selectedCheckboxCollection = elm.find('.bk-selected-checkboxes');
        expect($selectedCheckboxCollection.length).toBe(1);

        var $selectedCheckboxTitles = $selectedCheckboxCollection.find('.bk-checkbox-title');
        expect($selectedCheckboxTitles.length).toBe(2);
        expect($($selectedCheckboxTitles[0]).text()).toBe('c');
        expect($($selectedCheckboxTitles[1]).text()).toBe('d');

        var $unselectedCheckboxCollection = elm.find('.bk-unselected-checkboxes');
        expect($unselectedCheckboxCollection.length).toBe(1);

        var $unselectedCheckboxTitles = $unselectedCheckboxCollection.find('.bk-checkbox-title');
        expect($unselectedCheckboxTitles.length).toBe(2);
        expect($($unselectedCheckboxTitles[0]).text()).toBe('a');
        expect($($unselectedCheckboxTitles[1]).text()).toBe('b');

    });

    it('should display correct search state', function () {
        // NOTE: This test also tests the following.
        // - exact match is displayed on the top.
        // - the onChange functions are called without the <b> tag.
        var checkboxCollectionGetter = function (searchText) {
            if (searchText === 'b') {
                return $q.when({checkboxItems: [
                    {title: 'ab', isChecked: false},
                    {title: 'b', isChecked: true}
                ]});
            }

            return $q.when({checkboxItems: [
                {title: 'a', isChecked: true},
                {title: 'ab', isChecked: false},
                {title: 'b', isChecked: false}
            ]});
        };

        var readOnlyCheckboxCollectionGetter = function () {
            return $q.when({checkboxItems: []});
        };

        var onChange = jasmine.createSpy();

        var smartCheckboxCollectionCtrl = new SmartCheckboxCollectionController(
            checkboxCollectionGetter,
            readOnlyCheckboxCollectionGetter,
            onChange
        );

        var elm = angular.element(template);
        var scope = $rootScope.$new();
        scope.ctrl = smartCheckboxCollectionCtrl;
        $compile(elm)(scope);
        scope.$digest();

        smartCheckboxCollectionCtrl.checkboxFilterSearchText = 'b';
        smartCheckboxCollectionCtrl.handleSearchTextChange();
        scope.$digest();

        var $searchCheckboxCollection = elm.find('.bk-search-checkboxes');
        expect($searchCheckboxCollection.length).toBe(1);

        var $searchedCheckbox = $searchCheckboxCollection.find('.bk-checkbox-container');
        expect($searchedCheckbox.length).toBe(2);

        var $firstCheckbox = $searchCheckboxCollection.find($searchedCheckbox[0]);
        var checkboxTitle = $firstCheckbox.find('.bk-checkbox-title');
        expect(checkboxTitle.text()).toBe('b');
        var checkbox = $firstCheckbox.find('.bk-checkbox');
        expect(checkbox).toHaveClass('bk-checked');
        expect(checkboxTitle.html()).toBe('<b>b</b>');

        var $secondCheckbox = $searchCheckboxCollection.find($searchedCheckbox[1]);
        checkboxTitle = $secondCheckbox.find('.bk-checkbox-title');
        expect(checkboxTitle.text()).toBe('ab');
        checkbox = $secondCheckbox.find('.bk-checkbox');
        expect(checkbox).not.toHaveClass('bk-checked');
        expect(checkboxTitle.html()).toBe('a<b>b</b>');

        $secondCheckbox.click();
        expect(onChange).toHaveBeenCalledWith('ab', true, 1);
    });

    it('should clear selected items', function () {
        // NOTE: This tests:
        // onChange is called for all the selected items.
        // the order of items is maintained.
        var checkboxCollectionGetter = function () {
            return $q.when({checkboxItems: [
                {title: 'a', isChecked: true},
                {title: 'b', isChecked: false},
                {title: 'c', isChecked: true}
            ]});
        };

        var readOnlyCheckboxCollectionGetter = function () {
            return $q.when({checkboxItems: []});
        };

        var onChange = jasmine.createSpy();

        var smartCheckboxCollectionCtrl = new SmartCheckboxCollectionController(
            checkboxCollectionGetter,
            readOnlyCheckboxCollectionGetter,
            onChange
        );

        var elm = angular.element(template);
        var scope = $rootScope.$new();
        scope.ctrl = smartCheckboxCollectionCtrl;
        $compile(elm)(scope);
        scope.$digest();

        elm.find('.bk-clear-selected-options').click();
        expect(onChange).toHaveBeenCalledWith('a', false, void 0);
        expect(onChange).toHaveBeenCalledWith('c', false, void 0);

        var $selectedCheckboxCollection = elm.find('.bk-selected-checkboxes .bk-checkbox');
        expect($selectedCheckboxCollection.length).toBe(2);

        var $unselectedCheckboxCollection = elm.find('.bk-unselected-checkboxes .bk-checkbox');
        expect($unselectedCheckboxCollection.length).toBe(1);

        expect(elm.find('.bk-checkbox').length).toBe(3);
        expect(elm.find('.bk-checkbox.bk-checked').length).toBe(0);
    });

    it('should select all items', function () {
        // NOTE: This tests:
        // onChange is called for all the selected items.
        // the order of items is maintained.
        var checkboxCollectionGetter = function () {
            return $q.when({checkboxItems: [
                {title: 'a', isChecked: false},
                {title: 'b', isChecked: true},
                {title: 'c', isChecked: false}
            ]});
        };

        var readOnlyCheckboxCollectionGetter = function () {
            return $q.when({checkboxItems: []});
        };

        var onChange = jasmine.createSpy();

        var smartCheckboxCollectionCtrl = new SmartCheckboxCollectionController(
            checkboxCollectionGetter,
            readOnlyCheckboxCollectionGetter,
            onChange
        );

        var elm = angular.element(template);
        var scope = $rootScope.$new();
        scope.ctrl = smartCheckboxCollectionCtrl;
        $compile(elm)(scope);
        scope.$digest();

        elm.find('.bk-select-all-options').click();
        expect(onChange).toHaveBeenCalledWith('a', true, void 0);
        expect(onChange).toHaveBeenCalledWith('c', true, void 0);

        var $selectedCheckboxCollection = elm.find('.bk-selected-checkboxes .bk-checkbox');
        expect($selectedCheckboxCollection.length).toBe(1);

        var $unselectedCheckboxCollection = elm.find('.bk-unselected-checkboxes .bk-checkbox');
        expect($unselectedCheckboxCollection.length).toBe(2);

        expect(elm.find('.bk-checkbox').length).toBe(3);
        expect(elm.find('.bk-checkbox.bk-checked').length).toBe(3);
    });

    it('should show partial list and UI message on large lists', function(){
        var elm = angular.element(template);
        var scope = $rootScope.$new();

        var smartCheckboxCollectionCtrl = generateSmartBoxController();
        scope.ctrl = smartCheckboxCollectionCtrl;
        $compile(elm)(scope);
        scope.$digest();

        var $selectedCheckboxCollection = elm.find('.bk-selected-checkboxes .bk-checkbox');
        expect($selectedCheckboxCollection.length).toBe(15);
        expect(elm.find('.bk-search-selected-items-msg').length).toBe(1);

        var $unselectedCheckboxCollection = elm.find('.bk-unselected-checkboxes .bk-checkbox');
        expect($unselectedCheckboxCollection.length).toBe(100);
        expect(elm.find('.bk-search-unselected-items-msg').length).toBe(1);

        smartCheckboxCollectionCtrl.checkboxFilterSearchText = 'title';
        smartCheckboxCollectionCtrl.handleSearchTextChange();
        scope.$digest();

        var $searchCheckboxCollection = elm.find('.bk-search-checkboxes .bk-checkbox');
        expect($searchCheckboxCollection.length).toBe(100);
        expect(elm.find('.bk-refine-search-msg').length).toBe(1);
    });


    it('should show cleared list after clicking on clear items', function() {
        var elm = angular.element(template);
        var scope = $rootScope.$new();
        scope.ctrl = generateSmartBoxController();
        $compile(elm)(scope);
        scope.$digest();
        elm.find('.bk-clear-selected-options').click();
        scope.$digest();

        var $selectedCheckboxCollection = elm.find('.bk-selected-checkboxes .bk-checkbox');
        expect($selectedCheckboxCollection.length).toBe(15);
        var $unselectedCheckboxCollection = elm.find('.bk-unselected-checkboxes .bk-checkbox');
        expect($unselectedCheckboxCollection.length).toBe(100);

        expect(elm.find('.bk-checkbox.bk-checked').length).toBe(0);
    });

    it('should show selected list after clicking on select all', function() {
        var elm = angular.element(template);
        var scope = $rootScope.$new();
        scope.ctrl = generateSmartBoxController();
        $compile(elm)(scope);
        scope.$digest();
        elm.find('.bk-select-all-options').click();
        scope.$digest();

        var $selectedCheckboxCollection = elm.find('.bk-selected-checkboxes .bk-checkbox');
        expect($selectedCheckboxCollection.length).toBe(15);
        var $unselectedCheckboxCollection = elm.find('.bk-unselected-checkboxes .bk-checkbox');
        expect($unselectedCheckboxCollection.length).toBe(100);

        expect(elm.find('.bk-checkbox.bk-checked').length).toBe(115);
    });

    it('should hide select/clear all when hideBulkActions is set', function() {
        var elm = angular.element(template);
        var scope = $rootScope.$new();
        var config = new SmartCheckboxCollectionConfig();
        config.hideBulkActions = true;
        scope.ctrl = generateSmartBoxController(config);
        $compile(elm)(scope);
        scope.$digest();
        expect(elm.find('.bk-select-all-options').length).toBe(0);
        expect(elm.find('.bk-clear-selected-options').length).toBe(0);
    });

    function generateSmartBoxController(config) {
        var checkboxCollectionGetter = function () {
            var items = [];
            for (var i=0; i<300; i++) {
                var isSelected = i % 2 === 0;
                items.push({
                    title: 'title' + i,
                    isChecked: isSelected
                });
            }
            return $q.when({checkboxItems: items});
        };

        var readOnlyCheckboxCollectionGetter = function () {
            return $q.when({checkboxItems: []});
        };

        var onChange = jasmine.createSpy();

        var smartCheckboxCollectionCtrl = new SmartCheckboxCollectionController(
            checkboxCollectionGetter,
            readOnlyCheckboxCollectionGetter,
            onChange,
            config
        );

        return smartCheckboxCollectionCtrl;
    }
});
