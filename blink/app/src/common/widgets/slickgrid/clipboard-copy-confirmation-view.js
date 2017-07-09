/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Utility directive to show a "data successfully copied to clipboard" confirmation.
 *
 */

'use strict';

blink.app.directive('clipboardCopyConfirmationView', function () {
    function linker(scope, $el, attrs) {
    }

    return {
        restrict: 'A',
        link: linker,
        templateUrl: 'src/common/widgets/slickgrid/clipboard-copy-confirmation-view.html'
    };
});
