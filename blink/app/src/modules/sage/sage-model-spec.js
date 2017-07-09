/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Jasmine spec for answer model
 */

'use strict';

describe('sage model:', function() {
    var SageModel, sageModel;

    var REVENUE = sage.RecognizedToken.createMeasureToken('revenue'),
        QUANTITY = sage.RecognizedToken.createMeasureToken('quantity'),
        QUANTITY_ = sage.RecognizedToken.createUnrecognizedToken('quantit'),
        COLOR = sage.RecognizedToken.createAttributeToken('color'),
        PART_ = sage.RecognizedToken.createUnrecognizedToken('part'),
        N_ = sage.RecognizedToken.createUnrecognizedToken('n'),
        SPACE = sage.RecognizedToken.createUnrecognizedToken(''),
        UNRECOGNIZED_TOKEN = sage.RecognizedToken.createUnrecognizedToken('unrecognized token'),
        EMPTY = sage.RecognizedToken.createUnrecognizedToken();

    beforeEach(function() {
        module('blink.app');
        inject(function($injector) {
            SageModel = $injector.get('SageModel');
        });
        sageModel = new SageModel();
    });

    it('should have a correctly instantiated sage model', function() {
        expect(sageModel).toEqual(jasmine.any(Object));
        expect(sageModel.tokens.length).toEqual(0);
    });

    it('should have a correctly working getCompleteSageInput() function', function() {
        sageModel.setTokens([REVENUE, QUANTITY, COLOR, UNRECOGNIZED_TOKEN, SPACE]);
        expect(sageModel.getCompleteSageInput(true)).toEqual('revenue quantity color __UNRECOGNIZED__');
        expect(sageModel.getCompleteSageInput(false)).toEqual('revenue quantity color');

        sageModel.setTokens([REVENUE, QUANTITY_, COLOR, SPACE, SPACE]);
        expect(sageModel.getCompleteSageInput(true)).toEqual('revenue __UNRECOGNIZED__ color');
        expect(sageModel.getCompleteSageInput(false)).toEqual('revenue color');
    });

    it('should have a correctly working getOnlyRecognizedTokens() function', function() {
        sageModel.setTokens([REVENUE, QUANTITY_]);
        var rTokens = sageModel.getOnlyRecognizedTokens();
        expect(rTokens.length).toBe(1);

        sageModel.tokenForUniqueCompletion = COLOR;
        rTokens = sageModel.getOnlyRecognizedTokens();
        expect(rTokens.length).toBe(2);
        expect(rTokens[1].getTokenText()).toBe('color');
    });

    it('should have a correctly working getSageInputWithUniqueCompletion() function', function() {
        sageModel.setTokens([REVENUE, QUANTITY, COLOR, SPACE, SPACE]);
        expect(sageModel.getSageInputWithUniqueCompletion()).toEqual('revenue quantity color');

        sageModel.setTokens([REVENUE, QUANTITY_, COLOR, SPACE, SPACE]);
        expect(sageModel.getSageInputWithUniqueCompletion()).toEqual('revenue');
    });

    it('should have a correctly working getCurrentPartialInput() function', function() {
        sageModel.setTokens([REVENUE, PART_, N_]);
        expect(sageModel.getCurrentPartialInput()).toEqual('part n');
    });

    it('should set the correct caret info in various cases - follows assumptions', function () {
        // no tokens
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenue quantity', [], 7);
        expect(sageModel.tokenUnderCaret).toBe(-1);
        expect(sageModel.caretPositionFromTokenStart).toBe(0);

        // Empty string but has empty token - happens when you click on the sage bar for the first time
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('', [EMPTY], 0);
        expect(sageModel.tokenUnderCaret).toBe(0);
        expect(sageModel.caretPositionFromTokenStart).toBe(0);

        // revenue|quantity - empty token in middle
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenuequantity', [REVENUE, EMPTY, QUANTITY], 7);
        expect(sageModel.tokenUnderCaret).toBe(1);
        expect(sageModel.caretPositionFromTokenStart).toBe(0);

        // revenue |quantity - empty token in middle
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenue quantity', [REVENUE, EMPTY, QUANTITY], 8);
        expect(sageModel.tokenUnderCaret).toBe(1);
        expect(sageModel.caretPositionFromTokenStart).toBe(0);

        // r|evenue quantity - empty token in middle, but first one being edited
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenue quantity', [REVENUE, EMPTY, QUANTITY], 1);
        expect(sageModel.tokenUnderCaret).toBe(0);
        expect(sageModel.caretPositionFromTokenStart).toBe(1);

        // rev|enuequantity - both tokens together, edit in first one
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenuequantity', [REVENUE, QUANTITY], 3);
        expect(sageModel.tokenUnderCaret).toBe(0);
        expect(sageModel.caretPositionFromTokenStart).toBe(3);

        // revenueq|uantity - both tokens together, edit in second one
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenuequantity', [REVENUE, QUANTITY], 8);
        expect(sageModel.tokenUnderCaret).toBe(1);
        expect(sageModel.caretPositionFromTokenStart).toBe(1);

        // revenuen|quantity - all tokens together, unrecognized token in the middle
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenuenquantity', [REVENUE, N_, QUANTITY], 8);
        expect(sageModel.tokenUnderCaret).toBe(1);
        expect(sageModel.caretPositionFromTokenStart).toBe(1);

        // revenue |quantity color - no empty token in middle, caret at beginning of recognized token
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenue quantity color', [REVENUE, QUANTITY, COLOR], 8);
        expect(sageModel.tokenUnderCaret).toBe(1);
        expect(sageModel.caretPositionFromTokenStart).toBe(0);
    });

    it('should set incorrect caret info in various cases - not follows assumptions', function () {
        // revenue| quantity color - no empty token in middle, caret not at beginning of recognized token
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenue quantity color', [REVENUE, QUANTITY, COLOR], 7);
        expect(sageModel.tokenUnderCaret).toBe(-1);
        expect(sageModel.caretPositionFromTokenStart).toBe(0);

        // revenue q|uantity color - empty token not being edited
        sageModel.setCaretInfoAndAddEmptyTokenIfNeeded('revenue quantity color', [EMPTY, REVENUE, QUANTITY, COLOR], 9);
        expect(sageModel.tokenUnderCaret).toBe(0);
        expect(sageModel.caretPositionFromTokenStart).toBe(0);
    });

    it('should ignore empty tokens in hasNonEmptyUnrecognizedTokensInTheMiddle', function(){
        sageModel.setTokens([REVENUE, UNRECOGNIZED_TOKEN, COLOR]);
        expect(sageModel.hasNonEmptyUnrecognizedTokensInTheMiddle()).toBe(true);

        sageModel.setTokens([REVENUE, SPACE, COLOR]);
        expect(sageModel.hasNonEmptyUnrecognizedTokensInTheMiddle()).toBe(false);
    });
});

/* eslint camelcase: 1 */
describe('QueryFragment', function () {
    var sageModel;
    beforeEach(function() {
        module('blink.app');
        inject(function(SageModel) {
            sageModel = new SageModel();
        });
    });

    var getTokens = function (tokens) {
        return tokens.map(function (tokenText) {
            var tokenTextSplits = tokenText.split(':');
            switch (tokenTextSplits[0].toLowerCase()) {
                case 'a':
                    return sage.RecognizedToken.createAttributeToken(tokenTextSplits[1]);
                case 'm':
                    return sage.RecognizedToken.createMeasureToken(tokenTextSplits[1]);
                case 'v':
                    return sage.RecognizedToken.createColumnValueToken(
                    tokenTextSplits[1], tokenTextSplits[2]);
                case 'k':
                    return sage.RecognizedToken.createKeywordToken(tokenTextSplits[1]);
            }
        });
    };

    var getPhrases = function(phrases) {
        return phrases.map(function (p) {
            return new sage.PhraseDefinition(p);
        });
    };

    it('should parse fragments for "revenue color"', function () {
        var tokens = getTokens(['m:revenue', 'a:color']);
        var phrases = getPhrases(
            [{
                start_index: 0,
                num_tokens: 1,
                phrase_type: sage.PhraseType.SHOW_COLUMN_PHRASE,
                is_complete_phrase: true
            }, {
                start_index: 1,
                num_tokens: 1,
                phrase_type: sage.PhraseType.SHOW_COLUMN_PHRASE,
                is_complete_phrase: true
            }]
        );
        var unparsedQF = sageModel.parseQueryFragments(tokens, phrases);

        expect(sageModel.queryFragments.length).toBe(2);

        var firstQF = sageModel.queryFragments[0],
            secondQF = sageModel.queryFragments[1];
        expect(firstQF.getFullText()).toBe('revenue');
        expect(firstQF.getDisplayText()).toBe('revenue');
        expect(firstQF.getCssClass()).toBe('bk-qf-show-column-phrase');
        expect(firstQF.isReplacable()).toBeTruthy();
        expect(firstQF.getStartCursorPosition()).toBe(0);
        expect(firstQF.getEndCursorPosition()).toBe(7);

        expect(secondQF.getFullText()).toBe('color');
        expect(secondQF.getDisplayText()).toBe('color');
        expect(secondQF.getCssClass()).toBe('bk-qf-show-column-phrase');
        expect(secondQF.isReplacable()).toBeTruthy();
        expect(secondQF.getStartCursorPosition()).toBe(8);
        expect(secondQF.getEndCursorPosition()).toBe(13);

        expect(unparsedQF.getFullText().trim()).toBe('');
    });

    it('should parse query fragments for "top 10 customer region ranked by revenue for each color"', function () {
        var tokens = getTokens([
            'k:top', 'k:10', 'a:customer region', 'k:ranked by', 'm:revenue', 'k:for each', 'a:color'
        ]);
        var phrases = getPhrases(
            [{
                start_index: 0,
                num_tokens: 5,
                phrase_type: sage.PhraseType.TOP_BOTTOM_PHRASE,
                is_complete_phrase: true
            }, {
                start_index: 5,
                num_tokens: 2,
                phrase_type: sage.PhraseType.FOR_EACH_PHRASE,
                is_complete_phrase: true
            }]
        );
        var unparsedQF = sageModel.parseQueryFragments(tokens, phrases);

        expect(sageModel.queryFragments.length).toBe(2);

        var firstQF = sageModel.queryFragments[0],
            secondQF = sageModel.queryFragments[1];
        expect(firstQF.getFullText()).toBe('top 10 customer region ranked by revenue');
        expect(firstQF.getDisplayText()).toBe(firstQF.getFullText());
        expect(firstQF.getCssClass()).toBe('bk-qf-top-bottom-phrase');
        // Since "top ..." is a multi token phrase, we can't treat it as replacable.
        expect(firstQF.isReplacable()).toBeFalsy();
        expect(firstQF.getStartCursorPosition()).toBe(0);
        expect(firstQF.getEndCursorPosition()).toBe(40);

        expect(secondQF.getFullText()).toBe('for each color');
        expect(secondQF.getDisplayText()).toBe(secondQF.getFullText());
        expect(secondQF.getCssClass()).toBe('bk-qf-for-each-phrase');
        // Even though "for each color" is a multi token phrase, we special case it to be replacable.
        expect(secondQF.isReplacable()).toBeTruthy();
        expect(secondQF.getStartCursorPosition()).toBe(49);
        expect(secondQF.getEndCursorPosition()).toBe(55);

        expect(unparsedQF.getFullText().trim()).toBe('');
    });

    it('should return no parsed phrase', function () {
        var unparsedQF = sageModel.parseQueryFragments(getTokens(['m:revenue', 'a:color']), []);

        expect(sageModel.queryFragments.length).toBe(1);
        expect(sageModel.queryFragments.last()).toBe(unparsedQF);
        expect(unparsedQF.getFullText()).toBe('revenue color');
    });

    it('should return partially parsed phrase and rest of the tokens as unparsed phrase', function () {
        var tokens = getTokens(['m:revenue', 'a:color', 'k:by', 'a:region']);
        var phrases = getPhrases(
            [{
                start_index: 0,
                num_tokens: 1,
                phrase_type: sage.PhraseType.SHOW_COLUMN_PHRASE
            }, {
                start_index: 1,
                num_tokens: 1,
                phrase_type: sage.PhraseType.SHOW_COLUMN_PHRASE
            }]
        );
        var unparsedQF = sageModel.parseQueryFragments(tokens ,phrases);

        expect(sageModel.queryFragments.length).toBe(3);
        expect(sageModel.queryFragments[0].getFullText()).toBe('revenue');
        expect(sageModel.queryFragments[1].getFullText()).toBe('color');
        expect(sageModel.queryFragments.last()).toBe(unparsedQF);
        expect(unparsedQF.getFullText()).toBe('by region');
    });

    it('should generate a truncated display text for "revenue for region asia europe africa america"', function () {
        var tokens = getTokens([
            'm:revenue', 'k:for', 'a:region', 'v:region:asia', 'v:region:europe', 'v:region:africa', 'v:region:america'
        ]);
        var phrases = getPhrases([{
            start_index: 0,
            num_tokens: 1,
            phrase_type: sage.PhraseType.SHOW_COLUMN_PHRASE
        }, {
            start_index: 1,
            num_tokens: 6,
            phrase_type: sage.PhraseType.FILTER_PHRASE
        }]
        );

        sageModel.parseQueryFragments(tokens, phrases);

        expect(sageModel.queryFragments.length).toBe(2);

        expect(sageModel.queryFragments[1].getDisplayText()).toBe('for region asia...america');
    });

    it('should generate a in-list display text for "revenue for region asia europe africa"', function () {
        var tokens = getTokens([
            'm:revenue', 'k:for', 'a:region', 'v:region:asia', 'v:region:europe', 'v:region:africa'
        ]);
        var phrases = getPhrases(
            [{
                start_index: 0,
                num_tokens: 1,
                phrase_type: sage.PhraseType.SHOW_COLUMN_PHRASE
            }, {
                start_index: 1,
                num_tokens: 6,
                phrase_type: sage.PhraseType.FILTER_PHRASE
            }]
        );
        sageModel.parseQueryFragments(tokens, phrases);

        expect(sageModel.queryFragments.length).toBe(2);

        expect(sageModel.queryFragments[1].getDisplayText()).toBe('for region asia, europe, africa');
    });
});
