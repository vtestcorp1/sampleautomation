/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This service provides a store for application to put content needed to restore the
 * application on back, forward, refresh transitions.
 */

'use strict';

blink.app.factory('answerRestorationDataStore', ['Logger',
    'util',
    function (Logger,
          util) {
        var _logger = Logger.create('answer-restoration-data-store');

        var ANSWER_RESTORATION_KEY = 'AnswerRestoration';
        var sessionStoreValueTypes = {
            vizType: 'vizType',
            contextAndIndex: 'contextAndIndex'
        };
        var latestSageContextSessionStoreKey = null;

        var tableHashToSageContextAndIndex = {};

        var tableHashToRenderedVizTypeMap = {};

        function getSessionStoreKey(sessionStoreValueType, tableHash){
            return ANSWER_RESTORATION_KEY+ '_' + sessionStoreValueType + '_' + tableHash;
        }

        function setVizTypeForTableHash (tableHash, vizType) {
            tableHashToRenderedVizTypeMap[tableHash] = vizType;
            var sessionStoreLookupKey = getSessionStoreKey(sessionStoreValueTypes.vizType, tableHash);
            util.setSessionStoreValue(sessionStoreLookupKey, vizType);
        }

        function getVizTypeForTableHash (tableHash) {
            if (tableHashToRenderedVizTypeMap.hasOwnProperty(tableHash)) {
                return tableHashToRenderedVizTypeMap[tableHash];
            }
            var sessionStoreLookupKey = getSessionStoreKey(sessionStoreValueTypes.vizType, tableHash);
            return util.getSessionStoreValue(sessionStoreLookupKey);
        }

        function setSageContextAndIndexForTableHash (sageContext, index, accessibleTables) {
            var table = sageContext.getTables()[index];
            var tableHash = table.getHashKey();
            var serializedContext = sage.serialize(sageContext);
            var value = {
                index: index,
                context: serializedContext,
                accessibleTables: accessibleTables
            };

            tableHashToSageContextAndIndex[tableHash] = value;
        // NOTE:
        // 1. Since the context size can go upto mbs and the limit on session store we only try to keep one
        // context in persisted session store. Deletion helps in the chances of successfully adding the last
        // context.
        // 2. Addition is put inside a try catch as there is still a possibility of persisting in session
        // store failing, we would want to handle that gracefully and ingore that failure and move on.
        // The impact of this will be the lookup will return null and user will be routed to empty answer page.
            try {
                util.deleteSessionStoreKey(latestSageContextSessionStoreKey);
                var sessionStoreLookupKey = getSessionStoreKey(sessionStoreValueTypes.contextAndIndex, tableHash);
                util.setSessionStoreValue(sessionStoreLookupKey, value);
                latestSageContextSessionStoreKey = sessionStoreLookupKey;
            } catch(e) {
                _logger.warn('Unable to store context in session store', e);
            }

            return tableHash;
        }

        function getSageContextAndIndexForTableHash (key) {
            var cachedObject = null;
            if (tableHashToSageContextAndIndex.hasOwnProperty(key)) {
                cachedObject = tableHashToSageContextAndIndex[key];
            } else {
                var sessionStoreLookupKey = getSessionStoreKey(sessionStoreValueTypes.contextAndIndex, key);
                cachedObject = util.getSessionStoreValue(sessionStoreLookupKey);
                if (cachedObject) {
                    tableHashToSageContextAndIndex[key] = cachedObject;
                }
            }
            if (cachedObject) {
                var context = sage.deserialize(cachedObject.context, sage.ACContext);
                return {
                    index: cachedObject.index,
                    context: context,
                    accessibleTables: cachedObject.accessibleTables
                };
            }
            return null;
        }

        return {
            setSageContextAndIndexForTableHash: setSageContextAndIndexForTableHash,
            getSageContextAndIndexForTableHash: getSageContextAndIndexForTableHash,
            setVizTypeForTableHash: setVizTypeForTableHash,
            getVizTypeForTableHash: getVizTypeForTableHash
        };
    }]);
