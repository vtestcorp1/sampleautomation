/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Priyanshi Deshwal(priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller used in cluster detail pinboard to show information.
 */

'use strict';

blink.app.controller('ClusterDetailInfoViz', ['$scope', 'blinkConstants',
    'strings',
    function ($scope, blinkConstants, strings) {

        var model = $scope.viz.getModel();

        $scope.tableModel = {
            data: model.getDetailTable('detail'),
            columns: [
                {
                    name: strings.adminUI.captions.PROPERTY,
                    field: 'key',
                    id: 'key',
                    minWidth: 150
                },
                {
                    name: strings.adminUI.captions.CONTENT,
                    field: 'value',
                    id: 'value',
                    minWidth: 400,
                    maxWidth: 450
                }
            ]
        };

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.CLUSTER_DETAIL_INFO_TITLE);
        }

        init();
    }]);
