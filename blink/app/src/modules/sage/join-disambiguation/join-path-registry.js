/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A singleton registry to lookup the join path info for an output logical column.
 *      The registry is built (and kept up-to-date) with the most recent sage response that is used to obtain the current
 *      output (i.e. temporal sage calls (transforms etc) should not be used to update the registry).
 */

'use strict';

// NOTE(vibhor): Ideally, there should just be a sourceRegistry that should contain all information ranging from
// DATABASE, TABLE, COLUMN and JOIN information about the entity for which info is requested.
// TODO(shikhar/vibhor): Do the sourceRegistry refactoring as part of revised bubble for sage and data panel(s).
blink.app.factory('joinPathRegistry', ['Logger', function (Logger) {
    var _logger = Logger.create('join-path-registry');

    var me = {};

    // A map from a outputGuid to token info like the token itself, its join path label, etc.
    // The key is a unique identifier to lookup an output logical column and so includes the join path guids.
    // For example, if the output contains 'firstname' for referer and
    // 'firstname' for referee, where firstname is the same logical column guid in the system but mapped with different
    // join paths, then both should be present in the map.
    var outputGuidToTokenInfo = {};

    me.update = function (recognizedTokens) {
        // Clear the current registry mapping.
        me.clear();

        if (!recognizedTokens || !recognizedTokens.length) {
            return;
        }

        recognizedTokens.each(function (token) {
            // A non-data token will not have a join path info and we don't care about those. So skip them.
            if (!token.isDataToken()) {
                return;
            }

            // If the token join path can't be edited, we are not interested in their join path info. Skip those.
            if (!token.canEditJoinPath()) {
                return;
            }

            var outputGuid = token.getOutputGuid();
            if (!outputGuid) {
                _logger.error('No outputGuid found for token', token);
                return;
            }
            if (Object.has(outputGuidToTokenInfo, outputGuid)) {
                return;
            }
            outputGuidToTokenInfo[outputGuid] = {
                joinPathLabel: token.getJoinPathLabel(),
                token: token
            };
        });
    };

    me.clear = function () {
        outputGuidToTokenInfo = {};
    };

    function preCheck(logicalCol) {
        if (!logicalCol) {
            return false;
        }

        var sageOutputColumnId = logicalCol.getSageOutputColumnId();
        // NOTE: This is the case when the left panel tries to calculate tooltip.
        if (!sageOutputColumnId) {
            return false;
        }
        if (!Object.has(outputGuidToTokenInfo, sageOutputColumnId)) {
            return false;
        }

        return true;
    }

    me.getJoinPathLabel = function (logicalCol) {
        if (!preCheck(logicalCol)) {
            return '';
        }

        return outputGuidToTokenInfo[logicalCol.getSageOutputColumnId()].joinPathLabel;
    };

    me.getSageToken = function (logicalCol) {
        if (!preCheck(logicalCol)) {
            return null;
        }

        return outputGuidToTokenInfo[logicalCol.getSageOutputColumnId()].token;
    };

    me.isJoinPathEditableForColumn = function (logicalCol) {
        return preCheck(logicalCol) &&
            outputGuidToTokenInfo[logicalCol.getSageOutputColumnId()].token.canEditJoinPath();
    };

    return me;
}]);
