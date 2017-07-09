/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for custom calendars.
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var browserUtil = require('../browser-utils');
var charts = require('../charts/charts');
var common = require('../common');
var leftPanel = require('../sage/data-panel/data-panel');
var table = require('../table/table');

describe('Custom calendar', function () {
    // NOTE: We are only mocking callosum response to blink, the communication
    // between falcon and callosum is still not mocked hence we will see incorrect results
    // the thing being tested should still work though.
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    beforeEach(function(){
        common.util.logout();
        browserUtil.transformer.addSuccessResponseTransformer(function(response) {
            if (response.config.url === '/callosum/v1/session/login') {
                response.data.configInfo.calendars.default.quarterStartMonth = 2
            }
        });
        common.util.login();
        common.navigation.goToQuestionSection();
    });

    afterEach(function(){
        browserUtil.transformer.resetResponseTransformers();
        common.util.reLogin();
    });

    it('[SMOKE][IE] should report quarterly date with \'FY\' prefixed to year in table', function(){
        var query = 'revenue commit date = 1993 commit date quarterly';
        answerPage.queryAndWaitForAnswer(query);
        answerPage.selectTableType();
        expect(table.getNthCell(0, 0).getText()).toBe('Q4 FY 1993');
        expect(table.getNthCell(1, 0).getText()).toBe('Q1 FY 1994');
        expect(table.getNthCell(2, 0).getText()).toBe('Q2 FY 1994');
        expect(table.getNthCell(3, 0).getText()).toBe('Q3 FY 1994');
    });

    it('should report weekly date without \'FY\' prefixed to year in a table', function() {
        var query = 'revenue commit date = 1993 commit date weekly';
        answerPage.queryAndWaitForAnswer(query);
        answerPage.selectTableType();
        expect(table.getNthCell(0, 0).getText()).toBe('12/28/1992');
        expect(table.getNthCell(1, 0).getText()).toBe('01/04/1993');
    });

    it('[SMOKE][IE] should report quarterly date with \'FY\' prefixed to year in chart', function() {
        var query = 'revenue commit date = 1993 commit date quarterly';
        answerPage.queryAndWaitForAnswer(query);
        answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        charts.waitForChartVizToLoad();
        expect(charts.getXAxisLabels().last().getText()).toBe('Q3 FY 1994');
    });

    it('[SMOKE][IE] should report weekly date with without \'FY\' prefixed to year in chart', function(){
        var query = 'revenue commit date = 1993 commit date weekly';
        answerPage.queryAndWaitForAnswer(query);
        answerPage.navigateAndWaitForChartType(charts.chartTypes.COLUMN);
        charts.waitForChartVizToLoad();
        expect(charts.getXAxisLabels().last().getText()).not.toMatch('FY');
    });

    // TODO(sunny): Enable test when we add testability support.
    // We would like to test this but callosum is setting the date range in
    // the filter model according to the value of quarterStartMonth it knows (the default of
    // Jan) and we clamp drill range to the one applied in filter which prevents us from
    // testing this until callosum gives us a way to set the quarterStartMonth dynamically
    // from blink.
    //xit('should use correct date range when drilling', function(){
    //    executeQuery('revenue commit date 1993 commit date quarterly');
    //    waitForHighcharts();
    //    chartFunctions.clickToGetDrillOptions();
    //    dropDownSearchBox().enter('Market Segment');
    //    waitForElement(DROPDOWN_SEARCH_ITEM, 'waiting for searched drill submenu item');
    //    element(first(DROPDOWN_ITEM)).click();
    //    waitForHighcharts();
    //    expect(sageBarValue()).toMatch(/02[/]01[/]1992 and 04[/]30[/]1992/);
    //});
});
