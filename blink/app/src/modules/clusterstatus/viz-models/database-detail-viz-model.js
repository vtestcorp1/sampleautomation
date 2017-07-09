/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Zhiquan Sui (simon@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating falcon status detail.
 */

'use strict';

blink.app.factory('DatabaseDetailVizModel', ['blinkConstants',
    'strings',
    'DatabaseTableModel',
    'dateUtil',
    'Logger',
    'util',
    'TableVizModel',
    function (blinkConstants,
          strings,
    DatabaseTableModel,
    dateUtil,
    Logger,
    util,
    TableVizModel) {

        var logger = Logger.create('database-detail-viz-model');

        function DatabaseDetailVizModel(params) {
            DatabaseDetailVizModel.__super.call(this, params);
        }
        util.inherits(DatabaseDetailVizModel, TableVizModel);

    // Data will be loaded when this function gets called.
        DatabaseDetailVizModel.prototype.updateData = function(data) {

            this.tables = [];

            var database = util.prop(data, 'server.database');
            if (!database) {
                return;
            }

            var allTables = [];
            database.forEach(function(d) {

                if (!Object.has(d, 'user_schema')) {
                    return;
                }

                var databaseName = d.id.name;
            /* eslint camelcase: 1*/
                var userSchema = d.user_schema;

                var table = userSchema.forEach(function(us) {

                    if (!Object.has(us, 'table')) {
                        return;
                    }
                    var userSchemaName = us.id.name;

                    var tables = us.table.map(function (databaseInfo) {
                        return new DatabaseTableModel(
                        databaseInfo,
                        databaseName,
                        userSchemaName
                    );
                    });
                    allTables.add(tables);

                });
            });
            this.tables = allTables;
        };

        return DatabaseDetailVizModel;
    }]);
