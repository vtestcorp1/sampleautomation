/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview View for contact support
 */

'use strict';

blink.app.directive('contactSupport', function () {
    return {
        restrict: 'E',
        controller: 'ContactSupportController',
        templateUrl: 'src/common/widgets/contact-support/contact-support.html'
    };
});
