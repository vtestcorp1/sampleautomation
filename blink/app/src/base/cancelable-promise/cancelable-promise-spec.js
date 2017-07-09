/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview  cancelable-promise unit tests
 *
 */

'use strict';

describe('blink cancelable promise spec', function () {
    beforeEach(module('blink.app'));
    var $q, $rootScope, CancelablePromise;

    /* eslint camelcase: 1 */
    beforeEach(inject(function(_$q_, _$rootScope_, _CancelablePromise_) {
        /* eslint camelcase: 1 */
        $q = _$q_;
        /* eslint camelcase: 1 */
        $rootScope = _$rootScope_;
        /* eslint camelcase: 1 */
        CancelablePromise = _CancelablePromise_;
    }));

    it('should call resolved then with correct arguments', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess = jasmine.createSpy();
        cancelablePromise.then(onSuccess);
        var args = {a:1};
        defer.resolve(args);
        $rootScope.$digest();
        expect(onSuccess).toHaveBeenCalledWith(args);
    });

    it('should call reject then with correct arguments', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        cancelablePromise.then(onSuccess, onFailure);
        var args = {a:1};
        defer.reject(args);
        $rootScope.$digest();
        expect(onFailure).toHaveBeenCalledWith(args);
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call catch with correct arguments / 1', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        cancelablePromise.catch(onFailure);
        var args = {a:1};
        defer.reject(args);
        $rootScope.$digest();
        expect(onFailure).toHaveBeenCalledWith(args);
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call catch with correct arguments / 2', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        cancelablePromise.then(onSuccess,
            function() {
                return $q.reject(args);
            }).catch(onFailure);
        var args = {a:1};
        defer.reject(args);
        $rootScope.$digest();
        expect(onFailure).toHaveBeenCalledWith(args);
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should not call catch with correct arguments / 2', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        cancelablePromise.catch(onFailure);
        var args = {a:1};
        defer.resolve(args);
        $rootScope.$digest();
        expect(onFailure).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should not call resolved then', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess = jasmine.createSpy();
        cancelablePromise.then(onSuccess);
        var args = {a:1};
        cancelablePromise.cancel();
        defer.resolve(args);
        $rootScope.$digest();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should not call reject then', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        cancelablePromise.then(onSuccess, onFailure);
        var args = {a:1};
        cancelablePromise.cancel();
        defer.reject(args);
        $rootScope.$digest();
        expect(onFailure).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call chained resolved then with correct arguments', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess1 = function(obj) {
            return obj.a;
        };
        var onSuccess2 = jasmine.createSpy();
        cancelablePromise.then(onSuccess1).then(onSuccess2);
        var args = {a:1};
        defer.resolve(args);
        $rootScope.$digest();
        expect(onSuccess2).toHaveBeenCalledWith(args.a);
    });

    it('should call chained reject then with correct arguments', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess1 = jasmine.createSpy();
        var onFailure1 = function (obj) {
            return $q.reject(obj.a);
        };
        var onSuccess2 = jasmine.createSpy();
        var onFailure2 = jasmine.createSpy();
        cancelablePromise.then(onSuccess1, onFailure1).then(onSuccess2, onFailure2);
        var args = {a:1};
        defer.reject(args);
        $rootScope.$digest();
        expect(onSuccess1).not.toHaveBeenCalled();
        expect(onFailure2).toHaveBeenCalledWith(args.a);
        expect(onSuccess2).not.toHaveBeenCalled();
    });

    xit('should call finally after onSuccess is called', function (done) {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onSuccess = jasmine.createSpy();
        var args = {a:1};
        var finallyFn = function() {
            expect(onSuccess).toHaveBeenCalledWith(args);
            done();
        };
        cancelablePromise
            .then(onSuccess)
            .finally(finallyFn);

        defer.resolve(args);
        $rootScope.$digest();
        expect(finallyFn).toHaveBeenCalled();
    });

    xit('should call finally after onSuccess is called', function (done) {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var cancelablePromise = new CancelablePromise(basePromise);
        var onFailure = jasmine.createSpy();
        var args = {a:1};
        var finallyFn = function() {
            expect(onFailure).toHaveBeenCalledWith(args);
            done();
        };
        cancelablePromise
            .catch(onFailure)
            .finally(finallyFn);

        defer.reject(args);
        $rootScope.$digest();
        expect(finallyFn).toHaveBeenCalled();
    });

    it('should not call finally if promise is cancelled and base promise resolved / 1', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var onSuccess = jasmine.createSpy();
        var cancelablePromise = new CancelablePromise(basePromise.then(onSuccess));
        var finallyFn = jasmine.createSpy();
        cancelablePromise.finally(finallyFn);
        cancelablePromise.cancel();
        defer.resolve();
        $rootScope.$digest();
        expect(finallyFn).not.toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
    });

    it('should not call finally if promise is cancelled and base promise resolved / 2', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var wrappedOnSuccess = jasmine.createSpy();
        var cancelablePromise = new CancelablePromise(basePromise.then(wrappedOnSuccess));
        var onSuccess = jasmine.createSpy();
        var finallyFn = jasmine.createSpy();
        cancelablePromise
            .then(onSuccess)
            .finally(finallyFn);
        cancelablePromise.cancel();
        defer.resolve();
        $rootScope.$digest();
        expect(wrappedOnSuccess).toHaveBeenCalled();
        expect(finallyFn).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should be able to chain after finally,', function(){
        var defer = $q.defer();
        var basePromise = defer.promise;
        var wrappedOnSuccess = jasmine.createSpy();
        var cancelablePromise = new CancelablePromise(basePromise.then(wrappedOnSuccess));
        var onSuccess = jasmine.createSpy();
        var finallyFn = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        cancelablePromise
            .then(function() { return true;})
            .finally(finallyFn)
            .then(onSuccess);
        defer.resolve();
        $rootScope.$digest();
        expect(finallyFn).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalled();
        expect(onFailure).not.toHaveBeenCalled();
    });

    it('should call call .then even if it is defined after finally', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var wrappedOnSuccess = jasmine.createSpy();
        var cancelablePromise = new CancelablePromise(basePromise.then(wrappedOnSuccess));
        var onSuccess = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        var finallyFn = jasmine.createSpy();
        cancelablePromise
            .then(function() { return $q.reject();})
            .finally(finallyFn)
            .then(onSuccess, onFailure);
        defer.resolve();
        $rootScope.$digest();
        expect(finallyFn).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onFailure).toHaveBeenCalled();
    });

    it('should call .then even if it is defined after finally', function () {
        var defer = $q.defer();
        var basePromise = defer.promise;
        var wrappedOnSuccess = jasmine.createSpy();
        var cancelablePromise = new CancelablePromise(basePromise.then(wrappedOnSuccess));
        var onSuccess = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        var finallyFn = jasmine.createSpy();
        cancelablePromise
            .finally(finallyFn)
            .then(onSuccess, onFailure);
        defer.reject();
        $rootScope.$digest();
        expect(finallyFn).toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onFailure).toHaveBeenCalled();
    });

    it('should not resolve promised chained after finally, when promise is canceled', function(){
        var defer = $q.defer();
        var basePromise = defer.promise;
        var wrappedOnSuccess = jasmine.createSpy();
        var cancelablePromise = new CancelablePromise(basePromise.then(wrappedOnSuccess));
        var onSuccess = jasmine.createSpy();
        var finallyFn = jasmine.createSpy();
        var onFailure = jasmine.createSpy();
        cancelablePromise
            .then(function() { return true;})
            .finally(finallyFn)
            .then(onSuccess, onFailure);
        cancelablePromise.cancel();
        defer.resolve();
        $rootScope.$digest();
        expect(finallyFn).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onFailure).not.toHaveBeenCalled();
    });
});
