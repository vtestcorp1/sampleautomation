/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Controller for top navigation bar
 */

'use strict';

blink.app.controller('NavController', ['$scope',
    '$q',
    '$rootScope',
    'alertService',
    'blinkConstants',
    'strings',
    'navService',
    '$route',
    '$location',
    'util',
    'env',
    'events',
    'session',
    'sessionService',
    'systemConfigService',
    'userService',
    'testCapture',
    'UserAction',
    'jsonConstants',
    function ($scope,
              $q,
              $rootScope,
              alertService,
              blinkConstants,
              strings,
              navService,
              $route,
              $location,
              util,
              env,
              events,
              session,
              sessionService,
              systemConfigService,
              userService,
              testCapture,
              UserAction,
              jsonConstants) {

        $scope.strings = strings.primaryNavigation;

        $scope.logout = function () {
            session.setLast401Path($location.path());
            var userAction = new UserAction(UserAction.LOGOUT);

            sessionService.doLogout()
                .then(function () {
                    session.setInfo(null);

                    // TODO(Vijay) - canvas state should not be in route (see app-canvas-controller)
                    $route.current.canvasState = null;
                    session.markManualLoggedOut();

                    navService.goToLogin();
                }, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                });
        };

        $scope.disableSignOut = function () {
            return systemConfigService.isSamlEnabled()
                && systemConfigService.autoRedirectToSamlLogin()
                && !flags.getValue('disableSAMLAutoRedirect');
        };

        // test capture button, wil not be shown in production
        $scope.canShowCaptureButton = function () {
            return env.testCapture;
        };

        $scope.onClickUserMenuButton = function () {
            $scope.showUserMenu = !$scope.showUserMenu;
        };

        if (env.testCapture) {
            $scope.testCapture = testCapture;
        }

        /**
         * Called when user clicks on the create button (Create Pinboard or Ask a Question)
         */
        $scope.onCreateBtnClick = function () {
            // If we are already on the answer page, then its a noop
            if ($scope.navState === blink.app.canvasStates.ANSWER) {
                return;
            }
            navService.goToAnswer();
        };

        $scope.onTourBtnClick = function () {
            $rootScope.$broadcast(events.TOUR_INTRO_D);
        };

        $scope.canShowTourBtn = function () {
            return $scope.navState === blink.app.canvasStates.HOME;
        };

        $scope.navigateToHome = function () {
            navService.goToHome();
            $scope.$emit(events.HIDE_SAGE_BUBBLE_U, true);
        };

        $scope.navigateToAdmin = function () {
            navService.goToAdmin();
            $scope.$emit(events.HIDE_SAGE_BUBBLE_U, true);
        };

        $scope.navigateToAnswers = function () {
            navService.goToAnswers();
        };

        $scope.navigateToPinboards = function () {
            navService.goToPinboards();
        };

        $scope.showAnswerTab = function () {
            if (sessionService.isAnswerDisabled()) {
                var installedSchemaVersion = JSON.stringify(sessionService.getInstalledSchemaVersion());
                var disabledAnswerReleaseVersion = $scope.strings.DISABLED_ANSWER_RELEASE_VERSION;

                var isAnswerTabEnabledVersion = function () {
                    return installedSchemaVersion < disabledAnswerReleaseVersion;
                };

                return isAnswerTabEnabledVersion();
            } else {
                return true;
            }
        };

        $scope.showInsights = function() {
            return sessionService.isA3Enabled();
        };

        $scope.showAdminTab = sessionService.hasAdminPrivileges();

        function updateNavState(currentRoute) {
            var canvasState = currentRoute.canvasState;
            if (util.hasValue(blink.app.canvasStates, canvasState)) {
                $scope.navState = canvasState;
            } else {
                $scope.navState = null;
            }
        }

        $scope.$on('$routeChangeSuccess', function ($event, $currentRoute, $previousRoute) {
            if (!$currentRoute.page) {
                return;
            }
            updateNavState($currentRoute);
        });

        $scope.isAppTourEnabled = function () {
            return env.isAppTourEnabled();
        };

        $scope.isHelpEnabled = function () {
            /* global flags */
            if (!flags.getValue('enableHelp')) {
                return false;
            }
            return true;
        };

        updateNavState($route.current);

        $scope.helpWidget = {
            isHelpOpen: false
        };

        var clickSourceToHelpPagePath = {
            'KeywordHelpSlide': 'Keywords',
            'DataHelpSlide': 'Tips_Tricks'
        };

        $scope.$on(events.TIPS_HELP_WIDGET, function (event, clickSource) {
            $scope.helpWidget.isHelpOpen = true;
            if (clickSource) {
                $scope.helpWidget.pagePath = clickSourceToHelpPagePath[clickSource];
            }
        });

        $scope.toggleNavExpansion = function () {
            $scope.isExpanded = !$scope.isExpanded;
        };

        $scope.closeNavExpansion = function () {
            $scope.isExpanded = false;
        };

        $scope.actionMenuConfig = {
            actions: [
                _.assign({}, blinkConstants.helpMenuItems.help, {
                    onClick: function($event) {
                        $scope.helpWidget.isHelpOpen = true;
                    }
                }),
                _.assign({}, blinkConstants.helpMenuItems.community, {
                    onClick: function($event) {
                        window.open(blinkConstants.communityLink);
                    }
                })
            ]
        };
    }]);
