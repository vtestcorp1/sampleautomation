/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Directive for Viewing relationship
 * This directive supports 2 modes
 * 1. To allow generic data modelling changes.
 * 2. Ad Hoc relationship building, which is scoped for query on query scenarios.
 * - setting isAdHocRelationshipBuilder enables ad hoc mode.
 * - sourceIds is used to limit the targets tables for the joining a table.
 * - sage Context is passed to allow this directive to make addJoin/deleteJoin calls to Sage.
 */

'use strict';

blink.app.directive('relationshipViewer', [function () {
    return {
        restrict: 'E',
        scope: {
            relationship: '=',
            sourceTableModel: '=',
            destinationTableModel: '=',
            isAdHocRelationshipBuilder: '=',
            sageContext: '=',
            isReadOnly: '='
        },
        replace: true,
        templateUrl: 'src/common/relationship/relationship-viewer.html',
        controller: 'RelationshipViewerController'
    };
}]);

blink.app.controller('RelationshipViewerController', ['$scope',
    '$q',
    '$rootScope',
    'alertConstants',
    'alertService',
    'autoCompleteService',
    'blinkConstants',
    'strings',
    'dependencyService',
    'dependencyDialogService',
    'events',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'metadataService',
    'sessionService',
    'UserAction',
    'worksheetUtil',
    function($scope,
         $q,
         $rootScope,
         alertConstants,
         alertService,
         autoCompleteService,
         blinkConstants,
         strings,
         dependencyService,
         dependencyDialogService,
         events,
         jsonConstants,
         loadingIndicator,
         Logger,
         metadataService,
         sessionService,
         UserAction,
         worksheetUtil) {
        var _logger = Logger.create('relationship-viewer-controller');

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;
        $scope.relationshipName = $scope.relationship.getName();
        $scope.relationshipDesc = $scope.relationship.getDescription();

        $scope.getSourceColumnName = function(columnId) {
            return $scope.sourceTableModel.getColumns().find(function(column) {
                return column.getGuid() == columnId;
            }).getName();
        };

        $scope.getDestinationColumnName = function(columnId) {
            if (!$scope.destinationTableModel) {
                return null;
            }
            return $scope.destinationTableModel.getColumns().find(function(column) {
                return column.getGuid() == columnId;
            }).getName();
        };

        $scope.goToAddRelationshipMode= function() {
            $scope.$emit(events.SWITCH_RELATIONSHIP_EDIT_MODE, true);
        };

        function onRelationshipDeletionFailure(error) {
            _logger.error('relationship deletion failed', error);
        }

        function onRelationshipDeletionSuccess() {
            $scope.$emit(events.RELATIONSHIP_DELETE_SUCCESSFUL);
        }

        function onRelationshipUpdateFailure(error) {
            _logger.error('relationship update failed', error);
        }

        function onRelationshipUpdateSuccess() {
            $scope.$emit(events.RELATIONSHIP_UPDATE_SUCCESSFUL);
        }

        function handleSageRelationshipDeletion (sageResponse) {
            var joinResponseWrapper = sageResponse.answerResponse;
            if (joinResponseWrapper.getErrorCode() != sage.ErrorCode.SUCCESS) {
                onRelationshipDeletionFailure();
                return;
            }
            $scope.sageContext.setJoins(joinResponseWrapper.getContext().getJoins());
            var userAction = new UserAction(UserAction.DELETE_RELATIONSHIP);
            return metadataService.deleteMetadataItems(
            [$scope.relationship.getId()],
            jsonConstants.metadataType.LOGICAL_RELATIONSHIP
        ).then(function(response) {
            alertService.showUserActionSuccessAlert(userAction, response);
            return response.data;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
        }

        function getMatchingJoinIndex(sageContext, id) {
            var adHocJoins = sageContext.getJoins();
            var matchingIndex = null;
            if (!!adHocJoins) {
                matchingIndex = adHocJoins.findIndex(function(join){
                    return join.header.guid === id;
                });
            }
            return matchingIndex;
        }

        $scope.hasRelationshipNameChanged = function() {
            var relationshipNameChanged = !!$scope.relationshipName &&
            $scope.relationshipName != $scope.relationship.getName();
            var relationshipDescChanged = !!$scope.relationshipDesc &&
            $scope.relationshipDesc != $scope.relationship.getDescription();
            return (relationshipNameChanged || relationshipDescChanged);
        };

        $scope.canChangeRelationshipName = function() {
            return sessionService.hasAdminPrivileges() || sessionService.hasDataManagementPrivileges();
        };

        function notifyOfDependentsOnDelete(relationship, dependents) {
            var title = strings.alert.dataDeletionAlertMessages.cannotDelete,
                messages = strings.alert.dataDeletionAlertMessages.withDependents.singular,
                message = messages.assign({itemName: relationship.getName()});

            dependencyDialogService.showDependencyDialog(title, message, dependents);
        }

        $scope.deleteRelationship = function() {
            var promise;
            if ($scope.isAdHocRelationshipBuilder) {
                var matchingIndex = getMatchingJoinIndex($scope.sageContext, $scope.relationship.getId());
                promise = autoCompleteService.deleteJoin($scope.sageContext, matchingIndex)
                .then(handleSageRelationshipDeletion, onRelationshipDeletionFailure)
                .then(onRelationshipDeletionSuccess, onRelationshipDeletionSuccess);
            } else {
                var userAction = new UserAction(UserAction.FETCH_RELATIONSHIP_DEPENDENTS);
                promise = dependencyService.getUniqueNonDeletedRelationshipDependents([$scope.relationship.getId()])
                .then(function(response) {
                    var dependents = response.data;
                    if (dependents.length === 0) {
                        var userAction2 = new UserAction(UserAction.DELETE_RELATIONSHIP);
                        loadingIndicator.show();
                        metadataService.deleteRelationShip(
                            $scope.relationship.getId()
                        ).then(function(response) {
                            alertService.showUserActionSuccessAlert(userAction2, response);
                            return response.data;
                        }, function(response) {
                            alertService.showUserActionFailureAlert(userAction2, response);
                            return $q.reject(response.data);
                        }).then(onRelationshipDeletionSuccess, onRelationshipDeletionFailure)
                            .finally(loadingIndicator.hide.bind(loadingIndicator));
                    } else {
                        notifyOfDependentsOnDelete($scope.relationship, dependents);
                    }
                    return dependents;
                }, function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                }
            );
            }
        };

        $scope.updateRelationshipName = function() {
            if ($scope.isAdHocRelationshipBuilder) {
                _logger.error('does not support update relationships in ad hoc mode.');
            } else {
                var userAction = new UserAction(UserAction.UPDATE_RELATIONSHIP);
                metadataService.updateRelationshipName(
                $scope.relationship.getId(),
                $scope.relationshipName,
                $scope.relationshipDesc
            ).then(function(response) {
                alertService.showUserActionSuccessAlert(userAction, response);
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }
            ).then(onRelationshipUpdateSuccess, onRelationshipUpdateFailure);
            }
        };
    }]);
