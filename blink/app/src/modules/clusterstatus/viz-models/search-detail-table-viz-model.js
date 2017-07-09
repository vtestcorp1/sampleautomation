/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating search table detail.
 */

'use strict';

blink.app.factory('SearchDetailTableVizModel', ['blinkConstants',
    'strings',
    'dateUtil',
    'Logger',
    'SearchDetailTableModel',
    'TableVizModel',
    'util',
    function (blinkConstants,
          strings,
    dateUtil,
    Logger,
    SearchDetailTableModel,
    TableVizModel,
    util) {

        var logger = Logger.create('search-detail-table-viz-model');

        function SearchDetailTableVizModel(params) {
            SearchDetailTableVizModel.__super.call(this, params);
            this.tables = [];
        }
        util.inherits(SearchDetailTableVizModel, TableVizModel);

    // Data will be loaded when this function gets called.
        SearchDetailTableVizModel.prototype.updateData = function(data) {
            this.tables = this.generateData(data, 'tables', SearchDetailTableModel);
        };

        return SearchDetailTableVizModel;
    }]);
