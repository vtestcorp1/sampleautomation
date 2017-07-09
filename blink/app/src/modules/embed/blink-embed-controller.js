/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Controller for blink-embed directive.
 */

'use strict';

blink.app.controller('BlinkEmbedController', ['$route',
    '$scope',
    'blinkConstants',
    'FullEmbedConfig',
    'strings',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'PinboardPageConfig',
    'PoweredFooterComponent',
    function ($route,
              $scope,
              blinkConstants,
              FullEmbedConfig,
              strings,
              jsonConstants,
              loadingIndicator,
              Logger,
              PinboardPageConfig,
              PoweredFooterComponent) {

        var logger = Logger.create('blink-embed-controller');

        $scope.isMissingViz = false;

        $scope.getInvalidEmbedConfigurationMessage = function () {
            return strings.embed.INVALID_EMBED_CONFIGURATION_MESSAGE;
        };

        $scope.isEmbedConfigurationValid = function () {
            return !!$route.current.params.documentId;
        };

        $scope.poweredFooterComponent = new PoweredFooterComponent();

        $scope.showPoweredByRibbon = function () {
            return !FullEmbedConfig.isPoweredFooterHidden();
        };

        $scope.$watch(function () {
            return $route.current.params;
        }, function () {
            if (!$scope.isEmbedConfigurationValid()) {
                return;
            }

            // only one vizId supported
            $scope.singleVizMode = !!$route.current.params.vizId;
            $scope.pinboardId = $route.current.params.documentId;
            $scope.pinboardPageConfig = new PinboardPageConfig({
                vizIdsToShow: $scope.singleVizMode ? [$route.current.params.vizId] : null,
                disallowTileRemoval: true,
                disallowTileMaximization: true,
                disallowVizContextEdit: true,
                disallowVizEmbedding: true,
                disallowLayoutChanges: true
            });

        }, true);
    }]);
