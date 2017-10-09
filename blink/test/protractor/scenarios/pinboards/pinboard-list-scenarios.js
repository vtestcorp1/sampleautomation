/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */
'use strict';

var pinboards = require('./pinboards.js');
var common = require('../common.js');
var uiSelect = require('../libs/ui-select.js');

describe('Pinboard metadata list', function () {
    beforeEach(function () {
        common.navigation.goToPinboardsSection();
    });

    it('should navigate to other pinboards', function () {
        var pinboardToOpen = 'Basic Pinboard 1';
        var pinboardToSelect = 'Genericjoin Pinboard 1';
        var somePlaceToClick = '.bk-document-author';

        pinboards.openPinboard(pinboardToOpen);
        uiSelect.changeSelection($(pinboards.selectors.PINBOARD_PLUGIN), pinboardToSelect, true);
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen);
        uiSelect.changeSelection($(pinboards.selectors.PINBOARD_PLUGIN), pinboardToSelect, true);
        common.util.waitForAndClick(by.css(somePlaceToClick));
        expect($(pinboards.selectors.PINBOARD_PLUGIN).getText()).toBe(pinboardToSelect);
    });

    it('should create an empty pinboard', function () {
        var pinboardName = 'pinboardName';

        pinboards.createPinboard(pinboardName);
        common.util.waitForElementToNotBePresent(common.util.selectors.ERROR_NOTIF);
        pinboards.deletePinboard(pinboardName);
    });
});
