/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Priyanshi Deshwal(priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller used in search engine details pinboard to show table information.
 */

'use strict';

blink.app.controller('SearchDetailTableViz', ['$scope', 'blinkConstants',
    'strings',
    function ($scope, blinkConstants, strings) {

        var model = $scope.viz.getModel();

        var data = model.getDetailTable('tables').sort(function (a, b) {
            var keyA = new Date(a.lastUpdatedAt),
                keyB = new Date(b.lastUpdatedAt);
            if(keyA < keyB) {
                return 1;
            }
            if(keyA > keyB) {
                return -1;
            }
            return 0;
        });

        $scope.tableModel = {
            data: data,
            columns: [
                {
                    name: strings.adminUI.captions.DATABASE_NAME,
                    field: 'database',
                    id: 'database',
                    minWidth: 190
                },
                {
                    name: strings.adminUI.captions.USER_SCHEMA_NAME,
                    field: 'schema',
                    id: 'schema',
                    minWidth: 162
                },
                {
                    name: strings.adminUI.captions.SEARCH_TABLE_NAME,
                    field: 'name',
                    id: 'name',
                    minWidth: 270
                },
                {
                    name: strings.adminUI.captions.DATABASE_TABLE_STATUS,
                    field: 'databaseStatus',
                    id: 'databaseStatus',
                    maxWidth: 127
                },
                {
                    name: strings.adminUI.captions.DATABASE_CREATED_ON,
                    field: 'lastUpdatedAt',
                    id: 'lastUpdatedAt',
                    minWidth: 210
                },
                {
                    name: strings.adminUI.captions.DATABASE_NUM_ROWS,
                    field: 'numOfRows',
                    id: 'numOfRows',
                    maxWidth: 130
                },
                {
                    name: strings.adminUI.captions.DATABASE_REPLICATED,
                    field: 'replicated',
                    id: 'replicated',
                    maxWidth: 127
                },
                {
                    name: strings.adminUI.captions.DATABASE_USED_CAPACITY,
                    field: 'usedCapacityMB',
                    id: 'usedCapacityMB',
                    maxWidth: 500
                },
                {
                    name: strings.adminUI.captions.DATABASE_ROW_SKEW,
                    field: 'rowSkew',
                    id: 'rowSkew',
                    maxWidth: 130
                },
                {
                    name: strings.adminUI.captions.SEARCH_TABLE_STATUS,
                    field: 'searchStatus',
                    id: 'searchStatus',
                    maxWidth: 145
                },
                {
                    name: strings.adminUI.captions.SEARCH_LAST_BUILD_DURATION,
                    field: 'lastBuildTime',
                    id: 'lastBuildTime',
                    maxWidth: 186
                },
                {
                    name: strings.adminUI.captions.DATABASE_TOTAL_SHARDS,
                    field: 'numShards',
                    id: 'numShards',
                    maxWidth: 130
                }
            ]
        };

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.SEARCH_DETAIL_TABLE_TITLE);
        }

        init();
    }]);
