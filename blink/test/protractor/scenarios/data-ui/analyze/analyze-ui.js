/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com)
 *
 * Provides utilities act on the analyzer suggestions.
 */

'use strict';

var common = require('../../common.js');
var share = require('../../share/share-ui');
var dataUI = require('../data-ui');

var functions = module.exports = (function () {

    return {
        selectors: {
            SUGGESTIONS_TOTAL_COUNT: '.bk-analyze-total-count',
            ANALYZER_HEADER: '.bk-accordion-item-header-title',
            ALERT: {
                SUCCESS: '.bk-alert .bk-text',
                SUCCESS_TEXT: 'Table saved successfully.'
            },
            LONG_TABLE: {
                HEADER_NAME: 'Long table name',
                INPUT_ID: 'long-table-name',
                BTN_ID: 'long-table-btn'
            },
            LONG_COLUMN: {
                HEADER_NAME: 'Long column names',
                INPUT_ID: 'long-column-name-',
                BTN_ID: 'long-column-btn-'
            },
            COMMON_PREFIX: {
                HEADER_NAME: 'Identical strings in multiple columns',
                INPUT_ID: 'common-prefix-name-',
                BTN_ID: 'common-prefix-btn-'
            },
            SYSTEM_KEYWORD: {
                HEADER_NAME: 'System keywords in column names',
                INPUT_ID: 'system-keyword-name-',
                BTN_ID: 'system-keyword-btn-'
            },
            MANY_INDEXED_COLUMN: {
                HEADER_NAME: 'High number of columns'
            },
            MANY_COLUMN: {
                HEADER_NAME: 'High number of indexed columns'
            },
            CHASM_TRAP: {
                HEADER_NAME: 'Chasm trap'
            },
            SAVE_BUTTON: by.css('.bk-analyze-save-btn .bk-primary-button:not(.bk-disabled)')
        },
        saveTable :  function() {
            common.util.waitForAndClick(this.selectors.SAVE_BUTTON);
        },
        waitForSaveTableSuccessDisplay: function () {
            common.util.expectAndDismissSuccessNotif(this.selectors.ALERT.SUCCESS_TEXT);
        },
        getExpectedHeaderTitle: function (analyzerName, count) {
            return analyzerName + ' (' + count + ')';
        },
        getSuggestionsTotalCount: function () {
            common.util.waitForElement(this.selectors.SUGGESTIONS_TOTAL_COUNT);
            return element.all(by.css(this.selectors.SUGGESTIONS_TOTAL_COUNT));
        },
        getSuggestionHeaderTitle: function (analyzer) {
            common.util.waitForElement(by.cssContainingText(this.selectors.ANALYZER_HEADER, analyzer));
            var header = element.all(by.cssContainingText(this.selectors.ANALYZER_HEADER,
                analyzer));
            return header.getText();
        },
        verifyAnalyzerHeader: function (analyzer, expectedCount) {
            var expectedHeader = this.getExpectedHeaderTitle(analyzer, expectedCount);
            var actualHeader = this.getSuggestionHeaderTitle(analyzer);
            expect(actualHeader).toContain(expectedHeader);
        },
        verifyChasmCount: function (expectedCount) {
            this.verifyAnalyzerHeader(this.selectors.CHASM_TRAP.HEADER_NAME, expectedCount);
        },
        verifyLongTableCount: function (expectedCount) {
            this.verifyAnalyzerHeader(this.selectors.LONG_TABLE.HEADER_NAME, expectedCount);
        },
        verifyLongColumnCount: function (expectedCount) {
            this.verifyAnalyzerHeader(this.selectors.LONG_COLUMN.HEADER_NAME, expectedCount);
        },
        verifyManyColumnsCount: function (expectedCount) {
            this.verifyAnalyzerHeader(this.selectors.MANY_COLUMN.HEADER_NAME, expectedCount);
        },
        verifyManyIndexedColumnsCount: function (expectedCount) {
            this.verifyAnalyzerHeader(this.selectors.MANY_INDEXED_COLUMN.HEADER_NAME, expectedCount);
        },
        verifyCommonPrefixCount: function (expectedCount) {
            this.verifyAnalyzerHeader(this.selectors.COMMON_PREFIX.HEADER_NAME, expectedCount);
        },
        verifySystemKeywordsCount: function (expectedCount) {
            this.verifyAnalyzerHeader(this.selectors.SYSTEM_KEYWORD.HEADER_NAME, expectedCount);
        },
        renameColumn: function (inputId, newName) {

            var inputElement = by.id(inputId);

            // rename the column
            common.util.waitForElement(inputElement);
            element(inputElement).clear();
            element(inputElement).sendKeys(newName);

            // save table
            this.saveTable();

            // wait for table saved successfully alert to appear.
            this.waitForSaveTableSuccessDisplay();
        },
        renameLongTable: function (newName) {
            var inputId = this.selectors.LONG_TABLE.INPUT_ID;
            this.renameColumn(inputId, newName);
        },
        renameLongColumn: function (originalName, newName) {
            var inputId = this.selectors.LONG_COLUMN.INPUT_ID + originalName;
            this.renameColumn(inputId, newName);
        },
        renameSystemKeywordColumn: function (originalName, newName) {
            var inputId = this.selectors.SYSTEM_KEYWORD.INPUT_ID + originalName;
            this.renameColumn(inputId, newName);
        },
        renameCommonPrefixColumn: function (originalName, newName) {
            var inputId = this.selectors.COMMON_PREFIX.INPUT_ID + originalName;
            this.renameColumn(inputId, newName);
        },
        verifyTotalCount: function (count) {
            var countText = dataUI.getSuggestionsTotalCount();
            expect(countText.getText()).toContain('(' + count + ')');
        }
    };
})();


