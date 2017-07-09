/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Naresh Kumar (naresh.kumar@thoughtspot.com)
 */
'use strict';

var answer = require('../viz-layout/answer/answer.js');
var charts = require('../charts/charts.js');
var common = require('../common.js');
var dataUI = require('../data-ui/data-ui.js');
var importWizard = require('../data-ui/import-wizard/import-wizard.js');
var pinboard = require('../pinboards/pinboards.js');

var XSS_ELEMENT = 'pwnitall';
var CSV_FILE_PATH = 'security/xss.csv';
var TABLE_NAME = 'xss';
var PINBOARD_NAME = 'xss';
var QUERY = 'fn<script>document.body.appendChild(document.createElement(\'pwnitall\'));</script> ip_address';

describe('Security', function () {
    beforeAll(function () {
        dataUI.goToDataUI();
        dataUI.goToImportData();
        importWizard.mockUploadFile(CSV_FILE_PATH);
        importWizard.setHeaderDefined(true);
        importWizard.clickNext();
        importWizard.clickNext();
        importWizard.clickImportButton();
    });

    afterAll(function () {
        importWizard.deleteMockCSV(TABLE_NAME);
    });

    afterEach(function () {
        expect($$(XSS_ELEMENT).count()).toBe(0);
        if ($$(XSS_ELEMENT).count() > 0) {
            $(XSS_ELEMENT).forEach(function (elem) { elem.remove(); });
        }
    });

    it('check xss in sage bar', function () {
        answer.doAdhocQuery(QUERY, ['xss'], charts.vizTypes.TABLE);
    });

    it('check xss in pinboard view', function() {
        answer.doAdhocQuery(QUERY, ['xss'], charts.vizTypes.TABLE);
        answer.addShowingVizToNewPinboard(PINBOARD_NAME);
        common.navigation.goToPinboardsSection();
        pinboard.openPinboard(PINBOARD_NAME);
        pinboard.deletePinboard(PINBOARD_NAME);
    });
    //TODO: add tests for tooltip views.
});
