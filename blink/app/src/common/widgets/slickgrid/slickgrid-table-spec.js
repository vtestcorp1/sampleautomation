/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for slickgrid table wrapper directive.
 */

'use strict';

describe('SlickGrid Table Controller', function () {
    var slickCtrl, mockCompile, testScope, testConfig, testModel, $testContainer;
    beforeEach(module('blink.app'));
    beforeEach(inject(function ($controller, $rootScope, angularUtil) {
        testScope = $rootScope.$new();
        mockCompile = jasmine.createSpy().and.returnValue(angular.noop);
        angularUtil.getCompiledElement = function(tpl, scope){
            return mockCompile(tpl)(scope);
        };
        slickCtrl = $controller('SlickGridTableController', {
            $scope: testScope,
            angularUtil: angularUtil
        });

        testConfig = {};
        testModel = {
            columns: [
                {id: 'f1', field: 'f1', name: 'f1'},
                {id: 'f2', field: 'f2', name: 'f2'}
            ],
            data: [
                {f1: 'val11', f2: 'val42'},
                {f1: 'val11', f2: 'val421'},
                {f1: 'val21', f2: 'val32'},
                {f1: 'val31', f2: 'val22'},
                {f1: 'val41', f2: 'val12'}
            ]
        };

        $testContainer = $('<div></div>');
    }));

    it('should initialize correctly', function () {
        // Verify that the scope properties are initialized to reasonable defaults.
        expect(testScope.grid).toBeNull();
        expect(Object.keys(testScope.columnModels).length).toBe(0);

        // Verify that the container has nothing before slick init.
        expect($testContainer.children().length).toBe(0);

        // Init slick.
        testScope.init(testConfig, testModel, $testContainer);
        // Verify that scope properties have changed after slick init.
        expect(testScope.grid).not.toBeNull();
        expect($testContainer.children().length).toBeGreaterThan(0);
        // Since the config did not specify editable headers, we don't create column header models.
        expect(Object.keys(testScope.columnModels).length).toBe(0);

        var grid = testScope.grid;
        expect(grid.getColumns().length).toBe(2);
        var totalColumnWidth = 0;
        grid.getColumns().each(function (col, i) {
            expect(col.sortable).toBeTruthy();
            expect(col.minWidth).toBeGreaterThan(0);
            expect(col.width).toBeGreaterThan(0);
            expect(col.maxWidth).toBeGreaterThan(0);

            var $colHeader = $(grid.getHeaderColumns()[i]);
            expect($colHeader.hasClass('slick-editable-header-column')).toBeFalsy();
            expect($colHeader.find('.slick-editable-title-container').length).toBe(0);
            expect($colHeader.width()).toBe(col.width);
            // Since the config is not specified to make headers editable, the width of column name is not explicitly
            // set but inherited.
            expect($colHeader.find('.slick-column-name').width()).toBe(0);

            totalColumnWidth += col.width;
        });
        expect(grid.optimumTableWidth).toBeGreaterThan(totalColumnWidth);

        expect($testContainer.find('.slick-header-columns').length).toBeGreaterThan(0);
        expect(mockCompile).toHaveBeenCalledWith($testContainer.find('.slick-header-columns'));
    });

    it('should setup editable headers when configured', function () {
        angular.extend(testConfig, {
            editableColumnHeaders: true
        });

        expect(Object.keys(testScope.columnModels).length).toBe(0);

        // Init slick.
        testScope.init(testConfig, testModel, $testContainer);
        expect(Object.keys(testScope.columnModels).length).toBe(2);

        var grid = testScope.grid;
        grid.getColumns().each(function (col, i) {
            var $colHeader = $(grid.getHeaderColumns()[i]);
            expect($colHeader.hasClass('slick-editable-header-column')).toBeTruthy();
            expect($colHeader.find('.slick-editable-title-container').length).toBe(1);
            expect($colHeader.width()).toBe(col.width);
            // Since the config is not specified to make headers editable, the width of column name is not explicitly
            // set but inherited.
            expect($colHeader.find('.slick-column-name').width()).toBeLessThan(col.width);
        });
    });

    describe('event handlers', function () {
        var grid;
        beforeEach(function () {
            testScope.init(testConfig, testModel, $testContainer);
            grid = testScope.grid;
        });

        it('should sort data in ascending order of the second column', function () {
            // Verify the initial ordering of the data.
            expect(grid.getData()[0]).toEqual({f1: 'val11', f2: 'val42'});
            grid.sortTable(null, {
                sortCols: [{
                    sortCol: grid.getColumns()[1],
                    sortAsc: true
                }]
            });
            expect(grid.getData()[0]).toEqual({f1: 'val41', f2: 'val12'});
        });

        it('should sort data in descending order of the first column', function () {
            // Verify the initial ordering of the data.
            expect(grid.getData()[0]).toEqual({f1: 'val11', f2: 'val42'});
            grid.sortTable(null, {
                sortCols: [{
                    sortCol: grid.getColumns()[0],
                    sortAsc: false
                }]
            });
            expect(grid.getData()[0]).toEqual({f1: 'val41', f2: 'val12'});
            // As a result of stable sorting, we verify that the row {f1: 'val11', f2: 'val42'} appears before
            // {f1: 'val11', f2: 'val421'} (as in the original data).
            expect(grid.getData()[3]).toEqual({f1: 'val11', f2: 'val42'});
            expect(grid.getData()[4]).toEqual({f1: 'val11', f2: 'val421'});
        });

        it('should disable sort', function () {
            expect(grid.getColumns()[1].sortable).toBeTruthy();
            grid.disableSort(grid.getColumns()[1].id);
            expect(grid.getColumns()[1].sortable).toBeFalsy();
        });
    });

    // TODO(vibhor): Write tests for editable headers model update mechanisms.
});
