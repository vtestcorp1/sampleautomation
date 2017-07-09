/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Unit tests for cancelable query service.
 */

'use strict';

describe('Cancelable query context service spec', function () {
    var cancelableQueryContextService;

    beforeEach(function () {
        module('blink.app');
        inject(function ($injector) {
            cancelableQueryContextService = $injector.get('cancelableQueryContextService');
        });
    });

    it("should be able to get query cancellation id", function() {
        var cancelId = cancelableQueryContextService.getNewQueryId();
        expect(cancelId).not.toBe(void 0);
        expect(cancelId).not.toBe(null);

        cancelId = cancelableQueryContextService.getNewQueryId('namespace');
        expect(cancelId).not.toBe(void 0);
        expect(cancelId).not.toBe(null);
    });

    it('should not cancel queries marked completed', function() {
        var id1 = cancelableQueryContextService.getNewQueryId();
        var id2 = cancelableQueryContextService.getNewQueryId('namespace');
        cancelableQueryContextService.markQueryCompleted(id1);
        cancelableQueryContextService.markQueryCompleted(id2);
        cancelableQueryContextService.cancelAllPendingQueries();
        expect(cancelableQueryContextService.wasQueryCanceled(id1)).toBe(false);
        expect(cancelableQueryContextService.wasQueryCanceled(id2)).toBe(false);
    });

    it('should cancel all queries', function() {
        var id1 = cancelableQueryContextService.getNewQueryId();
        var id2 = cancelableQueryContextService.getNewQueryId('namespace');
        cancelableQueryContextService.cancelAllPendingQueries();
        expect(cancelableQueryContextService.wasQueryCanceled(id1)).toBe(true);
        expect(cancelableQueryContextService.wasQueryCanceled(id2)).toBe(true);
    });

    it('should cancel queries in namespace', function() {
        var namespace = 'namespace';
        var id1 = cancelableQueryContextService.getNewQueryId();
        var id2 = cancelableQueryContextService.getNewQueryId(namespace);
        cancelableQueryContextService.cancelPendingQueriesInNamespace(namespace);
        expect(cancelableQueryContextService.wasQueryCanceled(id1)).toBe(false);
        expect(cancelableQueryContextService.wasQueryCanceled(id2)).toBe(true);
    });
});
