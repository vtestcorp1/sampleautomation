/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Priyanshi Deshwal(priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller used in cluster detail pinboard to show logs.
 */

'use strict';

blink.app.controller('ClusterDetailLogViz', ['$scope', 'blinkConstants',
    'strings',
    function ($scope, blinkConstants, strings) {

        var model = $scope.viz.getModel();

        function filterByType(object) {
            if (object.type == 'INSTALL' || object.type == 'UPDATE'
                || object.type == 'UPDATE_END') {
                return true;
            } else {
                return false;
            }
        }

        var data = model.getDetailTable('events');

        $scope.tableModel = {
            data: data.filter(filterByType),
            columns: [
                {
                    name: strings.adminUI.captions.EVENT_TIMESTAMP,
                    field: 'time',
                    id: 'time',
                    minWidth: 210
                },
                {
                    name: strings.adminUI.captions.EVENT_TYPE,
                    field: 'type',
                    id: 'type'
                },
                {
                    name: strings.adminUI.captions.EVENT_RELEASE,
                    field: 'release',
                    id: 'release',
                    minWidth: 320,
                    maxWidth: 400
                }
            ]
        };

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.CLUSTER_DETAIL_LOG_TITLE);
        }

        init();
    }]);
