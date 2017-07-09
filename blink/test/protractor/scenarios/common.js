/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview: <b>TL;DR: Do not make this another base.js (e2e-scenarios)</b>.
 *
 *                Contains common methods for the protractor tests.
 *                Try not to put methods here, if it can find a home somewhere
 *                else more qualified.
 */

'use strict';

/* eslint camelcase: 1 */
var fs = require('fs');
var path = require('path');
var URI = require('urijs');
var prettysize = require('prettysize');

var loginPage = require('./login/login');
var base = require('../base-do-not-use');

var WAIT_TIMEOUT = browser.params.waitTimeout || 30000;
var POLLING_TIMEOUT = 1000;

Promise.prototype.finally = function (callback) {
    let p = this.constructor;
    // We don’t invoke the callback in here,
    // because we want then() to handle its exceptions
    return this.then(
        // Callback fulfills: pass on predecessor settlement
        // Callback rejects: pass on rejection (=omit 2nd arg.)
        value  => p.resolve(callback()).then(() => value),
        reason => p.resolve(callback()).then(() => { throw reason })
    );
};

function getElement(selector) {
    if(typeof selector === 'string') {
        return $(selector);
    }
    else if(!!selector.constructor &&
        selector.constructor.name === 'ElementFinder') {
        return selector;
    } else {
        return element(selector);
    }
}

function getElements(selector) {
    if(typeof selector === 'string') {
        return $$(selector);
    }
    else if(!!selector.constructor &&
        selector.constructor.name === 'ElementArrayFinder') {
        return selector;
    } else {
        return element.all(selector);
    }
}

function getLocator(selector) {
    return (typeof selector === 'string')
        ? by.css(selector)
        : selector;
}


// TODO(chab) Pull all conditions there and compose wait methods with waitForCondition
// Expected conditions

var EC = protractor.ExpectedConditions;
EC.expectElementCountToBe = function(selector, count) {
    var elements = getElements(selector);
    return function() {
        return elements.count().then(function(c){
            return c === count;
        });
    };
};

var util = (function() {
    function toLowerCase(textPromise) {
        return textPromise.then(
            function(text){
                return text.toLowerCase();
            }
        );
    }

    function expectCaseInsensitiveEquals(textPromise, matchTarget) {
        return expect(toLowerCase(textPromise)).toBe(matchTarget.toLowerCase());
    }

    function parseFontFamily(fontFamily) {
        return fontFamily.split(',')
            .map(
                function(singleFamilyName){
                    // we assume that quotes, if present, are always paired
                    return singleFamilyName
                        .trim()
                        .replace(/^['"]|['"]$/g, '')
                        .toLowerCase();
                }
            );
    }

    function makeAjaxRequest(path, callback, responseType, method) {
        if (!responseType) {
            responseType = 'arraybuffer';
        }
        if (!method) {
            method = 'GET';
        }

        var xhr = new XMLHttpRequest();
        xhr.open(method, path, true);
        xhr.responseType = responseType;

        xhr.onload = function(e) {
            if (this.status == 200) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var base64Url = e.target.result;
                    var base64Data = base64Url.replace(/(.+base64,)/, '');

                    callback({
                        error: null,
                        data: base64Data
                    });
                };
                reader.onerror = function (e) {
                    callback({
                        error: e,
                        data: null
                    });
                };
                reader.readAsDataURL(new Blob([this.response]));
            } else {
                callback({
                    error: e,
                    data: null
                });
            }
        };
        xhr.onerror = xhr.onabort = function (e) {
            callback({
                error: e,
                data: null
            });
        };
        xhr.send();
    }

    function asyncXhrJavascript(path, responseType, method) {
        return makeAjaxRequest.toString()
            + ' makeAjaxRequest("'+ path + '", arguments[arguments.length - 1], ' + responseType + ', ' + method + ');';
    }

    function verifyRemoteFileSameAsLocal(urlPromise, onDiskFilePath) {
        var diskDataBase64 = fs.readFileSync(onDiskFilePath).toString('base64');

        urlPromise.then(
            function (url) {
                var xhrFunction = asyncXhrJavascript(url);
                browser.executeAsyncScript(xhrFunction)
                    .then(
                        function(response){
                            if (!!response.error) {
                                throw response.error;
                            }

                            var imageDataBase64 = response.data;
                            var isImageDataCorrect = imageDataBase64 === diskDataBase64;
                            expect(isImageDataCorrect).toBe(true);
                        }
                    );
            }
        );
    }
    function getElementClassSelector(el) {
        return el.getAttribute('class').then(function(elementClass){
            return '.' + elementClass.split(/\s+/).join('.');
        });
    }
    function checkElementHasNotScrollToTop(el) {
        el = getElement(el);
        browser.executeScript(function($elem){
            return $elem.scrollTop;
        }, el).then(function(scrollTop){
            expect(scrollTop > 0).toBeTruthy();
        })
    }

    return {
        selectors: {
            ACCOUNT_SETTINGS_SECTION: '.bk-primary-nav .bk-user-menu',
            NOTIF: '.bk-alert',
            ERROR_NOTIF: '.bk-alert.bk-alert-error',
            PROBLEM_NOTIF: '.bk-alert.bk-alert-problem',
            ERROR_NOTIF_CLOSE_BTN: '.bk-alert.bk-alert-error .bk-close',
            SUCCESS_NOTIF_CLOSE_BTN: '.bk-alert.bk-alert-success .bk-close',
            NOTIF_CLOSE_BTN: '.bk-alert .bk-close',
            DOWNLOAD_TRACE: '.bk-alert .bk-details a',
            FILE_INPUT: '#bk-file-input',
            LOGOUT_BTN: '.bk-primary-nav .bk-user-menu .bk-sign-out',
            LOADING_INDICATOR_OVERLAY: '.bk-loading-indicator-overlay',
            SUCCESS_NOTIF: '.bk-alert.bk-alert-success',
            USER_MENU: '.bk-primary-nav .bk-user-menu',
            VIZ_CONTEXT: '.bk-viz-context',
            ACTION_LINK: '.bk-action-link',
            ACTION_LINK2: '.bk-link'
        },
        locators: {
            LOGIN_FORM: by.css('.bk-login-form'),
            AUTO_POPUP: by.css('.bk-auto-popup'),
            AUTO_POPUP_HEADER: by.css('.bk-auto-popup .bk-popup-text'),
            AUTO_POPUP_OK_BUTTON: by.css('.bk-auto-popup .bk-save-btn'),
            AUTO_POPUP_CANCEL_BUTTON: by.css('.bk-auto-popup .bk-cancel-btn'),
            AUTO_POPUP_DONT_SHOW_CHECKBOX: by.css('.bk-auto-popup .bk-checkbox-container'),
            WHAT_HAPPENED_LINK: by.cssContainingText('.bk-alert .bk-link', 'What Happened')
        },
        hasName: function (cssSelector, value) {
            return this.joinSelectors(cssSelector, 'input[name = "' + value + '"]');
        },
        expectCaseInsensitiveEquals: expectCaseInsensitiveEquals,
        parseFontFamily: parseFontFamily,
        asyncXhrJavascript: asyncXhrJavascript,
        verifyRemoteFileSameAsLocal: verifyRemoteFileSameAsLocal,
        getElementClassSelector: getElementClassSelector,
        checkElementHasNotScrollToTop: checkElementHasNotScrollToTop,
        checkForPath: function(path) {
            var regExp = new RegExp('#' + path + '$');
            expect(browser.getCurrentUrl()).toMatch(regExp);
        },
        waitForPath: function(path) {
            var regExp = new RegExp('#' + path + '$');
            return browser.wait(function() {
                return browser.getCurrentUrl().then(function(url) {
                    return regExp.test(url);
                });
            });
        },
        contains: function (cssSelector, containsText) {
            return by.cssContainingText(cssSelector, containsText);
        },
        joinSelectors: function () {
            var args = Array.prototype.slice.call(arguments);
            return args.join(' ');
        },
        getElementInContainer: function (container, childSelector) {
            container = getElement(container);
            return container.element(by.css(childSelector));
        },
        expectSuccessNotif: function (optSuccessMsg) {
            optSuccessMsg = optSuccessMsg || '';
            var successElement = this.contains(this.selectors.SUCCESS_NOTIF, optSuccessMsg);
            return this.waitForVisibilityOf(successElement);
        },
        dismissNotificationIfPresent: function () {
            var element = $(this.selectors.NOTIF_CLOSE_BTN);
            element.isPresent().then(function (isPresent) {
                if (isPresent) {
                    // Not using click because of protractor falsely reporting
                    // as isClickable and we want a soft click only if the
                    // element is visible.
                    browser.executeScript('arguments[0].click();', element);
                }
            });
            return this.waitForInvisibilityOf(element);
        },
        expectAndDismissNotif: function (optSuccessMsg) {
            optSuccessMsg = optSuccessMsg || '';
            var notifElement = this.contains(this.selectors.NOTIF, optSuccessMsg);
            this.waitForVisibilityOf(notifElement);
            $(this.selectors.NOTIF_CLOSE_BTN).click();
            return this.waitForInvisibilityOf(element);
        },
        expectAndDismissSuccessNotif: function(optSuccessMsg) {
            optSuccessMsg = optSuccessMsg || '';
            var successElement = this.contains(this.selectors.SUCCESS_NOTIF, optSuccessMsg);
            this.waitForVisibilityOf(successElement);
            $(this.selectors.SUCCESS_NOTIF_CLOSE_BTN).click();
            return this.waitForInvisibilityOf(element);
        },
        openSuccessLink: function () {
            var successLinkSelector = this.selectors.SUCCESS_NOTIF + ' '
                + this.selectors.ACTION_LINK;
            return this.waitForAndClick(successLinkSelector);
        },
        openSuccessLink2: function () {
            var successLinkSelector = this.selectors.SUCCESS_NOTIF + ' '
                + this.selectors.ACTION_LINK2;
            return this.waitForAndClick(successLinkSelector);
        },
        expectNoErrorNotif: function () {
            return expect($(this.selectors.ERROR_NOTIF).isPresent()).toBe(false);
        },
        expectErrorNotif: function () {
            return expect($(this.selectors.ERROR_NOTIF).isPresent()).toBe(true);
        },
        dismissErrorNotif: function() {
            return this.waitForAndClick(this.selectors.ERROR_NOTIF_CLOSE_BTN);
        },
        hasAnyClass: function (selector, classList) {
            var element = getElement(selector);
            return element.getAttribute('class').then(function (classes) {
                for (var i = 0; i < classList.length; i++) {
                    if (classes.split(' ').indexOf(classList[i]) !== -1) {
                        return true;
                    }
                }
                return false;
            });
        },
        waitForElementToNotBePresent: function (elem) {
            elem = getElement(elem);
            var EC = protractor.ExpectedConditions;
            return browser.wait(EC.not(EC.presenceOf(elem)), WAIT_TIMEOUT);
        },
        waitForInvisibilityOf: function (elem) {
            elem = getElement(elem);
            var EC = protractor.ExpectedConditions;
            return browser.wait(EC.invisibilityOf(elem), WAIT_TIMEOUT);
        },
        waitForElementToBeClickable: function (elem) {
            elem = getElement(elem);
            var EC = protractor.ExpectedConditions;
            return browser.wait(EC.elementToBeClickable(elem), WAIT_TIMEOUT);
        },
        waitForTextToBePresentInElement: function (elem, text) {
            elem = getElement(elem);
            this.waitForElement(elem);
            var EC = protractor.ExpectedConditions;
            return browser.wait(EC.textToBePresentInElement(elem, text), WAIT_TIMEOUT);
        },
        waitForAndClick: function(elem) {
            elem = getElement(elem);
            this.waitForElementToBeClickable(elem);
            return elem.click();
        },
        waitForElement: function (elem, optionalTimeout) {
            elem = getElement(elem);
            var EC = protractor.ExpectedConditions;
            return browser.wait(EC.presenceOf(elem), WAIT_TIMEOUT);
        },
        waitForElementCountToBe: function(selector, count, optionalTimeout) {
            var condition = EC.expectElementCountToBe(selector, count);
            return util.waitForCondition(condition, optionalTimeout);
        },
        waitForElementCountToBeMoreThan: function(selector, count, optionalTimeout) {
            var elements = getElements(selector);
            return browser.wait(
                function () {
                    return elements.count().then(function(actualCount){
                        return actualCount > count;
                    });
                }, optionalTimeout || WAIT_TIMEOUT);
        },
        waitForChildElementCountToBe: function(rootElem, locator, count, optionalTimeout) {
            var elem = getElement(rootElem);
            locator = getLocator(locator);
            this.waitForElement(rootElem);
            return browser.wait(
                function () {
                    return elem.all(locator).count().then(function(actualCount){
                        return actualCount === count;
                    });
                }, optionalTimeout || WAIT_TIMEOUT);
        },
        waitForVisibilityOf: function (selector) {
            var elem = getElement(selector);
            var EC = protractor.ExpectedConditions;
            return browser.wait(EC.visibilityOf(elem), WAIT_TIMEOUT);
        },
        waitForValueToBe: function (selector, value) {
            var elem = getElement(selector);
            var EC = protractor.ExpectedConditions;
            return browser.wait(EC.textToBePresentInElementValue(elem, value), WAIT_TIMEOUT);
        },
        waitForValueToMatch: function(selector, regex) {
            var elem = getElement(selector);
            return browser.wait(function() {
                return elem.getAttribute('value').then(function(value) {
                    return regex.test(value);
                })
            });
        },
        waitForValueToNotMatch: function(selector, regex) {
            var elem = getElement(selector);
            return browser.wait(function() {
                return elem.getAttribute('value').then(function(value) {
                    return !regex.test(value);
                })
            });
        },
        waitForCondition: function(conditionChecker, optionalTimeout) {
            return browser.wait(
                conditionChecker,
                optionalTimeout || WAIT_TIMEOUT
            );
        },
        waitForConditionAndPerformAction: function(
            conditionChecker,
            actionToPerform,
            pollingTimeout,
            generalTimeout) {
            return browser.wait(function() {
                return util.waitForCondition(
                    conditionChecker,
                    pollingTimeout || POLLING_TIMEOUT).then(function(){
                        return true;
                    }, function() {
                        actionToPerform();
                        return false;
                    });
            }, generalTimeout || WAIT_TIMEOUT);
        },
        login: function (username, password) {
            return loginPage.login(username, password);
        },
        logout: function () {
            // Tests will fail is the overlay is there
            this.waitForInvisibilityOf(this.selectors.LOADING_INDICATOR_OVERLAY);
            element(by.css(this.selectors.USER_MENU)).click();
            this.waitForAndClick(by.css(this.selectors.LOGOUT_BTN));
            return this.waitForElement(this.locators.LOGIN_FORM);
        },
        logoutIfLoggedIn: function () {
            element(util.locators.LOGIN_FORM).isPresent()
                .then(function (isPresent) {
                    if (!isPresent) {
                        util.logout();
                    }
                });
        },
        reLogin: function (username, password) {
            this.logout();
            return this.login(username, password);
        },
        scrollListToTop: function(containerElement) {
            browser.executeScript('arguments[0].scrollIntoView()',
                containerElement.getWebElement());
        },
        scrollElementIntoViewPort: function(element) {
            return browser.executeScript('arguments[0].scrollIntoView()', element.getWebElement());
        },
        scrollElementToBottom: function(el) {
            var el = getElement(el);
            browser.executeScript(function($elem){
                $elem.scrollTop = $elem.scrollHeight;
            }, el.getWebElement());
        },
        uploadFile: function (filePath) {
            function makeElementVisible(element) {
                function makeVisible(elm) {
                    elm.style.visibility = 'visible';
                    elm.style.height = '10px';
                    elm.style.width = '10px';
                    elm.style.top = '0px';
                    elm.style.left = '0px';
                    elm.style.opacity = 1;
                    elm.style.display = 'block';
                }
                return browser.executeScript(makeVisible, element.getWebElement());
            }
            var absolutePath = path.resolve(__dirname, filePath);
            var fileElement = $(this.selectors.FILE_INPUT);
            makeElementVisible(fileElement).then(function() {
                fileElement.sendKeys(absolutePath);
            });
        },
        nthChild: function (cssSelector, n) {
            return cssSelector + ':nth-child(' + (n - 1) + ')';
        },
        last: function (cssSelector) {
            return cssSelector + ':last';
        },
        lastChild: function (cssSelector) {
            return cssSelector + ':last-child';
        },
        getSelectorInVizContext: function (selector) {
            return this.selectors.VIZ_CONTEXT + ' ' + selector;
        },
        mouseMoveToElement: function(element) {
            element = getElement(element);
            browser.actions().mouseMove(element).perform();
        },
        rightClickElement: function(element) {
            element = getElement(element);
            this.mouseMoveToElement(element);
            return browser.actions().click(protractor.Button.RIGHT).perform();
        },
        doubleClickElement: function(element) {
            element = getElement(element);
            this.mouseMoveToElement(element);
            return browser.actions().doubleClick().perform();
        },
        appendRandomNumber: function appendRandomNumber(name) {
            return name + "_" + Math.random().toString();
        },
        dragAndDrop: function(elem, x, y) {
            return browser.actions().
                mouseDown(elem).
                mouseMove({x: x, y: y}).
                mouseUp().
                perform();
        },
        ensureCursorAtEnd: function(elem) {
            // NOTE: This is added to mask a product issue in IE where focus on input element
            // sets cursor position to start where as all other browsers put this at end.
            // We dont patch this behavior in product as it would be expensive unless we have
            // external pressure.
            if (browser.params.browserName == 'internet explorer') {
                getElement(elem).getText().then(function(text){
                    var length = text ? text.length : 0;
                    for(var i = 0; i < length ;++i) {
                        getElement(elem).sendKeys(protractor.Key.ARROW_RIGHT);
                    }
                });
            }
        }
    };
})();

var navigation = (function(){
    var selectors = {
        ADMIN_SECTION: '.bk-primary-nav-admin',
        ANSWER_SECTION: '.bk-primary-nav-search',
        ANSWERS_SECTION: '.bk-primary-nav-answers',
        EMBEDDED_APP_PAGE: '.bk-embedded',
        NAVIGATION_BAR: '.bk-primary-nav',
        PINBOARDS_SECTION: '.bk-primary-nav-pinboards',
        USER_DATA: '.bk-primary-nav-manage-data',
        HOME: '.bk-primary-nav-home-logo',
        HOME_SAGE_BAR: '.bk-home-sage-bar',
        TAB_CONTROL: '.bk-tab-control',
        SAGE_BAR: '.bk-sage-bar',
        HELP_MENU: '.bk-help-menu',
        HELP_ACTION_MENU: '.bk-action-menu',
        COMMUNITY_ITEM: '.bk-action-community'
    };

    var locators = {
        NAVIGATION_BAR: by.css(selectors.NAVIGATION_BAR),
        ADMIN_SECTION: by.css(selectors.NAVIGATION_BAR + ' ' + selectors.ADMIN_SECTION),
        ANSWER_SECTION: by.css(selectors.NAVIGATION_BAR + ' ' + selectors.ANSWER_SECTION),
        ANSWERS_SECTION: by.css(selectors.NAVIGATION_BAR + ' ' + selectors.ANSWERS_SECTION),
        EMBEDDED_APP_PAGE: by.css(selectors.EMBEDDED_APP_PAGE),
        PINBOARDS_SECTION: by.css(selectors.NAVIGATION_BAR + ' ' + selectors.PINBOARDS_SECTION),
        USER_DATA_SECTION: by.css(selectors.USER_DATA),
        HOME: by.css(selectors.HOME),
        HOME_SAGE_BAR: by.css(selectors.HOME_SAGE_BAR)
    };

    function goToAdminSection() {
        util.dismissNotificationIfPresent();
        util.waitForAndClick(locators.ADMIN_SECTION);
        return util.waitForElement(selectors.TAB_CONTROL);
    }

    function goToHome() {
        util.dismissNotificationIfPresent();
        util.waitForAndClick(selectors.HOME);
        return browser.wait(util.waitForElement(selectors.HOME_SAGE_BAR));
    }

    function addUrlParameter(paramName, paramValue) {
        return browser.getCurrentUrl().then(function(currentUrl) {
            var uri = new URI(currentUrl);
            var newUrl = uri.setQuery(paramName, paramValue).toString();
            return browser.get(newUrl);
        });
    }

    function removeUrlParameter(paramName) {
        return browser.getCurrentUrl().then(function (currentUrl) {
            var uri = new URI(currentUrl);
            var newUrl = uri.removeQuery(paramName).toString();
            return browser.get(newUrl);
        });
    }

    function goToInAppPath(path) {
        return browser.getCurrentUrl().then(function (currentUrl) {
            var uri = new URI(currentUrl);
            var newUrl = uri.fragment(path).toString();
            return browser.get(newUrl);
        });
    }

    function goToAnswerSection() {
        util.dismissNotificationIfPresent();
        return util.waitForAndClick(locators.ANSWERS_SECTION);
    }

    function goToQuestionSection() {
        util.dismissNotificationIfPresent();
        util.waitForAndClick(locators.ANSWER_SECTION);
        return util.waitForElement(selectors.SAGE_BAR);
    }

    function goToUserDataSection() {
        util.dismissNotificationIfPresent();
        util.waitForAndClick(locators.USER_DATA_SECTION);
    }

    function goToPinboardsSection() {
        return util.waitForAndClick(locators.PINBOARDS_SECTION);
    }

    function goBackInHistory() {
        return browser.navigate().back();
    }

    function goForward() {
        return browser.navigate().forward();
    }

    function resetAppPath() {
        var uri = new URI(base.HOME_URL);
        uri.setQuery(base.URI_QUERY);
        browser.get(uri.toString());
        return util.waitForElement(selectors.HOME_SAGE_BAR);
    }

    function reloadApp() {
        browser.driver.navigate().refresh();
        return util.waitForElement(locators.NAVIGATION_BAR);
    }

    function openHelpDropdown() {
        util.waitForAndClick(selectors.HELP_MENU);
        return util.waitForElement(selectors.HELP_ACTION_MENU);
    }

    return {
        selectors: selectors,
        locators: locators,
        addUrlParameter: addUrlParameter,
        removeUrlParameter: removeUrlParameter,
        goToAdminSection: goToAdminSection,
        goToAnswerSection: goToAnswerSection,
        goBackInHistory: goBackInHistory,
        goForward: goForward,
        goToHome: goToHome,
        goToInAppPath: goToInAppPath,
        goToPinboardsSection: goToPinboardsSection,
        goToQuestionSection: goToQuestionSection,
        goToUserDataSection: goToUserDataSection,
        resetAppPath: resetAppPath,
        reloadApp: reloadApp,
        openHelpDropdown: openHelpDropdown
    };
})();

var dialog = (function() {
    return {
        locators: {
            DIALOG: by.css('.bk-dialog'),
            PRIMARY_DLG_BTN: by.css('.bk-dialog .bk-confirm-async-btn .bk-primary-button'),
            SECONDARY_DLG_BTN: by.css('.bk-dialog .bk-confirm-btn .bk-secondary-button'),
            PRIMARY_CANCEL_BTN: by.css('.bk-dialog .bk-cancel-button'),
            PRIMARY_DLG_BTN_DISABLED: by.css('.bk-dialog .bk-confirm-async-btn .bk-disabled-button'),
            MODAL_DIALOG: by.css('.bk-dialog.modal'),
            OVERLAY: by.css('.bk-dialog-overlay')
        }
    };
})();

var tabs = (function(){
    var selectors = {
        TAB_HEADER_ITEM: '.tab-navigation .bk-tab-header .tab-header-item'
    };

    return {
        selectors: selectors
    };

})();

var expressionEditor = {
    locators: {
        EXPRESSION_SUGGESTION_ITEMS: by.css('.bk-expression-suggestion-menu li'),
        EXPRESSION_VALIDATION_MESG: by.css('.expression-editor-validation-message')
    }
};

var metadataItemSelector = (function() {
    return {
        selectors: {
            METADATA_SELETOR: '.bk-metadata-item-selector',
            SINGLE_CHOICE: '.bk-select-box',
            UISELECT_INPUT: '.select2-search-field .ui-select-search',
            UISELECT_ROW: '.ui-select-choices-row',
            UISELECT_MATCH: '.ui-select-match'

        },
        selectOption: function (containingSelector, text) {
            var EC = protractor.ExpectedConditions;
            var containingElement = element(by.css(containingSelector));
            var input = containingElement.element(by.css(this.selectors.UISELECT_INPUT));
            browser.wait(EC.visibilityOf(input), WAIT_TIMEOUT);
            input.sendKeys(text);
            input.sendKeys(protractor.Key.TAB);
        },
        checkForOption: function (containingSelector, text) {
            var EC = protractor.ExpectedConditions;
            var containingElement = element(by.css(containingSelector));
            containingElement.element(by.css(this.selectors.METADATA_SELETOR)).click();
            var input = containingElement.element(by.css(this.selectors.UISELECT_INPUT));
            browser.wait(EC.visibilityOf(input), WAIT_TIMEOUT);
            var rowToSelect = containingElement.all(by.cssContainingText(
                this.selectors.UISELECT_ROW, text));
            expect(rowToSelect.count()).toEqual(1);
        },
        clickOnSingleOption: function(containingSelector) {
            var selector = containingSelector ? containingSelector : this.selectors.SINGLE_CHOICE;
            $(selector).click();
        },
        waitForSelectedItemToBe(containerSelector, text) {
            var root = getElement(containerSelector);
            root.element(by.cssContainingText(this.selectors.UISELECT_MATCH, text));
        }
    }
})();

var constants = {
    waitTimeout: WAIT_TIMEOUT
};

var blinkCheckbox = (function() {
    return {
        selectors: {
            CONTAINER: '.bk-checkbox-container',
            CHECKED: '.bk-checkbox.bk-checked',
            UNCHECKED: '.bk-checkbox:not(.bk-checked)',
            READ_ONLY: '.bk-readonly-checkboxes',
            SEARCH_BOX: '.bk-checkbox-search'
        },
        checkForCheckedBox: function (checkboxName){
            util.waitForElementCountToBe(this.getCheckboxName(checkboxName).all(by.css(this.selectors.CHECKED)), 1);
        },
        checkForUncheckedBox: function(checkboxName){
            util.waitForElementCountToBe(this.getCheckboxName(checkboxName).all(by.css(this.selectors.UNCHECKED)), 1);
        },
        checkForReadOnlyCheckbox: function(checkboxName, containerSelector) {
            expect(this.getCheckboxName(checkboxName, containerSelector)
                .all(by.css(this.selectors.UNCHECKED)).count()).toBe(1);
        },
        getCheckboxName: function(checkboxName, containerSelector) {
            if (!containerSelector) {
                containerSelector = '';
            }
            return element(by.cssContainingText(containerSelector + ' ' + this.selectors.CONTAINER, checkboxName));
        },
        checkIfAllCheckboxInsideContainerAreChecked: function(containerSelector) {
            var checked = util.joinSelectors(containerSelector, this.selectors.CHECKED);
            var allCheckbox = util.joinSelectors(containerSelector, this.selectors.CONTAINER);
            expect($$(checked).count()).toBe($$(allCheckbox).count());
        }
    }

})();

var performance = {
    captureMemory: function() {
        return browser.driver.executeScript(function () {
            return window.performance.memory;
        }).then(function (result) {
            if (!!result) {
                console.log(
                    "MemoryInfo: jsHeapSizeLimit : ",
                    prettysize(result.jsHeapSizeLimit),
                    "usedJSHeapSize : ",
                    prettysize(result.usedJSHeapSize),
                    "totalJSHeapSize : ",
                    prettysize(result.totalJSHeapSize)
                );
            }
            return protractor.promise.fulfilled(true);
        });
    },
    collectGarbage: function() {
        return browser.driver.executeScript(function () {
            // Collect garbage where it is enabled
            if(!!window.gc) {
                console.log('Collecting Garbage');
                window.gc();
            }
        });
    }
};

var network = {
    interceptFormResponse: function(formSelector) {
        browser.executeScript(function(formSelector) {
            function submitForm(form) {
                var data =  new FormData();
                for (var i = 0; i < form.length; ++i) {
                    var element = form[i];
                    data.append(element.name, element.value);
                }

                var params = {
                    type: form.method,
                    url: form.action,
                    data: data,
                    success: function(response) {
                        window.formResponse = response;
                    },
                    error: function(err) {
                        window.formResponse = err;
                    }
                };

                params.contentType = false;
                params.type = 'POST';
                params.processData = false;
                params.cache = false;

                $.ajax(params);
            }

            var originalSubmitMethod;
            if (!!formSelector) {
                var form = document.querySelector(formSelector);
                originalSubmitMethod = form.submit;
                form.submit = function () {
                    form.submit = originalSubmitMethod;
                    submitForm(this);
                };
                window.resetSubmitMethod = function () {
                    form.submit = originalSubmitMethod;
                };
            } else {
                originalSubmitMethod = HTMLFormElement.prototype.submit;
                HTMLFormElement.prototype.submit = function(){
                    HTMLFormElement.prototype.submit = originalSubmitMethod;
                    submitForm(this);
                };
                window.resetSubmitMethod = function () {
                    HTMLFormElement.prototype.submit = originalSubmitMethod;
                };
            }
        }, formSelector)
    },
    waitForAndResetFormResponse: function() {
        return browser.wait(function() {
            return browser.executeScript(function() {
                window.resetSubmitMethod();
                var formResponse = window.formResponse;
                window.formResponse = null;
                return formResponse;
            });
        })
    }
};


module.exports = {
    blinkCheckbox: blinkCheckbox,
    constants: constants,
    dialog: dialog,
    expressionEditor: expressionEditor,
    metadataItemSelector: metadataItemSelector,
    navigation: navigation,
    tabs: tabs,
    util: util,
    performance: performance,
    network: network
};
