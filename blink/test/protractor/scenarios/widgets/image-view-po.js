/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');

var locators = {
    IMAGE: by.css('.bk-image-viewer-image')
};

function getImageUrl(rootElement) {
    return rootElement.element(locators.IMAGE).getAttribute('src');
}

module.exports = {
    locators: locators,
    getImageUrl: getImageUrl
};
