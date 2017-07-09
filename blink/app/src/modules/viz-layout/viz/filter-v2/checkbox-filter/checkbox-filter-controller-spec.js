/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for checkbox filter implementation.
 */

'use strict';

describe('Checkbox filter spec', function() {
    var $scope = null,
        $compile,
        $q,
        mockFilterModel,
        elm,
        CheckboxFilterControllerV2,
        mockFilterUtil = {};

    function range(start, num) {
        var r = {};
        for (var i = start; i < start + num; ++i) {
            r[i] = false;
        }
        return r;
    }

    beforeEach(module('blink.app'));
    beforeEach(module(function ($provide) {
        $provide.value('filterUtil', mockFilterUtil);
    }));
    /* eslint camelcase: 1 */
    beforeEach(inject(function (_$rootScope_, _$compile_, _$q_, _CheckboxFilterControllerV2_) {
        /* eslint camelcase: 1 */
        $scope = _$rootScope_.$new();
        /* eslint camelcase: 1 */
        $compile = _$compile_;
        /* eslint camelcase: 1 */
        $q = _$q_;
        /* eslint camelcase: 1 */
        CheckboxFilterControllerV2 = _CheckboxFilterControllerV2_;

        elm = angular.element('<blink-checkbox-filter-v2 ctrl="ctrl"></blink-checkbox-filter-v2>');

        mockFilterModel = {
            nextBatchRequested: false,
            addedFilterValue: null,
            removedFilterValue: null,
            getColumn: function () {
                return {
                    getGuid: function () { return 'guid'; },
                    getSageOutputColumnId: function () { return this.getGuid(); },
                    convertValueToSageValue: function () {}
                };
            },
            getFilterItems: function () {
                return range(0, 1000);
            },
            hasNextBatch: function () {
                return false;
            },
            processNextBatch: function () {
                this.nextBatchRequested = true;
            },
            addSelectedFilterItem: function (value) {
                this.addedFilterValue = value;
            },
            getFilterValues: function () {
                if (!this.addedFilterValue) {
                    return [];
                }
                return [{key: this.addedFilterValue, selected: true}];
            },
            removeSelectedFilterItem: function (value) {
                this.removedFilterValue = value;
            },
            getSelectedFilterItems: function () { return {0: true}; },
            getSelectedFilterItemCount: function () { return 1; },
            getNumFilterItems: function () { return this.getFilterItems().length; },
            getContainingAnswerModel: function() {
                return {
                    getSageContext: function() {
                        return null;
                    },
                    getSageContextIndex: function() {
                        return -1;
                    }
                };
            }
        };

        mockFilterUtil.updateFilterModelWithValues = function() {
            return $q.when();
        };

        mockFilterUtil.filterColumnContainsValue = function() {
            return $q.when(false);
        };
    }));

    afterEach(function() {

    });

    it('should have initialized properties', function () {
        $scope.ctrl = new CheckboxFilterControllerV2(
            mockFilterModel,
            false //isReadOnly
        );

        expect($scope.ctrl.filterModel).toEqual(mockFilterModel);
        expect($scope.ctrl.isReadOnly).toBe(false);
        expect($scope.ctrl.searchText).toBe('');
        expect($scope.ctrl.showLoadingIndicator).toBe(false);
        expect($scope.ctrl.selectedSection).toBe('ALL');
        expect($scope.ctrl.selectedTabCheckboxCollectionCtrl).toBe(null);
        expect($scope.ctrl.allTabCheckboxCollectionCtrl).toBe(null);
        expect($scope.ctrl.allTabCheckboxCollection).toEqual([]);
        expect($scope.ctrl.selectedTabCheckboxCollection).toEqual([]);
        expect($scope.ctrl.selectedRows.selectedRows).toEqual({0: true});
    });

    it('should initialize checkbox filter from model', function () {
        $scope.ctrl = new CheckboxFilterControllerV2(
            mockFilterModel,
            false //isReadOnly
        );

        $compile(elm)($scope);
        $scope.$digest();

        var componentScope = $(elm).isolateScope();


        expect(componentScope.allTabCheckboxCollectionCtrl).not.toBe(null);
        expect(componentScope.allTabCheckboxCollection.length).toBe(1000);
    });

    it('should change section to "all" and "selected"', function () {
        $scope.ctrl = new CheckboxFilterControllerV2(
            mockFilterModel,
            false //isReadOnly
        );

        $compile(elm)($scope);
        $scope.$digest();

        var componentScope = $(elm).isolateScope();

        expect(componentScope.selectedSection).toBe('ALL');
        var selectedTabSelector = elm.find('.bk-section-control')[1];
        selectedTabSelector.click();
        expect(componentScope.selectedSection).toBe('SELECTED');
        var allTabSelector = elm.find('.bk-section-control')[0];
        allTabSelector.click();
        expect(componentScope.selectedSection).toBe('ALL');
    });

    it("should not change section for read-only filter", function(){
        $scope.ctrl = new CheckboxFilterControllerV2(
            mockFilterModel,
            true //isReadOnly
        );

        $compile(elm)($scope);
        $scope.$digest();

        var componentScope = $(elm).isolateScope();

        expect(componentScope.selectedSection).toBe('SELECTED');
        // Ensure section selector is hidden.
        expect(elm.find('.bk-section-control:hidden').length).toBe(2);
    });

    it('should check a filter value', function () {
        mockFilterModel.getFilterItems = function() {
            return range(0, 99);
        };

        $scope.ctrl = new CheckboxFilterControllerV2(
            mockFilterModel,
            false //isReadOnly
        );

        $compile(elm)($scope);
        $scope.$digest();

        var componentScope = $(elm).isolateScope();
        elm.find('.bk-checkbox-title:contains(\'1\')')[0].click();
        expect($scope.ctrl.getSelectedItems()).toEqual({
            0: true,
            1: true
        });
    });

    it('should uncheck a filter value', function () {
        $scope.ctrl = new CheckboxFilterControllerV2(
            mockFilterModel,
            false //isReadOnly
        );

        $compile(elm)($scope);
        $scope.$digest();

        var componentScope = $(elm).isolateScope();
        var selectedTabSelector = elm.find('.bk-section-control')[1];
        selectedTabSelector.click();
        elm.find('.bk-checkbox-title:contains(\'0\')')[0].click();
        expect($scope.ctrl.getSelectedItems()).toEqual({});
    });

    it('should bold search string in filter rows', function() {
        mockFilterModel.getFilterItems = function() {
            return {
                food: false
            };
        };
        $scope.ctrl = new CheckboxFilterControllerV2(
            mockFilterModel,
            false //isReadOnly
        );

        $scope.ctrl.searchText = 'foo';
        $scope.ctrl.setCheckboxItems();
        $scope.$digest();
        expect($scope.ctrl.allTabCheckboxCollection.length).toBe(1);
        expect($scope.ctrl.allTabCheckboxCollection[0].title).toBe('<b>foo</b>d');
    });

    it('should bold search string in filter rows for characters requiring regex escaping', function() {
        mockFilterModel.getFilterItems = function() {
            var x = '[{food}]';
            var items = {};
            items[x] = false;
            return items;
        };
        $scope.ctrl = new CheckboxFilterControllerV2(
            mockFilterModel,
            false //isReadOnly
        );

        $scope.ctrl.searchText = '[{foo';
        $scope.ctrl.setCheckboxItems();
        $scope.$digest();
        expect($scope.ctrl.allTabCheckboxCollection.length).toBe(1);
        expect($scope.ctrl.allTabCheckboxCollection[0].title).toBe('<b>[{foo</b>d}]');
    });
});

