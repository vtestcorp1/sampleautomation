'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

describe('Worksheets', function () {

    beforeEach(function () {
        base.goToWorksheets();
    });

    // browser.params.worksheets is populated in onPrepare method of
    // worksheets_update_config.js
    // this is a bit hacky way to get list of all worksheets before describing tests
    base.forEachWithSkip(browser.params.worksheets, function (ws) {
        var name = 'ws-' + ws.name + '[' + ws.id + ']';
        if (base.shouldSkipTest(name)) {
            return;
        }
        it('should open worksheet ' + ws.name, function () {
            if (base.shouldSkipTest(name)) {
                return;
            }
            base.goToWorksheet(ws.id);
            base.waitForLoaderOrError().then(function (error) {
                if (error) {
                    return base.expandError().then(function () {
                        return true;
                    });
                } else {
                    return base.editWorksheet(true).then(function () {
                        return base.addFormulaToWorksheet("1+1").then(function () {
                            return false;
                        });
                    });
                }
            }).then(function (hadError) {
                return base.waitForLoaderOrError().then(function () {
                    return base.takeScreenshot(
                        name,
                        'Screeenshot for worksheet "' + ws.name + '" (' + ws.id + ')',
                        hadError
                    );
                });
            });
        });
    }, browser.params.skip);
});
