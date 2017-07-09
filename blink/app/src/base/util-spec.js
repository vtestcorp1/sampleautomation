/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for util methods
 */

'use strict';

describe('util', function() {

    var util, $rootScope, $timeout, session, logger;

    /* global addCustomMatchers */
    beforeEach(addCustomMatchers());

    beforeEach(function() {
        module('blink.app');

        /* global mockLoggerInstance */
        logger = mockLoggerInstance();

        inject(function($injector) {
            util = $injector.get('util');
            $rootScope = $injector.get('$rootScope');
            $timeout = $injector.get('$timeout');
            session = $injector.get('session');
            /* global spyOnSessionTimezone */
            spyOnSessionTimezone(session);
        });
    });

    it('should have correctly working prop() and setProp() functions', function() {
        var titleText = 'Title 1',
            titleText2 = 'Title 2',
            titleText3 = 'Title 3',
            obj = {
                json: {
                    title: {
                        value: {
                            text: titleText
                        }
                    }
                }
            };

        expect(util.prop(obj, 'json.title.value.text')).toEqual(titleText);
        expect(util.prop(obj, 'json.title.value.text2')).toBeUndefined();
        expect(util.prop(obj, ['json', 'title', 'value', 'text'])).toEqual(titleText);
        expect(util.prop(obj, ['json', 'title', 'value', 'text2'])).toBeUndefined();
        // Set the title to Title 2 and check that it was set correctly
        expect(util.setProp(obj, 'json.title.value.text', titleText2)).toEqual(true);
        expect(util.prop(obj, 'json.title.value.text')).toEqual(titleText2);
        // Set the title to Title 3 and check that it was set correctly
        expect(util.setProp(obj, ['json', 'title', 'value', 'text'], titleText3)).toEqual(true);
        expect(util.prop(obj, ['json', 'title', 'value', 'text'])).toEqual(titleText3);

        var emptyObj = {};
        expect(util.prop(emptyObj, 'prop1.prop2')).toBeFalsy();
        util.setProp(emptyObj, 'prop1.prop2', 'foo');
        expect(util.prop(emptyObj, 'prop1.prop2')).toBe('foo');
        util.setProp(emptyObj, 'prop1.prop2', void 0);
        expect(util.prop(emptyObj, 'prop1.prop2')).toBe(void 0);

        util.setProp(emptyObj, 'prop1.prop2', 'foo');
        util.deleteProp(emptyObj, 'prop1.prop2');
        expect(util.prop(emptyObj, 'prop1.prop2')).toBe(void 0);
    });

    it('should have correctly working hasValue() function', function() {
        expect(util.hasValue({ a: 1, b: 2, c: 3}, 4)).toEqual(false);
        expect(util.hasValue({ a: 1, b: 2, c: 3}, 'b')).toEqual(false);
        expect(util.hasValue({ a: 1, b: 2, c: 3}, 2)).toEqual(true);
        expect(util.hasValue({ a: '1', b: '2', c: '3'}, '2')).toEqual(true);
        expect(util.hasValue({ a: '1', b: '2', c: '3'}, 2)).toEqual(false);
    });

    it('should have correctly working truncate() function', function() {
        expect(util.truncate('foobarbaz', 7)).toEqual('foobarb…');
    });

    it('should have a correctly working sortByObjectProperty() function', function() {
        var unsortedArray = [{ name: 'b' }, { name: 'c' }, { name: 'a' }],
            sortedArray = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
        expect(util.sortByObjectProperty(unsortedArray, 'name')).toEqual(sortedArray);
    });

    it('should have correctly working isEmptyOrOnlySpaces() function', function() {
        expect(util.isEmptyOrOnlySpaces(undefined)).toEqual(true);
        expect(util.isEmptyOrOnlySpaces(null)).toEqual(true);
        expect(util.isEmptyOrOnlySpaces(1)).toEqual(true);
        expect(util.isEmptyOrOnlySpaces([1,2,3])).toEqual(true);
        expect(util.isEmptyOrOnlySpaces('')).toEqual(true);
        expect(util.isEmptyOrOnlySpaces(' ')).toEqual(true);
        expect(util.isEmptyOrOnlySpaces('   ')).toEqual(true);
        expect(util.isEmptyOrOnlySpaces('0')).toEqual(false);
        expect(util.isEmptyOrOnlySpaces(' 0 ')).toEqual(false);
        expect(util.isEmptyOrOnlySpaces(' 01234 ')).toEqual(false);
    });

    it('should have correctly working isValidGuid() function', function() {
        expect(util.isValidGuid(undefined)).toEqual(false);
        expect(util.isValidGuid(null)).toEqual(false);
        expect(util.isValidGuid('')).toEqual(false);
        expect(util.isValidGuid('0')).toEqual(false);
        expect(util.isValidGuid('ea7b779-6410-44cd-bc36-7796ea771c31')).toEqual(false);
        expect(util.isValidGuid('ea7b779e-641-44cd-bc36-7796ea771c31')).toEqual(false);
        expect(util.isValidGuid('ea7b779e-6410-44d-bc36-7796ea771c31')).toEqual(false);
        expect(util.isValidGuid('ea7b779e-6410-44cd-b36-7796ea771c31')).toEqual(false);
        expect(util.isValidGuid('ea7b779e-6410-44cd-bc36-796ea771c31')).toEqual(false);
        expect(util.isValidGuid('ea7b779e-6410-44cd-bc36-7796ea771c31')).toEqual(true);
        expect(util.isValidGuid('d0e16150-6a70-4c6c-8b4b-0afc4915d752')).toEqual(true);
    });

    it('should have correctly working isPrefixArray() function', function() {
        expect(util.isPrefixArray(['sort', 'by'], ['sort', 'by'])).toBeTruthy();
        expect(util.isPrefixArray(['sort', 'byy'], ['sort', 'by'])).toBeFalsy();
    });

    it('should have correctly working isPostfixArray() function', function() {
        expect(util.isPostfixArray([], [])).toBeTruthy();
        expect(util.isPostfixArray([], ['bar'])).toBeTruthy();
        expect(util.isPostfixArray(['foo'], [])).toBeFalsy();
        expect(util.isPostfixArray(['sort', 'by'], ['foo', 'sort', 'by'])).toBeTruthy();
        expect(util.isPostfixArray(['sort', 'byy'], ['foo', 'sort', 'by'])).toBeFalsy();
    });

    it('should have correctly working isPrefix() function', function() {
        expect(util.isPrefix('foo', 'foobar')).toBeTruthy();
        expect(util.isPrefix('foo', 'foo')).toBeTruthy();
        expect(util.isPrefix('foo', 'foo', true)).toBeFalsy();
    });

    it('should have correctly working isPostfix() function', function() {
        expect(util.isPostfix('foo', 'barfoo')).toBeTruthy();
        expect(util.isPostfix('foo', 'foo')).toBeTruthy();
        expect(util.isPostfix('foo', 'foo', true)).toBeFalsy();
    });

    it('should have correctly working hasTrailingSpace() function', function() {
        expect(util.hasTrailingSpace('foo')).toBeFalsy();
        expect(util.hasTrailingSpace('foo ')).toBeTruthy();
    });

    it('should have correctly working removeSpaces() function', function() {
        expect(util.removeSpaces(' g u est ')).toBe('guest');
    });

    it('should have correctly working arrayTrimRight() function', function() {
        expect(util.arrayTrimRight(['foo', '', ''])).toEqual(['foo']);
    });

    it('should have correctly working getStringOfLength() function', function() {
        expect(util.getStringOfLength(4)).toEqual('DDDD');
    });

    it('should have correctly working getPrefixString() function', function() {
        expect(util.getPrefixString(' revenue   part  name   ', 2, false)).toEqual(' revenue   part');
        expect(util.getPrefixString(' revenue   part  name   ', 2, true)).toEqual(' revenue   part  ');
    });

    it('should have correctly working getWords() function', function() {
        expect(util.getWords('   foo     bar     ')).toEqual(['foo', 'bar']);
    });

    it('should test isValidNumber', function () {
        expect(util.isValidNumber()).toBe(false);
        expect(util.isValidNumber('')).toBe(false);
        expect(util.isValidNumber('a')).toBe(false);
        expect(util.isValidNumber(null)).toBe(false);
        expect(util.isValidNumber(10)).toBe(true);
        expect(util.isValidNumber('10')).toBe(true);
    });

    it('should test getNextMissing', function () {
        expect(util.getNextMissing([], [])).toBeFalsy();
        expect(util.getNextMissing([], [0])).toBeFalsy();
        expect(util.getNextMissing([0], [0])).toBeFalsy();
        expect(util.getNextMissing([0, 1], [0])).toBe(1);
        expect(util.getNextMissing([1, 0], [0])).toBe(1);
        expect(util.getNextMissing([0], ['0'])).toBe(0);
        expect(util.getNextMissing([0, 1, 2], [2, 1])).toBe(0);
        expect(util.getNextMissing([0, 1, 2, 3], [2, 1])).toBe(0);
    });

    it('should return readable/contrasting text color', function () {
        expect(util.getReadableTextColor('black')).toBe('#ffffff');
        expect(util.getReadableTextColor('blue')).toBe('#ffffff');
        expect(util.getReadableTextColor('red')).toBe('#ffffff');
        expect(util.getReadableTextColor('green')).toBe('#ffffff');
        expect(util.getReadableTextColor('yellow')).toBe('#000000');
    });

    it('should add leading zeros correctly', function() {
        expect(util.padWithLeadingZeros('12', 5)).toBe('00012');
        expect(util.padWithLeadingZeros('012', 5)).toBe('00012');
        expect(util.padWithLeadingZeros('123', 3)).toBe('123');
        expect(util.padWithLeadingZeros('123', 2)).toBe('123');
    });

    it('should return a random integer in a given range', function() {
        var values = {};
        for (var i = 0; i < 20; i++) {
            var num = util.getRandomInteger(10, 50);
            expect(num).toBeGreaterThanOrEqual(10);
            expect(num).toBeLessThanOrEqual(50);
            values[num] = 1;
        }
        expect(Object.keys(values).length).toBeGreaterThan(1);
    });

    describe('data label formatting', function(){
        it('should have correctly working formatBusinessNumber() function', function() {
            expect(util.formatBusinessNumber(230)).toEqual('230');
            expect(util.formatBusinessNumber(230000)).toEqual('230K');
            expect(util.formatBusinessNumber(230130000)).toEqual('230M');
            expect(util.formatBusinessNumber(230000000000)).toEqual('230B');
        });

        it('should correctly format compact scientific numbers', function(){
            expect(util.formatCompactScientificNumber('23a')).toEqual('23a');
            expect(util.formatCompactScientificNumber(230)).toEqual('230');
            expect(util.formatCompactScientificNumber(230000)).toEqual('230K');
            expect(util.formatCompactScientificNumber(230100000)).toEqual('230.1M');
            expect(util.formatCompactScientificNumber(230000000000)).toEqual('230G');
        });

        it('should be a no-op formatting for NaN', function() {
            expect(util.formatDataLabel('blue')).toBe('blue');
            expect(util.formatDataLabel('20blue')).toBe('20blue');
        });

        it('should format special cases as expected', function () {
            expect(util.formatDataLabel(['NaN'])).toBe('NaN');
            expect(util.formatDataLabel(['Infinity'])).toBe('Infinity');
            expect(util.formatDataLabel("")).toBe("{Empty}");
            expect(util.formatDataLabel("  ")).toBe("{Empty}");
            expect(util.formatDataLabel(null)).toBe('{Null}');
            expect(util.formatDataLabel(undefined)).toBe('{Null}');
            expect(util.formatDataLabel([null])).toBe('{Null}');
            expect(util.formatDataLabel([undefined])).toBe('{Null}');
        });

        it('should correctly format numbers', function(){
            expect(util.formatDataLabel(2000)).toBe('2,000');

            expect(util.formatDataLabel(2000.34, {
                isDouble: true
            })).toBe('2,000.34');

            expect(util.formatDataLabel(2000.12345,
                {formatPattern: '#.00'}
            )).toBe('2000.12');

            expect(util.formatDataLabel(0.756,
                {isPercent: true}
            )).toBe('76%');

            expect(util.formatDataLabel(0.756,
                {
                    isPercent: true,
                    isDouble: true
                }
            )).toBe('75.60%');

            expect(util.formatDataLabel(0.7568912,
                {
                    isPercent: true,
                    isDouble: true,
                    nDecimal: 3
                }
            )).toBe('75.689%');

            expect(util.formatDataLabel(100.23,
                {
                    isCurrency: true
                }
            )).toBe('$100.23');

            expect(util.formatDataLabel(100.23,
                {
                    isCurrency: true,
                    currencyCode: 'INR'
                }
            )).toBe('₹100.23');

        });

        it('should be able to shorten and apply currency code', function() {
            expect(util.formatDataLabel('1000', {
                noShorten: false
            })).toBe('1K');

            expect(util.formatDataLabel('1234', {
                noShorten: false,
                isCurrency: true,
                currencyCode: 'USD'
            })).toBe('$1.23K');
        });

        it('should be able to shorten and apply currency code in non-english locales too',
            function () {
                spyOn(util, "formatBusinessNumber").and.returnValue("1.23万");
                expect(util.formatDataLabel('12345', {
                    noShorten: false,
                    isCurrency: true,
                    currencyCode: 'GBP'
                })).toBe('£1.23万');
            });

        it('should add a space b/w currency code and number shortening symbol', function () {
            spyOn(util, "formatBusinessNumber").and.returnValue("万1.23");
            expect(util.formatDataLabel('12345', {
                noShorten: false,
                isCurrency: true,
                currencyCode: 'GBP'
            })).toBe('£ 万1.23');
        }
        );

        it('should work with non-english digit symbols too', function () {
            spyOn(util, "formatBusinessNumber").and.returnValue("१.२३ लाख");
            expect(util.formatDataLabel('1234567', {
                noShorten: false,
                isCurrency: true,
                currencyCode: 'INR'
            })).toBe('₹१.२३ लाख');
        }
        );

        it('should handle checkOnlySpecialFormat parameter', function(){
            // checkOnlySpecialFormat = undefined
            expect(util.formatDataLabel(12345, {})).toBe('12,345');

            // checkOnlySpecialFormat = false
            expect(util.formatDataLabel(12345, {
                checkOnlySpecialFormat: false
            })).toBe('12,345');

            // checkOnlySpecialFormat = true
            expect(util.formatDataLabel(12345, {
                checkOnlySpecialFormat: true
            })).toBe(12345);
        });

        it('should handle numeric strings', function(){
            expect(util.formatDataLabel('0.756', {
                isDouble: true
            })).toBe('0.76');
        });
    });

    describe('should find min of array', function(){
        var cases = [
            ['and handle empty array', [], undefined, null],
            ['and handle simple numbers', [1, 2, 3], undefined, 1],
            ['and handle mixed types', ['a', 2, 3], undefined, 'a'],
            ['and handle negative numbers', [-1, -2, -3], undefined, -3],
            ['and handle objects with comparators', [{a: 1, b: 2}, {a:2, b: 3}, {a: 1, b: 1}], function(x, y){
                if (x.a !== y.a) {
                    return x.a - y.a;
                }
                return x.b - y.b;
            }, {a:1, b: 1}]
        ];

        cases.forEach(function(caze){
            it(caze[0], function(){
                expect(util.minOfArray(caze[1], caze[2])).toEqual(caze[3]);
            });
        });
    });

    describe('should join names', function(){
        var cases = [
            ['and handle empty array', [[]], ''],
            ['and handle singleton array', [['Mahesh']], 'Mahesh'],
            ['and handle array of 2 items', [['Mahesh', 'Suresh']], 'Mahesh and Suresh'],
            ['and handle array of more than 2 items', [['Mahesh', 'Suresh', 'Ramesh']], 'Mahesh, Suresh and Ramesh'],
            ['and handle maxIncluded parameter', [['Mahesh', 'Suresh', 'Ramesh'], 2], 'Mahesh, Suresh and 1 more'],
            ['and handle entityName parameter for singular entity left over', [['Mahesh', 'Suresh', 'Ramesh'], 2, 'person'], 'Mahesh, Suresh and 1 more person'],
            ['and handle entityName parameter for plural entity left over', [['Mahesh', 'Suresh', 'Ramesh', 'Ganesh'], 2, 'person'], 'Mahesh, Suresh and 2 more people']
        ];

        cases.forEach(function(caze){
            it(caze[0], function(){
                expect(util.joinNames(caze[1][0], caze[1][1], caze[1][2])).toEqual(caze[2]);
            });
        });
    });

    describe('should compute minimum differentiating decimal precision for a set of numbers', function() {
        var cases = [
            ['single element array', [1.23], 8, 2, 2],
            ['duplicate values', [1.23, 1.23], 8, 0, 0],
            ['duplicate recurring decimals', [1/3, 1/3], 8, 0, 0],
            ['values with different last decimal values', [1.233, 1.234], 8, 0, 3],
            ['values different middle decimal values', [1.235, 1.245], 8, 0, 2],
            ['values different first decimal values', [1.234, 1.134], 8, 0, 1],
            ['non-zero minDecimals', [1.234, 1.134], 8, 2, 2],
            ['too small maxDecimals', [1.2345, 1.2346], 2, 1, 2]
        ];

        cases.forEach(function(caze){
            it('for ' + caze[0], function(){
                expect(util.getMinDifferentiatingPrecision(caze[1], caze[2], caze[3])).toEqual(caze[4]);
            });
        });
    });

    describe('asyncEach', function () {
        it ('should return for promise resolved to null for 0 length array', function () {
            var emptyAsyncEachResult = "not null";
            util.asyncEach([], angular.noop)
                .then(function(result) {
                    emptyAsyncEachResult = result;
                }
            );
            $rootScope.$apply();
            expect(emptyAsyncEachResult).toBeNull();
        });

        it('should resolve finally', function () {
            var promise = util.asyncEach([0, 1], function (element, i) {
                var d = util.createDeferred();
                util.executeInNextEventLoop(function () {
                    d.resolve();
                });
                return d.promise;
            });
            expect(promise).not.toBeNull();
            var finallyResolved = false;
            promise.then(function () {
                finallyResolved = true;
            });
            expect(finallyResolved).toBeFalsy();
            $timeout.flush();
            $rootScope.$apply();
            expect(finallyResolved).toBeTruthy();
        });

        it('should resolve finally with accumulated results', function () {
            var promise = util.asyncEach([10, 100], function (element, i, resolvedValueSoFar) {
                var d = util.createDeferred();
                util.executeInNextEventLoop(function () {
                    d.resolve(resolvedValueSoFar + element);
                });
                return d.promise;
            });
            var finallyResolvedValue = 0;
            promise.then(function (finalValue) {
                finallyResolvedValue = finalValue;
            });
            expect(finallyResolvedValue).toBe(0);
            $timeout.flush();
            $rootScope.$apply();
            expect(finallyResolvedValue).toBe(110);
        });

        it('should abort iteration at first non continuation', function () {
            var expectedError = 'Can not accumulate triple digit numbers like {1}';
            var promise = util.asyncEach([10, 20, 100], function (element, i, resolvedValueSoFar) {
                var d = util.createDeferred();
                if (('' + element).length <= 2) {
                    if (('' + element).first() !== '1') {
                        util.executeInNextEventLoop(function () {
                            d.reject({
                                canContinue: true,
                                message: 'Can not process ' + element
                            });
                        });
                    } else {
                        util.executeInNextEventLoop(function () {
                            d.resolve(resolvedValueSoFar + element);
                        });
                    }
                } else {
                    util.executeInNextEventLoop(function () {
                        d.reject(expectedError.assign(element));
                    });
                }
                return d.promise;
            });
            var finallyResolvedValue = 0, rejected = false, rejectionReason = null;
            promise.then(function (finalValue) {
                finallyResolvedValue = finalValue;
            }, function (e) {
                rejected = true;
                finallyResolvedValue = e.resolvedValueSoFar;
                rejectionReason = e.rejectionReason;
            });
            expect(finallyResolvedValue).toBe(0);
            $timeout.flush();
            $rootScope.$apply();
            expect(rejected).toBeTruthy();
            expect(rejectionReason).toBe(expectedError.assign(100));
            expect(finallyResolvedValue).toBe(10);
        });
    });

    describe('average color', function(){
        it('should return black if no color is provided', function(){
            expect(util.getAverageColor()).toBe('#000000');
        });

        it('should return the provided color if only one color is provided', function(){
            expect(util.getAverageColor(['#fec567'])).toBe('#fec567');
        });

        it('should return the average of two colors', function(){
            expect(util.getAverageColor(['#000000', '#ffffff'])).toBe('#7f7f7f');
        });
        it ('should return the average of three colors', function(){
            expect(util.getAverageColor(['#000000', '#808080', '#ffffff'])).toBe('#7f7f7f');
        });
    });

    describe('get nested json property', function(){
        it ('should return input object if path is empty', function(){
            expect(util.getNestedJsonProperty({a: 1})).toEqual({a:1});
        });
        it ('should return top level property if path is so', function(){
            expect(util.getNestedJsonProperty({a: {b: {c: 1}}}, 'a')).toEqual({b: {c: 1}});
        });
        it ('should return deeply nested object if path is valid', function(){
            expect(util.getNestedJsonProperty({a: {b: {c: 1}}}, 'a.b.c')).toEqual(1);
        });
        it ('should return undefined if the path is broken in the middle', function(){
            expect(util.getNestedJsonProperty({a: {b: {c: 1}}}, 'a.x.c')).toEqual(void 0);
        });
    });

    describe('check for duplicates in array', function(){
        it ('should work without key function', function(){
            expect(util.arrayHasDuplicates([1, 2])).toEqual(false);
            expect(util.arrayHasDuplicates([1, 2, 1])).toEqual(true);
        });
        it ('should work with key function', function(){
            expect(util.arrayHasDuplicates([1, 2], angular.identity)).toEqual(false);
            expect(util.arrayHasDuplicates([1, 2, 1], angular.identity)).toEqual(true);
            expect(util.arrayHasDuplicates([{x: 1}, {x: 2}], function(row){return row.x;})).toEqual(false);
            expect(util.arrayHasDuplicates([{x: 1}, {x: 2}, {x: 1}], function(row){return row.x;})).toEqual(true);
        });
    });

    describe('firstN elements of an array', function() {
        it('should work without conditionFn', function () {
            expect(util.firstN([1,2,3], 2)).toEqual([1,2]);
            expect(util.firstN([1,2,3], -3)).toEqual([]);
        });
        it('should work for strings', function() {
            expect(util.firstN('abcdaae', 2, function(val) {return val === 'a';})).toEqual(['a','a']);
        });
        it('should ignore holes in the array', function() {
            expect(util.firstN([1,2,,,5, 6], 2, function(val) {return val % 2 === 0;})).toEqual([2,6]);
        });
        it('should return less elements if N not found', function () {
            expect(util.firstN([1,2,3,4,5,6,7,9], 4, function(val) {return val %2 === 0;})).toEqual([2,4,6]);
        });
        it('should return N elements if more than N present', function () {
            expect(util.firstN([1,2,3,4,5,6,8,9, 10], 4, function(val) {return val %2 === 0;})).toEqual([2,4,6,8]);
        });
        it('should work when thisArg passed to the conditionFn', function() {
            expect(util.firstN([1,2,3,4,5,6,7,8, 10], 4, function(val) {
                return val % this.divisor === 0;
            }, {divisor: 2})).toEqual([2,4,6, 8]);
        });
    });

    describe('getKeySequenceDetector', function () {
        it('should match sequence without wildcards and call success cb with event', function() {
            var onSuccess = jasmine.createSpy();
            var event = {};
            var detector = util.getKeySequenceDetector(['a','b','c'], onSuccess);
            detector('a', event);
            detector('b', event);
            detector('c', event);
            expect(onSuccess).toHaveBeenCalledWith(event);
        });

        it('should match sequence with wildcards and call success cb with event', function () {
            var onSuccess = jasmine.createSpy();
            var event = {};
            var detector = util.getKeySequenceDetector(['a','b*','c'], onSuccess);
            detector('a', event);
            detector('c', event);
            expect(onSuccess).toHaveBeenCalledWith(event);

            detector('a', event);
            detector('b', event);
            detector('b', event);
            detector('c', event);
            expect(onSuccess).toHaveBeenCalledWith(event);
        });

        it('should not match invalid sequence but should continue to match the valid one', function () {
            var onSuccess = jasmine.createSpy();
            var event = {};
            var detector = util.getKeySequenceDetector(['a', 'b*', 'c'], onSuccess);
            detector('a', event);
            detector('d', event);
            expect(onSuccess).not.toHaveBeenCalled();
            detector('a', event);
            detector('c', event);
            expect(onSuccess).toHaveBeenCalledWith(event);
        });

        it('should not match invalid sequence but if the sequence breaks at the start of a potential valid one, continue', function () {
            var onSuccess = jasmine.createSpy();
            var event = {};
            var detector = util.getKeySequenceDetector(['a', 'b*', 'c'], onSuccess);
            detector('a', event);
            detector('b', event);
            detector('a', event);
            expect(onSuccess).not.toHaveBeenCalled();
            detector('c', event);
            expect(onSuccess).toHaveBeenCalledWith(event);
        });
    });

    describe('should compare arrays for equality', function(){
        var cases = [
            ['empty arrays', [], [], void 0, true],
            ['arrays of different lengths', [1], [], void 0, false],
            ['arrays of different values', [1], [2], void 0, false],
            ['without mapping function', [{'a': 1}], [{'a': 1}], void 0, false],
            ['with mapping function', [{'a': 1}], [{'a': 1}], function(o){return o.a;}, true],
            ['without type coercion', ['1'], [1], void 0, false]
        ];

        cases.forEach(function(caze){
            it('for ' + caze[0], function(){
                expect(util.areArraysEqual(caze[1], caze[2], caze[3])).toEqual(caze[4]);
            });
        });
    });

    describe('should put objects on top of array correctly', function(){

        var array = [
                {a:1, b:9},
                {a:2, b:19},
                {a:3, b:29},
                {a:4, b:39},
                {a:5, b:49},
                {a:6, b:59}
            ],
            expectedArray = [array[2], array[4], array[0], array[1], array[3], array[5]],
            returnedArray;

        beforeEach(function(){
            returnedArray = util.moveMatchingObjectsOnTopOfArray(array, function(item) {
                return  item.b == 29 || item.b == 49;
            });
        });

        it ('returned array should have same length as passed array', function (){
            expect(returnedArray.length).toEqual(array.length);
        });

        it ('elements of new array should be correctly positioned', function() {
            returnedArray.forEach(function(element, index){
                expect(element).toEqual(expectedArray[index]);
            });
        });
    });

    describe('should merge arrays correctly', function () {
        it('Should fail for non arrays', function () {
            var result = util.mergeArrayWith({a:1}, {a:2}, _.noop);
            expect(logger.error).toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should merge primitive arrays', function () {
            var result = util.mergeArrayWith([1,2,3], [4]);
            expect(result).toEqual([1,2,3,4]);
        });

        it('should merge arrays with objects', function () {
            var target = [{k1: 'v1', k2: 'v2'}, {k1: 'v3', k4: 'v4'}];
            var src = [{k1: 'v1', k2: 'w2'}, {k1: 'v3', k2: 2}, {k2:'v5'}];
            var result = util.mergeArrayWith(target, src, 'k1');
            expect(result).toEqual([{
                k1: 'v1',
                k2: 'w2'
            }, {
                k1: 'v3',
                k2: 2,
                k4: 'v4'
            }, {
                k2: 'v5'
            }]);
        });
    });

    describe('should perform a binary insert correctly', function(){

        var comparator = function(a, b) {
            if (a > b) {
                return 1;
            }
            if (a < b) {
                return -1;
            }
            return 0;
        };

        it('should add the element at the right place', function()
        {
            var a = [10, 20, 30, 90, 120, 150];
            util.binaryInsert(42 ,a, comparator);
            expect(a.length).toEqual(7);
            expect(a[3]).toEqual(42);
        });
        it('should add the element at the right place / 2', function()
        {
            var a = [10, 20, 30, 90, 120, 150];
            util.binaryInsert(-23, a, comparator);
            expect(a.length).toEqual(7);
            expect(a[0]).toEqual(-23);
        });
        it('should add the element at the right place / 3', function()
        {
            var a = [10, 20, 30, 90, 120, 150];
            util.binaryInsert(942, a, comparator);
            expect(a.length).toEqual(7);
            expect(a[a.length-1]).toEqual(942);
        });
        it('should insert element in an empty array', function()
        {
            var a = [];
            util.binaryInsert(942, a, comparator);
            expect(a.length).toEqual(1);
            expect(a[a.length-1]).toEqual(942);
        });
        it('should add the element if it is already present', function()
        {
            var a = [10, 20, 30, 42, 120];
            util.binaryInsert(42, a, comparator);
            expect(a.length).toEqual(6);
            expect(a[3]).toEqual(42);
            expect(a[4]).toEqual(42);

            a = [10, 20, 42, 120];
            util.binaryInsert(42, a, comparator);
            expect(a.length).toEqual(5);
            expect(a[2]).toEqual(42);
            expect(a[3]).toEqual(42);
        });
        it('should return true if an element was inserted', function()
        {
            var a = [10, 20, 30, 90, 120, 150];
            var success = util.binaryInsert(42, a, comparator);
            expect(success).toBeTruthy();
        });
        it('insert into an empty array', function()
        {
            var a = [];
            util.binaryInsert(42, a, comparator);
            expect(a.length).toEqual(1);
            expect(a[0]).toEqual(42);
        });
    });

    describe('should normalize base64 strings correctly',function(){

        it('default input', function() {
            var outputString = util.normalizeBase64String();
            expect(outputString).toBe(undefined);
            var outputString1 = util.normalizeBase64String('');
            expect(outputString1).toBe('');
        });

        it('string that doesnt need normaliation', function() {
            var inputString = 'abcd';
            var outputString = util.normalizeBase64String(inputString);
            expect(outputString).toBe(inputString);
        });

        it('string that needs normalization', function() {
            var inputString = 'abc';
            var expectedOutput = 'abc=';
            var outputString = util.normalizeBase64String(inputString);
            expect(outputString).toBe(expectedOutput);
        });
    });

    describe('largestNumberSmallerThan and smallestNumberLargerThan', function() {
        it('should find such element correctly', function() {
            var array = [1, 5, 20];
            var number = 7;
            var expectedOutput = 5;
            var output = util.getLargestNumberSmallerThan(array, number);
            expect(output).toBe(expectedOutput);

            expectedOutput = 20;
            output = util.getSmallestNumberLargerThan(array, number);
            expect(output).toBe(expectedOutput);
        });

        it('should return void in case of no such number exists', function() {
            var array = [15, 25];
            var number = 7;
            var output = util.getLargestNumberSmallerThan(array, number);
            expect(output).toBeUndefined();

            array = [1, 3];
            output = util.getSmallestNumberLargerThan(array, number);
            expect(output).toBeUndefined();
        });
    });

    describe('contains', function() {
        it('should works for value', function() {
            var array = [ 'a', 1234, 'b', 456];
            expect(util.contains(array, 'a')).toBe(true);
            expect(util.contains(array, '456')).toBe(false);
            expect(util.contains(array, 456)).toBe(true);
        });

        it('should works with object', function() {
            var a = {a: 1};
            var b = {b: 2};
            var c = {c: 3};
            var array = [a, b, c];
            expect(util.contains(array, a)).toBe(true);
            expect(util.contains(array, {a: 15})).toBe(false);
        });

    })

    describe('trim quotes', function() {
        it('should left string untouched', function() {
            var test = "I am a test";
            expect(util.trimQuotes(test)).toBe(test);

        });

        it('should remove trailing/leading quotes', function() {
            var test = "'I am a test'";
            expect(util.trimQuotes(test)).toBe("I am a test");
        });

        it('should not remove quotes in between', function() {
            var test = "'I am 'a' test'";
            expect(util.trimQuotes(test)).toBe("I am 'a' test");
            test = "I am 'a' test";
            expect(util.trimQuotes(test)).toBe("I am 'a' test");
        });
    });
});
