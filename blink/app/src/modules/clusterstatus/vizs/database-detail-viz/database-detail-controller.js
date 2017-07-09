/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Controller used in database details pinboard to show information.
 */

'use strict';

blink.app.controller('DatabaseDetailViz', ['$scope', 'blinkConstants',
    'strings',
    function ($scope, blinkConstants, strings) {

        var model = $scope.viz.getModel();

        var data = model.getDetailTable('tables').sort(function (a, b) {
            var keyA = new Date(a.lastUpdatedTime),
                keyB = new Date(b.lastUpdatedTime);
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
                    field: 'userSchema',
                    id: 'userSchema',
                    minWidth: 160
                },
                {
                    name: strings.adminUI.captions.DATABASE_TABLE_NAME,
                    field: 'name',
                    id: 'name',
                    minWidth: 270
                },
                {
                    name: strings.adminUI.captions.DATABASE_TABLE_GUID,
                    field: 'guid',
                    id: 'guid',
                    minWidth: 290
                },
                {
                    name: strings.adminUI.captions.DATABASE_TABLE_STATUS,
                    field: 'status',
                    id: 'status',
                    maxWidth: 127
                },
                {
                    name: strings.adminUI.captions.DATABASE_SERVING_TIMESTAMP,
                    field: 'servingTime',
                    id: 'servingTime',
                    minWidth: 210
                },
                {
                    name: strings.adminUI.captions.DATABASE_NUM_ROWS,
                    field: 'totalRowCount',
                    id: 'totalRowCount',
                    maxWidth: 130
                },
                {
                    name: strings.adminUI.captions.DATABASE_ROW_SKEW,
                    field: 'rowCountSkew',
                    id: 'rowCountSkew',
                    maxWidth: 125
                },
                {
                    name: strings.adminUI.captions.DATABASE_APPROXIMATE_SIZE_MB,
                    field: 'estimateSizeMb',
                    id: 'estimateSizeMb',
                    maxWidth: 140
                },
                {
                    name: strings.adminUI.captions.DATABASE_APPROXIMATE_SIZE_MB_SKEW,
                    field: 'estimateSizeMbSkew',
                    id: 'estimateSizeMbSkew',
                    maxWidth: 165
                },
                {
                    name: strings.adminUI.captions.DATABASE_TOTAL_SHARDS,
                    field: 'totalShards',
                    id: 'totalShards',
                    maxWidth: 110
                },
                {
                    name: strings.adminUI.captions.DATABASE_CLUSTER_SPACE_USED,
                    field: 'clusterSpaceUsedMb',
                    id: 'clusterSpaceUsedMb',
                    maxWidth: 162
                },
                {
                    name: strings.adminUI.captions.DATABASE_LAST_UPDATED_TIME,
                    field: 'lastUpdatedTime',
                    id: 'lastUpdatedTime'
                },
                {
                    name: strings.adminUI.captions.DATABASE_NUM_DELETED_ROWS,
                    field: 'numDeletedRows',
                    id: 'numDeletedRows',
                    maxWidth: 110
                },
                {
                    name: strings.adminUI.captions.DATABASE_SCHEMA_VERSION,
                    field: 'schemaVersion',
                    id: 'schemaVersion',
                    maxWidth: 122
                },
                {
                    name: strings.adminUI.captions.DATABASE_DATA_VERSION,
                    field: 'dataVersion',
                    id: 'dataVersion',
                    maxWidth: 110
                }
            ]
        };

        function init() {
            $scope.viz.getModel().setTitle(strings.adminUI.messages.DATABASE_DETAIL_TITLE);
        }

        init();
    }]);
