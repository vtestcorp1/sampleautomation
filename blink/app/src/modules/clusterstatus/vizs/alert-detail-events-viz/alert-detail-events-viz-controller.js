/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Priyanshi Deshwal(priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller used in alerts detail pinboard to show event information.
 */

'use strict';

blink.app.controller('AlertDetailEventsViz', ['$scope', 'blinkConstants',
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
            $scope.viz.getModel().setTitle(strings.adminUI.messages.EVENT_DETAIL_TITLE);
        }

        init();
    }]);
