/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Support for global environment flags that can be overridden by query params in url.
 */

'use strict';

/* eslint camelcase: 1 */
var flags = {
    __test__: {
        queryParams: Object.fromQueryString(window.location.search.substr(1))
    }
};

(function () {

    function convertToType(value, type) {
        switch (type) {
            case 'string':
                if (value === void 0 || value === null) {
                    return value;
                }
                return '' + value;
            case 'number':
                return parseInt(value, 10);
            case 'boolean':
                if (value === 'true') {
                    return true;
                } else if (value === 'false') {
                    return false;
                }
                return !!value;
        }

        return null;
    }

    function Flag(name, type, description, defaultValue) {
        this.getName = function () {
            return name;
        };

        var emptySpaces = ' '.repeat(name.length);
        this.getEmptySpaces = function () {
            return emptySpaces;
        };

        var paddingLength = 30 - name.length,
            paddingString = '';
        if (paddingLength > 0) {
            paddingString = ' '.repeat(paddingLength);
        }
        this.getPadding = function () {
            return paddingString;
        };

        this.getType = function () {
            return type;
        };

        this.getDescription = function () {
            return description;
        };

        defaultValue = convertToType(defaultValue, type);
        this.getDefaultValue = function () {
            if (type !== 'string') {
                return defaultValue;
            }

            return '"' + defaultValue + '"';
        };

        var explicitValue, overrideFromUrl, overrideFromRelease;

        var queryParams = flags.__test__.queryParams;
        if (queryParams.hasOwnProperty(name)) {
            overrideFromUrl = convertToType(queryParams[name], type);
        }

        // A flag value is processed in following order:
        // 1. Value explicitly set (using setValue() )
        // 2. Url override (using '&flag=value'
        // 3. Release flags json override (using setReleaseOverride(). See flag-setter.tpl.js)
        // 4. Default value.
        this.getValue = function () {
            if (explicitValue !== undefined) {
                return explicitValue;
            }

            if (overrideFromUrl !== undefined) {
                return overrideFromUrl;
            }

            if (overrideFromRelease !== undefined) {
                return overrideFromRelease;
            }

            return defaultValue;
        };

        this.setValue = function (newValue) {
            explicitValue = convertToType(newValue, type);
        };

        this.setReleaseOverride = function (newValue) {
            overrideFromRelease = convertToType(newValue, type);
        };
    }

    var _flags = {};
    flags.help = function () {
        var helpString = 'Available flags:\n\n';
        helpString += 'Flag                            Description\n';
        for (var name in _flags) {
            if (_flags[name]) {
                var flag = _flags[name];
                helpString += '\n{1} {2} {3}\n{4} {5} (default: {6})'.assign(
                    flag.getName(),
                    flag.getPadding(),
                    flag.getDescription(),
                    flag.getEmptySpaces(),
                    flag.getPadding(),
                    flag.getDefaultValue()
                );
            }
        }

        helpString += '\n\nFlag can be overridden using url query parameter or using flags-override.json.';
        console.log(helpString);
    };

    flags.getValue = function (flagName) {
        if (!_flags.hasOwnProperty(flagName)) {
            return null;
        }

        return _flags[flagName].getValue();
    };

    flags.setValue = function (flagName, flagValue) {
        if (!_flags.hasOwnProperty(flagName)) {
            return;
        }

        return _flags[flagName].setValue(flagValue);
    };

    flags.setReleaseOverride = function (flagName, flagValue) {
        if (!_flags.hasOwnProperty(flagName)) {
            return;
        }

        return _flags[flagName].setReleaseOverride(flagValue);
    };

    function createAndAddFlag(name, type, description, defaultValue) {
        _flags[name] = new Flag(name, type, description, defaultValue);
    }

    window.addStringFlag = function (name, description, defaultValue) {
        createAndAddFlag(name, 'string', description, defaultValue);
    };

    window.addNumberFlag = function (name, description, defaultValue) {
        createAndAddFlag(name, 'number', description, defaultValue);
    };

    window.addBooleanFlag = function (name, description, defaultValue) {
        createAndAddFlag(name, 'boolean', description, defaultValue);
    };
})();

var addBooleanFlag = window.addBooleanFlag;
var addNumberFlag = window.addNumberFlag;
var addStringFlag = window.addStringFlag;

addBooleanFlag('sampleBooleanFlag', 'This flag is a noop and only to demonstrate usage of blink flags', false);
addNumberFlag('sampleNumberFlag', 'This flag is a noop and only to demonstrate usage of blink flags', 100);
addStringFlag('sampleStringFlag', 'This flag is a noop and only to demonstrate usage of blink flags', 'sampleValue');
