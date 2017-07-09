/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Directive for Creating relationships
 * This directive supports 3 modes
 * 1. To allow generic data modelling changes.
 * 2. Ad Hoc relationship building, which is scoped for query on query scenarios.
 * - setting isAdHocRelationshipBuilder enables ad hoc mode.
 * - sourceIds is used to limit the targets tables for the joining a table.
 * - sage Context is passed to allow this directive to make addJoin/deleteJoin calls to Sage.
 * 3. shouldOwnTarget: the user can only link to his own tables from any table.
 */

'use strict';

blink.app.directive('relationshipEditor', [function () {
    return {
        restrict: 'E',
        scope: {
            sourceTableModel: '=',
            sourceIds: '=',
            shouldOwnTarget: '=',
            isAdHocRelationshipBuilder: '=',
            sageContext: '='
        },
        replace: true,
        templateUrl: 'src/common/relationship/relationship-editor.html',
        controller: 'RelationshipEditorController'
    };
}]);

blink.app.controller('RelationshipEditorController', ['$scope',
    '$q',
    '$rootScope',
    'alertService',
    'autoCompleteService',
    'blinkConstants',
    'strings',
    'dateUtil',
    'events',
    'jsonConstants',
    'Logger',
    'loadingIndicator',
    'metadataService',
    'session',
    'sessionService',
    'UserAction',
    'util',
    'worksheetUtil',
    function($scope,
         $q,
         $rootScope,
         alertService,
         autoCompleteService,
         blinkConstants,
         strings,
         dateUtil,
         events,
         jsonConstants,
         Logger,
         loadingIndicator,
         metadataService,
         session,
         sessionService,
         UserAction,
         util,
         worksheetUtil) {
        var _logger = Logger.create('relationship-editor-controller');

        var sessionBackendConfig = session.getBackendConfig(),
            queryOnQueryEnabled = !!(sessionBackendConfig && sessionBackendConfig.enableDbView);
        var isAggregatedWorksheetTableJoinEnabled
            = sessionService.isAggregatedWorksheetTableJoinEnabled();

        var SOURCE_SUBTYPE_TO_ALLOWED_DESTINATION_SUBTYPE_MAP = (function() {
            var map = {};
            map[jsonConstants.metadataType.subType.SYSTEM_TABLE] = [
                jsonConstants.metadataType.subType.IMPORTED_DATA,
                jsonConstants.metadataType.subType.SYSTEM_TABLE
            ];
            if (isAggregatedWorksheetTableJoinEnabled) {
                map[jsonConstants.metadataType.subType.SYSTEM_TABLE]
                .push(jsonConstants.metadataType.subType.AGGR_WORKSHEET);
            }

            map[jsonConstants.metadataType.subType.IMPORTED_DATA] = [
                jsonConstants.metadataType.subType.SYSTEM_TABLE,
                jsonConstants.metadataType.subType.IMPORTED_DATA
            ];
            if (isAggregatedWorksheetTableJoinEnabled) {
                map[jsonConstants.metadataType.subType.IMPORTED_DATA]
                .push(jsonConstants.metadataType.subType.AGGR_WORKSHEET);
            }

            map[jsonConstants.metadataType.subType.WORKSHEET] = [
                jsonConstants.metadataType.subType.IMPORTED_DATA
            ];
            map[jsonConstants.metadataType.subType.AGGR_WORKSHEET] = [
                jsonConstants.metadataType.subType.AGGR_WORKSHEET
            ];
            if (isAggregatedWorksheetTableJoinEnabled) {
                map[jsonConstants.metadataType.subType.AGGR_WORKSHEET]
                .push(jsonConstants.metadataType.subType.IMPORTED_DATA);
                map[jsonConstants.metadataType.subType.AGGR_WORKSHEET]
                .push(jsonConstants.metadataType.subType.SYSTEM_TABLE);
            }
            if (queryOnQueryEnabled) {
                map[jsonConstants.metadataType.subType.DB_VIEW] = [
                    jsonConstants.metadataType.subType.SYSTEM_TABLE,
                    jsonConstants.metadataType.subType.IMPORTED_DATA
                ];

                map[jsonConstants.metadataType.subType.SYSTEM_TABLE].push(jsonConstants.metadataType.subType.DB_VIEW);
                map[jsonConstants.metadataType.subType.IMPORTED_DATA].push(jsonConstants.metadataType.subType.DB_VIEW);
            }
            return map;
        })();

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;
        $scope.relationshipEditorMessages = $scope.strings.metadataExplorer.relationshipEditorMessages;

        $scope.config = {
            name: 'Untitled',
            desc: '',
            sourceColumns: [],
            destinationColumns: [],
            newSourceColumn: null,
            newDestinationColumn: null,
            sourceColumnOptions: [],
            destinationColumnOptions: [],
            destinationTableOptions: [],
            destinationTableModel: null
        };

        if (!$scope.sourceTableModel) {
            _logger.error('no source table model for relationship-editor');
            return;
        }

        $scope.hasExistingRelationships = function() {
            return $scope.sourceTableModel.getRelationships().length > 0;
        };

        $scope.goToRelationshipViewer = function() {
            $scope.$emit(events.SWITCH_RELATIONSHIP_EDIT_MODE, false);
        };

        $scope.config.sourceColumnOptions = $scope.sourceTableModel.getColumns()
        .map(function(column) {
            return {
                name: column.getName(),
                id: column.getGuid(),
                type: column.getDataType()
            };
        });

        $scope.isCompositeKeyValid = function() {
            return !!$scope.config.newSourceColumn && !!$scope.config.newDestinationColumn;
        };

        $scope.addCompositeKey = function() {
            if (!$scope.isCompositeKeyValid()) {
                return;
            }
            $scope.config.sourceColumns.add($scope.config.newSourceColumn);
            $scope.config.destinationColumns.add($scope.config.newDestinationColumn);
            $scope.config.newSourceColumn = null;
            $scope.config.newDestinationColumn = null;
        };

        $scope.isValidRelationship = function() {
            var sourceColumnLength = $scope.config.sourceColumns.length;
            var destinationColumnLength = $scope.config.destinationColumns.length;

            var areAllColumnsMatching = $scope.config.sourceColumns.every(function(srcCol, index) {
                return srcCol.type === $scope.config.destinationColumns[index].type;
            });

            return !!$scope.config.name && areAllColumnsMatching &&
            (sourceColumnLength > 0 && destinationColumnLength > 0 &&
                sourceColumnLength === destinationColumnLength);
        };

        $scope.getTooltipHtml = function (table) {
            var nameValuePairs = new util.NameValuePairs();
            nameValuePairs.add('NAME', table.name);
            nameValuePairs.add('CREATED', dateUtil.epochToTimeAgoString(table.created));
            nameValuePairs.add('UPDATED', dateUtil.epochToTimeAgoString(table.modified));
            if (!!table.databaseStripe) {
                nameValuePairs.add('DATABASE', table.databaseStripe);
            }
            if (!!table.schemaStripe) {
                nameValuePairs.add('SCHEMA', table.schemaStripe);
            }
            if (!!table.authorDisplayName) {
                nameValuePairs.add('AUTHOR', table.authorDisplayName);
            }
            return nameValuePairs.getTemplate();
        };

    //TODO(Rahul): Move this sage related code to a utility in sage section.
        function getColumnHeadersFromColumnList(columns){
            return columns.map(function(column) {
                var columnHeader = new sage.EntityHeader();
                columnHeader.name = column.name;
                columnHeader.guid = column.id;
                return columnHeader;
            });
        }

        function createSageJoinRequest(name, id, sourceTableModel, destinationTableModel, sourceColumns, destinationColumns) {
            var join = new sage.ACJoin();
            var header = new sage.EntityHeader();
            header.name = name;
            header.guid = id;

            join.header = header;
            join.left = new sage.EntityHeader();
            join.left.name = sourceTableModel.getName();
            join.left.guid = sourceTableModel.getGuid();

            join.right = new sage.EntityHeader();
            join.right.name = destinationTableModel.getName();
            join.right.guid = destinationTableModel.getGuid();

            var sourceColumnHeaders = getColumnHeadersFromColumnList(sourceColumns);
            var destinationColumnHeaders = getColumnHeadersFromColumnList(destinationColumns);

            join.setLeftColumns(sourceColumnHeaders);
            join.setRightColumns(destinationColumnHeaders);

            var joinRequest = new sage.ACJoinRequest();
            joinRequest.join = join;

            return joinRequest;
        }

    /**
     *
     * @param sageResponse {SageResponse}
     * SageResponse.answerReponse: sage.AnswerResponse
     */
        function onSageRelationshipAdditionResponse (sageResponse) {
            var joinResponseWrapper = sageResponse.answerResponse;
            if (joinResponseWrapper.getErrorCode() != sage.ErrorCode.SUCCESS) {
                onRelationshipAdditionFailure();
                return;
            }

            var context = joinResponseWrapper.getContext();
            $scope.sageContext.setJoins(context.getJoins());
            $scope.$emit(events.RELATIONSHIP_ADD_SUCCESSFUL);
        }

        function onRelationshipAdditionFailure (error) {
            _logger.error('Adding of join failed', error);
        }

        function handleCallosumRelationshipAddition(relationship) {
            if (!$scope.isAdHocRelationshipBuilder) {
            //TODO(Rahul/Jasmeet): For ad-hoc joins this is being called twice, inverstigate.
                $scope.$emit(events.RELATIONSHIP_ADD_SUCCESSFUL);
            } else {
                var joinRequest = createSageJoinRequest(
                relationship.header.name,
                relationship.header.id,
                $scope.sourceTableModel,
                $scope.config.destinationTableModel,
                $scope.config.sourceColumns,
                $scope.config.destinationColumns
            );

                return autoCompleteService.addJoin($scope.sageContext, joinRequest);
            }
        }

        $scope.addRelationship = function() {
            if (!$scope.isValidRelationship()) {
                return;
            }
            var sourceColumnIds = $scope.config.sourceColumns.map(function(column) {
                return column.id;
            });
            var destinationColumnIds = $scope.config.destinationColumns.map(function(column) {
                return column.id;
            });

            loadingIndicator.show();
        // NOTE : In this case we want to add a Callosum relationship first to avoid the case where sage context is
        // aware of a join and uses that in an answer but this is actually not available on callosum server.
            var userAction = new UserAction(UserAction.CREATE_RELATIONSHIP);



            var callosumRelationshipAdditionPromise = metadataService.addRelationship(
            $scope.config.name,
            $scope.config.desc,
            $scope.sourceTableModel.getGuid(),
            $scope.config.destinationTableModel.getGuid(),
            sourceColumnIds,
            destinationColumnIds)
            .then(function(response) {
                alertService.showUserActionSuccessAlert(userAction, response);
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }).then(handleCallosumRelationshipAddition, onRelationshipAdditionFailure)
            .finally(loadingIndicator.hide);

            if ($scope.isAdHocRelationshipBuilder) {
                callosumRelationshipAdditionPromise.then(onSageRelationshipAdditionResponse, onRelationshipAdditionFailure);
            }
        };

        $scope.$watch('config.destinationTable', function(newValue) {
            if (!newValue) {
                return;
            }

            var params = {};
            if ($scope.isAdHocRelationshipBuilder) {
                params.showHidden = true;
            }

            var userAction = new UserAction(UserAction.FETCH_TABLE_DETAILS);
            worksheetUtil.getLogicalTableModel(newValue.id, params).then(function(response) {
                $scope.config.destinationTableModel = response.data;
                resetDestinationColumns();
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        });

        $scope.$watch(function() {
            return $scope.config.newSourceColumn;
        }, function(newValue) {
            resetDestinationColumns();
        });

        var resetDestinationColumns = function() {
            if (!$scope.config.newSourceColumn || !$scope.config.destinationTableModel) {
                $scope.config.destinationColumnOptions = [];
                return;
            }

            $scope.config.destinationColumnOptions = $scope.config.destinationTableModel.getColumns()
            .map(function(column) {
                return {
                    name: column.getName(),
                    id: column.getGuid(),
                    type: column.getDataType()
                };
            }).filter(function(column) {
                return $scope.config.newSourceColumn.type == column.type;
            });
        };

        function fetchDestinationTablesById (ids) {

            var userAction = new UserAction(UserAction.FETCH_TABLES_DETAILS);
            metadataService.getMetadataDetails(
            jsonConstants.metadataType.LOGICAL_TABLE,
            ids,
            true,
            true
        )
            .then(function(response){
                var data = response.data;
                var tableOptions = [];
                var sourceTableId = $scope.sourceTableModel.getId();
                data.storables.forEach(function(storable){
                    if (storable.header.id != sourceTableId) {
                        tableOptions.push(storable.header);
                    }
                });

                $scope.config.destinationTableOptions = tableOptions;

                return data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }
    );
        }

        function isTableAllowedAsDestination(table) {
            var isAllowed = !$scope.shouldOwnTarget ||
            table.author === sessionService.getUserGuid();
            return isAllowed && table.id != $scope.sourceTableModel.getId();
        }

        function fetchAllJoinTargetTables () {
            var sourceTableMetadataSubType = $scope.sourceTableModel.getMetadataSubType();
            var allowedDestinationSubTypes = SOURCE_SUBTYPE_TO_ALLOWED_DESTINATION_SUBTYPE_MAP[sourceTableMetadataSubType];

            var userAction = new UserAction(UserAction.FETCH_TABLE_LIST);
            metadataService.getMetadataList(
            jsonConstants.metadataType.LOGICAL_TABLE,
            {subTypes: allowedDestinationSubTypes}
        )
            .then(function(response) {
                var data = response.data;
                var destinationTables = data.headers;
                $scope.config.destinationTableOptions = destinationTables.filter(function(table) {
                    return isTableAllowedAsDestination(table);
                });
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        var fetchDestinationTables = function() {
            if ($scope.isAdHocRelationshipBuilder) {
                fetchDestinationTablesById($scope.sourceIds);
            } else {
                fetchAllJoinTargetTables();
            }
        };

        fetchDestinationTables();
    }]);
