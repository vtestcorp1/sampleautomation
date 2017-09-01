/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

'use strict';

var browserUtil = require('../browser-utils');
var pinboards = require('../pinboards/pinboards');
var common = require('../common');
var util = common.util;
var charts = require('../charts/charts');
var table = require('../table/table');
var worksheet = require('../worksheets/worksheets');
var home = require('./home.js');
var answer = require('../viz-layout/answer/answer.js');
var uiSelect = require('../libs/ui-select.js');

describe('Home Page', function() {
    afterAll(function() {
        browserUtil.transformer.resetRequestTransformers();
    });

    it('Should not have resize/Delete on homepage dashboard', function() {
        common.navigation.goToHome();
        util.waitForElement(charts.selectors.VIZ_INNER);
        pinboards.openVizDropdownMenu();
        expect($(pinboards.selectors.SIZE_SELECTORS).isPresent()).toBe(false);
        expect($(pinboards.selectors.DELETE_VIZ).isPresent()).toBe(false);
    });

    it('should navigate to Worksheet page when worksheet selected in activity', function () {
        var worksheetName = 'testWorksheet';
        var sources = ['CUSTOMER', 'LINEORDER'];
        worksheet.createSimpleWorksheet(sources, worksheetName);

        common.navigation.goToHome();
        home.openActivityFeed();
        element(by.cssContainingText(
            home.selectors.HOME_ACTIVITY_ITEM, worksheetName))
            .element(by.tagName('a')).click();
        util.expectNoErrorNotif();
        common.navigation.goToUserDataSection();
        worksheet.deleteWorksheet(worksheetName);
    });

    it('should be able to view underlying answer on home pinboard [SCAL-6685]', function () {
        var pinboardName = 'pinboardName';

        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToHome();
        uiSelect.changeSelection($(pinboards.selectors.HOME_PAGE_PINBOARD_PLUGIN),
            pinboardName, true);
        pinboards.waitForVizCountToBe(1);
        pinboards.openVizEditor();
        pinboards.closeVizEditor();
        pinboards.deletePinboard(pinboardName);
    });

    it('should keep a min width of homepage pinboard dropdpown', function () {
        var smallPinboardName = 'small';
        var MIN_DROPDOWN_WIDTH = 250;

        var query = 'revenue color';
        var sources = ['LINEORDER', 'PART'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);
        answer.addShowingVizToNewPinboard(smallPinboardName);
        common.navigation.goToHome();
        uiSelect.changeSelection($(pinboards.selectors.HOME_PAGE_PINBOARD_PLUGIN),
            smallPinboardName, true);
            browser.pause();
        pinboards.waitForVizCountToBe(1);
        $(home.selectors.HOME_PAGE_PINBOARD_SELECT).getSize().then(function(size) {
            expect(size.width).toEqual(MIN_DROPDOWN_WIDTH);
        });
        pinboards.deletePinboard(smallPinboardName);
    });

    it('should scroll up sage bar when user scrolls down to last viz', function () {
        var pinboardName = 'Genericjoin Pinboard 1';
        common.navigation.goToHome();
        uiSelect.changeSelection($(pinboards.selectors.HOME_PAGE_PINBOARD_PLUGIN),
            pinboardName, true);

        var viz = pinboards.getVizElementAtIndex(5);
        common.util.scrollElementIntoViewPort(viz);

        $(common.navigation.selectors.HOME_SAGE_BAR).getLocation().then(function(sageBarPostion) {
            var top = sageBarPostion.y;
            expect(top).toBeLessThan(0);
        });
    });

    it('SCAL-19498 Home Page should not load all the visualizations', function () {
        common.navigation.goToHome();
        uiSelect.changeSelection(
            $(pinboards.selectors.HOME_PAGE_PINBOARD_PLUGIN),
            'Genericjoin Pinboard 1',
            true
        );
        pinboards.waitForLoaded();
        pinboards.waitForRenderedVizCount(2);
    });

    it('should show a community link in the help dropdown', function () {
        common.navigation.openHelpDropdown();
        util.waitForElement(common.navigation.selectors.COMMUNITY_ITEM);
    });
});
