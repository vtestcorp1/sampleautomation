/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Maxim Leonovich (maksim.leonovich@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var answerPage = require('../../scenarios/viz-layout/answer/answer.js');
var benchmark = require('./../benchmark.js');
var charts = require('../../scenarios/charts/charts.js');
var checkboxFilter = require('../../scenarios/filters/checkbox-filter');
var common = require('../../scenarios/common.js');
var contextMenu = require('../../scenarios/context-menu/context-menu-po');
var dataset = browser.params.dataset.pinboardScenarios;
var dialog = require('../../scenarios/dialog');
var drillDown = require('../../scenarios/context-menu/drill/drill-po');
var filterPanel = require('../../scenarios/filters/filter-panel');
var filterDialog = require('../../scenarios/filters/filter-dialog');
var leftPanel = require('../../scenarios/sage/data-panel/data-panel');
var pinboards = require('../../scenarios/pinboards/pinboards.js');
var sage = require('../../scenarios/sage/sage');
var slideShow = require('../../scenarios/slide-show/slide-show.js');
var table = require('../../scenarios/table/table');
var util = common.util;
var navigation = common.navigation;

var suite = benchmark.suite('load-pinboard');

dataset.loadPinboard.forEach(function (input) {
    var pinboard = input.pinboard;
    suite.register(pinboard.name)
        // TODO(Rahul): Adding a reload app step to avert impact on test
        // measurements due to memory bloats from previous tests.
        .beforeAll(common.navigation.reloadApp)
        .afterAll(common.navigation.reloadApp)
        .withBounds(input.bounds)
        .before(function() {
            return navigation.goToPinboardsSection();
        })
        .then(function() {
            pinboards.openPinboard(pinboard.name);
            return pinboards.waitForLoaded();
        });
});

suite.report();


var suite = benchmark.suite('open-pinboard-viz');

dataset.openViz.forEach(function (config) {
    suite.register(config.pinboard.name)
        .withBounds(config.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(config.pinboard.name);
            return pinboards.waitForLoaded();
        })
        .then(function () {
            var pinboardElement = pinboards.getVizElementByName(config.viz);
            pinboards.openVizEditor(pinboardElement);
            answerPage.waitForAnswerToLoad();
            pinboards.closeVizEditor();
            return pinboards.waitForLoaded();
        });
});

suite.report();


var suite = benchmark.suite('edit-pinboard-viz');

dataset.editViz.forEach(function (config) {
    var copyPinboardName = '(Test Copy)-' + config.pinboard.name;
    copyPinboardName = util.appendRandomNumber(copyPinboardName);
    suite.register(config.pinboard.name)
        // (TODO(Rahul)) It is observed (for dogfood scenarios), that
        // edit-pinboard-viz tests were not getting completed due to
        // app sluggishness. To counter that, and to make sure that
        // the tests run, we are reloading the app before and
        // after this suite. We need to fix memory leaks to get rid
        // of these.
        .beforeAll(common.navigation.reloadApp)
        .afterAll(common.navigation.reloadApp)
        .withBounds(config.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(config.pinboard.name);
            pinboards.waitForLoaded();
            pinboards.makeCopy(copyPinboardName);
            // After a copy, we navigate away to the pinboard list page because
            // waitForLoaded will otherwise succeed before the copy
            // document is even loaded.
            navigation.goToPinboardsSection();
            pinboards.openPinboard(copyPinboardName);
            pinboards.waitForLoaded();
            var pinboardElement = pinboards.getVizElementByName(config.viz);
            pinboards.openVizEditor(pinboardElement);
            answerPage.waitForAnswerToLoad();
            return answerPage.removeFirstTokenAndWaitForLoad();
        })
        .then(function () {
            pinboards.closeVizEditorWithSave();
            return pinboards.waitForLoaded();
        })
        .after(function () {
            return pinboards.deletePinboard(copyPinboardName);
        });
});

suite.report();


var suite = benchmark.suite('add-pinboard-filter');

dataset.addFilter.forEach(function (config) {
    var testPinboardName = config.pinboard.name + '-test-copy';
    testPinboardName = util.appendRandomNumber(testPinboardName);
    suite.register(config.pinboard.name)
        .withBounds(config.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(config.pinboard.name);
            pinboards.waitForLoaded();
            return pinboards.makeCopy(testPinboardName);
        })
        .then(function () {
            pinboards.openFilterPanel();
            leftPanel.waitForEnabledSource(config.filter.source);
            leftPanel.expandSource(config.filter.source);
            leftPanel.openFilter(config.filter.column);
            return checkboxFilter.toggleCheckboxState(config.filter.value);
        })
        .sthen("add-filter", function () {
            filterDialog.clickDone();
            util.waitForElementCountToBe(filterPanel.selectors.FILTER_PANEL_ITEM_SELECTOR, 1);
            return pinboards.waitForLoaded();
        })
        .after(function () {
            return pinboards.deletePinboard(testPinboardName);
        })
});

suite.report();


var suite = benchmark.suite('add-viz-to-pinboard');

dataset.addViz.forEach(function (config) {
    var testPinboardName = config.pinboard.name + '-test-copy';
    testPinboardName = util.appendRandomNumber(testPinboardName);
    suite.register(config.pinboard.name)
        .withBounds(config.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(config.pinboard.name);
            pinboards.waitForLoaded();
            pinboards.makeCopy(testPinboardName);
            navigation.goToQuestionSection();
            leftPanel.deselectAllSources();
            leftPanel.openAndChooseSources(config.query.sources);
            leftPanel.clickDone();
            util.waitForElement(sage.locators.SAGE_INPUT);
            sage.sageInputElement.fastEnter(config.query.text);
            return answerPage.waitForAnswerToLoad();
        })
        .then(function () {
            return answerPage.addShowingVizToPinboard(testPinboardName);
        })
        .after(function () {
            return pinboards.deletePinboard(testPinboardName);
        })
});

suite.report();


var suite = benchmark.suite('copy-pinboard');

dataset.makeCopy.forEach(function (input) {
    var pinboard = input.pinboard;
    var testPinboardName = pinboard.name + '-test-copy';
    testPinboardName = util.appendRandomNumber(testPinboardName);
    suite.register(pinboard.name)
        // (TODO: Rahul): Enable after bound error investigation.
        // .withBounds(input.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(pinboard.name);
            pinboards.waitForLoaded();
        })
        .then(function () {
            return pinboards.makeCopy(testPinboardName);
        })
        .after(function () {
            return pinboards.deletePinboard(testPinboardName);
        })
});

suite.report();


var suite = benchmark.suite('open-slide-show');

dataset.slideShow.forEach(function (input) {
    var pinboard = input.pinboard;
    suite.register(pinboard.name)
        .withBounds(input.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(pinboard.name);
            return pinboards.waitForLoaded();
        })
        .then(function () {
            pinboards.startSlideShow(pinboards.getVizElementAtIndex(0));
            return slideShow.waitForVizInSlideShow();
        })
        .after(function () {
            return slideShow.closeSlideShow();
        })
});

suite.report();


var suite = benchmark.suite('share-pinboard');
dataset.sharePinboard.forEach(function (config) {
    var testPinboardName = config.pinboard.name + '-test-copy';
    testPinboardName = util.appendRandomNumber(testPinboardName);
    suite.register(config.pinboard.name)
        .withBounds(config.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(config.pinboard.name);
            pinboards.waitForLoaded();
            pinboards.makeCopy(testPinboardName);
            return navigation.goToPinboardsSection();
        })
        .then(function () {
            return pinboards.sharePinboard(
                testPinboardName, config.principals, true /* read only */);
        })
        .after(function () {
            return pinboards.deletePinboard(testPinboardName);
        })
});
suite.report();


var suite = benchmark.suite('switch-pinboard');
// Switch pinboards on pinboard page.
dataset.switchPinboard.forEach(function (pair) {
    suite.register(pair.from.name + ' -> ' + pair.to.name)
        .beforeAll(common.navigation.reloadApp)
        .afterAll(common.navigation.reloadApp)
        // (TODO: Rahul): Enable after bound error investigation.
        // .withBounds(pair.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(pair.from.name);
            return pinboards.waitForLoaded();
        })
        .then(function () {
            pinboards.switchToPinboard(pair.to.name);
            return pinboards.waitForLoaded();
        })
});
suite.report();


var suite = benchmark.suite('transfrom-pinboard');
dataset.transformViz.forEach(function (config) {
    var vizElem;
    suite.register(config.pinboard.name)
        .withBounds(config.bounds)
        .before(function() {
            navigation.goToPinboardsSection();
            pinboards.openPinboard(config.pinboard.name);
            pinboards.waitForLoaded();
            vizElem = pinboards.getVizElementByName(config.viz.name);
            return pinboards.startSlideShow(vizElem);
        })
        .sthen('show-underlying-data', function () {
            var firstColumnElem = charts.getColumnRectangles(vizElem).get(0);
            common.util.rightClickElement(firstColumnElem);
            common.util.waitForAndClick(contextMenu.locators.UNDERLYING_DATA_OPTION);
            common.util.waitForElement(table.selectors.LEAF_LEVEL_DATA_CONTAINER);
            return dialog.closeDialog();
        })
        .sthen('drilldown', function () {
            var firstColumnElem = charts.getColumnRectangles(vizElem).get(0);
            common.util.rightClickElement(firstColumnElem);
            common.util.waitForAndClick(contextMenu.locators.DRILL_DOWN);
            drillDown.typeTextInSearch(config.viz.column);
            drillDown.selectDrillItem(config.viz.column);
            common.util.waitForElement(pinboards.selectors.RESET_TRANSFORMS);
            common.util.waitForAndClick(pinboards.selectors.RESET_TRANSFORMS);
            return common.util.waitForElementCountToBe(pinboards.selectors.RESET_TRANSFORMS, 0);
        })
        .sthen('sort', function () {
            charts.columnLabelMenu.openForYAxis();
            charts.columnLabelMenu.clickSort();
            common.util.waitForElement(pinboards.selectors.RESET_TRANSFORMS);
            return common.util.waitForAndClick(pinboards.selectors.RESET_TRANSFORMS);
        })
        .after(function () {
            return slideShow.closeSlideShow();
        })
});
suite.report();


var suite = benchmark.suite('scroll-pinboard');
dataset.scrollPinboard.forEach(function (config, i) {
    var testPinboardName = "scroll-perf-pinboard";
    testPinboardName = util.appendRandomNumber(testPinboardName);
    suite.register('scroll-pinboard-' + i)
        .before(function () {
            navigation.goToQuestionSection();
            leftPanel.deselectAllSources();
            leftPanel.openAndChooseSources(config.sources);
            leftPanel.clickDone();
            util.waitForElement(sage.locators.SAGE_INPUT);
            sage.sageInputElement.fastEnter(config.text);
            answerPage.waitForAnswerToLoad();
            answerPage.addShowingVizToNewPinboard(testPinboardName);
            for (var count = 0; count < config.vizCount - 1; ++count) {
                answerPage.addShowingVizToPinboard(testPinboardName);
            }
            return navigation.goToPinboardsSection();
        })
        .then(function () {
            pinboards.openPinboard(testPinboardName);
            var firstviz = pinboards.getVizElementAtIndex(0);
            var lastViz = pinboards.getVizElementAtIndex(config.vizCount - 1);
            // scroll pinboard
            util.scrollElementIntoViewPort(lastViz);
            util.scrollElementIntoViewPort(firstviz);
            util.scrollElementIntoViewPort(lastViz);
            return util.scrollElementIntoViewPort(firstviz);
        })
        .after(function () {
            return pinboards.deletePinboard(testPinboardName);
        })
});
suite.report();
