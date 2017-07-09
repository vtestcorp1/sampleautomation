/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for sage util methods
 */

'use strict';
/* global addCustomMatchers*/

describe('sage util', function() {
    var sageUtil;

    beforeEach(addCustomMatchers());

    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            sageUtil = $injector.get('sageUtil');
        });
    });

    it('should have correctly working tokensToWords() function', function() {
        var token1 = sage.RecognizedToken.createUnrecognizedToken('foo'),
            token2 = sage.RecognizedToken.createUnrecognizedToken('bar baz');
        expect(sageUtil.tokensToWords([token1, token2])).toEqual(['foo', 'bar', 'baz']);
    });

    it('should have correctly working wordsToUnrecognizedTokens() function', function() {
        var token1 = sage.RecognizedToken.createUnrecognizedToken('foo'),
            token2 = sage.RecognizedToken.createUnrecognizedToken('bar');
        expect(sageUtil.wordsToUnrecognizedTokens(['foo', 'bar'])).toEqual([token1, token2]);
    });

    it('should have correctly working removeTrailingUnrecognizedEmptyTokens() function', function() {
        var token1 = sage.RecognizedToken.createMeasureToken('x'),
            token2 = sage.RecognizedToken.createMeasureToken('y'),
            token3 = sage.RecognizedToken.createMeasureToken('z'),
            token4 = sage.RecognizedToken.createUnrecognizedToken();
        var tokens = [token1, token2, token3, token4];

        sageUtil.removeTrailingUnrecognizedEmptyTokens(tokens);
        expect(tokens.length).toEqual(3);
    });

    it('should split unrecognized tokens based on input words (revenue part ame container)', function() {
        var token1 = sage.RecognizedToken.createMeasureToken('revenue'),
            token2 = sage.RecognizedToken.createMeasureToken('part name'),
            token3 = sage.RecognizedToken.createMeasureToken('container');
        var tokens = [token1, token2, token3],
            inputWords = ['revenue', 'part', 'ame', 'container'],
            transformedTokens = sageUtil.getTokensFromWords(inputWords, tokens);

        expect(transformedTokens.length).toEqual(4);
        expect(transformedTokens[0].getTypeEnum()).toEqual(2);
        expect(transformedTokens[1].getTypeEnum()).toEqual(1);
        expect(transformedTokens[1].getTokenTextLowerCase()).toEqual('part');
        expect(transformedTokens[2].getTypeEnum()).toEqual(1);
        expect(transformedTokens[2].getTokenTextLowerCase()).toEqual('ame');
        expect(transformedTokens[3].getTypeEnum()).toEqual(2);
    });

    it('should correctly transform tokens (revenue part name cont)', function() {
        var token1 = sage.RecognizedToken.createMeasureToken('revenue'),
            token2 = sage.RecognizedToken.createMeasureToken('part name'),
            token3 = sage.RecognizedToken.createUnrecognizedToken('con');
        var tokens = [token1, token2, token3],
            inputWords = ['revenue', 'part', 'name', 'cont'],
            transformedTokens = sageUtil.getTokensFromWords(inputWords, tokens);

        expect(transformedTokens.length).toEqual(3);
        expect(transformedTokens[0].getTypeEnum()).toEqual(2);
        expect(transformedTokens[1].getTypeEnum()).toEqual(2);
        expect(transformedTokens[1].getTokenTextLowerCase()).toEqual('part name');
        expect(transformedTokens[2].getTypeEnum()).toEqual(1);
        expect(transformedTokens[2].getTokenTextLowerCase()).toEqual('cont');
    });

    it('should correctly transform tokens (revenue customer address year month)', function() {
        var token1 = sage.RecognizedToken.createMeasureToken('revenue'),
            token2 = sage.RecognizedToken.createMeasureToken('customer address'),
            token3 = sage.RecognizedToken.createMeasureToken('year month'),
            token4 = sage.RecognizedToken.createUnrecognizedToken();
        var tokens = [token1, token2, token3, token4],
            inputWords = ['revenue', 'customer', 'addres', 'year', 'month', ''],
            transformedTokens = sageUtil.getTokensFromWords(inputWords, tokens);

        expect(transformedTokens.length).toEqual(5);
        expect(transformedTokens[0].getTypeEnum()).toEqual(2);
        expect(transformedTokens[1].getTypeEnum()).toEqual(1);
        expect(transformedTokens[2].getTypeEnum()).toEqual(1);
        expect(transformedTokens[2].getTokenTextLowerCase()).toEqual('addres');
        expect(transformedTokens[3].getTypeEnum()).toEqual(2);
        expect(transformedTokens[3].getTokenTextLowerCase()).toEqual('year month');
        expect(transformedTokens[4].getTypeEnum()).toEqual(1);
        expect(transformedTokens[4].getTokenText()).toEqual('');
    });

    it('should correctly transform tokens (revenue america)', function() {
        var token3 = sage.RecognizedToken.createUnrecognizedToken('revenueamerica'),
            token4 = sage.RecognizedToken.createUnrecognizedToken();
        var tokens = [token3, token4],
            inputWords = ['revenue', 'america', ''],
            transformedTokens = sageUtil.getTokensFromWords(inputWords, tokens);

        expect(transformedTokens.length).toEqual(3);
        expect(transformedTokens[0].getTypeEnum()).toEqual(1);
        expect(transformedTokens[1].getTypeEnum()).toEqual(1);
        expect(transformedTokens[1].getTokenTextLowerCase()).toEqual('america');
        expect(transformedTokens[2].getTokenText()).toEqual('');
    });

    it('should have correctly working getPixelWidthOfSageInputString() function', function () {
        expect(sageUtil.getPixelWidthOfSageInputString('foobar')).toBeGreaterThan(0);
    });

    it('should have correctly working computeGhostTokenPositions() function', function () {
        var token1 = sage.RecognizedToken.createMeasureToken('revenue'),
            token2 = sage.RecognizedToken.createMeasureToken('part name');
        var tokens = [token1, token2],
            sageInput = '   revenue    part  name ';
        sageUtil.computeGhostTokenPositions(tokens, sageInput);
        expect(tokens[0].cssProperties).toBeDefined();
        expect(tokens[1].cssProperties).toBeDefined();
    });

    function newToken(text) {
        return sage.RecognizedToken.createMeasureToken(text);
    }

    function listTokens(textList) {
        return textList.map(function (text) {
            return newToken(text);
        });
    }

    it ('test output of parseSageBarText for various cases', function () {
        var result = sageUtil.parseSageBarText('revenue country = america  africa');
        expect(result).toBeListOf(['revenue', 'country', '=', 'america', 'africa']);

        result = sageUtil.parseSageBarText('revenue country =america  africa');
        expect(result).toBeListOf(['revenue', 'country', '=', 'america', 'africa']);

        result = sageUtil.parseSageBarText('revenue country=america  africa');
        expect(result).toBeListOf(['revenue', 'country', '=', 'america', 'africa']);

        result = sageUtil.parseSageBarText('revenue>=1 country america  africa');
        expect(result).toBeListOf(['revenue', '>=', '1', 'country', 'america', 'africa']);

        result = sageUtil.parseSageBarText('revenue >=1 country america  africa');
        expect(result).toBeListOf(['revenue', '>=', '1', 'country', 'america', 'africa']);

        // The caret is placed between the two spaces between revenue and america. We expect
        // a empty blank word to be created.
        result = sageUtil.parseSageBarText('revenue  america', 8);
        expect(result).toBeListOf(['revenue', '', 'america']);

        // This time the caret is at the begining of america so we don't expect an empty token to be created between
        // revenue and america.
        result = sageUtil.parseSageBarText('revenue  america', 9);
        expect(result).toBeListOf(['revenue', 'america']);
    });

    it('should give correct suffix recognized tokens for empty cases', function () {
        var suffixObj = sageUtil.getSuffixRecognizedTokensInfo('');
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('hi', []);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // caret position after string
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('hi', ['hi'], 3);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);
    });

    it('should give correct suffix recognized tokens for various positions of spaces', function () {
        var token1 = sage.RecognizedToken.createMeasureToken('a'),
            token2 = sage.RecognizedToken.createMeasureToken('b c'),
            suffixObj;

        // In the following cases, _ = ' ' and | refers to caret position

        // a_b c|
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c', [token1, token2], 5);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a_b c_|_
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c  ', [token1, token2], 6);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a_b |c__ : edit in the middle
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c  ', [token1, token2], 4);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a|b c : 2 tokens in a single string with cursor in the middle
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('ab c', [token1, token2], 1);
        expect(suffixObj.suffixTokens.length).toBe(1);
        expect(suffixObj.suffixLen).toBe(3);
        expect(suffixObj.suffixTokens[0].getTokenTextLowerCase()).toBe('b c');

        // |ab c : 2 tokens in a single string
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('ab c', [token1, token2], 0);
        expect(suffixObj.suffixTokens.length).toBe(2);
        expect(suffixObj.suffixLen).toBe(4);
        expect(suffixObj.suffixTokens[0].getTokenTextLowerCase()).toBe('a');
        expect(suffixObj.suffixTokens[1].getTokenTextLowerCase()).toBe('b c');
    });

    it('should give correct suffix recognized tokens for various cases involving unrecognized token', function () {
        var token1 = sage.RecognizedToken.createMeasureToken('a'),
            token2 = sage.RecognizedToken.createMeasureToken('b c'),
            unrecToken1 = sage.RecognizedToken.createUnrecognizedToken('x y'),
            suffixObj;

        // In the following cases, _ = ' ' and | refers to caret position

        // a_b c_x y|
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c x', [token1, token2, unrecToken1], 9);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a_b c_x y_|_
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c x y  ', [token1, token2, unrecToken1], 10);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a_b c_x |y_ : unrecognized token at the end, no matter where caret is
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c x y ', [token1, token2, unrecToken1], 8);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a_b c_|x y_ : unrecognized token at the end, no matter where caret is
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c x y ', [token1, token2, unrecToken1], 6);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a_|b c_x y_ : unrecognized token at the end, no matter where caret is
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c x y ', [token1, token2, unrecToken1], 2);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // |a_b c_x y_ : unrecognized token at the end, no matter where caret is
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a b c x y ', [token1, token2, unrecToken1], 0);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a_x y_b |c__ : edit in the middle
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a x y b c  ', [token1, unrecToken1, token2], 8);
        expect(suffixObj.suffixTokens.length).toBe(0);
        expect(suffixObj.suffixLen).toBe(0);

        // a_x y|b c__ : unrecognized token with recognized token without space
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a x yb c  ', [token1, unrecToken1, token2], 5);
        expect(suffixObj.suffixTokens.length).toBe(1);
        expect(suffixObj.suffixLen).toBe(5);
        expect(suffixObj.suffixTokens[0].getTokenTextLowerCase()).toBe('b c');

        // a_|x y_b c
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a x y b c', [token1, unrecToken1, token2], 2);
        expect(suffixObj.suffixTokens.length).toBe(1);
        expect(suffixObj.suffixLen).toBe(3);
        expect(suffixObj.suffixTokens[0].getTokenTextLowerCase()).toBe('b c');

        // a_x y|_b c : with empty token and space
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo('a x y b c', [token1, unrecToken1, token2], 5);
        expect(suffixObj.suffixTokens.length).toBe(1);
        expect(suffixObj.suffixLen).toBe(3);
        expect(suffixObj.suffixTokens[0].getTokenTextLowerCase()).toBe('b c');

        // _|x yab c : all tokens coming together without space with recognized at the tail
        suffixObj = sageUtil.getSuffixRecognizedTokensInfo(' x yab c', [unrecToken1,  token1, token2], 1);
        expect(suffixObj.suffixTokens.length).toBe(2);
        expect(suffixObj.suffixLen).toBe(4);
        expect(suffixObj.suffixTokens[0].getTokenTextLowerCase()).toBe('a');
        expect(suffixObj.suffixTokens[1].getTokenTextLowerCase()).toBe('b c');
    });

    it('should give correct prefix recognized tokens for empty cases', function () {
        var prefixObj = sageUtil.getPrefixRecognizedTokensInfo('', []);
        expect(prefixObj.prefixTokens.length).toBe(0);
        expect(prefixObj.prefixLen).toBe(0);

        // Num suffix tokens = 1, so there cannot be any prefix
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('hi', ['hi'], 0);
        expect(prefixObj.prefixTokens.length).toBe(0);
        expect(prefixObj.prefixLen).toBe(0);
    });

    it('should give correct prefix recognized tokens for various positions of spaces', function () {
        var token1 = sage.RecognizedToken.createMeasureToken('a'),
            token2 = sage.RecognizedToken.createMeasureToken('b c'),
            prefixObj;

        // In the following cases, _ = ' ' and | refers to caret position

        // a_b c|
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a b c', [token1, token2], 5);
        expect(prefixObj.prefixTokens.length).toBe(2);
        expect(prefixObj.prefixLen).toBe(5);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');
        expect(prefixObj.prefixTokens[1].getTokenTextLowerCase()).toBe('b c');

        // a_b c_|_
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a b c  ', [token1, token2], 6);
        expect(prefixObj.prefixTokens.length).toBe(2);
        expect(prefixObj.prefixLen).toBe(5);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');
        expect(prefixObj.prefixTokens[1].getTokenTextLowerCase()).toBe('b c');

        // a_b |c__ : edit in the middle
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a b c  ', [token1, token2], 4);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // a_|b c__ : edit before token
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a b c  ', [token1, token2], 2);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // ab c| : 2 recognized tokens together
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('ab c', [token1, token2], 4);
        expect(prefixObj.prefixTokens.length).toBe(2);
        expect(prefixObj.prefixLen).toBe(4);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');
        expect(prefixObj.prefixTokens[1].getTokenTextLowerCase()).toBe('b c');

        // ab |c : 2 recognized tokens together, edit in the middle
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('ab c', [token1, token2], 3);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // a_|_b c : empty token in the middle
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a  b c', [token1, token2], 2);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // a|b c : 2 recognized tokens together
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('ab c', [token1, token2], 1);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // |a_b c : edit at the beginning
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a b c', [token1, token2], 0);
        expect(prefixObj.prefixTokens.length).toBe(0);
        expect(prefixObj.prefixLen).toBe(0);
    });

    it('should give correct prefix recognized tokens for various positions of unrecognized token', function () {
        var token1 = sage.RecognizedToken.createMeasureToken('a'),
            token2 = sage.RecognizedToken.createMeasureToken('b c'),
            unrecToken1 = sage.RecognizedToken.createUnrecognizedToken('x y'),
            prefixObj;

        // In the following cases, _ = ' ' and | refers to caret position

        // a_b c_x y|
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a b c x y', [token1, token2, unrecToken1], 9);
        expect(prefixObj.prefixTokens.length).toBe(2);
        expect(prefixObj.prefixLen).toBe(5);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');
        expect(prefixObj.prefixTokens[1].getTokenTextLowerCase()).toBe('b c');

        // ab cx y_|_ : unrec together with recognized tokens
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('ab cx y  ', [token1, token2, unrecToken1], 8);
        expect(prefixObj.prefixTokens.length).toBe(2);
        expect(prefixObj.prefixLen).toBe(4);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');
        expect(prefixObj.prefixTokens[1].getTokenTextLowerCase()).toBe('b c');

        // a_x y_|_b c__ : unrec token in the middle, caret after it
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a x y  b c  ', [token1, unrecToken1, token2], 6);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // a_x| y__b c__ : unrec token in the middle, caret in between of it
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a x y  b c  ', [token1, unrecToken1, token2], 3);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // a|_x y__b c__ : unrec token in the middle, empty before it
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('a x y  b c  ', [token1, unrecToken1, token2], 1);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // a|x yb c : unrec token in the middle along with other tokens, so spaces
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('ax yb c', [token1, unrecToken1, token2], 1);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // ax yb c| : unrec token in the middle along with other tokens
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('ax yb c', [token1, unrecToken1, token2], 7);
        expect(prefixObj.prefixTokens.length).toBe(1);
        expect(prefixObj.prefixLen).toBe(1);
        expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe('a');

        // x y_a_b c| : unrec token in the beginning, doesn't matter caret
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('x y a b c', [unrecToken1, token1, unrecToken1, token2], 9);
        expect(prefixObj.prefixTokens.length).toBe(0);
        expect(prefixObj.prefixLen).toBe(0);

        // |x y_a_b c : unrec token in the beginning, doesn't matter caret
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo('x y a b c', [unrecToken1, token1, unrecToken1, token2], 0);
        expect(prefixObj.prefixTokens.length).toBe(0);
        expect(prefixObj.prefixLen).toBe(0);

        // _|x y_a_b c : space at beginning, then unrec token in the beginning
        prefixObj = sageUtil.getPrefixRecognizedTokensInfo(' x y a b c', [unrecToken1, token1, token2], 1);
        expect(prefixObj.prefixTokens.length).toBe(0);
        expect(prefixObj.prefixLen).toBe(0);
    });

    it('should calculate the correct starting positions of tokens - respecting assumptions', function () {
        var token1 = sage.RecognizedToken.createMeasureToken('a'),
            token2 = sage.RecognizedToken.createMeasureToken('b c'),
            emptyToken1 = sage.RecognizedToken.createUnrecognizedToken(),
            unrecToken1 = sage.RecognizedToken.createUnrecognizedToken('x y');

        // empty string and Empty token
        sageUtil.setTokensPosition('', [emptyToken1], 0);
        expect(emptyToken1.startPosition).toBe(0);

        // a_|
        sageUtil.setTokensPosition('a ', [token1, emptyToken1], 2);
        expect(token1.startPosition).toBe(0);
        expect(emptyToken1.startPosition).toBe(2);

        // ax |y
        sageUtil.setTokensPosition('ax y', [token1, unrecToken1], 3);
        expect(token1.startPosition).toBe(0);
        expect(unrecToken1.startPosition).toBe(1);

        // a_b c_|x y
        sageUtil.setTokensPosition('a b c x y', [token1, token2, emptyToken1, unrecToken1], 6);
        expect(token1.startPosition).toBe(0);
        expect(token2.startPosition).toBe(2);
        expect(emptyToken1.startPosition).toBe(6);
        expect(unrecToken1.startPosition).toBe(6);

        // a_b c|_x y_
        sageUtil.setTokensPosition('a b c x y ', [token1, token2, emptyToken1, unrecToken1], 5);
        expect(token1.startPosition).toBe(0);
        expect(token2.startPosition).toBe(2);
        expect(emptyToken1.startPosition).toBe(5);
        expect(unrecToken1.startPosition).toBe(6);
    });

    it('should calculate incorrect starting positions of tokens - violating assumptions', function () {
        var token1 = sage.RecognizedToken.createMeasureToken('a'),
            token2 = sage.RecognizedToken.createMeasureToken('b c'),
            emptyToken1 = sage.RecognizedToken.createUnrecognizedToken(),
            emptyToken2 = sage.RecognizedToken.createUnrecognizedToken(),
            emptyToken3 = sage.RecognizedToken.createUnrecognizedToken(),
            unrecToken1 = sage.RecognizedToken.createUnrecognizedToken('x y');

        // The first empty token would get position = caret and other empty tokens and tokens are empty should be undefined.

        // a_b| c_x y
        sageUtil.setTokensPosition('a b c x y', [token1, emptyToken1, token2, emptyToken2, unrecToken1, emptyToken3], 3);
        expect(token1.startPosition).toBe(0);
        expect(token2.startPosition).toBe(2);
        expect(unrecToken1.startPosition).toBeUndefined();
        expect(emptyToken1.startPosition).toBe(3);
        expect(emptyToken2.startPosition).toBeUndefined();
        expect(emptyToken3.startPosition).toBeUndefined();

        // a_b| c_x y_
        sageUtil.setTokensPosition('a b c x y ', [emptyToken1, token1, token2, emptyToken2, emptyToken3, unrecToken1], 8);
        expect(token1.startPosition).toBe(0);
        expect(token2.startPosition).toBe(2);
        expect(unrecToken1.startPosition).toBeUndefined();
        expect(emptyToken1.startPosition).toBe(8);
        expect(emptyToken2.startPosition).toBeUndefined();
        expect(emptyToken3.startPosition).toBeUndefined();
    });

    describe('should give correct suffix recognized tokens for extensible token', function() {
        var token1 = sage.RecognizedToken.createMeasureToken('a'),
            unrecToken1 = sage.RecognizedToken.createUnrecognizedToken('x y'),
            extenToken = sage.RecognizedToken.createMeasureToken('10');

        extenToken.isExtensible = function () {
            return true;
        };

        var cases = [
            ['a|10 x y', [token1, extenToken, unrecToken1], 0, 0],
            ['a|10', [token1, extenToken], 0, 0],
            ['a| 10', [token1, extenToken], 1, 2, '10'],
            ['a 1|0', [token1, extenToken], 0, 0],
            ['|a 10', [token1, extenToken], 2, 4, 'a', '10'],
            // Because of caret, we would include 10
            ['|a10', [token1, extenToken], 2, 3, 'a', '10']
        ];

        cases.forEach(function (caze) {
            it(caze[0], function () {
                var suffixObj = sageUtil.getSuffixRecognizedTokensInfo(caze[0].replace('|', ''), caze[1], caze[0].indexOf('|'));

                var suffixTokensLength = suffixObj.suffixTokens.length;
                expect(suffixTokensLength).toBe(caze[2]);
                expect(suffixObj.suffixLen).toBe(caze[3]);
                if (suffixTokensLength > 0) {
                    expect(suffixObj.suffixTokens[0].getTokenTextLowerCase()).toBe(caze[4]);
                }
                if (suffixTokensLength > 1) {
                    expect(suffixObj.suffixTokens[1].getTokenTextLowerCase()).toBe(caze[5]);
                }
            });
        });
    });

    describe('should give correct prefix recognized tokens for extensible token', function() {
        var token1 = sage.RecognizedToken.createMeasureToken('a'),
            unrecToken1 = sage.RecognizedToken.createUnrecognizedToken('x y'),
            extenToken = sage.RecognizedToken.createMeasureToken('10');

        extenToken.isExtensible = function () {
            return true;
        };

        var cases = [
            ['x y|10 a', [unrecToken1, extenToken, token1], 0, 0],
            ['10|a', [extenToken, token1], 0, 0],
            ['10a|', [extenToken, token1], 0, 0],
            ['10 |a', [extenToken, token1], 1, 2, '10'],
            // Even though caret is at boundary of 10, 10 should be included in prefix because of space after 10.
            ['10| a', [extenToken, token1], 1, 2, '10'],
            ['1|0a', [extenToken, token1], 0, 0],
            // Even though caret is at boundary of 10, 10 should be included in prefix because of space after 10.
            ['a10| ', [token1, extenToken], 2, 3, 'a', '10'],
            ['a10|', [token1, extenToken], 1, 1, 'a'],
            ['a|10', [token1, extenToken], 1, 1, 'a']
        ];

        cases.forEach(function (caze) {
            it(caze[0], function () {
                var prefixObj = sageUtil.getPrefixRecognizedTokensInfo(caze[0].replace('|', ''), caze[1], caze[0].indexOf('|'));

                var prefixTokensLength = prefixObj.prefixTokens.length;
                expect(prefixTokensLength).toBe(caze[2]);
                expect(prefixObj.prefixLen).toBe(caze[3]);
                if (prefixTokensLength > 0) {
                    expect(prefixObj.prefixTokens[0].getTokenTextLowerCase()).toBe(caze[4]);
                }
                if (prefixTokensLength > 1) {
                    expect(prefixObj.prefixTokens[1].getTokenTextLowerCase()).toBe(caze[5]);
                }
            });
        });
    });

    describe('sage table request generation', function () {
        it('should generate correct view more request', function () {
            var mockSageModel = {
                tokens: [],
                completionStartPosition: 2,
                showingExactMatches: true,
                tokenUnderCaret: 10,
                caretPositionFromTokenStart: 5
            };

            var tableRequest = sageUtil.getViewMoreRequest(mockSageModel);
            // Note: This is critical value in this case and we expect it to be same as
            // the completions from previous response
            expect(tableRequest.getCurrentlyEditedToken()).toBe(2);
            // This request can be made in 2 modes exact match true/false.
            // In case its false this value is used by sage.
            expect(tableRequest.getCursorOffsetInToken()).toBe(5);
            // This is set when user unfolds a suggestion and then if user clicks view more
            // blink sends this as true to ensure only suggestions for the exact match are sent.
            expect(tableRequest.getExactMatchOnly()).toBe(true);
        });
    });


    /* eslint camelcase: 1 */
    describe('query completion pre-processing', function() {
        it('should fold query completions, when we have quotes on attribute column', function () {
            var queryCompletions = [new sage.QueryCompletion(
                {
                    num_prefix_tokens: 0,
                    query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]
                }),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "Color")]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createAttributeToken('TEST')]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createAttributeToken('TEST')]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]})
            ];
            var tableResponse = {
                getQueryCompletions: function () {
                    return queryCompletions;
                }
            };

            expect(tableResponse.getQueryCompletions().length).toBe(6);
            sageUtil.preProcessQueryCompletions(tableResponse);
            expect(tableResponse.getQueryCompletions().length).toBe(2);
        });
        it('should fold NOT fold queries, when we have the same normalized text', function () {
            var queryCompletions = [new sage.QueryCompletion(
                {
                    num_prefix_tokens: 0,
                    query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]
                }),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createAttributeToken('Color')]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]})
            ];
            var tableResponse = {
                getQueryCompletions: function () {
                    return queryCompletions;
                }
            };
            expect(tableResponse.getQueryCompletions().length).toBe(5);
            sageUtil.preProcessQueryCompletions(tableResponse);
            expect(tableResponse.getQueryCompletions().length).toBe(5);
        });
        it('it should keep quotes when normalizing column token ', function () {
            var queryCompletions = [new sage.QueryCompletion(
                {
                    num_prefix_tokens: 0,
                    query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]
                }),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createAttributeToken("'Color'")]}),
                new sage.QueryCompletion(
                    {num_prefix_tokens: 0, query: [sage.RecognizedToken.createColumnValueToken('', "'Color'")]})
            ];
            var tableResponse = {
                getQueryCompletions: function () {
                    return queryCompletions;
                }
            };
            expect(tableResponse.getQueryCompletions().length).toBe(5);
            sageUtil.preProcessQueryCompletions(tableResponse);
            expect(tableResponse.getQueryCompletions().length).toBe(2);
        });
    });
});
