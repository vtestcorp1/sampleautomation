/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for search doctor.
 */

'use strict';

var answer = require('../viz-layout/answer/answer');
var common = require('../common');
var dataPanel = require('../sage/data-panel/data-panel');
var leftPanel = require('../sage/data-panel/data-panel');
var sage = require('../sage/sage');
var searchDoctor = require('./search-doctor');


describe('Search Doctor Scenarios', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    afterEach(function() {
        searchDoctor.clearSearchDoctor();
    });

    it('[SMOKE][IE] should show search doctor on entering wrong token', function () {
        searchDoctor.openSearchDoctor('sdf revxx');
        searchDoctor.waitForSearchDoctor();
    });

    it('should underline matched part of query completion with the search query', function() {
        var query = 'terrell cou';
        searchDoctor.openSearchDoctor(query);
        searchDoctor.waitForSearchDoctor();
        var completionRowSelector = by.cssContainingText(
            searchDoctor.selectors.QUERY_COMPLETION_ROW,
            'terrell cou'
        );

        common.util.waitForElementCountToBe(completionRowSelector, 3);
        searchDoctor.verifyMatchedSubstring(completionRowSelector, query);
    });

    it('should underline matched part of object result title with the search query', function() {
        var query = 'teretr reve';
        searchDoctor.openSearchDoctor(query);

        var rowHeaderSelector = by.cssContainingText(
            searchDoctor.selectors.LIST_ROW_HEADER,
            'Average Revenue by Part'
        );
        common.util.waitForElementCountToBe(rowHeaderSelector, 1);
        searchDoctor.verifyMatchedSubstring(rowHeaderSelector, 'Reve');
    });

    it('should underline matched part of object result subtext with the search query', function() {
        var query = 'average revenae bu';
        searchDoctor.openSearchDoctor(query);
        var rowSubTextSelector = by.cssContainingText(
            searchDoctor.selectors.LIST_ROW_SUBTEXT,
            'average revenue by part name year supplier region europe america'
        );

        common.util.waitForElementCountToBe(rowSubTextSelector, 1);
        searchDoctor.verifyMatchedSubstring(rowSubTextSelector, 'average');
    });

    it('should have carousel of same widths', function () {
        searchDoctor.openSearchDoctor('rtrx revxxx');
        searchDoctor.waitForSearchDoctor();
        common.util.waitForElementCountToBe(searchDoctor.selectors.HELP_TIP, 1);
        var SLIDE_WIDTH = 450;

        $(searchDoctor.selectors.SEARCH_VIDEO).getSize().then(function(size) {
            expect(size.width).toEqual(SLIDE_WIDTH);
        });

        searchDoctor.goToNextSlide();
        $(searchDoctor.selectors.ADVANCED_SEARCH).getSize().then(function(size) {
            expect(size.width).toEqual(SLIDE_WIDTH);
        });

        searchDoctor.goToNextSlide();
        $(searchDoctor.selectors.KNOW_YOUR_DATA).getSize().then(function(size) {
            expect(size.width).toEqual(SLIDE_WIDTH);
        });

        searchDoctor.goToNextSlide();
        $(searchDoctor.selectors.CHOOSE_SOURCES).getSize().then(function(size) {
            expect(size.width).toEqual(SLIDE_WIDTH);
        });
    });

    it('should respect restrict search help flag', function () {
        common.navigation.goToHome();
        common.navigation.addUrlParameter('restrictSearchHelp', true);
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
        common.navigation.goToQuestionSection();
        searchDoctor.openSearchDoctor('sdf revxx');
        searchDoctor.waitForSearchDoctor();
        common.util.waitForElementCountToBe(searchDoctor.selectors.HELP_TIP, 0);
        common.navigation.goToHome();
        common.navigation.removeUrlParameter('restrictSearchHelp');
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });

    it('should be able to resolve folded completions from search doctor', function () {
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER', 'Formula Worksheet']);
        dataPanel.clickDone();
        var query = 'lineorder';
        searchDoctor.openSearchDoctor(query);
        searchDoctor.waitForSearchDoctor();
        searchDoctor.waitForListItem('lineorder custkey', '2 matches');
        searchDoctor.clickListItem('lineorder custkey', '2 matches');
        searchDoctor.clickListItem('lineorder custkey', 'Lineorder');
        answer.waitForAnswerWithQuery('lineorder custkey');
    });
});
