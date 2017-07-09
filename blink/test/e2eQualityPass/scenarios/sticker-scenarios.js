/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shawn Zhang, Shitong Shou(shitong@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for sticker scenarios
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Labels / Stickers', function () {
    it('should be able to add and delete a sticker', function() {
        var labelName = '[QA Pass Sticker]';
        answersTab().click();
        addLabel(labelName);
        verifyLabelExists(labelName);
        deleteLabel(labelName);
        verifyLabelDoesNotExist(labelName);
    });

    it('should be able to edit a sticker by changing its name', function() {
        var labelName = '[QA Pass Sticker]';
        var newLabelName = '[QA Pass New]';
        answersTab().click();
        addLabel(labelName);

        verifyLabelExists(labelName);
        setLabelNameTo(labelName, newLabelName);
        verifyLabelDoesNotExist(labelName);
        verifyLabelExists(newLabelName);
        pinboardsTab().click();
        verifyLabelExists(newLabelName);
        deleteLabel(newLabelName);
    });

});
