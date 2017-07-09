/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for support utilities.
 */

'use strict';

var common = require('../common');
var leftPanel = require('../sage/data-panel/data-panel');

describe('Support', function () {
    beforeAll(function() {
        common.navigation.goToHome();
        common.navigation.addUrlParameter('successAlertHidingDelay', 5000);
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });

    afterAll(function() {
        common.navigation.goToHome();
        common.navigation.removeUrlParameter('successAlertHidingDelay');
        browser.wait(common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR));
    });

    function mockSaveAs() {
        var cmd = 'window.stockSaveAs = window.saveAs; ' +
            'window.saveAsCalled = false; ' +
            'window.saveAs = function() { saveAsCalled = true; };';
        return browser.executeScript(cmd);
    }

    function unMockSaveAs() {
        var cmd = 'window.saveAs = window.stockSaveAs; ' +
            'delete window.saveAsCalled;';
        return browser.executeScript(cmd);
    }

    beforeEach(function(){
        mockSaveAs();
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.clickDone();
    });

    afterEach(function(){
        unMockSaveAs();
    });

    it('[SMOKE][IE] should provide user a link to download debug log', function () {
        // Capturing debug info takes a dump of the entire angular scope tree
        // which can be cpu intensive. To reduce the load and avoid browser crash
        // we trigger this on a page that has very little state.
        browser
            .actions()
            .sendKeys(protractor.Key.chord(protractor.Key.CONTROL, protractor.Key.SHIFT, 'k'))
            .perform();
        common.util.openSuccessLink2();
        var cmd = 'return window.saveAsCalled;';
        browser.executeScript(cmd).then(function(wasSaveAsCalled) {
            expect(wasSaveAsCalled).toBe(true);
        });
    });
});
