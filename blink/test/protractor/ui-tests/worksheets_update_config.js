"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

var config = base.BaseConfig();

config.specs = ['all-worksheets-update-scenarios.js'];
config.onPrepare = function () {
    base.prepare();
    base.goToWorksheets();
    browser.params.worksheets = [];
    return base.readWorksheets(true).then(function (worksheets) {
        browser.params.worksheets = worksheets.filter(function (item) {
            // Skip Aggregated Worksheets
            return item.type === 'WORKSHEET';
        });
    });
};
config.params = {
    shouldLogin: true
};

exports.config = config;
