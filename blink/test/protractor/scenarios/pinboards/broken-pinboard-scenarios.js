/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Tests for broken pinboards.
 */
'use strict';

var pinboards = require('./pinboards.js');
var common = require('../common.js');

describe('Broken Pinboard', function () {
    it('Should show dropdown menu for broken tiles', function () {
        common.navigation.goToPinboardsSection();
        pinboards.openPinboard('Broken Pinboard 2');
       
        pinboards.openVizDropdownMenu();

         
    });
});
