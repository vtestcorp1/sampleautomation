/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Controller for Home Activity Widget
 */

'use strict';

blink.app.controller('HomeActivityController', ['$q',
    '$scope',
    'activityService',
    'strings',
    'util',
    function ($q,
          $scope,
          activityService,
          strings,
          util) {

        var loadState = util.LoadStates.UNINITIALIZED;

    /**
     * Set showEmptyState to true on scope to show empty state UI
     * @param {Object} items
     */
        function showEmptyStateIfNeeded(items) {
            $scope.showEmptyState = !items || !items.length;
        }

    /**
     * Update the activity model by calling the acitivity service
     */
        function updateActivityModel() {
            loadState = util.LoadStates.INITIALIZING;

            activityService.getModel()
            .then(function (activityModel) {
                loadState = util.LoadStates.INITIALIZED;
                $scope.items = activityModel.getItems();
                showEmptyStateIfNeeded($scope.items);
            }, function(error){
                loadState = util.LoadStates.INITIALIZATION_FAILED;
                return $q.reject(error);
            });
        }

        function shouldTryInitialization() {
            return loadState === util.LoadStates.UNINITIALIZED
            || loadState === util.LoadStates.INITIALIZATION_FAILED;
        }

        $scope.isInitializing = function () {
            return loadState === util.LoadStates.INITIALIZING;
        };

        $scope.handleVisibilityChange = function (isVisible) {
            if (isVisible && shouldTryInitialization()) {
                updateActivityModel();
            }
        };

    }]);
