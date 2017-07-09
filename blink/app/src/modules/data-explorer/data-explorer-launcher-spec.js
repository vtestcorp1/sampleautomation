/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Unit tests for data explorer launcher
 */

'use strict';

describe('Data Explorer Launcher', function () {

    var _dataExplorerLauncher,

        TEST_TITLE = 'Test Title';

    beforeEach(function () {
        module('blink.app');
        inject(function (dataExplorerLauncher) {
            _dataExplorerLauncher = dataExplorerLauncher;
        });
    });

    it('should open the data explorer when the open method is invoked', function () {
        _dataExplorerLauncher.open();
        var $dataExplorer = $('body > blink-data-explorer-popup');
        expect($dataExplorer.length).toBe(1);
        $dataExplorer.remove();
    });

    it('should correctly pass the data explorer params to the data explorer directive through attributes', function () {
        _dataExplorerLauncher.open({
            selectableColumnPredicate: function(){return true;},
            title: TEST_TITLE,
            selectedTable: {}
        });
        var $dataExplorer = $('body > blink-data-explorer-popup');
        var $scope = $dataExplorer.scope();
        expect($dataExplorer.length).toBe(1);
        expect($dataExplorer.attr('selectable-column-predicate')).toBe('selectableColumnPredicate');
        expect($dataExplorer.attr('data-explorer-title')).toBe('title');
        expect($dataExplorer.attr('selected-table')).toBe('selectedTable');

        expect($scope.selectableColumnPredicate).toBeTruthy();
        expect($scope.title).toBe(TEST_TITLE);
        expect($scope.selectedTable).toBeTruthy();
        $dataExplorer.remove();
    });

});
