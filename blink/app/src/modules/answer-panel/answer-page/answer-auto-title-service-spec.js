/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit tests for answer auto title service spec.
 */

'use strict';

describe('Answer auto title spec', function() {
    var autoTitleAnswerFunction;

    var moduleName = 'src/modules/answer-panel/answer-page/answer-auto-title-service';

    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());

    /* eslint camelcase: 1 */
    beforeEach(function(done) {
        System.import(
            moduleName).
        then(function(module) {
            inject(function () {
                autoTitleAnswerFunction = module.autoTitleAnswer;
            });
            done();
        }, function (error) {
            done.fail(error);
        });
    });

    it('should update viz title', function () {
        var setTitleSpy = jasmine.createSpy();
        var answerModel = {
            hasUserDefinedName: function () {
                return false;
            },
            getCurrentAnswerSheet: function () {
                return {
                    getPrimaryDisplayedViz: function () {
                        return {
                            getAutoTitle: function() {
                                return 'foo';
                            },
                            setTitle: setTitleSpy
                        }
                    },
                    getFilterVisualizations: function () {
                        return [];
                    }
                }
            },
            setName: _.noop,
            setDescription: _.noop
        };

        autoTitleAnswerFunction(answerModel);
        expect(setTitleSpy).toHaveBeenCalled();
    });
});
