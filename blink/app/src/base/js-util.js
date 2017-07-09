/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Misc utility functions that are global to app. Goal is to provide missing js
 * functions through this file.
 * NOTE: Do not add any function here that is tied to blink app logic.
 */

'use strict';

/* eslint no-bitwise: 1 */

blink.app.factory('jsUtil', [
    function () {
        /**
         * Creates an new rfc4122v4 compliant uuid
         * Source: http://stackoverflow.com/a/2117523
         */
        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        /**
         * executes the given function in the next event loop
         * @param func
         */
        function executeInNextEventLoop(func) {
            if (!func) {
                return;
            }
            setTimeout(func, 0);
        }

        // Source: http://stackoverflow.com/questions/326069/how-to-identify-if-a-
        // webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
        function inIFrame () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        }

        return {
            generateUUID: generateUUID,
            executeInNextEventLoop: executeInNextEventLoop,
            inIFrame: inIFrame
        };
    }]);
