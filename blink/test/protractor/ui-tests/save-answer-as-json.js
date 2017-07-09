/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Pavan Piratla (pavan@thoughtspot.com)
 * This script is to be used to download an answer as a JSON file.
 * Primarily works for table based answers. For charts, only title
 * and description are useful parameters in the JSON.
 */

'use strict';

var base = require('../base-do-not-use.js');
var fs = require('fs-extra');
var path = require('path');
/* eslint camelcase: 1, no-undef: 0 */

var savedAnswers = require('../scenarios/saved-answers/saved-answers.js');


describe('Download saved answer as a json file: ', function() {
    it(browser.params.ownerGuid, function() {
        savedAnswers.verifyAnswerOpenable(browser.params.ownerGuid, "").then(function(retValue) {
            if (retValue) {
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
            }
        });
    });
});
