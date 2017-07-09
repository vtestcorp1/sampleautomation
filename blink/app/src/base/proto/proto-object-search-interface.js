/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview A wrapper over proto interface provided by object search
 *               to give accessor methods and utility functions.
 */


'use strict';
/* eslint camelcase: 1, no-undef: 0 */

// This wrapping is needed so that the strict mode only applies to this scope
(function() {

    /**
     * Returns the first substring matched from the HighlightedString
     * @returns {String}
     */
    sage.HighlightedString.prototype.getMatchedSubstring = function() {
        if (!this.highlight.length) {
            return '';
        }
        var highlight = this.highlight[0];
        return this.text.substring(highlight.start, highlight.start + highlight.size);
    };

    /**
     * @returns {String}
     */
    sage.Question.prototype.getName = function() {
        return this.text.text;
    };

    /**
     * @returns {sage.HighlightedString}
     */
    sage.Question.prototype.getHighlightedName = function() {
        return this.text;
    };

    sage.Object.prototype.isPinboard = function () {
        return this.type === sage.Object.Type.PINBOARD;
    };

    sage.Object.prototype.isAnswer = function () {
        return this.type === sage.Object.Type.ANSWER;
    };

    sage.Object.prototype.getId = function () {
        return this.guid;
    };

    /**
     * @returns {String}
     */
    sage.Object.prototype.getName = function () {
        return this.name.text;
    };

    /**
     * @returns {sage.HighlightedString}
     */
    sage.Object.prototype.getHighlightedName = function () {
        return this.name;
    };

    /**
     * @returns {sage.Question}
     */
    sage.Object.prototype.getQuestion = function() {
        if (!!this.question.length) {
            return this.question[0];
        }
    };

    /**
     * @returns {Array.<sage.Viz>}
     */
    sage.Object.prototype.getVisualizations = function() {
        return this.viz;
    };

    sage.Viz.prototype.getName = function() {
        return this.title.text;
    };

    sage.Viz.prototype.getHighlightedName = function() {
        return this.title;
    };

    sage.Viz.prototype.getQuestion = function() {
        return this.question;
    };
})();
