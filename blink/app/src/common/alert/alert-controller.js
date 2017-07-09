/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Controller for alert mechanism
 *
 * TODO (Shikhar): The structure of alert data needs to be formalized.
 */

'use strict';

blink.app.controller('AlertController', ['$scope', 'blinkTimeout', 'blinkConstants', 'strings', 'events', 'alertConstants', 'env', 'l10n',
    function ($scope, blinkTimeout, blinkConstants, strings, events, alertConstants, env, l10n) {

        var cancelTimeout = null;

        function cleanupCountdown() {
            if (cancelTimeout) {
                cancelTimeout();
                cancelTimeout = null;
            }
        }

        function showCountdown(msg, startSeconds) {
            if (startSeconds > 0) {
                $scope.message = l10n(msg, startSeconds);
                cancelTimeout = blinkTimeout(
                    function () {
                        cancelTimeout = null;
                        showCountdown(msg, startSeconds - 1);
                        if (!$scope.$$phase) {
                            $scope.$digest();
                        }
                    },
                    1000
                );
            } else {
            // Note(joy): this logic should be put in a passed doneCallback function but somehow it does not
            // reflect in the UI immediately, even with $digest().
                $scope.message = strings.alert.SERVER_UNREACHABLE_CONNECTING;
                $scope.action = {};
            }
        }

        $scope.hidden = true;
        $scope.showDetails = false;
        $scope.type = '';
        $scope.message  = '';
        $scope.messageType = '';
        $scope.details = '';
        $scope.countdownSeconds = 0;
        $scope.action = {};
        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

        $scope.isSuccessMessage = function() {
            return $scope.type === alertConstants.type.SUCCESS;
        };

        $scope.hasDetails = function() {
            return !!$scope.details || !Object.isEmpty($scope.customUrl);
        };

        $scope.toggleDetails = function() {
            $scope.showDetails = !$scope.showDetails;
        };

        $scope.canClose = function () {
            return $scope.type === alertConstants.type.ERROR ||
               $scope.type === alertConstants.type.SUCCESS ||
               $scope.allowClose;
        };

        $scope.shouldShowActionMessage = function () {
            return !!$scope.message && !$scope.action.link;
        };

        $scope.shouldShowActionMessageLink = function () {
            return !!$scope.message && !!$scope.action.link;
        };

    // handle a custom action if there is any to act on
        $scope.handleAction = function () {
            if (!$scope.action || !$scope.action.handler) { return; }
            $scope.action.handler();
        };

        function getSuccessHidingDelay(data) {
            return data.successHidingDelay || env.successAlertHidingDelay;
        }

        $scope.showAlert = function (data) {
            var successHidingDelay = getSuccessHidingDelay(data);
            var message = data.message;

            $scope.successHidingDelay = successHidingDelay;
            $scope.formattedMessageUrl = data.formattedMessageUrl;
            $scope.messageType = data.messageType || '';
            $scope.type = data.type || '';
            $scope.countdownSeconds = data.countdownSeconds || 0;
            $scope.action = data.action || {};
            $scope.allowClose = data.allowClose || false;
            $scope.message = message;

            $scope.showDetails = false;
            $scope.details = data.details;
            $scope.customData = data.customData || {};
            $scope.customUrl = data.customUrl;

            $scope.showAlertUI();

        // if no message passed then nothing more to do
            if (!message) {
                return;
            }

        // auto-hide a success message
            if ($scope.type === alertConstants.type.SUCCESS
                && !env.disableSuccessNotificationAutoHide) {
                $scope.hideTimer = blinkTimeout(
                    function() {
                        $scope.hideAlertUI();
                    },
                    successHidingDelay
                );
            }

            cleanupCountdown();
        // for a countdown message type, show countdown seconds.
            if ($scope.messageType === alertConstants.messageType.COUNTDOWN) {
                showCountdown($scope.message, $scope.countdownSeconds);
            }
        };

        $scope.$on(events.SHOW_ALERT_D, function (event, data) {
            $scope.showAlert(data);
        });

        $scope.$on(events.HIDE_ALERT_D, function (event, data) {
            if ($scope.hideTimer) {
                $scope.hideTimer();
            }

            cleanupCountdown();
            $scope.hideAlertUI();
        });

        $scope.$on("$destroy", function() {
            if ($scope.hideTimer) {
                $scope.hideTimer();
            }
            cleanupCountdown();
        });
    }]);
