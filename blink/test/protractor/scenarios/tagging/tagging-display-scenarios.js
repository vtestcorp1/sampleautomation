/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Paliwal(rahul.paliwal@thoughtspot.com)
 * Francois Chabbey(francois.chabey@thoughtspot.com)
 *
 *
 * @fileoverview E2E scenarios for tagging
 */

'use strict';

var common = require('../common.js');
var nav = common.navigation;
var util = common.util;
var base = require('../../base-do-not-use.js');
var answer = require('../viz-layout/answer/answer.js');
var answerListPage = require('../answers/answer-list-page');
var tag = require('./tag');
var leftPanel = require('../sage/data-panel/data-panel.js');
var tooltip = require('../libs/bootstrap-lib.js').tooltip;

describe('Label tagging', function () {

    beforeAll(function(){
        nav.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.selectSource('LINEORDER');
        leftPanel.selectSource('PART');
        leftPanel.clickDone();
    });

    it('should handle overflow of multiple labels on a tagged object', function() {
        var sageQuery = 'revenue color';
        var answerName = '[Test Answer]';
        var labelNames = ['[Apple]', '[Banana]', '[Carrot]', '[Donut]', '[Eclairs]', '[Fruit]', '[Grapes]'];

        answer.createAndSaveAnswer(sageQuery, answerName);
        nav.goToAnswerSection();
        tag.showLabelPanel();

        labelNames.forEach(function(labelName) {
            tag.addLabel(labelName);
            tag.tagItemWithLabel(answerName, labelName);
        });

        util.waitForVisibilityOf(element(tag.listItemSelector(answerName)).element(by.css(' .bk-tagged-labels .bk-show-more')));
        //expect(element(visible(listItemSelector(answerName) + ' .bk-tagged-labels .bk-show-more')).count()).toBe(1);

        answerListPage.deleteAnswer(answerName);

        labelNames.forEach(function(labelName) {
            tag.showLabelPanel();
            util.waitForVisibilityOf($(tag.selectors.TOP_MENU_LABEL_PANEL + ' .bk-add-new-item'));
            tag.deleteLabel(labelName);
        });
    });

    it('[SMOKE] should untag objects when corresponding label is deleted', function () {
        // Create 2 new answers and tag both with a new label.
        var sageQuery1 = 'revenue color';
        var answerName1 = '[Test Answer 1]';
        var sageQuery2 = 'revenue category';
        var answerName2 = '[Test Answer 2]';
        var labelName = '[Apple]';

        answer.createAndSaveAnswer(sageQuery1, answerName1);
        answer.createAndSaveAnswer(sageQuery2, answerName2);
        nav.goToAnswerSection();
        tag.showLabelPanel();
        tag.addLabel(labelName);
        tag.tagItemWithLabel(answerName1, labelName);
        tag.tagItemWithLabel(answerName2, labelName);
        tag.verifyTagged(answerName1, labelName);
        tag.verifyTagged(answerName2, labelName);
        // Delete the new label and assert that the 2 answers are not tagged with the deleted label anymore.
        tag.showLabelPanel();
        tag.deleteLabel(labelName);
        tag.verifyUntagged(answerName1, labelName);
        tag.verifyUntagged(answerName2, labelName);

        answerListPage.deleteAnswer(answerName1);
        answerListPage.deleteAnswer(answerName2);
    });

    //TODO(chab) Fix color picker. Color picker is broken, the color displayed when you open is not correct
    /*
     xit('should automatically update text color based on the chosen label color', function() {
     var labelName = '[Apple]';
     var sageQuery1 = 'revenue color';
     var answerName1 = '[Test Answer 1]';

     answer.createAndSaveAnswer(sageQuery1, answerName1);
     nav.goToAnswerSection();
     tag.showLabelPanel();
     tag.addLabel(labelName);
     tag.tagItemWithLabel(answerName1, labelName);
     tag.showLabelPanel();
     tag.editLabelColor(labelName);
     $('.bk-search-input').click();
     colorPicker.pickSomeColor().then(function(colorPicked){
     tag.checkColorOfTag(answerName1, labelName, colorPicked);
     tag.deleteLabel(labelName);
     });
     });*/
    it('[SMOKE] should show labels sorted alphabetically', function() {
        nav.goToAnswerSection();
        tag.showLabelPanel();
        tag.addLabel('[Apple]');
        tag.addLabel('[Carrot]');
        tag.addLabel('[Banana]');

        var labelNames =  ['[Apple]', '[Banana]', '[Carrot]'];

        $$(tag.selectors.TOP_MENU_LABEL_PANEL + ' .bk-label input').map(function(elm) {
            return elm.getAttribute('value');
        }).then(function(labels) {
            expect(labels[1]).toBeGreaterThan(labels[0]);
            expect(labels[2]).toBeGreaterThan(labels[1]);
            nav.goToAnswerSection();
            labelNames.forEach(function(labelName) {
                tag.showLabelPanel();
                util.waitForVisibilityOf($(tag.selectors.TOP_MENU_LABEL_PANEL + ' .bk-add-new-item'));
                tag.deleteLabel(labelName);
            });
        });
    });

    it('should truncate long labels', function() {
        var longLabelName = '[a very long label with words that go on and on and on and on]';
        nav.goToAnswerSection();
        tag.showLabelPanel();
        tag.addLabel(longLabelName);
        tag.showLabelPanel();
        util.mouseMoveToElement(tag.topMenuLabelSelector(longLabelName));
        tooltip.waitForToolTipContainingText(longLabelName);
        tag.showLabelPanel();
        tag.deleteLabel(longLabelName);
    });
});
