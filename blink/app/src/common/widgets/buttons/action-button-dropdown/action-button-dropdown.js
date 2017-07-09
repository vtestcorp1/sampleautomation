/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview directive for action button dropdown
 */

'use strict';

blink.app.directive('bkActionButtonDropdown', ['$q',
    'blinkConstants',
    'Logger',
    'strings',
    'ActionMenuComponent',
    function ($q, blinkConstants, Logger, strings, ActionMenuComponent) {
        function controller($scope) {
            var _logger = Logger.create('action-button-dropdown');

            $scope.clickHandlerInProgress = false;

            $scope.blinkConstants = blinkConstants;
            $scope.strings = strings;
            $scope.state = {};

            $scope.state.showActionDropdownMenu = false;
            $scope.state.showMenu = false;
            $scope.actionButton = $scope.menu.actions[0];
            $scope.icon = $scope.icon || 'bk-style-icon-triangle-solid';

            if ($scope.menu.actions.length > 1) {
                $scope.state.showActionDropdownMenu = true;
            }

            $scope.closeDropdown = function () {
                $scope.state.showMenu = false;
            };

            $scope.toggleDropdown = function () {
                $scope.state.showMenu = !$scope.state.showMenu;
            };

            $scope.buttonClass = !$scope.customButton && (!!$scope.onlyIcon
                ? 'bk-action-button-dropdown bk-icons-button'
                : 'bk-action-button-dropdown bk-reverse-text-icon');

            $scope.buttonText = !!$scope.onlyIcon ? '' : strings.ACTIONS;

            $scope.showWhen = function(action) {
                if(_.isFunction(action.showWhen)) {
                    return action.showWhen();
                }
                return true;
            };

            $scope.showLoading = function () {
                return $scope.isBusy() || $scope.clickHandlerInProgress;
            };

            $scope.hasAnyActionItem = function() {
                return $scope.menu.actions.filter($scope.showWhen).length > 0;
            };

            // Add the logic to track when an action is in progress so that we can show loading
            // indicator correctly.
            $scope.menu.actions.forEach(function (action) {
                var onClickAction = action.onClick;
                if (!onClickAction) {
                    return;
                }
                action.onClick = function ($evt) {
                    $scope.clickHandlerInProgress = true;
                    $q.when(onClickAction.bind(action)($evt)).finally(function() {
                        $scope.clickHandlerInProgress = false;
                    });
                };
            });
            $scope.actionMenu = new ActionMenuComponent($scope.menu.actions);
        }

        return {
            restrict: 'E',
            replace: true,
            controller: ['$scope', controller],
            scope: {
                menu: '=',
                isBusy: '&busy',
                onlyIcon: '@?',
                customButton: '=?',
                icon: '@?'
            },
            templateUrl: 'src/common/widgets/buttons/action-button-dropdown/action-button-dropdown.html'
        };
    }]);
