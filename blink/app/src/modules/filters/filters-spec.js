/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Tests for custom filters
 */

'use strict';

describe('Blink Filters', function () {

    var searchResultHighlightFilter;

    beforeEach(function () {
        module('blink.filters');

        /* eslint camelcase: 1 */
        inject(function(_searchResultHighlightFilter_) {
            searchResultHighlightFilter = _searchResultHighlightFilter_;
        });
    });

    it('should highlight matching text', function(){
        expect(searchResultHighlightFilter('abc', 'b')).toBe('a<span class="bk-filtered-match">b</span>c');
    });

    it('should highlight matching text regardless of case', function(){
        expect(searchResultHighlightFilter('aBc', 'b')).toBe('a<span class="bk-filtered-match">B</span>c');
    });

    it('should highlight nothing if there is no match', function(){
        expect(searchResultHighlightFilter('aBc', 'd')).toBe('aBc');
    });

    it('should handle special characters', function(){
        expect(searchResultHighlightFilter('a(bc', '(')).toBe('a<span class="bk-filtered-match">(</span>bc');
        expect(searchResultHighlightFilter('a<Bc', '<b')).toBe('a<span class="bk-filtered-match"><B</span>c');
    });
});
