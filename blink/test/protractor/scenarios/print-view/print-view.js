/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 */

'use strict';

var pinboards = require('../pinboards/pinboards');
var common = require('../common');


var selectors = {
    BK_PRINT: '.bk-print'
};

function openPinboardInPrintView(pinboardName) {
    common.navigation.goToPinboardsSection();
    pinboards.openPinboard(pinboardName);
    browser.getCurrentUrl().then(function(currentUrl) {
        return browser.get(currentUrl.replace('#/pinboard/', '#/print/'));
    });
    common.util.waitForElement(
        common.util.joinSelectors(selectors.BK_PRINT, pinboards.selectors.PINBOARD_LOADED)
    );
}

module.exports = {
    openPinboardInPrintView
};
