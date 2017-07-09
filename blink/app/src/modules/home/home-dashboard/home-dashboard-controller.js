/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Controller for Home Page Dashboard
 */

'use strict';

blink.app.controller('HomeDashboardController', ['$scope',
    '$q',
    'alertService',
    'blinkConstants',
    'strings',
    'events',
    'eventTracker',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'metadataService',
    'PinboardPageConfig',
    'perfEvents',
    'PinboardSelectorComponent',
    'sessionService',
    'UserAction',
    'util',
    function ($scope,
          $q,
          alertService,
          blinkConstants,
          strings,
          events,
          eventTracker,
          jsonConstants,
          loadingIndicator,
          Logger,
          metadataService,
          PinboardPageConfig,
          perfEvents,
          PinboardSelectorComponent,
          sessionService,
          UserAction,
          util) {
        var _logger = Logger.create('home-dashboard-controller');

        var currentPinboardId = null;

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

    /**
     * Called when user selects a pinboard in the drop down
     */
        function onPinboardSelection(selectedPinboard) {
            currentPinboardId = selectedPinboard[jsonConstants.OWNER_KEY];
            if (!currentPinboardId) {
                return;
            }
            sessionService.setHomePinboardId(currentPinboardId);
        }

        function loadCurrentPinboardItem() {
            metadataService
            .getMetadataList(
                jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
                { batchSize: 1 }
            )
            .then(
                function(response) {
                    var headers = response.data[jsonConstants.MULTIPLE_HEADER_KEY];
                    if (!headers || headers.length === 0) {
                        $scope.homeDashboardState = HomeDashboardStates.NO_PINBOARDS;
                        return;
                    }
                    var pinboardHeader = headers[0];
                    currentPinboardId = pinboardHeader[jsonConstants.ID_KEY];
                    onPinboardSelection(pinboardHeader);
                    $scope
                        .pinboardSelectorComponent
                        .setSelectedItem(pinboardHeader);
                },
                function (error) {
                    _logger.error(
                        'Error in getting home page pinboard list',
                        error
                    );
                    $scope.homeDashboardState = HomeDashboardStates.NO_PINBOARDS;
                }
            );
        }

        $scope.onPinboardModelUpdateSuccess = function(newModel){
            if (!newModel) {
                $scope.homeDashboardState = HomeDashboardStates.EMPTY_PINBOARD;
                return;
            }
            var answerSheet = newModel.getCurrentAnswerSheet();
            $scope.pinboardSelectorComponent.setSelectedItem(newModel.getHeaderJson());
            if (answerSheet.isEmpty()) {
                $scope.homeDashboardState = HomeDashboardStates.EMPTY_PINBOARD;
            } else {
                $scope.homeDashboardState = HomeDashboardStates.NON_EMPTY_PINBOARD;
            }
        };

        $scope.onPinboardModelUpdateFailure = function (error) {
            currentPinboardId = null;
            $scope.homeDashboardState = HomeDashboardStates.WAITING;
            loadCurrentPinboardItem();
        };

        var HomeDashboardStates = $scope.HomeDashboardStates = {
            WAITING: 'WAITING',
            NO_PINBOARDS: 'NO_PINBOARDS',
            EMPTY_PINBOARD: 'EMPTY_PINBOARD',
            NON_EMPTY_PINBOARD: 'NON_EMPTY_PINBOARD'
        };

        function init() {
            $scope.homeDashboardState = HomeDashboardStates.WAITING;
            $scope.answerType = blinkConstants.PINBOARD_TYPE;

            $scope.pinboardPageConfig = new PinboardPageConfig({
                disallowLayoutChanges: true,
                disallowTileRemoval: true
            });

            var homePageTracker = eventTracker.trackEvent(perfEvents.LOAD_HOME_PAGE, { });
            util.registerOneShotEventListener($scope, perfEvents.PINBOARD_RENDERED, function() {
                homePageTracker.finish();
                $scope.$emit(events.HOME_PAGE_LOADED_U);
            });

            $scope.getSelectedPinboardId = function() {
                return currentPinboardId || sessionService.getHomePinboardId();
            };

            $scope.pinboardSelectorComponent = new PinboardSelectorComponent(
            function(pinboards) {
                onPinboardSelection(pinboards[0]);
            }
        );

            var lastHomePinboardId = sessionService.getHomePinboardId() || null;
            if (!lastHomePinboardId) {
                loadCurrentPinboardItem();
            }
        }

        $scope.init = init;
    }]);
