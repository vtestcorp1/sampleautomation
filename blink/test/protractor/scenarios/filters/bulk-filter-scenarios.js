/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E tests for bulk filters.
 */

'use strict';

var answer = require('../viz-layout/answer/answer');
var bulkFilter = require('./bulk-filter');
var bulkFilterTestData = require('./bulk-filter-testdata');
var checkboxFilter = require('./checkbox-filter');
var common = require('../common');
var filterPanel = require('../filters/filter-panel');
var filterDialog = require('../filters/filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel');
var sage = require('../sage/sage');
var table = require('../table/table');

describe('Attribute bulk filter cases', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART', 'CUSTOMER']);
        leftPanel.clickDone();
        answer.setVizDisplayPreferenceToTable();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    it('[SMOKE][IE] should add bulk filter', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('red;blue');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue color blue...red');
        table.waitForTableRowCountToBe(void 0, 2);
    });

    it('should add upper case values', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('Red;blue');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue color blue...red');
        table.waitForTableRowCountToBe(void 0, 2);
    });

    it('should add numeric values', function () {
        answer.queryAndWaitForAnswer('revenue lineorder custkey');
        leftPanel.expandSource('LINEORDER');
        leftPanel.openFilter('Lineorder CustKey');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('16;28');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue lineorder custkey 16...28');
        table.waitForTableRowCountToBe(void 0, 2);
    });

    it('should show error for invalid values', function () {
        answer.queryAndWaitForAnswer('revenue lineorder custkey');
        leftPanel.expandSource('LINEORDER');
        leftPanel.openFilter('Lineorder CustKey');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('16;a;28;b');
        filterDialog.clickDoneWithoutExpectingItToDisappear();
        common.util.waitForElement(bulkFilter.selectors.INVALID_VALUES_ERROR);
        filterDialog.clickCancel();
    });

    it('should unmatched values error', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('fsdasdsadm,sdasdasd');
        filterDialog.clickDoneWithoutExpectingItToDisappear();
        bulkFilter.verifyMismatchString(2);
    });

    it('should allow fixing of unmatched values', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('red,fsdasdsadm,sdasdasd');
        filterDialog.clickDoneWithoutExpectingItToDisappear();
        bulkFilter.verifyMismatchString(2);
        bulkFilter.waitForTextAreaValueToBe('fsdasdsadm,sdasdasd');
        bulkFilter.setTextAreaValue('blue,black');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue color black...red');
        table.waitForTableRowCountToBe(void 0, 3);
    });

    it('should allow un-check on valid values', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('red;sdfasfsdf');
        filterDialog.clickDoneWithoutExpectingItToDisappear();
        bulkFilter.toggleCheckedState('red');
        bulkFilter.setTextAreaValue('blue');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue color blue');
        table.waitForTableRowCountToBe(void 0, 1);
    });

    it('should allow removal of value using checkbox filter', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('red;blue');
        filterDialog.clickDone();
        table.waitForTableRowCountToBe(void 0, 2);
        filterPanel.clickFilterItem('Color');
        checkboxFilter.toggleCheckboxState('red');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue color blue');
        table.waitForTableRowCountToBe(void 0, 1);
    });

    it('should allow query modification', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('red;blue');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue color blue...red');
        table.waitForTableRowCountToBe(void 0, 2);
        leftPanel.addColumn('Brand1');
        sage.sageInputElement.waitForValueToBe('revenue color blue...red brand1');
        answer.waitForAnswerWithQuery('revenue color blue...red brand1');
    });

    it('should respect cascade filtering on validation', function () {
        var query = 'revenue customer region customer nation customer region = africa';
        answer.queryAndWaitForAnswer(query);
        leftPanel.expandSource('CUSTOMER');
        leftPanel.openFilter('Customer Nation');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('india');
        filterDialog.clickDoneWithoutExpectingItToDisappear();
        bulkFilter.verifyMismatchString(1);
        filterDialog.clickCancel();
    });

    it('should allow clearing of unmatched values', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.setTextAreaValue('red,fsdasdsadm,sdasdasd');
        filterDialog.clickDoneWithoutExpectingItToDisappear();
        bulkFilter.waitForTextAreaValueToBe('fsdasdsadm,sdasdasd');
        bulkFilter.verifyMismatchString(2);
        bulkFilter.setTextAreaValue('');
        filterDialog.clickDone();
        sage.sageInputElement.waitForValueToBe('revenue color red');
        table.waitForTableRowCountToBe(void 0, 1);
    });

    it('should show one time limit error', function () {
        answer.queryAndWaitForAnswer('revenue customer name');
        leftPanel.expandSource('CUSTOMER');
        leftPanel.openFilter('Customer Name');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.fastEnterText(bulkFilterTestData.oneTimeLimitText);
        filterDialog.clickDoneWithoutExpectingItToDisappear();
        common.util.waitForElement(bulkFilter.selectors.ONE_TIME_LIMIT_ERROR);
        filterDialog.clickCancel();
    });

    it('should show max filter value error', function () {
        var query = 'revenue customer name customer#000029116 customer#000029135 ' +
            'customer#000029143 customer#000029147';
        answer.queryAndWaitForAnswer(query);
        leftPanel.expandSource('CUSTOMER');
        leftPanel.openFilter('Customer Name');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        bulkFilter.fastEnterText(bulkFilterTestData.overallLimitText);
        filterDialog.clickDoneWithoutExpectingItToDisappear();
        common.util.waitForElement(bulkFilter.selectors.FILTER_VALUE_LIMIT_ERROR);
        filterDialog.clickCancel();
    });

    it('SCAL-18807 should only show bulk filter', function () {
        answer.queryAndWaitForAnswer('revenue color');
        leftPanel.expandSource('PART');
        leftPanel.openFilter('Color');
        filterDialog.waitForItToAppear();
        checkboxFilter.openBulkFilter();
        bulkFilter.waitForBulkFilter();
        common.util.waitForInvisibilityOf(checkboxFilter.selectors.CONTENT_SELECTOR);
        filterDialog.clickCancel();
    });
});
