/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Directive to show views in a tabbed container.
 */

'use strict';

blink.app.directive('tabControl', [ function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            onTabActivated: '&',
            headerClass: '@',
            defaultTabId: '@'
        },
        controller: 'TabControlController',
        templateUrl: 'src/common/widgets/tab-control/tab-control.html'
    };
}]);

blink.app.controller('TabControlController', ['$scope',
    'jsUtil',
    'safeApply',
    function ($scope,
              jsUtil,
              safeApply) {
        // TODO (sunny): load tab content lazily but keep loaded content around
        $scope.tabs = [];

        $scope.onTabSelected = function (tab) {
            if ($scope.currentTab === tab) {
                return;
            }

            $scope.currentTab = tab;
            if (!!$scope.onTabActivated) {
                // wait for scope.currentTab to get updated
                jsUtil.executeInNextEventLoop(function () {
                    safeApply($scope, function () {
                        $scope.onTabActivated({
                            activeTab: $scope.currentTab
                        });
                    });
                });
            }
        };

        this.isCurrentTab = $scope.isCurrentTab = function (tab) {
            return tab === $scope.currentTab;
        };

        this.addTab = function (tab) {
            $scope.tabs.push(tab);
            if ($scope.tabs.length === 1) {
                $scope.onTabSelected(tab);
            }
            if (!!$scope.defaultTabId && $scope.defaultTabId !== '') {
                if (tab.tabId === $scope.defaultTabId) {
                    $scope.onTabSelected(tab);
                }
            }
        };
    }]);


blink.app.directive('tabControlTab', [function(){
    function linker(scope, $el, attrs, tabController) {
        scope.isCurrentTab = function () {
            return tabController.isCurrentTab(this);
        };
        tabController.addTab(scope);
    }

    return {
        restrict: 'E',
        transclude: true,
        require: '^tabControl',
        scope: {
            tabId: '@',
            tabName: '@'
        },
        link: linker,
        templateUrl: 'src/common/widgets/tab-control/tab-control-tab.html'
    };
}]);
