/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Francois chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios verifying the behaviour
 * of the sources preview component
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var answerListPage = require('./answer-list-page');
var bootstrap = require('../libs/bootstrap-lib');
var common = require('../common');
var dataSourcesPreview = require('../data-source-preview/data-source-preview');
var leftPanel = require('../sage/data-panel/data-panel');
var sage = require('../sage/sage.js');
var table = require('../table/table');

describe('Source Preview Component, search page', function () {

    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });
    afterAll(function() {
        dataSourcesPreview.discardIfNeeded();
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
        answerPage.clearVizDisplayPreference();
    });

    it('[SMOKE][IE] should show correct table names in sources preview', function () {
        leftPanel.closePanel();
        dataSourcesPreview.hoverOnDataSourcePreview();
        bootstrap.tooltip.waitForToolTipContainingText('Lineorder, Part, Products, Purchases, Sales');
        dataSourcesPreview.clickDataSourcePreview();
    });

    it('should show correct table names, even after querying with only one table', function(){
        leftPanel.closePanel();
        sage.sageInputElement.enter('Revenue');
        answerPage.waitForAnswerToLoad();
        dataSourcesPreview.hoverOnDataSourcePreview();
        bootstrap.tooltip.waitForToolTipContainingText('Lineorder, Part, Products, Purchases, Sales');
        dataSourcesPreview.clickDataSourcePreview();

    });
    it('for a loaded answer, should show table name in sources preview', function () {
        answerListPage.goToSavedAnswer('Average Revenue by Part');
        leftPanel.closePanel();
        dataSourcesPreview.hoverOnDataSourcePreview();
        bootstrap.tooltip.waitForToolTipContainingText('Date', 'Lineorder', 'Part', 'Supplier');
        dataSourcesPreview.clickDataSourcePreview();
    });

    it('o-of-scope, sources selected, after querying one source, should show 1 source', function() {
        leftPanel.deselectAllSources();
        leftPanel.closePanel();
        sage.sageInputElement.enter('Part name');
        answerPage.waitForAnswerToLoad();
        dataSourcesPreview.checkNumberOfSources(1);
        common.navigation.goToHome();
        common.navigation.goToQuestionSection();
        leftPanel.closePanel();
        dataSourcesPreview.checkNumberOfSources(0);
        dataSourcesPreview.clickDataSourcePreview();
    });

    it('o-of-scope, 2 sources selected, after querying one source, should show 3 sources', function() {
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['CUSTOMER', 'DATE']);
        leftPanel.closePanel();
        sage.sageInputElement.enter('brand1');
        answerPage.waitForAnswerToLoad();
        dataSourcesPreview.checkNumberOfSources(3);

        common.navigation.goToHome();
        common.navigation.goToQuestionSection();
        leftPanel.closePanel();
        dataSourcesPreview.checkNumberOfSources(2);
        dataSourcesPreview.clickDataSourcePreview();
    });

    it('sources should go back to 0 after deselecting all sources', function() {
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.closePanel();
        dataSourcesPreview.checkNumberOfSources(5);
        dataSourcesPreview.clickDataSourcePreview();
        leftPanel.deselectAllSources();
        leftPanel.closePanel();
        dataSourcesPreview.checkNumberOfSources(0);
        dataSourcesPreview.clickDataSourcePreview();
    });
});
