'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var LOGGERS_MENUITEM = 'ul.bk-tab-header li:contains("Loggers")';
var MEMCACHE_MENUITEM = 'ul.bk-tab-header li:contains("Memcache")';
var METADATA_MENUITEM = 'ul.bk-tab-header li:contains("Metadata")';
var APPLY_BTN = '.bk-logger-item button:visible:contains("Apply")';
var MEMCACHE_USER_SELECT_OPTION = '.bk-select-box select[ng-model="memcacheSearch.user"] option';
var MEMCACHE_GUID_SELECT_OPTION = '.bk-select-box select[ng-model="memcacheSearch.currentObject"] option';

function waitForLoggerLevels() {
    waitFor(function (appWindow) {
        return appWindow.$('.bk-logger-item').length !== 0;
    });
}

function waitForCharts() {
    waitFor(function (appWindow) {
        return appWindow.$('div.canvas ' + HIGHCHARTS_CONTAINER_CLASS + ' rect').length !== 0;
    });
}

function waitForMetadataList() {
    waitFor(function (appWindow) {
        return appWindow.$('div.bk-list-content ul li').length === 15;
    });
}

describe('Debug section', function () {

    beforeEach(function () {
        goToDebugPage();
    });

    //TODO(Rahul): Give logger event a success notificaiton and then enable this test
    xit('Should show the list of loggers on the loggers page. All levels set to INFO by default.', function () {
        // Go to loggers page
        element(LOGGERS_MENUITEM).click();

        var options = element('.bk-logger-item option:selected');
        for (var i = 0; i < options.count(); i++) {
            expect(options[i].text()).toBe('INFO');
        }

        // change first logger level to WARN
        selectChosenOption('.bk-select-box select', 'WARN');

        // click the Apply btn
        expect(element(APPLY_BTN).count()).toBe(1);
        element(APPLY_BTN).click();

        expectSuccessNotif();

        // Expect apply button to disappear
        expect(element(APPLY_BTN).count()).toBe(0);

        // Revert back the loglevel
        selectChosenOption('.bk-select-box select', 'INFO');
        expect(element(APPLY_BTN).count()).toBe(1);
        element(APPLY_BTN).click();
        expectSuccessNotif();
    });

    xit('Should show memcache stats on memcache page', function () {
        // Go to memcache page
        element(MEMCACHE_MENUITEM).click();

        // Make sure stats charts were rendered
        waitForCharts();

        // Make sure search form rendered correctly
        expect(element(MEMCACHE_USER_SELECT_OPTION).count()).toBe(6);
        expect(element(MEMCACHE_GUID_SELECT_OPTION).count()).toBe(21);
    });

    xit('Should show metadata list on metadata page', function () {
        // Go to metadata page
        element(METADATA_MENUITEM).click();

        // Make sure metadata list for default search params is rendered
        waitForMetadataList();
    });
});
