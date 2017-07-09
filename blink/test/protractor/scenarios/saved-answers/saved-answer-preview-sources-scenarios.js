/**
 * Copyright: ThoughtSpot Inc. 2015-16
 * Author: Francois chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios verifying the behaviour
 * of the sources preview component
 */

'use strict';

var answerPage = require('../viz-layout/answer/answer');
var answerListPage = require('../answers/answer-list-page');
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
        answerPage.clearVizDisplayPreference();
    });

    beforeEach(function () {
        common.navigation.goToQuestionSection();
    });

    afterAll(function () {
        common.navigation.goToQuestionSection();
        leftPanel.deselectAllSources();
    });

    it('should show correct table names in sources preview', function () {
        answerListPage.goToSavedAnswer('Brand Revenue');
        answerPage.waitForAnswerToLoad();
        leftPanel.closePanel();
        dataSourcesPreview.hoverOnDataSourcePreview();
        bootstrap.tooltip.waitForToolTipContainingText('Lineorder, Part, Supplier');
    });
});
