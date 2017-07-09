/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview QueryFragment class that encapsulates the sage response phrase definition and ui logic.
 */

'use strict';

blink.app.factory('QueryFragment', ['util', 'Logger', function (util, Logger) {
    var _logger = Logger.create('query-fragment');

    /**
     *
     * @param {Array.<sage.RecognizedToken>} queryTokens List of tokens in the sage bar.
     * @param {sage.PhraseDefinition} phrase
     * @constructor
     */
    function QueryFragment(queryTokens, phrase) {
        /**
         *
         * @type {Array.<sage.RecognizedToken>}
         * @private
         */
        this._queryTokens = queryTokens;

        /**
         * @type {number}
         * @private
         */
        this._startTokenPos = phrase.getStartIndex();

        /**
         * @type {number}
         * @private
         */
        this._numTokens = phrase.getNumTokens();

        /**
         * @type {sage.PhraseType}
         * @private
         */
        this._type = phrase.getPhraseType();

        /**
         * @type {boolean}
         * @private
         */
        this._isComplete = phrase.isCompletePhrase();

        /**
         * @type {Array.<sage.RecognizedToken>}
         * @private
         */
        this._fragmentTokens = this.getFragmentTokensCopy();

        this._computeFullText();
        this._computeCursorPositions();
        this._computeIsReplacable();
        this._computeDisplayText();
    }

    /**
     *
     * @private
     */
    QueryFragment.prototype._computeFullText = function () {
        /**
         *
         * @type {string}
         * @private
         */
        this._fullText = this.getFragmentTokens().map('getTokenTextLowerCase').join(' ');
    };

    /**
     *
     * @private
     */
    QueryFragment.prototype._computeCursorPositions = function () {
        // Compute the cursor positions.
        var prefixText = this._queryTokens.slice(0, this._startTokenPos).map('getTokenTextLowerCase').join(' ');

        /**
         *
         * @type {number}
         * @private
         */
        this._startCursorPos = prefixText.length;
        // For a phrase that is at the beginning of the query, it is okay to consider the position right before the
        // phrase as part of the phrase. For everything else (i.e phrases that have non empty prefix), the start
        // cursor position should be at the first char of the phrase.
        if (prefixText) {
            this._startCursorPos++;
        }

        /**
         *
         * @type {number}
         * @private
         */
        this._endCursorPos = this._startCursorPos + this._fullText.length;
    };

    /**
     *
     * @private
     */
    QueryFragment.prototype._computeIsReplacable = function () {
        /**
         *
         * @type {boolean}
         * @private
         */
        this._isReplacable = false;
        if (this._numTokens <= 0) {
            return;
        }

        // Compute if the fragment is replacable from UI. This also has impact on the selectable cursor positions.
        if (this._numTokens === 1) {
            this._isReplacable = true;
            return;
        }

        // Filter out empty tokens from the fragment.
        var filteredTokens = this.getFragmentTokens().filter(function (t) {
            return !t.isEmpty();
        });

        if (filteredTokens.length === 1) {
            this._isReplacable = true;
            return;
        }

        // If we are left with multi token phrases other than following cases, we don't consider the phrase to be
        // replacable.
        // The cases where we can generate replacement suggestions are:
        // - "<T>for each</T> <T>customer region</T>" (in case of a top query)
        // - "<T>by</T> <T>customer region</T>" (group by)
        if (filteredTokens.length != 2) {
            return;
        }
        switch (this._type) {
            case sage.PhraseType.FOR_EACH_PHRASE:
            case sage.PhraseType.GROUP_BY_COLUMN_PHRASE:
                this._isReplacable = true;
            // In all these cases when fragment is replacable, we update the cursor positions of the phrase to be
            // aligned with the column token. (Clicking on this phrase will highlight the column token only).
                this._startCursorPos = this._endCursorPos - filteredTokens[1].getTokenTextLowerCase().length - 1;
        }
    };

    var NUM_FILTER_VALUES_ALLOWED_BEFORE_TRUNCATION = 3;
    /**
     *
     * @private
     */
    QueryFragment.prototype._computeDisplayText = function () {
        /**
         * @type {string}
         * @private
         */
        this._displayText = this.getFullText();

        // Since sage doesn't tell us what type of filter phrase we are in, we have to deduce that this filter phrase
        // is an IN-list ("for color red blue" or checkbox filter).
        //
        // The way to deduce this is to take the filter phrase whose last token is a column value token. If there are
        // more than NUM_FILTER_VALUES_ALLOWED_BEFORE_TRUNCATION contiguous tokens preceding this last value token that
        // have the same type and type name, then we can safely assume that this is an in-list filter.

        var fragmentTokens = this.getFragmentTokens().filter(function (t) {
            return !t.isEmpty();
        });
        if (this._type === sage.PhraseType.FILTER_PHRASE && fragmentTokens.length) {
            var i = fragmentTokens.length - 1;
            // Note the last token's type enum and type name.
            // Find preceeding contiguous tokens that have same type enum and type name.
            if (fragmentTokens[i].isValueToken()) {
                var guid = fragmentTokens[i].guid;
                i--;
                while (i >= 0 && fragmentTokens[i].isValueToken() && fragmentTokens[i].guid === guid) {
                    i--;
                }
                i++;

                if (fragmentTokens.length  - i > NUM_FILTER_VALUES_ALLOWED_BEFORE_TRUNCATION) {
                    var prefixForDisplayText = fragmentTokens.slice(0, i).map('getTokenTextLowerCase').join(' ') + ' ';
                    this._displayText = '{1}{2}...{3}'.assign(
                        prefixForDisplayText,
                        fragmentTokens[i].getTokenTextLowerCase(),
                        fragmentTokens.last().getTokenTextLowerCase());
                } else {
                    this._displayText = fragmentTokens.slice(0, i + 1).map('getTokenTextLowerCase').join(' ');
                    for (var j = i + 1; j < fragmentTokens.length; ++j) {
                        this._displayText += ', {1}'.assign(fragmentTokens[j].getTokenTextLowerCase());
                    }
                }
            }
        }
    };

    /**
     *
     * @returns {string}
     */
    QueryFragment.prototype.getFullText = function () {
        return this._fullText;
    };

    /**
     *
     * @returns {string}
     */
    QueryFragment.prototype.getDisplayText = function () {
        return this._displayText;
    };

    /**
     *
     * @type {Object.<sage.PhraseType, string>}
     */
    var typeToCssClass = {};
    util.iterateObject(sage.PhraseType, function (phraseTypeEnum, phraseType) {
        typeToCssClass[phraseType] = 'bk-qf-' + phraseTypeEnum.toLowerCase().dasherize();
    });

    /**
     *
     * @returns {string}
     */
    QueryFragment.prototype.getCssClass = function () {
        if (! this._isComplete ) {
            return 'bk-qf-incomplete-phrase';
        }
        return typeToCssClass[this._type] || '';
    };

    /**
     *
     * @returns {Array.<sage.RecognizedToken>} Returns a fresh copy of fragment tokens.
     */
    QueryFragment.prototype.getFragmentTokensCopy = function () {
        if (!this._queryTokens) {
            return [];
        }

        return this._queryTokens.slice(this._startTokenPos, this._startTokenPos + this._numTokens);
    };

    /**
     *
     * @returns {Array.<sage.RecognizedToken>}
     */
    QueryFragment.prototype.getFragmentTokens = function () {
        return this._fragmentTokens || [];
    };

    /**
     *
     * @returns {number}
     */
    QueryFragment.prototype.getStartTokenPosition = function () {
        return this._startTokenPos;
    };

    /**
     *
     * @returns {number}
     */
    QueryFragment.prototype.getNumTokens = function () {
        return this._numTokens;
    };

    /**
     *
     * @returns {number}
     */
    QueryFragment.prototype.getStartCursorPosition = function () {
        return this._startCursorPos;
    };

    /**
     *
     * @returns {number}
     */
    QueryFragment.prototype.getEndCursorPosition = function () {
        return this._endCursorPos;
    };

    /**
     *
     * @returns {boolean}
     */
    QueryFragment.prototype.isReplacable = function () {
        return this._isReplacable;
    };

    QueryFragment.prototype.hasTokensOfSameKind = function () {
        return [
            sage.PhraseType.TOP_BOTTOM_PHRASE,
            sage.PhraseType.GROWTH_PHRASE
        ].none(this._type);
    };

    QueryFragment.prototype.getAnchorToken = function () {
        return this._fragmentTokens.find(function (token) {
            return token.isDataToken();
        });
    };

    QueryFragment.prototype.getPhraseType = function () {
        return this._type;
    };

    return QueryFragment;
}]);
