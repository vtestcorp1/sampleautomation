/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Francois (francois.chabbey@thoughtspot.com)
 */

'use strict';
var common = require('../common.js');
var dataUI = require('./data-ui');
var actionBtns = require('../actions-button');
var answerPage = require('../viz-layout/answer/answer');
var charts = require('../charts/charts');
var table = require('../table/table');
var util = common.util;

describe('Data list', function () {
    beforeEach(function() {
        common.navigation.goToUserDataSection();
    });

    afterAll(function() {
        util.reLogin();
    });

    //SCAL-16084
    it('should not use stickers on admin tab', function () {
        common.navigation.goToPinboardsSection();
        dataUI.clickOnStickers('try me', true);
        util.waitForElement(by.css(dataUI.selectors.DATA_UI_LIST));
        expect(element.all(by.css(dataUI.selectors.DATA_UI_LIST + ' .bk-row-flex')).count()).toBe(0);
        common.navigation.goToAnswerSection();
        util.waitForElement(by.css(dataUI.selectors.DATA_UI_LIST));
        expect(element.all(by.css(dataUI.selectors.DATA_UI_LIST + ' .bk-row-flex')).count()).toBe(0);
        common.navigation.goToAdminSection();
        util.waitForElement(by.css(dataUI.selectors.DATA_UI_LIST ));
        expect(element.all(by.css(dataUI.selectors.DATA_UI_LIST + ' .bk-row-flex')).count()).toBe(11);
        common.navigation.goToUserDataSection();
        dataUI.clickOnStickers('try me', true);
    });

    it('should take the user to schema uploader view on clicking `Upload schema`: SCAL-15888', function () {
        common.navigation.goToUserDataSection();
        dataUI.goToUploadSchema();
        expect(browser.getCurrentUrl()).toMatch(/create-schema$/);
    });

    it('should allow updating measure column format pattern', function(){
        dataUI.goToTableByName('LINEORDER');
        dataUI.setColumnFormatPattern('Revenue', '#,##0.000');
        common.navigation.goToQuestionSection();

        answerPage.doAdhocQuery('Revenue', ['LINEORDER'], charts.vizTypes.TABLE);
        expect(table.getNthCell(0,0).getText()).toMatch('18,051,222,435.000');

        // undo the change
        dataUI.goToTableByName('LINEORDER');
        dataUI.setColumnFormatPattern('Revenue', '#,##0');
        common.navigation.goToQuestionSection();

        common.navigation.goToQuestionSection();
        answerPage.doAdhocQuery('Revenue', ['LINEORDER'], charts.vizTypes.TABLE);
        expect(table.getNthCell(0,0).getText()).toMatch('18,051,222,435');
    });

    it('should allow updating date column format pattern', function(){
        dataUI.goToTableByName('LINEORDER');
        dataUI.setColumnFormatPattern('Order Date', 'MMM/dd/yyyy');
        common.navigation.goToQuestionSection();

        answerPage.doAdhocQuery(
            'order date detailed',
            ['LINEORDER'],
            charts.vizTypes.TABLE
        );
        expect(table.getNthCell(0,0).getText()).toMatch('Jan/04/1992');

        // undo the change
        dataUI.goToTableByName('LINEORDER');
        dataUI.setColumnFormatPattern('Order Date', '');
        common.navigation.goToQuestionSection();

        answerPage.doAdhocQuery(
            'order date detailed',
            ['LINEORDER'],
            charts.vizTypes.TABLE
        );
        expect(table.getNthCell(0,0).getText()).toMatch('01/04/1992');
    });
});
