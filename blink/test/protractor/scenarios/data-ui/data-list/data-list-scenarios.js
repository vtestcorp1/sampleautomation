/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Chabbey Francois (chabbey.francois@thoughtspot.com)
 */
'use strict';


var common = require('../../common.js');
var dataUI = require('../data-ui');
var util = common.util;

describe('Data list manager', function () {

    afterAll(function () {
        util.reLogin();
    });

    it('Should freeze first column of data UI', function () {
        util.reLogin('guest', 'guest');

        dataUI.goToTableByName('TEST1');
        dataUI.scrollToCell(12, 1, 2);

        var cell = dataUI.getCellInTable(0, 0, 2);
        expect(cell.isDisplayed()).toBeTruthy();
    });
});
