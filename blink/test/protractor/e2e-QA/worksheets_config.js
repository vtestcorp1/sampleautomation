"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

var config = base.BaseConfig();

config.specs = ['worksheets-scenarios.js'];
config.onPrepare = function() {
    // super.onPrepare();
    base.prepare();
    base.goToWorksheets();
    browser.params.worksheets = [];
    return base.readWorksheets().then(function (worksheets) {
        browser.params.worksheets = worksheets.filter(function (item) {
            return item.type === 'WORKSHEET';
        });
    });
};

exports.config = config;
