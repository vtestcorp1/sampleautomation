/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Chabbey Francois (francois.chabbeym@thoughtspot.com)
 *
 */

'use strict';
/* eslint camelcase: 1, no-undef: 0 */

var common = require('./common.js');
var util = common.util;


module.exports = {

    constants: {
        worksheet: 'Worksheet',
        all: 'All types',
        worksheetFilter: 'Worksheets',
        table: 'Table',
        tableFilter: 'Tables',
        you: 'Yours',
        everyone: 'All'
    },
    selectors: {
        FILTER_ITEM: '.bk-top-menu-filters',
        SELECTED: '.bk-selected',
        //TODO(chab) looks at filter implementation and try to fix that strange class
        FILTER_CATEGORY: 'bk-category-'
    },
    filterOnAuthor: function (author) {
        return this.filterOnType(author);
    },
    filterOnType: function (type) {
        var selector = this.selectors.FILTER_ITEM + ' li';
        return element(by.cssContainingText(selector, type)).click();
    },
    filterOnSticker: function (sticker) {
        //TODO(chab) Implement
    },
    checkIfFilterIsSelected: function (type, shouldBeSelected) {
        var filterSelector = util.joinSelectors(
            this.selectors.FILTER_ITEM,
            this.selectors.SELECTED + this.selectors.FILTER_CATEGORY);
        var filterLocator = by.cssContainingText(filterSelector, type);
        if (shouldBeSelected) {
            util.waitForVisibilityOf(filterLocator);
        }

    }
};
