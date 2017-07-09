"use strict";

/* eslint camelcase: 1, no-undef: 0 */

var fs = require('fs-extra');
var temp = require('temp');
var path = require('path');
var gm = require('gm');
var util = require('util');
var URI = require('urijs');
var jasmineReporters = require('jasmine-reporters');
var SpecReporter = require('jasmine-spec-reporter');
var VideoReporter = require('protractor-video-reporter');
var remote = require('selenium-webdriver/remote');
var sharding = require('./sharding.js');
var jasminePatcher = require('./jasmine-patcher');

var WAIT_TIMEOUT = 30000,
    BASE_URL = 'http://localhost:8088',
    URL_QUERY = {
        e2eTest: true,
        trackPerformance: true,
        enableAnswers: true,
        disableSuccessNotificationAutoHide: true
    },
    HOME_URL = BASE_URL,
    BROWSER_WIDTH = 1800,
    BROWSER_HEIGHT = 1200,
    locators = {};



function initLocators() {
    // We'd like to have all locators kept in a common place, so it's easy
    // to change them as the page changes. However, we define them on
    // a module level as the protractor API ('by') is not available yet.
    // So, we're making this hack: all locators will be available under
    // 'locators' object, which will be populated by calling initLocators
    // at the time when protractor is already available (see config.js onPrepare)
    locators.AXIS_SETTINGS_LOCATOR = by.css('li.bk-chart-axis-selector');
    locators.EXPAND_ERROR_LOCATOR = by.cssContainingText('.bk-alert-error .bk-link', 'What Happened');
    locators.HIGHCHARTS_LOCATOR = by.css('.bk-viz-chart .highcharts-container');
    locators.LOGIN_BTN_LOCATOR = by.css('.bk-login-section .bk-login-btn');
    locators.HOME_LINK_LOCATOR = by.css('.bk-primary-nav-home-logo');
    locators.ANSWER_LINK_LOCATOR = by.css('.bk-primary-nav-search');
    locators.SAVED_ANSWERS_LINK_LOCATOR = by.css('.bk-primary-nav-answers');
    locators.PINBOARDS_LINK_LOCATOR = by.css('.bk-primary-nav-pinboards');
    locators.USERDATA_LINK_LOCATOR = by.css('.bk-primary-nav-manage-data');
    locators.ADMIN_LINK_LOCATOR = by.css('.bk-primary-nav-admin');
    locators.WORKSHEETS_FILTER_LOCATOR = by.cssContainingText('.bk-category-', 'Worksheets');
    locators.WORKSHEET_NAME_IN_LIST_LOCATOR = by.css('.bk-name-content');
    locators.ADD_FORMULA_BUTTON_LOCATOR = by.css('.bk-title-header .bk-icons-button .bk-style-icon-small-plus');
    locators.READ_ONLY_INDICATOR_LOCATOR = by.cssContainingText('.bk-flippable', 'Read-only');
    locators.FORMULA_EDITOR_LOCATOR = by.css('.content-editor');
    locators.SAVE_BUTTON_LOCATOR = by.cssContainingText('.bk-primary-button', 'Save');
    locators.LIST_NEXT_BUTTON_LOCATOR = by.css('.bk-pagination-btn.bk-next');
    locators.SELECT_ALL_CHECKBOX_LOCATOR = by.css(
        '.bk-manage-sources .bk-sources-popover .bk-select-all .bk-checkbox'
    );
    locators.ALL_FILTER_LOCATOR = by.cssContainingText(
        '.bk-manage-sources .bk-sources-popover .left-pane .bk-filter', 'All'
    );
    locators.CLOSE_BUTTON_LOCATOR = by.cssContainingText('.bk-primary-button', 'Close');
    locators.NO_CONTENT_LOCATOR = by.css('.bk-empty-page-placeholder-icon');
    locators.TABLES_LOCATOR = by.cssContainingText('.bk-list-header', 'Tables');
    locators.CHOOSE_SOURCES_LOCATOR = by.cssContainingText('.bk-secondary-button', 'Choose Sources');
    locators.SAGE_INPUT_LOCATOR = by.css('input.bk-sage-real-input');
    locators.CHART_TYPE_LOCATOR = by.css('.bk-chart-selector-button');
    locators.MAXIMIZE_VIZ_LOCATOR = by.css('.bk-viz-controls .bk-style-icon-maximize');
    locators.VIZ_HEADER_LOCATOR = by.css('.bk-viz-header');
    locators.MINIMIZE_VIZ_LOCATOR = by.css('.bk-close-btn');
    locators.PINBOARD_CONTAINER = by.css('.bk-pinboard-container');
    locators.VIZ_HEADER = by.css('.bk-viz-header');
    locators.VIZ_RENDERING_INDICATOR = by.css('.bk-answer-rendering-vizs');
    locators.ALERT_ERROR = by.css('.bk-alert-error');
    locators.MINIMIZE_LEFT_PANEL_LOCATOR = by.css('.bk-style-icon-arrow-left');
}

const filter = require('lodash').filter;

function readParams(config) {
    if (browser.params.baseUrl) {
        BASE_URL = browser.params.baseUrl;
    }
    if (config && config.capabilities.backendUrl) {
        BASE_URL = config.capabilities.backendUrl;
    }
    if (browser.params.currentEpochOverrideMs) {
        URL_QUERY.currentEpochOverrideMs = browser.params.currentEpochOverrideMs;
    }
    if (browser.params.waitTimeout) {
        WAIT_TIMEOUT = browser.params.waitTimeout;
    }
    if (browser.params.metadataBatchSize) {
        URL_QUERY.metadataBatchSize = browser.params.metadataBatchSize;
    }
}

function sanitizeName(name) {
    // if name is longer than 250 characters then cut out middle
    // this avoid ENAMETOOLONG errors when saving files
    if (name.length > 250) {
        return name.substring(0, 100) + name.substring(101 + name.length - 250);
    } else {
        return name;
    }
}

function waitForElement(locator) {
    return browser.wait(protractor.until.elementLocated(locator), WAIT_TIMEOUT);
}

function hasErrorAlert() {
    return element(locators.ALERT_ERROR).isPresent().then(function (present) {
        if (present) {
            return element(locators.ALERT_ERROR).isDisplayed();
        } else {
            return false;
        }
    });
}


function waitForLoaderOrError() {
    var EC = protractor.ExpectedConditions;
    return element.all(by.css('.bk-loader')).then(function (loaders) {
        var conditions = loaders.map(function (loader) {
            return EC.invisibilityOf(loader);
        });
        if (conditions.length === 0) {
            // Don't wait if there're no loaders present
            return true;
        }
        var resultCondition = conditions[0];
        conditions.slice(1).forEach(function (currentCondition) {
            resultCondition = EC.and(resultCondition, currentCondition);
        });
        resultCondition = EC.or(resultCondition, EC.visibilityOf(element(locators.ALERT_ERROR)));
        return browser.wait(resultCondition, WAIT_TIMEOUT).then(function () {
            return hasErrorAlert();
        });
    });
}

function waitForLoading() {
    var EC = protractor.ExpectedConditions;
    return element.all(by.css('.bk-loader')).then(function (loaders) {
        var conditions = loaders.map(function (loader) {
            return EC.visibilityOf(loader);
        });
        if (conditions.length === 0) {
            // Don't wait if there're no loaders present
            return true;
        }
        var resultCondition = conditions[0];
        conditions.slice(1).forEach(function (currentCondition) {
            resultCondition = EC.or(resultCondition, currentCondition);
        });
        return browser.wait(resultCondition, WAIT_TIMEOUT);
    });
}

/*
 * Will wait for visible visualizations to load.
 * Condition here waits for presence of a viz header (present only in a fully rendered viz)
 * and no viz loading indicator to be present.
 */
function waitForVizsOrError() {
    waitForElement(locators.VIZ_HEADER);
    return browser.wait(function() {
        var deferred = protractor.promise.defer();
        element(locators.VIZ_RENDERING_INDICATOR).isPresent()
            .then(function(present) {
                return deferred.fulfill(!present);
            });
        return deferred;
    });
}

function writePng(png, filename) {
    var deferred = protractor.promise.defer();
    var stream = fs.createWriteStream(filename + ".png");
    stream.write(new Buffer(png, 'base64'), undefined, function () {
        deferred.fulfill();
    });
    stream.end();
    return deferred;
}

function writeText(description, filename, extension) {
    extension = extension || 'txt';
    var deferred = protractor.promise.defer();
    var stream = fs.createWriteStream(filename + '.' + extension);
    stream.write(description, 'utf8', function () {
        deferred.fulfill();
    });
    stream.end();
    return deferred;
}

function getScreenshotsPath(error) {
    var basePath = "./screenshots/";
    if (error) {
        basePath += "errors/";
    }
    return basePath;
}
function jsonDownloadExists(name, folder) {
    name = name + '.json';
    var filename = folder + name;
    return fs.existsSync(filename);
}

function screenshotExists(name) {
    name = name.replace(/[\/#]/g, '_');
    name = sanitizeName(name);
    var basePath = getScreenshotsPath();
    return fs.existsSync(path.join(basePath, name + '.png'));
}

function shouldSkipTest(name) {
    if (browser.params.skipExisting && screenshotExists(name)) {
        console.log("Skipping " + name);
        return true;
    }
    return false;
}

function shouldSkipDownload(name, folder) {
    if (jsonDownloadExists(name, folder)) {
        console.log("Skipping " + name);
        return true;
    }
    return false;
}

function takeScreenshot(name, description, error, sleepTime) {
    var sleep = sleepTime || 500;
    // Allow some time for animations to finish
    return browser.sleep(sleep).then(function () {
        return browser.takeScreenshot().then(function(png) {
            // Write a screenshot
            name = name.replace(/[\/#]/g, '_');
            name = sanitizeName(name);
            var basePath = getScreenshotsPath(error);
            fs.ensureDirSync(basePath);
            writePng(png, basePath + name);
            // Write screenshot description
            return writeText(description, basePath + name);
        });
    });
}

function getScrollParams(scrollableElementClass) {
    var selector = 'document.querySelectorAll(".' + scrollableElementClass + '")[0]';
    return browser.executeScript("return {scrollHeight: " + selector + ".scrollHeight, clientHeight: " + selector + ".clientHeight, scrollTop: " + selector + ".scrollTop};");
}

function cropLastScreenshot(results, tmpDir) {
    var deferred = protractor.promise.defer();
    // Only crop if we have more than one screenshot
    if (results.screenNumber > 1) {
        var fn = tmpDir + (results.screenNumber - 1) + ".png";
        gm(fn).size(function (err, size) {
            if (!err) {
                this.crop(size.width, results.lastScreenOffset, 0, size.height - results.lastScreenOffset)
                    .write(fn, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        deferred.fulfill();
                    });
            } else {
                console.log(err);
                deferred.fulfill();
            }
        });
    } else {
        deferred.fulfill();
    }
    return deferred.promise;
}

function takeFullPageScreenshot(scrollableElementClass, name, description, error) {
    browser.sleep(500);
    var tmpDir = temp.mkdirSync();

    // This function will be called recursively, until we scroll to the bottom
    // of view. On each layer it will take screenshot of current state and scroll
    // one screen down.
    var scrollShot = function (index) {
        return waitForVizsOrError().then(function () {
            return getScrollParams(scrollableElementClass).then(function (sizes) {
                // Take a screenshot at current position
                return browser.takeScreenshot().then(function (png) {
                    return writePng(png, tmpDir + index);
                }).then(function () {
                    // If there's room to scroll - scroll and repeat recursively
                    if (sizes.scrollTop + sizes.clientHeight < sizes.scrollHeight) {
                        var targetHeight = (index + 1) * sizes.clientHeight;
                        return browser.executeScript("document.querySelectorAll('." + scrollableElementClass + "')[0].scrollTop += " + targetHeight)
                            .then(function () {
                                return scrollShot(index + 1);
                            });
                    } else {
                        return {
                            screenNumber: index + 1,
                            // Last screenshot typically has some overlap with previous one
                            // Later on we will want to cut off the overlapping part, so we will
                            // need this value
                            lastScreenOffset: sizes.scrollHeight % sizes.clientHeight
                        };
                    }
                });
            });
        }).then(function (results) {
            temp.cleanup();
            return results;
        });
    };

    return scrollShot(0).then(function (results) {
        return cropLastScreenshot(results, tmpDir).then(function () {
            // Glue the screenshots together using graphicsmagick
            var glue = gm();
            for (var i = 0; i < results.screenNumber; i++) {
                glue = glue.in(tmpDir + i + ".png");
            }
            glue = glue.montage().mode("concatenate").tile("1x");

            name = name.replace(/[\/#]/g, '_');
            name = sanitizeName(name);
            var basePath = getScreenshotsPath(error);
            fs.ensureDirSync(basePath);
            glue.write(basePath + name + '.png', function (err) {
                if (err) {
                    console.log(err);
                }
            });
            return writeText(description, basePath + name);
        });
    }).then(function () {
        // Revert scroll to the 0 position
        return browser.executeScript("document.getElementsByClassName('" + scrollableElementClass + "')[0].scrollTop = 0");
    });
}

function goToAnswer() {
    element(locators.ANSWER_LINK_LOCATOR).click();
    return browser.wait(waitForElement(by.css('.bk-sage')));
}

function goToUserdata() {
    return element(locators.USERDATA_LINK_LOCATOR).click();
}

function goToSavedAnswers() {
    return element(locators.SAVED_ANSWERS_LINK_LOCATOR).click();
}

function goToPinboards() {
    return element(locators.PINBOARDS_LINK_LOCATOR).click();
}

function goToAdmin() {
    element(locators.ADMIN_LINK_LOCATOR).click();
    return waitForElement(by.css('.bk-row-flex'));
}

function goToWorksheets() {
    goToUserdata();
    return element(locators.WORKSHEETS_FILTER_LOCATOR).click();
}

function goToWorksheet(guid) {
    browser.driver.executeScript('window.location.hash="/data/explore/' + guid + '"');
    // Let the protractor sync with angular again
    return browser.sleep(500);
}

function editWorksheet(skipReadOnly) {
    skipReadOnly = skipReadOnly || false;
    return element(locators.READ_ONLY_INDICATOR_LOCATOR).isPresent().then(function(isPresent) {
        if (isPresent && skipReadOnly) {
            return;
        }
        return waitForElement(
            by.css('.bk-metadata-edit')
        ).then (function() {
            element(by.cssContainingText('.bk-secondary-button', 'Edit')).click();
            return waitForLoaderOrError().then(function (error) {
                if (error) {
                    return;
                } else {
                    return browser.wait(waitForElement(by.css('.bk-source-header')));
                }
            });
        });
    });
}

function addFormulaToWorksheet(formula) {
    element(locators.ADD_FORMULA_BUTTON_LOCATOR).click();
    return waitForElement(locators.FORMULA_EDITOR_LOCATOR).then(function () {
        element(locators.FORMULA_EDITOR_LOCATOR).sendKeys(formula);
        return waitForElement(
            by.css('.expression-editor-validation-message.expression-valid')
        ).then(function () {
            return element(locators.SAVE_BUTTON_LOCATOR).click().then(function () {
                return waitForLoaderOrError();
            });
        });
    });
}

// TODO(Jasmeet): Move homepage into its own API file.
function waitForHomePage() {
    waitForElement(by.css('.bk-home-sage-bar'));
}

function goHome() {
    element(locators.HOME_LINK_LOCATOR).click();
    waitForHomePage();
}

function openAnswerById(guid) {
    // TODO(maxim): consider using goToInAppPath from common.js here right now
    // I'm not sure whether browser.get() there will refresh the page (and the
    // whole app state) or not. I'm also not sure which behaviour do we want
    // here.
    return browser.driver
        .executeScript('window.location.hash="/saved-answer/' + guid + '"')
        // Let the protractor sync with angular again
        .then(function () {
            return browser.sleep(500);
        });
}

function openPinboardById(guid) {
    return browser.driver
        .executeScript('window.location.hash="/pinboard/' + guid + '"')
        // Let the protractor sync with angular again
        .then(function () {
            return waitForElement(locators.PINBOARD_CONTAINER);
        });
}

function hasClass(element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
}

function hasAnyClass(element, classList) {
    return element.getAttribute('class').then(function (classes) {
        for (var i = 0; i < classList.length; i++) {
            if (classes.split(' ').indexOf(classList[i]) !== -1) {
                return true;
            }
        }
        return false;
    });
}

function getSelectAllCheckbox() {
    return element(locators.CHOOSE_SOURCES_LOCATOR).click().then(function () {
        return element(locators.ALL_FILTER_LOCATOR).click().then(function () {
            return waitForElement(locators.SELECT_ALL_CHECKBOX_LOCATOR);
        });
    });
}

function clickDone() {
    return element(by.cssContainingText('.bk-secondary-button', 'Done')).click();
}

function deselectAllSources() {
    return getSelectAllCheckbox().then(function (allCheckBox) {
        return hasAnyClass(allCheckBox, ['bk-checked', 'bk-indeterminate']).then(function (has) {
            if (has) {
                var clickPromise = allCheckBox.click();
                if ($('.bk-auto-popup').isPresent()) {
                    // if "OK" is present but not clickable for some reason, we still want
                    // to proceed and don't want .click() to fail. To achieve this we just
                    // give it empty onError handler.
                    return element(by.cssContainingText('.bk-btn', 'OK')).click().then(
                        function () {}, function () {}
                    );
                } else {
                    return clickPromise;
                }
            }
        });
    });
}

function selectAllSources() {
    return deselectAllSources().then(function () {
        return getSelectAllCheckbox().then(function (selectAllCheckbox) {
            return selectAllCheckbox.click();
        });
    });
}

function selectAllTables() {
    return deselectAllSources().then(function () {
        return element(
            locators.TABLES_LOCATOR
        ).element(by.xpath('..')).all(by.css('ul li .bk-checkbox')).click();
    }).then(clickDone);
}

function typeQuery(query) {
    return waitForElement(locators.SAGE_INPUT_LOCATOR).then(function (sageInput) {
        return sageInput.clear().then(function () {
            return waitForElement(locators.NO_CONTENT_LOCATOR).then(function () {
                return sageInput.sendKeys(query).then(function () {
                    // blur the sage bar
                    // element(by.css('.bk-sharable-item')).click();
                    return sageInput.sendKeys(protractor.Key.ENTER);
                });
            });
        });
    });
}

function typeQueryAndWait(query) {
    return typeQuery(query).then(function () {
        browser.sleep(1000);
        return waitForLoaderOrError();
    });
}

function hoverChart() {
    return browser.driver.actions().mouseMove(element(by.css('.bk-chart'))).perform();
}

function hoverLogo() {
    return browser.driver.actions().mouseMove(
        element(locators.HOME_LINK_LOCATOR)).perform();
}

function openChartSettings() {
    return hoverChart().then(function () {
        return $('.bk-toolbar-btn.bk-chart-editor').click();
    });
}

function chartSettingsDone() {
    $('.bk-chart-editor-done').click();
    return waitForLoaderOrError();
}

function setAxis(axisNumber, columns) {
    return openChartSettings().then(function () {
        return element.all(locators.AXIS_SETTINGS_LOCATOR).then(function (items) {
            var axis = items[axisNumber];
            var promises = [];
            axis.all(by.css('a.select2-search-choice-close')).click();
            columns.forEach(function (column) {
                promises.push(axis.element(by.css('input')).click().then(function () {
                    return axis.element(
                        by.cssContainingText('li.ui-select-choices-row', column)
                    ).click();
                }));
            });
            return protractor.promise.all(promises);
        }).then(function () {
            return chartSettingsDone();
        });
    });
}

function setXAxis(columns) {
    return setAxis(0, columns);
}

function setYAxis(columns) {
    return setAxis(1, columns);
}

function setLegend(columns) {
    return setAxis(2, columns);
}

function shareYAxis() {
    return openChartSettings().then(function () {
        $('.bk-style-icon-chart-link').click();
        return chartSettingsDone();
    });
}

function waitForHighcharts() {
    return waitForElement(locators.HIGHCHARTS_LOCATOR);
}

function selectChartType(type) {
    element(locators.CHART_TYPE_LOCATOR).click().then(function () {
        return element(by.css('.bk-chart-type-selector-panel')).element(
            by.cssContainingText('.bk-chart-type-selector-panel-name', type)
        ).click();
    });
    element(locators.CHART_TYPE_LOCATOR).click();
    return waitForHighcharts().then(function () {
        return waitForLoaderOrError();
    });
}

function loadApplication() {
    browser.get(HOME_URL);
    browser.sleep(500);
    browser.manage().deleteAllCookies();
}

function login(username, password) {
    username = username || browser.params.username || 'tsadmin';
    password = password || browser.params.password || 'admin';
    console.log('Waiting for login page');
    waitForElement(by.id('login-email'));
    var emailInput = element(by.id('login-email'));
    emailInput.click();
    console.log('logging in');
    emailInput.sendKeys(username);
    element(by.id('login-password')).sendKeys(password);
    return element(locators.LOGIN_BTN_LOCATOR).click();
}

function logout() {
    console.log('Logging out');
    return browser.executeScript(
        'return angular.element(document).scope().sessionService.doLogout()');
}

function scrollListDown(height) {
    return browser.driver.executeScript(
        '$(".bk-list-content").animate({scrollTop:"+=' + height + 'px"})'
    );
}

function scrollListToTop() {
    return browser.driver.executeScript('$(".bk-list-content").animate({scrollTop:"0px"})');
}

function readListData() {
    return element(by.css('.bk-list')).evaluate('listModel.data').then(function (data) {
        var result = data.map(function (row) {
            return {
                name: row.name,
                id: row.id,
                owner: row.owner,
                type: row.type,
            };
        });
        // Recursively go through all the pages and return concatenated result
        return element(locators.LIST_NEXT_BUTTON_LOCATOR).getAttribute('class').then(function (cls) {
            if (cls.indexOf('bk-disabled') !== -1) {
                return result;
            } else {
                return element(locators.LIST_NEXT_BUTTON_LOCATOR).click().then(function () {
                    return readListData().then(function (nextResult) {
                        return result.concat(nextResult);
                    });
                });
            }
        });
    });
}

function readWorksheets() {
    return readListData();
}

function readAnswers() {
    return readListData();
}

function readPinboards() {
    return readListData();
}

function readNumberOfSlides() {
    return $('.bk-slide-show-navigator').isPresent().then(function (present) {
        if (present) {
            return $('.bk-slide-show-navigator').isDisplayed();
        }
    }).then(function (displayed) {
        if (displayed) {
            return element(by.css('.bk-slide-show-navigator'))
            .evaluate('$ctrl.navigator.slides').then(function (slides) {
                return slides.length;
            })
        } else {
            return 1;
        }
    });
}

function clickFirstSlide() {
    return $('.bk-slide-show-navigator li').click();
}

function openSlideShow() {
    return browser.actions().sendKeys(protractor.Key.F5).perform();
}

function closeSlideShow() {
    var closeBtn = element(locators.CLOSE_BUTTON_LOCATOR);
    return closeBtn.isPresent().then(function (hasCloseBtn) {
        if (hasCloseBtn) {
            // Try to click Close button if present
            return closeBtn.click();
        } else {
            // No close button - last resort, just press ESC
            return browser.actions().sendKeys(protractor.Key.ESC).perform();
        }
    }).catch(function () {
        // Close button is not clickable, try clicking cross sign
        return minimizeViz();
    });
}

function expandError() {
    return element(locators.EXPAND_ERROR_LOCATOR).isPresent().then(function (isPresent) {
        if (isPresent) {
            return element(locators.EXPAND_ERROR_LOCATOR).click();
        }
    });
}

function maximizeViz() {
    return browser.driver.actions().mouseMove(element(locators.MAXIMIZE_VIZ_LOCATOR))
        .perform().then(function () {
            var EC = protractor.ExpectedConditions;
            browser.wait(EC.elementToBeClickable(element(locators.MAXIMIZE_VIZ_LOCATOR)), 5000);
            return element(locators.MAXIMIZE_VIZ_LOCATOR).click();
        });
}

function minimizeViz() {
    return element(locators.MINIMIZE_VIZ_LOCATOR).click();
}

function minimizeLeftPanel() {
    return element(locators.MINIMIZE_LEFT_PANEL_LOCATOR).click();
}

function prepare(config) {
    browser.driver.manage().window().setSize(BROWSER_WIDTH, BROWSER_HEIGHT);
    browser.setFileDetector(new remote.FileDetector());
    initLocators();
    readParams(config);

    var uri = new URI(BASE_URL);
    uri.setQuery(URL_QUERY);
    HOME_URL = uri.toString();
    var jasmineEnv = jasmine.getEnv();

    if (process.env.BLINK_REPORT_SERVER && process.env.BLINK_REPORT_SERVER.length > 0) {
        jasminePatcher.patchJasmine(jasmineEnv);

        var timeSpecReporter = {
            suiteStarted: function(result) {
                this.specStartTime = Date.now()
            },
            suiteDone: function(result) {
                var seconds = Math.floor((Date.now() - this.specStartTime) / 1000);
                // add the time for the current file
                var filename = result._filename;
                if (result.status != 'disabled') {
                    sharding.addResultToTracker(result.fullName, filename, seconds);
                }

            }
        };
        jasmine.getEnv().addReporter(timeSpecReporter);
    }

    var testReportFilePrefix = 'protractor-' + browser.params.label;
    if (config && config.capabilities.name) {
        testReportFilePrefix += '-' + config.capabilities.name;
    }

    jasmineEnv.addReporter(new jasmineReporters.JUnitXmlReporter({
        consolidateAll: true,
        savePath: './test/results/',
        filePrefix: testReportFilePrefix
    }));

    jasmineEnv.addReporter(new SpecReporter({
        displayStacktrace: 'all',
        displayPendingSummary: false
    }));

    if (browser.params.captureFailures === 'true') {
        jasmineEnv.addReporter(new VideoReporter({
            baseDirectory: './test/results/videos/',
            //Makes a seperate vid for each failing test.
            singleVideo: false
        }));
    }

    loadApplication();

    if (!!browser.params.shouldLogin) {
        return login();
    }
}

/*
 * Arrya.forEach with additional "skip" parameter
 * will skip first N elements and then start calling a callback
 */
function forEachWithSkip(arr, callback, skip) {
    var count = 0;
    return arr.forEach(function (item) {
        count++;
        if (!!skip && count < skip) {
            return;
        }
        return callback(item);
    });
}

/*
 * Arrya.forEach with additional start and length parameters.
 * will skip all elements before start index and after or equal to
 * (start + length) index and then start calling a callback
 */
function forEachWithSlice(arr, callback, start, length) {
    start = start || 0;
    var count = 0;
    return arr.forEach(function (item) {
        count++;
        if (!!length  && (start > count || count > start + length)) {
            return;
        }
        return callback(item);
    });
}

function writeJson(obj, filename) {
    var text = JSON.stringify(obj, null, 4);
    return writeText(text, filename, 'json');
}

function timestamp() {
    return (new Date()).getTime();
}

var desiredCapabilities = {
    'chromeOptions': {
        'args': [
            'lang=en-US',
            'enable-precise-memory-info' ,
            'js-flags=--expose-gc',
            'enable-automation'
        ],
        'prefs': {
            'download': {
                'prompt_for_download': false,
                // Can be changed via command line by providing
                // --capabilities.chromeOptions.prefs.download \
                // .default_directory='/home/hudson/desiredDirectory'
                'default_directory': '/tmp',
            }
        }
    }
    // https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
    // For a full reference on these.
    /* The make the tests fail in chrome, enable for IE.
     enablePersistentHover: false,
     nativeEvents: true,
     unexpectedAlertBehaviour: 'accept',
     ignoreProtectedModeSettings: true,
     requireWindowFocus: true,
     screenResolution: '1680x1050',
     maxDuration: 36008*/
};

function BaseConfig(specs, testMode) {
    specs = specs || [];
    var testMode = testMode || 'SMOKE';
    var sharded = !!sharding.parseBackends().length;
    var cleanScript = __dirname + '/' + 'protractor-cleanup.js';
    let multiCapabilities = sharded
        ? sharding.shardTestsAcrossCapabilities(specs, [cleanScript], 'chrome', desiredCapabilities)
        : [];
    return {
        seleniumAddress: 'http://localhost:4444/wd/hub',
        multiCapabilities: multiCapabilities,
        browser: "chrome",
        sauceUser: process.env.SAUCE_USER,
        sauceKey: process.env.SAUCE_KEY,
        sauceSeleniumAddress: process.env.SAUCE_SELENIUM_ADDRESS,
        jasmineNodeOpts: {
            // onComplete will be called just before the driver quits.
            onComplete: null,
            // If true, display spec names.
            isVerbose: false,
            // If true, print colors to the terminal.
            showColors: true,
            // If true, include stack traces in failures.
            includeStackTrace: true,
            // Default time to wait in ms before a test fails.
            defaultTimeoutInterval: parseInt(process.env.PROTRACTOR_DEFAULT_TIMEOUT) || 240000,
            print: function () {}
        },
        capabilities: desiredCapabilities,
        // browser: 'Chrome',
        allScriptsTimeout: parseInt(process.env.PROTRACTOR_ALL_SCRIPTS_TIMEOUT) || 180000,
        onPrepare: function() {
            sharding.initTracker();
            return browser.getProcessedConfig().then(function (config) {
                return prepare(config);
            });
        },
        onComplete: function() {
            console.log('Tests complete!');

            console.log('Browser console error!');
            // http://stackoverflow.com/questions/22082395/
            // view-console-log-output-in-angular-protractor-jasmine-test
            browser.manage().logs().get('browser').then(function(browserLogs) {
                // browserLogs is an array of objects with level and message fields
                browserLogs.forEach(function(log) {
                    if (log.level.value > 900) { // it's an error log
                        console.log(log.message);
                    }
                });
            });
            return sharding.postTracker(testMode);
        },
        specs: (sharded) ? [] : [...specs, cleanScript]
    };
}

module.exports = {
    BaseConfig: BaseConfig,
    HOME_URL: HOME_URL,
    URI_QUERY: URL_QUERY,
    addFormulaToWorksheet: addFormulaToWorksheet,
    clickFirstSlide: clickFirstSlide,
    closeSlideShow: closeSlideShow,
    cropLastScreenshot: cropLastScreenshot,
    editWorksheet: editWorksheet,
    expandError: expandError,
    forEachWithSkip: forEachWithSkip,
    forEachWithSlice: forEachWithSlice,
    goHome: goHome,
    waitForHomePage: waitForHomePage,
    goToAdmin: goToAdmin,
    goToAnswer: goToAnswer,
    goToPinboards: goToPinboards,
    goToSavedAnswers: goToSavedAnswers,
    goToUserdata: goToUserdata,
    goToWorksheet: goToWorksheet,
    goToWorksheets: goToWorksheets,
    hasErrorAlert: hasErrorAlert,
    hoverLogo: hoverLogo,
    locators: locators,
    login: login,
    logout: logout,
    maximizeViz: maximizeViz,
    minimizeLeftPanel: minimizeLeftPanel,
    minimizeViz: minimizeViz,
    openAnswerById: openAnswerById,
    openPinboardById: openPinboardById,
    openSlideShow: openSlideShow,
    prepare: prepare,
    readAnswers: readAnswers,
    readNumberOfSlides: readNumberOfSlides,
    readPinboards: readPinboards,
    readWorksheets: readWorksheets,
    screenshotExists: screenshotExists,
    jsonDownloadExists: jsonDownloadExists,
    scrollListDown: scrollListDown,
    scrollListToTop: scrollListToTop,
    selectAllTables: selectAllTables,
    selectChartType: selectChartType,
    setLegend: setLegend,
    setXAxis: setXAxis,
    setYAxis: setYAxis,
    shareYAxis: shareYAxis,
    shouldSkipTest: shouldSkipTest,
    shouldSkipDownload: shouldSkipDownload,
    takeFullPageScreenshot: takeFullPageScreenshot,
    takeScreenshot: takeScreenshot,
    timestamp: timestamp,
    typeQuery: typeQuery,
    typeQueryAndWait: typeQueryAndWait,
    waitForElement: waitForElement,
    waitForHighcharts: waitForHighcharts,
    waitForLoaderOrError: waitForLoaderOrError,
    waitForLoading: waitForLoading,
    waitForVizsOrError: waitForVizsOrError,
    writeJson: writeJson,
    writeText: writeText
};
