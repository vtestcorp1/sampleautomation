/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var sage = require('../sage/sage.js');
var charts = require('../charts/charts.js');
var table = require('../table/table.js');
var common = require('../common.js');
var answer = require('../viz-layout/answer/answer.js');
var filterPanel = require('../filters/filter-panel');
var filterDialog = require('../filters/filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel');
var checkboxFilter = require('../filters/checkbox-filter');
var dialog = require('../dialog.js');

var util = common.util;

describe('Pinboard filter scenarios', function () {
    var pinboardName = 'pinboardScenariosTesting';

    afterEach(function () {
        pinboards.deletePinboard(pinboardName);
    });

    it('should be able to add multiple emtpy filters', function () {
        var query = 'supplier region const3 supplier city furniture air 1-urgent';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openFilterPanelPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSourceledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        filterDialog.clickDone();
        leftPanel.openFilter('Supplier City');
        filterDialog.clickDone();
        util.waitForElementCountToBe(filterPanel.selectors.FILTER_PANEL_ITEM_SELECTOR, 2);

        // by default there should be 13 rows in result table
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 13);

        filterPanel.clickFilterItem("Supplier Region");
        checkboxFilter.toggleCheckboxState('asia');
        filterDialog.clickDone();
        filterPanel.clickFilterItem("Supplier City");
        checkboxFilter.toggleCheckboxState('china 6');
        filterDialog.clickDone();
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);
        // Remove filter values and make sure data is still correct
        filterPanel.clickFilterItem("Supplier Region");
        checkboxFilter.toggleCheckboxState('asia');
        filterDialog.clickDone();
        filterPanel.clickFilterItem("Supplier City");
        checkboxFilter.toggleCheckboxState('china 6');
        filterDialog.clickDone();

        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 13);
    });

    it('should be able to add multiple emtpy filters in case of chasm trap', function () {
        var query = 'bill cost sale cost bills phone id sales phone id';
        var sources = ['Phone Chasmtrap'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE); answer.addShowingVizToNewPinboard(pinboardName); common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Phone Chasmtrap');
        leftPanel.expandSource('Phone Chasmtrap');
        leftPanel.openFilter('bills Phone Id');
        // Move cursor away from the filter element, so that tooltip does not
        // overlap with checkbox.
        common.util.mouseMoveToElement($(leftPanel.selectors.SOURCES_PANEL_HEADER));
        checkboxFilter.toggleCheckboxState('1');
        filterDialog.clickDone();
        leftPanel.openFilter('sales Phone Id');
        checkboxFilter.toggleCheckboxState('1');
        filterDialog.clickDone();
        util.waitForElementCountToBe(filterPanel.selectors.FILTER_PANEL_ITEM_SELECTOR, 2);

        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);
    });

    it('[SMOKE] should be able to add a pinboard filter', function () {
        var query = 'supplier region const3';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        checkboxFilter.toggleCheckboxState('asia');
        filterDialog.clickDone();
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);
    });

    it('should be able to add/edit/remove a pinboard filter', function () {
        var query = 'supplier region const3';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        checkboxFilter.toggleCheckboxState('asia');
        filterDialog.clickDone();
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);
        pinboards.save();
        filterPanel.waitForFilterItems(1);
        filterPanel.waitForFilterItem('Supplier Region');
        filterPanel.clickFilterItem('Supplier Region');
        checkboxFilter.toggleCheckboxState('africa');
        filterDialog.clickDone();
        vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 2);
        filterPanel.removeFilter('Supplier Region');
        vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 5);
    });

    it('should alert when filter is added and save correctly', function() {
        browser.executeScript('window.blink.env.enableUnsavedChangesAlert = true');
        var query = 'supplier region const3';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        checkboxFilter.toggleCheckboxState('asia');
        filterDialog.clickDone();
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);

        common.util.waitForAndClick(common.navigation.locators.HOME);
        dialog.waitForDialogPresent();
        dialog.clickPrimaryButton(true);
        common.util.waitForElement(common.navigation.locators.HOME_SAGE_BAR);
        browser.executeScript('window.blink.env.enableUnsavedChangesAlert = false');
    });

    //TODO(Rahul): Fix pivot table in pinboard-answer
    // it('should be able to add filter to a pivot table', function () {
    //     var query = 'order date const3 pivot supplier region';
    //     var sources = ['Formula Worksheet'];
    //     answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
    //     answer.addShowingVizToNewPinboard(pinboardName);
    //     common.navigation.goToPinboardsSection();
    //     pinboards.openPinboard(pinboardName);
    //     pinboards.openFilterPanel();
    //     leftPanel.waitForEnabledSource('Formula Worksheet');
    //     leftPanel.expandSource('Formula Worksheet');
    //     leftPanel.openFilter('Supplier Region');
    //     checkboxFilter.toggleCheckboxState('asia');
    //     filterDialog.clickDone();
    //     browser.pause();
    // });

    it('should override filter in pinned answer', function() {
        var query = 'supplier region const3 supplier region = america';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        checkboxFilter.toggleCheckboxState('asia');
        checkboxFilter.toggleCheckboxState('africa');
        filterDialog.clickDone();
        vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 2);
        expect(table.getNthCell(0, 0).getText()).toBe('africa');
        expect(table.getNthCell(1, 0).getText()).toBe('asia');
    });

    it('should apply existing filters to new visualizations', function () {
        var query = 'supplier region const3';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        checkboxFilter.toggleCheckboxState('asia');
        filterDialog.clickDone();
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);
        pinboards.save();

        common.navigation.goToQuestionSection();
        var query2 = 'supplier region const3';
        var sources2 = ['Formula Worksheet'];
        answer.doAdhocQuery(query2, sources2, charts.vizTypes.TABLE);
        answer.addShowingVizToPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);

        var vizElement2 = pinboards.getVizElementAtIndex(1);
        table.waitForTableRowCountToBe(vizElement, 1);
    });

    it('should be able to add pinboard filter on multiple worksheets', function() {
        var query = 'supplier region const3';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);

        var query2 = 'product name product cost';
        var sources2 = ['Chasmtrap'];
        answer.doAdhocQuery(query2, sources2, charts.vizTypes.TABLE);
        answer.addShowingVizToPinboard(pinboardName);

        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        checkboxFilter.toggleCheckboxState('asia');
        filterDialog.clickDone();
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);

        leftPanel.waitForEnabledSource('Chasmtrap');
        leftPanel.expandSource('Chasmtrap');
        leftPanel.openFilter('Product Name');
        checkboxFilter.toggleCheckboxState('ipad');
        filterDialog.clickDone();
        var vizElement2 = pinboards.getVizElementAtIndex(1);
        table.waitForTableRowCountToBe(vizElement2, 1);
    });

    it('should be able to make a copy with pinboard filter without saving', function() {
        var query = 'supplier region const3';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Supplier Region');
        checkboxFilter.toggleCheckboxState('asia');
        filterDialog.clickDone();
        var vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);

        var copyPinboardName = 'copyPinboardName';
        pinboards.makeCopy(copyPinboardName);
        vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 1);
    });

    describe('Read only pinboard', function() {
        afterEach(() => common.util.reLogin());

        it('[SMOKE] should be able to add pinboard filter for read only access', function() {
            var user = {
                name: 'guest1',
                password: 'guest1'
            };
            var query = 'supplier region const3';
            var sources = ['Formula Worksheet'];

            answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
            answer.addShowingVizToNewPinboard(pinboardName);
            common.navigation.goToPinboardsSection();
            pinboards.sharePinboard(pinboardName, ['guest1'], true);
            common.util.reLogin(user.name, user.password);
            common.navigation.goToPinboardsSection();
            pinboards.openPinboard(pinboardName);
            pinboards.openFilterPanel();
            leftPanel.waitForEnabledSource('Formula Worksheet');
            leftPanel.expandSource('Formula Worksheet');
            leftPanel.openFilter('Supplier Region');
            checkboxFilter.toggleCheckboxState('asia');
            filterDialog.clickDone();
            var vizElement = pinboards.getVizElementAtIndex(0);
            table.waitForTableRowCountToBe(vizElement, 1);
        });

   
        
    })


      it('Verify Filters were added to Table in pinboardSection',function(){
       
        var query = 'customer region discount';
        var sources = ['Formula Worksheet'];
        answer.doAdhocQuery(query, sources, charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(pinboardName);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        var vizElement = pinboards.getVizElementAtIndex(0);
        pinboards.openFilterPanel();
        leftPanel.waitForEnabledSource('Formula Worksheet');
        leftPanel.expandSource('Formula Worksheet');
        leftPanel.openFilter('Customer Region');
        checkboxFilter.toggleCheckboxState('europe');
        checkboxFilter.toggleCheckboxState('middle east');
        filterDialog.clickDone();
        vizElement = pinboards.getVizElementAtIndex(0);
        table.waitForTableRowCountToBe(vizElement, 2);
        expect(table.getNthCell(0, 0).getText()).toBe('europe');
        expect(table.getNthCell(1, 0).getText()).toBe('middle east');
       });
   
        



});
