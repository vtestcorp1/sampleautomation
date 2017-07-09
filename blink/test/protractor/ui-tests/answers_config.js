"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

var config = base.BaseConfig();

config.specs = ['all-answers-scenarios.js'];
config.onPrepare = function () {
    base.prepare();
    base.goToSavedAnswers();
    browser.params.answers = [];
    return base.readAnswers().then(function (answers) {
        browser.params.answers = answers;
    });
};
config.params = {
    shouldLogin: true
};

exports.config = config;
