/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating single snapshot info in cluster detail.
 */

'use strict';

blink.app.factory('ClusterDetailSnapshotModel', ['blinkConstants',
    'strings',
    'dateUtil',
    'util',
    function (blinkConstants,
          strings,
    dateUtil,
    util) {

        function ClusterDetailSnapshotModel(snapshot) {
            this.name = snapshot.name;
            this.reason = snapshot.reason;
        /* eslint camelcase: 1 */
            this.endTime = snapshot.finish_timestamp_seconds;
            this.size = snapshot.size_bytes;
        }

        ClusterDetailSnapshotModel.prototype.getDetailTableRow = function () {
            return {
                name: this.name,
                reason: this.reason,
                endTime: dateUtil.formatDate(
                this.endTime * 1000,
                strings.adminUI.DEFAULT_TIME_FORMAT
            ),
                size: util.formatCompactScientificNumber(this.size)
            };
        };

        return ClusterDetailSnapshotModel;
    }]);
