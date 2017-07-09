/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Archit Bansal (archit.bansal@thoughtspot.com)
 *         Rahul Paliwal (rahul@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var util = common.util;

module.exports = (function () {

    var selectors = {
        SAGE_FEEDBACK_RATING_CHOICE: '.bk-dialog .bk-sage-feedback-dialog .bk-dialog-field .bk-select-box .ui-select-choices-row',
        SAGE_INPUT: '.bk-sage-real-input',
        SAGE_INPUT_GHOST: '.bk-sage .bk-sage-real-input-ghost',
        SAGE_GHOST_INPUT : '.bk-sage-real-input-ghost',
        BOXED_TOKEN: '.bk-boxed-token',
        AUTOCOMPLETE_DDOWN: '.bk-sage .bk-dropdown-wrapper',
        OUT_OF_SCOPE_DD: '.out-of-scope',
        SAGE_DROPDOWN_LIST_HEADER: '.bk-sage .bk-dropdown-wrapper .bk-dropdown-list-header',
        SAGE_DROPDOWN_ITEM: '.bk-sage .bk-dropdown-wrapper .bk-dropdown-list li .item-text',
        SAGE_DROPDOWN_ITEM_LINEAGE: '.bk-sage .bk-dropdown-wrapper .bk-dropdown-list li .item-text .lineage',
        SAGE_DROPDOWN_ITEM_MATCHED: '.bk-sage .bk-dropdown-wrapper .bk-dropdown-list li .item-text .matched-substring',
        SAGE_SUGGESTION_ITEM: '.bk-sage .bk-dropdown-wrapper .bk-dropdown-list li .item-text.search-result',
        SAGE_QUERY_FRAGMENT: '.bk-sage .bk-boxed-token-layer .bk-boxed-token',
        SAGE_QUERY_FRAGMENT_COMPLETE: '.bk-sage .bk-boxed-token-layer .bk-boxed-token:not(.bk-qf-incomplete-phrase)',
        SAGE_QUERY_FRAGMENT_INCOMPLETE: '.bk-sage .bk-boxed-token-layer .bk-boxed-token.bk-qf-incomplete-phrase',
        SAGE_ICON: '.bk-sage .bk-sage-search-icon',
        SAGE_ERROR_ICON: '.bk-sage .bk-sage-search-icon.bk-error-exists',
        SAGE_WARNING_ICON: '.bk-sage .bk-sage-search-icon.bk-warning-exists',
        SAGE_ERROR_BUBBLE: '.bk-sage-bubble.bk-error',
        SAGE_GHOST_TOKEN: '.bk-sage-ghost-token'
    };

    selectors.EDITABLE_SAGE = util.joinSelectors('.bk-sage .bk-sage-bar', 'input' + selectors.SAGE_INPUT);
    selectors.READ_ONLY_SAGE = '.bk-sage.bk-read-only-sage .bk-sage-bar div.bk-sage-real-input';
    selectors.DELETE_TOKEN_BTN = util.joinSelectors(selectors.BOXED_TOKEN, '.bk-cross-btn');
    selectors.AUTOCOMPLETE_DDOWN_HEADER = util.joinSelectors(selectors.AUTOCOMPLETE_DDOWN, '.header-text');
    selectors.SAGE_ERROR_GHOST_TOKEN = selectors.SAGE_GHOST_TOKEN + '.bk-error';
    selectors.SAGE_UNRECOGNIZED_GHOST_TOKEN = selectors.SAGE_GHOST_TOKEN + '.bk-unrecognized';

    var locators = {
        AUTOCOMPLETE_DDOWN: by.css(selectors.AUTOCOMPLETE_DDOWN),
        SAGE_FEEDBACK_ITEM: by.css(common.util.lastChild('.bk-dropdown-wrapper .bk-dropdown-list-wrapper') + ' ul li'),
        SAGE_FEEDBACK_ITEM_LABEL: by.css(common.util.lastChild('.bk-dropdown-wrapper .bk-dropdown-list-wrapper') + ' ul li .item-text'),
        SAGE_FEEDBACK_DIALOG: by.css('.bk-dialog .bk-sage-feedback-dialog'),
        SAGE_FEEDBACK_SELECT_BOX: by.css('.bk-dialog .bk-sage-feedback-dialog .bk-dialog-field .bk-select-box'),
        SAGE_FEEDBACK_SELECT_A_RATING: by.css('.bk-dialog .bk-sage-feedback-dialog .bk-dialog-field .bk-select-box .ui-select-match'),
        SAGE_INPUT: by.css('input.bk-sage-real-input'),
        NO_CONTENT: by.css('.bk-empty-page-placeholder'),
        ANSWER_LINK: by.css('.bk-primary-nav-search'),
        SAGE: by.css('.bk-sage'),
        DELETE_TOKEN_BTN: by.css('.bk-boxed-token .bk-cross-btn'),
        VIZ_COLUMNS_HEADERS_NAMES: by.css('.ui-state-default .slick-header-column .slick-column-name'),
        SAGE_SUGGESTION_ITEM: by.css(selectors.SAGE_SUGGESTION_ITEM),
        SAGE_DROPDOWN_ITEM_LINEAGE: by.css(selectors.SAGE_DROPDOWN_ITEM_LINEAGE),
        SAGE_QUERY_FRAGMENT: by.css(selectors.SAGE_QUERY_FRAGMENT),
        AUTOCOMPLETE_ERROR_HEADER: by.cssContainingText(selectors.AUTOCOMPLETE_DDOWN_HEADER, 'Did you mean'),
        MULTIPLE_MATCHES_HEADER: by.cssContainingText(selectors.SAGE_DROPDOWN_LIST_HEADER, 'Multiple matches.')
    };

    var outOfScopeMessage = {
        NO_SOURCES : 'No sources selected',
        OUT_OF_SCOPE: 'No suggestions from the selected sources'
    };

    var sageInputElement = {
        getCurrentInput: function() {
            var sageInput = element(locators.SAGE_INPUT);
            return sageInput.getText();
        },
        enter: function (query) {
            util.waitForElement(locators.SAGE_INPUT);
            var sageInput = element(locators.SAGE_INPUT);
            return sageInput.clear().then(function () {
                return util.waitForElement(locators.NO_CONTENT).then(function () {
                    return sageInput.sendKeys(query);
                });
            });
        },
        append: function (suffix) {
            util.waitForElement(locators.SAGE_INPUT);
            util.ensureCursorAtEnd(locators.SAGE_INPUT);
            var sageInput = element(locators.SAGE_INPUT);
            return sageInput.sendKeys(suffix);
        },
        click: function () {
            element(locators.ANSWER_LINK).click();
            return browser.wait(util.waitForElement(locators.SAGE));
        },
        // Sets @query as text in Sage bar and moves focus out of the Sage bar.
        // NOTE: sendKeys on an element is too slow to be used in perf tests.
        // Hence, we inject code into to the browser itself to simulate a user
        // copypasting queries into the Sage bar.
        fastEnter: function(query) {
            var cmd = '$("' + selectors.SAGE_INPUT + '")' +
                    '.val("' + query + '")' +
                    '.trigger("click")' +
                    '.trigger("change")' +
                    '.blur()';
            return browser.executeScript(cmd);
        },
        blur: function() {
            var cmd = '$("' + selectors.SAGE_INPUT + '")' +
                '.blur()';
            return browser.executeScript(cmd);
        },
        // Appends @s as text into Sage bar and doesn't move focus out of the
        // Sage bar.
        // sendKeys on an element is too slow to be used in perf tests.  Hence,
        // we inject code into to the browser itself to simulate a user
        // appending @suffix at the end of the sage bar.
        // TODO(satyam): This currently returns single token completion.  Fix
        // this to return query completions by moving the caret at the end of
        // input box.
        fastAppend: function(s) {
            var cmd = 'var sage = $("' + selectors.SAGE_INPUT + '")' +
                    '.val(function(i, curr) { return curr + "' + s + '"; })' +
                    '.trigger("click")' +
                    '.trigger("change");';
            return browser.executeScript(cmd);
        },
        setCaretAtPosition: function (position) {
            return browser.executeScript(function (args) {
                var rawInputElement = args.elem;
                var caretPosition = args.position;

                if (rawInputElement.createTextRange) {
                    var range = rawInputElement.createTextRange();
                    range.move('character', caretPosition);
                    range.select();
                    return;
                } else if (rawInputElement.selectionStart) {
                    rawInputElement.focus();
                    rawInputElement.setSelectionRange(caretPosition, caretPosition);
                    return;
                }

                // If can not obtain caret api by above methods, simply focus.
                rawInputElement.focus();
            }, {
                elem: element(locators.SAGE_INPUT).getWebElement(),
                position: position
            });
        },
        waitForValueToBe: function(val) {
            return util.waitForValueToBe(selectors.SAGE_INPUT, val);
        },
        hideDropdown: function () {
            clickOnSageIcon();
            return util.waitForInvisibilityOf(locators.AUTOCOMPLETE_DDOWN);
        },
        deleteFirstToken: function() {
            util.waitForElement(locators.DELETE_TOKEN_BTN);
            return element.all(locators.DELETE_TOKEN_BTN).first().click();
        },
        deleteLastToken: function() {
            util.waitForElement(locators.DELETE_TOKEN_BTN);
            return element.all(locators.DELETE_TOKEN_BTN).last().click();
        },
        deleteToken: function(tokenIndex) {
            util.waitForElement(locators.DELETE_TOKEN_BTN);
            return element.all(locators.DELETE_TOKEN_BTN).get(tokenIndex).click();
        }
    };

    function getDropdownElements(selector, textToMatch, lineage, highlightedText) {
        var suggestionElement =
            element.all(by.cssContainingText(selector, textToMatch));
        if (!!lineage) {
            suggestionElement = element
                .all(by.cssContainingText(selector, textToMatch))
                .filter(function (suggestionElem) {
                    return suggestionElem.element(by.cssContainingText(
                        selectors.SAGE_DROPDOWN_ITEM_LINEAGE, lineage))
                        .isPresent();
                });
        }
        if (!!highlightedText) {
            suggestionElement = element
                .all(by.cssContainingText(selector, textToMatch))
                .filter(function (suggestionElem) {
                    return suggestionElem.element(by.cssContainingText(
                        selectors.SAGE_DROPDOWN_ITEM_MATCHED, highlightedText))
                        .isPresent();
                });
        }
        return suggestionElement;
    }

    function getFirstDropdownElement(selector, textToMatch, lineage, highlightedText) {
        return getDropdownElements(selector, textToMatch, lineage, highlightedText).first();
    }

    // Sage Dropdown API
    function waitForSageDropdown() {
        return util.waitForElement(selectors.SAGE_DROPDOWN_ITEM);
    }

    function waitForSageDropdownErrorSection() {
        util.waitForElement(locators.AUTOCOMPLETE_ERROR_HEADER);
    }

    function waitForSageDropdownAmbiguitySection() {
        util.waitForElement(locators.MULTIPLE_MATCHES_HEADER);
    }

    // Sage Dropdown Items API
    function countSageDropdownItem(textToMatch, lineage) {
        var dropdownElements = getDropdownElements(
            selectors.SAGE_DROPDOWN_ITEM, textToMatch, lineage);
        return dropdownElements.count()
    }

    function waitForSageDropdownItem(textToMatch, lineage, highlight) {
        var dropdownElement = getFirstDropdownElement(
            selectors.SAGE_DROPDOWN_ITEM, textToMatch, lineage, highlight);
        util.waitForElement(dropdownElement);
    }

    function waitForSageDropdownCountToBe(count) {
        var selector = by.css(selectors.SAGE_DROPDOWN_ITEM);
        util.waitForElementCountToBe(selector, count);
    }

    function selectSageDropdownItem(textToMatch, lineage, highlight) {
        var dropdownElement = getFirstDropdownElement(
            selectors.SAGE_DROPDOWN_ITEM, textToMatch, lineage, highlight);
        util.waitForAndClick(dropdownElement);
    }

    function waitForDropdownItemCountContainingTextToBe(textToMatch, count) {
        var dropdownElements = getDropdownElements(selectors.SAGE_DROPDOWN_ITEM, textToMatch);
        util.waitForElementCountToBe(dropdownElements, count);
    }

    function waitForSageDropdownWithLineageCountToBe(count) {
        util.waitForElementCountToBe(selectors.SAGE_DROPDOWN_ITEM_LINEAGE, count);
    }

    function waitForSageDropdownWithMatchedCountToBe(count, optionalTimeout) {
        return util.waitForElementCountToBe(selectors.SAGE_DROPDOWN_ITEM_MATCHED, count, optionalTimeout);
    }

    // Sage Suggestion Items API
    function waitForSageSuggestionItem(suggestion, lineage, highlight) {
        var suggestionElement = getFirstDropdownElement(
            selectors.SAGE_SUGGESTION_ITEM, suggestion, lineage, highlight);
        util.waitForElement(suggestionElement);
    }

    function waitForSageSuggestionCountToBe(count) {
        var selector = by.css(selectors.SAGE_SUGGESTION_ITEM);
        util.waitForElementCountToBe(selector, count);
    }

    function selectSageSuggestionItem(suggestion, lineage, highlight) {
        var suggestionElement = getFirstDropdownElement(
            selectors.SAGE_SUGGESTION_ITEM, suggestion, lineage, highlight);
        util.waitForAndClick(suggestionElement);
    }

    // Phrase API
    function hoverOverPhrase(index) {
        util.mouseMoveToElement($$(selectors.BOXED_TOKEN).get(index));
    }

    function waitForPhraseContainingText(text) {
        util.waitForElement(by.cssContainingText(selectors.SAGE_QUERY_FRAGMENT, text));
    }

    function waitForPhraseCountToBe(count) {
        util.waitForElementCountToBe(selectors.SAGE_QUERY_FRAGMENT, count);
    }

    function clickPhraseContainingText(text) {
        util.waitForAndClick(by.cssContainingText(selectors.SAGE_QUERY_FRAGMENT, text));
    }

    function waitForCompletePhraseContainingText(text) {
        util.waitForElement(by.cssContainingText(selectors.SAGE_QUERY_FRAGMENT_COMPLETE, text));
    }

    function waitForCompletePhraseCountToBe(count) {
        util.waitForElementCountToBe(selectors.SAGE_QUERY_FRAGMENT_COMPLETE, count);
    }

    function waitForIncompletePhraseContainingText(text) {
        util.waitForElement(by.cssContainingText(selectors.SAGE_QUERY_FRAGMENT_INCOMPLETE, text));
    }

    function waitForIncompletePhraseCountToBe(count) {
        util.waitForElementCountToBe(selectors.SAGE_QUERY_FRAGMENT_INCOMPLETE, count);
    }

    // Ghost API
    function waitForGhostTextToMatch(toMatch) {
        util.waitForValueToMatch(selectors.SAGE_INPUT_GHOST, toMatch);
    }

    function waitForGhostTextToBePresent() {
        util.waitForValueToMatch(selectors.SAGE_INPUT_GHOST, new RegExp('.+'));
    }

    function waitForGhostTextToBeAbsent() {
        util.waitForValueToBe(selectors.SAGE_INPUT_GHOST, '');
    }

    function waitForSageGhostToMatch(ghostPattern) {
        util.waitForValueToMatch(selectors.SAGE_GHOST_INPUT, ghostPattern);
    }

    // Error Notifications API
    function waitForErrorIcon() {
        util.waitForElement(selectors.SAGE_ERROR_ICON);
    }

    function waitForWarningIcon() {
        util.waitForElement(selectors.SAGE_WARNING_ICON);
    }

    function waitForInvisibilityOfErrorBubble() {
        util.waitForInvisibilityOf(selectors.SAGE_ERROR_BUBBLE);
    }

    function waitForErrorBubble() {
        util.waitForVisibilityOf(selectors.SAGE_ERROR_BUBBLE);
    }

    function clickOnSageIcon() {
        util.waitForAndClick(selectors.SAGE_ICON);
    }

    // Token API
    function waitForUnrecognizedTokenInSageBar() {
        util.waitForVisibilityOf(selectors.SAGE_UNRECOGNIZED_GHOST_TOKEN);
    }

    function waitForOutOfScopeMessage(message) {
        util.waitForTextToBePresentInElement(selectors.OUT_OF_SCOPE_DD, message);
    }


    return {
        selectors,
        locators,
        sageInputElement,
        outOfScopeMessage,

        // Sage Dropdown API
        waitForSageDropdown,
        waitForSageDropdownErrorSection,
        waitForSageDropdownAmbiguitySection,

        // Sage Dropdown Items API
        countSageDropdownItem,
        waitForSageDropdownItem,
        waitForSageDropdownCountToBe,
        selectSageDropdownItem,
        waitForDropdownItemCountContainingTextToBe,
        waitForSageDropdownWithLineageCountToBe,
        waitForSageDropdownWithMatchedCountToBe,

        // Sage Suggestion Items API
        waitForSageSuggestionItem,
        waitForSageSuggestionCountToBe,
        selectSageSuggestionItem,

        // Phrase API
        hoverOverPhrase,
        waitForPhraseContainingText,
        waitForPhraseCountToBe,
        clickPhraseContainingText,
        waitForCompletePhraseContainingText,
        waitForCompletePhraseCountToBe,
        waitForIncompletePhraseContainingText,
        waitForIncompletePhraseCountToBe,

        // Ghost API
        waitForGhostTextToMatch,
        waitForGhostTextToBePresent,
        waitForGhostTextToBeAbsent,
        waitForSageGhostToMatch,
        waitForOutOfScopeMessage,

        // Error Notifications API
        waitForErrorIcon,
        waitForWarningIcon,
        waitForInvisibilityOfErrorBubble,
        waitForErrorBubble,
        clickOnSageIcon,

        // Token API
        waitForUnrecognizedTokenInSageBar
    };
}());
