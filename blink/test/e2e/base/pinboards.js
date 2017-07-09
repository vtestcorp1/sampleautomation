/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Utilities and definitions for pinboard e2es
 */

/*eslint no-undef: 0 */

'use strict';

var TEST_PINBOARD_NAME = '[ Test Pinboard ]',
    TEST_PINBOARD_NAME_2 = '[ Test Pinboard 2 ]',
    PINBOARD_SAGE_QUERY = 'revenue color for color azure for color black for color coral';

function createEmptyPinboard(title) {
    title = title || TEST_PINBOARD_NAME;

    navigationFunctions.goToPinboards();
    clickNewPinboardButton();
    pinboardFunctions.waitForNewPinboardModalNameInput();
    // Type a name for the new pinboard
    input('data.customData.pinboardName').enter(title);
    // Click create
    primaryDialogBtn().click();
}

function addShowingVizToNewPinboard(viz, useEnterKey, name) {
    // Click on the pin in the viz header to add the viz to a pinboard
    pinboardFunctions.openPinnerModal();
    // Click the button to reveal the create new pinboard input
    element(PINBOARD_DROP_DOWN_SHOW_NEW_BTN).click();
    // Type a name for the new pinboard
    input('newPinboardName').enter(name || TEST_PINBOARD_NAME);
    if (useEnterKey) {
        // Validate by pressing the enter key
        keypress('.bk-new-pinboard-input input', 13, true, true, true);
    } else {
        // Validate by clicking the button next to the input
        element(PINBOARD_DROP_DOWN_ADD_BTN).click();
    }
    // Click the menu button again to close it
    pinboardFunctions.openPinnerModal();
}

function addChartVizToPinboard(name) {
    var pbName = name || TEST_PINBOARD_NAME;
    // Click on the pin in the viz header to add the viz to a pinboard
    pinboardFunctions.openPinnerModal();
    // Select the test pinboard in the list
    pinboardInPinboardDropDown(pbName).click();
    // Click the menu button again to close it
    pinboardFunctions.openPinnerModal();
}

function addVizToPinboard(vizType, pinboardName) {
    // Click on the pin in the viz header to add the viz to a pinboard
    pinboardFunctions.openPinnerModal();
    // Select the test pinboard in the list
    pinboardInPinboardDropDown(pinboardName).click();
    // Click the menu button again to close it
    pinboardFunctions.openPinnerModal();
}

function loadQuery(query) {
    goToAnswer();
    sageInputElement().enter(query);
    waitForHighcharts();
}

function createPinboard(useEnterKey, query, vizToPin, name) {
    // Type a sage query
    loadQuery(query || PINBOARD_SAGE_QUERY);
    vizToPin = vizToPin || CHART_VIZ;
    if (vizToPin == TABLE_VIZ) {
        waitForTableAnswerVisualizationMode();
        addShowingVizToNewPinboard(TABLE_VIZ, useEnterKey, name);
    } else {
        addShowingVizToNewPinboard(vizToPin, useEnterKey, name);
    }
}

function createNamedPinboard(name) {
    createPinboard(false, undefined, undefined, name);
}

function delPinboard(pinboardName) {
    pinboardName = pinboardName || TEST_PINBOARD_NAME;
    deletePinboard(pinboardName);
}

function openPinboard(name) {
    // Go to the pinboards tab
    pinboardsTab().click();
    name = name || TEST_PINBOARD_NAME;
    // Open the pinboard
    pinboardListItemContaining(name).click();
}

// Generates an answer and opens a pinboard drop down
function openPinboardDropDown(VIZ_TYPE) {
    VIZ_TYPE = VIZ_TYPE || TABLE_VIZ;
    // Open an answer
    goToAnswer();
    queryAndWaitForChart(PINBOARD_SAGE_QUERY);
    // Open the pinboard menu
    pinboardFunctions.openPinnerModal();
}

function sharePinboard(pinboardName, userName, permissionType) {
    openPinboard(pinboardName);
    shareBtn().click();
    shareFunctions.addUserHeader().click();
    // Pick a user through the add user autocomplete input
    selectUiSelectOption(shareFunctions.selectors.SHARE_DIALOG_ADD_USER_SELECT, userName);
    // Give edit permissions
    select('newPermissionType').option(permissionType);
    shareFunctions.addPermissionsBtn().click();
    shareFunctions.doneBtn().click();
}

function createAndOpenPinboardWithChart(pinboardName) {
    var name = pinboardName || TEST_PINBOARD_NAME;
    goToAnswer();
    queryAndWaitForChart(PINBOARD_SAGE_QUERY);
    addShowingVizToNewPinboard(CHART_VIZ, void 0, name);
    openPinboard(pinboardName);
    waitForHighcharts();
}
