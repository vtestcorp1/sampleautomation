/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * Utility for schema-viewer tests
 *
 * The strategy for testing a vertex is to click first on
 * the navigation list of the left panel, so we move the viewport
 * to the table coordinate. The table is then available in the diagram
 * model. We then can retrieve the table coordinate and use these coordinates
 * for testing color, click/dbl-click event...
 *
 * Note that protractor returns promise event when we execute 'raw' javascript,
 * so we need to use promise chaining if we want to preserve the order of
 * executions of these 'raw' scripts
 *
 */



'use strict';

var common = require('../common.js');
var action = require('../actions-button.js');

var selectors = {
    CLOSE_MODAL: '.bk-big-popup .bk-close',
    DATA_TYPE: '.data-type',
    DEFAULT_CANVAS: '.graph-container canvas',
    LIST_ITEMS: '.schema-navigation-row',
    LEGEND: '.chart-legend',
    MODAL_WINDOW: '.bk-big-popup',
    SEARCH_INPUT: '.sidebar .bk-search-input',
    SIDEBAR_HEADER: '.sidebar .header',
    SCHEMA_CANVAS: '.graph-body > canvas',
    SCHEMA_VIEWER_CONTAINER: '.graph-container'
};

// RGB-indexed array
var objectColors = {
    TABLE: [['F5'], ['A6'], ['23']],
    TARGET_COLUMN: [['FF'], ['CC'], ['CC']],
    WORKSHEET: [['B3'], ['7E'], ['F5']]
};

selectors.MODAL_LIST_INPUT = selectors.MODAL_WINDOW + ' ' + selectors.LIST_ITEMS;
selectors.MODAL_LIST_ITEMS =  selectors.MODAL_WINDOW + ' ' + selectors.LIST_ITEMS;
selectors.MODAL_SCHEMA_CANVAS =  selectors.MODAL_WINDOW + ' ' + selectors.SCHEMA_CANVAS;
selectors.MODAL_SEARCH_INPUT = selectors.MODAL_WINDOW + ' ' + selectors.SEARCH_INPUT;
selectors.LIST_ITEMS_SELECTED = selectors.LIST_ITEMS + '.bk-selected';

function _moveViewPortToTableOrigin(tableName) {
    var diagram = blink.app.exposedObjectsForTests.diagram;
    var nodesCollection = diagram.nodes;
    var targetedNode;

    while (nodesCollection.next()) {
        var node = nodesCollection.value;

        if (node.data.tableName  === tableName) {
            targetedNode = node;
        }
    }

    //Note(chab) This is the only way i found to make the test pass everytime
    if (targetedNode) {
        targetedNode.position = new go.Rect(0,0,400,400);
        diagram.position = new go.Point(0,0);
    }
}

function moveViewPortToTableOrigin(tableName) {
    return browser.driver.executeScript(_moveViewPortToTableOrigin, tableName);
}


function _fetchColorAtCoordinate(x,y, cssSelector) {
    var canvasContext = $(cssSelector)[0].getContext('2d');
    var data = canvasContext.getImageData(x, y, 1, 1);
    return data.data;
}

function fetchColorAtCoordinate(x, y, cssSelector) {
    if (!cssSelector) {
        cssSelector = selectors.DEFAULT_CANVAS;
    }
    return browser.driver.executeScript(_fetchColorAtCoordinate, x, y, cssSelector);
}

function checkForColorAtCoordinate(x, y, cssSelector, expectedColor) {
    fetchColorAtCoordinate(x, y, cssSelector).then(function(color){
        var red =   color[0],
            green = color[1],
            blue =  color[2];
        expect(red).toBe(parseInt(expectedColor[0], 16));
        expect(green).toBe(parseInt(expectedColor[1], 16));
        expect(blue).toBe(parseInt(expectedColor[2], 16));
    });
}



function bringTableIntoViewPort(tableName, moveToOrigin) {
    if (!moveToOrigin) {
        return element(common.util.contains(selectors.LIST_ITEMS, tableName)).click();
    } else {
        element(common.util.contains(selectors.LIST_ITEMS, tableName)).click();
        return moveViewPortToTableOrigin(tableName);
    }
}

function clickOnCoordinate(x, y, cssSelector) {

    if (!cssSelector) {
        cssSelector = selectors.DEFAULT_CANVAS;
    }

    var offset = {
        x: x,
        y: y
    };

    browser.actions()
        .mouseMove(element(by.css(cssSelector)), offset)
        .click().perform();
}

function doubleClickOnCoordinate(x, y, cssSelector) {
    var offset = {
        x: x,
        y: y
    };

    if (!cssSelector) {
        cssSelector = selectors.DEFAULT_CANVAS;
    }

    browser.actions()
        .mouseMove(element(by.css(cssSelector)), offset)
        .doubleClick().perform();
}

function _getTableCoordinate(tableName, viewPortCoordinate) {
    var diagram = blink.app.exposedObjectsForTests.diagram;
    var nodesCollection = diagram.nodes;
    var targetedNode;

    while (nodesCollection.next()) {
        var node = nodesCollection.value;

        if (node.data.tableName === tableName) {
            targetedNode = node;
        }
    }

    if (!targetedNode) {
        return;
    }

    if (targetedNode.position.x === 0 && targetedNode.position.y === 0 ) {
        return {
            x: 0,
            y: 0
        };
    }

    if (viewPortCoordinate) {
        return diagram.transformDocToView(targetedNode.position);
    } else {
        return targetedNode.position;
    }

}

function getTableCoordinate(tableName, viewPortCoordinate) {
    return browser.driver.executeScript(_getTableCoordinate, tableName, viewPortCoordinate);

}

function dragAndDropObject(startX, startY, endX, endY) {
    //TODO(chab)
}

function forceScale() {
    return browser.driver.executeScript(function() {
        blink.app.exposedObjectsForTests.diagram.scale = 1;
    });
}

function clickOnTable(tableName) {
    return getTableCoordinate(tableName, true).then(function(coordinate){
        var x = coordinate.x;
        var y = coordinate.y;
        return clickOnCoordinate(x, y);
    });
}
function goToSchemaViewer() {
    common.navigation.goToUserDataSection();
    action.selectActionButtonAction(action.actionLabels.VIEW_SCHEMA);
    common.util.waitForElement(selectors.SCHEMA_VIEWER_CONTAINER);
    common.util.waitForInvisibilityOf(common.util.selectors.LOADING_INDICATOR_OVERLAY);
}

module.exports = {
    bringTableIntoViewPort: bringTableIntoViewPort,
    checkForColorAtCoordinate: checkForColorAtCoordinate,
    clickOnCoordinate: clickOnCoordinate,
    clickOnTable: clickOnTable,
    doubleClickOnCoordinate: doubleClickOnCoordinate,
    dragAndDropObject: dragAndDropObject,
    fetchColorAtCoordinate: fetchColorAtCoordinate,
    forceScale: forceScale,
    getTableCoordinate: getTableCoordinate,
    goToSchemaViewer: goToSchemaViewer,
    moveViewPortToTableOrigin: moveViewPortToTableOrigin,
    objectColors: objectColors,
    selectors: selectors
};
