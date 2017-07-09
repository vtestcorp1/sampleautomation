/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Raj Setaluri (raj@thoughtspot.com)
 *
 * @fileoverview Controller for Snapshot Dialog
 */

'use strict';

blink.app.controller('PinboardSnapshotController', ['$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'alertService',
    'blinkConstants',
    'dateUtil',
    'dialog',
    'events',
    'jsonConstants',
    'Logger',
    'metadataPermissionService',
    'navService',
    'pinboardMetadataService',
    'sessionService',
    'strings',
    'UserAction',
    'util',
    function ($q,
          $rootScope,
          $scope,
          $timeout,
          alertService,
          blinkConstants,
          dateUtil,
          dialog,
          events,
          jsonConstants,
          Logger,
          metadataPermissionService,
          navService,
          pinboardMetadataService,
          sessionService,
          strings,
          UserAction,
          util) {
        var _logger = Logger.create('pinboard-snapshot-dialog-controller');

    // indicating if in the process of deleting or creating snapshot
        $scope.updatingSnapshotList = false;
        $scope.snapshots = [];
        $scope.strings = strings.pinboardSnapshots;

        $scope.shouldShowLoadingIndicator = function() {
            return $scope.isLoading && !$scope.snapshots.length;
        };

    // utility for time format conversion
        $scope.formatSnapshotTimestamp = function(snapshot) {
        // TODO(raj): move time format into constant
            return dateUtil.formatDate(snapshot.created, "MM/dd/yyyy hh:mm");
        };

    /**
     * Fetch an updated list of snapshots
     *
     * @return {Object} list of snapshots
     */
        function updateModel() {
            var userAction = new UserAction(UserAction.FETCH_PINBOARD_SNAPSHOT_LIST);

            function generateFailureHandler(userAction) {
                return function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                };
            }

            $scope.isLoading = true;

            return pinboardMetadataService.listPinboardSnapshots($scope.pinboardModel.getId())
            .then(function (response) {
                return response.data.headers;
            }, generateFailureHandler(userAction))
            .then(function(snapshots) {
                if (!snapshots || snapshots.length === 0) {
                    return [];
                }
                // TODO(raj): handle permissions!
                return snapshots;
            })
            .then(function(snapshots) {
                $scope.snapshots = snapshots;
                return snapshots;
            })
            .finally(function(){
                $scope.isLoading = false;
            }
        );
        }

    /**
     * Clear the new snapshot input
     */
        function clearNewSnapshotInput() {
            $scope.newSnapshotName = '';
            $scope.newSnapshotDescription = '';
            $scope.showNewSnapshotInput = false;
        }

    /**
     * Show the new snapshot input
     */
        $scope.onShowCreateSnapshotClick = function () {
            $scope.showNewSnapshotInput = true;
            $scope.focusOnNewSnapshotInput();
        };

    /**
     * Navigate to snapshot
     *
     * @param {Object} snapshot   The snapshot to which to navigate
     */
        $scope.onNavigateToSnapshot = function (snapshot) {
            navService.goToPinboardSnapshot($scope.pinboardModel.getId(), snapshot.id);
        };

    /**
     * Delete snapshot
     *
     * @param {Object} snapshot   The snapshot which to delete
     */
        $scope.onDeleteSnapshot = function (snapshot) {
        // already doing stuff...wait
            if ($scope.updatingSnapshotList) {
                _logger.error('Tried deleting snapshot while another action was taking place.');
            }

            var doDelete = function(snapshot) {
                $scope.updatingSnapshotList = true;
            // TODO(raj): user action success/failure
            // TODO(raj): failure handling
                pinboardMetadataService.deletePinboardSnapshot(
                $scope.pinboardModel._header.id,
                snapshot.id
            ).then(function() {
                updateModel();
            }).finally(function() {
                $scope.updatingSnapshotList = false;
            });
            };

        // TODO(raj): show deletion confirm dialog before doing delete
            doDelete(snapshot);
        };

    /**
     * Taking a new snapshot
     */
        $scope.takeSnapshot = function () {
            if (!$scope.newSnapshotInputIsValid || $scope.updatingSnapshotList) {
            // New snapshot name is not valid, return
                _logger.error("Can not take snapshot now. Snapshot name/description"
                + "is invalid OR another action is currently taking place.");
            }

            $scope.updatingSnapshotList = true;

        // TODO(raj): user action success/failure
        // TODO(raj): failure handling
            pinboardMetadataService.savePinboardSnapshot(
            $scope.pinboardModel,
            $scope.newSnapshotName.trim(),
            $scope.newSnapshotDescription.trim(),
            Date.now()
        ).then(function() {
            clearNewSnapshotInput();
            updateModel();
        }).finally(function() {
            $scope.updatingSnapshotList = false;
        });
        };

    /**
     * highlights the parts of the input that match query
     * @param input
     * @param query
     * @returns {string}
     */
        $scope.highlightSearchResult = function(input, query) {
            return input.replace(RegExp('('+ query + ')', 'g'), '<span class="bk-filtered-match">$1</span>');
        };

    /**
     * Determine if the new snapshot name/description user has typed is valid
     */
        $scope.$watchGroup(['newSnapshotName', 'newSnapshotDescription'], function(newValues, oldValues) {
            var name = newValues[0];
            var description = newValues[1];
            if (util.isEmptyOrOnlySpaces(name) || util.isEmptyOrOnlySpaces(description)) {
                $scope.newSnapshotInputIsValid = false;
            } else {
                $scope.newSnapshotInputIsValid = true;
            }
        }
    );

        $scope.showNewSnapshotInput = false;

        updateModel();
    }]);
