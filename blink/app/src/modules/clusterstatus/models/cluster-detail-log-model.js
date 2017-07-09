/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating single log entry in cluster detail.
 */

'use strict';

blink.app.factory('ClusterDetailLogModel', ['blinkConstants',
    'strings',
    'dateUtil',
    function (blinkConstants,
          strings,
    dateUtil) {

        function ClusterDetailLogModel(event) {
            this.type = event.type;
        /* eslint camelcase: 1 */
            this.time = event.timestamp_seconds;
            if (this.type === 'UPDATE' || this.type === 'INSTALL' || this.type === 'UPDATE_END') {
                for (var i in event.attribute) {
                    if (event.attribute[i].key === 'release') {
                        this.release = event.attribute[i].value;
                    }
                }
            }
        }

        ClusterDetailLogModel.prototype.getDetailTableRow = function () {
            return {
                type: this.type,
                time: dateUtil.formatDate(
                this.time * 1000,
                strings.adminUI.DEFAULT_TIME_FORMAT
            ),
                release: this.release
            };
        };

        return ClusterDetailLogModel;
    }]);
