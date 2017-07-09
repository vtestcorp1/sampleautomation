/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E tests for sharing tables and answers
 * test user and group permission to download, upload, share, and admin
 * for sharing, all users have permission to share answers with other members in the same group
 * however, only those with permission can share with users outside of their own groups
 * admin have permission to share system tables
 * both admin and owner have permission to share worksheets and imported data
 */

'use strict';

var PRIVILEGES = [
    "Has administration privileges",
    "Can upload user data",
    "Can download data",
    "Can share with all users",
    "Can manage data"
];

/* eslint camelcase: 1, no-undef: 0 */

describe('User/Group Permission Scenarios', function () {

    it('should allow user of group downloader to download data', function () {
        var userName = 'qatest1',
            groupName = 'qa-downloader';
        var query = 'revenue color';
        var expected = 'almond,168,004,329,antique,282,708,533';
        var answer = '[download test]';

        goToGroupManagement();
        adminUIFunctions.addNewGroup(groupName);
        adminUIFunctions.addNewUser(userName, userName, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(userName);
        adminUIFunctions.save();

        // create and share answer with user in view mode
        checkTableResult(TPCH_TABLES, query, 4, expected);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([userName], answer, false);

        // user should be able to download table or chart from shared answer
        reLogin(userName, '1234');
        openSavedAnswer(answer, 'table');
        verifyPermissionDownload(true);
        selectViz('column');
        verifyPermissionDownload(true);

        // now turn off download permission for group downloader
        reLogin('tsadmin', 'admin');
        goToGroupManagement();
        adminUIFunctions.deleteListItem(groupName);

        // user should now be prevented from downloading table or chart from shared answer
        reLogin(userName, '1234');
        openSavedAnswer(answer, 'table');
        verifyPermissionDownload(false);
        selectViz('column');
        verifyPermissionDownload(false);

        reLogin('tsadmin', 'admin');
        deleteSavedAnswer(answer);
        goToUserManagementPage();
        deleteListItem(userName);
    });

    it('should allow user of group uploader to upload data', function () {
        var userName = 'qatest2',
            groupName = 'qa-uploader';

        goToGroupManagement();
        adminUIFunctions.addNewGroup(groupName, groupName, [PRIVILEGES[0]]);
        adminUIFunctions.addNewUser(userName, userName, '1234', true);

        goToGroupManagement();
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(userName);
        adminUIFunctions.save();

        // user should be able to upload data
        reLogin(userName, '1234');
        verifyPermissionUpload(true);
        reLoginSimple(ADMIN_USERNAME, ADMIN_PASSWORD);

        // now turn off upload permission for group uploader
        reLogin('tsadmin', 'admin');
        goToGroupManagement();
        selectUserOrGroup(groupName);
        uncheckDataLabels();

        // user should now be prevented from uploading
        reLogin(userName, '1234');
        verifyPermissionUpload(false);

        reLogin('tsadmin', 'admin');
        goToUserManagementPage();
        deleteListItem(userName);
    });

    it('should allow user of group sharer to share answers', function () {
        var userName = 'qatest3',
            groupName = 'qa sharer';
        var fooUser1 = 'foo1',
            fooUser2 = 'foo2',
            fooGroup = 'foo group';
        var query = 'revenue color';
        var expected = 'almond,168,004,329,antique,282,708,533';
        var answer = '[share test - 1]';

        goToGroupManagement();
        adminUIFunctions.addNewGroup(groupName, groupName, [PRIVILEGES[0]]);
        adminUIFunctions.addNewUser(userName, userName, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(userName);
        adminUIFunctions.save();

        // create user foo1 that belongs to a different group
        answersTab().click();
        goToGroupManagement();
        adminUIFunctions.addNewGroup(fooGroup);
        adminUIFunctions.addNewUser(fooUser1, fooUser1, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, fooGroup) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(fooUser1);
        adminUIFunctions.save();

        // create user foo2 that belongs to the same group
        answersTab().click();
        adminUIFunctions.addNewUser(fooUser2, fooUser2, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(fooUser2);
        adminUIFunctions.save();

        // create and share answer with user in view mode
        checkTableResult(TPCH_TABLES, query, 4, expected);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([userName], answer, false);

        // user should be able to share answer with both foo1 and foo2
        reLogin(userName, '1234');
        shareAnswerWithUser([fooUser1, fooUser2], answer, false);

        reLogin(fooUser1, '1234');
        openSavedAnswer(answer, 'table');
        verifyAnswerTableData(expected, 4);
        reLogin(fooUser2, '1234');
        openSavedAnswer(answer, 'table');
        verifyAnswerTableData(expected, 4);

        reLogin('tsadmin', 'admin');
        deleteSavedAnswer(answer);
        goToUserManagementPage();
        deleteListItem(userName);
        deleteListItem(fooUser1);
        deleteListItem(fooUser2);
        goToGroupManagement();
        deleteListItem(groupName);
        deleteListItem(fooGroup);
    });

    it('should always allow user to share answer with his own group', function() {
        var userName = 'qatest4',
            groupName = 'qa noshare';
        var fooUser1 = 'foo1',
            fooUser2 = 'foo2',
            fooGroup = 'foo group';
        var query = 'revenue color';
        var expected = 'almond,168,004,329,antique,282,708,533';
        var answer = '[share test - 2]';

        // create user with no share privilege
        goToGroupManagement();
        adminUIFunctions.addNewGroup(groupName);
        adminUIFunctions.addNewUser(userName, userName, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(userName);
        adminUIFunctions.save();

        // create user foo1 that belongs to a different group
        answersTab().click();
        goToGroupManagement();
        adminUIFunctions.addNewGroup(fooGroup);
        adminUIFunctions.addNewUser(fooUser1, fooUser1, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, fooGroup) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(fooUser1);
        adminUIFunctions.save();

        // create user foo2 that belongs to the same group
        answersTab().click();
        adminUIFunctions.addNewUser(fooUser2, fooUser2, '1234', true);
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(fooUser2);
        adminUIFunctions.save();

        // create and share answer with user in view mode
        checkTableResult(TPCH_TABLES, query, 4, expected);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([userName], answer, false);

        // user should be prevented from sharing with foo1
        reLogin(userName, '1234');
        shareAnswerWithUser([fooUser1, fooUser2], answer, false);
        reLogin(fooUser1, '1234');
        expect(answerContaining(answer).count()).toBe(0);

        // however, user should still be able to share answer with foo2
        reLogin(userName, '1234');
        shareAnswerWithUser([fooUser1, fooUser2], answer, false);
        reLogin(fooUser2, '1234');
        answersTab().click();
        expect(answerContaining(answer).count()).toBe(1);
        openSavedAnswer(answer, 'table');
        verifyAnswerTableData(expected, 4);

        reLogin('tsadmin', 'admin');
        deleteSavedAnswer(answer);
        goToUserManagementPage();
        deleteListItem(userName);
        deleteListItem(fooUser1);
        deleteListItem(fooUser2);
        goToGroupManagement();
        deleteListItem(groupName);
        deleteListItem(fooGroup);
    });

    it('should allow user of group admin to delete answer', function () {
        var userName = 'qatest5',
            groupName = 'qa admin';
        var fooUser = 'foo',
            fooGroup = 'foo group';
        var query = 'revenue color';
        var expected = 'almond,168,004,329,antique,282,708,533';
        var answer = '[delete test]';

        // create user with admin privilege and control user that has no admin privilege
        goToGroupManagement();
        adminUIFunctions.addNewGroup(groupName, groupName, [PRIVILEGES[0]]);
        adminUIFunctions.addNewUser(userName, userName, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(userName);
        adminUIFunctions.save();

        answersTab().click();
        goToGroupManagement();
        adminUIFunctions.addNewGroup(fooGroup);
        adminUIFunctions.addNewUser(fooUser, fooUser, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, fooGroup) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(fooUser);
        adminUIFunctions.save();

        // create and share answer with user in view mode
        checkTableResult(TPCH_TABLES, query, 4, expected);
        saveCurrentAnswer(answer);
        shareAnswerWithUser([userName], answer, false);
        shareAnswerWithUser([fooUser], answer, false);

        // foo user should not be able to delete answer
        reLogin(fooUser, '1234');
        answersTab().click();
        element(contains(ANSWER_ITEM, answer) + ' .bk-checkbox').click();
        expect(checkClass(DELETE_ICON, 'bk-disabled')).toBe(true);

        // user should delete answer
        reLogin(userName, '1234');
        deleteSavedAnswer(answer);
        reLogin('tsadmin', 'admin');
        answersTab().click();
        expect(answerContaining(answer).count()).toBe(0);

        goToUserManagementPage();
        deleteListItem(userName);
        deleteListItem(fooUser);
        goToGroupManagement();
        deleteListItem(groupName);
        deleteListItem(fooGroup);
    });

    it('should allow user of group admin to access admin menu', function () {
        var userName = 'qatest6',
            groupName = 'qa admin';
        var fooUser = 'foo',
            fooGroup = 'foo group';

        // create user with admin privilege and control user that has no admin privilege
        goToGroupManagement();
        adminUIFunctions.addNewGroup(groupName, groupName, [PRIVILEGES[0]]);
        adminUIFunctions.addNewUser(userName, userName, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(userName);
        adminUIFunctions.save();

        goToGroupManagement();
        adminUIFunctions.addNewGroup(fooGroup);
        adminUIFunctions.addNewUser(fooUser, fooUser, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, fooGroup) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(fooUser);
        adminUIFunctions.save();

        // verify user should have access to admin menu
        reLogin(userName, '1234');
        element(ADMIN_NAV_TAB).click();
        sleep(3);
        expect(browser().location().url()).toBe(ADMIN_ROUTE);

        // verify control user has no access to admin menu
        reLogin(fooUser, '1234');
        element(ADMIN_NAV_TAB).click();
        sleep(3);
        expect(browser().location().url()).toBe('/');

        reLogin('tsadmin', 'admin');
        goToUserManagementPage();
        deleteListItem(userName);
        deleteListItem(fooUser);
        goToGroupManagement();
        deleteListItem(groupName);
        deleteListItem(fooGroup);
    });

    it('should allow user of group admin to share system tables', function () {
        var userName = 'qatest7',
            groupName = 'qa admin';
        var fooUser = 'foo',
            fooGroup = 'foo group';
        var table = 'LINEORDER';

        // create user with admin privilege and control user that has no admin privilege
        goToGroupManagement();
        adminUIFunctions.addNewGroup(groupName, groupName, [PRIVILEGES[0]]);
        adminUIFunctions.addNewUser(userName, userName, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, groupName) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(userName);
        adminUIFunctions.save();
        answersTab().click();

        goToGroupManagement();
        adminUIFunctions.addNewGroup(fooGroup);
        adminUIFunctions.addNewUser(fooUser, fooUser, '1234', true);
        goToGroupManagement();
        element(contains(LIST_ITEM, fooGroup) + ' .bk-name').click();
        adminUIFunctions.selectUserInGroupPanel(fooUser);
        adminUIFunctions.save();

        // share table with both users
        dataTab().click();
        shareTableWithUser(table, userName);
        answersTab().click();
        dataTab().click();
        shareTableWithUser(table, fooUser);

        // foo should not be allowed to share system table
        reLogin(fooUser, '1234');
        dataTab().click();
        searchByName(table);
        element(contains(META_ITEMS, table) + ' .bk-checkbox').click();
        expect(checkClass(SHARE_WS_BTN, 'bk-disabled')).toBe(true);

        // user should be allowed to share system table
        reLogin(userName, '1234');
        dataTab().click();
        searchByName(table);
        element(contains(META_ITEMS, table) + ' .bk-checkbox').click();
        expect(checkClass(SHARE_WS_BTN, 'bk-disabled')).toBe(false);

        reLogin('tsadmin', 'admin');
        goToUserManagementPage();
        deleteListItem(userName);
        deleteListItem(fooUser);
        goToGroupManagement();
        deleteListItem(groupName);
        deleteListItem(fooGroup);
    });

    // TODO(Shitong)
    xit('should allow worksheet owner to share worksheet', function() {
        var userName = 'qatest7',
            groupName = 'qa';
        var fooUser1 = 'foo1',
            fooUser2 = 'foo2',
            fooGroup = 'foo group';
        var table = 'LINEORDER',
            worksheet = 'qa worksheet test';

        addNewGroupByName(groupName, []);
        addNewUser(userName, userName, '1234', true);
        toggleUserAssignmentToGroup(userName, groupName);
        answersTab().click();
        addNewGroupByName(fooGroup, []);
        addNewUser(fooUser1, fooUser1, '1234', true);
        toggleUserAssignmentToGroup(fooUser1, fooGroup);
        answersTab().click();
        addNewUser(fooUser2, fooUser2, '1234', true);
        toggleUserAssignmentToGroup(fooUser2, fooGroup);
        dataTab().click();
        shareTableWithUser(table, fooUser1);

        reLogin(fooUser1, '1234');
        createSimpleWorksheet({
            title: worksheet,
            sources: [table]
        });

        // foo1 should be allowed to share worksheet as the creator
        dataTab().click();
        shareTableWithUser(worksheet, fooUser2);

        // foo2 should not be allowed to share the worksheet
        reLogin(fooUser2, '1234');
        dataTab().click();
        expect(worksheetContaining(worksheet).count()).toBe(1);
        element(contains(META_ITEMS, worksheet) + ' .bk-checkbox').click();
        expect(checkClass(SHARE_WS_BTN, 'bk-disabled')).toBe(true);

        // admin should always be allowed to share worksheet
        reLogin('tsadmin', 'admin');
        dataTab().click();
        searchByName(worksheet);
        element(contains(META_ITEMS, worksheet) + ' .bk-checkbox').click();
        expect(checkClass(SHARE_WS_BTN, 'bk-disabled')).toBe(false);

        goToUserManagementPage();
        deleteListItem(userName);
        deleteListItem(fooUser1);
        deleteListItem(fooUser2);
        goToGroupManagement();
        deleteListItem(groupName);
        deleteListItem(fooGroup);
        dataTab().click();
        deleteWorksheet(worksheet);
    });

    // TODO(Shitong)
    xit('should allow imported data owner to share imported data', function() {
        var fooUser1 = 'foo1',
            fooUser2 = 'foo2',
            fooGroup = 'foo group';
        var CSV_HEADER = 'Date,Vendor,Amount,Transaction Type,Category,Account Name',
            CSV_VALID_ROWS = ['01/13/2012,IKEA,113.91,debit,Furnishings,BUSINESS CHECKING', '01/22/2012,DIKEA,1113.91,credit,Durnishings,DUSINESS CHECKING'],
            CSV_HEADER_TYPES = ['DATE', 'TEXT', 'DECIMAL', 'TEXT', 'TEXT', 'TEXT'],
            CSV_FILE_NAME = 'qatest.csv',
            CSV_TABLE_NAME = 'qatest';

        // create user with upload permission
        addNewGroupByName(fooGroup, ['upload']);
        addNewUser(fooUser1, fooUser1, '1234', true);
        toggleUserAssignmentToGroup(fooUser1, fooGroup);
        answersTab().click();
        addNewUser(fooUser2, fooUser2, '1234', true);
        toggleUserAssignmentToGroup(fooUser2, fooGroup);

        // foo1 imports a csv file
        reLogin(fooUser1, '1234');
        dataTab().click();
        clickImportDataButton();
        userDataUploadFunctions.mockUploadFile(CSV_FILE_NAME, [CSV_HEADER, CSV_VALID_ROWS[0]].join('\n'));
        userDataUploadFunctions.setHeaderDefined(true);
        userDataUploadFunctions.clickNext();
        verifyColumnHeaderNames(CSV_HEADER);
        verifyColumnData(CSV_VALID_ROWS[0]);
        userDataUploadFunctions.clickNext();
        verifyColumnHeaderTypes(CSV_HEADER_TYPES);
        userDataUploadFunctions.clickNext();
        userDataUploadFunctions.clickImportButton();
        verifySuccessStepVisible();
        verifyNumberOfRowsInTable(CSV_TABLE_NAME, 1);

        // foo1 should be allowed to share worksheet as the creator
        dataTab().click();
        shareTableWithUser(CSV_TABLE_NAME, fooUser2);

        // foo2 can see the worksheet, but is not allowed to share
        reLogin(fooUser2, '1234');
        dataTab().click();
        expect(element(contains(META_ITEMS, CSV_TABLE_NAME)).count()).toBe(1);
        element(contains(META_ITEMS, CSV_TABLE_NAME) + ' .bk-checkbox').click();
        expect(checkClass(SHARE_WS_BTN, 'bk-disabled')).toBe(true);

        // admin should always be allowed to share worksheet
        reLogin('tsadmin', 'admin');
        dataTab().click();
        searchByName(CSV_TABLE_NAME);
        element(contains(META_ITEMS, CSV_TABLE_NAME) + ' .bk-checkbox').click();
        expect(checkClass(SHARE_WS_BTN, 'bk-disabled')).toBe(false);

        goToUserManagementPage();
        deleteListItem(fooUser1);
        deleteListItem(fooUser2);
        goToGroupManagement();
        deleteListItem(fooGroup);
        dataTab().click();
        userDataUploadFunctions.deleteMockCSV(CSV_TABLE_NAME);
    });
});
