/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Pavan Piratla (pavan@thoughtspot.com)
 * This script is to be used to run stress perf queries
 * and collect some backend metrics.
 */

'use strict';

var common = require('../scenarios/common.js');
var fs = require('fs-extra');
var leftPanel = require('../scenarios/sage/data-panel/data-panel.js');
var sage = require('../scenarios/sage/sage.js');
var table = require('../scenarios/table/table.js');
/* eslint camelcase: 1, no-undef: 0 */

describe('Run stress perf queries', function() {
    beforeAll(function () {
        common.navigation.goToQuestionSection();
        leftPanel.selectAllTables();
    });

    afterEach(function (){
        browser.sleep(20000 + Math.random() * 40000);
    });

    // From stackoverflow: can-protractor-tests-be-run-in-a-random-order
    var shuffle = function (items) {
        var item, ii;
        for(var i = 0; i < items.length; i++){
            ii = Math.floor(Math.random() * items.length);
            item = items[i];
            items[i] = items[ii];
            items[ii] = item;
        }
    };

    it("date_iattr_1k customer_10m_iattr_10k", function() {
        var sageQuery = "idate_iattr_1k customer_10m_iattr_10k";
        var fileName = browser.params.saveAs + '0';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("date_iattr_1k customer_10m_iattr_10k top 10 customer_10m_id", function() {
        var sageQuery = "date_iattr_1k customer_10m_iattr_10k top 10 customer_10m_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("broker_10m_sattr_100 mfg_rating", function() {
        var sageQuery = "broker_10m_sattr_100 mfg_rating";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("top 5 date_id mfg_sattr_1k", function() {
        var sageQuery = "top 5 date_id mfg_sattr_1k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("top 5 date_id mfg_sattr_10k", function() {
        var sageQuery = "top 5 date_id mfg_sattr_10k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("date_id mfg_sattr_10k by mfg_rating", function() {
        var sageQuery = "date_id mfg_sattr_10k by mfg_rating";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("mfg_sattr_10k by mfg_rating offer_dm_6", function() {
        var sageQuery = "mfg_sattr_10k by mfg_rating offer_dm_6";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("purchase_i32m_2 purchase_iattr_20m supplier_10m_iattr_100 supplier_10m_id supplier_10m_sattr_1k", function() {
        var sageQuery = "purchase_i32m_2 purchase_iattr_20m supplier_10m_iattr_100 supplier_10m_id supplier_10m_sattr_1k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("vendor_iattr_10k sort by mfg_rating mfg_id vendor_preferred vendor_sattr_10", function() {
        var sageQuery = "vendor_iattr_10k sort by mfg_rating mfg_id vendor_preferred vendor_sattr_10";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("vendor_iattr_10k sale_units sale_store_5m_id store_10m_iattr_10k sale_item_id", function() {
        var sageQuery = "vendor_iattr_10k sale_units sale_store_5m_id store_10m_iattr_10k sale_item_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("date_iattr_1k sort by offer_i64m_3", function() {
        var sageQuery = "date_iattr_1k sort by offer_i64m_3";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("item_name by vendor_accountid", function() {
        var sageQuery = "item_name by vendor_accountid";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("purchase_iattr_100k by date_id weekly", function() {
        var sageQuery = "purchase_iattr_100k by date_id weekly";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("purchase_iattr_100k by date_id weekly broker_10m_sattr_100", function() {
        var sageQuery = "purchase_iattr_100k by date_id weekly broker_10m_sattr_100";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("purchase_iattr_100k by date_id weekly broker_10m_sattr_100 purchase_i64m_6", function() {
        var sageQuery = "purchase_iattr_100k by date_id weekly broker_10m_sattr_100 purchase_i64m_6";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("sale_customer_100_id customer_10m_iattr_1k customer_10m_sattr_10k", function() {
        var sageQuery = "sale_customer_100_id customer_10m_iattr_1k customer_10m_sattr_10k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count purchase_iattr_100k by broker_10m_sattr_100", function() {
        var sageQuery = "unique count purchase_iattr_100k by broker_10m_sattr_100";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count purchase_iattr_100k item_iattr_40m item_iattr_80m item_iattr_5m item_iattr_1m", function() {
        var sageQuery = "unique count purchase_iattr_100k item_iattr_40m item_iattr_80m item_iattr_5m item_iattr_1m";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("item_sattr_40m broker_10m_sattr_10m customer_10m_sattr_10m date_is_holiday", function() {
        var sageQuery = "item_sattr_40m broker_10m_sattr_10m customer_10m_sattr_10m date_is_holiday";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("item_sattr_40m broker_10m_sattr_10m customer_10m_sattr_10m date_is_holiday date_id", function() {
        var sageQuery = "item_sattr_40m broker_10m_sattr_10m customer_10m_sattr_10m date_is_holiday date_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("customer_10m_sattr_1m item_sattr_100k item_sattr_10m", function() {
        var sageQuery = "customer_10m_sattr_1m item_sattr_100k item_sattr_10m";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("customer_10m_sattr_1m item_sattr_100k item_sattr_10m item_mfg_id", function() {
        var sageQuery = "customer_10m_sattr_1m item_sattr_100k item_sattr_10m item_mfg_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("customer_10m_sattr_1m item_sattr_100k item_sattr_10m item_mfg_id item_name", function() {
        var sageQuery = "customer_10m_sattr_1m item_sattr_100k item_sattr_10m item_mfg_id item_name";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count offer_i32m_9 offer_price offer_span purchase_fm_0 purchase_units", function() {
        var sageQuery = "unique count offer_i32m_9 offer_price offer_span purchase_fm_0 purchase_units";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count sale_iattr_80m", function() {
        var sageQuery = "unique count sale_iattr_80m";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count sale_iattr_80m sale_price", function() {
        var sageQuery = "unique count sale_iattr_80m sale_price";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count sale_iattr_80m sale_price sale_sattr_10", function() {
        var sageQuery = "unique count sale_iattr_80m sale_price sale_sattr_10";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("sale_store_1k_id sale_sattr_100k sale_item_id", function() {
        var sageQuery = "sale_store_1k_id sale_sattr_100k sale_item_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("sale_store_1k_id sale_sattr_100k sale_item_id sale_sattr_20m", function() {
        var sageQuery = "sale_store_1k_id sale_sattr_100k sale_item_id sale_sattr_20m";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("broker_10m_iattr_10k customer_10m_iattr_1k date_iattr_1k customer_10m_iattr_10k", function() {
        var sageQuery = "broker_10m_iattr_10k customer_10m_iattr_1k date_iattr_1k customer_10m_iattr_10k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("item_iattr_5m item_sattr_10m mfg_iattr_10k", function() {
        var sageQuery = "item_iattr_5m item_sattr_10m mfg_iattr_10k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("item_iattr_5m item_sattr_10m mfg_iattr_10k mfg_accountid", function() {
        var sageQuery = "item_iattr_5m item_sattr_10m mfg_iattr_10k mfg_accountid";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("purchase_dm_6 item_sattr_5m", function() {
        var sageQuery = "purchase_dm_6 item_sattr_5m";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("broker_10m_sattr_10k date_iattr_100 date_is_holiday", function() {
        var sageQuery = "broker_10m_sattr_10k date_iattr_100 date_is_holiday";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count broker_10m_sattr_5m by broker_10m_sattr_100 date_id hourly", function() {
        var sageQuery = "unique count broker_10m_sattr_5m by broker_10m_sattr_100 date_id hourly";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count broker_10m_sattr_5m by broker_10m_sattr_100 broker_10m_type", function() {
        var sageQuery = "unique count broker_10m_sattr_5m by broker_10m_sattr_100 broker_10m_type";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("unique count broker_10m_sattr_5m by broker_10m_sattr_100 broker_10m_type broker_10m_sattr_1k", function() {
        var sageQuery = "unique count broker_10m_sattr_5m by broker_10m_sattr_100 broker_10m_type broker_10m_sattr_1k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("top 60 customer_10m_sattr_100k customer_10m_status customer_10m_iattr_2m customer_10m_id", function() {
        var sageQuery = "top 60 customer_10m_sattr_100k customer_10m_status customer_10m_iattr_2m customer_10m_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("customer_10m_name broker_10m_sattr_100k", function() {
        var sageQuery = "customer_10m_name broker_10m_sattr_100k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("offer_sattr_10k offer_store_10k_id vendor_sattr_100", function() {
        var sageQuery = "offer_sattr_10k offer_store_10k_id vendor_sattr_100";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("offer_sattr_10k offer_store_10k_id vendor_sattr_100 vendor_preferred", function() {
        var sageQuery = "offer_sattr_10k offer_store_10k_id vendor_sattr_100 vendor_preferred";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("offer_sattr_10k offer_store_10k_id vendor_sattr_100 vendor_preferred vendor_iattr_10k", function() {
        var sageQuery = "offer_sattr_10k offer_store_10k_id vendor_sattr_100 vendor_preferred vendor_iattr_10k";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("vendor_accountid supplier_10m_sattr_100 supplier_10m_iattr_10m", function() {
        var sageQuery = "vendor_accountid supplier_10m_sattr_100 supplier_10m_iattr_10m";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("vendor_accountid supplier_10m_sattr_100 supplier_10m_iattr_10m supplier_10m_iattr_100", function() {
        var sageQuery = "vendor_accountid supplier_10m_sattr_100 supplier_10m_iattr_10m supplier_10m_iattr_100";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("sale_sattr_20m sale_iattr_5m sale_broker_20m_id sale_broker_100_id", function() {
        var sageQuery = "sale_sattr_20m sale_iattr_5m sale_broker_20m_id sale_broker_100_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("sale_sattr_20m sale_iattr_5m sale_broker_20m_id sale_broker_100_id sale_customer_10m_id", function() {
        var sageQuery = "sale_sattr_20m sale_iattr_5m sale_broker_20m_id sale_broker_100_id sale_customer_10m_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("purchase_store_20m_id purchase_sattr_5m mfg_sattr_100", function() {
        var sageQuery = "purchase_store_20m_id purchase_sattr_5m mfg_sattr_100";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("purchase_store_20m_id purchase_sattr_5m mfg_sattr_100 mfg_accountid", function() {
        var sageQuery = "purchase_store_20m_id purchase_sattr_5m mfg_sattr_100 mfg_accountid";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("item_review item_sattr_10m item_sattr_2m", function() {
        var sageQuery = "item_review item_sattr_10m item_sattr_2m";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    it("item_review item_sattr_10m item_sattr_2m item_iattr_10m item_mfg_id", function() {
        var sageQuery = "item_review item_sattr_10m item_sattr_2m item_iattr_10m item_mfg_id";
        var fileName = browser.params.saveAs + '1';
        sage.sageInputElement.click();
        sage.sageInputElement.enter(sageQuery);
        table.waitForTable()
        .then(function(retValue) {
            browser.executeScript(
                "window.testCapture.captureAndDownload('" + fileName + ".json', \"" + sageQuery + "\");");
            browser.driver.wait(function() {
                return fs.existsSync('/tmp/teslaDownloads/' + fileName + ".json");
            }, 60000).then(function() {
                console.log('Download successful');
            });
        });
    });
    shuffle(this.children);
});
