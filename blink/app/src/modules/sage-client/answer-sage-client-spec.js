/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit test file for answer sage client.
 */

'use strict';

describe('AnswerSageClient spec', function() {
    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());
    var AnswerSageClient;

    beforeEach(inject(function(_AnswerSageClient_) {
        /* eslint camelcase: 1 */
        AnswerSageClient = _AnswerSageClient_;
    }));

    it('SCAL-20417 should init lastQueryContext with constructor context', function () {
        var initContext = {};
        var documentModel = {
            getContext: function () {
                return initContext
            }
        };
        var formattedTokens = {
            getTokens: function () {
                return [];
            },
            getPhrases: function () {
                return [];
            }
        };
        var onQueryUpdate = function(){};
        var onClientUse = function(){};
        var answerSageClient = new AnswerSageClient(
            documentModel,
            formattedTokens,
            onQueryUpdate,
            onClientUse
        );
        expect(answerSageClient.lastQueryContext).toBe(initContext);
    });
});
