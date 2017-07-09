/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 * Author: Lucky Odisetti (lucky@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var sage = require('../sage/sage.js');
var table = require('./table.js');
var dataPanel = require('../sage/data-panel/data-panel.js');
var answer = require('../viz-layout/answer/answer.js');

describe('Table & Formula scenarios', function() {

    it('should not prepend aggregation name for a aggregated formula', function () {
        common.navigation.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.selectSource('Formula Worksheet');
        dataPanel.clickDone();
        sage.sageInputElement.fastEnter('count(custkey)');
        common.util.waitForElement(table.locators.TABLE_GRID);
        common.util.waitForTextToBePresentInElement(
            element.all(table.locators.COLUMN_HEADER).first(), "count(custkey)");
    });

    xit('Should persist user updated column sizes', function () {

        answer.doAdhocQuery('commit date supply cost ', ['LINEORDER']);
        var elem = $$(table.selectors.SLICK_COLUMN).get(0);
        var initialSize = elem.getSize();
        var COL_SIZE_INCREMENT = 100;

        var updatedSize = browser.executeScript(table.resizeColumn, COL_SIZE_INCREMENT)
            .then(function() {
                return $$(sage.selectors.SAGE_INPUT).sendKeys(' ship mode ')
                    .then(function(){
                        return elem.getSize();
                    });
            });

        Promise.all([initialSize, updatedSize]).then(function(sizes) {
            var widthBeforeResize = sizes[0].width;
            var widthAfterResize = sizes[1].width;
            expect(widthAfterResize).toBe(widthBeforeResize + COL_SIZE_INCREMENT);
        });
    });
});
