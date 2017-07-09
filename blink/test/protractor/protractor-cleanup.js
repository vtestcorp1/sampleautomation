/**
 * Copyright ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 */

'use strict';

var dialog = require('./scenarios/dialog');
var formula = require('./scenarios/formula/formula');
var pinboards = require('./scenarios/pinboards/pinboards');
var util = require('./scenarios/common').util;

// This beforeEach block will run after every test, we use this to perform some cleanup that might
// be necessary before next test can run.
afterEach(function() {
    dialog.closeDialogIfOpen();
    pinboards.closeVizContextIfOpen();
    util.dismissNotificationIfPresent();
    formula.closeFormulaEditorIfOpen();
});
