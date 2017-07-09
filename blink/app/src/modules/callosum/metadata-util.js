/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Utility fucntions related to metadata types
 *
 */

'use strict';

blink.app.factory('metadataUtil', ['$q',
    'alertService',
    'jsonConstants',
    'UserAction',
    function($q,
         alertService,
         jsonConstants,
         UserAction) {

        var metadataType = jsonConstants.metadataType;

        function getDisplayNameForMetadataTypeName(name) {
            switch (name) {
                case 'ANSWER':
                case 'QUESTION_ANSWER_BOOK':
                    return 'Answer';
                case 'PINBOARD':
                case 'PINBOARD_ANSWER_BOOK':
                    return 'Pinboard';
                case 'LOGICAL_TABLE':
                    return 'Table';
                case 'LOGICAL_RELATIONSHIP':
                    return 'Relationship';
                case 'LOGICAL_COLUMN':
                    return 'Column';
                case 'VISUALIZATION':
                    return 'Visualization';
                default :
                    return 'Object';
            }
        }

        function getDisplayNameForMetadataType(type, subType) {
            switch (type) {
                case metadataType.QUESTION_ANSWER_BOOK:
                    return 'Answer';
                case metadataType.PINBOARD_ANSWER_BOOK:
                    return 'Pinboard';
                case metadataType.LOGICAL_TABLE:
                    switch (subType) {
                        case metadataType.subType.SYSTEM_TABLE:
                            return 'System Table';
                        case metadataType.subType.IMPORTED_DATA:
                            return 'Imported Table';
                        case metadataType.subType.WORKSHEET:
                            return 'Worksheet';
                        case metadataType.subType.AGGR_WORKSHEET:
            // Note: UX Decision is to keep calling Aggr WS as WS
                            return 'Worksheet';
                        default :
                            return 'Table';
                    }
                    break;
                case metadataType.LOGICAL_COLUMN:
                    return 'Column';
                case metadataType.LOGICAL_RELATIONSHIP:
                    return 'Relationship';
                case metadataType.VISUALIZATION:
                    return 'Visualization';
                case metadataType.TABLE_FILTER:
                    return 'Rule';
                case metadataType.DATA_SOURCE:
                    return 'Data Source';
                default:
                    return 'Object';
            }
        }

        function canMetadataTypeHaveContent(type) {
            switch(type) {
                case metadataType.TABLE_FILTER:
                    return false;
                default:
                    return true;
            }
        }

        function getUrlPrefixForMetadataType(type, subType) {
            switch (type) {
                case metadataType.QUESTION_ANSWER_BOOK:
                    return 'saved-answer';
                case metadataType.PINBOARD_ANSWER_BOOK:
                    return 'pinboard';
                case metadataType.LOGICAL_TABLE:
                    switch (subType) {
                        case metadataType.subType.WORKSHEET:
                            return 'worksheet';
                        case metadataType.subType.AGGR_WORKSHEET:
                            return 'aggregated-worksheet';
                    }
            }
        }

        function getPermissionUserActionForType(type) {
            switch (type) {
                case metadataType.QUESTION_ANSWER_BOOK:
                    return UserAction.FETCH_ANSWER_PERMISSIONS;
                case metadataType.PINBOARD_ANSWER_BOOK:
                    return UserAction.FETCH_PINBOARD_PERMISSIONS;
                case metadataType.LOGICAL_TABLE:
                    return UserAction.FETCH_TABLE_PERMISSIONS;
                default :
                    return UserAction.FETCH_METADATA_PERMISSIONS;
            }
        }

    /**
     * This method reduces the payload size of worksheet call while
     * editing a worksheet. We drop the large pieces of information that
     * callosum does not care about when making modifications to a worksheet
     * (adding/deleting) columns e.g. This method does not have any side effect
     * on the metadata json of the model.
     *
     * Note that this must NOT be used for any call that involves callosum persisting
     * the metadata json passed to it.
     *
     * @param {WorksheetModel} worksheetModel
     * @return {string}
     */
        function getTrimmedSerializedWorksheetStateForEdit(worksheetModel) {
            if (!worksheetModel) {
                return '';
            }

        // drop unnecessary info from the json, serialize and
        // restore the dropped info
            var modelMetadataJson = worksheetModel.getMetadataJson();
            var question = modelMetadataJson.logicalTableContent.question;
            var currentSageContext = question[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
            var currentResolvedText = question[jsonConstants.QUESTION_RESOLVED_TOKEN_TEXT_KEY];

            delete question[jsonConstants.SAGE_CONTEXT_PROTO_KEY];
            delete question[jsonConstants.QUESTION_RESOLVED_TOKEN_TEXT_KEY];

            var serializedMetadataJson = JSON.stringify(modelMetadataJson);

            question[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = currentSageContext;
            question[jsonConstants.QUESTION_RESOLVED_TOKEN_TEXT_KEY] = currentResolvedText;

            return serializedMetadataJson;
        }

        function getDataFromResponse(promise, userAction) {
            return promise.then(function(response) {
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        /**
         * This method stiches the URL parameters into key1=val1&key2=val2 format.
         */
        function stitchQueryParametersIntoAString(queryParameters) {
            return Object.keys(queryParameters).map(function(key){
                var tpl = '{1}={2}';
                if (Array.isArray(queryParameters[key])) {
                    // Multi value operators like `IN` send an array.
                    return queryParameters[key].map(function (item) {
                        return tpl.assign(key, item);
                    }).join('&');
                } else {
                    return tpl.assign(key, queryParameters[key]);
                }
            }).join('&');
        }

        return {
            canMetadataTypeHaveContent: canMetadataTypeHaveContent,
            getDisplayNameForMetadataTypeName: getDisplayNameForMetadataTypeName,
            getDisplayNameForMetadataType: getDisplayNameForMetadataType,
            getUrlPrefixForMetadataType: getUrlPrefixForMetadataType,
            getPermissionUserActionForType: getPermissionUserActionForType,
            getTrimmedSerializedWorksheetStateForEdit: getTrimmedSerializedWorksheetStateForEdit,
            getDataFromResponse: getDataFromResponse,
            stitchQueryParametersIntoAString: stitchQueryParametersIntoAString
        };
    }]);
