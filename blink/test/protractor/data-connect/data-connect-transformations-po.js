/**
 * Copyright Thoughtspot Inc. 2017
 * Author: Rahul Balakavi (rahul.balakavi@thoughtspot.com)
 */
'use strict';

var common = require('../scenarios/common');
var dialog = require('../scenarios/dialog');
var select = require('../scenarios/select/select');

var selectors = {
    ADD_FILTER_BUTTON: '.bk-add-data-filter-btn .bk-secondary-button',
    ADD_EXPRESSION_BUTTON: '.bk-add-transform-btn .bk-secondary-button',
    EXPAND_FILTER_FUNCTIONS: '.bk-filter-operand'
};

var locators = {
    ADD_FILTER_BUTTON: by.cssContainingText(selectors.ADD_FILTER_BUTTON, 'Add filter'),
    EXPAND_FILTER_FUNCTIONS: by.css(selectors.EXPAND_FILTER_FUNCTIONS)
};

module.exports = {
    selectors: selectors,
    locators: locators
};
