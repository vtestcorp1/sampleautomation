/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview: This class represents a task which could be submitted
 *                to the backend to load data from an external datasource.
 */
'use strict';

blink.app.factory('DataSourceTask', [function() {

    /**
     *
     * @param {String} sourceObjName Name of the source table
     * @param {String} targetObjName Name of the target table
     * @param {Object} objFieldMappings A map of sourceColumn -> TargetColumn
     *                                  Also contains expressions and their targetColumn
     * @param {Array} filerCondition A list of filters to be applied while loading data
     * @param {Boolean} truncateTable Whether to truncate existing data in the table.
     * @constructor
     */
    function DataSourceTask(sourceObjName,
                            targetObjName,
                            objFieldMappings,
                            filerCondition,
                            truncateTable,
                            enableEmails,
                            targetSchemaName,
                            targetdbName) {
        this.sourceObjName = sourceObjName;
        this.targetObjName = targetObjName;
        this.objFieldMappings = objFieldMappings || [];
        this.filterCondition = filerCondition || [];
        this.truncateTable = truncateTable;
        this.enableEmails = enableEmails;
        this.targetSchemaName = targetSchemaName;
        this.targetdbName = targetdbName;
        this.taskState = DataSourceTask.State.NEW;
        this._processMappings();
        this._processFilters();
    }

    DataSourceTask.Fields = {
        SOURCE_NAME: 'sourceObjName',
        TARGET_NAME: 'targetObjName',
        MAPPINGS: 'objFieldMappings',
        FILTERS: 'filterCondition',
        TRUNCATE_FLAG: 'truncateTable',
        ENABLE_EMAILS_FLAG: 'enableEmails',
        DDL: 'createDDL',
        ALTER_DDL_LIST: 'alterTableDdlList',
        CREATE_FLAG: 'createTarget',
        SCHEMA_NAME: 'targetSchemaName',
        DB_NAME: 'targetdbName',
        TASK_STATE: 'taskState'
    };

    DataSourceTask.ObjFieldMappingFields = {
        SOURCE_FIELD_NAME: 'sourceFieldname',
        TARGET_FIELD_NAME: 'targetFieldname',
        EXPRESSION: 'expression',
        TARGET_FIELD_TYPE: 'targetFieldDataType',
        COL_TYPE: 'colType'
    };

    DataSourceTask.ColTypeMappingState = {
        NONE: 'NONE',
        ADD_COL: 'ADD_COL',
        DEL_COL: 'DEL_COL'
    };

    DataSourceTask.State = {
        EXISTING: 'EXISTING',
        NEW: 'NEW',
        UPDATE_COLS: 'UPDATE_COLS',
        DELETED: 'DELETED'
    };

    DataSourceTask.create = function (params) {
        return new DataSourceTask(
            params.sourceObjName,
            params.targetObjName,
            params.objFieldMappings,
            params.filterCondition,
            params.truncateTable,
            params.enableEmails,
            params.targetSchemaName,
            params.targetdbName
        );
    };

    /**
     * Gets a list of TaskLists given the UI state.
     *
     * @param dataSource
     * @param objFieldMappings
     * @param getDataFiltersForTable
     * @param items
     * @param shouldTruncate
     * @param shouldSendEmails
     * @returns {Object} TaskLists
     */
    DataSourceTask.getDataSourceTaskLists = function(dataSource,
                                                    objFieldMappings,
                                                    getDataFiltersForTable,
                                                    items,
                                                    shouldTruncate,
                                                    shouldSendEmails) {
        var dataSourceTaskLists = {
            alreadyLoadedTasks: [],
            newTasks: [],
            removedTasks: []
        };
        if( !!items && items.length > 0) {
            items.reduce(function(taskLists, table) {
                var filters = getDataFiltersForTable(table.name);
                var filterCondition = filters.map(function(filter) {
                    return {
                        fieldName: filter.column.name,
                        operator: filter.option.toUpperCase(),
                        value: filter.text
                    };
                });
                var task = new DataSourceTask(
                    // For new tables there is not source/target Obj Name
                    table.sourceObjName || table.name,
                    table.targetObjName || table.name,
                    objFieldMappings[table.name] || [],
                    (filterCondition.length) ? filterCondition : void 0,
                    shouldTruncate,
                    shouldSendEmails,
                    table.targetSchemaName,
                    table.targetdbName
                );
                taskLists.newTasks.push(task);
                return taskLists;
            }, dataSourceTaskLists);
        }

        // once we filter out already loaded table based dataSourceTasks, we will be left with
        // only newly selected tables.
        if( !!dataSource) {
            var taskList = dataSource.getTaskList();
            if( !!taskList) {
                taskList = taskList.map(
                    function(task){
                        if( task.taskState === DataSourceTask.State.DELETED) {
                            dataSourceTaskLists.removedTasks.push(task);
                            return;
                        }
                        var tableHasNewColsAdded = task.objFieldMappings.some(
                            function(mapping) {
                                return !!mapping.colType
                                    && mapping.colType != DataSourceTask.ColTypeMappingState.NONE;
                            }
                        );
                        if(tableHasNewColsAdded) {
                            task.taskState = DataSourceTask.State.UPDATE_COLS;
                            dataSourceTaskLists.newTasks.push(task);
                        } else {
                            task.taskState = DataSourceTask.State.EXISTING;
                            dataSourceTaskLists.alreadyLoadedTasks.push(task);
                        }
                    }
                );
            }
        }
        return dataSourceTaskLists;
    };

    DataSourceTask.prototype._processMappings = function () {
        this._columns = [];
        this._transformations = [];
        var self = this;

        this.objFieldMappings.reduce(function (mappings, field) {
            // Do not add mappings that were mapped to delete to the list of table columns.
            if( field.colType === DataSourceTask.ColTypeMappingState.DEL_COL) {
                return mappings;
            }

            if (!!field.expression) {
                mappings._transformations.push({
                    name: field.targetFieldname,
                    expression: field.expression,
                    table: {
                        name: self.sourceObjName
                    },
                    isExisting: true
                });
            } else {
                mappings._columns.push(field);
            }
            return mappings;
        }, this);
    };

    DataSourceTask.prototype._processFilters = function () {
        this._filters = this.filterCondition.map(function(filter) {
            var config = {
                name : this.sourceObjName,
                column: {
                    name: filter.fieldName
                },
                option : filter.operator,
                text : filter.value
            };
            return {
                values: config,
                config: config
            };
        }, this);
    };


    DataSourceTask.prototype.getColumns = function () {
        return this._columns;
    };

    DataSourceTask.prototype.markMappingForAddition = function (name, expression, dataType) {
        // check if mapping has been marked for deletion.
        var mapping = this.checkAndFetchMappingMarkedForDel(name);
        if( mapping === void 0) {
            // If the mapping doesnt exist, we just add a new mapping.
            mapping = {
                sourceFieldname: name,
                targetFieldname: name,
                expression: expression,
                targetFieldDataType: dataType,
                colType: DataSourceTask.ColTypeMappingState.ADD_COL
            };
        } else {
            // Remove existing mapping which exists as a deleted column.
            _.remove(this.objFieldMappings, function(mapping) {
                return mapping.sourceFieldname === name;
            });
            // If the mapping to be added has been marked for deletion, then just remove the DEL_COL
            // state of the mapping. We dont need to push a new mapping.
            mapping.colType = DataSourceTask.ColTypeMappingState.NONE;
        }

        this.objFieldMappings.push(mapping);
        // set taskState after looking at mappings. Will be set to UPDATE_COL only if we find
        // any columns marked for addition or deletion.
        this.taskState = this.fetchTaskState();
        this._processMappings();
    };

    DataSourceTask.prototype.checkAndFetchMappingMarkedForDel = function(name){
        return this.objFieldMappings.find(function(mapping) {
            return mapping.sourceFieldname === name
                && mapping.colType === DataSourceTask.ColTypeMappingState.DEL_COL;
        });
    };

    DataSourceTask.prototype.checkAndFetchMappingMarkedForAdd = function(name){
        return this.objFieldMappings.find(function(mapping) {
            return mapping.sourceFieldname === name
                && mapping.colType === DataSourceTask.ColTypeMappingState.ADD_COL;
        });
    };

    DataSourceTask.prototype.fetchTaskState = function() {
        var hasUpdateCols = this.objFieldMappings.some(
            function(mapping) {
                return mapping.colType ===  DataSourceTask.ColTypeMappingState.ADD_COL ||
                    mapping.colType ===  DataSourceTask.ColTypeMappingState.DEL_COL;
            }
        );
        if( hasUpdateCols) {
            return DataSourceTask.State.UPDATE_COLS;
        }
        return DataSourceTask.State.EXISTING;
    };

    DataSourceTask.prototype.markMappingForDeletion = function (sourceFieldname, targetFieldname,
                                                                expression, dataType) {
        // check if mapping has been marked for addition.
        var mapping = this.checkAndFetchMappingMarkedForAdd(sourceFieldname);
        // Remove existing mapping which exists as a regular column.
        _.remove(this.objFieldMappings, function(mapping) {
            return mapping.sourceFieldname === sourceFieldname;
        });
        if( mapping === void 0) {
            mapping = {
                sourceFieldname: sourceFieldname,
                targetFieldname: targetFieldname,
                expression: expression,
                targetFieldDataType: dataType,
                colType: DataSourceTask.ColTypeMappingState.DEL_COL
            };
            this.objFieldMappings.push(mapping);

        }
        // set taskState after looking at mappings. Will be set to UPDATE_COL only if we find
        // any columns marked for addition or deletion.
        this.taskState = this.fetchTaskState();
        this._processMappings();
    };

    DataSourceTask.prototype.getTransformations = function () {
        return this._transformations;
    };

    DataSourceTask.prototype.getFilters = function () {
        return this._filters;
    };

    DataSourceTask.prototype.getJson = function () {
        return _.pick(this, _.values(DataSourceTask.Fields));
    };

    return DataSourceTask;
}]);
