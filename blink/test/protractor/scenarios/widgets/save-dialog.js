/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E test API for save dialog
 */

'use strict';

var common = require('../common');
var dialog = require('../dialog');

var selectors = {
    NAME_FIELD: dialog.selectors.DIALOG + ' .bk-name-text',
    DESCRIPTION_FIELD: dialog.selectors.DIALOG + ' .description-text'
};

function enterName(name) {
    $(selectors.NAME_FIELD).sendKeys(name);
}
function enterDescription(description) {
    $(selectors.DESCRIPTION_FIELD).sendKeys(description);
}
function save() {
    dialog.clickPrimaryButton(true);
}
function dismiss() {
    dialog.clickSecondaryButton();
}
module.exports = {
    dismiss: dismiss,
    enterName: enterName,
    enterDescription: enterDescription,
    save: save
};
