/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Base class for models which contains only one table in it.
 */

'use strict';

blink.app.factory('TableVizModel', ['GenericVizModel',
    'util',
    function (GenericVizModel,
          util) {


        function TableVizModel(params) {
            TableVizModel.__super.call(this, params);
        }
        util.inherits(TableVizModel, GenericVizModel);

        TableVizModel.prototype.getDetailTable = function(fieldName) {
            var data = this[fieldName].map(function(entry) {
                return entry.getDetailTableRow();
            });
            return data;
        };

    // Data will be loaded when this function gets called.
        TableVizModel.prototype.generateData = function(data, fieldName, constructor) {
            var result = [];
            if (Object.has(data, fieldName)) {
                result = data[fieldName].map(function(info) {
                    return new constructor(info);
                });
            }
            return result;
        };

        return TableVizModel;
    }]);
