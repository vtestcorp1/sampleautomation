/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Unit tests for column menu component button and column menu components.
 */

'use strict';

describe('ColumnMenu', function(){

    var $scope, elem, _mockColumnMenuUtil;

    function mockColumnMenuUtil() {
        _mockColumnMenuUtil = jasmine.createSpyObj('columnMenuUtil', ['hasFiltersForColumn', 'hasMetricsForColumn']);
        _mockColumnMenuUtil.hasFiltersForColumn.and.returnValue(true);
        _mockColumnMenuUtil.hasMetricsForColumn.and.returnValue(true);

        module(function ($provide) {
            $provide.value('columnMenuUtil', _mockColumnMenuUtil);
        });
    }

    describe('button', function(){
        beforeEach(function() {
            module('blink.app');

            mockColumnMenuUtil();

            inject(function($rootScope, $compile) {
                $scope = $rootScope.$new();
                $scope.tableModel = $scope.columnModel = {};
                $scope.columnModel.isEffectivelyNumeric = function () {
                    return true;
                };
                $scope.isEditable = true;

                var template = '<column-menu-button table-model="tableModel"' +
                    'is-editable="isEditable" column-model="columnModel"></column-menu-button>';
                elem = $compile(angular.element(template))($scope);
                $('body').append(elem);

                //directive's  scope is the child of _$scope
                $scope = elem.scope();

                $rootScope.$digest();
            });
        });

        afterEach(function(){
            $('body').empty();
        });

        it('should create column menu with correct type', function () {
            expect($('body').find('.bk-style-icon-table-column-options').length).toBe(1);
        });
    });

    describe('body', function(){
        beforeEach(function() {
            module('blink.app');

            mockColumnMenuUtil();

            inject(function($rootScope, $compile) {
                $scope = $rootScope.$new();

                elem = $compile(angular.element('<column-menu is-editable="isEditable" column-model="columnModel" table-model="tableModel"></column-menu>'))($scope);
                $('body').append(elem);

                // directive's scope is the child of _$scope
                $scope = elem.scope();
                $scope.isEditable = true;
                $scope.columnModel = {};
                $scope.columnModel.isEffectivelyNumeric = function () {
                    return true;
                };
                $scope.tableModel = {};
                $rootScope.$digest();
            });
        });

        afterEach(function(){
            $('body').empty();
        });

        it('should show filter and metrics tabs', function(){
            expect(elem.find(".bk-dropdown-item:contains('Filters')").length).toBe(1);
            expect(elem.find(".bk-dropdown-item:contains('Conditional Formatting')").length).toBe(1);
        });

        it('should hide filter tab when not available', function(){
            _mockColumnMenuUtil.hasFiltersForColumn.and.returnValue(false);
            $scope.isEditable = false;
            $scope.$digest();
            expect(elem.find(".bk-dropdown-item:contains('Filters')").length).toBe(0);

            _mockColumnMenuUtil.hasFiltersForColumn.and.returnValue(false);
            $scope.isEditable = true;
            $scope.$digest();
            expect(elem.find(".bk-dropdown-item:contains('Filters')").length).toBe(1);

            _mockColumnMenuUtil.hasFiltersForColumn.and.returnValue(true);
            $scope.isEditable = false;
            $scope.$digest();
            expect(elem.find(".bk-dropdown-item:contains('Filters')").length).toBe(1);

            _mockColumnMenuUtil.hasFiltersForColumn.and.returnValue(true);
            $scope.isEditable = true;
            $scope.$digest();
            expect(elem.find(".bk-dropdown-item:contains('Filters')").length).toBe(1);
        });

        it('should hide metrics tab when not available', function(){
            expect(elem.find(".bk-dropdown-item:contains('Conditional Formatting')").length).toBe(1);
            $scope.isEditable = false;
            _mockColumnMenuUtil.hasMetricsForColumn.and.returnValue(false);
            $scope.$digest();
            expect(elem.find(".bk-dropdown-item:contains('Conditional Formatting')").length).toBe(0);

            $scope.isEditable = true;
            $scope.$digest();
            expect(elem.find(".bk-dropdown-item:contains('Conditional Formatting')").length).toBe(1);

            _mockColumnMenuUtil.hasMetricsForColumn.and.returnValue(true);
            $scope.isEditable = false;
            $scope.$digest();
            expect(elem.find(".bk-dropdown-item:contains('Conditional Formatting')").length).toBe(1);
        });
    });

});

