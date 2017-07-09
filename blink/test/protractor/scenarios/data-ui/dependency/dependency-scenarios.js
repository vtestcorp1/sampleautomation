/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var userDataUpload = require('../import-wizard/import-wizard');
var answerPage = require('../../viz-layout/answer/answer');
var answerListPage = require('../../answers/answer-list-page');
var blinkList = require('../../list/blink-list.js');
var dataPanel = require('../../sage/data-panel/data-panel');
var dataUI = require('../data-ui');
var dependency = require('./dependency');
var dialog = require('../../dialog');
var common = require('../../common');
var util = common.util;

describe('Dependency', function () {
    var ANSWER_NAME = 'answer_name',
        ANSWER_QUERY = 'amount by account name';

    it('should not allow deletion of metadata items with dependents', function() {
        var file = 'data-ui/dependency/data.csv';
        var tableName = 'data';
        common.navigation.goToUserDataSection();
        userDataUpload.importCSVData(file, 'data', true/*headerDefined*/, false);
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['data']);

        answerPage.queryAndWaitForSageIndexing('amount');
        answerPage.createAndSaveAnswer(ANSWER_QUERY, ANSWER_NAME);
        common.navigation.goToUserDataSection();

        blinkList.checkItems(dataUI.selectors.DATA_UI_LIST, [tableName]);
        blinkList.clickDelete(dataUI.selectors.DATA_UI_LIST);
        util.waitForElement(by.cssContainingText(dialog.selectors.DIALOG, 'Deletion not allowed'));
        dialog.clickPrimaryButton();
        answerListPage.deleteAnswer(ANSWER_NAME);
        common.navigation.goToUserDataSection();
        dataUI.deleteMetadataItems([tableName]);
    });

    it('should show list of dependent objects for each table column', function() {
        common.navigation.goToUserDataSection();
        dataUI.goToTableByName('Part Details');
        dataUI.goToDependentsView();
        dependency.waitForDependentsCountToBe(11);
    });

    //SCAL-17560
    xit('should give correct links, even after sorting table', function(){
        common.navigation.goToUserDataSection();
        dataUI.goToTableByName('PART');
        dataUI.goToDependentsView();
        dependency.clickOnDependentLink(0);
        //TODO(chab) maybe check for the title of the page instead of that
        util.checkForPath('/data/explore/2cb8dea0-1f97-461b-b1fe-29e104b194a7');
        dataUI.goToTableByName('PART');
        dataUI.goToDependentsView();
        dependency.clickOnNameColumn();
        dependency.clickOnDependentLink(0);
        util.checkForPath('/saved-answer/9e819dd3-11c9-42d5-97e6-877c5473cc26');
    });
});
