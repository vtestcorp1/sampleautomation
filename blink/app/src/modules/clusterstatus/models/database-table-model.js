/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating single table in database.
 */

'use strict';

blink.app.factory('DatabaseTableModel', ['blinkConstants',
    'strings',
    'dateUtil',
    function (blinkConstants,
          strings,
          dateUtil) {

        function DatabaseTableModel(data, database, schema) {
            this.database = database;
            this.schema = schema;
            this.id = data.id;
            this.serving = data.serving;
            this.updated = data.updated;
        /* eslint camelcase: 1*/
            this.numRows = data.num_rows;
            this.numRegions = data.num_regions;
            this.approximateByteSize = data.approximate_byte_size;
            this.numDeletedRows = data.num_deleted_rows;
            this.clusterMemoryUsageByte = data.cluster_memory_usage_byte;
            this.servingStatus = data.serving_status;
        }

        DatabaseTableModel.prototype.getDetailTableRow = function () {
        /* eslint camelcase: 1*/
            return {
                database: this.database,
                userSchema: this.schema,
                name: this.id.name,
                guid: this.id.guid,
                status: this.servingStatus,
                servingTime: dateUtil.formatDate(
                this.serving.created_on / 1000,
                strings.adminUI.DEFAULT_TIME_FORMAT
            ),
                totalRowCount: this.numRows.total,
                rowCountSkew: this.numRows.skew,
                estimateSizeMb: (this.approximateByteSize.total / 1000000).toFixed(2),
                estimateSizeMbSkew: (this.approximateByteSize.skew / 1000000).toFixed(2),
                totalShards: this.numRegions,
                clusterSpaceUsedMb: (this.clusterMemoryUsageByte / 1000000).toFixed(2),
                lastUpdatedTime: dateUtil.formatDate(
                this.updated.created_on / 1000,
                strings.adminUI.DEFAULT_TIME_FORMAT
            ),
                numDeletedRows: this.numDeletedRows.total,
                dataVersion: this.serving.data_version,
                schemaVersion: this.serving.schema_version
            };
        };

        return DatabaseTableModel;
    }]);
