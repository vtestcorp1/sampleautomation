/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Sage data component.
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('enableFormulae', 'This flag enables formulae', true);

blink.app.controller('SageDataController', ['$rootScope',
    '$scope',
    '$timeout',
    'blinkConstants',
    'strings',
    'events',
    'eventTracker',
    'Logger',
    'panelFactory',
    'perfEvents',
    'sessionService',
    'util',
    function ($rootScope,
          $scope,
          $timeout,
          blinkConstants,
          strings,
          events,
          eventTracker,
          Logger,
          panelFactory,
          perfEvents,
          sessionService,
          util) {
        var _logger = Logger.create('sage-data-controller');

        $scope.hideAddSourcesPopover = function () {
            $scope.showAddSourcesPopover = false;
        };

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

        var initSourceIds = [],
            config = $scope.getDocumentConfig(),
            isReadOnly = false,
            documentHasUnderlyingDataAccess = true;

        function isWorksheet(config) {
            return config.type.toLowerCase() === blinkConstants.WORKSHEET_TYPE;
        }

        function isPinboard(config) {
            return config.type.toLowerCase() === blinkConstants.PINBOARD_TYPE;
        }

        function setupPerfTracker(components) {
            var renderedComponents = 0;
            var numComponents = components.length;
            var tracker = eventTracker.trackEvent(perfEvents.LEFT_PANEL_RENDERED, {});
            var remove = $scope.$on(events.LEFT_PANEL_COMPONENT_RENDERED_U, function(event) {
                ++renderedComponents;
                _logger.log('Received LEFT_PANEL_COMPONENT_RENDERE event for sage-data. rendered=%d, num=%d', renderedComponents, numComponents);
                event.stopPropagation();
                if (renderedComponents === numComponents) {
                    remove();
                    tracker.finish();
                    $scope.$emit(events.LEFT_PANEL_RENDERED_U);
                }
            });
        }

        if (config.model) {
            initSourceIds = (!isPinboard(config) && config.model.getSageDataScope()) || [];
            isReadOnly = config.model.isCorrupted() || config.model.getPermission().isReadOnly();
            documentHasUnderlyingDataAccess = !config.model.getPermission().isMissingUnderlyingAccess();
        } else if (!isWorksheet(config)) {
            initSourceIds = sessionService.getSageDataSource() || [];
        }

        var panelComponents = [];
        var sourcesPanelType = panelFactory.PanelComponent.types.SOURCES_WITH_LABELS;

        switch (config.type.toLowerCase()) {
            case blinkConstants.ANSWER_TYPE:
            case blinkConstants.PINBOARD_TYPE:
                panelComponents.push(sourcesPanelType);
                panelComponents.push(panelFactory.PanelComponent.types.COLUMNS);
                break;
            case blinkConstants.WORKSHEET_TYPE:
                panelComponents.push(sourcesPanelType);
                panelComponents.push(panelFactory.PanelComponent.types.BULK_COLUMNS);
                panelComponents.push(panelFactory.PanelComponent.types.FORMULAE);
                break;
        }

        if (panelComponents.length) {
            $scope.panel = new panelFactory.Panel(
            panelComponents,
            initSourceIds,
            config,
            isReadOnly,
            documentHasUnderlyingDataAccess,
            $scope.columnPanelComponentConfig
        );
            setupPerfTracker(panelComponents);
        }

        function shouldShowAddSourcesPopover(dataSources) {
            return (!dataSources || dataSources.length === 0)
            && !$scope.isSourcesPanelComponentExpanded();
        }

        $scope.onDataSourcesChange = function(dataSources) {
            $scope.showAddSourcesPopover = shouldShowAddSourcesPopover(dataSources);
            var onChangeCallback = $scope.onSourcesChangeCallback || _.noop;
            onChangeCallback(dataSources);
        };

        $scope.isSourcesPanelComponentExpanded = function () {
            if (!$scope.panel) {
                return false;
            }

            var sourcesComponent = $scope.panel.getComponentOfType(
                panelFactory.PanelComponent.types.SOURCES_WITH_LABELS);
            return sourcesComponent && sourcesComponent.isExpanded();
        };

        $scope.showAddSourcesPopover = isWorksheet($scope.panel.getDocumentConfig()) && !config.model;

        $scope.getHeaderText = function() {
            var config = $scope.panel.getDocumentConfig();
            var title = util.prop(config, 'leftPanelConfig.title');
            title = title || strings.dataPanel.TITLE;

            return title;
        };

        $scope.getHeaderIconClass = function() {
            var hidePanelOnHeaderClick = !!util.prop(config, 'leftPanelConfig.hidePanelOnHeaderClick');
            return hidePanelOnHeaderClick ? 'bk-style-icon-close' : 'bk-style-icon-arrow-left';
        };

        $scope.$watch(function(){
            return config.model;
        }, function(newModel, oldModel){
            if (newModel === oldModel || !newModel) {
                return;
            }
            initSourceIds = (!isPinboard(config) && newModel.getSageDataScope()) || [];
            isReadOnly = newModel.isCorrupted() || newModel.getPermission().isReadOnly();
            documentHasUnderlyingDataAccess = !newModel.getPermission().isMissingUnderlyingAccess();
        });

        $scope.onHeaderClick = function () {
            var hasAnyDataSources = ($scope.panel && $scope.panel.hasAnyDataSources());
            return $scope.onHeaderClickCallback(hasAnyDataSources);
        };

    }]);

blink.app.directive('sageData', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            getDocumentConfig: '&config',
            onSourcesChangeCallback: '=sourcesChangeCallback',
            columnPanelComponentConfig: '=',
            onHeaderClickCallback: '='
        },
        controller: 'SageDataController',
        templateUrl: 'src/modules/sage/data-panel/sage-data.html'
    };
});
