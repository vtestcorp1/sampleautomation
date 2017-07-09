/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Priyanshi Deshwal(priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller used in alerts detail pinboard to show notifications information.
 */

'use strict';

blink.app.controller('AlertDetailNotificationsViz', ['$scope', 'blinkConstants',
    'strings',
    function ($scope, blinkConstants, strings) {

        var model = $scope.viz.getModel();

        $scope.tableModel = {
            data: model.getDetailTable('events'),
            columns: [
                {
                    name: 'Time',
                    field: 'time',
                    id: 'time',
                    minWidth: 210
                },
                {
                    name: 'User',
                    field: 'user',
                    id: 'user',
                    minWidth: 148
                },
                {
                    name: 'Summary',
                    field: 'summary',
                    id: 'summary',
                    minWidth: 1000,
                    maxWidth: 1200
                }
            ]
        };

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.NOTIFICATION_DETAIL_TITLE);
        }

        init();
    }]);
