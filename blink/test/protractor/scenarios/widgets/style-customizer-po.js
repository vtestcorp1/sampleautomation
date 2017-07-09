/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var adminUI = require('../admin-ui/admin-ui.js');
var fontSelector = require('./font-selector-po.js');
var fontEditor = require('./font-editor-po.js');
var multiSectionList = require('./multi-section-list-po.js');

var selectors = {
    APP_LOGO_SECTION: '.bk-style-customizer-app-logo-section',
    WIDE_APP_LOGO_SECTION: '.bk-style-customizer-wide-app-logo-section',
    NAV_LOGO: '.bk-primary-nav-home-logo',
    WIDE_APP_LOGO: '.bk-login .bk-logo-big',
    CHART_FONT_SECTION: '.bk-style-customizer-chart-font-section',
    CHART_FONT_SELECTOR: '.bk-style-customizer-chart-font-selector',
    TABLE_FONT_SECTION: '.bk-style-customizer-table-font-section',
    TABLE_FONT_SELECTOR: '.bk-style-customizer-table-font-selector',
    APP_BACKGROUND_SECTION: '.bk-style-customizer-app-background-section',
    APP_BACKGROUND_COLOR_SELECTOR: '.bk-style-customizer-app-background-color-configurator',
    CHART_COLOR_SECTION: '.bk-style-customizer-chart-color-section',
    CHART_COLOR_COLOR_PALETTE_LIST_EDITOR: '.bk-style-customizer-chart-color-palette-list-editor',
    FOOTER_SECTION: '.bk-style-customizer-footer-section',
    POWERED_FOOTER_TEXT: '.bk-footer-text',
    PAGE_TITLE_SECTION: '.bk-style-page-title-section'
};

var locators = {
    APP_LOGO_SECTION: by.css(selectors.APP_LOGO_SECTION),
    WIDE_APP_LOGO_SECTION: by.css(selectors.WIDE_APP_LOGO_SECTION),
    NAV_LOGO: by.css(selectors.NAV_LOGO),
    WIDE_APP_LOGO: by.css(selectors.WIDE_APP_LOGO),
    CHART_FONT_SECTION: by.css(selectors.CHART_FONT_SECTION),
    CHART_FONT_MULTI_SELECTOR: by.css(
        common.util.joinSelectors(
            selectors.CHART_FONT_SECTION,
            selectors.CHART_FONT_SELECTOR
        )
    ),
    TABLE_FONT_SECTION: by.css(selectors.TABLE_FONT_SECTION),
    TABLE_FONT_MULTI_SELECTOR: by.css(
        common.util.joinSelectors(
            selectors.TABLE_FONT_SECTION,
            selectors.TABLE_FONT_SELECTOR
        )
    ),
    APP_BACKGROUND_SECTION: by.css(selectors.APP_BACKGROUND_SECTION),
    APP_BACKGROUND_COLOR_SELECTOR: by.css(
        common.util.joinSelectors(
            selectors.APP_BACKGROUND_SECTION,
            selectors.APP_BACKGROUND_COLOR_SELECTOR
        )
    ),
    CHART_COLOR_SECTION: by.css(selectors.CHART_COLOR_SECTION),
    CHART_COLOR_COLOR_PALETTE_LIST_EDITOR: by.css(
        common.util.joinSelectors(
            selectors.CHART_COLOR_SECTION,
            selectors.CHART_COLOR_COLOR_PALETTE_LIST_EDITOR
        )
    ),
    FOOTER_SECTION: by.css(selectors.FOOTER_SECTION),
    POWERED_FOOTER_TEXT: by.css(selectors.POWERED_FOOTER_TEXT),
    PAGE_TITLE_SECTION: by.css(selectors.PAGE_TITLE_SECTION)
};

function goToStyleCustomizer() {
    common.navigation.goToAdminSection();
    adminUI.goToStyleCustomizer();
}

function uploadFont(fontFilePath, fontName, fontColor, fontWeight, fontStyle) {
    element(locators.CHART_FONT_MULTI_SELECTOR)
        .element(fontSelector.locators.FONT_CREATE_BUTTON)
        .click();

    fontEditor.uploadFontFile(fontFilePath);
    fontEditor.setFontName(fontName);
    fontEditor.setFontColor(fontColor);
    fontEditor.setFontWeight(fontWeight);
    fontEditor.setFontStyle(fontStyle);
    fontEditor.saveFont();
}

function resetStyleConfig(rootElement) {
    multiSectionList.triggerItemAction(rootElement);
}

function resetAllCustomStyleConfig() {
    var sections = [
        locators.APP_LOGO_SECTION,
        locators.WIDE_APP_LOGO_SECTION,
        locators.CHART_FONT_SECTION,
        locators.TABLE_FONT_SECTION,
        locators.APP_BACKGROUND_SECTION,
        locators.CHART_COLOR_SECTION,
        locators.FOOTER_SECTION,
        locators.PAGE_TITLE_SECTION
    ];

    sections.forEach(function(sectionLocator){
        resetStyleConfig(
            element(sectionLocator)
        );
    });
}

module.exports = {
    locators: locators,
    goToStyleCustomizer: goToStyleCustomizer,
    uploadFont: uploadFont,
    resetStyleConfig: resetStyleConfig,
    resetAllCustomStyleConfig: resetAllCustomStyleConfig
};
