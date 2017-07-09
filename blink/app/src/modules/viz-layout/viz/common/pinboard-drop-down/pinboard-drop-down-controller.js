/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Controller for Pinboard Dialog
 */

'use strict';

blink.app.controller('PinboardDropDownController', ['$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'alertService',
    'blinkConstants',
    'strings',
    'dateUtil',
    'events',
    'jsonConstants',
    'Logger',
    'metadataPermissionService',
    'metadataService',
    'pinboardMetadataService',
    'pinboardMetadataUtil',
    'navService',
    'sessionService',
    'UserAction',
    'util',
    function ($q,
          $rootScope,
          $scope,
          $timeout,
          alertService,
          blinkConstants,
          strings,
          dateUtil,
          events,
          jsonConstants,
          Logger,
          metadataPermissionService,
          metadataService,
          pinboardMetadataService,
          pinboardMetadataUtil,
          navService,
          sessionService,
          UserAction,
          util) {
        var _logger = Logger.create('pinboard-dialog-controller');

        $scope.addingPinboard = false;
        $scope.pinboards = [];
        $scope.pinboardsWithActiveVizAddition = {};
        $scope.strings = strings.visualizationPinner.modal;

        $scope.shouldShowLoadingIndicator = function() {
            return $scope.isLoading && !$scope.pinboards.length;
        };

    /**
     * Fetch an updated pinboard list from the pinboards service
     *
     * @return {Object}     A promise that will resolve with the new pinboard model
     */
        function updateModel() {

            var userAction = new UserAction(UserAction.FETCH_PINBOARD_LIST),
                userAction2 = new UserAction(UserAction.FETCH_PINBOARD_PERMISSIONS);

            function generateFailureHandler(userAction) {
                return function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                };
            }

            $scope.isLoading = true;

            // Filter parameters to filter list of pinboards shown in 'add visualization to
            // pinboard' UI in answer page.
            // Show only regular pinboards and not insights pinboards as option where
            // visualization can be pinned.
            var filterParams = {
                "autoCreated" : false // Do not show a3 insights pinboard.
            };

        // is there a way to handle error in one callback while keeping the good action ?
            return metadataService.getMetadataListModel(
                jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
                filterParams)
            .then(function (response) {
                var listModel = response.data;
                return listModel.getItems();
            }, generateFailureHandler(userAction))
            .then(function(pinboards) {
                if (!pinboards || pinboards.length === 0) {
                    return [];
                }
                return metadataPermissionService.getEffectivePermissions(
                    pinboards,
                    jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
                    false)
                    .then(function (response) {
                        var effectivePermissionsModel = response.data;
                        return pinboards.filter(function (pinboard) {
                            var pinboardPermission = effectivePermissionsModel.getObjectPermission(pinboard.id).getShareMode();
                            return pinboardPermission == jsonConstants.permission.MODIFY;
                        });
                    }, generateFailureHandler(userAction2));
            })
            .then(function(pinboards) {
                $scope.pinboards = pinboards;
                return pinboards;
            })
            .finally(function(){
                $scope.isLoading = false;
            }
        );
        }

    /**
     * Hide the new pinboard input and clear it
     */
        function clearNewPinboardInput() {
            $scope.newPinboardName = '';
            $scope.showNewPinboardInput = false;
        }

    /**
     * Adds the viz to the last added pinboard
     */
        function selectNewestItem() {
            if (!$scope.pinboards || !$scope.pinboards.length) {
                return;
            }
            $scope.onAddToPinboardClick($scope.pinboards[0], true);
        }

    /**
     * Show the new pinboard input
     */
        $scope.onShowCreatePinboardClick = function () {
            $scope.showNewPinboardInput = true;
            $scope.focusOnNewPinboardInput();
        };

    /**
     * Add the viz to the pinboard that was clicked
     *
     * @param {Object} pinboard     The pinboard item to which to add the viz
     */
        $scope.onAddToPinboardClick = function (pinboard) {
            var vizModel = $scope.vizModel;
            var pinboardId = pinboard.owner,
                pinboardName = pinboard.name,
                vizId = vizModel.getId();
            if (!pinboardId || !pinboardName || !vizId || $scope.pinboardsWithActiveVizAddition[pinboard.id]) {
                return;
            }

            vizModel.setTitle($scope.pinTitle.name);
            vizModel.description = $scope.pinTitle.desc;

            var answerBookMetadata = vizModel.getContainingAnswerModel().getMetadata();

            $scope.pinboardsWithActiveVizAddition[pinboard.id] = true;

            var userAction = new UserAction(UserAction.ADD_VIZ_TO_PINBOARD);
            pinboardMetadataService.addVizToPinboard(vizId, pinboardId, answerBookMetadata)
            .then(pinboardMetadataUtil.processResponse)
            .then(function(response) {
                var pinboard = response.data;
                $rootScope.$broadcast(events.VIZ_ADDED_TO_PINBOARD_U, pinboard);
                var substitutions = ['Visualization', pinboardName];
                alertService.showUserActionSuccessAlert(userAction, response, {
                    actionParams: [pinboardName, pinboardId],
                    substitutions: substitutions
                });
                return pinboard;
            }, function(response) {
                var substitutions = [pinboardName];
                alertService.showUserActionFailureAlert(userAction, response, {substitutions: substitutions});
                return $q.reject(response.data);
            })
            .finally(function () {
                $scope.pinboardsWithActiveVizAddition[pinboard.id] = false;
            });
        };

    /**
     * Create a new pinboard
     */
        $scope.createPinboard = function () {
            if (!$scope.newPinboardNameIsValid || $scope.addingPinboard) {
            // New pinboard name is not valid, return
                return;
            }

            $scope.addingPinboard = true;

            var userAction = new UserAction(UserAction.CREATE_PINBOARD);
            var promise = metadataService.createMetadataObject(
            jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            $scope.newPinboardName.trim()
        ).then(function() {
            clearNewPinboardInput();
            updateModel()
                .then(selectNewestItem);
        });
            promise['finally'](function() {
                $scope.addingPinboard = false;
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
     * Determine if the new pinboard name user has typed is valid
     */
        $scope.$watch('newPinboardName', function (pinboardName) {
            if (util.isEmptyOrOnlySpaces(pinboardName)) {
                $scope.newPinboardNameIsValid = false;
            } else {
                $scope.newPinboardNameIsValid = true;
            }
        });

        $scope.showNewPinboardInput = false;

        var answerModel = $scope.vizModel.getContainingAnswerModel();
        var name = answerModel.getName() || '';
        var desc = answerModel.getDescription() || '';
        $scope.pinTitle = {
            name: name.slice(0),
            desc: desc.slice(0)
        };

        updateModel();
    }]);
