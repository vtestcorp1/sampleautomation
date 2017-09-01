/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var common = require('../common.js');
var answer = require('../viz-layout/answer/answer.js');
var charts = require('../charts/charts');
var blinkList = require('../list/blink-list');
var leftPanel = require('../sage/data-panel/data-panel');
var filterDialog = require('../filters/filter-dialog');

describe('Viz pinning from answers', function () {

    it('[SMOKE][IE] user 2 (non-admin) should not be able to see' +
        ' pinboard created by admin', function () {
        var pinboardName = 'nonAdminShouldNotSee';

        var user = {
            name: 'guest1',
            password: 'guest1'
        };

        common.navigation.goToPinboardsSection();
        pinboards.createPinboard(pinboardName);

        common.util.reLogin(user.name, user.password);

        common.navigation.goToPinboardsSection();
        blinkList.waitForItemCountToBe(
            blinkList.selectors.ACTIONABLE_LIST_CONTENT, pinboardName, 0);

        common.util.reLogin();
        common.navigation.goToPinboardsSection();
        pinboards.deletePinboard(pinboardName);
    });

    it('[SMOKE] should be able to see pinboard with read-only permission', function() {
        var sources = ['Formula Worksheet'];
        var pinboardName = 'ReadOnlyPinboard';
        answer.doAdhocQuery('revenue by supplier suppkey', sources, charts.vizTypes.CHART);
       
        answer.addShowingVizToNewPinboard(pinboardName);
        
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        pinboards.openFilterPanel();

 
        leftPanel.waitForEnabledSource('Formula Worksheet');
        browser.pause();
        leftPanel.expandSource('Formula Worksheet');

        
        leftPanel.openFilter('Ship Mode');

       
        filterDialog.clickDone();

        common.navigation.goToPinboardsSection();
        pinboards.sharePinboard(pinboardName, ['guest1'], /*read only */ true);
        common.util.reLogin('guest1', 'guest1');
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardName);
        common.util.reLogin();
        common.navigation.goToPinboardsSection();
        pinboards.deletePinboard(pinboardName);
    });

    it('should not allow pinning to pinboards with view permission', function () {
        var pinboardName1 = 'PinboardName1';
        var pinboardName2 = 'PinboardName2';
        var user = {
            name: 'guest1',
            password: 'guest1'
        };

        var query = 'revenue customer region';
        var sources = ['LINEORDER', 'CUSTOMER'];

        common.navigation.goToPinboardsSection();
        pinboards.createPinboard(pinboardName1);

        common.navigation.goToPinboardsSection();
        pinboards.createPinboard(pinboardName2);

        common.navigation.goToPinboardsSection();
        pinboards.sharePinboard(pinboardName1, [user.name], true);
        pinboards.sharePinboard(pinboardName2, [user.name], false);
        common.util.reLogin(user.name, user.password);
        common.navigation.goToAnswerSection();
        answer.doAdhocQuery(query, sources, charts.vizTypes.CHART);

        answer.addShowingVizToPinboard(pinboardName2);
        answer.waitForPinboardAbsentInPinningDropdown(pinboardName1);

        common.util.reLogin();

        common.navigation.goToPinboardsSection();
        pinboards.deletePinboard(pinboardName1);
        pinboards.deletePinboard(pinboardName2);
    });
});
