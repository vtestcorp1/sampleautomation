/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E tests for date filters.
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var common = require('../common');
var datePicker = require('../libs/date-picker');
var filterPanel = require('../filters/filter-panel');
var filterDialog = require('../filters/filter-dialog');
var leftPanel = require('../sage/data-panel/data-panel');
var rangeFilter = require('../filters/range-filter');
var sage = require('../sage/sage');

describe('Date filter', function () {
    var defaultQuery = 'order date detailed for order date before 01/01/1994';
    var defaultColumn = 'Order Date';

    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    function queryAndOpenFilter(query, columnName) {
        query = query || defaultQuery;
        columnName = columnName || defaultColumn;
        sage.sageInputElement.enter(query);
        answerPage.waitForAnswerWithQuery(query);
        filterPanel.clickFilterItem(columnName);
        filterDialog.waitForItToAppear();
    }

    it('should update answer and sage bar when filter is changed', function () {
        queryAndOpenFilter();
        rangeFilter.waitForFirstOperandValue('01/01/1994');
        rangeFilter.waitForSecondOperandValue('');
        rangeFilter.verifyFirstPredicate('<');

        rangeFilter.changeFirstPredicate('>');
        filterDialog.clickDone();

        var newQuery = 'order date detailed order date after 01/01/1994';
        sage.sageInputElement.waitForValueToBe(newQuery);
        answerPage.waitForAnswerWithQuery(newQuery);
        filterPanel.clickFilterItem(defaultColumn);
        filterDialog.waitForItToAppear();

        rangeFilter.waitForFirstOperandValue('01/02/1994');
        rangeFilter.verifyFirstPredicate('>=');
        rangeFilter.waitForSecondOperandValue('');
        filterDialog.clickCancel();
    });

    it('should format date filter value correctly - SCAL-6606', function() {
        var query = 'revenue order date for order date > 01/01/1998 sort by order date';
        queryAndOpenFilter(query);
        rangeFilter.waitForFirstOperandValue('01/02/1998');
        filterDialog.clickCancel();
    });

    it('[SMOKE][IE] should update the sage bar with correct date on selection ' +
        'via popup SCAL-2634', function() {
        var query = 'revenue order date order date >= 01/01/1998';
        queryAndOpenFilter(query);
        rangeFilter.dateFilter.openDatePickerFirstOperand();
        datePicker.waitForDatePicker();
        datePicker.selectDay('13');
        rangeFilter.waitForFirstOperandValue('01/13/1998');
        filterDialog.clickDone();
        var updatedQuery = 'revenue order date order date >= 01/13/1998';
        sage.sageInputElement.waitForValueToBe(updatedQuery);
        answerPage.waitForAnswerWithQuery(updatedQuery);
    });
});
