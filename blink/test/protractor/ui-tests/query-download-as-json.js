/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Pavan Piratla (pavan@thoughtspot.com)
 * This script is to be used to download an answer as a JSON file.
 * Primarily works for on adhoc queries based answers.
 */

'use strict';

var answerPage = require('../scenarios/viz-layout/answer/answer');
var base = require('../base-do-not-use.js');
var common = require('../scenarios/common.js');
var fs = require('fs-extra');
var leftPanel = require('../scenarios/sage/data-panel/data-panel.js');
var path = require('path');
var table = require('../scenarios/table/table');
/* eslint camelcase: 1, no-undef: 0 */


describe('Download adhoc query answer as a json file: ', function() {
    it(browser.params.sageQuery, function() {
        common.navigation.goToQuestionSection();
        leftPanel.selectAllTables();
        answerPage.queryAndWaitForTable(browser.params.sageQuery);
        browser.executeScript(
            "window.testCapture.captureAndDownload('" + browser.params.saveAs + "');");
        browser.driver.wait(function() {
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // exiting and leaving the downloaded file incomplete. (.crdownload etc)
            // TODO (pavan): Hardcoding the downloads folder. So these tests have to
            // be called appropriately with the same folder in capabilities.
            return fs.existsSync('/tmp/teslaDownloads/' + browser.params.saveAs);
        }, 30000).then(function() {
            console.log('Download successful');
        });
    });
});
