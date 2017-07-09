/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E tests for sharing tables and answers
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Table Sharing Scenarios: ', function () {

    it('should be able to share entire table with user', function () {
        var tableName = 'PART';
        var username = 'qaGUEST',
            password = 'qapass';
        var query = 'part name color sort by color';
        var expected = 'antique light,almond,antique pink,almond';

        // add user qaGUEST
        adminUIFunctions.addNewUser(username, username, password, true);
        // share table with user
        dataTab().click();
        tableTabTitle().click();
        shareTableWithUser(tableName, username);
        // log in as new user
        reLogin(username, password);
        answerTab().click();
        // query based on table
        checkTableResult([tableName], query, 4, expected);

        reLogin('tsadmin', 'admin');
        goToUserManagementPage();
        deleteListItem(username);
    });

    it('should be able to share a specific column with user', function () {
        var tableName = 'PART';
        var username = 'qaGUEST',
            password = 'qapass';
        var query = 'color sort by color';
        var expected = 'almond,antique';

        adminUIFunctions.addNewUser(username, username, password, true);
        dataTab().click();
        tableTabTitle().click();
        shareTableWithUser(tableName, username, 'Color');

        reLogin(username, password);
        answerTab().click();
        // verify query result
        checkTableResult([tableName], query, 4, expected);
        // verify only one column is shared, not the entire table
        expandListArrow(tableName);
        expect(element(EXPANDED_COLUMNS_SEL).count()).toBe(1);

        reLogin('tsadmin', 'admin');
        goToUserManagementPage();
        deleteListItem(username);
    });
});


xdescribe('Answer Sharing Scenarios: ', function() {

    it('should prompt to save answer if share button is clicked', function () {
        sageInputElement().enter('revenue color');
        waitForTableAnswerVisualizationMode();
        shareBtn().click();

        expect(saveDialog().count()).toBe(1);
        var answerName = '[SHARING UNSAVED ANSWER]';
        input('data.customData.documentName').enter(answerName);
        primaryDialogBtn().click();
        //expect(shareDialog().count()).toBe(1);
        deleteSavedAnswer(answerName);
    });

    it('should be able to share answer with user permission to view - 1', function() {
        var username = 'qaGUEST',
            password = 'qapass';
        var query = 'revenue color';
        var expected = 'almond,168,004,329,antique,282,708,533';
        var answer = '[shared answer with permission to view 1]';

        adminUIFunctions.addNewUser(username, username, password, true);
        checkTableResult(TPCH_TABLES, query, 4, expected);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([username], answer, false);

        reLogin(username, password);
        answerTab().click();
        // verify query result
        openSavedAnswer(answer, 'table');
        verifyAnswerTableData(expected, 4);
        // the underlying data is not shared with user. This is achieved by only showing shared columns to user
        expandListArrow('PART');
        expect(element(EXPANDED_COLUMNS_SEL).count()).toBe(1);
        // verify the user does not have permission to edit
        expect(element(SAGE_LOCK_SEL).count()).toBe(1);

        reLogin('tsadmin', 'admin');
        answersTab().click();
        deleteSavedAnswer(answer);
        goToUserManagementPage();
        deleteListItem(username);
    });

    it('should be able to share answer with user permission to edit - 1', function() {
        // if user does not have access to the underlying data, this has exactly the same effect as
        // sharing with read-only permission
        var username = 'qaGUEST',
            password = 'qapass';
        var query = 'revenue color';
        var expected = 'almond,168,004,329,antique,282,708,533';
        var answer = '[shared answer with permission to edit 1]';

        adminUIFunctions.addNewUser(username, username, password, true);
        checkTableResult(TPCH_TABLES, query, 4, expected);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([username], answer, false);

        reLogin(username, password);
        answerTab().click();
        // verify query result
        openSavedAnswer(answer, 'table');
        verifyAnswerTableData(expected, 4);
        // the underlying data is not shared with user. This is achieved by only showing shared columns to user
        expandListArrow('PART');
        expect(element(EXPANDED_COLUMNS_SEL).count()).toBe(1);
        // verify the user does not have permission to edit
        expect(element(SAGE_LOCK_SEL).count()).toBe(1);

        reLogin('tsadmin', 'admin');
        answersTab().click();
        deleteSavedAnswer(answer);
        goToUserManagementPage();
        deleteListItem(username);
    });

    it('should be able to share answer with user permission to view - 2', function() {
        var username = 'qaGUEST',
            password = 'qapass';
        var query = 'revenue color';
        var table1 = 'LINEORDER', table2 = 'PART';
        var expected = 'almond,168,004,329,antique,282,708,533';
        var answer = '[shared answer with permission to view 2]';

        // share answer with user in read only mode
        adminUIFunctions.addNewUser(username, username, password, true);
        checkTableResult(TPCH_TABLES, query, 4, expected);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([username], answer, false);

        // share underlying data with user
        dataTab().click();
        shareTableWithUser(table1, username);
        answerTab().click();
        dataTab().click();
        shareTableWithUser(table2, username);

        // verify query result
        reLogin(username, password);
        answerTab().click();
        openSavedAnswer(answer, 'table');
        verifyAnswerTableData(expected, 4);

        // since the user has access to underlying data, all table columns are visible
        expandListArrow('PART');
        expect(element(EXPANDED_COLUMNS_SEL).count()).toBe(9);

        // verify the user does not have permission to edit answer
        sageInputElement().enter('discount color');
        waitForTableAnswerVisualizationMode();
        expect(saveBtn().count()).toBe(0);

        reLogin('tsadmin', 'admin');
        answersTab().click();
        deleteSavedAnswer(answer);
        goToUserManagementPage();
        deleteListItem(username);
    });

    it('should be able to share answer with user permission to edit - 2', function() {
        var username = 'qaGUEST',
            password = 'qapass';
        var query = 'revenue color';
        var table1 = 'LINEORDER', table2 = 'PART';
        var expected1 = 'almond,168,004,329,antique,282,708,533',
            expected2 = 'almond,323,antique,398';
        var answer = '[shared answer with permission to edit 2]';

        // share answer with user in edit mode
        adminUIFunctions.addNewUser(username, username, password, true);
        checkTableResult(TPCH_TABLES, query, 4, expected1);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([username], answer, true);

        // share underlying data with user
        dataTab().click();
        shareTableWithUser(table1, username);
        answerTab().click();
        dataTab().click();
        shareTableWithUser(table2, username);

        // verify query result
        reLogin(username, password);
        answerTab().click();
        openSavedAnswer(answer, 'table');
        verifyAnswerTableData(expected1, 4);

        // since the user has access to underlying data, all table columns are visible
        expandListArrow('PART');
        expect(element(EXPANDED_COLUMNS_SEL).count()).toBe(9);

        // verify the user does have permission to edit answer
        sageInputElement().enter('discount color');
        sleep(5);
        waitForTableAnswerVisualizationMode();
        verifyAnswerTableData(expected2, 4);
        // Save current answer would fail if saveBtn is not visible/present.
        // expect(saveBtn().count()).toBe(1);
        saveCurrentAnswer();

        // verify that change is now visible to admin
        reLogin('tsadmin', 'admin');
        openSavedAnswer(answer, 'table');
        verifyAnswerTableData(expected2, 4);

        deleteSavedAnswer(answer);
        goToUserManagementPage();
        deleteListItem(username);
    });

    it('should not show answer to user if it is deleted by admin', function() {
        var username = 'qaGUEST',
            password = 'qapass';
        var query = 'revenue color';
        var table1 = 'LINEORDER', table2 = 'PART';
        var expected = 'almond,168,004,329,antique,282,708,533';
        var answer = '[delete shared answer]';

        // admin share answer with user in edit mode
        adminUIFunctions.addNewUser(username, username, password, true);
        checkTableResult(TPCH_TABLES, query, 4, expected);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([username], answer, false);

        // user can see shared answer
        reLogin(username, password);
        answersTab().click();
        expect(element(listItemSelector(answer)).count()).toBe(1);

        // admin delete shared answer
        reLogin('tsadmin', 'admin');
        deleteSavedAnswer(answer);

        // user cannot see deleted answer
        reLogin(username, password);
        answersTab().click();
        expect(element(listItemSelector(answer)).count()).toBe(0);

        reLogin('tsadmin', 'admin');
        goToUserManagementPage();
        deleteListItem(username);
    });
});
