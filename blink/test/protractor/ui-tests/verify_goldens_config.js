"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var base = require('../base-do-not-use.js');

var config = base.BaseConfig();

config.specs = ['verify-goldens-scenarios.js'];
config.onPrepare = function () {
    base.prepare();
    var common = require('../scenarios/common.js');
    var nav = common.navigation;
    var tag = require('../scenarios/tagging/tag.js');
    var util = common.util;
    var labelName = browser.params.labelName;
    nav.addUrlParameter('testCapture', true);
    nav.goToAnswerSection();
    browser.params.answers = [];
    tag.showLabelPanel();
    tag.verifyLabelExists(labelName);
    tag.clickLabelFilter(labelName);
    util.waitForAndClick(nav.selectors.ANSWERS_SECTION);
    return base.readAnswers().then(function (answers) {
        browser.params.answers = answers;
    });
};
config.params = {
    shouldLogin: true
};

exports.config = config;
