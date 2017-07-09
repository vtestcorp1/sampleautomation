/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Pradeep Dorairaj (pradeep.dorairaj@thoughtspot.com)
 * Francois Chabbey francois.chabbey@thoughtspot.com
 *
 * @fileoverview E2E scenarios for scheduler
 */

'use strict';
var blinkList = require('../list/blink-list.js');
var common = require('../common.js');
var chosen = require('../libs/chosen');
var dialog = require('../dialog.js');
var scheduler = require('../share/scheduler-ui.js');
var nav = common.navigation;
var util = common.util;

var IMPORT_DATA_SOURCE_PATH = '#data/impds';
var DEFAULT_DATA_SOURCE = 'Default';

var ids = ['#everynminid', '#hourlyid', '#dailyid', '#weeklyid','#monthlyid'],
    values = ['Every N Minutes', 'Hourly', 'Daily', 'Weekly','Monthly'];

var selectors = scheduler.selectors;

describe('Scheduler UI', function () {

    afterEach(function(){
        nav.goToHome();
    });

    it('should show the right div elements based on frequency option chosen', function () {
        nav.goToInAppPath(IMPORT_DATA_SOURCE_PATH);
        blinkList.selectItemByName('', DEFAULT_DATA_SOURCE);
        $(selectors.OPEN_SCHEDULE).click();

        values.forEach(function(value, idx){
            chosen.changeSelection($(util.joinSelectors(selectors.DIALOG, selectors.REPEATS)), value);
            util.waitForElementCountToBe(ids[idx], 1);
        });

        dialog.clickSecondaryButton();
    });
});
