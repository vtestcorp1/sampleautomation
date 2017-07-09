/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview E2E tests for info card.
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var common = require('../common');
var leftPanel = require('../sage/data-panel/data-panel');
var infoCard = require('./info-card');
var sage = require('../sage/sage');
var bootstrapLib = require('../libs/bootstrap-lib');
var tooltip = bootstrapLib.tooltip;

describe('Info card scenarios', function () {
    beforeAll(function() {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
        leftPanel.openAndChooseSources(['LINEORDER', 'PART','PRODUCTS', 'PURCHASES', 'SALES']);
        leftPanel.clickDone();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    afterAll(function() {
        leftPanel.deselectAllSources();
    });

    it('[SMOKE] should show an info card', function () {
        answerPage.queryAndWaitForAnswer('revenue');
        infoCard.waitForInfoCardButton(true);
        infoCard.waitForInfoCard(false);
        infoCard.toggleInfoCard();
        infoCard.waitForInfoCard(true);
        infoCard.toggleInfoCard();
        infoCard.waitForInfoCard(false);
    });

    it('[SMOKE] should update info card information', function () {
        answerPage.queryAndWaitForAnswer('tax');
        infoCard.toggleInfoCard();
        infoCard.waitForInfoCardContainingText('Tax');

        answerPage.queryAndWaitForAnswer('tax customer region');
        infoCard.waitForInfoCardContainingText('Tax');
        infoCard.waitForInfoCardContainingText('Customer Region');
        infoCard.waitForOutputColumnContainingText('Tax');
        infoCard.waitForGroupingColumnContainingText('Customer Region');
        infoCard.toggleInfoCard();
    });

    it('should show tooltip on mouse enter over a column name', function () {
        answerPage.queryAndWaitForAnswer('tax');
        infoCard.toggleInfoCard();
        infoCard.waitForOutputColumnContainingText('Tax');

        common.util.mouseMoveToElement(infoCard.selectors.NATURAL_QUERY_OUTPUT_COLUMN);
        tooltip.waitForToolTipContainingText('LINEORDER');
        infoCard.toggleInfoCard();
        infoCard.waitForInfoCard(false);
    });

    it('should not show info card button when empty sage', function () {
        infoCard.waitForInfoCardButton(false);
    });

    it('should remove info card button when sage has input but no complete query', function() {
        sage.sageInputElement.enter('revenu'); // Notice `revenu` missing `e`
        infoCard.waitForInfoCardButton(false);
    });

    it('should remove info card button after incomplete query entered', function() {
        answerPage.queryAndWaitForAnswer('revenue');
        infoCard.waitForInfoCardButton(true);
        sage.sageInputElement.enter('revenu'); // Notice `revenu` missing `e`
        infoCard.waitForInfoCardButton(false);
    });
});
