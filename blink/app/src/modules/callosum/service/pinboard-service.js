/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This service is used to make all /metadata/pinboard network calls.
 */

'use strict';

blink.app.factory('pinboardMetadataService', ['$q',
    'Command',
    'currencyUtil',
    'dataService',
    'jsonConstants',
    'MetadataListModel',
    'util',
    function ($q,
          Command,
          currencyUtil,
          dataService,
          jsonConstants,
          MetadataListModel,
          util) {
    /**
     * Add a viz to a pinboard
     *
     * @param {string} vizId                The visualization to add to the pinboard
     * @param {number} pinboardId           The pinboard answer book id to which the visualization will be added
     * @param {Object} answerBookMetadata   The source answer book from which the visualization vizId is being added from
     * @return {Object}                     A promise that is resolved after all the calls are successful, or rejected at the first error
     */
        var addVizToPinboard = function (vizId, pinboardId, answerBookMetadata) {
            var command = new Command()
            .setPath('/metadata/pinboard/addvisualization')
            .setPostMethod()
            .setPostParams({
                content: JSON.stringify(answerBookMetadata),
                vizid: vizId,
                // No sheet id is passed, hence API will assume the sheet0 (which is the default).
                tgtbookid: pinboardId
            });

            return command.execute();
        };

        function serializeContextInEffectiveQuestionMap(effectiveQuestionMap) {
            util.iterateObject(effectiveQuestionMap, function(vizId, question) {
                if (!question) {
                    return;
                }
                var context = question[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
                question[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = sage.serialize(context);
            });
        }

    /**
     * Deletes viz from pinboard.
     *
     * @param vizId
     * @param pinboardId
     * @returns {*}
     */
        var deleteVizFromPinboard = function (vizId, pinboardId) {
            var command = new Command()

            .setPath('/metadata/pinboard/edit/deletefrompinboard')
            .setPostMethod()
            .setPostParams({
                tgtbookid: pinboardId,
                vizid: JSON.stringify([vizId])
            });

            return command.execute();
        };

        var savePinboard = function (pinboardModel, effectiveQuestionMap, logicalTableIdToAnswer) {
            effectiveQuestionMap = _.cloneDeep(effectiveQuestionMap);
            var metadataJson = pinboardModel.getMetadataJson();
            var logicalTableIdToAnswerMap = {};
            _.assign(logicalTableIdToAnswerMap, logicalTableIdToAnswer);
            _.forIn(logicalTableIdToAnswer, function(answer, id) {
                var answerJson = answer.getMetadataJson();
                logicalTableIdToAnswerMap[id] = answerJson;
            });
            serializeContextInEffectiveQuestionMap(effectiveQuestionMap);
            var command = new Command()
            .setPath('/metadata/pinboard/save')
            .setPostMethod()
            .setIsMultipart(true)
            .setPostParams({
                content: JSON.stringify(metadataJson),
                // No sheet id is passed, hence API will assume the sheet0 (which is the default).
                logicaltableidtoanswermap: JSON.stringify(logicalTableIdToAnswerMap),
                vizidtoeffectivequestionmap: JSON.stringify(effectiveQuestionMap)
            });

            return command.execute();
        };

        var saveAsPinboard = function (pinboardModel, effectiveQuestionMap, logicalTableIdToAnswer,
                                   name, description) {
            effectiveQuestionMap = _.cloneDeep(effectiveQuestionMap);
            var metadataJson = pinboardModel.getMetadataJson();
            var logicalTableIdToAnswerMap = {};
            _.assign(logicalTableIdToAnswerMap, logicalTableIdToAnswer);
            _.forIn(logicalTableIdToAnswer, function(answer, id) {
                var answerJson = answer.getMetadataJson();
                logicalTableIdToAnswerMap[id] = answerJson;
            });
            serializeContextInEffectiveQuestionMap(effectiveQuestionMap);
            var command = new Command()
            .setPath('/metadata/pinboard/saveas')
            .setPostMethod()
            .setIsMultipart(true)
            .setPostParams({
                content: JSON.stringify(metadataJson),
                // No sheet id is passed, hence API will assume the sheet0 (which is the default).
                logicaltableidtoanswermap: JSON.stringify(logicalTableIdToAnswerMap),
                vizidtoeffectivequestionmap: JSON.stringify(effectiveQuestionMap),
                name: name,
                description: description
            });

            return command.execute();
        };

        var savePinboardSnapshot = function(pinboardModel, name, description) {
            var header = pinboardModel._header;
            var command = new Command()
            .setPath('/metadata/pinboard/snapshot/save')
            .setPostMethod()
            .setIsMultipart(true)
            .setPostParams({
                tgtbookid: header.id,
                name: name,
                description: description
            });
            return command.execute();
        };

        var listPinboardSnapshots = function(pinboardId) {
            var path = '/metadata/pinboard/snapshot/list/' + pinboardId;
            var command = new Command()
            .setPath(path);
            return command.execute();
        };

        var deletePinboardSnapshot = function(pinboardId, snapshotId) {
            var command = new Command()
            .setPath('/metadata/pinboard/snapshot/delete')
            .setDeleteMethod()
            .setPostParams({
                tgtbookid: pinboardId,
                snapshotid: snapshotId
            });
            return command.execute();
        };

    // TODO(raj): load pinboards and cache viz-by-viz
        var getPinboardSnapshot = function(answerModel, vizModel, pinboardId, snapshotId, vizId) {
            var command = new Command()
            .setPath('/metadata/pinboard/snapshot/get')
            .setGetParams({
                tgtbookid: pinboardId,
                snapshotid: snapshotId
            });
            return dataService.postProcessDataCall(command.execute(), answerModel, vizModel, vizId);
        };

        return {
            addVizToPinboard: addVizToPinboard,
            deleteVizFromPinboard: deleteVizFromPinboard,
            savePinboard: savePinboard,
            saveAsPinboard: saveAsPinboard,
            savePinboardSnapshot: savePinboardSnapshot,
            listPinboardSnapshots: listPinboardSnapshots,
            deletePinboardSnapshot: deletePinboardSnapshot,
            getPinboardSnapshot: getPinboardSnapshot
        };
    }]);
