/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit test for the blinkDataExplorer directive.
 *
 */

'use strict';
/* global addCustomMatchers*/
/* eslint camelcase: 1 */

function getExplorerTitle($explorerEl) {
    return $explorerEl.find('.bk-header-title').text();
}

function isExplorerVisible($explorerEl) {
    return $explorerEl.css('display') !== 'none';
}

function isTableListEmpty($explorerEl) {
    return $explorerEl.find('.bk-table-list').children().length === 0;
}

function isDetailViewLoading($explorerEl) {
    return $explorerEl.find('.bk-table-detail').hasClass('bk-loading');
}

function hasTableInDetailView($explorerEl) {
    return $explorerEl.find('.bk-slickgrid-table').length > 0;
}

function clickCloseButton($explorerEl) {
    $explorerEl.find('.bk-close').click();
}

function clickCancelButton($explorerEl) {
    $explorerEl.find('.bk-btn-cancel').click();
}

function clickSaveButton($explorerEl) {
    $explorerEl.find('.bk-save-btn').click();
}

describe('Data explorer ui', function () {
    var $rootScope, $explorer, events;

    beforeEach(function () {
        module('blink.app');
    });
    beforeEach(addCustomMatchers());

    describe(' - Basic', function () {
        beforeEach(inject(function (_$compile_, _$rootScope_, _events_) {
            $explorer = $('<blink-data-explorer></blink-data-explorer>');
            events = _events_;

            // Invoke an apply to clear any outstanding route change events.
            _$rootScope_.$apply();
            // Compile the directive and cause a digest cycle to apply scope properties.
            _$compile_($explorer)(_$rootScope_);
            _$rootScope_.$apply();

            $rootScope = _$rootScope_;
        }));

        it('should add table', function () {
            $explorer.isolateScope().addTableUI();
            // Call apply to compile table directive.
            $rootScope.$apply();

            expect(hasTableInDetailView($explorer)).toBeTruthy();
            expect($explorer.find('.bk-slickgrid-table').length).toBe(1);

            // Call again and verify that there is still only 1 table.
            $explorer.isolateScope().addTableUI();
            // Call apply to compile table directive.
            $rootScope.$apply();
            expect($explorer.find('.bk-slickgrid-table').length).toBe(1);
        });
    });

    describe(' - Selectable mode', function () {
        beforeEach(inject(function (_$compile_, _$rootScope_) {
            $explorer = $('<blink-data-explorer selectable-column-predicate="canSelectColumn" explorer-title="Custom title"></blink-data-explorer>');

            // Invoke an apply to clear any outstanding route change events.
            _$rootScope_.$apply();
            _$rootScope_.canSelectColumn = function () {return true;};
            // Compile the directive and cause a digest cycle to apply scope properties.
            _$compile_($explorer)(_$rootScope_);
            _$rootScope_.$apply();

            $rootScope = _$rootScope_;
        }));

        it('should initialize with a custom title and selection ui', function () {
            expect($explorer.find('.bk-explorer').hasClass('bk-explorer-mapping')).toBeTruthy();

            $explorer.isolateScope().addTableUI();
            // Call apply to compile table directive.
            $rootScope.$apply();

            expect($explorer.isolateScope().inSelectionMode).toBeTruthy();
        });
    });

});
