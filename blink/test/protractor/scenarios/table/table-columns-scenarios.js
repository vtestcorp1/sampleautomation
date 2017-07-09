/**
 * Copyright: ThoughtSpot Inc. 2013
 *
 * Author: francois.chabbey@thoughtspot.com
 *
 * @fileoverview E2E scenarios for table column manipulations.
 */

'use strict';

var answer = require('../viz-layout/answer/answer');
var answerListPage = require('../answers/answer-list-page');
var common = require('../common.js');
var headline = require('../viz-layout/headline/headline');
var sage = require('../sage/sage');
var leftPanel = require('../sage/data-panel/data-panel');
var table = require('../table/table');

var util = common.util;
var nav = common.navigation;

var QUERY = 'revenue average revenue color sort by color';
var SAVED_ANSWER_NAME = 'Table column order preservation answer';

describe('Table column manipulation cases', function () {

    beforeEach(function () {
        nav.goToQuestionSection();
        leftPanel.openChooseSourcesDialog();
        leftPanel.deselectAllSources();
        leftPanel.selectSource('LINEORDER');
        leftPanel.selectSource('PART');
        leftPanel.clickDone();
        answer.queryAndWaitForAnswer(QUERY);
        answer.selectTableType();
    });
    afterAll(function(){
        nav.goToQuestionSection();
        leftPanel.openChooseSourcesDialog();
        leftPanel.deselectAllSources();
    });

    it('[SMOKE][IE] should show correct sort columns when a column header is clicked', function () {

        table.getNthHeader(1).click();
        answer.waitForAnswerWithQuery('revenue average revenue color sort by revenue descending');
        table.isColumnSorted(1, false);
        //Note(chab) a column does not have a sorting indicator before it has been clicked
        expect(table.getNthHeader(2)
            .all(by.css(table.selectors.TABLE_HEADER_SORT_INDICATOR_ASC)).count()).toBe(0);
        table.getNthHeader(1).click(); // descending sort
        answer.waitForAnswerWithQuery('revenue average revenue color sort by revenue');
        table.isColumnSorted(1, true);

    });

    it('table header should have growth in column header', function(){
        answer.queryAndWaitForTable('growth of revenue by commit date');
        util.waitForVisibilityOf(table.getNthHeaderContaining('Growth of Total Revenue'));
    });


    it('[SMOKE][IE] should do global sorting', function(){
        table.getNthHeaderContaining('Color', 0).click();
        answer.waitForAnswerWithQuery("revenue average revenue color sort by color descending");
        //waitForTextToBePresentInElement($$(table.selectors.TABLE_ROW).first()
        //    .$(table.selectors.TABLE_CELL), 'yellow');
        table.waitForTextToBePresentInCell(0, 0, 'yellow');

        table.getNthHeaderContaining('Revenue', 1).click();
        answer.waitForAnswerWithQuery(
            "revenue average revenue color sort by average revenue descending");
        table.waitForTextToBePresentInCell(0, 2,  '4,349,429.93');
        //util.waitForTextToBePresentInElement($$(table.selectors.TABLE_ROW).first()
         //   .all(by.css(table.selectors.TABLE_CELL)).get(2), '4,349,429.93');

        table.getNthHeaderContaining('Revenue', 1).click();
        answer.waitForAnswerWithQuery("revenue average revenue color sort by average revenue");
        table.waitForTextToBePresentInCell(0, 2, '2,841,711.43');
        //util.waitForTextToBePresentInElement($$(table.selectors.TABLE_ROW).first()
          //  .all(by.css(table.selectors.TABLE_CELL)).get(2), '2,841,711.43');
    });

    it('[SMOKE][IE] should preserve the column sorting order', function(){

        util.waitForVisibilityOf(table.getNthHeaderContaining('Color'));
        table.reorderTableColumns(
            table.getNthHeaderContaining('Revenue', 1),
            table.getNthHeaderContaining('Color')
        );
        answer.waitForAnswerWithQuery(QUERY);
        util.waitForVisibilityOf(table.getNthHeaderContaining('Color'));
        util.waitForVisibilityOf(table.getNthHeaderContaining('Revenue'));

        //even after the query is changed in the current document the sorting order  of the
        //existing columns should remain, new columns should be after/right of the older columns
        answer.queryAndWaitForTable('revenue quantity color');

        headline.waitForHeadline('Quantity');
        util.waitForVisibilityOf(table.getNthHeaderContaining('Color'));
        util.waitForVisibilityOf(table.getNthHeaderContaining('Revenue'));
        util.waitForVisibilityOf(table.getNthHeaderContaining('Quantity'));
        // quantity should be the last column
        util.waitForTextToBePresentInElement(table.getNthHeader(2), 'Quantity');
        answer.saveCurrentAnswer(SAVED_ANSWER_NAME);
        answerListPage.goToSavedAnswer(SAVED_ANSWER_NAME);
        headline.waitForHeadline('Color');
        util.waitForVisibilityOf(table.getNthHeaderContaining('Color'));
        util.waitForVisibilityOf(table.getNthHeaderContaining('Revenue'));
        util.waitForVisibilityOf(table.getNthHeaderContaining('Quantity'));
        util.waitForTextToBePresentInElement(table.getNthHeader(2), 'Quantity');
        nav.goToAnswerSection();
        answerListPage.deleteAnswer(SAVED_ANSWER_NAME);
    });
});
