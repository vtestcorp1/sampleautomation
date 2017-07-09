/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating single item in cluster detail.
 */

'use strict';

blink.app.factory('ClusterDetailInfoModel', [function () {

    function ClusterDetailInfoModel(key, value) {
        this.key = key;
        this.value = value;
    }

    ClusterDetailInfoModel.prototype.getDetailTableRow = function () {
        return {
            key: this.key,
            value: this.value
        };
    };

    return ClusterDetailInfoModel;
}]);
