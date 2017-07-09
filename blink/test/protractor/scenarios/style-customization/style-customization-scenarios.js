/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

var path = require('path');
var util = require('util');
var answerPage = require('../viz-layout/answer/answer.js');

var common = require('../common.js');
var sage = require('../sage/sage');
var answer = require('../viz-layout/answer/answer.js');
var leftPanel = require('../sage/data-panel/data-panel');
var charts = require('../charts/charts.js');
var blobUploader = require('../widgets/blob-uploader-po.js');
var multiFontSelector = require('../widgets/multi-font-selector-po.js');
var styleCustomizer = require('../widgets/style-customizer-po.js');
var colorConfigurator = require('../widgets/color-configurator-po.js');
var colorPaletteEditor = require('../widgets/color-palette-editor-po.js');
var colorPaletteListEditor = require('../widgets/color-palette-list-editor-po.js');
var textBoxConfigurator = require('../widgets/text-box-configurator-po.js');

var Constants = {
    FONT_NAME: 'E2E Font Name',
    FONT_NAME2: 'E2E Font Name 2',
    // use alpha = 1 to avoid floating point comparison issues
    FONT_COLOR: 'rgba(101, 199, 127, 1)',
    FONT_WEIGHT_BOLD: 'Bold',
    FONT_STYLE_ITALIC: 'Italic',
    FONT_FILE_NAME: 'Lato-Black.woff',
    FONT_FILE_NAME2: 'Lato-Bold.woff',
    APP_BACKGROUND_COLOR: 'rgba(101, 200, 244, 1)',
    CHART_COLOR_PALETTE_COLORS: ['rgba(102,210,211,0.5)'],

    ChartDefaults: {
        FONT_NAME: "RetinaMP-Book, Semibold, 'Lucida Grande', sans-serif",
        FONT_COLOR: 'rgba(19, 19, 19, 1)',
        FONT_WEIGHT: 'normal',
        FONT_STYLE: 'normal',
        COLUMN_COLOR: 'rgb(255,119,51)'
    },
    AppBackgroundDefaults: {
        COLOR: 'rgba(238, 241, 244, 1)',
        EMBEDDING_URL: '/embed/viz/e36ee65e-64be-436b-a29a-22d8998c4fae/'
    },
    FOOTER_VALUE: 'Sample footer text',
    PAGE_TITLE: 'Title',
    Flags: {
        ENABLE_STYLE_CUSTOMIZATION: 'customBrandingEnabled',
        ENABLE_FONT_CUSTOMIZATION: 'customBrandingFontCustomizationEnabled'
    }
};

function getImagePath() {
    return path.resolve(__dirname, '../resources/image.jpg');
}

function getFontPath(fileName) {
    return path.resolve(__dirname, util.format('../resources/%s', fileName));
}

function verifyFontFamily(fontFamilyValuePromise, targetValue) {
    var parsedFontFamilyPromise = fontFamilyValuePromise
        .then(
            function (fontFamily) {
                return common.util.parseFontFamily(fontFamily);
            }
        );

    expect(parsedFontFamilyPromise).toEqual(
        common.util.parseFontFamily(targetValue)
    );
}

function verifyChartXAxisLabelFont(fontName, fontColor, fontWeight, fontStyle) {
    common.navigation.goToQuestionSection();
    leftPanel.selectAllTables();
    sage.sageInputElement.enter('revenue color');
    answerPage.waitForAnswerToLoad();
    answer.navigateAndWaitForChartType(charts.chartTypes.COLUMN);

    var xAxisLabel = charts.getXAxisLabels().first();

    verifyFontFamily(
        xAxisLabel.getCssValue('font-family'),
        fontName
    );

    common.util.expectCaseInsensitiveEquals(
        xAxisLabel.getCssValue('color'),
        fontColor
    );
    common.util.expectCaseInsensitiveEquals(
        xAxisLabel.getCssValue('font-weight'),
        fontWeight
    );
    common.util.expectCaseInsensitiveEquals(
        xAxisLabel.getCssValue('font-style'),
        fontStyle
    );
}

function verifyChartColumnFillColor(expectedFillColor) {
    common.navigation.goToQuestionSection();
    leftPanel.selectAllTables();
    sage.sageInputElement.enter('revenue color');
    answerPage.waitForAnswerToLoad();

    var barColorPromise = charts.getChartColumnFillColor(
        element(charts.locators.CHART_VIZ),
        0
    );
    common.util.expectCaseInsensitiveEquals(
        barColorPromise,
        expectedFillColor
    );
}

function getEmbeddedPageBackgroundColor() {
    common.util.waitForElement(common.navigation.locators.EMBEDDED_APP_PAGE);
    return element(common.navigation.locators.EMBEDDED_APP_PAGE)
        .getCssValue('background-color');
}

function getPoweredFooterTextValue() {
    return element(styleCustomizer.locators.POWERED_FOOTER_TEXT).getText();
}

function getPageTitle() {
    common.util.waitForElement(by.tagName('title'));
    return browser.getTitle();
}

describe('Style Customization', function(){

    beforeAll(function(){
        common.navigation.addUrlParameter(Constants.Flags.ENABLE_STYLE_CUSTOMIZATION, true);
        common.navigation.addUrlParameter('successAlertHidingDelay', 5000);
    });

    afterAll(function(){
        common.navigation.removeUrlParameter(Constants.Flags.ENABLE_STYLE_CUSTOMIZATION);
    });

    beforeEach(function(){
        common.navigation.addUrlParameter(Constants.Flags.ENABLE_FONT_CUSTOMIZATION, true);
        styleCustomizer.goToStyleCustomizer();
        common.util.dismissNotificationIfPresent();
        styleCustomizer.resetAllCustomStyleConfig();
        common.util.expectAndDismissSuccessNotif();
    });

    afterEach(function(){
        styleCustomizer.goToStyleCustomizer();
        styleCustomizer.resetAllCustomStyleConfig();
        common.navigation.removeUrlParameter(Constants.Flags.ENABLE_FONT_CUSTOMIZATION);
    });

    it('[SMOKE][IE] should allow changing the app default logo', function(){
        var filePath = getImagePath();

        blobUploader.uploadAndVerifySampleImageFile(
            element(styleCustomizer.locators.APP_LOGO_SECTION),
            filePath
        );

        var backgroundUrlPromise = element(styleCustomizer.locators.NAV_LOGO)
            .getCssValue('background-image')
            .then(
                function(backgroundImage){
                    return backgroundImage.match(/url\("(.+?)"\)/)[1];
                }
            );
        common.util.verifyRemoteFileSameAsLocal(backgroundUrlPromise, filePath);
    });

    it('[SMOKE] should update favicon when app default logo is changed', function() {
        var filePath = getImagePath();

        blobUploader.uploadAndVerifySampleImageFile(
            element(styleCustomizer.locators.APP_LOGO_SECTION),
            filePath
        );

        browser.refresh();
        common.util.waitForElement(by.tagName('link[rel*="icon"]'));
        var faviconUrl = element(by.tagName('link[rel*="icon"]')).getAttribute('href');
        common.util.verifyRemoteFileSameAsLocal(faviconUrl, filePath);
    });

    it('should allow changing the wide app logo', function(){
        var filePath = getImagePath();

        blobUploader.uploadAndVerifySampleImageFile(
            element(styleCustomizer.locators.WIDE_APP_LOGO_SECTION),
            getImagePath()
        );

        common.util.logout();

        var backgroundUrlPromise =
            element(styleCustomizer.locators.WIDE_APP_LOGO)
                .getCssValue('background-image')
                .then(
                function(backgroundImage){
                    return backgroundImage.match(/url\("(.+?)"\)/)[1];
                }
            );
        common.util.verifyRemoteFileSameAsLocal(backgroundUrlPromise, filePath);
        common.util.login();
    });

    it('should allow adding a new font', function(){
        styleCustomizer.uploadFont(
            getFontPath(Constants.FONT_FILE_NAME),
            Constants.FONT_NAME,
            Constants.FONT_COLOR,
            Constants.FONT_WEIGHT_BOLD,
            Constants.FONT_STYLE_ITALIC
        );
        common.util.expectAndDismissSuccessNotif();
        var fontFamilyPromise = multiFontSelector.getSelectedFontProperty(
            element(styleCustomizer.locators.CHART_FONT_MULTI_SELECTOR),
            'font-family'
        );
        verifyFontFamily(
            fontFamilyPromise,
            Constants.FONT_NAME
        );
    });

    it('should allow setting and re-setting X Axis label font', function(){
        styleCustomizer.uploadFont(
            getFontPath(Constants.FONT_FILE_NAME2),
            Constants.FONT_NAME2,
            Constants.FONT_COLOR,
            Constants.FONT_WEIGHT_BOLD,
            Constants.FONT_STYLE_ITALIC
        );
        common.util.expectAndDismissSuccessNotif();
        verifyChartXAxisLabelFont(
            Constants.FONT_NAME2,
            Constants.FONT_COLOR,
            Constants.FONT_WEIGHT_BOLD,
            Constants.FONT_STYLE_ITALIC
        );

        styleCustomizer.goToStyleCustomizer();
        styleCustomizer.resetStyleConfig(
            element(styleCustomizer.locators.CHART_FONT_SECTION)
        );
        common.util.expectAndDismissSuccessNotif();

        verifyChartXAxisLabelFont(
            Constants.ChartDefaults.FONT_NAME,
            Constants.ChartDefaults.FONT_COLOR,
            Constants.ChartDefaults.FONT_WEIGHT,
            Constants.ChartDefaults.FONT_STYLE
        );
    });

    it('[SMOKE] should allow setting and re-setting application background color', function(){
        colorConfigurator.setColor(
            element(styleCustomizer.locators.APP_BACKGROUND_COLOR_SELECTOR),
            Constants.APP_BACKGROUND_COLOR
        );
        common.util.expectAndDismissSuccessNotif();
        common.navigation.goToInAppPath(Constants.AppBackgroundDefaults.EMBEDDING_URL);
        expect(
            getEmbeddedPageBackgroundColor()
        ).toBe(Constants.APP_BACKGROUND_COLOR);

        common.navigation.goToInAppPath('');
        styleCustomizer.goToStyleCustomizer();

        styleCustomizer.resetStyleConfig(
            element(styleCustomizer.locators.APP_BACKGROUND_SECTION)
        );
        common.util.expectAndDismissSuccessNotif();

        common.navigation.goToInAppPath(Constants.AppBackgroundDefaults.EMBEDDING_URL);
        expect(
            getEmbeddedPageBackgroundColor()
        ).toBe(Constants.AppBackgroundDefaults.COLOR);

        common.navigation.goToInAppPath('');
        styleCustomizer.goToStyleCustomizer();
    });

    xit('should allow changing chart color palette colors', function(){
        var firstColorPaletteEditorElement =
            element(styleCustomizer.locators.CHART_COLOR_SECTION)
                .element(styleCustomizer.locators.CHART_COLOR_COLOR_PALETTE_LIST_EDITOR)
                .all(colorPaletteListEditor.locators.COLOR_PALETTE_EDITOR)
                .first();

        colorPaletteEditor.setFirstNColors(
            firstColorPaletteEditorElement,
            Constants.CHART_COLOR_PALETTE_COLORS
        );

        verifyChartColumnFillColor(
            Constants.CHART_COLOR_PALETTE_COLORS[0]
        );

        styleCustomizer.goToStyleCustomizer();

        styleCustomizer.resetStyleConfig(
            element(styleCustomizer.locators.CHART_COLOR_SECTION)
        );

        verifyChartColumnFillColor(
            Constants.ChartDefaults.COLUMN_COLOR
        );
    });

    it('[SMOKE] should allow setting and re-setting footer text', function () {
        textBoxConfigurator.setInputFieldValue(
            element(styleCustomizer.locators.FOOTER_SECTION),
            Constants.FOOTER_VALUE
        );
        common.util.expectAndDismissSuccessNotif();
        expect(getPoweredFooterTextValue()).toBe(Constants.FOOTER_VALUE);
    });

    it('[SMOKE] should allow setting and re-setting page title', function () {
        styleCustomizer.resetStyleConfig(
            element(styleCustomizer.locators.PAGE_TITLE_SECTION)
        );
        textBoxConfigurator.setInputFieldValue(
            element(styleCustomizer.locators.PAGE_TITLE_SECTION),
            Constants.PAGE_TITLE
        );
        common.util.expectAndDismissSuccessNotif();
        browser.refresh();
        expect(getPageTitle()).toBe(Constants.PAGE_TITLE);
    });
});
