/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Base class for for all generic visualizations.
 */

'use strict';

blink.app.factory('GenericVizModel', ['util',
    'VisualizationModel',
    function (util,
          VisualizationModel) {

        function GenericVizModel(params) {
            GenericVizModel.__super.call(this, params);
        }

        util.inherits(GenericVizModel, VisualizationModel);

        GenericVizModel.prototype.isGenericViz = function () {
            return true;
        };

        return GenericVizModel;
    }]);
