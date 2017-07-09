/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),Shikhar Agarwal (shikhar@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for the worksheet page. This handles the following:
 * 1. Sets model for sharable item when user opens a saved worksheet
 * 2. Changes URL when sage query changes
 * 3. Sets parameters for sharable item when the user opens worksheet in the create mode.
 */

'use strict';

blink.app.directive('worksheetPage', [function () {

    function linker (scope, $el) {
    }

    return {
        restrict: 'A',
        replace: true,
        scope: {},
        link: linker,
        templateUrl: 'src/modules/worksheet/worksheet-page/worksheet-page.html',
        controller: 'WorksheetPageController'
    };
}]);

blink.app.controller('WorksheetPageController', ['$scope',
    '$rootScope',
    '$route',
    '$location',
    'autoCompleteObjectUtil',
    'blinkConstants',
    'strings',
    'DocumentLoader',
    'events',
    'jsonConstants',
    'Logger',
    'perfMeter',
    'WorksheetSageClient',
    function ($scope,
          $rootScope,
          $route,
          $location,
          autoCompleteObjectUtil,
          blinkConstants,
          strings,
          DocumentLoader,
          events,
          jsonConstants,
          Logger,
          perfMeter,
          WorksheetSageClient) {
        var _logger = Logger.create('worksheet-page-controller');

        var sageClient = new WorksheetSageClient();
        var context = autoCompleteObjectUtil.getNewACContextWithTable();
        sageClient.setContext(context);

        $scope.metadataConfig = {
            documentType: blinkConstants.WORKSHEET_TYPE,
            actionsMenuType: 'standard',
            canChangeLayout: false,
            model: null,
            sageClient: sageClient
        };

        $scope.isInWorksheetCreationMode = function () {
            return $route.current.mode == 'create';
        };

        var onModelUpdate = function(model) {
            $scope.metadataConfig.model = model;
            if (!!model) {
                $scope.metadataConfig.sageClient.setContext(model.getSageContext());
            }
            perfMeter.reportGenericMetricFinished('worksheetEdit');
        };

        var documentLoader = new DocumentLoader(onModelUpdate);

        $scope.$watch(function() {
            return $route.current.params.worksheetId;
        }, function(newDocumentId, oldDocumentId) {
            documentLoader.loadDocument(newDocumentId , jsonConstants.metadataType.LOGICAL_TABLE, true);
        });
    }]);
