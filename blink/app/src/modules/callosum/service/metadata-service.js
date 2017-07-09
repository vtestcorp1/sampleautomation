/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This service is used to make all /metadata network calls.
 */

'use strict';

blink.app.factory('metadataService', ['$q',
    'Command',
    'jsonConstants',
    'MetadataListModel',
    'util',
    function ($q,
          Command,
          jsonConstants,
          MetadataListModel,
          util) {

        /**
         *  A related link is a link from source {Visualization,Name} to target {Pinboard/Visualization}
         * with runtime filter information stored as RelatedLinkContent. RelatedLink content contains
         * information to generate runtime filter on target pinboard with columnName and its values
         * extracted from source visualization.
         *
         * Adds a relatedLink between the requested source visualization and destination pinboard,visualization
         * @param {string} name of the new relatedLink
         * @param {string} description of the new relatedLink
         * @param {string} srcVizId source visualization guid ID for the new relatedLink
         * @param {string} dstAnswerBookId destination answerbook where we want to navigate to in the link.
         * @param {string} dstVizId destination visualizationId where we want to navigate to optionally.
         * @param {string} content json string describing the related link mappings.
         * @returns {promise}
         */
        var addRelatedLink = function(name, description, srcVizId, dstAnswerBookId, dstVizId, content) {

            var postParams = {
                name: name,
                description: description,
                srcVizId: srcVizId,
                dstAnswerBookId: dstAnswerBookId,
                content: content
            };

            if (dstVizId && dstVizId.length > 0) {
                postParams[jsonConstants.relatedLink.DESTINATION_VIZ_ID] = dstVizId;
            }

            var command = new Command()
                .setPath('/metadata/addrelatedlink')
                .setPostMethod()
                .setPostParams(postParams);

            return command.execute();
        };

    /**
     * Adds a relationship between the requested source and destination columns
     * @param {string} relationshipName
     * @param {string} relationshipDesc
     * @param {string} srcTableId
     * @param dstTableId
     * @param srcColumnsIds
     * @param dstColumnIds
     * @returns {promise}
     */
        var addRelationship = function(relationshipName, relationshipDesc, srcTableId, dstTableId, srcColumnsIds,
                                   dstColumnIds) {
            var command = new Command()
            .setPath('/schema/createrelationship')
            .setPostMethod()
            .setPostParams({
                relationshipname: relationshipName,
                relationshipdescr: relationshipDesc,
                relationshiptype: "USER_DEFINED",
                srctableid: srcTableId,
                desttableid: dstTableId,
                srccolumnids: JSON.stringify(srcColumnsIds),
                destcolumnids: JSON.stringify(dstColumnIds)
            });

            return command.execute();
        };

        /**
         * Analyze a metadata object identified by type, subtype, id parameters.
         * @param type example: Logical_Table
         * @param subType this is optional, it is used only in the context of type.
         * @param id metadata storable id
         * @return List of Violations that customer will act upon to fix.
         */
        var analyze = function(type, subType, id) {

            var getParams = {};
            getParams.type = type;
            if (!!subType && subType.length > 0) {
                getParams.subType = subType;
            }
            getParams.id = id;

            var command = new Command()
                .setPath('/metadata/analyze')
                .setGetParams(getParams);

            return command.execute();
        };

    /**
     *
     * @param relationshipId {string}
     * @returns {promise}
     */
        var deleteRelationShip = function(relationshipId) {
            var command = new Command()
            .setPath('/schema/deleterelationship')
            .setDeleteMethod()
            .setPostParams({
                id: relationshipId
            });

            return command.execute();
        };

        /**
         *  A related link is a link from source {Visualization,Name} to target {Pinboard/Visualization}
         * with runtime filter information stored as RelatedLinkContent. RelatedLink content contains
         * information to generate runtime filter on target pinboard with columnName and its values
         * extracted from source visualization.
         *
         * Updates an existing relatedLink between the requested source visualization and destination pinboard,visualization
         * @param {id} of the existing relatedLink
         * @param {string} name of the relatedLink
         * @param {string} description of the relatedLink
         * @param {string} srcVizId source visualization guid ID for the relatedLink
         * @param {string} dstAnswerBookId destination answerbook where we want to navigate to in the link.
         * @param {string} dstVizId destination visualizationId where we want to navigate to optionally.
         * @param {string} content json string describing the related link mappings.
         * @returns {promise}
         */
        var updateRelatedLink = function(id, name, description, srcVizId, dstAnswerBookId, dstVizId, content) {

            var postParams = {
                id: id,
                name: name,
                description: description,
                srcVizId: srcVizId,
                dstAnswerBookId: dstAnswerBookId,
                content: content
            };

            if (dstVizId && dstVizId.length > 0) {
                postParams[jsonConstants.relatedLink.DESTINATION_VIZ_ID] = dstVizId;
            }

            var command = new Command()
                .setPath('/metadata/updaterelatedlink')
                .setPostMethod()
                .setPostParams(postParams);

            return command.execute();
        };

    /**
     * Updates a relationship name and description by a given id
     * @param {string} relationshipId
     * @param {string} relationshipName
     * @param {string} relationshipDesc
     * @returns {promise}
     */
        var updateRelationshipName = function(relationshipId, relationshipName, relationshipDesc) {
            var command = new Command()
            .setPath('/metadata/updaterelationshipname')
            .setPostMethod()
            .setPostParams({
                id: relationshipId,
                relationshipname: relationshipName,
                relationshipdescr: relationshipDesc
            });

            return command.execute();
        };

    /**
     * Updates a relationship by a given id to new name and source and destination columns
     * @param {string} relationshipId
     * @param {string} relationshipName
     * @param {string} relationshipDesc
     * @param srcColumnsIds
     * @param dstColumnIds
     * @returns {promise}
     */
        var updateRelationship = function(relationshipId, relationshipName, relationshipDesc, srcColumnsIds,
                                   dstColumnIds) {
            var command = new Command()
            .setPath('/metadata/updaterelationship')
            .setPostMethod()
            .setPostParams({
                id: relationshipId,
                relationshipname: relationshipName,
                relationshipdescr: relationshipDesc,
                relationshiptype: "USER_DEFINED",
                srccolumnids: JSON.stringify(srcColumnsIds),
                destcolumnids: JSON.stringify(dstColumnIds)
            });

            return command.execute();
        };

    /**
     * Gets metadata details for the given ids and metadata object type.
     * @param type
     * @param ids
     * @param {boolean} [showHidden=false]
     * @param {boolean} [dropQuestionDetails=false]
     * @returns {*}
     */
        var getMetadataDetails = function(type, ids, showHidden, dropQuestionDetails) {
            showHidden = !!showHidden;
            dropQuestionDetails = !!dropQuestionDetails;

            var command = new Command()
            .setPath('/metadata/details')
            .setPostMethod()
            .setPostParams({
                id: JSON.stringify(ids),
                type: type,
                showhidden: showHidden,
                dropquestiondetails: dropQuestionDetails
            });
            return command.execute();
        };

    /**
     * Gets metadata details for the metadata object type with given id .
     * @param type
     * @param {String} id
     * @param [params]
     * @returns {*}
     */
        var getMetadataObjectDetails = function(type, id, params) {
            params = params || {};
            var getParams = {};
            getParams.type = type;
            getParams.showhidden = !!params.showHidden;

            var command = new Command()
            .setPath('/metadata/detail/'+id)
            .setGetParams(getParams);

            if (!!params.isIgnorable) {
                command.setIgnorable(true);
            }

            return command.execute();
        };

    /**
     * Gets list of metadata object for the given type.
     *
     * @param type
     * @param [params]
     * @returns {*}
     */
        var getMetadataList = function(type, params) {
            params = params || {};
            var commandParams = {};
            commandParams.type = type;
            if (!!params.batchSize) {
                commandParams.batchsize = params.batchSize;
            }
            if (!!params.category) {
                commandParams.category = params.category;
            }
            commandParams.offset = params.offset;
            if (!!params.subTypes) {
                commandParams.subtypes = JSON.stringify(params.subTypes);
            }
            if (!!params.pattern) {
                commandParams.pattern = params.pattern;
            }
            if (!!params.tagname) {
                commandParams.tagname= JSON.stringify(params.tagname);
            }
            if (!!params.sort) {
                commandParams.sort = params.sort;
            }
            if (!!params.skipIds) {
                commandParams.skipids = JSON.stringify(params.skipIds);
            }
            if (!!params.fetchIds) {
                commandParams.fetchids = JSON.stringify(params.fetchIds);
            }
            if (!_.isNil(params.autoCreated)) {
                /* eslint camelcase: 1 */
                commandParams.auto_created = params.autoCreated;
            }

            commandParams.sortascending = !!params.sortAscending;


            commandParams.showhidden = !!params.showHidden;

            var command = new Command()
            .setPath('/metadata/list')
            .setGetParams(commandParams);

            return command.execute();
        };

    /**
     * Gets list of metadata object for the given type.
     *
     * @param type
     * @param [params]
     * @returns {*}
     */
        var getMetadataListModel = function(type, params) {
            return getMetadataList(type, params)
                .then(function(response) {
                    response.data = new MetadataListModel(response.data);
                    return response;
                });
        };

    /**
     * Creates a metadata object
     *
     * @param metadataType
     * @param name
     * @param description
     * @returns {*}
     */
        var createMetadataObject = function(metadataType, name, description) {
            // HACK(Jasmeet): this is the only place now using sheet will move this
            // down to callosum.
            if (metadataType === jsonConstants.metadataType.PINBOARD_ANSWER_BOOK) {
                metadataType = 'PINBOARD_ANSWER_SHEET';
            }

            var postparams = {
                type: metadataType,
                name: name
            };

            if (!!description) {
                postparams.description = description;
            }

            var command = new Command()
            .setPath('/metadata/create')
            .setPostMethod()
            .setPostParams(postparams);

            return command.execute();
        };

    /**
     * Saves the passed content as the given metadata type.
     * @param type
     * @param content
     * @param {boolean=} forceSave whether to force callosum to drop invalid
     *                   parts of the object. Useful when fixing a worksheet
     *                   with broken columns. false by default.
     * @returns {*}
     */
        var save = function(type, content, forceSave) {
            var command = new Command()
            .setPath('/metadata/save')
            .setPostMethod()
            .setIsMultipart(true)
            .setPostParams({
                type: type,
                content: content,
                forcesave: !!forceSave
            });

            return command.execute();
        };

    /**
     * * Saves the passed content as the given metadata type.
     * @param type
     * @param content
     * @param {boolean=} forceSave whether to force callosum to drop invalid
     *                   parts of the object. Useful when fixing a worksheet
     *                   with broken columns. false by default.
     * @param name
     * @param description
     * @returns {*}
     */
        var saveAs = function(type, content, forceSave, name, description) {
            var command = new Command()
            .setPath('/metadata/saveas')
            .setPostMethod()
            .setIgnorable()
            .setIsMultipart(true)
            .setPostParams({
                type: type,
                content: content,
                name: name,
                description: description,
                forcesave: !!forceSave
            });

            return command.execute();
        };

    /**
     * Save metadata objects in the repository
     *
     * @param type Type of metadata object
     * @param content List of object jsons of metadata objects to be saved
     *        of the form [{content1}, {content2},...]
     * @returns {*}
     */
        var bulkUpdate = function(type, contents) {
            var contentList = JSON.stringify(
            contents.map(function(content) {
                return JSON.stringify(content);
            })
        );
            var command = new Command()
            .setPath('/metadata/update')
            .setPostMethod()
            .setIgnorable()
            .setPostParams({
                type: type,
                contentlist: contentList
            });

            return command.execute();
        };

    /**
     * Save metadata headers in the repository
     *
     * @param type Type of metadata object
     * @param content List of object jsons of metadata header objects to be saved
     *        of the form [{content1}, {content2},...]
     * @returns {*}
     */
        var updateHeaders = function(type, contents) {
            var contentList = JSON.stringify(
            contents.map(function(content) {
                return JSON.stringify(content);
            })
        );
            var command = new Command()
            .setPath('/metadata/updateheaders')
            .setPostMethod()
            .setIgnorable()
            .setPostParams({
                type: type,
                contentlist: contentList
            });

            return command.execute();
        };

        var disableAutoDelete = function (type, model) {
            var headerJson = model.getHeaderJson();
            headerJson[jsonConstants.IS_AUTO_DELETE_KEY] = false;
            var contents = [headerJson];
            updateHeaders(type, contents);
            return $q.when();
        };

    /**
     * Mapping from key to callosum path.
     * @type {{ASSIGN: string, UNASSIGN: string}}
     */
        var TagOperationToCallosumPath = {
            ASSIGN: '/metadata/assigntag',
            UNASSIGN: '/metadata/unassigntag'
        };

    /**
     *
     * @param callosumPath
     * @param taggedObjectIds
     * @param metadataType
     * @param labelIds
     * @returns {*}
     */
        var assignOrUnassignTag = function (callosumPath, taggedObjectIds, metadataType, labelIds) {

            var typeArray = util.repeat(metadataType, taggedObjectIds.length);

            var postParams = {
                id: JSON.stringify(taggedObjectIds),
                type: JSON.stringify(typeArray),
                tagid: JSON.stringify(labelIds)
            };
            var command = new Command()
            .setPath(callosumPath)
            .setPostMethod()
            .setPostParams(postParams);

            return command.execute();
        };

    /**
     *
     * @param taggedObjectIds
     * @param metadataType
     * @param labelIds
     * @returns {*}
     */
        var assignTag = function (taggedObjectIds, metadataType, labelIds) {
            return assignOrUnassignTag(TagOperationToCallosumPath.ASSIGN, taggedObjectIds, metadataType, labelIds);
        };

    /**
     *
     * @param taggedObjectIds
     * @param metadataType
     * @param labelIds
     * @returns {*}
     */
        var unAssignTag = function (taggedObjectIds, metadataType, labelIds) {
            return assignOrUnassignTag(TagOperationToCallosumPath.UNASSIGN, taggedObjectIds, metadataType, labelIds);
        };

    /**
     * Bulk operation for deleting multiple ids.
     * @param ids
     * @param type
     * @return {Promise.promise|*}
     *
     */
        var deleteMetadataItems = function (ids, type) {
            var formParams = {
                id: JSON.stringify(ids)
            };
            if (!!type) {
                formParams.type = type;
            }
            var command = new Command()
            .setPath('/metadata/delete/')
            .setPostParams(formParams)
            .setPostMethod();

            return command.execute();
        };

    /**
     * Returns the data schema
     *
     * @returns {*}
     */
        var getSchema = function() {
            var command = new Command()
            .setPath('/metadata/schema/');

            return command.execute().then(function(response){
                return response.data.map(function(d) {
                // Callosum said that they are forced to send strings
                    return JSON.parse(d);
                });
            });
        };

        return {
            addRelatedLink: addRelatedLink,
            addRelationship: addRelationship,
            analyze: analyze,
            assignTag: assignTag,
            bulkUpdate: bulkUpdate,
            createMetadataObject: createMetadataObject,
            deleteMetadataItems: deleteMetadataItems,
            deleteRelationShip: deleteRelationShip,
            disableAutoDelete: disableAutoDelete,
            getMetadataDetails: getMetadataDetails,
            getMetadataObjectDetails: getMetadataObjectDetails,
            getMetadataList: getMetadataList,
            getMetadataListModel: getMetadataListModel,
            getSchema: getSchema,
            save: save,
            saveAs: saveAs,
            unAssignTag: unAssignTag,
            updateHeaders: updateHeaders,
            updateRelatedLink: updateRelatedLink,
            updateRelationship: updateRelationship,
            updateRelationshipName: updateRelationshipName
        };
    }]);
