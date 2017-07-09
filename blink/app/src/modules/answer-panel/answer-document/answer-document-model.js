/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Data model for answer document
 */

'use strict';

//TODO(Rahul/QoQ): Should get rid of it ultimately, and use sage-client for this.
blink.app.factory('AnswerDocumentModel', [
    function () {
        /**
         * @constructor
         */
        var AnswerDocumentModel = function(queryContext) {
            this.queryContext = queryContext;
            this.currentIndex = 0;
            this.currentAnswerModel = null;
        };

        /**
         * @returns {sage.ACContext}
         */
        AnswerDocumentModel.prototype.getContext = function() {
            return this.queryContext;
        };

        /**
         * @returns {Array.<sage.ACTable>}
         */
        AnswerDocumentModel.prototype.getContextTables = function() {
            return this.getContext().getTables();
        };

        /**
         * @param {sage.ACContext} queryContext
         */
        AnswerDocumentModel.prototype.setContext = function(queryContext) {
            this.queryContext = queryContext;
        };

        /**
         * @returns {int}
         */
        AnswerDocumentModel.prototype.getCurrentIndex = function() {
            return this.currentIndex;
        };

        /**
         * @param {int} index
         */
        AnswerDocumentModel.prototype.setCurrentIndex = function(index) {
            this.currentIndex = index;
        };

        /**
         * @returns {AnswerModel}
         */
        AnswerDocumentModel.prototype.getCurrentAnswerModel = function() {
            return this.currentAnswerModel;
        };

        /**
         * @param {AnswerModel} answerModel
         */
        AnswerDocumentModel.prototype.setCurrentAnswerModel = function(answerModel) {
            this.currentAnswerModel = answerModel;
        };

        return AnswerDocumentModel;
    }
]);

