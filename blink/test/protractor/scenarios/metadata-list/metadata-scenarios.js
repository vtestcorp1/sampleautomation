/**
 * Copyright: ThoughtSpot Inc. 2016
 * francois.chabbey(francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for metadata-list
 */

'use strict';

var common = require('../common');
var share = require('../share/share-ui');
var list = require('../list/blink-list');
var filter = require('../metadata-filter.js');
var pinboard = require('../pinboards/pinboards');

var util = common.util;
var nav = common.navigation;

describe('Metadata list', function () {

    var ANSWER_TITLE_1 = 'Brand Revenue Trend',
        ANSWER_TITLE_2 = 'Brand Revenue with Year Filter';

    var constants = filter.constants;

    beforeAll(function(){
        util.reLogin();
    });
    afterAll(function(){
        util.reLogin();
        nav.goToUserDataSection();
        filter.filterOnAuthor(constants.everyone);
        filter.filterOnType(constants.all);
    });

    it('should render a list with at least two answers, containing two expected answers', function () {
        nav.goToAnswerSection();

        expect(list.getAllItems().count()).toBeGreaterThan(2);
        list.waitForItemCountToBe('', ANSWER_TITLE_1, 1);
        list.waitForItemCountToBe('', ANSWER_TITLE_2, 1);
    });
    it('should correctly filter the list when clicking on filter items (e.g. "All Answers", "My Answers")' +
        ' in the left menu', function () {
        util.reLogin('guest1', 'guest1');
        nav.goToAnswerSection();
        filter.filterOnAuthor(constants.you);
        filter.checkIfFilterIsSelected(constants.you);
        filter.checkIfFilterIsSelected(constants.everyone, 0);
        list.waitForItemCountToBe('', ANSWER_TITLE_2, 1);
        // Click on "All Answers"
        filter.filterOnAuthor(constants.everyone);
        filter.checkIfFilterIsSelected(constants.everyone);
        filter.checkIfFilterIsSelected(constants.you, 0);
        list.waitForItemCountToBe('', ANSWER_TITLE_1, 0);
        list.waitForItemCountToBe('', ANSWER_TITLE_2, 1);
    });

    it('should be sorted by date modified as a default', function () {
        util.reLogin();
        nav.goToPinboardsSection();
        pinboard.createPinboard('pinboard 1');
        nav.goToPinboardsSection();
        pinboard.createPinboard('pinboard 2');
        nav.goToUserDataSection();
        nav.goToPinboardsSection();
        var pinboards = list.getAllItemsNames();
        expect(pinboards.first().getText()).toBe('pinboard 2');
        expect(pinboards.get(1).getText()).toBe('pinboard 1');
        pinboard.deletePinboard('pinboard 1');
        pinboard.deletePinboard('pinboard 2');
    });

    //TODO(chab) we use this test to have a rough check of our dataset
    //if it fails, it means that the data set has changed
    it("[SMOKE] should go back to first page after performing filtering", function(){
        nav.goToUserDataSection();
        filter.filterOnAuthor(constants.everyone);
        list.checkPagination('1 - 20');
        list.goToNextPage();
        list.checkPagination('21 - 40');
        list.goToNextPage();
        list.checkPagination('41 - 60');
        list.goToNextPage();
        list.checkPagination('61 - 80');
        list.goToNextPage();
        list.checkPagination('81 - 83');
        // check Author Filter
        filter.filterOnAuthor(constants.you);
        list.checkPagination('1 - 20');
        list.goToNextPage();
        list.checkPagination('21 - 36');
        filter.filterOnType(constants.worksheet);
        list.checkPagination('1 - 20');
        list.goToNextPage();
        list.checkPagination('21 - 34');
        list.goToPreviousPage();
        list.checkPagination('1 - 20');
        list.searchFor('', 'AggrWSOnFormulaWS');
        list.checkPagination('1 - 1');
        list.searchFor('', '');
        list.checkPagination('1 - 20');
    });

    //TODO(Jasmeet): Make this test SMOKE once this is established to be reliable.
    /*xit('should delete selected data items', function () {
     var worksheetName = '[test worksheet]';

     var CSV_HEADER = 'Date,Vendor,Amount,Transaction Type,Category,Account Name',
     CSV_VALID_ROWS = ['01/13/2012,IKEA,113.91,debit,Furnishings,BUSINESS CHECKING', '01/22/2012,DIKEA,1113.91,credit,Durnishings,DUSINESS CHECKING'],
     CSV_FILE_NAME = 'mock.csv',
     IMPORTED_DATA_NAME = 'mock';

     userDataUploadFunctions.uploadCSV(CSV_FILE_NAME, CSV_HEADER, [CSV_VALID_ROWS[0]], true);

     //region SCAL-10882: This is a temporary workaround for sage indexing issue.
     goToAnswer();
     deselectAllTableSources();
     selectSourcesByName([IMPORTED_DATA_NAME]);

     waitForSageSuggestionToPassPredicate('Amount Vendor', function(appWindow){
     // subset of sage token can take longer to index hence we need to wait
     // for all tokens to be recognized
     return appWindow.$(visible('.bk-empty-page-placeholder')).length === 0
     && appWindow.$('.bk-qf-undefined-phrase').length === 0;
     }, 60000);
     clearAnswer();
     //endregion

     createSimpleWorksheet({
     title: worksheetName,
     dataScope: {
     importedData: [IMPORTED_DATA_NAME]
     },
     sources: [IMPORTED_DATA_NAME]
     }, false, true);
     dataTab().click();
     deleteMetadataListItems([worksheetName, IMPORTED_DATA_NAME]);
     });*/
});

