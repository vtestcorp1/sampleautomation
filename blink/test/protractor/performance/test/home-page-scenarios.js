/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var benchmark = require('./../benchmark.js');
var common = require('../../scenarios/common.js');
var dataset = browser.params.dataset.homePageScenarios;
var homePage = require('../../scenarios/home-page/home');
var pinboards = require('../../scenarios/pinboards/pinboards');
var util = common.util;

var suite = benchmark.suite('home-page');
dataset.loadHomePage.forEach(function (input) {
    var pinboard = input.pinboard;
    suite.register('load-home-page ' + pinboard.name)
        // TODO(Rahul): Adding a reload app step to avert impact on test
        // measurements due to memory bloats from previous tests.
        .beforeAll(function () {
            common.navigation.reloadApp();
            common.navigation.goToHome();
            common.util.waitForInvisibilityOf(
                common.util.selectors.LOADING_INDICATOR_OVERLAY);
            return homePage.switchToPinboard(pinboard.name);
        })
        .afterAll(common.navigation.reloadApp)
        .withBounds(input.bounds)
        .before(util.logout.bind(util))
        .then(function() {
            util.login();
            return pinboards.waitForLoaded();
        });
});
suite.report();

var suite = benchmark.suite('home-page-switch-pinboard');
// Switch pinboards on home page.
dataset.switchPinboard.forEach(function (pair) {
    suite.register("home: " + pair.from.name + ' -> ' + pair.to.name)
        // (TODO: Rahul): Enable after bound error investigation.
        // .withBounds(pair.bounds)
        .before(function() {
            common.navigation.goToHome();
            homePage.switchToPinboard(pair.from.name);
            return pinboards.waitForLoaded();
        })
        .then(function () {
            homePage.switchToPinboard(pair.to.name);
            return pinboards.waitForLoaded();
        })
});
suite.report();
