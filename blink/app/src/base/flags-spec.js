/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for flags.js
 */

'use strict';

/* global flags */
/* global addBooleanFlag */
/* global addNumberFlag */
/* global addStringFlag */
/* eslint camelcase: 1 */
describe('addBooleanFlag', function () {
    it('should add a boolean flag with a default value of false', function () {
        addBooleanFlag('booleanFlag1', 'description', false);
        expect(flags.getValue('booleanFlag1')).toBe(false);
    });

    it('should add a boolean flag with a default value of true', function () {
        addBooleanFlag('booleanFlag2', 'description', true);
        expect(flags.getValue('booleanFlag2')).toBe(true);
    });

    it('should add a boolean flag with converted default value', function () {
        addBooleanFlag('booleanFlag3', 'description', null);
        expect(flags.getValue('booleanFlag3')).toBe(false);

        addBooleanFlag('booleanFlag4', 'description', 'false');
        expect(flags.getValue('booleanFlag4')).toBe(false);

        addBooleanFlag('booleanFlag5', 'description', 'true');
        expect(flags.getValue('booleanFlag5')).toBe(true);

        addBooleanFlag('booleanFlag6', 'description', 'garbage');
        expect(flags.getValue('booleanFlag6')).toBe(true);
    });
});

describe('addNumberFlag', function () {
    it('should add a number flag with a default value of 0', function () {
        addNumberFlag('numberFlag1', 'description', 0);
        expect(flags.getValue('numberFlag1')).toBe(0);
    });

    it('should add a number flag with a default value of non-zero', function () {
        addNumberFlag('numberFlag2', 'description', 1);
        expect(flags.getValue('numberFlag2')).toBe(1);
    });

    it('should add a number flag with default value of NaN when not a number', function () {
        addNumberFlag('numberFlag3', 'description', 'NotANumber');
        expect(isNaN(flags.getValue('numberFlag3'))).toBeTruthy();
    });

    it('should add a number flag with good value when a correct string is passed', function () {
        addNumberFlag('numberFlag4', 'description', '100');
        expect(isNaN(flags.getValue('numberFlag4'))).toBeFalsy();
        expect(flags.getValue('numberFlag4')).toBe(100);
    });
});

describe('addStringFlag', function () {
    it('should add a string flag with a real string default', function () {
        addStringFlag('stringFlag1', 'description', 'string');
        expect(flags.getValue('stringFlag1')).toBe('string');
    });

    it('should add a string flag with a non-string default', function () {
        addStringFlag('stringFlag2', 'description', 1);
        expect(flags.getValue('stringFlag2')).toBe('1');
    });

    it('should add a string flag with converted default value', function () {
        addStringFlag('stringFlag3', 'description', null);
        expect(flags.getValue('stringFlag3')).toBe(null);

        addStringFlag('stringFlag4', 'description');
        expect(flags.getValue('stringFlag4')).toBe(void 0);
    });
});

describe('flags.getValue()', function () {
    it ('should return default value when no override available', function () {
        addStringFlag('noOverrideFlag', 'description', 'defaultValue');
        expect(flags.getValue('noOverrideFlag')).toBe('defaultValue');
    });

    it('should return release override value when set', function () {
        addStringFlag('flagWithReleaseOverride', 'description', 'defaultValue');
        flags.setReleaseOverride('flagWithReleaseOverride', 'releaseOverrideValue');
        expect(flags.getValue('flagWithReleaseOverride')).toBe('releaseOverrideValue');
    });

    it('should return url value even when release override value is set', function () {
        flags.__test__.queryParams = {
            flagWithUrlOverrideValue: 'urlOverrideValue'
        };
        addStringFlag('flagWithUrlOverrideValue', 'description', 'defaultValue');
        flags.setReleaseOverride('flagWithUrlOverrideValue', 'releaseOverrideValue');
        expect(flags.getValue('flagWithUrlOverrideValue')).toBe('urlOverrideValue');
    });

    it('should return explicit value even when overrides are set', function () {
        flags.__test__.queryParams = {
            flagWithExplicitValue: 'urlOverrideValue'
        };
        addStringFlag('flagWithExplicitValue', 'description', 'defaultValue');
        flags.setReleaseOverride('flagWithExplicitValue', 'releaseOverrideValue');
        flags.setValue('flagWithExplicitValue', 'explicitValue');
        expect(flags.getValue('flagWithExplicitValue')).toBe('explicitValue');

    });
});

describe('flags.help()', function () {
    it('should generate a help message', function () {
        addStringFlag('helpMessageFlag', 'description', 'helpFlagValue');

        console.log = jasmine.createSpy("log");
        flags.help();
        expect(console.log.calls.mostRecent().args[0]).toMatch(/(default: "helpFlagValue")/);
    });
});
