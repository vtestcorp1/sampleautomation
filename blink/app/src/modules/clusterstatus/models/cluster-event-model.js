/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating single event.
 */

'use strict';

blink.app.factory('ClusterEventModel', ['blinkConstants',
    'strings',
    'dateUtil',
    function (blinkConstants,
          strings,
          dateUtil) {

        function ClusterEventModel(data) {
        /* eslint camelcase: 1*/
            this.summary = data.summary;
            this.user = data.user;
            this.time = data.system_info.at;
            this.type = data.type;
            this.attribute = data.attribute;
        }

        ClusterEventModel.prototype.getHumanReadableTime = function () {
            return dateUtil.formatDate(
            this.time * 1000,
            strings.adminUI.DEFAULT_TIME_FORMAT
        );
        };

        ClusterEventModel.prototype.getTimeAgoString = function() {
            return dateUtil.epochToTimeAgoString(this.time * 1000);
        };

        ClusterEventModel.prototype.getEventSummary = function () {
            return this.summary;
        };

        ClusterEventModel.prototype.getEventUser = function () {
            return this.user;
        };

        ClusterEventModel.prototype.getEventType = function () {
            return this.type;
        };

        ClusterEventModel.prototype.getEventCategory = function() {
            for (var i in this.attribute) {
                if (this.attribute[i].key === 'Application') {
                    return this.attribute[i].value;
                }
            }
            return 'Configuration';
        };

        ClusterEventModel.prototype.getDetailTableRow = function () {
            return {
                user: this.getEventUser(),
                summary: this.getEventSummary(),
                time: this.getHumanReadableTime(),
                type: this.getEventType()
            };
        };

        return ClusterEventModel;
    }]);
