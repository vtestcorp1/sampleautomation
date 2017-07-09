/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for jobs administration
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

var common = require('../common.js');
var nav = common.navigation;
var adminUI = require('../admin-ui/admin-ui.js');

describe('Access to jobs page on admin page', function() {
    it("[SMOKE] should be accessible for admin user", function() {
        nav.goToAdminSection();
        adminUI.checkForTab(adminUI.adminTabs.JOBS_MANAGEMENT);
    });
});
