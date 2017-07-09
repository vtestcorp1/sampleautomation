/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for env.js
 */

'use strict';

/* eslint camelcase: 1 */

describe('env spec', function () {
    var env;
    var mockWindow = {
        location: {
            search: '?col1=orderkey&op1=in&val1=1&val1=2&val1=3'
        }
    };

    beforeEach(function () {
        module('blink.app');

        module(function($provide) {
            $provide.value('$window', mockWindow);
        });

        inject(function ($injector) {
            env = $injector.get('env');
        });
    });

    it('should support multiple query param values', function () {
        var queryParams = env.getQueryParameters();
        var expectedParams = {col1: 'orderkey', op1: 'in', val1: ['1', '2', '3']};
        expect(Object.keys(queryParams).sort()).toEqual(Object.keys(expectedParams).sort());
        expect(queryParams['col1']).toEqual(expectedParams['col1']);
        expect(queryParams['op1']).toEqual(expectedParams['op1']);
        expect(queryParams['val1'].sort()).toEqual(expectedParams['val1'].sort());
    });
});
