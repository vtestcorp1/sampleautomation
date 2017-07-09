/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */
var common = require('../../common.js');
var dataUI = require('../data-ui');
var uiSelect = require('../../libs/ui-select');
var util = common.util;
var nav = common.navigation;

module.exports = (function () {

    var selectors = {
        ADD_RELATIONSHIP_BTN: '.bk-add-mode-btn',
        DATA_EXPLORER_TAB: '.bk-explorer .mode-select .mode-item',
        RELATIONSHIP_HEADER: '.bk-relationship-header',
        RELATIONSHIP_UPDATE_BTN: '.bk-update-relationship-btn',
        RELATIONSHIP_DELETE_BTN: '.bk-delete-relationship-btn',
        RELATIONSHIP_EDITOR: '.bk-relationship-editor',
        RELATIONSHIP_VIEWER: '.bk-relationship-viewer',
        SOURCE_COLUMN_CELL: '.bk-source .bk-column-cell',
        DESTINATION_COLUMN_CELL: '.bk-target .bk-column-cell',
        DESTINATION_TABLE: '.bk-select-destination-table',
        SOURCE_COLUMN: '.bk-column-relationships .bk-select-source-column',
        TARGET_COLUMN: '.bk-column-relationships .bk-target'
    };

    selectors.ADD_KEY_BUTTON_SELECTOR = util.joinSelectors(selectors.RELATIONSHIP_EDITOR,
        '.buttons .bk-add-key-button');
    selectors.ADD_RELATIONSHIP_BUTTON_SELECTOR = util.joinSelectors(selectors.RELATIONSHIP_EDITOR,
        '.buttons .bk-add-relationship-button');
    selectors.CANCEL_BTN_SELECTOR = util.joinSelectors(selectors.RELATIONSHIP_EDITOR, '.bk-cancel-relationship-edits');

    var locators = {
        RELATIONSHIP_TAB: by.cssContainingText(selectors.DATA_EXPLORER_TAB, 'Relationships')
    };

    function editRelationShip(relationShipName, newName, newDescription, shouldCheckIfRelationWasUpdated) {
        var selector = selectors.RELATIONSHIP_VIEWER + ' input[name="' + relationShipName + '"]';
        $(selector).click();
        $('.bk-relationship-header input').clear();
        $('.bk-relationship-header input').sendKeys(newName);
        $('.bk-relationship-header textarea').sendKeys(newDescription);
        $(selectors.RELATIONSHIP_UPDATE_BTN).click();

        if (shouldCheckIfRelationWasUpdated) {
            selector = selectors.RELATIONSHIP_VIEWER + ' input[name="' + newName + '"]';
            expect($$(selector).count()).toBe(1);
        }
    }

    function createAndCheckRelationShip(sourceTable, targetTable, sourceColumns, targetColumns, check, clickAddButton,
                                        sourceCount, targetCount) {

        if (!sourceCount) {
            sourceCount = 1;
        }
        if (!targetCount) {
            targetCount = 1;
        }
        nav.goToUserDataSection();
        dataUI.goToTableByName(sourceTable);
        dataUI.goToRelationshipView();

        if (clickAddButton) {
            $(selectors.ADD_RELATIONSHIP_BTN).click();
        }
        sourceColumns.forEach(function(sourceColumn, index){
            var targetColumn = targetColumns[index];
            uiSelect.changeSelection($(selectors.DESTINATION_TABLE), targetTable);
            uiSelect.changeSelection($(selectors.SOURCE_COLUMN), sourceColumn);
            uiSelect.changeSelection($(selectors.TARGET_COLUMN), targetColumn);
            util.waitForAndClick(selectors.ADD_KEY_BUTTON_SELECTOR);
        });

        util.waitForAndClick(selectors.ADD_RELATIONSHIP_BUTTON_SELECTOR);

        util.waitForElement(selectors.RELATIONSHIP_VIEWER);
        if (check) {
            sourceColumns.forEach(function(sourceColumn, index) {
                var targetColumn = targetColumns[index];
                expect(element.all(by.cssContainingText(selectors.SOURCE_COLUMN_CELL, sourceColumn)).count()).toBe(sourceCount);
                expect(element.all(by.cssContainingText(selectors.DESTINATION_COLUMN_CELL, targetColumn)).count()).toBe(targetCount);
            });
        }
    }

    function deleteRelationship(sourceColumn) {
        var parentElement = element(by.cssContainingText(selectors.RELATIONSHIP_VIEWER, sourceColumn));
        util.waitForAndClick(parentElement.element(by.css(selectors.RELATIONSHIP_DELETE_BTN)));
    }

    function checkUIState(numberOfEditor, numberOfViewer) {
        util.waitForElementCountToBe($$(selectors.RELATIONSHIP_EDITOR), numberOfEditor);
        util.waitForElementCountToBe($$(selectors.RELATIONSHIP_VIEWER), numberOfViewer);
    }

    return {
        checkUIState: checkUIState,
        createRelationship: createAndCheckRelationShip,
        editRelationship: editRelationShip,
        deleteRelationship: deleteRelationship,
        locators: locators,
        selectors: selectors
    };
})();
