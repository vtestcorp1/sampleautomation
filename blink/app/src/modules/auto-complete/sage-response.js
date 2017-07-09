/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Archit Bansal(archit.bansal@thoughtspot.com)
 */

'use strict';

blink.app.factory('SageResponse', [
    function () {
        function SageResponse(answerResponse, debugCallback) {
            this.answerResponse = answerResponse || {};
            this.debugCallback = debugCallback || angular.noop;
        }

        return SageResponse;
    }
]);
