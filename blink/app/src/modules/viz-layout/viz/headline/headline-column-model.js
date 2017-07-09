/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Data model for headline visualization column.
 */

'use strict';
blink.app.factory('HeadlineColumnModel', ['Logger',
    'util',
    'VisualizationColumnModel',
    function (Logger,
          util,
          VisualizationColumnModel) {

        var logger = Logger.create('headline-column-model');

        function HeadlineColumnModel(columnDefinition, dataRowIndex, columnData, aggrs) {
            HeadlineColumnModel.__super.call(this, columnDefinition, dataRowIndex, columnData);
            this._aggrs = aggrs;
        }

        util.inherits(HeadlineColumnModel, VisualizationColumnModel);

        HeadlineColumnModel.prototype.isEffectivelyPercent = function () {
            if (!VisualizationColumnModel.prototype.isEffectivelyPercent.call(this)) {
                return false;
            }

            var aggrType = this._aggrs[0];
            return !util.isDimensionlessAggregationType(aggrType);
        };

        return HeadlineColumnModel;
    }]);
