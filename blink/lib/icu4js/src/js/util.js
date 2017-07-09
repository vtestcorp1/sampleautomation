/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview: Internal utility functions in icu4js. Not to be used by the consumers of the
 * library.
 */

'use strict';

(function(global){

    function convertICUErrorToJSError(error) {
        if (error.isSuccess()) {
            return null;
        }
        return new Error(error.getMessage());
    }

    function checkForError(error) {
        if (error.isSuccess()) {
            return;
        }

        var message = error.getMessage();
        if (error.isWarning()) {
            console.warn(message);
            return;
        }

        throw new Error(message);
    }

    function convertVectorToArray(vector) {
        var size = vector.size();
        var array = [];

        for (var i = 0; i < size; ++i) {
            var value = vector.get(i);
            array.push(value);
        }
        return array;
    }

    function convertArrayToVector(array) {
        var vector = new Module.WStringVector();
        array.forEach(function(value){
            /*jshint camelcase: false */
            vector.push_back(value);
        });
        return vector;
    }

    global.icu4js = global.icu4js || {};
    global.icu4js._util = {
        checkForError: checkForError,
        convertICUErrorToJSError: convertICUErrorToJSError,
        convertVectorToArray: convertVectorToArray,
        convertArrayToVector: convertArrayToVector
    };
})(window);
