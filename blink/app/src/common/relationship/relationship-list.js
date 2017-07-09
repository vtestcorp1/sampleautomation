/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Directive to display and create relationships
 * This directive supports 2 modes
 * 1. To allow generic data modelling changes.
 * 2. Ad Hoc relationship building, which is scoped for query on query scenarios.
 * - setting isAdHocRelationshipBuilder enables ad hoc mode.
 * - sourceIds is used to limit the targets tables for the joining a table.
 * - sage Context is passed to allow this directive to make addJoin/deleteJoin calls to Sage.
 */

'use strict';

blink.app.directive('relationshipList', [function() {
    return {
        restrict: 'E',
        scope: {
            tableId : '=',
            sourceIds : '=',
            isAdHocRelationshipBuilder : '=',
            sageContext: '=',
            showHidden: '=',
            isReadOnly: '=',
            shouldOwnTarget: '=',
            canEditOnlyOwnRelationships: '='
        },
        replace: true,
        templateUrl: 'src/common/relationship/relationship-list.html',
        controller: 'relationshipListController'
    };
}]);

blink.app.controller('relationshipListController', ['$scope',
    '$q',
    'alertService',
    'blinkConstants',
    'strings',
    'CancelablePromise',
    'events',
    'jsonConstants',
    'Logger',
    'sessionService',
    'worksheetUtil',
    'UserAction',
    function($scope,
         $q,
         alertService,
         blinkConstants,
         strings,
         CancelablePromise,
         events,
         jsonConstants,
         Logger,
         sessionService,
         worksheetUtil,
         UserAction) {
        var _logger = Logger.create('relationship-list-controller');


        $scope.addRelationshipMessage = strings.metadataExplorer.relationshipEditorMessages.ADD_RELATIONSHIP;
        $scope.fetchTablePromise = null;


        $scope.$watch('tableId', function() {
            refreshList();
        });

    // TODO(Jasmeet): Remove eventing based update.
        $scope.$on(events.RELATIONSHIP_ADD_SUCCESSFUL, function() {
            refreshList();
        });

        $scope.$on(events.RELATIONSHIP_DELETE_SUCCESSFUL, function() {
            refreshList();
        });

        $scope.$on(events.RELATIONSHIP_UPDATE_SUCCESSFUL, function() {
            refreshList();
        });

        $scope.$on(events.SWITCH_RELATIONSHIP_EDIT_MODE, function($event, relationshipEditMode) {
            $scope.setRelationshipEditMode(relationshipEditMode);
        });

        $scope.setRelationshipEditMode = function(relationshipEditMode) {
            $scope.inAddRelationshipMode = relationshipEditMode;
        };

        $scope.showAddRelationshipBtn = function () {
            var canAddRelationships = sessionService.hasAdminPrivileges()
            || sessionService.hasDataManagementPrivileges()
            || sessionService.hasUserDataUploadPrivileges();
            return !$scope.inAddRelationshipMode && !$scope.isReadOnly && canAddRelationships;
        };

        $scope.showIsEmpty = function () {
            if(!$scope.tableModel) {
                return true;
            }

            return !!$scope.isReadOnly && !$scope.relationships.length;
        };

        $scope.isReadOnlyRelationship = function(relationship) {
            var isUserDefinedOrGenericRelationship =
            relationship.getMetadataType() == jsonConstants.relationshipMetadataType.USER_DEFINED ||
            relationship.getMetadataType() == jsonConstants.relationshipMetadataType.GENERIC;


            var canEdit = !$scope.canEditOnlyOwnRelationships
            || relationship.getAuthor() === sessionService.getUserGuid();

            return !!$scope.isReadOnly
            || !canEdit
            || !isUserDefinedOrGenericRelationship;
        };

        $scope.emptyMessage = strings.emptyRelationshipsMessage;

        function fetchDestinationTables(relationships) {
            if (relationships.length === 0) {
                return $q.resolve([]);
            }

            var destinationTableIdsToRelationships =
            mapTableToRelationships(relationships);
            var destinationTableIds = Object.keys(destinationTableIdsToRelationships);
            var userAction = new UserAction(UserAction.FETCH_TABLE_DETAILS);
            var params = {};
            params.showHidden = true;
            return worksheetUtil.getLogicalTableModels(destinationTableIds, params).then(function(response){
                $scope.isLoading = false;
                response.data.forEach(function(tableModel) {
                    var relations = destinationTableIdsToRelationships[tableModel.getId()];

                    relations.forEach(function(relationship){
                        relationship.destinationTableModel = tableModel;
                    });
                });

                return relationships.filter(function(relationship){
                    return !!relationship.destinationTableModel;
                });

            }, function(response) {
                _logger.error('Error getting logicalTableModel');
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        function mapTableToRelationships(relationships) {
            var destinationTableIdsToRelationships = {};

            relationships.forEach(function(relationship){
                var tableId = relationship.getDestinationTableId();
                if (Object.has(destinationTableIdsToRelationships,tableId)) {
                    destinationTableIdsToRelationships[tableId].push(relationship);
                } else {
                    destinationTableIdsToRelationships[tableId] = [relationship];
                }
            });

            return destinationTableIdsToRelationships;
        }

        var refreshList = function() {
            if(!$scope.tableId) {
                return;
            }
            if (!!$scope.fetchTablePromise) {
                $scope.fetchTablePromise.cancel();
            }

            var params = {};
            params.showHidden = true;

            $scope.inAddRelationshipMode = false;
            $scope.isLoading = true;
            $scope.tableModel = null;
            $scope.relationships = [];
            var userAction = new UserAction(UserAction.FETCH_TABLE_DETAILS);

        //Note(chab) i cannot wrap the whole promise, as cancelable will cancel the .then that FOLLOWs the
        // wrapped promise.
            $scope.fetchTablePromise = new CancelablePromise(worksheetUtil.getLogicalTableModel($scope.tableId, params));
            $scope.fetchTablePromise
            .then(function(response) {
                var model = response.data;
                $scope.tableModel = model;
                $scope.fetchTablePromise = null;
                return model.getRelationships();
            }, function(response) {
                _logger.error('Error getting logicalTableModel');
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            })
            .then(fetchDestinationTables)
            .then(function(relationships){
                $scope.relationships = relationships;
            })
            .finally(function(){
                $scope.isLoading = false;
                $scope.inAddRelationshipMode = !$scope.isReadOnly && !$scope.relationships.length;
            }
        );
        };
    }]);
