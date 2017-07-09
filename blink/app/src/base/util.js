/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot,com)
 *
 * @fileoverview Misc utility functions used across the code base
 */

'use strict';

/* eslint no-bitwise: 1 */
/* global moment */

blink.app.factory('util', ['$sanitize',
    '$q',
    'env',
    'Logger',
    '$timeout',
    'blinkConstants',
    'session',
    'strings',
    '$sessionStorage',
    '$rootScope',
    '$compile',
    'safeApply',
    function ($sanitize,
          $q,
          env,
          Logger,
          $timeout,
          blinkConstants,
          session,
          strings,
          $sessionStorage,
          $rootScope,
          $compile,
          safeApply) {

        var me = {},
            _logger = Logger.create('util'),

            DEFAULT_DECIMAL_PRECISION = 2,

            DATE_AGGREGATE_TYPE_LABELS = {
                SUM: 'TOTAL',
                AVERAGE: 'AVG',
                MIN: 'MIN',
                MAX: 'MAX',
                COUNT: 'TOTAL COUNT',
                COUNT_DISTINCT: 'UNIQUE COUNT',
                STD_DEVIATION : 'STD DEVIATION',
                VARIANCE : 'VARIANCE',
                RANGE: 'RANGE'
            },

            DEFAULT_COMPACT_SCIENTIFIC_NUMBER_SUFFIX_MAP = {
            // Number of zeros vs abbreviation char.
                3: 'K',
                6: 'M',
                9: 'G',
                12: 'T'
            };

        me.LoadStates = {
            UNINITIALIZED: 'UNINITIALIZED',
            INITIALIZING: 'INITIALIZING',
            INITIALIZED: 'INITIALIZED',
            INITIALIZATION_FAILED: 'INITIALIZATION_FAILED'
        };

        me.timeBucketLabels = {
            d: 'Daily',
            w: 'Weekly',
            M: 'Monthly',
            Q: 'Quarterly',
            y: 'Yearly',
            h: 'Hourly'
        };

        me.aggregateTypeLabels = {
            SUM: 'TOTAL',
            AVERAGE: 'AVG',
            MIN: 'MIN',
            MAX: 'MAX',
            COUNT: 'TOTAL COUNT',
            COUNT_DISTINCT: 'UNIQUE COUNT',
            STD_DEVIATION : 'STD DEVIATION',
            VARIANCE : 'VARIANCE'
        };

        me.aggregateTypeLabelsToType = {
            'TOTAL': 'SUM',
            'AVG' : 'AVERAGE',
            'MIN': 'MIN',
            'MAX': 'MAX',
            'TOTAL COUNT': 'COUNT' ,
            'UNIQUE COUNT': 'COUNT_DISTINCT',
            'STD DEVIATION': 'STD_DEVIATION',
            'VARIANCE' : 'VARIANCE'
        };

        me.aggregateTypes = {
            NONE: 'NONE',
            SUM: 'SUM',
            AVG: 'AVERAGE',
            MIN: 'MIN',
            MAX: 'MAX',
            TOTAL_COUNT: 'COUNT',
            UNIQUE_COUNT: 'COUNT_DISTINCT',
            STD_DEVIATION: 'STD_DEVIATION',
            VARIANCE: 'VARIANCE',
            RANGE: 'RANGE'
        };

        me.operatorTypes = {
            EQ: 'EQ',                   // '='
            GT: 'GT',                   // '>'
            GE: 'GE',                   // '>='
            LT: 'LT',                   // '<'
            LE: 'LE',                   // '<=
            NE: 'NE',
            BETWEEN: 'BW',            // 'x > a && x < b'
            BETWEEN_INC: 'BW_INC',        // 'x >= a && x <= b'
            BETWEEN_INC_MIN: 'BW_INC_MIN',    // 'x >= a && x < b'
            BETWEEN_INC_MAX: 'BW_INC_MAX'     // 'x > a && x <= b'
        };

        me.dataTypesToDisplayName = {
            BOOL: 'Text',
            CHAR: 'Text',
            VARCHAR: 'Text',
            DATE: 'Date',
            DATE_TIME: 'Datetime',
            TIME: 'Time',
            DATE_NUM: 'Numeric',
            INT32: 'Numeric',
            INT64: 'Numeric',
            DOUBLE: 'Decimal',
            FLOAT: 'Decimal'
        };

        me.displayNameToDataType = {
            Boolean: 'BOOL',
            Text: 'VARCHAR',
            Date: 'DATE',
            Datetime: 'DATE_TIME',
            Time: 'TIME',
            Numeric: 'INT64',
            Decimal: 'DOUBLE'
        };

        me.dataTypes = {
            BOOL: 'BOOL',
            CHAR: 'CHAR',
            VARCHAR: 'VARCHAR',
            DATE: 'DATE',
            DATE_TIME: 'DATE_TIME',
            TIME: 'TIME',
            DATE_NUM: 'DATE_NUM',
            INT32: 'INT32',
            INT64: 'INT64',
            DOUBLE: 'DOUBLE',
            FLOAT: 'FLOAT',
            UNKNOWN: 'UNKNOWN'
        };

        me.dateDataTypes = [
            'DATE',
            'DATE_TIME'
        ];

        me.answerDisplayModes = {
            CHART: 'CHART-MODE',
            TABLE: 'TABLE-MODE'
        };

        me.displayModeToVizType = _.invert(me.answerDisplayModes);

        me.relativePositions = {
            UP: 'UP',
            DOWN: 'DOWN',
            RIGHT: 'RIGHT',
            LEFT: 'LEFT'
        };

        me.popoverPositions = {
            TOP: 'top', // popup on top, horizontally centered on input element.
            TOPLEFT: 'top-left', // popup on top, left edge aligned with input element left edge.
            TOPRIGHT: 'top-right', // popup on top, right edge aligned with input element right edge.
            BOTTOM: 'bottom', // popup on bottom, horizontally centered on input element.
            BOTTOMLEFT: 'bottom-left', // popup on bottom, left edge aligned with input element left edge.
            BOTTOMRIGHT: 'bottom-right', // popup on bottom, right edge aligned with input element right edge.
            LEFT: 'left', // popup on left, vertically centered on input element.
            LEFTTOP: 'left-top', // popup on left, top edge aligned with input element top edge.
            LEFTBOTTOM: 'left-bottom', // popup on left, bottom edge aligned with input element bottom edge.'
            RIGHT: 'right', // popup on right, vertically centered on input element.
            RIGHTTOP: 'right-top', // popup on right, top edge aligned with input element top edge.
            RIGHTBOTTOM: 'right-bottom' // popup on right, bottom edge aligned with input element bottom edge.
        };

        me.getConstantValue = function (value, type) {
            var constantValue = new tsProto.falcon.ConstantValue();
            switch (type) {
                case me.dataTypes.BOOL:
                    constantValue.setBoolVal(value);
                    break;
                case me.dataTypes.VARCHAR:
                case me.dataTypes.CHAR:
                    constantValue.setStringVal(value);
                    break;
                case me.dataTypes.INT64:
                case me.dataTypes.DATE:
                case me.dataTypes.DATE_TIME:
                case me.dataTypes.TIME:
                case me.dataTypes.DATE_NUM:
                    constantValue.setInt64Val(value);
                    break;
                case me.dataTypes.INT32:
                    constantValue.setInt32Val(value);
                    break;
                case me.dataTypes.DOUBLE:
                    constantValue.setDoubleVal(value);
                    break;
                case me.dataTypes.FLOAT:
                    constantValue.setFloatVal(value);
                    break;
            }

            return constantValue;
        };

        me.queryConstantValue = function (constantValue) {
            function isDefined(val) {
                return val !== null && val !== void 0;
            }
            var possibleValues = [];
            possibleValues.push(constantValue.getBoolVal());
            possibleValues.push(constantValue.getStringVal());
            possibleValues.push(constantValue.getInt64Val());
            possibleValues.push(constantValue.getInt32Val());
            possibleValues.push(constantValue.getDoubleVal());
            possibleValues.push(constantValue.getFloatVal());

            var idx = possibleValues.findIndex(function(val){
                return isDefined(val);
            });
            return possibleValues[idx];
        };

        me.setSessionStoreValue = function (key, value) {
            if (!key) {
                return;
            }
            $sessionStorage.$default()[key] = value;
        };

        me.getSessionStoreValue = function (key) {
            if (!key) {
                return null;
            }
            return $sessionStorage.$default()[key];
        };

        me.deleteSessionStoreKey = function (key) {
            if (!key) {
                return;
            }
            if (!!$sessionStorage.$default()[key]) {
                delete $sessionStorage.$default()[key];
            }
        };

        me.addEventListenersUseCapture = function (el, events, fn) {
            var evts = events.split(' ');
            evts.forEach(function(evt) {
                el.addEventListener(evt, fn, true);
            });
        };

        me.removeEventListenersUseCapture = function (el, events, fn) {
            var evts = events.split(' ');
            evts.forEach(function(evt) {
                el.removeEventListener(evt, fn, true);
            });
        };

    /**
     * Safely accesses nested properties of an object
     * @param {Object} obj
     * @param {Array | string} props    A string containing the properties separated by dots, or an array of properties
     * @return {*}                      Will return the value of the property if it exists, undefined otherwise
     *
     * Examples:
     * util.prop(viz, 'metaContent.title.value.text');
     * util.prop(viz, ['metaContent', 'title', 'value', 'text']);
     */
        me.prop = function (obj, props) {
            var prop = obj;
            if (typeof props == 'string') {
                props = props.split('.');
            }
            for (var i = 0, l = props.length; i < l; i++) {
                if (!prop) {
                    return;
                }
                prop = prop[props[i]];
                if (i == l - 1) { // This is the last property in the chain
                    return prop;
                }
            }
            return obj;
        };

    /**
     * Safely writes to a nested property of an object.
     * Setting properties to undefined deletes the object.
     * @param {Object} obj
     * @param {Array | string} props    A string containing the properties separated by dots, or an array of properties
     * @return {*}                      Will return true if the property was found and successfully set
     *
     * Examples:
     * util.setProp(viz, 'metaContent.title.value.text', 'New Title');
     * util.setProp(viz, ['metaContent', 'title', 'value', 'text'], 'New Title');
     */
        me.setProp = function (obj, props, val) {
            var prop = obj;
            if (typeof props == 'string') {
                props = props.split('.');
            }
            for (var i = 0, l = props.length; i < l; i++) {
                if (!prop) {
                    return;
                }
                if (i == l - 1) { // This is the last property in the chain
                    if (val === void 0) {
                        delete prop[props[i]];
                    } else {
                        prop[props[i]] = val;
                    }
                    return true;
                } else {
                // Create an intermediate property in the chain if it does not exist.
                    if (!prop.hasOwnProperty(props[i])) {
                        prop[props[i]] = {};
                    }
                    prop = prop[props[i]];
                }
            }
        };

    /**
     * Deletes the property
     * @param {Object} obj
     * @param {Array | string} props    A string containing the properties separated by dots,
     * or an array of properties
     *
     * Examples:
     * util.prop(viz, 'metaContent.title.value.text');
     * util.prop(viz, ['metaContent', 'title', 'value', 'text']);
     */
        me.deleteProp = function (obj, props) {
            me.setProp(obj, props, void 0);
        };

    /**
     * Whether an object has a certain value
     * @param {Object} obj
     * @return {boolean}
     */
        me.hasValue = function (obj, value) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && obj[key] === value) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Wheter an array contains an object
         *
         * @param arr
         * @param obj
         *
         * @return {boolean}
         */
        me.contains = function(arr, obj) {
            return arr.some(function(element){
                return obj === element;
            });
        };
    /**
     * Truncates the string and appends three dots if the string is longer than maxLength
     * @param {string} str
     * @param {number} maxLength
     * @return {string}
     *
     * Example:
     * util.truncate('This is a long string', 18);
     * >> This is a long str…
     */
        me.truncate = function (str, maxLength) {
            if (str.length > maxLength) {
                return str.substring(0, maxLength) + '…';
            }
            return str;
        };

        me.replaceAll = function (str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        };

    /**
     * Sorts an array of object using a certain property of the object
     * @param  {Array}  An array of objects
     * @param  {string} The name of the property to sort by
     * @return {Array}  The sorted array
     */
        me.sortByObjectProperty = function (array, propName) {
            return array.sortBy(function (item) {
                return item[propName];
            });
        };

    /**
     * Returns true if a string is empty or contains only spaces, false otherwise.
     * @param {string} string
     * @return {boolean}
     */
        me.isEmptyOrOnlySpaces =  function (string) {
            if (!string || typeof string != 'string' || /^\s*$/.test(string)) {
                return true;
            }
            return false;
        };

    /**
     * Checks whether a GUID has a valid format
     * @param {string} string   The GUID to test
     * @return {boolean}
     */
        me.isValidGuid =  function (string) {
            var guidRegexp = /^[a-fA-F0-9]{8}-([a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}$/;
            if (!string || typeof string != 'string' || !guidRegexp.test(string)) {
                return false;
            }
            return true;
        };

    /**
     * Example: If needle is ['sort', 'by'] and haystack is ['sort', 'by', ...] return true
     * @param {Array.<string>} needle
     * @param {Array.<string>} haystack
     */
        me.isPrefixArray = function (needle, haystack) {
            if (needle.length > haystack.length) {
                return false;
            }
            for (var i = 0; i < needle.length; i++) {
                if (needle[i].toLowerCase() != haystack[i].toLowerCase()) {
                    return false;
                }
            }
            return true;
        };

    /**
     * Example: If needle is ['part', 'name'] and haystack is [..., 'part', 'name'] return true
     * @param {Array.<string>} needle
     * @param {Array.<string>} haystack
     */
        me.isPostfixArray = function (needle, haystack) {
            if (needle.length > haystack.length) {
                return false;
            }
            for (var i = needle.length - 1, j = haystack.length - 1; i >= 0; i--, j--) {
                if (needle[i].toLowerCase() != haystack[j].toLowerCase()) {
                    return false;
                }
            }
            return true;
        };

    /**
     * '  foo  bar   ' => ['foo', 'bar']
     * @param {string} input
     */
        me.getWords = function (input) {
        // extract the words only
            return input.split(' ').filter(function (x) { return !!x; });
        };

    /**
     *
     */
        me.getCommaSeperatedArrayFromString = function(input) {
            return input.trim().split(/\s*,\s*/)
            .filter(function (x) { return !!x; });
        };

    /**
     * @param {string} needle
     * @param {string} haystack
     * @param {boolean=} isStrict true for when we want a strict prefix, that is needle is shorter than haystack
     */
        me.isPrefix = function (needle, haystack, isStrict) {
            if (needle.length > haystack.length) {
                return false;
            }
            if (!!isStrict && needle.length === haystack.length) {
                return false;
            }
            return (haystack.indexOf(needle) === 0);
        };

    /**
     * Example: isPostfix('foo', 'barfoo') is true, isPostfix('foo', 'foo', true) is false.
     *
     * @param {string} needle
     * @param {string} haystack
     * @param {boolean=} isStrict true for when we want a strict postfix, that is needle is shorter than haystack
     */
        me.isPostfix = function (needle, haystack, isStrict) {
            if (needle.length > haystack.length) {
                return false;
            }
            if (!!isStrict && needle.length === haystack.length) {
                return false;
            }
            return (haystack.lastIndexOf(needle) === (haystack.length - needle.length));
        };

    /**
     * @param {string} str
     */
        me.hasTrailingSpace = function (str) {
            if (!str) { return false; }

            return str.charAt(str.length - 1) === ' ';
        };

    /**
     * Removes any spaces from a string.
     * For example, if given the string " g u est ", the function would return "guest".
     * @param {string} str      The input string
     * @return {string}         Output string without any spaces
     */
        me.removeSpaces = function (str) {
            return str.replace(/ /g, '');
        };

    /**
     * Removes trailing white spaces from a string
     * @param str
     * @returns {string}
     */
        me.stringTrimRight = function (str) {
            if (!str) {
                return str;
            }

            var rgx = new RegExp('\\s+$');
            return str.replace(rgx, '');
        };

    /**
     * ['foo', 'bar', '', ''] => ['foo', 'bar']
     *
     * @param {Array.<string>} arr
     */
        me.arrayTrimRight = function (arr) {
            arr = arr.slice();
            while (arr.length > 0 && arr[arr.length - 1] === '') {
                arr.pop();
            }
            return arr;
        };

    /**
     * Rotates an array to the left by the specified number of steps
     * E.g.:
     * util.rotateArray([1,2,3,4,5], 2);
     * >> [3,4,5,1,2]
     * @param {Array} arr
     * @param {number} steps
     * @return {Array}
     */
        me.rotateArray = function (arr, steps) {
            steps = steps % arr.length;
            return arr.slice(steps).concat(arr.slice(0, steps));
        };

    /**
     * Finds the items in an array and removes them
     * The list of items removed are returned.
     *
     * @param arr
     * @param checkFn
     * @returns {Array.<T>}
     */
        me.findAndRemoveAll = function (arr, checkFn) {
            var i = arr.length;
            var itemsDeleted = [];
            while(i--) {
                var item = arr[i];
                if(!!checkFn(item, i)) {
                    arr.splice(i, 1);
                    itemsDeleted.push(item);
                }
            }
            return itemsDeleted.reverse();
        };

    /**
     * merge two sorted Arrays into one.
     *
     * @param arr1
     * @param arr2
     * @param compareFn
     * @param doNotRemoveDupes
     * @returns {Array}
     */
        me.mergeSortedArrays = function (arr1, arr2, compareFn, doNotRemoveDupes) {
            var i = 0, j = 0;
            var result = [];
            function compareWrapper (item1, item2) {
                if(i === arr1.length) {
                    return 1;
                }
                if(j === arr2.length) {
                    return -1;
                }
                return compareFn(item1, item2);
            }

            while(i < arr1.length || j < arr2.length) {
                var item1 = arr1[i],
                    item2 = arr2[j];
                var comparison = compareWrapper(item1, item2);
                if(comparison < 0) {
                    result.push(item1);
                    i++;
                } else if(comparison > 0) {
                    result.push(item2);
                    j++;
                } else {
                    result.push(item1);
                    if(!doNotRemoveDupes) {
                        i++;
                        j++;
                    } else {
                        i++;
                    }
                }
            }
            return result;
        };

    /**
     * Creates a new array, Merging two Arrays.
     * Extends the lodash mergeWith to work with arrays.
     *
     * @param [Array] arr1
     * @param [Array] arr2
     * @param keyFn     When target/src is an array this denotes the key to merge on
     * @returns {Array}
     */
        me.mergeArrayWith = function(arr1, arr2, keyFn) {
            if(!_.isArray(arr1) || !_.isArray(arr2)) {
                _logger.error('The source and target need to be arrays');
                return [];
            }
            var map1 = _.keyBy(arr1, keyFn);
            var map2 = _.keyBy(arr2, keyFn);

            return _.values(
            _.merge(map1, map2)
        );
        };

    /**
     * TODO(joy/steph): consider the possibility of moving this to a viz-specific util service
     *
     * @param {string} title
     * @param {string} aggrType
     */
        me.getAggregateTitle = function (title, aggrType) {
            var aggrText = me.aggregateTypeLabels[aggrType];
            return aggrText? aggrText.capitalize() + ' ' + title : title;
        };

        me.getTimeBucketizedTitle = function(title, timeBucket) {
            var bucketLabel = me.timeBucketLabels[timeBucket];
            return bucketLabel ? bucketLabel.capitalize() + ' (' + title + ')' : title;
        };

    /**
     * TODO(joy/steph): consider the possibility of moving this to a viz-specific util service
     *
     * @param {string} aggrType
     */
        me.getAggregateLabel = function (aggrType) {
            return me.aggregateTypeLabels[aggrType];
        };

        me.getDateAggregateLabel = function (aggrType) {
            return DATE_AGGREGATE_TYPE_LABELS[aggrType];
        };


    /**
     * This checks if the value is of special type like NaN, Infinity, etc
     *
     * @param value - the value to format
     * @returns {*} - formatted value if it was a special case and null if it wasn't
     */
        me.getSpecialFormatData = function (value) {
       // Hack(sunny): special handling for already formatted value (SCAL-5934, SCAL-6048)
            if (value === strings.NULL_VALUE_PLACEHOLDER_LABEL
            || value === strings.EMPTY_VALUE_PLACEHOLDER_LABEL) {
                return value;
            }

            if (value === blinkConstants.SPECIAL_VALUE_UNAVAILABLE) {
                return strings.UNAVAILABLE_COLUMN_SAMPLE_VALUE;
            }

        // This (==) checks for both null and undefined
            if (value === null || value === void 0) {
                return strings.NULL_VALUE_PLACEHOLDER_LABEL;
            }
        // {Empty} placeholder is set for empty string or no characters
        // other than spaces.
            if(value === "" || (value.isBlank && value.isBlank())) {
                return strings.EMPTY_VALUE_PLACEHOLDER_LABEL;
            }
            if (value instanceof Array) {
                if (!value.length || value[0] === null || value[0] === void 0) {
                    return strings.NULL_VALUE_PLACEHOLDER_LABEL;
                }

                switch (value[0]) {
                    case 'NaN':
                        return 'NaN';
                    case 'Infinity':
                        return 'Infinity';
                    default:
                        return null;
                }
            }

            return null;
        };

    /**
     * Returns true if the value is NaN.
     * @param {number} value
     * @returns {boolean}
     */
        me.isSpecialNaNValue = function (value) {
            var specialValue = me.getSpecialFormatData(value);
            if (!specialValue) {
                return isNaN(value);
            }
            return specialValue === 'NaN';
        };

    /**
     * Returns true if the value is infinity.
     * TODO(vibhor): Fix this once callosum starts distinguishing between infinity and -ve infinity.
     *
     * @param {number} value
     * @returns {boolean}
     */
        me.isSpecialInfinityValue = function (value) {
            var specialValue = me.getSpecialFormatData(value);
            if (!specialValue) {
                return false;
            }
            return specialValue === 'Infinity';
        };

    /**
     * Returns true if the value is -ve infinity.
     * TODO(vibhor): Fix this once callosum starts distinguishing between infinity and -ve infinity.
     *
     * @param {number} value
     * @returns {boolean}
     */
        me.isSpecialMinusInfinityValue = function (value) {
            return false;
        };

        me.isSpecialValue = function (value) {
            return !!me.getSpecialFormatData(value);
        };

    /**
     * Computes the placeholder value to be used as the +Infinity/-Infinity values
     * for chart axes.
     * @param min
     * @param max
     * @returns {number}
     */
        me.computeAxisInfinityPlaceholderValue = function (min, max) {
        // the only case in which either of the ends can be +/- Inf is when
        // there are no non-special points in the data (i.e. all valid points
        // are +/- inf). In such cases any value can be used as a placeholder
            if ((min === Number.NEGATIVE_INFINITY || min === Number.POSITIVE_INFINITY)) {
                return 1;
            }

        // this can happen if all finite y-value points have the
        // same y-value
            if (min === max) {
                return (max + 1) * 10;
            }
            return Math.max(Math.abs(max), Math.abs(min)) + Math.abs(max - min);
        };


        me.zeroFill = function(number, width) {
            width -= number.toString().length;
            if ( width > 0 )
        {
                return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
            }
            return number + ""; // always return a string
        };

    /**

    /**
     * Formats the data
     *
     * @param value - the value to be formatted
     * @param {Object} [options={}] - an object with flags controlling formatting behavior
     * @param {boolean} [options.isDouble=false]  - indicates if the number is to be treated
     *     as a floating point value instead of an integer.
     * @param {boolean} [options.noShorten=true] - indicates if the number should be prevented
     *    from converting to a short business number format before applying other
     *    formatting. i.e. 1234 -> 1.23K
     * @param {string} [options.formatPattern=null] - optional format pattern to be applied,
     *     other flags like __nDecimal__ override anything specified in this pattern
     * @param {boolean} [options.checkOnlySpecialFormat=false]  - indicates if we just
     *     want to check the special cases like NaN, null, etc
     * @param {boolean} [options.isPercent=false] - if the value is supposed to be treated
     *     as a percentage
     * @param {Number} [options.nDecimal=DEFAULT_DECIMAL_PRECISION] - the number of decimal
     *     places for formatting
     * @param {boolean} [options.isCurrency=false] - whether this value is to be treated as
     *     a currency value
     * @param {currencyCode} [options.currencyCode=null] - the ISO 4217 currency code to be
     *     used to format the value as a currency. Ignored if __isCurrency__ is not set to
     *     true. If not provided defaults to the currency implied by the current locale.
     * @returns {string}
     */

        me.formatDataLabel = function(value, options){
            if (options === void 0) {
                options = {};
            }

            if (!('noShorten' in options)) {
                options.noShorten = true;
            }

        // Check if this is a special value like NaN, etc
            var specialVal = me.getSpecialFormatData(value);
            if (!!specialVal) {
                return specialVal;
            }

            if (options.checkOnlySpecialFormat) {
                return value;
            }

        // NOTE(vibhor): For now, we are just supporting number data labels;
            if (isNaN(value)) {
                return value;
            }

        // convert to true number
            value = +value;

            var formatPattern = options.formatPattern;
            if (!formatPattern) {
                formatPattern = void 0;
            }

            var isDouble = options.isDouble;
            if (options.isDouble === void 0) {
                isDouble = false;
            }

            var nDecimal = options.nDecimal;
            if ((nDecimal === void 0 || nDecimal < 0)
            && !formatPattern
            && isDouble) {
                nDecimal = DEFAULT_DECIMAL_PRECISION;
            }

            var style = void 0;

            var isPercent = !!options.isPercent;
            var isCurrency = !!options.isCurrency;
            if (isPercent) {
                style = icu4js.numberFormat.Style.PERCENT;
            } else if (isCurrency) {
                style = icu4js.numberFormat.Style.CURRENCY;
            }

            var currencyCode = options.currencyCode || void 0;

            var needBusinessFormatting = !options.noShorten && !options.isPercent;
            var businessFormattedValue = null;
            if (needBusinessFormatting) {
                businessFormattedValue = this.formatBusinessNumber(value);
                if (!isCurrency) {
                    return businessFormattedValue;
                }
            }

            var result = icu4js.numberFormat.format(
            value,
            isDouble,
            formatPattern,
            nDecimal,
            style,
            currencyCode
        );

        // Hack(mahesh): For the case when we have to apply both business number formatting AND
        // currency code, there is a limitation that we can't do that in one call to icu4js
        // library. So we separately apply both business number formatting and currency formatting
        // and then pick the currency prefix/suffix from the currency formatted value, and apply it
        // on business number formatted value.
            if (needBusinessFormatting && isCurrency) {
                return combineCurrencyAndBusinessFormatting(result, businessFormattedValue);
            }

            return result;
        };

        function combineCurrencyAndBusinessFormatting(currencyFormattedValue, businessFormattedValue) {
            var currencyPrefix = '', currencySuffix = '', i, c;
            for (i = 0; i < currencyFormattedValue.length; i++) {
                c = currencyFormattedValue.charAt(i);
                if (!icu4js.numberFormat.isValidNumericString(c)) {
                    currencyPrefix += c;
                } else {
                    break;
                }
            }
            for (i = currencyFormattedValue.length - 1; i >= 0; i--) {
                c = currencyFormattedValue.charAt(i);
                if (!icu4js.numberFormat.isValidNumericString(c)) {
                    currencySuffix = c + currencySuffix;
                } else {
                    break;
                }
            }
            if (currencySuffix) {
            // If currency symbol and number shortening symbol are next to each other, put a space
            // in between them.
                var endsWithNumShorteningSymbol =
                !icu4js.numberFormat.isValidNumericString(businessFormattedValue.slice(-1));
                if (endsWithNumShorteningSymbol && currencySuffix.charAt(0) !== ' ') {
                    currencySuffix = ' ' + currencySuffix;
                }
                return businessFormattedValue + currencySuffix;
            }
            if (currencyPrefix) {
            // If currency symbol and number shortening symbol are next to each other, put a space
            // in between them.
                var startsWithNumShorteningSymbol =
                !icu4js.numberFormat.isValidNumericString(businessFormattedValue.charAt(0));
                if (currencyPrefix.slice(-1) !== ' ' && startsWithNumShorteningSymbol) {
                    currencyPrefix = currencyPrefix + ' ';
                }
                return currencyPrefix + businessFormattedValue;
            }
            return businessFormattedValue;
        }

        me.formatNumber = function (value, isDouble, format) {
            return icu4js.numberFormat.format(value,
            true,
            format);
        };

    /**
     * returns a formatted array of numbers
     * @param start
     * @param end
     * @param step
     * @param fmt
     */
        me.formatNumericArray = function (inputArr, fmt) {
            return inputArr.map(function(num) {
                return icu4js.numberFormat.format(num, true, fmt);
            });
        };

        me.isValidNumberFormat = function (formatPattern) {
            var errorMessage = icu4js.numberFormat.getPatternValidationError(formatPattern);
            if (!!errorMessage) {
                _logger.log('Format pattern validator error', formatPattern, errorMessage);
                return false;
            }
            return true;
        };

    /**
     * @param {number} num
     * @param {number} nDecimal
     * @return {string}
     * @private
     */
        function toFixedNoTrailingZero(num, nDecimal) {
            var formattedNum = num.toFixed(nDecimal);
            var arr = formattedNum.split('.');
            if (arr[1] === '0') {
                return arr[0];
            }
            return formattedNum;
        }

    /**
     * Formats the given number in a scientific/information technology
     * mode. E.g. 10^9 = 1G, 10^6 = 1M
     * @param {number} num
     * @returns {string}
     */
        me.formatCompactScientificNumber = function (num) {
            var suffixMap = DEFAULT_COMPACT_SCIENTIFIC_NUMBER_SUFFIX_MAP;

            var specialValue = me.getSpecialFormatData(num);
            if (!!specialValue) {
                return specialValue;
            }

            if (isNaN(num)) {
                return num;
            }
            num = +num;

            var absNum = Math.abs(num),
                powersOfTen = [12, 9, 6, 3];
            for (var i = 0; i < powersOfTen.length; i++) {
                var powerOfTen = powersOfTen[i];
                if (!Object.has(suffixMap, powerOfTen)) {
                    continue;
                }

                var base = Math.pow(10, powerOfTen);
                if (absNum >= base) {
                    var suffix = suffixMap[powerOfTen];
                    return toFixedNoTrailingZero(num / base, 1) + suffix;
                }
            }
            return toFixedNoTrailingZero(num, 1);
        };

    /**
     * @param {number} num
     * @returns {string}
     */
        me.formatBusinessNumber = function (num) {
            var specialValue = me.getSpecialFormatData(num);
            if (!!specialValue) {
                return specialValue;
            }

            if (isNaN(num)) {
                return num;
            }

            return icu4js.numberFormat.format(
            num,
            void 0,
            void 0,
            void 0,
            icu4js.numberFormat.Style.DECIMAL_COMPACT_SHORT
        );
        };

        me.parseBusinessNumber = function (formattedNumber) {
        // the possible suffixes are the ones that formatBusinessNumber could
        // have added.
            if (!/^(\-){0,1}[0-9.,]+(T|B|M|K){0,1}$/i.test(formattedNumber)) {
                return Number.NaN;
            }
        // numeral expect T/B/M/K suffices to be lower case
            return numeral().unformat(formattedNumber.toLowerCase());
        };

    /**
     *
     * Returns a scientific notation (e.g. 1e+10) for a given number.
     * Returns the parameter back if the number is NaN.
     *
     * @param {*} num
     * @param {number=} placesAfterDecimal
     * @return {*}
     */
        me.scientificFormat = function (num, placesAfterDecimal, isPercent) {
            var specialValue = me.getSpecialFormatData(num);
            if (!!specialValue) {
                return specialValue;
            }

            if (isNaN(num)) {
                return num;
            }

            if (isPercent) {
                num *= 100;
            }

            num = +num;
            placesAfterDecimal = placesAfterDecimal || DEFAULT_DECIMAL_PRECISION;

            var formattedValue = (num).toExponential(placesAfterDecimal);
            if (isPercent) {
                formattedValue += '%';
            }

            return formattedValue;
        };

        me.isSageSimpleMode = function () {
            if (!env.sageMode) {
                return false;
            }
            return env.sageMode.toLowerCase() === 'simple';
        };

        Highcharts.setOptions({
            lang: {
                numericSymbols: ['K', 'M', 'B', 'T']
            }
        });

    /**
     * Returns the width in pixels of the given string when rendered on a simple span in the body
     * @param {string} str
     * @param {string=} cssClass optional css class to apply on the temporary element for the correct font size and weight
     * @return {number}
     */
        me.getPixelWidthOfString = function (str, cssClass) {
            str = str.escapeHTML();
            // NOTE: Display inline-table helps calculate the width. In case of flex container.
            // Span takes the full width by default.
            var $tmpEl = $('<span style="display: inline-table" class="' + (cssClass || '') + '">' + str.replace(/ /g, '&nbsp;') + '</span>').appendTo($('body'));
            var width = $tmpEl.width();
            $tmpEl.remove();
            return width;
        };

        /**
         * Uses canvas.measureText to compute and return the width of the given text of given font
         * in pixels.
         * Prefer this function over getPixelWidthOfString
         *
         * @param {String} text The text to be rendered.
         * @param {String} font The css font descriptor that text is to be rendered with
         * (e.g. "bold 14px verdana").
         *
         * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
         */
        me.getPixelWidthOfStringUsingCanvas = function(text, font) {
            // re-use canvas context object for better performance
            var context = this._context ||
                (this._context = document.createElement("canvas").getContext('2d'));
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        };

        /**
     * Returns the total height in pixels required to render the string (including padding, border & margin) as a
     * simple span in the body
     * @param {string} str
     * @param {string=} cssClass optional css class to apply on the temporary element for the correct font size and weight
     * @param {number=} maxWidth optional max width available to the span to render (useful in case of hidden overflows)
     * @return {number}
     */
        me.getPixelHeightOfString = function (str, cssClass, maxWidth) {
            str = str.escapeHTML();
            var $tmpEl = $('<span class="' + (cssClass || '') + '"></span>').appendTo($('body'));
            $tmpEl.html(str);

            if (!isNaN(maxWidth)) {
                $tmpEl = $tmpEl.wrap('<div></div>').parent();
                $tmpEl.css('max-width', maxWidth);
            }

        // WARN(vibhor): outerHeight() will return a value that is platform dependent. Any logic using this value should
        // make the necessary adjustments based on the platform.
            var height = $tmpEl.outerHeight(true);
            $tmpEl.remove();
            return height;
        };

    /**
     * Return a "wide" string of specified length. This will be used to determine max pixel width, given string length.
     * @param {number} len
     */
        me.getStringOfLength = function (len) {
            var str = '';
            for (var i = 0; i < len; i++) {
                str += 'D'; // widest character
            }
            return str;
        };

    /**
     * Takes an array of promises and returns a combined promise that will resolve once all original promises
     * are fulfilled, or be rejected if any of the original promises returns with an error.
     * @param  {Array}  promises  An array of promises
     * @return {Object}           The combined promise
     */
        me.getAggregatedPromise = function (promises) {
            var deferred = $q.defer(),
                nbOfResolvedPromises = 0,
                resolveData = [];
            if (!promises.length) {
                deferred.resolve(resolveData);
            }
            promises.each(function (promise, index) {
                promise.then(function (data) {
                    resolveData[index] = data;
                    nbOfResolvedPromises++;
                    if (nbOfResolvedPromises == promises.length) {
                        deferred.resolve(resolveData);
                    }
                }, function (error) {
                    deferred.reject(error);
                });
            });
            return deferred.promise;
        };

    /**
     * Given an array of promises, resolves when all promises are done - either resolved or rejected. This method always
     * resolves and the caller needs to check status of each item to check whether that particular promise
     * resolved or rejected.
     * @param promises
     * @returns {Promise.promise|*}
     */
        me.anySucceeds = function (promises) {
            var deferred = $q.defer(),
                nbOfResolvedPromises = 0, nbOfRejectedPromises = 0,
                resolveDataOrError = [];
            if (!promises.length) {
                deferred.resolve(resolveDataOrError);
            }
            promises.each(function (promise, index) {
                promise.then(function (data) {
                    nbOfResolvedPromises++;
                    resolveDataOrError[index] = {
                        status: 'ok',
                        data: data
                    };

                    if (nbOfResolvedPromises + nbOfRejectedPromises == promises.length) {
                        deferred.resolve(resolveDataOrError);
                    }
                }, function (error) {
                    nbOfRejectedPromises++;
                    resolveDataOrError[index] = {
                        status: 'error',
                        data: error
                    };

                    if (nbOfResolvedPromises + nbOfRejectedPromises == promises.length) {
                        deferred.resolve(resolveDataOrError);
                    }
                });
            });
            return deferred.promise;
        };

    /**
     * Example:
     * getPrefixString(' revenue   part  name   ', 2, false) => ' revenue   part'
     * getPrefixString(' revenue   part  name   ', 2, true) => ' revenue   part  '
     *
     * @param {string} input
     * @param {number} numWords
     * @param {boolean} consumeSpacesAfterLastWord
     * @return {string}
     */
        me.getPrefixString = function (input, numWords, consumeSpacesAfterLastWord) {
            if (!input) {
                return '';
            }

            var wordStarted = false, wordsSoFar = 0;
            for (var i = 0, n = input.length; i < n; i++) {
                var c = input.charAt(i);

                if (c === ' ') {
                    if (wordStarted) {
                        wordStarted = false;
                        wordsSoFar++;
                        if (wordsSoFar === numWords && !consumeSpacesAfterLastWord) {
                            return input.substring(0, i);
                        }
                    } // else no care
                } else {
                    if (!wordStarted) {
                        wordStarted = true;
                        if (wordsSoFar === numWords && !!consumeSpacesAfterLastWord) {
                            return input.substring(0, i);
                        }
                    }
                }
            }

            if ((wordsSoFar === numWords - 1 && wordStarted) || (wordsSoFar === numWords && !wordStarted)) {
                return input;
            }

            return '';
        };

        function generateDFA(keySequence) {
            function isRepeatable(key) {
                if(!key) {
                    return false;
                }
                var lastchar = key.slice(-1);
                return lastchar === '+' || lastchar === '*';
            }

            function isSkippable(key) {
                if(!key) {
                    return false;
                }
                var lastchar = key.slice(-1);
                return lastchar === '*';
            }

            function strip(key) {
                var lastchar = key.slice(-1);
                return (lastchar === '*' || lastchar === '+')
                ? key.slice(0,-1)
                : key;
            }

            var dfa = [];
            for(var i = 0; i<keySequence.length;i++) {
                var key = keySequence[i];
                var nextKey = keySequence[i+1];
                var prevKey = keySequence[i-1];
                var state = {};
                state[strip(key)] = i+1;
                if(isSkippable(key)) {
                    state[strip(nextKey)] = i+2;
                }
                if(isRepeatable(prevKey)) {
                    state[strip(prevKey)] = i;
                }
                dfa.push(state);
            }
            dfa.push({});
            return dfa;
        }

    /**
     * Generates a key sequence detector for a given key sequence
     * Does not support characters '+' and '*' as they are reserved.
     * Example usage: getKeySequenceDetector([';',' *','\n'], onSuccess)
     * The above will match ; followed by any number of spaces and a newline.
     *
     * @param keySequence
     * @param onSuccess
     * @returns {Function}
     */
        me.getKeySequenceDetector = function (keySequence, onSuccess) {
            var currentState = 0;
            var dfa = generateDFA(keySequence);

            return function (key, event) {
                currentState = dfa[currentState][key] || 0;
            // If a key does not match any transition, but can start a new cycle
            // for e.g. (';',' ',';')
                if(currentState === 0) {
                    currentState = dfa[currentState][key] || 0;
                }
                if(currentState === dfa.length - 1) {
                    currentState = 0;
                    onSuccess(event);
                }
            };
        };

    /**
     * From an array returns smallest number larger than the given number.
     *
     * @param array
     * @param number
     * @returns {*}
     */
        me.getSmallestNumberLargerThan = function(array, number) {
            if (!array || array.length <= 0) {
                return void 0;
            }

            var result = void 0;
            array.forEach(function(item) {
                if (item > number) {
                    if (!result) {
                        result = item;
                    } else {
                        if (item < result) {
                            result = item;
                        }
                    }
                }
            });

            return result;
        };

    /**
     * From an array returns largest number smaller than the given number.
     *
     * @param array
     * @param number
     * @returns {*}
     */
        me.getLargestNumberSmallerThan = function(array, number) {
            if (!array || array.length <= 0) {
                return void 0;
            }

            var result = void 0;
            array.forEach(function(item) {
                if (item < number) {
                    if (!result) {
                        result = item;
                    } else {
                        if (item > result) {
                            result = item;
                        }
                    }
                }
            });

            return result;
        };
    /**
     * Creates an object from a list of list elements. The first element of each child list is used as a property
     * (hashkey) and the second element is the value.
     *
     * @param {Array} listOfProps
     * @return {Object}
     */
        me.createObject = function(listOfProps) {
            var obj = {};
            angular.forEach(listOfProps, function (p) {
                if (p.length != 2) {
                    return;
                }
                obj[p[0]] = p[1];
            });
            return obj;
        };

    /**
     * Updates the properties of the target using the source object. Only the enumerable
     * own properties of target are updated and non existing properties are ignored.
     * @param {Object} target
     * @param {object} source
     * @param {boolean} deep
     * @param {boolean} strict - do type matching before overriding
     * @returns {Object}
     */
        me.update = function(target, source, deep, strict) {
            var key, sourceIsObject, targetIsObject, sourceVal, targetVal, result;

            if(target) {
                for(key in source) {
                    if(Object.has(source, key) && Object.has(target, key)) {

                        sourceVal = source[key];
                        targetVal = target[key];
                        var sourceType = typeof sourceVal;
                        var targetType = typeof targetVal;
                        if (!!strict && sourceType !== targetType) {
                            _logger.warn('Type mismatch', key);
                            continue;
                        }
                        sourceIsObject = sourceType === 'object';
                        targetIsObject = targetType === 'object';
                        result = sourceVal;

                    // Going deep
                        if (deep && sourceIsObject && targetIsObject) {
                            me.update(target[key], sourceVal, deep, strict);
                            continue;
                        }
                        target[key] = result;
                    }
                }
            }
            return target;
        };

    /**
     * Takes any parameter (Object, string, number) and determines if it can be parsed into a valid number.
     *
     * @param {*} number
     * @return {boolean}
     */
        me.isValidNumber = function (number) {
            return angular.isDefined(number) && number !== '' && number !== null && !isNaN(number);
        };

    /**
     *
     * HTML escapes a given string using angular $sanitize service.
     *
     * @param {string} str
     * @return {string}
     */
        me.htmlEscape = function (str) {
            return $sanitize(str);
        };

    /**
     * Gets the next element to pick from fromList that is missing in the inList.
     *
     * @param {Array} fromList
     * @param {Array} inList
     */
        me.getNextMissing = function (fromList, inList) {
            return fromList.filter(function (f) {
                return inList.indexOf(f) < 0;
            })[0];
        };

        var SAGE_TOKEN_COLORS = [
                'orange',
                'blue',
                'green',
                'yellow',
                'purple',
                'turquoise',
                'pink',
                'dark-blue',
                'red'
            ],
            usedColorIndexList = {},
            colorMap = {};

        function findNextFreeColorIndex() {
            for (var i = 0; i < SAGE_TOKEN_COLORS.length; ++i) {
                if (!usedColorIndexList[i]) {
                    return i;
                }
            }

            usedColorIndexList = {};
            return 0;
        }

        me.getColorForGuid = function (guid) {
            if (!colorMap.hasOwnProperty(guid)) {
                var colorIndex = findNextFreeColorIndex();
                usedColorIndexList[colorIndex] = true;
                colorMap[guid] = { color: SAGE_TOKEN_COLORS[colorIndex], position: colorIndex};
            }

            return colorMap[guid].color;
        };

        me.resetColorMap = function () {
            colorMap = {};
            usedColorIndexList = {};
        };

        me.removeColorEntryForGuid = function (guid) {
            if (!colorMap.hasOwnProperty(guid)) {
                return;
            }
            usedColorIndexList[colorMap[guid].position] = false;
            delete colorMap[guid];
        };

    /**
     * Comapares the 2 given values. Here:
     * 1. null and undefined are treated as equal
     * 2. null and undefined are treated to be smaller than non-null values
     * 3. String comparison is case insensitive
     *
     * @param value1
     * @param value2
     */
        me.comparator = function (value1, value2) {
            var result = 0;
            if (value1 == value2) {
                result = 0;
            } else if (value1 === undefined || value1 === null) {
                result = -1;
            } else if (value2 === undefined || value2 === null) {
                result = 1;
            } else if (typeof value1 === 'string' && typeof value2 === 'string') {
                var value1LwrCase = value1.toLowerCase(),
                    value2LwrCase = value2.toLowerCase();
                result = (value1LwrCase === value2LwrCase ? 0 : (value1LwrCase > value2LwrCase ? 1 : -1));
            } else {
                result = (value1 > value2 ? 1 : -1);
            }

            return result;
        };

    /**
     * Returns true if both arrays represent the same unordered set. === is used as the array element equality function
     * @param array1
     * @param array2
     * @return {boolean}
     */
        me.areArraysSameSet = function (array1, array2) {
            array1 = array1 || [];
            array2 = array2 || [];

            array1 = array1.unique();
            array2 = array2.unique();
            return array1.length === array2.length && array1.intersect(array2).length === array1.length;
        };

    /**
     *
     * @param {Array} array1
     * @param {Array} array2
     * @param {=Function} mappingFunction
     * @returns {boolean}
     */
        me.areArraysEqual = function (array1, array2, mappingFunction) {
            if (array1.length !== array2.length) {
                return false;
            }

            for (var i=0; i<array1.length; ++i) {
                var value1 = array1[i];
                var value2 = array2[i];
                if (!!mappingFunction) {
                    value1 = mappingFunction(value1);
                    value2 = mappingFunction(value2);
                }
                if (value1 !== value2) {
                    return false;
                }
            }
            return true;
        };

    /**
     * Returns true if subArray is a subset (proper or otherwise) of superArray. === is used as the array element
     * equality function
     * @param subArray
     * @param superArray
     * @return {boolean}
     */
        me.isArraySubsetOfArray = function (subArray, superArray) {
            subArray = subArray.unique();
            return superArray.intersect(subArray).length === subArray.length;
        };

    /**
     * Returns whether the current browser is firefox by looking at the user agent string
     * @return {boolean}
     */
        me.isFirefox = function () {
            return !!navigator.userAgent.toLowerCase().match('firefox');
        };

    /**
     * Returns whether the current browser is a WebKit browser by looking at the user agent string
     * @return {boolean}
     */
        me.isWebkit = function () {
            return !!navigator.userAgent.toLowerCase().match('applewebkit');
        };

    /**
     * executes the given function in the next event loop
     * @param func
     */
        me.executeInNextEventLoop = function(func) {
            if (!func) {
                return;
            }
            $timeout(func, 0);
        };

    /**
     * Returns an array of size numRepeat that has all values set to value
     * @param value
     * @param numRepeat
     * @returns {Array}
     */
        me.repeat = function(value, numRepeat) {
            if(numRepeat <= 0) {
                return [];
            }

            var array = [],
                i = 0;
            while (i < numRepeat) {
                array[i++] = value;
            }
            return array;
        };

    /**
     * Converts array into a hash map with key as the value returned by calling mappingFunction on each element
     * and value as defaultValue. If defaultValue is not specified, the element itself is used as the value
     * Caution (Shikhar) - Care should be taken in case of duplicates in the array. These can map to same key value
     * and only one of these values would be stored.
     * @param {Array} array
     * @param {Function} mappingFunction
     * @param {=*} defaultValue a value or a function to be used to get the value of the hash. if a function it is
     *                          invoked with the key and the return value used as the value in the hash for the key
     * @returns {Object}
     */
        me.mapArrayToHash = function(array, mappingFunction, defaultValue) {
            var hash = {},
                defaultValueIsFunction = Object.isFunction(defaultValue);

            array.each(function(element, index){
                var key = mappingFunction(element, index),
                    value = element;
                if (!!defaultValue) {
                    if (defaultValueIsFunction) {
                        value = defaultValue(element, index);
                    } else {
                        value = defaultValue;
                    }
                }
                hash[key] = value;
            });
            return hash;
        };

    /**
     * Maps array [a1, a2, a3....] to hash {a1: true, a2: true. a3: true....}
     * Caution (Shikhar) - Care should be taken in case of duplicates in the array. These can map to same key value
     * and only one of these values would be stored.
     * @param {Array} array
     * @param {=Function} valueToKeyFunction a function that maps values in array to keys used in the returned
     *                                       hash
     * @returns {*}
     */
        me.mapArrayToBooleanHash = function (array, valueToKeyFunction) {
            if (!array) {
                return null;
            }
            if (!valueToKeyFunction) {
                valueToKeyFunction = angular.identity;
            }

            var hash = {};
            array.forEach(function (item) {
                var key = valueToKeyFunction(item);
                hash[key] = true;
            });

            return hash;
        };

    /**
     * Generate a reordering map given two position hashs
     *
     * @param srcOrder e.g. {key1: 0, key2: 1, key3: 3, key4: 2}
     * @param tgtOrder e.g. {key1: 1, key2: 0, key3: 2, key4: 3}
     * @returns {*} e.g {0:1, 1:0, 3:2, 2:3}
     */
        me.generateTranisitiveMap = function(srcMap, tgtMap) {

            return Object.keys(srcMap).reduce(function(reordering, key) {
                var srcPos = srcMap[key];
                reordering[srcPos] = tgtMap[key];
                return reordering;
            }, {});
        };

    /**
     * Reorders an array given the reordering map.
     *
     * @param items
     * @param reordering
     * @returns {Array}
     */
        me.reorderItems = function(items, reordering) {
            var newItems = [];
            items.forEach(function(item, idx) {
                var newIdx = reordering[idx];
                if(newIdx != void 0) {
                    newItems[newIdx] = item;
                }
            });

            return newItems;
        };

        function copyArrayOfArrays(arrOArr) {
            if(arrOArr.length === 0) {
                return [];
            }
            var maxDepthReached = arrOArr[0].length === undefined;
            if(maxDepthReached) {
                return arrOArr.slice();
            }

            var rv = [];
            for(var i=0; i<arrOArr.length; i++) {
                rv.push(copyArrayOfArrays(arrOArr[i]));
            }
            return rv;
        }

    /**
     * Returns an array with all possible splits of elements of __array__ into __numBuckets__ arrays.
     * Sample Input: [1, 2], 2, 0
     * Sample Output: [[[1,2],[]],[[2],[1]],[[1],[2]],[[],[1,2]],[[1],[]],[[],[1]],[[2],[]],[[],[2]],[[],[]]]
     *
     * WARNING(Handle with Care): The size of the output is exp(numBuckets, array.length). Hence the time taken by
     * the function can increase very fast.
     *
     * @param array
     * @param numBuckets
     * @param startIndex {=Number} index to start from in __array__ (defaults to 0)
     * @returns {Array}
     */
        me.getAllSplits = function(array, numBuckets, startIndex) {
            startIndex = startIndex || 0;

            if(startIndex >= array.length) {
                return [me.repeat([], numBuckets)];
            }
            var newSplits = [],
                recursiveSplits = me.getAllSplits(array, numBuckets, startIndex + 1);
            recursiveSplits.each(function(recursiveSplit){
                for(var i=0; i<numBuckets; i++) {
                    var split = copyArrayOfArrays(recursiveSplit);
                    split[i].unshift(array[startIndex]);
                    newSplits.push(split);
                }
            });
            return newSplits.concat(recursiveSplits);
        };

        me.getAllCombinationsOfSize = function (array, tupleSize) {
            var cache = {};
            var recursive = function (array, tupleSize, startIndex) {
                var cacheKey = tupleSize + ',' + startIndex;
                if (!cache.hasOwnProperty(cacheKey)) {
                    var rv;
                    if (tupleSize === 0) {
                        rv = [[]];
                    } else  if (startIndex >= array.length) {
                        rv = [];
                    } else {
                        var oneSizeLess = recursive(array, tupleSize - 1, startIndex + 1),
                            sameSize = recursive(array, tupleSize, startIndex + 1);
                        for (var j=0; j<oneSizeLess.length; j++) {
                            oneSizeLess[j].unshift(array[startIndex]);
                        }

                        rv = oneSizeLess.concat(sameSize);
                    }

                    cache[cacheKey] = copyArrayOfArrays(rv);
                }
                return cache[cacheKey];
            };

            return recursive(array, tupleSize, 0);
        };

    /**
     * Removes all the properties on the given object. Deletes only those keys for which hasOwnProperty is true
     * @param object {Object}
     */
        me.clearObject = function(object) {
            Object.keys(object).each(function(key){
                delete object[key];
            });
        };

    /**
     * Returns true iff HTML5 canvas is supported by the current browser
     */
        me.isCanvasSupported = function () {
            var canvasElement = document.createElement('canvas');
            return !!(canvasElement.getContext && canvasElement.getContext('2d'));
        };

    /**
     * Returns the number of decimal places in a number
     * @param number
     * @returns {Number}
     */
        me.countDecimals = function (value) {
            if (isNaN(value)) {
                return 0;
            }

            if ((value % 1) !== 0) {
                var parts = value.toString().split(".");
                if (parts.length < 2) {
                    return 0;
                }
                return parts[1].length;
            }
            return 0;
        };

    /**
     * For an array of numbers returns the minimum number of decimal places
     * that each number can be rounded to without causing a duplicate.
     * For example [1.234, 1.245, 1.266] => 2 (after rounding [1.23, 1.24, 1.26].
     * The returned values is capped at __maxDecimalPlaces__.
     *
     * @param {Array.<Number>} values
     * @param {Number} maxDecimalPlaces
     * @returns {Number}
     */
        me.getMinDifferentiatingPrecision = function (values, maxDecimalPlaces, minDecimalPlaces) {
            if (isNaN(minDecimalPlaces)) {
                minDecimalPlaces = 0;
            }

            if (values.length === 1) {
                return minDecimalPlaces;
            }

            values = values.compact().unique();

        // TODO (sunny): do a binary search
            for (var i=minDecimalPlaces; i<maxDecimalPlaces; i++) {
                var distinctValues = {},
                    duplicatesFound = false;
                for (var j=0; j<values.length; j++) {
                    var value = values[j],
                        roundedValue = Math.round(value * Math.pow(10, i));
                    if (Object.has(distinctValues, roundedValue)) {
                        duplicatesFound = true;
                        break;
                    }
                    distinctValues[roundedValue] = true;
                }

                if (!duplicatesFound) {
                    return i;
                }
            }
            return maxDecimalPlaces;
        };

        me.getValuesOfObject = function (hash) {
            if (!hash) {
                return [];
            }
            return Object.keys(hash).map(function (key) {
                return hash[key];
            }) || [];
        };

    /**
     * Forces a DOM node to repaint. webkit DOM changes through JS seem to fail to repaint the affected nodes
     * in certain conditions. Refer to SCAL-3925 for an example.
     * Source: http://stackoverflow.com/a/3485654
     * @param node
     */
        me.webkitForceRepaintNode = function (node) {
            var existingDisplay = node.style.display;
            node.style.display = 'none';
            var dummyVarForeslint = node.offsetHeight;
            node.style.display = existingDisplay;
        };

    /**
     * A cache with TTL of one event loop. It can be useful to cache values that are known to
     * stay constant in a given event loop
     * @param valueGenerator A function that returns the value to be cached
     * @constructor
     */
        me.EventLoopCache = function (valueGenerator) {
            var defaultInitValue = function() {},
                value = defaultInitValue;

            this.get = function () {
                if (value === defaultInitValue) {
                    $timeout(function(){
                        value = defaultInitValue;
                    }, 0, false);
                    value = valueGenerator();
                }
                return value;
            };
        };

        me.getLocationOrigin = function (context) {
            context = context || window;
            if (!context.location) {
                _logger.error('Can not find location origin of a context without location property');
                _logger.debug(context);
                return;
            }

            if (context.location && context.location.origin) {
                return context.location.origin;
            }

            return context.location.protocol + "//" +
            context.location.hostname + (context.location.port ? ':' + context.location.port: '');
        };

        function isSameAsMainAppWindow(inputWindow) {
        // We are in top level app window if either we are the top window or the parent window is non-blink app.
        // We check for the presence of blink property on the frame, if the parent frame is non-blink, it will not have
        // that property (assumption of a property name). If the parent frame is in a different domain, then accessing
        // the property will throw an error.
            if (inputWindow === inputWindow.parent) {
                return true;
            }
            try {
                var isBlinkFrame = !!inputWindow.parent.blink;
                return !isBlinkFrame;
            } catch (e) {
                return true;
            }
        }

    /**
     *
     * @return {number}
     */
        me.getNumAppChildFrames = function () {
            var num = 0;
            Array.prototype.each.call(window.frames, function (frame) {
            // A x-domain frame can throw an error for accessing any property (even if non-existent).
                try {
                    if (!!frame.blink) {
                        num++;
                    }
                } catch (e) {
                    _logger.log(e);
                }
            });
            return num;
        };

        me.postMessageToFrame = function (frame, message, origin) {
            origin = origin || me.getLocationOrigin();  // default is to restrict to the current window's origin.
        // A try-catch block is needed to avoid throwing an error when a target frame is in different origin.
            try {
                frame.postMessage(message, origin);
            } catch (e) {
                _logger.log(e);
            }
        };

        me.registerOneShotEventListener = function($scope, eventName, callback, deregistrationChecker) {
            var deRegisterer,
                deRegistererCopy;

            deRegisterer = $scope.$on(eventName, function(){
                if (deregistrationChecker) {
                    if (deregistrationChecker.apply(null, arguments)) {
                        deRegistererCopy = deRegisterer;
                        deRegisterer = null;
                        deRegistererCopy();

                        callback.apply(null, arguments);
                    }
                } else {
                    deRegistererCopy = deRegisterer;
                    deRegisterer = null;
                    deRegistererCopy();

                    callback.apply(null, arguments);
                }
            });

            return function () {
                if (deRegisterer) {
                    var deRegistererCopy = deRegisterer;
                    deRegisterer = null;
                    deRegistererCopy();
                }
            };
        };

    /**
     * Retuns the smallest element of the array. If the comparator is not defined elements are compared using the native
     * < operator
     * @param array
     * @param comparator a standard object comparator (like the one used by Array.prototype.sort)
     * @returns {*}
     */
        me.minOfArray = function (array, comparator) {
            if (array.length === 0) {
                return null;
            }

            var min = array[0];
            array.forEach(function(elem, index){
                if (index === 0) {
                    return;
                }

                if (comparator) {
                    if (comparator(min, elem) > 0) {
                        min = elem;
                    }
                } else {
                    if (elem < min) {
                        min = elem;
                    }
                }
            });
            return min;
        };

    /**
     * Joins and array of names into a particular UI suitable format (refer to the examples below)
     * Examples:
     * ['Mahesh', 'Suresh'] => 'Mahesh and Suresh'
     * ['Mahesh', 'Suresh', 'Ramesh'] => 'Mahesh, Suresh and Ramesh'
     * ['Mahesh', 'Suresh', 'Ramesh'], maxIncluded = 2 => 'Mahesh, Suresh and 1 more'
     * ['Mahesh', 'Suresh', 'Ramesh'], maxIncluded = 2, entityName = 'person' => 'Mahesh, Suresh and 1 more person'
     * ['Mahesh', 'Suresh', 'Ramesh', 'Ganesh'], maxIncluded = 2, entityName = 'person' => 'Mahesh, Suresh and 2 more people'
     *
     * @param {Array}   names           The names to join
     * @param {=Number} maxIncluded     Maximum number of names to include (rest will be covered under and N more..)
     * @param {=String} entityName      The entity name to be used in case maxInclude < names.length. It is pluralized
     *                                  if the number of names not included is > 1
     * @returns {*}
     */
        me.joinNames = function (names, maxIncluded, entityName) {
            if (isNaN(maxIncluded) || maxIncluded > names.length) {
                maxIncluded = names.length;
            }

            var count = names.length;
            if (count === 0 || maxIncluded <= 0) {
                return '';
            }
            if (count === 1) {
                return names[0];
            }

            var leftOver = count - maxIncluded;
            if (leftOver === 0) {
                return '{1} and {2}'.assign(names.slice(0, count - 1).join(', '), names[count - 1]);
            } else {
                var joinedName = '{1} and {2} more'.assign(names.slice(0, maxIncluded).join(', '), leftOver);
                if (!!entityName) {
                    return '{1} {2}'.assign(joinedName, leftOver === 1 ? entityName : entityName.pluralize());
                }
                return joinedName;
            }
        };

    /**
     * Debounces the given function so that no two consecutive calls of the function will be within
     * minExecutionInterval of each other
     * @param func                      the function to debounce
     * @param minExecutionInterval      the debounce interval
     * @param context                   an object containing a timer field for the timer to be shared between multiple
     *                                  functions being debounced (e.g. this can be used to tie together debouncing
     *                                  of mouse-enter and mouse-leave events on a dom node)
     * @param applyChanges              true to apply changes when $timeout fn is processed.
     * @returns {Function}
     */
        me.debounce = function (func, minExecutionInterval, context, applyChanges) {
            if (!context) {
                context = {};
            }
            if (!Object.has(context, 'timer')) {
                context.timer = null;
            }

            return function () {
                if (context.timer) {
                    $timeout.cancel(context.timer);
                    context.timer = null;
                }
                var args = Array.prototype.slice.call(arguments),
                    self = this;
                context.timer = $timeout(function(){
                    func.apply(self, args);
                }, minExecutionInterval, !!applyChanges);
            };
        };


    // Wrapper on top of a promise to suppress the resolve/reject call if the caller cancels the promise
    /**
     * @param {Promise} promise
     * @returns {Promise}
     */
        me.cancelablePromise = function (promise) {

            Object.merge(this, promise);
            var cancelResolutions = false;

            this.cancel = function () {
                cancelResolutions = true;
            };

            var self = this;
            self.then = function (resolveFn, rejectFn) {
                return new me.cancelablePromise(
                promise.then(function () {
                    if (cancelResolutions) {
                        return;
                    }

                    resolveFn.apply(self, arguments);
                }, function () {
                    if (cancelResolutions) {
                        return;
                    }

                    rejectFn.apply(self, arguments);
                })
            );
            };
        };

    /**
     * Return an array containing all the elements of arr. Elements passing the predicate function are
     * moved on top
     *
     * @param {Array.<T>} arr
     * @param {function} predicate
     * @returns {Array.<T>}
     */
        me.moveMatchingObjectsOnTopOfArray = function(array, predicate) {
            var result = me.splitMatchingObjectsOfArray(array, predicate);
            return result.matching.concat(result.nonMatching);
        };

    /**
     *
     * Same as above, but elements of array passing the predicate are put in the
     * matching field of the returned object, other elements are putted in the nonMatching field
     *
     *
     * @param arr
     * @param predicate
     * @returns {{matching: Array, nonMatching: Array}}
     */

        me.splitMatchingObjectsOfArray = function(array ,predicate) {
            var topArray = [], bottomArray = [];

            array.forEach(function(element){
                if (predicate(element)) {
                    topArray.push(element);
                } else {
                    bottomArray.push(element);
                }
            });

            return {
                matching: topArray,
                nonMatching: bottomArray
            };
        };

        me.splitArray = function (arr, splitterPredicateFunc) {
            var groups = [],
                currentGroup = [];
            Array.prototype.each.call(arr, function(item) {
                var isSplitter = splitterPredicateFunc(item);
                if (isSplitter) {
                    groups.push(currentGroup);
                    currentGroup = [];
                } else {
                    currentGroup.push(item);
                }
            });
            groups.push(currentGroup);
            return groups;
        };

    /**
     *
     * @param {string} color
     * @param {number} amt Amount by which to increment each of R,G,B value.
     * @returns {string}
     */
        me.lightenDarkenColor = function (color, amt) {
        // Normalize to hex
            color = (new $.colorpicker.Color(color)).toRGB();

            color.r = Number.prototype.clamp.call(color.r + amt, 0, 255);
            color.b = Number.prototype.clamp.call(color.b + amt, 0, 255);
            color.g = Number.prototype.clamp.call(color.g + amt, 0, 255);

            return (new $.colorpicker.Color('rgb({r}, {g}, {b})'.assign(color))).toHex();
        };

        me.getReadableTextColor = function (color) {
            color = new $.colorpicker.Color(color);
            var rgb = color.toRGB();
            var yiq = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
        // Inspiration http://www.particletree.com/notebook/calculating-color-contrast-for-legible-text/
            return (yiq >= 128) ? color.colors.black : color.colors.white;
        };

        me.executeDeferredOnPromise = function (promise, deferred) {
            promise.then(function(){
                deferred.resolve.apply(deferred, arguments);
            }, function(){
                deferred.reject.apply(deferred, arguments);
            });
        };

        me.iterateObject = function (object, callback) {
            Object.keys(object).each(function(key){
                callback(key, object[key]);
            });
        };

    /**
     * Given a map, creates a new map, mapping keys to function applied on key, value.
     *
     * @param {Object} object: Object to modified
     * @param {function} fn: Function to be applied to key, values of the Object.
     * @returns {Object}
     */
        me.mapObjectValues = function(object, fn) {
            return Object.keys(object).reduce(function(map, key) {
                map[key] = fn(key, object[key]);
                return map;
            }, {});
        };

    /**
     * Performs a binary insertion.
     *
     * @param {VALUE} value  The value to be inserted
     * @param {Array<VALUE>} array  The array to be searched.
     * @param {function} comparator Function used to compare value against array object
     * @params {number} startVal  Used internally
     * @params {number} endVal  Used internally
     *
     * @return {boolean} true if a value was inserted, false if not
     */

        me.binaryInsert = function(value, array, comparator, startVal, endVal) {
            var length = array.length;

        // Note(chab) endVal/startVal could be 0, so we don't use || syntax
            var start = startVal !== void 0 ? startVal : 0;
            var end = endVal !== void 0 ? endVal : length - 1;
            var midPoint = start + Math.floor((end - start)/2);

            if (length === 0){
                array.push(value);
                return true;
            }
            if (comparator(value, array[end]) > 0) {
                array.splice(end + 1, 0, value);
                return true;
            }
            if (comparator(value, array[start]) < 0) {
                array.splice(start, 0, value);
                return true;
            }
            if (start >= end){
                _logger.warn("was unable to perform binary insertion");
                return false;
            }
            if (comparator(value, array[midPoint]) < 0){
                return me.binaryInsert(value, array, comparator, start, midPoint - 1);

            }
            if (comparator(value, array[midPoint]) > 0){
                return me.binaryInsert(value, array, comparator, midPoint + 1, end);
            }
        // we found an equal value, so we choose to insert there
            array.splice(start, 0, value);
            return true;
        };

    /**
     * Inverts an object so that for each pair of key value, the key becomes the value
     * and the value becomes the key. Does not modify the original object, returns a
     * new one.
     * Caveats:
     * 1. The object should be a 1-1 map. If it is not the last key for a value is used as the value for the value
     * 2. The values will be stringified to make them valid object keys
     * @param object
     */
        me.invertObject = function (object) {
            var rv = {};
            me.iterateObject(object, function(key, value){
                if (Object.has(rv, value)) {
                    _logger.warn('invertObject: object is not a 1-1 map, offending value:', value);
                }
                rv[value] = key;
            });
            return rv;
        };

        me.getObjectKeysWithValue = function (object, value) {
            return Object.keys(object).filter(function(key){
                return object[key] === value;
            });
        };

        me.parseUrl = function (url) {
            var PROPERTIES = ['protocol', 'hostname', 'port', 'pathname', 'search', 'hash', 'host'];

            var $parserLink = $('#bk-url-parser');
            if ($parserLink.length === 0) {
                $parserLink = $('<a id="bk-url-parser"></a>');
                $('body').append($parserLink);
            }
            var parserLink = $parserLink[0];
            parserLink.href = url;

            var components = {};
            PROPERTIES.each(function(prop){
                components[prop] = parserLink[prop];
            });
            return components;
        };

        me.findFromLast = function (array, predicate) {
            var lastIndex = me.findIndexFromLast(array, predicate);
            if (lastIndex < 0) {
                return void 0;
            }
            return array[lastIndex];
        };

        me.findIndexFromLast = function (array, predicate) {
            var predicateIsFunction = Object.isFunction(predicate);
            for (var i=array.length - 1; i >= 0; i--) {
            // TODO (sunny): this will prevent searching for functions in an
            // array of functions
                if (predicateIsFunction) {
                    if (predicate(array[i])) {
                        return i;
                    }
                } else {
                    if (array[i] === predicate) {
                        return i;
                    }
                }
            }
            return -1;
        };

    /**
     * A helper method for asyncEach() that is called on each element.
     * The method is a recursive iterator on the the array.
     *
     * @param {Object} params
     *
     * @param {Deferred} params.finalDeferred The promise object to resolve when terminating the iteration.
     *
     * @param {Function} params.promiseFn The callback to call on each element of the array. It must
     *     return a promise that either resolves or rejects based on the caller criterion.
     *     The rejection handler can be passed in an object with a boolean property 'canContinue' that
     *     tells the iterator to continue forward while ignoring the rejection.
     *     The function itself must implement following signature:
     *     promiseFn(i_th_Element, i, resolvedValueSofar),
     *     where i is the current element index we are iterating on and resolvedValueSoFar is the cumulative result
     *     of calling promiseFn so far. The first call to promiseFn always passes null for the resolvedValueSofar.
     *
     * @param {Array} params.array The array to iterate on.
     *
     * @param {Object} resolvedValueSoFar The cumulative result of calling promiseFn() till i-th element of an array.
     *
     * @param {number} i The current array element index that we are iterating on.
     *
     */
        function recursiveAsyncProcessor(params, resolvedValueSoFar, i) {
            var finalDeferred = params.finalDeferred,
                promiseFn = params.promiseFn,
                array = params.array;
            if (i < 0 || i >= array.length) {
                finalDeferred.resolve(resolvedValueSoFar);
                return;
            }

            promiseFn(array[i], i, resolvedValueSoFar).then(function (newResolvedValue) {
                recursiveAsyncProcessor(params, newResolvedValue, i + 1);
            }, function (e) {
                if (e.canContinue) {
                    recursiveAsyncProcessor(params, resolvedValueSoFar, i + 1);
                } else {
                    finalDeferred.reject({
                        resolvedValueSoFar: resolvedValueSoFar,
                        rejectionReason: e
                    });
                }
            });
        }

        me.createDeferred = function () {
            return $q.defer();
        };

        me.asyncEach = function (array, promiseFn) {
            if (!array.length) {
                return $q.when(null);
            }

            var deferred = $q.defer();
            recursiveAsyncProcessor({
                promiseFn: promiseFn,
                finalDeferred: deferred,
                array: array
            }, null /* resolvedValueSoFar */, 0);
            return deferred.promise;
        };

        me.isClickOutside = function ($element, $event) {
            return !$element.is($event.target) && $element.has($event.target).length === 0;
        };

    /**
     * Returns true iff the given aggregation type converts
     * a value into a whole number. For example
     * Unique Count of a percent column is a whole
     * number.
     * @param {util.aggregateTypes} aggrType
     * @returns {boolean}
     */
        me.isWholeNumberAggregation = function (aggrType) {
            return aggrType === me.aggregateTypes.UNIQUE_COUNT
            || aggrType === me.aggregateTypes.TOTAL_COUNT;
        };

    /**
     * Returns true iff the given aggregation type converts
     * a value into a double (with the same dimension or otherwise).
     * For example average of a INT64 revenue column is a double
     * column.
     * @param {util.aggregateTypes} aggrType
     * @returns {boolean}
     */
        me.isDoubleNumberAggregation = function (aggrType) {
            return aggrType === me.aggregateTypes.VARIANCE
            || aggrType === me.aggregateTypes.STD_DEVIATION
            || aggrType === me.aggregateTypes.AVG;
        };

    /**
     * Returns true iff the aggregation converts a column
     * value into a dimensionless number.
     * @param aggrType
     * @returns {boolean}
     */
        me.isDimensionlessAggregationType = function (aggrType) {
            return aggrType === me.aggregateTypes.UNIQUE_COUNT
            || aggrType === me.aggregateTypes.TOTAL_COUNT
            || aggrType === me.aggregateTypes.VARIANCE;
        };

    /**
     * @returns {Array.<util.aggregateTypes>}
     */
        me.getSupportedAggregationTypes = function (
        aggregateType,
        isDateColumn,
        isMeasure,
        isAttribute,
        isAdditiveNumeric,
        isAggregated,
        isGrowth
    ) {
            var at = me.aggregateTypes;

            if (isDateColumn) {
                if (isGrowth) {
                    return [];
                }

            //not aggregated
                if (!isAggregated) {
                    return [
                        at.TOTAL_COUNT,
                        at.UNIQUE_COUNT,
                        at.MIN,
                        at.MAX
                    ];
                }

            //aggregated
                if ([at.TOTAL_COUNT].some(aggregateType)) {
                    return [
                        at.SUM,
                        at.AVG,
                        at.STD_DEVIATION,
                        at.VARIANCE,
                        at.MIN,
                        at.MAX
                    ];
                }

                if ([at.UNIQUE_COUNT].some(aggregateType)) {
                    return [
                        at.AVG,
                        at.STD_DEVIATION,
                        at.VARIANCE,
                        at.MIN,
                        at.MAX
                    ];
                }

                if ([at.MIN, at.MAX].some(aggregateType)) {
                    return [
                        at.MIN,
                        at.MAX
                    ];
                }

                return [];
            }

            if (isMeasure || isAdditiveNumeric) {
                if(isGrowth) {
                    return [
                        at.MIN,
                        at.MAX
                    ];
                }

            //not aggregated
                if (!isAggregated) {
                    return [
                        at.SUM,
                        at.AVG,
                        at.STD_DEVIATION,
                        at.VARIANCE,
                        at.TOTAL_COUNT,
                        at.UNIQUE_COUNT,
                        at.MIN,
                        at.MAX
                    ];
                }

            //aggregated
                if ([at.SUM, at.TOTAL_COUNT].some(aggregateType)) {
                    return [
                        at.SUM,
                        at.AVG,
                        at.STD_DEVIATION,
                        at.VARIANCE,
                        at.MIN,
                        at.MAX
                    ];
                }

                if ([at.UNIQUE_COUNT, at.MIN, at.MAX].some(aggregateType)) {
                    return [
                        at.AVG,
                        at.STD_DEVIATION,
                        at.VARIANCE,
                        at.MIN,
                        at.MAX
                    ];
                }

                return [
                    at.MIN,
                    at.MAX
                ];
            } else if (isAttribute) {
                if(isGrowth) {
                    return [];
                }

            //not aggregated
                if (!isAggregated) {
                    return [
                        at.TOTAL_COUNT,
                        at.UNIQUE_COUNT
                    ];
                }

            //aggregated
                if ([at.TOTAL_COUNT].some(aggregateType)) {
                    return [
                        at.SUM,
                        at.AVG,
                        at.STD_DEVIATION,
                        at.VARIANCE,
                        at.MIN,
                        at.MAX
                    ];
                }

                if ([at.UNIQUE_COUNT].some(aggregateType)) {
                    return [
                        at.AVG,
                        at.STD_DEVIATION,
                        at.VARIANCE,
                        at.MIN,
                        at.MAX
                    ];
                }

                if([at.MIN, at.MAX].some(aggregateType)) {
                    return [
                        at.MIN,
                        at.MAX
                    ];
                }
            }

            return [];
        };

        me.findFromEnd = function (array, predicateFunction) {
            for (var i=array.length - 1; i >=0; i--) {
                var value = array[i];
                if (predicateFunction(value)) {
                    return value;
                }
            }
            return void 0;
        };

    /**
     * A function which polls the `waitCondition` function every `interval` milliseconds till either the
     * `waitCondition` returns true or the `timeout` milliseconds pass. It returns a promise which is resolved if the
     * `waitCondition` returns true and rejected if timeout occurs.
     * @param {Function} waitCondition
     * @param {int} interval
     * @param {int} timeout
     * @return {Promise}
     */
        me.waitFor = function(waitCondition, interval, timeout) {
            var def = $q.defer();
            $timeout(function() {
                if (timeout <= 0) {
                    def.reject();
                } else {
                    if (waitCondition()) {
                        def.resolve();
                    } else {
                        me.waitFor(waitCondition, interval, timeout - interval).then(function() {
                            def.resolve();
                        }, function() {
                            def.reject();
                        });
                    }
                }
            }, interval);

            return def.promise;
        };

        me.NameValuePairs = function(defaultMap) {
            var nameValues = defaultMap || [];

            this.add = function(name, value) {
                nameValues.add({
                    name: name,
                    value: value
                });
            };

            this.getTemplate = function() {
                var template = '<div>';
                var templateLine = '<div class="bk-tooltip"><span class="bk-tooltip-key">{1}: </span><span class="bk-tooltip-value">{2}</span></div>';
                nameValues.forEach(function (item){
                    if (!!item.name && !!item.value) {
                        template += templateLine.assign(item.name.escapeHTML(), item.value.escapeHTML());
                    }
                });
                template += '</div>';
                return template;
            };
        };

    /**
     * Inherit the prototype methods from one constructor into another.
     *
     * Shamelessly copied from NodeJS (https://github.com/joyent/node/blob/master/lib/util.js)
     *
     * @param {function} ctor Constructor function which needs to inherit the
     *     prototype.
     * @param {function} superCtor Constructor function to inherit prototype from.
     */
        me.inherits = function(ctor, superCtor) {
            ctor.__super = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
                constructor: {
                    value: ctor,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
        };

        me.getAverageColor = function (colors) {
            var rgba = [0, 0, 0, 0];
            if (colors && colors.length > 0) {
                colors.each(function(color){
                    var chromaColor = new chroma(color),
                        colorRGBA = chromaColor.rgba();

                    colorRGBA.each(function(colorComponent, colorComponentIndex){
                        rgba[colorComponentIndex] += colorComponent;
                    });
                });

                rgba = rgba.map(function(component){
                    return component/colors.length;
                });
            }

            return new chroma(rgba[0], rgba[1], rgba[2], rgba[3]).hex();
        };

        me.getMouseEventOffset = function (event) {
            var order = ['offset', 'layer'];
            if (blink.app.isFF) {
                order = ['layer', 'offset'];
            }
            for (var i = 0; i < order.length; i++) {
                var prop = order[i];
                var propX = prop + 'X', propY = prop + 'Y';
                if (propX in event) {
                    return {
                        x: event[propX],
                        y: event[propY]
                    };
                }
            }
            var target = event.target || event.srcElement,
                rect = target.getBoundingClientRect(),
                offsetX = event.clientX - rect.left,
                offsetY = event.clientY - rect.top;

            return {
                x: offsetX,
                y: offsetY
            };
        };

        me.getNestedJsonProperty = function (object, path) {
            path = path || '';

            var steps = path.split('.'),
                resolvedObject = object;

            for (var i = 0; i < steps.length; ++i) {
                var step = steps[i];
                if (!step) {
                    return resolvedObject;
                }

                if (!Object.has(resolvedObject, step)) {
                    return void 0;
                }
                resolvedObject = resolvedObject[step];
            }
            return resolvedObject;
        };

        me.arrayHasDuplicates = function (arr, keyFunction) {
            var seenKeys = {},
                keyFunctionAvailable = angular.isFunction(keyFunction);

            for (var i = 0; i < arr.length; ++i) {
                var key = keyFunctionAvailable ? keyFunction(arr[i], i) : arr[i];
                if (Object.has(seenKeys, key)) {
                    return true;
                }
                seenKeys[key] = true;
            }
            return false;
        };

        me.launchIntoFullScreen = function (element) {
            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };

    /**
     * Method to return the first N elements of an Array that satisfy the given
     * conditionFn. If we are not able to find N elements, we return with whatever was found.
     * This also works for array like objects and strings
     * @param array input array
     * @param {Number} N
     * @param {Function} [conditionFn] condition callback adheres to the standard ES fn(elem, idx, array)
     * @param {Object} [thisArg]
     * @returns {Array}
     */
        me.firstN = function(array, N, conditionFn /*, thisArg*/) {
            var arr = Object(array); // Converts primitives to wrapper Object, e.g. strings => indexed array
            var len = arr.length >>> 0; // Gracefully converts non-integer lengths to 32bit UInt
            var n = 0;

            if(typeof conditionFn !== 'function') {
                if(N < 0) {
                    N = 0;
                }
                return arr.slice(0, N);
            }

            var res = new Array(N);
            var thisArg = arguments.length >= 4 ? arguments[3] : void 0;

            for(var i = 0; n < N && i < len ; i++) {
                if(i in arr) {
                    var val = arr[i];
                    if(conditionFn.call(thisArg, val, i, arr)) {
                        res[n] = val;
                        n++;
                    }
                }
            }
            res.length = n;
            return res;
        };

    /**
     * This does the following
     * 1. Ensure string length is multiple of 4 by padding '=' at the end.
     * @param inputString
     * @returns {string}
     */
        me.normalizeBase64String = function (inputString) {
            if (!inputString) {
                return inputString;
            }

            var mismatchIndex = inputString.length % 4;
            if (mismatchIndex !== 0) {
                var stringToAppend = '';
                var numCharactersNeeded = 4 - mismatchIndex;
                for (var i = 0; i < numCharactersNeeded; i++) {
                    stringToAppend += '=';
                }
                inputString += stringToAppend;
            }

            return inputString;
        };

    /**
     * This function helps get uniformly distributed samples from a collection.
     * @param {Array} allValues
     * @param {Number} samplesCount
     * @returns {Array}
     */
        me.getSamples = function(allValues, samplesCount) {
            var sampleValues = [];
            if (allValues.length <= samplesCount) {
                sampleValues = allValues.slice();
            } else {
                var offset = Math.floor(allValues.length / samplesCount);
                var sampleIndex = 0;
                var sampleIndexInAllValues = 0;
                for (; sampleIndex < samplesCount; sampleIndex++, sampleIndexInAllValues += offset) {
                    sampleValues.push(allValues[sampleIndexInAllValues]);
                }
            }
            return sampleValues;
        };

    /**
     * This function provides capability to transform strings like 'abc'
     * to '<b>a</b>bc' when string to match is 'a'.
     * We use this function when highlight matching text in search bar in the
     * available choices.
     * @param {string} originalText
     * @param {string} stringToMatch
     * @returns {*}
     */
        me.boldMatchingText = function(originalText, stringToMatch) {
            if (!originalText || !stringToMatch) {
                return originalText;
            }

            var regex = new RegExp('(' + stringToMatch.escapeRegExp() + ')', 'gi');

            var value = originalText.replace(regex, '<b>$1</b>');

            if (!!value) {
                value = (value + '').escapeHTML();
            }
        // NOTE: When the values are escaped here. The <b> and </b> tags also get transformed
        // So we correct the effect here.

        // Transform back all the <b> tags
            regex = new RegExp('(' + '&lt;b&gt;'.escapeRegExp() + ')', 'gi');
            value = value.replace(regex,'<b>');
        // Transform back all the </b> tags
            regex = new RegExp('(' + '&lt;&#x2f;b&gt;'.escapeRegExp() + ')', 'gi');
            value = value.replace(regex,'</b>');

            return value;
        };

        me.getPluralizedMessage = function(messages, number) {

            if (messages[number]) {
                return messages[number];
            }
            return messages.n.assign(number);
        };

        /**
         * Pad a given string with leading zero to increase the string size to given desiredLength.
         * @param str
         * @param desiredLength
         * @returns {*}
         */
        me.padWithLeadingZeros = function(str, desiredLength) {
            while (str.length < desiredLength) {
                str = '0' + str;
            }
            return str;
        };

        me.trimQuotes = function(str) {
            return str.replace(/^'(.*)'$/, '$1');
        };

        /**
         * Returns a random integer in a given range (including min and max).
         * @param min
         * @param max
         * @returns {*}
         */
        me.getRandomInteger = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        /**
         * Returns a random alpha-numeric string of a given length.
         * @param len
         * @returns {string}
         */
        me.getRandomAlphaNumericString = function (len) {
            if (!me._allChars) {
                me._allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            }

            var ret = '';
            for (var i = 0; i < len; i++) {
                var index = me.getRandomInteger(0, me._allChars.length - 1);
                ret += me._allChars[index];
            }
            return ret;
        };

        /**
         * Returns a ClientRect object which maps to the overlapping object
         * of the passed in rects.
         * Note: top-left refers 0,0 and right-bottom the n,m value based on
         * size.
         * @param rect1 ClientRect 1
         * @param rect2 ClientRect 2
         * @returns {{}}
         */
        me.getOverlappingBoundingRect = function(rect1, rect2) {
            var overlap = {};
            overlap.top = Math.max(rect1.top, rect2.top);
            overlap.bottom = Math.min(rect1.bottom, rect2.bottom);
            overlap.right = Math.min(rect1.right, rect2.right);
            overlap.left = Math.max(rect1.left, rect2.left);
            overlap.height = overlap.bottom - overlap.top;
            overlap.width = overlap.right - overlap.left;
            return overlap;
        };

        me.getHoursMinutesFromEpoch = function(timeToLive) {

            this.toDays = function(timeToLive) {
                var daysCalc = Math.floor(timeToLive / (1000 * 60 * 60 * 24) % 365);
                return daysCalc;
            }

            this.toHours = function(timeToLive) {
                var hoursCalc = Math.floor(timeToLive / (1000 * 60 * 60) % 24);
                return (hoursCalc < 10) ? '0' + hoursCalc : hoursCalc;
            }

            this.toMinutes = function(timeToLive) {
                var minutesCalc = Math.floor(timeToLive / (1000 * 60) % 60);
                return (minutesCalc < 10) ? '0' + minutesCalc : minutesCalc;
            }

            var days = this.toDays(timeToLive);
            var hours = this.toHours(timeToLive);
            var minutes = this.toMinutes(timeToLive);

            return strings.expirationButton.TIME_UNTIL_EXPIRES.assign(
                days,
                hours,
                minutes
            );
        };

        return me;
    }]);

/**
 * util.truncate() exposed as a filter for convenient use in templates
 */
blink.app.filter('truncate', ['util', function (util) {
    return function (str, maxLength) {
        return util.truncate(str, maxLength);
    };
}]);

/**
 * util.formatNumber() exposed as a filter
 */
blink.app.filter('businessNumber', ['util', function(util) {
    return function (num) {
        return util.formatBusinessNumber(num);
    };
}]);

blink.app.filter('filteredOnPredicate', function () {
    return function (object, predicate) {
        var retObject = {};
        angular.forEach(object, function (subObject, key) {
            if (predicate(subObject)) {
                retObject[key] = subObject;
            }
        });

        return retObject;
    };
});

blink.app.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

/**
 * @param {sage.HighlightedString} highlightedString
 */
function doRangeHighlighting(highlightedString, optClass) {
    if (!highlightedString.highlight || highlightedString.highlight.length === 0) {
        return highlightedString.text.escapeHTML();
    }

    optClass = optClass || '';
    var format = '<span class="{1}">{2}</span>'.assign(optClass, '{1}');

    var originalText = highlightedString.text,
        highlights = highlightedString.highlight;

    //sort the ranges left to right
    highlights.sort(function(range1, range2){
        return range1.start - range2.start;
    });

    var replacedString = originalText.substring(0, highlights[0].start).escapeHTML();
    highlights.each(function(range, index){
        var substring = originalText.substr(range.start, range.size);
        replacedString += format.assign(substring.escapeHTML());

        var nextRangeStart = index === highlights.length - 1 ? originalText.length : highlights[index + 1].start;
        replacedString += originalText.substring(range.start + range.size, nextRangeStart).escapeHTML();
    });

    return replacedString;
}

blink.app.filter('blinkHighlight', function() {

    function escapeRegexp(queryToEscape) {
        return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    }

    return function(matchItem, query, optClass) {
        optClass = optClass || '';
        var foundIndex = matchItem.search(new RegExp(escapeRegexp(query), 'i'));
        if (foundIndex < 0) {
            return matchItem.escapeHTML();
        }
        return doRangeHighlighting({
            text: matchItem,
            highlight: [{
                start: foundIndex,
                size: query.length
            }]
        }, optClass);
    };
});

blink.app.filter('blinkRangeHighlight', ['$sanitize', function() {
    return doRangeHighlighting;
}]);
