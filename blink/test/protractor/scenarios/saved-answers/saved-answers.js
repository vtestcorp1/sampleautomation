/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Pavan Piratla (pavan@thoughtspot.com)
 */

'use strict';

var base = require('../../base-do-not-use.js');
var common = require('../common.js');
var answer = require('../viz-layout/answer/answer.js');
var table = require('../table/table.js')


function verifyHeadlines(headlines) {
    var retrievedHeadlines = element.all(answer.locators.HEADLINE);

    for (var i = 0 ;i < headlines.length; i++) {
        expect(retrievedHeadlines.get(i).element(
            answer.locators.HEADLINE_VALUE).getText()).toBe(headlines[i]);
    }
}

function verifyTableData(ownerGuid, tableValues) {
    base.goToSavedAnswers();
    base.openAnswerById(ownerGuid).then(function () {
        base.waitForLoaderOrError().then(function (error) {
            var slickCellContents = element.all(by.css('.slick-cell-content'));
            for (var i = 0; i < tableValues.length; i++) {
                expect(slickCellContents.get(i).getText()).toBe(tableValues[i]);
            }
        });
    });
}

function verifyTableView(ownerGuid, tableValues, headlineValues) {
    verifyTableData(ownerGuid, tableValues);
    verifyHeadlines(headlineValues);
}

function verifyChartView(ownerGuid, chartProperties) {
}

function verifySavedAnswer(ownerGuid, tableValues, headlineValues) {
    verifyTableView(ownerGuid, tableValues, headlineValues);
}

function verifyAnswerOpenable(ownerGuid, name) {
    base.openAnswerById(ownerGuid);
    return base.waitForLoaderOrError().then(function (error) {
        if (error) {
            base.expandError();
            base.takeScreenshot(
                name,
                'Screeenshot for answer "' + name + '" (' + ownerGuid + ')',
                error
            );
            return false;
        }
        return true;
    });
}

function verifyTableHeaders(ownerGuid, tableHeaders, tableSubHeaders) {
    base.goToSavedAnswers();
    base.openAnswerById(ownerGuid);
    return base.waitForLoaderOrError().then(function (error) {
        if (error) {
            return false;
        }
        table.verifyTableHeaders(tableHeaders);
        if (tableSubHeaders) {
            table.verifyTableSubHeaders(tableSubHeaders);
        }
        return true;
    });
}

module.exports = {
    verifyAnswerOpenable: verifyAnswerOpenable,
    verifyHeadlines: verifyHeadlines,
    verifySavedAnswer: verifySavedAnswer,
    verifyTableData: verifyTableData,
    verifyTableHeaders: verifyTableHeaders,
    verifyTableView: verifyTableView,
    verifyChartView: verifyChartView
};
