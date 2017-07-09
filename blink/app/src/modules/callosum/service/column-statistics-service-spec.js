/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Lucky Odisetti (lucky@thoughtspot.com)
 *
 * @fileoverview tests for dependency api service.
 */

'use strict';

describe('column statistics service spec', function () {
    var columnStatisticsService, mockCommandService, $q, $rootScope;
    var commandData = {data:{
        'col1': {
            'metric1' : 123,
            'metric2' : 234
        },
        'col2': {
            'metric1' : 345,
            'metric2' : 456
        }
    }};

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            mockCommandService = function Command() {
                this.execute = function () {
                    return $q.when(commandData);
                };
                this.setPostMethod = this.setPath = this.setPostParams =  function() {
                    return this;
                };
            };
            $provide.value('Command', mockCommandService);
        });
        /* eslint camelcase: 1 */
        inject(function(_$q_, _columnStatisticsService_, _$rootScope_) {
            /* eslint camelcase: 1 */
            $q = _$q_;
            /* eslint camelcase: 1 */
            columnStatisticsService = _columnStatisticsService_;
            /* eslint camelcase: 1 */
            $rootScope = _$rootScope_;
        });
    });

    it('Service Response must be transformed correctly', function (done) {
        var promise = columnStatisticsService.getColumnStatistics(['cols']);
        promise.then(
            function(response) {
                expect(Object.keys(response.data)).toContain('metric1', 'metric2');
                expect(Object.keys(response.data).length).toBe(2);
                done();
            },function() {
            done(new Error('Promise should be resolved'));
        }
        );
        $rootScope.$digest();
    });
});
