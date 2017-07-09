'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

describe('Worksheets', function () {

    beforeEach(function () {
        base.goHome();
    });

    // browser.params.worksheets is populated in onPrepare method of
    // worksheets_config.js
    // this is a bit hacky way to get list of all worksheets before describing tests
    base.forEachWithSlice(browser.params.worksheets, function (ws) {
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
                    base.expandError();
                } else {
                    base.editWorksheet(true);
                }
                base.waitForLoaderOrError().then(function (editError) {
                    if (editError) {
                        base.expandError();
                    }
                    base.takeScreenshot(
                        name,
                        'Screeenshot for worksheet "' + ws.name + '" (' + ws.id + ')',
                        error || editError
                    );
                });
            });
        });
    }, browser.params.start, browser.params.end);
});
