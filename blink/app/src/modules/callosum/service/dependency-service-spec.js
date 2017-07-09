/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview tests for dependency api service.
 */

'use strict';

describe('dependency service spec', function () {
    var dependencyService, commandMockService, $q, $rootScope;
    var commandData = {data:{
        'a': {
            'QUESTION_ANSWER_BOOK' : [{id:'123'}],
            'PINBOARD_ANSWER_BOOK' : [{id:'456'}]
        },
        'b': {
            'QUESTION_ANSWER_BOOK' : [{id:'123'}],
            'PINBOARD_ANSWER_BOOK' : [{id:'789'}]
        }
    }};
    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            commandMockService = function Command() {
                this.execute = function () {
                    return $q.when(commandData);
                };
                this.setPostMethod = this.setPath = this.setPostParams =  function() { return this; };
                return this;
            };
            $provide.value('Command', commandMockService);
        });
        /* eslint camelcase: 1 */
        inject(function(_$q_, _dependencyService_, _$rootScope_) {
            /* eslint camelcase: 1 */
            $q = _$q_;
            /* eslint camelcase: 1 */
            dependencyService = _dependencyService_;
            /* eslint camelcase: 1 */
            $rootScope = _$rootScope_;
        });
    });

    it('There should be no duplicate in the dependent list', function (done) {
        var promise = dependencyService.getUniqueNonDeletedTableDependents('myTable');
        promise.then(
            function(response) {
                expect(response.data.length).toBe(3);
                done();
            },function() {
            done(new Error('Promise should be resolved'));
        }
        );
        $rootScope.$digest();
    });
});
