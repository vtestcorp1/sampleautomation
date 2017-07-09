/**
 * Copyright: ThoughtSpot Inc. 2013-2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios involving sage autocomplete cases.
 */

'use strict';

var common = require('../common');
var leftPanel = require('./data-panel/data-panel');
var sage = require('./sage');

var util = common.util;
var nav = common.navigation;

describe('Sage auto insertion and error highlighting cases', function () {

    beforeAll(function(){
        nav.goToQuestionSection();
        leftPanel.openChooseSourcesDialog();
        leftPanel.deselectAllSources();
        leftPanel.selectSource('LINEORDER');
    });

    beforeEach(function(){
        nav.goToQuestionSection();
    });

    it('should send empty token to sage so that "reve " gets an error bubble', function () {
        sage.sageInputElement.enter('reve ');
        sage.waitForSageDropdownErrorSection();
        sage.waitForSageDropdownItem('revenue', 'Lineorder');
    });

    it('should mark an invalid date prefix', function () {
        sage.sageInputElement.enter('order date before 1a');
        sage.waitForSageDropdownErrorSection();
    });

    it('should underline any invalid token', function () {
        sage.sageInputElement.enter('foobar');
        sage.sageInputElement.blur();
        sage.sageInputElement.hideDropdown();
        sage.waitForUnrecognizedTokenInSageBar();
    });

    it('should insert "and" in the ghost input when "between" is typed', function () {
        sage.sageInputElement.enter('order date between');
        sage.sageInputElement.append(protractor.Key.SPACE);
        sage.waitForSageGhostToMatch(/and /);
    });

    it('should display date mask days ago for "order date after 14"', function () {
        sage.sageInputElement.enter('order date after 14');
        sage.sageInputElement.append(protractor.Key.SPACE);
        sage.waitForSageGhostToMatch(/days ago/);
    });

    it('should display date mask dd/yyyy for "order date after 12/"', function () {
        sage.sageInputElement.enter('order date after 12/');
        sage.waitForSageGhostToMatch(/dd\/yyyy/);
    });

    it('[SMOKE] should insert a space in the sage input when a recognized token is selected from dropdown', function () {
        sage.sageInputElement.enter('reve ');
        sage.waitForSageDropdownItem('revenue');
        $$(sage.selectors.SAGE_DROPDOWN_ITEM).first().click();
        sage.sageInputElement.waitForValueToBe('revenue ');
    });
});
