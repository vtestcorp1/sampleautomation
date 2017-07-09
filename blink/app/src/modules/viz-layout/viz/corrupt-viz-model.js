/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating a corrupt visualization model
 */

'use strict';


blink.app.factory('CorruptVizModel', ['jsonConstants',
    'util',
    'VisualizationModel',
    function (jsonConstants,
          util,
          VisualizationModel) {

        function CorruptVizModel(params) {
            if (!params.vizJson) {
                params.vizJson = {};
            }
            params.vizJson[jsonConstants.HEADER_KEY] = {};

            CorruptVizModel.__super.call(this, params);
        }

        util.inherits(CorruptVizModel, VisualizationModel);

        CorruptVizModel.prototype.isCorrupted = function () {
            return true;
        };

        return CorruptVizModel;
    }]);
