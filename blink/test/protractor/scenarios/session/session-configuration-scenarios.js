/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com) Vibhor Nanavati (vibhor@thoughtspot.com)
 */

'use strict';

var common = require('../common.js');
var browserUtil = require('../browser-utils');
var util = common.util;
var nav = common.navigation;
var sage = require('../sage/sage');
var dataPanel = require('../sage/data-panel/data-panel');
var headline = require('../viz-layout/headline/headline');

/* eslint no-undef: 0 */
describe('Global session configuration', function () {
    // SCAL-13879: Tracking the failure in sage which returned monthly bucketization here.
    it('[SMOKE][IE] should honor server specified timezone', function () {
        browserUtil.transformer.addSuccessResponseTransformer(function (responseData) {
            if (responseData.config && responseData.config.url && responseData.data &&
                responseData.config.url.indexOf('/session/') >= 0) {
                responseData.data.timezone = 'Pacific/Honolulu';
            }
            return responseData;
        });
        util.reLogin();
        nav.goToQuestionSection();
        dataPanel.deselectAllSources();
        dataPanel.openAndChooseSources(['LINEORDER']);
        sage.sageInputElement.enter('order date detailed sort by order date');
        headline.waitForHeadline('Order Date');
        // With the default timezone, we would expect 01/04/1992 as the first date but with
        // Honolulu timezone (3 hours behind), we move a day behind.
        headline.verifyHeadlineValue('01/03/1992');
        browserUtil.transformer.resetResponseTransformers();
    });
});
