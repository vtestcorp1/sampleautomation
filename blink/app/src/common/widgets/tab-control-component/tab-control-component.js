/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Directive to show views in a tabbed container.
 */

'use strict';

// TODO(Rahul): This component is a translation to the directive tab-control already defined,
//              the usages of the directive need to be replaced with this component, and the
//              the directive needs to be deleted after that.
blink.app.component('tabControlComponent',
    {
        restrict: 'E',
        transclude: true,
        bindings: {
            bkCtrl: '<'
        },
        controller: blink.app.DynamicController,
        templateUrl: 'src/common/widgets/tab-control-component/tab-control-component.html'
    }
);

blink.app.factory('TabControlComponentController', ['jsUtil', function(jsUtil){
    function TabControlController(onTabActivated, defaultTabId, headerClass) {
        this.onTabActivated = onTabActivated;
        this.headerClass = headerClass;
        this.defaultTabId = defaultTabId;

        // TODO (sunny): load tab content lazily but keep loaded content around
        this.tabs = {};
    }

    TabControlController.prototype.onTabSelected = function (tab) {
        var tabId = tab.tabId;
        if (this.currentTabId === tabId) {
            return;
        }
        if( tab.disabled === true) {
            return;
        }
        var self = this;
        this.currentTabId = tabId;
        if (!!this.onTabActivated) {
            // wait for scope.currentTab to get updated
            jsUtil.executeInNextEventLoop(function(){
                self.onTabActivated(tabId);
            });
        }
    };

    TabControlController.prototype.isTabDisabled = function (tab) {
        return tab.disabled;
    };

    TabControlController.prototype.getToolTipText = function(tab) {
        return tab.tooltipText;
    };

    TabControlController.prototype.isCurrentTab = function (tab) {
        return tab.tabId === this.currentTabId;
    };

    TabControlController.prototype.addTab = function (tab) {
        var tabId = tab.tabId;
        this.tabs[tabId] = tab;
        if (tabId == this.defaultTabId) {
            this.onTabSelected(tab);
        }
    };

    return TabControlController;
}]);

blink.app.directive('tabControlComponentTab', [function(){
    function linker(scope, $el, attrs) {
        scope.isCurrentTab = function () {
            return scope.tabCtrl.isCurrentTab(this);
        };
        scope.tabCtrl.addTab(scope);
    }

    return {
        restrict: 'E',
        transclude: true,
        scope: {
            tabCtrl: '=',
            tabId: '@',
            tabName: '@',
            disabled: '<',
            tooltipText: '@'
        },
        link: linker,
        templateUrl: 'src/common/widgets/tab-control/tab-control-tab.html'
    };
}]);
