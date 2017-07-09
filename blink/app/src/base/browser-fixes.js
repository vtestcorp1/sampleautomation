/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Contains browser specific fixes (Non CSS).
 */

'use strict';

blink.app.factory('browserFixes', function () {
    function chrome() {
        // There is some bug in the way chrome determines
        // the target of the scroll event. On having this dummy
        // event listener, the event targets seem to be determined
        // correctly.
        document.addEventListener('wheel', _.noop);
    }

    function firefox() {}

    function safari() {}

    function ie() {}

    function apply() {
        if(blink.app.isChrome) {
            chrome();
        } else if (blink.app.isSafari) {
            safari();
        } else if (blink.app.isFF) {
            firefox();
        } else if(blink.app.isIE) {
            ie();
        }
    }

    return {
        apply: apply
    };
});
