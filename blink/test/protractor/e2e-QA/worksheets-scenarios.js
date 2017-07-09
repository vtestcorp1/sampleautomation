'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

describe('Worksheets', function () {

    beforeAll(function () {
        base.goToWorksheets();
    });

    var handleError = function(ws) {
        base.expandError();
        // take a screenshot to help debugging
        base.waitForLoaderOrError().then(function () {
            base.takeScreenshot(
                'ws-' + ws.name + '[' + ws.id + ']',
                'Screeenshot for worksheet "' + ws.name + '" (' + ws.id + ')',
                true
            );
        });
        // Force test failure
        fail('Red bar is present on the page');
    };

    function resolvePopups() {
        return $('.bk-dialog.modal').isPresent().then(function (hasPopup) {
            if (hasPopup) {
                return $('.bk-join-path-dialog').isPresent().then(function (isJoinPath) {
                    if (isJoinPath) {
                        $('.bk-join-path-dialog .bk-mjp-options .bk-clickable').click();
                        browser.sleep(500);
                        return $('.bk-dialog .bk-confirm-btn').click();
                    } else {
                        $('.bk-dialog.modal input[type=text]').sendKeys('prefix_');
                        browser.sleep(500);
                        return $('.bk-save-btn').click();
                    }
                }).then(resolvePopups);
            }
        });
    }

    function testWorksheetModification(ws, originalColumnCount) {
        // Click the first source name
        $('.bk-source-header .bk-source-name').click();
        // Click 'Add Columns' button
        $('.bk-add-columns-btn').click();
        base.waitForLoaderOrError().then(function (error) {
            if (error) {
                handleError(ws);
            }
            resolvePopups().then(function () {
                base.waitForLoaderOrError().then(function (error) {
                    element(by.cssContainingText('.bk-submenu-item-label', 'Save')).click();
                    expect(error).toBeFalsy();
                    expect(getWorksheetLength()).toBeGreaterThan(originalColumnCount - 1);
                });
            });
        });
    }

    function getWorksheetLength() {
        return element(by.css('.grid-canvas'))
            .evaluate('grid.getData().getLength()');
    }

    // browser.params.worksheets is populated in onPrepare method of
    // worksheets_config.js
    // this is a bit hacky way to get list of all worksheets before describing tests
    base.forEachWithSkip(browser.params.worksheets, function (ws) {
        // Skip 'ts: ' worksheets
        if (ws.name.toLowerCase().startsWith('ts: ')) {
            return;
        }
        it('should open worksheet ' + ws.name, function () {
            base.goToWorksheet(ws.id);
            base.waitForLoaderOrError().then(function (error) {
                if (error) {
                    handleError(ws);
                }
                base.editWorksheet().then(function () {
                    getWorksheetLength().then(function (length) {
                        testWorksheetModification(ws, length);
                    });
                });
            });
        });
    }, browser.params.skip);
});
