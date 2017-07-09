/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview A caching service to persist the mapping of /answer/<encodedQuestion> and answer model
 *
 * This is needed because when an user is at say /answer/revenue-quantity and then visits a pinboard, the sage bar is hidden, making sage
 * controller go out of scope. This throws away the mapping kept in sage controller.
 */

'use strict';

blink.app.factory('sageCache', ['env', 'Logger', function (env, Logger) {
    var me = {},

        _logger = Logger.create('sage-cache'),

        /**
         * Map of encodedQuestion => savedState
         *
         * @type {Object}
         * @private
         */
        _encodedQuestionToState = {},

        /**
         * Keys ordered from oldest to newest (key at index 0 is oldest)
         *
         * @type {Array.<string>}
         * @private
         */
        _stateKeys = [];

    /**
     * To prevent boundless growth of memory footprint, we will keep a specified max number of states
     * in the cache. If a new key is already in the cache, it is bumped to the top (most recent).
     * Otherwise the new key is added to the top and if the total number of keys in cache exceeds
     * the max limit, the oldest key is thrown away along with the state associated with it.
     *
     * Example: [k1, k2, k3] in cache, new key is k2. Cache becomes [k1, k3, k2]
     * Example: [k1, k2, k3] in cache, new key is k4, max limit is 3. Cache becomes [k2, k3, k4]
     *
     * @param {string} encodedQuestion
     * @param {Object} savedState
     * @return {Object}
     */
    me.setState = function (encodedQuestion, savedState) {
        _stateKeys.push(encodedQuestion);

        // now look backwards, if the same key is found (if yes, only once), take it out of the array.
        // since the key was already added to the end of array, the effect is a bump-up.
        var nKeys = _stateKeys.length,
            keyWasBumped = false;
        if (nKeys > 1) {
            for (var i = nKeys - 2; i >= 0; i--) {
                if (_stateKeys[i] === encodedQuestion) {
                    _stateKeys.splice(i, 1);
                    keyWasBumped = true;
                    break;
                }
            }
        }

        if (!keyWasBumped && nKeys > env.maxItemsInSageCache) {
            var removedKey = _stateKeys.splice(0, 1);
            _encodedQuestionToState[removedKey] = null;
        }
        _encodedQuestionToState[encodedQuestion] = savedState;
        _logger.log('saving state', _encodedQuestionToState[encodedQuestion], ', keys are ', _stateKeys);
        return savedState;
    };

    /**
     * @param {string} encodedQuestion
     * @return {Object}
     */
    me.getState = function (encodedQuestion) {
        _logger.log('retrieving state', encodedQuestion, _encodedQuestionToState[encodedQuestion]);
        return _encodedQuestionToState[encodedQuestion];
    };

    /**
     * Returns the last saved state.
     * @return {Object?}
     */
    me.getLastState = function () {
        if (!_stateKeys.length) {
            return null;
        }
        return me.getState(_stateKeys[_stateKeys.length - 1]);
    };

    me.clear = function () {
        _encodedQuestionToState = {};
    };

    return me;

}]);
