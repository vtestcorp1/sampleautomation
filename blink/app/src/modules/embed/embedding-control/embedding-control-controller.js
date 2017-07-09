/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Controller for a control that provides the user the ability to
 * get an embeddable link to a visualization.
 */

'use strict';

blink.app.controller('EmbeddingControlController', ['$scope',
    'blinkConstants',
    'strings',
    'embeddingInfoDialogService',
    function ($scope,
          blinkConstants,
          strings,
          embeddingInfoDialogService) {

        $scope.getControlTooltip = function () {
            return strings.embed.control.TITLE;
        };

        $scope.showEmbeddingControlPopup = function () {
            var documentModel = $scope.vizModel.getContainingAnswerModel();
            var documentId = documentModel.getId();
            var vizId = $scope.vizModel.getReferencingViz().getId();

            embeddingInfoDialogService.showEmbeddingInfoPopup(documentId, vizId);
        };
    }]);
