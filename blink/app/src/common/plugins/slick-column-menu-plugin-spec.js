/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for slickgrid column menu plugin.
 */

'use strict';

describe('Slick.Custom.ColumnMenuPlugin', function () {
    var _grid, _columnMenuPlugin, _$table;
    function createSlickColumnSpec(id) {
        var mockColumn = jasmine.createSpyObj('Column', [ 'getId', 'isDateColumn', 'isGrowth' ]);
        mockColumn.getId.and.returnValue(id);
        mockColumn.isDateColumn.and.returnValue(id.indexOf('Date') >= 0);
        mockColumn.isGrowth.and.returnValue(id.indexOf('Growth') >= 0);

        return {
            id: id,
            name: id,
            columnModel: mockColumn,
            menuPluginParams: {
                getMenuBtnDom: function () {
                    return $('<div></div>');
                },
                getMenuDom: function () {
                    return $('<div></div>');
                }
            }
        };
    }

    function createMocks() {

        function createFilterSpy() {
            return jasmine.createSpyObj('FilterModel', [ 'isActive' ]);
        }

        var inactiveFilterModel = createFilterSpy();
        inactiveFilterModel.isActive.and.returnValue(false);

        var activeFilterModel = createFilterSpy();
        activeFilterModel.isActive.and.returnValue(true);
    }

    beforeEach(function () {
        $('.test-slick-table').remove();
        _$table = $('<div class="test-slick-table"></div>');
        _$table.css({ width: "100%", height: "100%"});
        $('body').append(_$table);
        createMocks();
        // Growth columns will be skipped.
        _grid = new Slick.Grid(_$table, [], [
            createSlickColumnSpec('activeDate'),
            createSlickColumnSpec('inactiveDate'),
            createSlickColumnSpec('activeCol'),
            createSlickColumnSpec('inactiveCol'),
            createSlickColumnSpec('inactiveGrowthCol')
        ]);

        _columnMenuPlugin = new Slick.Custom.ColumnMenuPlugin();
        _grid.registerPlugin(_columnMenuPlugin);
    });

    it('should open menu anchored at button when button is clicked', function () {
        var $btn1 = _$table.find('.bk-table-header-menu-btn:eq(0)');
        var $menu = $('.bk-table-header-menu-body');

        expect($btn1.hasClass('bk-in-use')).toBeFalsy();

        // Because the unit tests don't run with a css, provide a box layout using DOM api.
        var BTN_DIMENSION = 20;
        $btn1.width(BTN_DIMENSION);
        $btn1.height(BTN_DIMENSION);
        $btn1.offset({
            top: 0,
            left: 0
        });
        $menu.width(100);
        $menu.css({ position: 'absolute' });

        $btn1.click();

        expect($menu.is(':visible')).toBeTruthy();
        expect($menu.data('columnId')).toBe('activeDate');

        // After the btn click, the header is re-rendered.
        $btn1 = _$table.find('.bk-table-header-menu-btn:eq(0)');
        $btn1.width(BTN_DIMENSION);
        $btn1.height(BTN_DIMENSION);
        $btn1.offset({
            top: 0,
            left: 0
        });
        expect($btn1.hasClass('bk-in-use')).toBeTruthy();

        var menuTopOffset = parseInt($menu.css('top'));
        expect(menuTopOffset).toBe(25); // btn.top = 0 + btn.height = 20 + offset = 5
        expect(parseInt($menu.css('left'))).toBe(-12); // btn.left = 0 - offset = 12

        $btn1.click();

        $btn1 = _$table.find('.bk-table-header-menu-btn:eq(0)');
        $btn1.width(BTN_DIMENSION);
        $btn1.height(BTN_DIMENSION);
        $btn1.offset({
            top: 0,
            left: 500
        });
        $btn1.click();
        $btn1 = _$table.find('.bk-table-header-menu-btn:eq(0)');
        $btn1.width(BTN_DIMENSION);
        $btn1.height(BTN_DIMENSION);
        $btn1.offset({
            top: 0,
            left: 500
        });
        expect($btn1.hasClass('bk-in-use')).toBeTruthy();

        var menuTopOffset = parseInt($menu.css('top'));
        var menuRightOffset = parseInt($menu.css('right'));
        var bodyWidth = $('body').width();
        expect(menuTopOffset).toBe(25); // btn.top = 0 + btn.height = 20 + offset = 5
        expect(menuRightOffset).toBe(bodyWidth - 532); // - btn.left = 500 - btn.width = 20 - offset = 12
    });

    // Following tests can't be automated because we need at least one event loop between 2 consecutive clicks
    // (DOM event).
    it('should keep menu closed when button is clicked twice', function () {
        var $menu = $('.bk-table-header-menu-body');
        expect($menu.is(':visible')).toBeFalsy();

        var $btn = _$table.find('.bk-table-header-menu-btn:eq(0)');
        $btn.click();
        expect($menu.is(':visible')).toBeTruthy();

        // After the btn click, the header is re-rendered.
        $btn = _$table.find('.bk-table-header-menu-btn:eq(0)');
        $btn.click();
        expect($menu.is(':visible')).toBeFalsy();
    });

    it('should close menu when mouse down outside of column menu button', function () {
        var $menu = $('.bk-table-header-menu-body');
        expect($menu.is(':visible')).toBeFalsy();

        var $btn = _$table.find('.bk-table-header-menu-btn:eq(0)');
        $btn.click();
        expect($menu.is(':visible')).toBeTruthy();

        $('body').trigger('mousedown');
        expect($menu.is(':visible')).toBeFalsy();
    });

    it('should open menu at one button and reposition when clicked on another button', function () {
        var $menu = $('.bk-table-header-menu-body');
        expect($menu.is(':visible')).toBeFalsy();

        var $btn0 = _$table.find('.bk-table-header-menu-btn:eq(0)');
        $btn0.click();
        expect($menu.is(':visible')).toBeTruthy();
        expect($menu.data('columnId')).toBe('activeDate');

        var $btn1 = _$table.find('.bk-table-header-menu-btn:eq(1)');
        $btn1.click();
        expect($menu.is(':visible')).toBeTruthy();
        expect($menu.data('columnId')).toBe('inactiveDate');
    });
});
