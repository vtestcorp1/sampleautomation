/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var benchmark = require('./../benchmark.js');
var blinkList = require('../../scenarios/list/blink-list');
var common = require('../../scenarios/common.js');
var navigation = common.navigation;
var util = common.util;
var dataset = browser.params.dataset.listPageScenarios;

var suite = benchmark.suite('answers-list-page');
suite.register('load-list-page')
    .before(function () {
        return navigation.goToHome();
    })
    .then(function () {
        navigation.goToAnswerSection();
        return util.waitForElement(blinkList.selectors.LIST_CONTAINER);
    });

suite.report();

var suite = benchmark.suite('pinboards-list-page');
suite.register('load-list-page')
    .before(function () {
        return navigation.goToHome();
    })
    .then(function () {
        navigation.goToPinboardsSection();
        return util.waitForElement(blinkList.selectors.LIST_CONTAINER);
    });

suite.report();
