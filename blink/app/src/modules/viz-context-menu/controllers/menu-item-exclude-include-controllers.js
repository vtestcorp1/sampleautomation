/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview TODO
 */

'use strict';

blink.app.controller('MenuItemExcludeIncludeController', ['$scope',
    '$rootScope',
    'autoCompleteObjectUtil',
    'autoCompleteService',
    'events',
    'vizContextMenuUtil',
    'Logger',
    'strings',
    function ($scope,
          $rootScope,
          autoCompleteObjectUtil,
          autoCompleteService,
          events,
          vizContextMenuUtil,
          Logger,
          strings) {
        var _logger = Logger.create('exclude-drill-point-controller');

        $scope.strings = strings;
        var contextMenuData = $scope.contextMenuData;
        var filteredPairs = contextMenuData.columnValuePairs.slice(0);

        if (filteredPairs.length === 0) {
            _logger.error('Exclusion/inclusion drill without any filter columns', contextMenuData);
            return;
        }
        $scope.clickedValue = filteredPairs[0].column.getDataFormatter()(filteredPairs[0].value);

        function applyTransformations(transformations) {
            var sageClient = contextMenuData.sageClient;
            sageClient.transformTable(transformations)
            .then(function () {
                $scope.close(vizContextMenuUtil.VizContextMenuOptionType);
            }, function (error) {
                _logger.error('Error adding tokens to sage bar', error);
                $scope.close();
            });
        }

        $scope.exclude = function () {
            applyTransformations(vizContextMenuUtil.createExcludeQueryTransformations(filteredPairs));
        };

        $scope.showOnly = function () {
            applyTransformations(
            vizContextMenuUtil.createIncludeQueryTransformations(filteredPairs, contextMenuData.documentModel)
        );
        };
    }]);
