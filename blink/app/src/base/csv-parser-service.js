/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * This service provides csv parsing capabilities.
 */

'use strict';

blink.app.factory('csvParserService', function() {
    /**
     * This function parses text by auto detecting delimiter.
     * Refer http://papaparse.com/
     * @param {string} text
     * @returns {Object} containing value, error and metadata.
     * @returns {Object.data} parsed data.
     * @returns {Object.errors} errors encountered.
     * @returns {Object.meta} extra parse info
     */
    function parse(text){
        var parsedInfo = Papa.parse(text);
        // Note in case of '\n' and single value Papa parse sets
        // data but also sets errors and sets default value of
        // ','
        var PAPA_PARSE_WARN_MESSAGE = 'Unable to auto-detect delimiting character; defaulted to \',\'';
        if(parsedInfo.data.length > 0 && parsedInfo.errors.length === 1
            && parsedInfo.errors[0].message.trim() === PAPA_PARSE_WARN_MESSAGE) {
            parsedInfo.errors.splice(0, 1);
        }
        return parsedInfo;
    }

    return {
        parse: parse
    };
});
