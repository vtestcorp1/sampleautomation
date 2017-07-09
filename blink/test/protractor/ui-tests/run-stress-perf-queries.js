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

    it("Stress Perf Queries Test- End Date Attribute 2 Super Department for Super Department 'super_dept_nm_ 3' Item ID Attribute 3 Attribute 1 Item Name Division Mktplc Commisions Auth $ Net Sales (s2h + s2s) Ly Auth Qty", function() {
        var sageQuery = "End Date Attribute 2 Super Department for Super Department 'super_dept_nm_ 3' Item ID Attribute 3 Attribute 1 Item Name Division Mktplc Commisions Auth $ Net Sales (s2h + s2s) Ly Auth Qty";
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
    it("Stress Perf Queries Test- Attribute 3 Department Item Name Net Sales (s2h + s2s) Ly Return Qty Auth Amt Cust Return $", function() {
        var sageQuery = "Attribute 3 Department Item Name Net Sales (s2h + s2s) Ly Return Qty Auth Amt Cust Return $";
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
    it("Stress Perf Queries Test- Channel for Report Date = 12/23/2005 Super Department Attribute 2 End Date Division Return Qty Ly Cancel $ Net Sales (S2H + S2S + PuT + SFS) Ly Cancel Qty", function() {
        var sageQuery = "Channel for Report Date = 12/23/2005 Super Department Attribute 2 End Date Division Return Qty Ly Cancel $ Net Sales (S2H + S2S + PuT + SFS) Ly Cancel Qty";
        var fileName = browser.params.saveAs + '2';
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
    it("Stress Perf Queries Test- Attribute 1 Distributor for Report Date after 12/20/2005 LY Shipping Revenue $ Net Sales (s2h + s2s) Mktplc Commisions LY Auth $", function() {
        var sageQuery = "Attribute 1 Distributor for Report Date after 12/20/2005 LY Shipping Revenue $ Net Sales (s2h + s2s) Mktplc Commisions LY Auth $";
        var fileName = browser.params.saveAs + '3';
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
    it("Stress Perf Queries Test- Super Department Category for Report Date after 12/20/2005 Seller Name Attribute 1 Distributor Attribute 2 Sub Category LY Net Sales (s2h + s2s) Return $ Return Qty LY Net Corp Sales", function() {
        var sageQuery = "Super Department Category for Report Date after 12/20/2005 Seller Name Attribute 1 Distributor Attribute 2 Sub Category LY Net Sales (s2h + s2s) Return $ Return Qty LY Net Corp Sales";
        var fileName = browser.params.saveAs + '4';
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
    it("Stress Perf Queries Test- Channel Attribute 2 Department for Department 'dept_nm_ 45' End Date Division for Division 'div_nm_ 2' Item ID for Report Date before 06/06/2005 Return Qty Ly Return $ Sold SKU Count LY Shipping Cost $", function() {
        var sageQuery = "Channel Attribute 2 Department for Department 'dept_nm_ 45' End Date Division for Division 'div_nm_ 2' Item ID for Report Date before 06/06/2005 Return Qty Ly Return $ Sold SKU Count LY Shipping Cost $";
        var fileName = browser.params.saveAs + '5';
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
    it("Stress Perf Queries Test- Sub Category for Sub Category 'sub_categ_nm_ 120' Item ID Buyer Attribute 3 Distributor Super Department for Super Department 'super_dept_nm_ 3' Division for Report Date = 12/23/2005 Attribute 2 Net Corp Sales Auth $ Ly Cancel $ Ly Return Qty", function() {
        var sageQuery = "Sub Category for Sub Category 'sub_categ_nm_ 120' Item ID Buyer Attribute 3 Distributor Super Department for Super Department 'super_dept_nm_ 3' Division for Report Date = 12/23/2005 Attribute 2 Net Corp Sales Auth $ Ly Cancel $ Ly Return Qty";
        var fileName = browser.params.saveAs + '6';
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
    it("Stress Perf Queries Test- Sub Category Vendor Name Attribute 1 for Attribute 1 'attribute_value_1_ 13' for Start Date after 12/20/2005 Attribute 2 Attribute 3 Channel LY Shipping Profit $ Sold SKU Count Ly Return Qty Net Corp Sales", function() {
        var sageQuery = "Sub Category Vendor Name Attribute 1 for Attribute 1 'attribute_value_1_ 13' for Start Date after 12/20/2005 Attribute 2 Attribute 3 Channel LY Shipping Profit $ Sold SKU Count Ly Return Qty Net Corp Sales";
        var fileName = browser.params.saveAs + '7';
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
    it("Stress Perf Queries Test- Item Name Division End Date for End Date 'offer_end_dt_ 6575' Seller Name for Seller Name 'org_nm_ 42' Attribute 2 LY Shipping Profit $ Auth $ Return Qty Ly Auth Qty", function() {
        var sageQuery = "Item Name Division End Date for End Date 'offer_end_dt_ 6575' Seller Name for Seller Name 'org_nm_ 42' Attribute 2 LY Shipping Profit $ Auth $ Return Qty Ly Auth Qty";
        var fileName = browser.params.saveAs + '8';
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
    it("Stress Perf Queries Test- Channel Attribute 2 Vendor Name Distributor Buyer Category Division for Division 'div_nm_ 3' Super Department Brand Name Net Sales (s2h + s2s) LY Net Sales (s2h + s2s) Net Corp Sales Ly Cancel $", function() {
        var sageQuery = "Channel Attribute 2 Vendor Name Distributor Buyer Category Division for Division 'div_nm_ 3' Super Department Brand Name Net Sales (s2h + s2s) LY Net Sales (s2h + s2s) Net Corp Sales Ly Cancel $";
        var fileName = browser.params.saveAs + '9';
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
    it("Stress Perf Queries Test- Attribute 2 for Attribute 2 'attribute_value_2_ 3713' for Report Date between 12/14/2002 and 05/05/2007 Channel for Channel 'short_desc_ 7' Item Name Division Distributor Attribute 3 Sub Category Attribute 1 LY Net Sales (s2h + s2s) Cancel $ Auth $ Ly Cancel Qty", function() {
        var sageQuery = "Attribute 2 for Attribute 2 'attribute_value_2_ 3713' for Report Date between 12/14/2002 and 05/05/2007 Channel for Channel 'short_desc_ 7' Item Name Division Distributor Attribute 3 Sub Category Attribute 1 LY Net Sales (s2h + s2s) Cancel $ Auth $ Ly Cancel Qty";
        var fileName = browser.params.saveAs + '10';
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
    it("Stress Perf Queries Test- for report date after 12/20/2005 item name attribute 1 division seller name for seller name 'org_nm_ 21' brand name for brand name 'brand_name_ 25172' channel for channel 'short_desc_ 1' for division 'div_nm_ 2' ly cancel qty ly shipping revenue $ net sales (s2h + s2s + put + sfs) mktplc commisions", function() {
        var sageQuery = "for report date after 12/20/2005 item name attribute 1 division seller name for seller name 'org_nm_ 21' brand name for brand name 'brand_name_ 25172' channel for channel 'short_desc_ 1' for division 'div_nm_ 2' ly cancel qty ly shipping revenue $ net sales (s2h + s2s + put + sfs) mktplc commisions";
        var fileName = browser.params.saveAs + '11';
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
    it("Stress Perf Queries Test- Channel for Channel 'short_desc_ 11' Sub Category for Start Date before 06/06/2005 Attribute 3 Super Department Item Name Item ID Attribute 1 for Attribute 1 'attribute_value_1_ 10' Seller Name LY Shipping Revenue $ Return $ Net Corp Sales Mktplc Commisions", function() {
        var sageQuery = "Channel for Channel 'short_desc_ 11' Sub Category for Start Date before 06/06/2005 Attribute 3 Super Department Item Name Item ID Attribute 1 for Attribute 1 'attribute_value_1_ 10' Seller Name LY Shipping Revenue $ Return $ Net Corp Sales Mktplc Commisions";
        var fileName = browser.params.saveAs + '12';
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
    it("Stress Perf Queries Test- for Start Date between 12/14/2002 and 05/05/2007 Division Super Department Attribute 3 Net Corp Sales LY Shipping Profit $ Ly Return Qty LY Auth $", function() {
        var sageQuery = "for Start Date between 12/14/2002 and 05/05/2007 Division Super Department Attribute 3 Net Corp Sales LY Shipping Profit $ Ly Return Qty LY Auth $";
        var fileName = browser.params.saveAs + '13';
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
    it("Stress Perf Queries Test- for Start Date = 12/23/2005 Category for Category 'categ_nm_ 51' Department for Department 'dept_nm_ 25' Attribute 2 Auth Qty LY Auth Amt Cust Ly Cancel $ Ly Cancel Qty", function() {
        var sageQuery = "for Start Date = 12/23/2005 Category for Category 'categ_nm_ 51' Department for Department 'dept_nm_ 25' Attribute 2 Auth Qty LY Auth Amt Cust Ly Cancel $ Ly Cancel Qty";
        var fileName = browser.params.saveAs + '14';
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
    it("Stress Perf Queries Test- Channel Item Name for Report Date between 12/14/2002 and 05/05/2007 Attribute 1 Attribute 2 Net Sales (s2h + s2s) Mktplc Commisions Ly Auth Qty Ly Cancel Qty", function() {
        var sageQuery = "Channel Item Name for Report Date between 12/14/2002 and 05/05/2007 Attribute 1 Attribute 2 Net Sales (s2h + s2s) Mktplc Commisions Ly Auth Qty Ly Cancel Qty";
        var fileName = browser.params.saveAs + '15';
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
    it("Stress Perf Queries Test- for Report Date = 12/23/2005 Vendor Name for Vendor Name 'vendor_name_ 19' Brand Name Item ID for Brand Name 'brand_name_ 31958' Department for Department 'dept_nm_ 50' for Brand Name 'brand_name_ 10818' for Department 'dept_nm_ 60' Attribute 3 Super Department LY Auth Amt Cust LY Shipping Revenue $ Auth Qty LY Net Corp Sales", function() {
        var sageQuery = "for Report Date = 12/23/2005 Vendor Name for Vendor Name 'vendor_name_ 19' Brand Name Item ID for Brand Name 'brand_name_ 31958' Department for Department 'dept_nm_ 50' for Brand Name 'brand_name_ 10818' for Department 'dept_nm_ 60' Attribute 3 Super Department LY Auth Amt Cust LY Shipping Revenue $ Auth Qty LY Net Corp Sales";
        var fileName = browser.params.saveAs + '16';
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
    it("Stress Perf Queries Test- Seller Name for Start Date = 12/23/2005 Category Attribute 1 Channel Attribute 2 End Date Department for Department 'dept_nm_ 99' for End Date 'offer_end_dt_ 1609' Net Corp Sales Ly Cancel $ LY Shipping Revenue $ LY Auth $", function() {
        var sageQuery = "Seller Name for Start Date = 12/23/2005 Category Attribute 1 Channel Attribute 2 End Date Department for Department 'dept_nm_ 99' for End Date 'offer_end_dt_ 1609' Net Corp Sales Ly Cancel $ LY Shipping Revenue $ LY Auth $";
        var fileName = browser.params.saveAs + '17';
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
    it("Stress Perf Queries Test- Attribute 3 Buyer Cancel $ Return Qty Ly Cancel Qty Ly Auth Qty", function() {
        var sageQuery = "Attribute 3 Buyer Cancel $ Return Qty Ly Cancel Qty Ly Auth Qty";
        var fileName = browser.params.saveAs + '18';
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
    it("Stress Perf Queries Test- Attribute 3 for Report Date before 06/06/2005 Channel Super Department for Channel 'short_desc_ 9' LY Net Corp Sales Auth $ Sold SKU Count Cancel $", function() {
        var sageQuery = "Attribute 3 for Report Date before 06/06/2005 Channel Super Department for Channel 'short_desc_ 9' LY Net Corp Sales Auth $ Sold SKU Count Cancel $";
        var fileName = browser.params.saveAs + '19';
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
    it("Stress Perf Queries Test- Super Department Channel for Channel 'short_desc_ 1' for Start Date = 12/23/2005 Ly Return $ LY Shipping Revenue $ Net Sales (S2H + S2S + PuT + SFS) Auth Qty", function() {
        var sageQuery = "Super Department Channel for Channel 'short_desc_ 1' for Start Date = 12/23/2005 Ly Return $ LY Shipping Revenue $ Net Sales (S2H + S2S + PuT + SFS) Auth Qty";
        var fileName = browser.params.saveAs + '20';
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
    it("Stress Perf Queries Test- Seller Name for Seller Name 'org_nm_ 131' for Seller Name 'org_nm_ 91' Distributor End Date Buyer Item Name LY Shipping Cost $ Return Qty Mktplc Commisions LY Net Sales (S2H + S2S + PuT + SFS)", function() {
        var sageQuery = "Seller Name for Seller Name 'org_nm_ 131' for Seller Name 'org_nm_ 91' Distributor End Date Buyer Item Name LY Shipping Cost $ Return Qty Mktplc Commisions LY Net Sales (S2H + S2S + PuT + SFS)";
        var fileName = browser.params.saveAs + '21';
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
    it("Stress Perf Queries Test- Buyer Vendor Name for Vendor Name 'vendor_name_ 2' Attribute 1 Super Department Channel for Channel 'short_desc_ 6' Attribute 2 Sub Category for Attribute 2 'attribute_value_2_ 2886' LY Auth $ Cancel Qty Ly Cancel $ Ly Cancel Qty", function() {
        var sageQuery = "Buyer Vendor Name for Vendor Name 'vendor_name_ 2' Attribute 1 Super Department Channel for Channel 'short_desc_ 6' Attribute 2 Sub Category for Attribute 2 'attribute_value_2_ 2886' LY Auth $ Cancel Qty Ly Cancel $ Ly Cancel Qty";
        var fileName = browser.params.saveAs + '22';
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
    it("Stress Perf Queries Test- Buyer for Buyer 'buyer_nm_ 58' Brand Name for Start Date between 12/14/2002 and 05/05/2007 Sub Category for Sub Category 'sub_categ_nm_ 29' LY Net Sales (S2H + S2S + PuT + SFS) Net Corp Sales Sold SKU Count LY Net Corp Sales", function() {
        var sageQuery = "Buyer for Buyer 'buyer_nm_ 58' Brand Name for Start Date between 12/14/2002 and 05/05/2007 Sub Category for Sub Category 'sub_categ_nm_ 29' LY Net Sales (S2H + S2S + PuT + SFS) Net Corp Sales Sold SKU Count LY Net Corp Sales";
        var fileName = browser.params.saveAs + '23';
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
    it("Stress Perf Queries Test- Attribute 1 for Attribute 1 'attribute_value_1_ 13' Attribute 2 for Start Date between 12/14/2002 and 05/05/2007 Ly Cancel $ Ly Auth Qty LY Auth $ Cancel $", function() {
        var sageQuery = "Attribute 1 for Attribute 1 'attribute_value_1_ 13' Attribute 2 for Start Date between 12/14/2002 and 05/05/2007 Ly Cancel $ Ly Auth Qty LY Auth $ Cancel $";
        var fileName = browser.params.saveAs + '24';
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
    it("Stress Perf Queries Test- for Report Date before 06/06/2005 Item ID Vendor Name for Vendor Name 'vendor_name_ 3' Division Attribute 2 End Date Super Department Auth $ LY Shipping Cost $ Auth Qty Return $", function() {
        var sageQuery = "for Report Date before 06/06/2005 Item ID Vendor Name for Vendor Name 'vendor_name_ 3' Division Attribute 2 End Date Super Department Auth $ LY Shipping Cost $ Auth Qty Return $";
        var fileName = browser.params.saveAs + '25';
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
    it("Stress Perf Queries Test- Vendor Name for Vendor Name 'vendor_name_ 8' Super Department Attribute 2 for Report Date before 06/06/2005 Attribute 3 Seller Name for Seller Name 'org_nm_ 55' End Date Net Sales (s2h + s2s) Auth $ Mktplc Commisions Return $", function() {
        var sageQuery = "Vendor Name for Vendor Name 'vendor_name_ 8' Super Department Attribute 2 for Report Date before 06/06/2005 Attribute 3 Seller Name for Seller Name 'org_nm_ 55' End Date Net Sales (s2h + s2s) Auth $ Mktplc Commisions Return $";
        var fileName = browser.params.saveAs + '26';
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
    it("Stress Perf Queries Test- Attribute 3 Buyer Item Name Seller Name Attribute 1 Vendor Name for Vendor Name 'vendor_name_ 17' Distributor for Distributor 'ship_node_name_ 1071' Super Department for Super Department 'super_dept_nm_ 18' for Attribute 3 'attribute_value_3_ 3281' Category for Category 'categ_nm_ 151' Ly Return Qty LY Net Sales (s2h + s2s) LY Shipping Cost $ Ly Return $", function() {
        var sageQuery = "Attribute 3 Buyer Item Name Seller Name Attribute 1 Vendor Name for Vendor Name 'vendor_name_ 17' Distributor for Distributor 'ship_node_name_ 1071' Super Department for Super Department 'super_dept_nm_ 18' for Attribute 3 'attribute_value_3_ 3281' Category for Category 'categ_nm_ 151' Ly Return Qty LY Net Sales (s2h + s2s) LY Shipping Cost $ Ly Return $";
        var fileName = browser.params.saveAs + '27';
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
    it("Stress Perf Queries Test- Category Super Department Item ID Distributor for Distributor 'ship_node_name_ 5889' for Start Date before 06/06/2005 Ly Return Qty Auth $ LY Shipping Revenue $ Mktplc Commisions", function() {
        var sageQuery = "Category Super Department Item ID Distributor for Distributor 'ship_node_name_ 5889' for Start Date before 06/06/2005 Ly Return Qty Auth $ LY Shipping Revenue $ Mktplc Commisions";
        var fileName = browser.params.saveAs + '28';
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
    it("Stress Perf Queries Test- for Report Date between 12/14/2002 and 05/05/2007 Department for Department 'dept_nm_ 11' Channel for Channel 'short_desc_ 1' Item ID Attribute 3 Attribute 2 Division Category Seller Name Vendor Name Ly Return Qty Ly Cancel $ LY Net Sales (S2H + S2S + PuT + SFS) LY Shipping Cost $", function() {
        var sageQuery = "for Report Date between 12/14/2002 and 05/05/2007 Department for Department 'dept_nm_ 11' Channel for Channel 'short_desc_ 1' Item ID Attribute 3 Attribute 2 Division Category Seller Name Vendor Name Ly Return Qty Ly Cancel $ LY Net Sales (S2H + S2S + PuT + SFS) LY Shipping Cost $";
        var fileName = browser.params.saveAs + '29';
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
    it("Stress Perf Queries Test- Channel for Start Date after 12/20/2005 Category Seller Name Ly Return $ Net Sales (s2h + s2s) Mktplc Commisions LY Net Corp Sales", function() {
        var sageQuery = "Channel for Start Date after 12/20/2005 Category Seller Name Ly Return $ Net Sales (s2h + s2s) Mktplc Commisions LY Net Corp Sales";
        var fileName = browser.params.saveAs + '30';
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
    it("Stress Perf Queries Test- Attribute 2 End Date for End Date 'offer_end_dt_ 3926' for Report Date between 12/14/2002 and 05/05/2007 Brand Name for Brand Name contains '0' Buyer Attribute 3 Vendor Name for Vendor Name 'vendor_name_ 6' Channel for Channel 'short_desc_ 5' LY Auth Amt Cust LY Shipping Revenue $ Mktplc Commisions Return Qty", function() {
        var sageQuery = "Attribute 2 End Date for End Date 'offer_end_dt_ 3926' for Report Date between 12/14/2002 and 05/05/2007 Brand Name for Brand Name contains '0' Buyer Attribute 3 Vendor Name for Vendor Name 'vendor_name_ 6' Channel for Channel 'short_desc_ 5' LY Auth Amt Cust LY Shipping Revenue $ Mktplc Commisions Return Qty";
        var fileName = browser.params.saveAs + '31';
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
    it("Stress Perf Queries Test- Department Distributor Attribute 3 LY Net Corp Sales LY Auth Amt Cust Auth Amt Cust Cancel $", function() {
        var sageQuery = "Department Distributor Attribute 3 LY Net Corp Sales LY Auth Amt Cust Auth Amt Cust Cancel $";
        var fileName = browser.params.saveAs + '32';
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
    it("Stress Perf Queries Test- Channel for Channel 'short_desc_ 10' Attribute 1 Department for Department 'dept_nm_ 50' Attribute 2 Super Department Distributor Return $ Net Corp Sales Ly Auth Qty Auth Qty", function() {
        var sageQuery = "Channel for Channel 'short_desc_ 10' Attribute 1 Department for Department 'dept_nm_ 50' Attribute 2 Super Department Distributor Return $ Net Corp Sales Ly Auth Qty Auth Qty";
        var fileName = browser.params.saveAs + '33';
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
    it("Stress Perf Queries Test- Buyer Attribute 2 Attribute 1 for Attribute 1 'attribute_value_1_ 1' Distributor for Start Date after 12/20/2005 Attribute 3 Sub Category Seller Name for Seller Name 'org_nm_ 15' LY Net Sales (S2H + S2S + PuT + SFS) Ly Return $ Return $ Auth Amt Cust", function() {
        var sageQuery = "Buyer Attribute 2 Attribute 1 for Attribute 1 'attribute_value_1_ 1' Distributor for Start Date after 12/20/2005 Attribute 3 Sub Category Seller Name for Seller Name 'org_nm_ 15' LY Net Sales (S2H + S2S + PuT + SFS) Ly Return $ Return $ Auth Amt Cust";
        var fileName = browser.params.saveAs + '34';
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
    it("Stress Perf Queries Test- Channel for Start Date = 12/23/2005 Sold SKU Count Cancel Qty LY Auth Amt Cust Auth $", function() {
        var sageQuery = "Channel for Start Date = 12/23/2005 Sold SKU Count Cancel Qty LY Auth Amt Cust Auth $";
        var fileName = browser.params.saveAs + '35';
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
    it("Stress Perf Queries Test- Distributor Attribute 3 Division for Division 'div_nm_ 3' Item Name Sub Category for Sub Category contains '40' End Date for Start Date between 12/14/2002 and 05/05/2007 Attribute 2 Ly Cancel $ LY Net Sales (S2H + S2S + PuT + SFS) Net Sales (s2h + s2s) Net Corp Sales", function() {
        var sageQuery = "Distributor Attribute 3 Division for Division 'div_nm_ 3' Item Name Sub Category for Sub Category contains '40' End Date for Start Date between 12/14/2002 and 05/05/2007 Attribute 2 Ly Cancel $ LY Net Sales (S2H + S2S + PuT + SFS) Net Sales (s2h + s2s) Net Corp Sales";
        var fileName = browser.params.saveAs + '36';
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
    it("Stress Perf Queries Test- Attribute 1 Attribute 2 Brand Name Sub Category Channel Net Sales (S2H + S2S + PuT + SFS) Ly Cancel $ LY Shipping Cost $ LY Net Sales (S2H + S2S + PuT + SFS)", function() {
        var sageQuery = "Attribute 1 Attribute 2 Brand Name Sub Category Channel Net Sales (S2H + S2S + PuT + SFS) Ly Cancel $ LY Shipping Cost $ LY Net Sales (S2H + S2S + PuT + SFS)";
        var fileName = browser.params.saveAs + '37';
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
    it("Stress Perf Queries Test- Super Department for Super Department 'super_dept_nm_ 1' Attribute 3 for Start Date after 12/20/2005 Cancel Qty Auth $ Cancel $ LY Auth $", function() {
        var sageQuery = "Super Department for Super Department 'super_dept_nm_ 1' Attribute 3 for Start Date after 12/20/2005 Cancel Qty Auth $ Cancel $ LY Auth $";
        var fileName = browser.params.saveAs + '38';
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
    it("Stress Perf Queries Test- for Report Date after 12/20/2005 Sub Category Item Name Distributor Auth Qty Ly Cancel Qty Auth Amt Cust Net Sales (S2H + S2S + PuT + SFS)", function() {
        var sageQuery = "for Report Date after 12/20/2005 Sub Category Item Name Distributor Auth Qty Ly Cancel Qty Auth Amt Cust Net Sales (S2H + S2S + PuT + SFS)";
        var fileName = browser.params.saveAs + '39';
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
    it("Stress Perf Queries Test- Attribute 2 for Attribute 2 'attribute_value_2_ 4922' Category Brand Name Division Sub Category for Category contains '10' for Start Date between 12/14/2002 and 05/05/2007 Net Sales (S2H + S2S + PuT + SFS) Ly Return $ Return Qty LY Shipping Cost $", function() {
        var sageQuery = "Attribute 2 for Attribute 2 'attribute_value_2_ 4922' Category Brand Name Division Sub Category for Category contains '10' for Start Date between 12/14/2002 and 05/05/2007 Net Sales (S2H + S2S + PuT + SFS) Ly Return $ Return Qty LY Shipping Cost $";
        var fileName = browser.params.saveAs + '40';
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
    it("Stress Perf Queries Test- Super Department for Super Department 'super_dept_nm_ 10' Attribute 1 Brand Name Seller Name for Seller Name 'org_nm_ 62' for Start Date between 12/14/2002 and 05/05/2007 Sub Category for Sub Category begins with 'sub_categ_nm_ 4' Vendor Name Attribute 2 Ly Cancel Qty LY Auth Amt Cust Auth Amt Cust Return Qty", function() {
        var sageQuery = "Super Department for Super Department 'super_dept_nm_ 10' Attribute 1 Brand Name Seller Name for Seller Name 'org_nm_ 62' for Start Date between 12/14/2002 and 05/05/2007 Sub Category for Sub Category begins with 'sub_categ_nm_ 4' Vendor Name Attribute 2 Ly Cancel Qty LY Auth Amt Cust Auth Amt Cust Return Qty";
        var fileName = browser.params.saveAs + '41';
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
    it("Stress Perf Queries Test- Distributor Attribute 1 Brand Name for Brand Name 'brand_name_ 35987' Channel Ly Auth Qty LY Shipping Cost $ LY Net Corp Sales Return Qty", function() {
        var sageQuery = "Distributor Attribute 1 Brand Name for Brand Name 'brand_name_ 35987' Channel Ly Auth Qty LY Shipping Cost $ LY Net Corp Sales Return Qty";
        var fileName = browser.params.saveAs + '42';
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
    it("Stress Perf Queries Test- Super Department Attribute 2 Distributor for Distributor 'ship_node_name_ 2493' Division LY Net Corp Sales Return $ Net Sales (s2h + s2s) LY Shipping Cost $", function() {
        var sageQuery = "Super Department Attribute 2 Distributor for Distributor 'ship_node_name_ 2493' Division LY Net Corp Sales Return $ Net Sales (s2h + s2s) LY Shipping Cost $";
        var fileName = browser.params.saveAs + '43';
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
    it("Stress Perf Queries Test- Sub Category for Start Date between 12/14/2002 and 05/05/2007 Division Attribute 3 Attribute 1 End Date Department Item ID Distributor LY Shipping Revenue $ Cancel $ Auth Amt Cust LY Auth Amt Cust", function() {
        var sageQuery = "Sub Category for Start Date between 12/14/2002 and 05/05/2007 Division Attribute 3 Attribute 1 End Date Department Item ID Distributor LY Shipping Revenue $ Cancel $ Auth Amt Cust LY Auth Amt Cust";
        var fileName = browser.params.saveAs + '44';
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
    it("Stress Perf Queries Test- Attribute 1 Distributor Channel Category for Report Date after 12/20/2005 End Date LY Shipping Profit $ Return Qty Ly Return $ LY Auth $", function() {
        var sageQuery = "Attribute 1 Distributor Channel Category for Report Date after 12/20/2005 End Date LY Shipping Profit $ Return Qty Ly Return $ LY Auth $";
        var fileName = browser.params.saveAs + '45';
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
    it("Stress Perf Queries Test- Sub Category Brand Name Channel for Start Date before 06/06/2005 Attribute 1 Attribute 2 Vendor Name Attribute 3 Buyer Seller Name LY Shipping Profit $ Auth $ Auth Amt Cust Net Sales (S2H + S2S + PuT + SFS)", function() {
        var sageQuery = "Sub Category Brand Name Channel for Start Date before 06/06/2005 Attribute 1 Attribute 2 Vendor Name Attribute 3 Buyer Seller Name LY Shipping Profit $ Auth $ Auth Amt Cust Net Sales (S2H + S2S + PuT + SFS)";
        var fileName = browser.params.saveAs + '46';
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
    it("Stress Perf Queries Test- Attribute 2 Division for Division 'div_nm_ 1' for Report Date = 12/23/2005 Attribute 1 for Division 'div_nm_ 1' Brand Name for Brand Name contains '_ 4' Department for Department begins with 'dept_nm_ 3' Vendor Name Net Sales (S2H + S2S + PuT + SFS) Net Corp Sales Cancel $ Ly Cancel Qty", function() {
        var sageQuery = "Attribute 2 Division for Division 'div_nm_ 1' for Report Date = 12/23/2005 Attribute 1 for Division 'div_nm_ 1' Brand Name for Brand Name contains '_ 4' Department for Department begins with 'dept_nm_ 3' Vendor Name Net Sales (S2H + S2S + PuT + SFS) Net Corp Sales Cancel $ Ly Cancel Qty";
        var fileName = browser.params.saveAs + '47';
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
    it("Stress Perf Queries Test- End Date Item ID Attribute 1 Category for Category 'categ_nm_ 25' Distributor Sub Category for Sub Category ends with '8' Ly Return Qty Auth Qty Cancel $ LY Shipping Revenue $", function() {
        var sageQuery = "End Date Item ID Attribute 1 Category for Category 'categ_nm_ 25' Distributor Sub Category for Sub Category ends with '8' Ly Return Qty Auth Qty Cancel $ LY Shipping Revenue $";
        var fileName = browser.params.saveAs + '48';
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
    it("Stress Perf Queries Test- Super Department for Super Department 'super_dept_nm_ 7' Attribute 2 Attribute 1 for Attribute 1 contains '1_ 2' Attribute 3 Channel for Start Date = 12/23/2005 LY Shipping Cost $ Cancel Qty Return $ LY Net Sales (s2h + s2s)", function() {
        var sageQuery = "Super Department for Super Department 'super_dept_nm_ 7' Attribute 2 Attribute 1 for Attribute 1 contains '1_ 2' Attribute 3 Channel for Start Date = 12/23/2005 LY Shipping Cost $ Cancel Qty Return $ LY Net Sales (s2h + s2s)";
        var fileName = browser.params.saveAs + '49';
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
