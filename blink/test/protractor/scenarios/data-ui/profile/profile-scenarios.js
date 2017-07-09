/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Lucky Odisetti (lucky.odisetti@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../../common.js');
var dataUI = require('../data-ui');
var util = common.util;

describe('Data Profile Tab', function () {
    beforeAll(function(){
        util.reLogin('tsadmin', 'admin');
        dataUI.goToTableByName('LINEORDER');
        dataUI.goToProfileView();
    });

    afterAll(function () {
        util.reLogin();
    });

    it('Should display all metrics column', function () {
        var cols = element.all(by.css(dataUI.selectors.EXPLORER_SLICK_ROW)).all(by.css('.l0'));
        expect(cols.getText()).toEqual(['NULL VALUES', 'MIN', 'MAX', 'AVERAGE', 'SUM']);
    });

    it('Should format Date & Price correctly', function() {
        var cell = getProfileCell(6,2);
        expect(cell.getText()).toBe('08/02/1998');

        cell = getProfileCell(10,2);
        expect(cell.getText()).toBe('10,324,850');

    });

    it('Should validate all metrics', function() {
        var cell = getProfileCell(1, 2);
        expect(cell.getText()).toBe('999999');

        cell = getProfileCell(17, 0);
        expect(cell.getText()).toBe('1');

        cell = getProfileCell(3, 1);
        expect(cell.getText()).toBe('16');

        cell = getProfileCell(9, 3);
        expect(cell.getText()).toBe('25.4');

        cell = getProfileCell(15 ,4);
        expect(cell.getText()).toBe('20,228');
    });

});

function getProfileCell(column, row) {
    return dataUI.getCellInTable(column, row, 1);
}
