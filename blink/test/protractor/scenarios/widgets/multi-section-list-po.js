/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var locators = {
    ACTION_BUTTON: by.css('.bk-multi-section-list-item-action')
};

function triggerItemAction(rootElement) {
    browser.actions().mouseMove(rootElement).perform();
    return rootElement
        .element(locators.ACTION_BUTTON)
        .click();
}

module.exports = {
    locators: locators,
    triggerItemAction: triggerItemAction
};
