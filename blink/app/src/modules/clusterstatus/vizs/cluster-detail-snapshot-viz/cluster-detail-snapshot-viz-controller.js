/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Priyanshi Deshwal(priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller used in cluster detail pinboard to show snapshots.
 */

'use strict';

blink.app.controller('ClusterDetailSnapshotViz', ['$scope', 'blinkConstants',
    'strings',
    function ($scope, blinkConstants, strings) {

        var model = $scope.viz.getModel();

        $scope.tableModel = {
            data: model.getDetailTable('snapshots'),
            columns: [
                {
                    name: strings.adminUI.captions.SNAPSHOT_FINISH_TIME,
                    field: 'endTime',
                    id: 'endTime',
                    minWidth: 210
                },
                {
                    name: strings.adminUI.captions.SNAPSHOT_NAME,
                    field: 'name',
                    id: 'name',
                    minWidth: 216
                },
                {
                    name: strings.adminUI.captions.SNAPSHOT_REASON,
                    field: 'reason',
                    id: 'reason',
                    minWidth: 750,
                    maxWidth: 1200
                },
                {
                    name: strings.adminUI.captions.SNAPSHOT_SIZE,
                    field: 'size',
                    id: 'size'
                }
            ]
        };

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.CLUSTER_DETAIL_SNAPSHOT_TITLE);
        }

        init();
    }]);
