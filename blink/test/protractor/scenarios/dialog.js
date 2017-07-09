/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 */

'use strict';

var common = require('./common.js');
var util = common.util;

module.exports = (function () {
    var selectors = {
        DIALOG: '.bk-dialog',
        MODAL_DIALOG: '.bk-dialog',
        PRIMARY_BUTTON: '.bk-primary-button',
        SECONDARY_BUTTON: '.bk-dialog .bk-secondary-button',
        DIALOG_OK_BUTTON: '.bk-dialog-action-buttons .dialog-ok-button',
        CANCEL_BUTTON: '.bk-dialog .bk-cancel-button',
        OVERLAY: '.ngdialog-overlay',
        CONFIRM: '.bk-dialog .bk-confirm-btn',
        CONFIRM_ASYNC: '.bk-confirm-async-btn',
        FIELD: '.bk-dialog-field',
    };
    selectors.CLOSE = util.joinSelectors(selectors.DIALOG, '.bk-close');
    selectors.DIALOG_HEADER = util.joinSelectors(selectors.DIALOG, '.modal-header');
    selectors.DIALOG_FIELD = util.joinSelectors(selectors.DIALOG, selectors.FIELD);
    selectors.DISABLED_PRIMARY_BUTTON = selectors.DIALOG + ' ' +  selectors.PRIMARY_BUTTON
        + '.bk-disabled-button';
    selectors.DISABLED_SECONDARY_BUTTON = selectors.DIALOG + ' ' +  selectors.SECONDARY_BUTTON
        + '.bk-disabled-button';

    var locators = {
        ABORT_BTN: by.cssContainingText(selectors.CONFIRM_ASYNC, 'Yes, abort')
    };

    function clickPrimaryButton(waitForDismissal) {
        common.util.waitForElement(selectors.DIALOG);
        var dialog = $(selectors.DIALOG);
        dialog.element(by.css(selectors.PRIMARY_BUTTON)).click();
        if (waitForDismissal) {
            util.waitForElementToNotBePresent(selectors.OVERLAY);
        }
    }

    function clickSecondaryButton() {
        var dialog = $(selectors.DIALOG);
        dialog.$(selectors.SECONDARY_BUTTON).click();
        util.waitForElementToNotBePresent(selectors.OVERLAY);
    }

    function checkIfDialogExist() {
        util.waitForElement($(selectors.DIALOG));
    }

    function waitForDialogTitle(dialogTitle) {
        checkIfDialogExist();
        util.waitForTextToBePresentInElement(selectors.DIALOG_HEADER, dialogTitle);
    }

    function clickOkButton(){
        common.util.waitForAndClick(selectors.DIALOG_OK_BUTTON);
    }

    function clicCancelButton(){
        common.util.waitForAndClick(selectors.CANCEL_BUTTON);
    }

    function cleanupDialog() {
        var cancelEl = $(selectors.CLOSE);
        cancelEl.isPresent().then(function (isPresent) {
            if(isPresent) {
                cancelEl.click();
            }
        });
        util.waitForElementToNotBePresent(selectors.DIALOG);
    }

    function checkDismissal() {
        util.waitForVisibilityOf(selectors.MODAL_DIALOG);
        browser.actions().mouseMove({
            x: 0,
            y: 0
        }).click().perform();
        util.waitForElementToNotBePresent(selectors.OVERLAY);
    }

    function abortUnloadDialog() {
        var abortBtn = element(locators.ABORT_BTN);
        abortBtn.isPresent().then(function (isPresent) {
            if(isPresent) {
                abortBtn.click();
            }
            util.waitForElementToNotBePresent(locators.ABORT_BTN);
        });
    }

    function waitForDialogPresent() {
        return common.util.waitForElementCountToBe(selectors.DIALOG, 1);
    }

    function waitForDialogAbsent() {
        return common.util.waitForElementCountToBe(selectors.DIALOG, 0);
    }

    function confirm(doNotWaitForClose) {
        common.util.waitForElement(selectors.DIALOG);
        var dialog = $(selectors.DIALOG);
        dialog.element(by.css(selectors.CONFIRM)).click();
        if(!doNotWaitForClose) {
            waitForDialogAbsent();
        }
    }

    function confirmAsync(doNotWaitForClose) {
        common.util.waitForElement(selectors.DIALOG);
        var dialog = $(selectors.DIALOG);
        dialog.element(by.css(selectors.CONFIRM_ASYNC)).click();
        if(!doNotWaitForClose) {
            waitForDialogAbsent();
        }
    }

    function closeDialog() {
        common.util.waitForAndClick(selectors.CLOSE);
        return waitForDialogAbsent();
    }

    function closeDialogIfOpen() {
        $(selectors.CLOSE).isPresent().then(function(isPresent) {
            if (isPresent) {
                closeDialog();
            }
        });
    }

    function confirmDialogIfOpen() {
        $(selectors.MODAL_DIALOG).isPresent().then(function(isPresent) {
            if (isPresent) {
                confirm();
            }
        });
    }

    function waitForDisabledPrimaryButton() {
        common.util.waitForElement(selectors.DISABLED_PRIMARY_BUTTON);
    }
    function elementForFieldContaining(text) {
        return element(by.cssContainingText(selectors.DIALOG_FIELD, text));
    }
    function waitForFieldContaining(text) {
        util.waitForVisibilityOf(elementForFieldContaining(text));
    }

    return {
        selectors: selectors,
        abortUnloadDialog: abortUnloadDialog,
        checkIfDialogExist: checkIfDialogExist,
        checkDismissal: checkDismissal,
        clickPrimaryButton: clickPrimaryButton,
        cleanupDialog: cleanupDialog,
        clickSecondaryButton: clickSecondaryButton,
        clickOkButton: clickOkButton,
        clickCancelButton: clicCancelButton,
        closeDialog: closeDialog,
        closeDialogIfOpen: closeDialogIfOpen,
        confirmDialogIfOpen: confirmDialogIfOpen,
        confirm: confirm,
        confirmAsync: confirmAsync,
        waitForDialogPresent: waitForDialogPresent,
        waitForDialogAbsent: waitForDialogAbsent,
        waitForDialogTitle: waitForDialogTitle,
        waitForDisabledPrimaryButton: waitForDisabledPrimaryButton,
        waitForFieldContaining: waitForFieldContaining
    };
})();
