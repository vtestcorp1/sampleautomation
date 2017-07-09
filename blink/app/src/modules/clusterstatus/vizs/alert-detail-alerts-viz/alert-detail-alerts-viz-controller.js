/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Priyanshi Deshwal(priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller used in alert details pinboard to show alert information.
 */

'use strict';
blink.app.controller('AlertDetailAlertsViz', ['$scope', 'blinkConstants',
    'strings',
    function ($scope, blinkConstants, strings) {

        var model = $scope.viz.getModel();

        $scope.tableModel = {
            data: model.getDetailTable('alerts'),
            columns: [
                {
                    name: 'Time',
                    field: 'time',
                    id: 'time',
                    minWidth: 210
                },
                {
                    name: 'Type',
                    field: 'type',
                    id: 'type',
                    minWidth: 148
                },
                {
                    name: 'Message',
                    field: 'message',
                    id: 'message',
                    minWidth: 1000,
                    maxWidth: 1200
                }
            ]
        };

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.ALERT_DETAIL_TITLE);
        }

        init();
    }]);
