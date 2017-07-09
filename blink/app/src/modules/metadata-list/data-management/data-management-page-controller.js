/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Controller for Sources List Page
 */

'use strict';

blink.app.controller('DataManagementPageController', ['$location',
    '$scope',
    '$route',
    'blinkConstants',
    'loadingIndicator',
    'sessionService',
    'strings',
    'TabControlComponentController',
    'userAdminService',
    function($location,
             $scope,
             $route,
             blinkConstants,
             loadingIndicator,
             sessionService,
             strings,
             TabControlComponentController,
             userAdminService) {
        var TABLES_PATH = '/data/tables';
        var SOURCES_PATH = '/data/impds';
        var EMPTY_TOOLTIP_STRING = '';

        $scope.strings = strings.metadataListPage.dataManagement;
        $scope.constants = blinkConstants.metadataListPage.dataManagement;

        var onTabActivated = function(activeTabId) {
            var canvasSubstate = $route.current.canvasSubstate;
            var tabId = getTabIdFromCanvasSubstate(canvasSubstate);
            if (tabId != activeTabId) {
                if (tabId == $scope.constants.dataSources.tabId) {
                    $location.path(SOURCES_PATH);
                } else {
                    $location.path(TABLES_PATH);
                }
            }
        };

        var getTabIdFromCanvasSubstate = function(canvasSubState) {
            if (canvasSubState == blink.app.canvasSubstates.DATA_SOURCES) {
                return $scope.constants.dataSources.tabId;
            } else {
                return $scope.constants.tables.tabId;
            }
        };

        var tabId = getTabIdFromCanvasSubstate($route.current.canvasSubstate);

        $scope.ctrl = new TabControlComponentController(onTabActivated, tabId, 'primary-nav');

        $scope.disabledTabs = {};

        $scope.isTabDisabled = function(tabId) {
            return ($scope.disabledTabs[tabId] === 1);
        };

        $scope.getToolTipText = function(tabId) {
            if (tabId === $scope.constants.dataSources.tabId
                && $scope.isTabDisabled(tabId)) {
                return $scope.constants.dataSources.disabledTooltipText;
            }
            return EMPTY_TOOLTIP_STRING;
        };

        $scope.isTabOpen = function(tabId) {
            return $scope.ctrl.isCurrentTab(tabId);
        };

        $scope.populateDisabledTabs = function() {
            // Here we find out whether the current user has datamanagement or admin
            // privileges, which are required to view the datasources tab.
            var privileges =  sessionService.getUserPrivileges();
            var hasPrivilege =  _.some(privileges, function(privilege) {
                return (blinkConstants.metadataListPage.dataManagement.privileges[privilege]
                != void 0);
            });
            if( ! hasPrivilege) {
                $scope.disabledTabs[$scope.constants.dataSources.tabId] = 1;
            }
        };

        $scope.$watch(function() {
            return $route.current.canvasSubstate;
        }, function(newVal, oldVal) {
            if (newVal == oldVal) {
                return;
            }
            var tabId = getTabIdFromCanvasSubstate(newVal);
            $scope.ctrl.onTabSelected(tabId);
        });

        $scope.populateDisabledTabs();
    }]);
