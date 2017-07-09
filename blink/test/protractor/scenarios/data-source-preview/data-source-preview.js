'use strict';

var common = require('../common.js');
var util = common.util;

var selectors = {
    DATA_SOURCE_PREVIEW: '.bk-data-source-preview'
};

selectors.DATA_SOURCE_TEXT = util.joinSelectors(selectors.DATA_SOURCE_PREVIEW, '.bk-text-blue');

function clickDataSourcePreview() {
    util.waitForAndClick(selectors.DATA_SOURCE_PREVIEW);
}

function hoverOnDataSourcePreview() {
    util.mouseMoveToElement(selectors.DATA_SOURCE_PREVIEW);
}

function checkNumberOfSources(numberOfSources) {
    util.waitForTextToBePresentInElement(selectors.DATA_SOURCE_TEXT, numberOfSources);
}

function discardIfNeeded() {
    $(selectors.DATA_SOURCE_PREVIEW).isPresent().then(function(result) {
        if (result) {
            clickDataSourcePreview();
        }
    });
}

module.exports = {
    checkNumberOfSources: checkNumberOfSources,
    clickDataSourcePreview: clickDataSourcePreview,
    discardIfNeeded: discardIfNeeded,
    hoverOnDataSourcePreview: hoverOnDataSourcePreview
};
