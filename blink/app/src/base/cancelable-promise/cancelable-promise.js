/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * Wrapper on top of a promise to suppress the resolve/reject call if the caller cancels the promise
 */
'use strict';

blink.app.factory('CancelablePromise', [ function() {
    /**
     * @param {Promise} promise
     * @returns {Promise}
     */
    function CancelablePromise(promise, state) {
        Object.merge(this, promise);
        state = state || {
            cancelResolutions: false
        };

        this.cancel = function () {
            state.cancelResolutions = true;
        };

        var self = this;

        self.then = function (resolveFn, rejectFn) {
            return new CancelablePromise(
                promise.then(function () {
                    if (state.cancelResolutions) {
                        return;
                    }
                    if(!!resolveFn) {
                        return resolveFn.apply(self, arguments);
                    }
                }, function () {
                    if (state.cancelResolutions) {
                        return;
                    }
                    if(!!rejectFn) {
                        return rejectFn.apply(self, arguments);
                    }
                }), state
            );
        };

        self.catch = function (rejectFn) {
            return new CancelablePromise(
                promise.catch(function () {
                    if (state.cancelResolutions) {
                        return;
                    }
                    if(!!rejectFn) {
                        return rejectFn.apply(self, arguments);
                    }
                }), state);
        };



        self.finally = function(finallyFn) {
            return new CancelablePromise(promise.finally(function() {
                if (state.cancelResolutions) {
                    return;
                } else {
                    finallyFn.apply(self);
                }
            }), state);
        };
    }

    return CancelablePromise;
}]);
