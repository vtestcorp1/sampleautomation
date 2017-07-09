/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview E2E tests to check i18n support
 */
'use strict';

let common = require('../common');
let i18n = require('./i18n');

describe('i18n', function() {
    beforeEach(() => {
        common.navigation.goToHome();
    });

    afterEach(() => {
        common.navigation.removeUrlParameter(i18n.constants.LOCALE_BROWSER_PARAM);
        common.util.waitForElement(common.navigation.selectors.HOME_SAGE_BAR);
    });

    it('should support non en-US locales', function () {
        common.navigation.addUrlParameter(i18n.constants.LOCALE_BROWSER_PARAM, 'ja');
        common.util.waitForTextToBePresentInElement(
            common.navigation.selectors.ANSWER_SECTION, '検索'
        );
    });
});
