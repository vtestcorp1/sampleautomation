// NOTE: This is used during static config generation. So we dont use
// any constructs that wont be available in the nodeJs context during the
// load of this script.
"use strict";

var selectors = {
    LOGIN_FORM: '.bk-login-form',
    LOGIN_BTN: '.bk-login-section .bk-login-btn'
};

var waitForLoginPage = function () {
    var EC = protractor.ExpectedConditions;
    browser.wait(EC.presenceOf($(selectors.LOGIN_FORM)));
};

var login = function (username, password) {
    waitForLoginPage();
    username = username || browser.params.username || 'tsadmin';
    password = password || browser.params.password || 'admin';
    var userNameLocator = by.id('login-email');
    browser.wait(
        protractor.ExpectedConditions.presenceOf(element(userNameLocator)),
        browser.waitTimeout
    );
    element(userNameLocator).clear();
    element(userNameLocator).sendKeys(username);
    element(by.id('login-password')).clear();
    element(by.id('login-password')).sendKeys(password);
    return $(selectors.LOGIN_BTN).click();
};

module.exports = {
    selectors: selectors,
    waitForLoginPage: waitForLoginPage,
    login: login
};
