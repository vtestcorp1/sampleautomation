/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating single table in search engine.
 */

'use strict';

blink.app.factory('SearchDetailTableModel', ['blinkConstants',
    'strings',
    'dateUtil',
    function (blinkConstants,
          strings,
    dateUtil) {

        function SearchDetailTableModel(data) {
            this.database = data.database;
            this.schema = data.schema;
            this.name = data.name;
            this.databaseStatus = data.databaseStatus;
            this.lastUpdatedAt = data.lastUploadedAt;
            this.numOfRows = data.numOfRows;
            this.rowSkew = data.rowSkew;
            this.numShards = data.numShards;
            this.usedCapacityMB = data.csvSizeWithReplicationMB;
            this.replicated = data.replicated;
            this.searchStatus = data.state;
            this.lastBuildTime = data.lastBuildTime;
        }

        function getValueOrEmptyString(num) {
            if (num < 0) {
                return '';
            } else {
                return moment.duration(num, 'ms').format("h[h]m[m]s[s]");
            }
        }

        function getNumberOrEmptyString(num) {
            if (num < 0) {
                return '';
            }
            return Math.round(num * 100) / 100;
        }

        function getStringForReplicated(replicated) {
            if (replicated === true) {
                return 'Y';
            } else if(replicated === false) {
                return 'N';
            } else {
                return '';
            }
        }

        SearchDetailTableModel.prototype.getDetailTableRow = function () {
            return {
                database: this.database,
                schema: this.schema,
                name: this.name,
                databaseStatus: this.databaseStatus,
                lastUpdatedAt: dateUtil.formatDate(this.lastUpdatedAt / 1000, strings.adminUI.DEFAULT_TIME_FORMAT),
                numOfRows: this.numOfRows,
                rowSkew: this.rowSkew,
                numShards: this.numShards,
                usedCapacityMB: getNumberOrEmptyString(this.usedCapacityMB),
                replicated: getStringForReplicated(this.replicated),
                searchStatus: this.searchStatus,
                lastBuildTime: getValueOrEmptyString(this.lastBuildTime)
            };
        };

        return SearchDetailTableModel;
    }]);
