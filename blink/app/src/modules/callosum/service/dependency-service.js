/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 *         Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Service used to determine dependents for metadata items
 */

'use strict';

blink.app.factory('dependencyService', ['$q',
    'Command',
    'jsonConstants',
    function ($q,
          Command,
          jsonConstants) {
        function getDependents(ids, type) {

            var command = new Command()
            .setPath('/dependency/listdependents')
            .setPostMethod()
            .setPostParams({
                id: JSON.stringify(ids),
                type: type
            });

            return command.execute().then(function (response) {
                var data = response.data;
            // Convert from {
            //   guid1: {
            //     type1: [a, b],
            //     type2: [c, d]
            //   },
            //   guid2: {
            //     type1: [e, f],
            //     type2: [g, h]
            //   }
            // }
            //
            // to {
            //    type1: [a, b, e, f],
            //    type2: [c, d, g, h]
            // }
                var results = {};
                Object.keys(data).forEach(function (dependency) {
                    Object.keys(data[dependency]).forEach(function (type) {
                        if (!results.hasOwnProperty(type)) {
                            results[type] = [];
                        }
                        results[type] = results[type].concat(data[dependency][type].map(function (header) {
                            header.dependency = dependency;
                            return header;
                        }));
                    });
                });
                response.data = results;
                return response;
            });
        }

        function getTableDependents(logicalTableIds) {
            return getDependents(logicalTableIds, jsonConstants.metadataType.LOGICAL_TABLE);
        }

        function getColumnDependents(columnIds) {
            return getDependents(columnIds, jsonConstants.metadataType.LOGICAL_COLUMN);
        }

        function getRelationshipDependents(relationshipIds) {
            return getDependents(relationshipIds, jsonConstants.metadataType.LOGICAL_RELATIONSHIP);
        }

        function getUniqueNonDeletedDependents(dependentsFetchDeferred) {
            return dependentsFetchDeferred.then(function(response){
                var dependents = response.data;
                var questionAnswerBooks = dependents[jsonConstants.metadataType.QUESTION_ANSWER_BOOK] || [],
                    pinboardAnswerBooks = dependents[jsonConstants.metadataType.PINBOARD_ANSWER_BOOK] || [],
                    logicalTables = dependents[jsonConstants.metadataType.LOGICAL_TABLE] || [],
                    worksheets = logicalTables.filter(function(tableHeader) {
                        return tableHeader.type === jsonConstants.metadataType.subType.WORKSHEET;
                    }),
                    aggrWorksheets = logicalTables.filter(function(tableHeader) {
                        return tableHeader.type === jsonConstants.metadataType.subType.AGGR_WORKSHEET;
                    });

                questionAnswerBooks.forEach(function(questionAnswerBook){
                    questionAnswerBook.type = jsonConstants.metadataType.QUESTION_ANSWER_BOOK;
                });
                pinboardAnswerBooks.forEach(function(pinboardAnswerBook){
                    pinboardAnswerBook.type = jsonConstants.metadataType.PINBOARD_ANSWER_BOOK;
                });
                worksheets.forEach(function(worksheet) {
                    worksheet.type = jsonConstants.metadataType.LOGICAL_TABLE;
                    worksheet.subType = jsonConstants.metadataType.subType.WORKSHEET;
                });
                aggrWorksheets.forEach(function(worksheet) {
                    worksheet.type = jsonConstants.metadataType.LOGICAL_TABLE;
                    worksheet.subType = jsonConstants.metadataType.subType.AGGR_WORKSHEET;
                });

                var concatList = questionAnswerBooks.concat(pinboardAnswerBooks)
                .concat(worksheets)
                .concat(aggrWorksheets);

                var nonDeletedDependents = concatList.filter(function (dependent) {
                    return !dependent.isDeleted && !dependent.isHidden;
                });
                response.data = nonDeletedDependents.unique('id');
                return response;
            });
        }

        function getUniqueNonDeletedTableDependents(logicalTableIds) {
            return getUniqueNonDeletedDependents(getTableDependents(logicalTableIds));
        }

        function getUniqueNonDeletedColumnDependents(columnIds) {
            return getUniqueNonDeletedDependents(getColumnDependents(columnIds));
        }

        function getUniqueNonDeletedRelationshipDependents(columnIds) {
            return getUniqueNonDeletedDependents(getRelationshipDependents(columnIds));
        }

    /*
     * Retrieves incomplete metadata objects.
     *
     * @return {Promise<object>} Promise, that resolvs to object, containing lists
     * of incomplete objects grouped by type.
     */
        function getIncompleteList() {
            return new Command()
            .setPath('/dependency/listincomplete')
            .execute();
        }

        return {
            getDependents: getDependents,
            getTableDependents: getTableDependents,
            getColumnDependents: getColumnDependents,
            getUniqueNonDeletedTableDependents: getUniqueNonDeletedTableDependents,
            getUniqueNonDeletedColumnDependents: getUniqueNonDeletedColumnDependents,
            getUniqueNonDeletedRelationshipDependents: getUniqueNonDeletedRelationshipDependents,
            getIncompleteList: getIncompleteList
        };
    }]);
