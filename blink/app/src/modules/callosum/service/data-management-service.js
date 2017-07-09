/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Jasmeet Singh (jasmeet@thoughtspot.com)
 *
 * @fileoverview All the services used by the data management ui(v2 UI data loader) to communicate with the callosum
 * data source apis..
 */

'use strict';

blink.app.factory('dataManagementService', ['$q',
    'alertService',
    'blinkConstants',
    'Command',
    'DataSourceTask',
    'FormDownloader',
    'jsonConstants',
    'Logger',
    'LogicalTableModel',
    'metadataService',
    'schedulerService',
    'strings',
    'UserAction',
    'util',
    function ($q,
          alertService,
          blinkConstants,
          Command,
          DataSourceTask,
          FormDownloader,
          jsonConstants,
          Logger,
          LogicalTableModel,
          metadataService,
          schedulerService,
          strings,
          UserAction,
          util) {
        var me = {};

        var logger = Logger.create('data-management-service');

    /**
     * A wrapper class on the json DataSource definition.
     *
     * @constructor
     */
        function DataSource(json, configuration, logicalTableList) {
            this._json = json;
            this._configuration = configuration || {};
            this._configuration.TaskIds = this._configuration.TaskIds || '{}';
            this._configuration.taskConfig = this._configuration.taskConfig || '[]';
            var taskList = JSON.parse(this._configuration.taskConfig);
            this._taskList = taskList.map(DataSourceTask.create);

            this._tables = logicalTableList;
            this._srcTableNames = Object.keys(
            JSON.parse(this._configuration.TaskIds)
        );
        }

        DataSource.prototype.getJson = function () {
            return this._json;
        };

        DataSource.prototype.getName = function () {
            return this._json.name;
        };

        DataSource.prototype.getType = function () {
            return this._json.type;
        };

        DataSource.prototype.getTypeDisplayName = function () {
            var displayName =
            util.prop(this._json, 'statistics.dataLoadStatistics.connectionDisplayName');
            return displayName || '';
        };

        DataSource.prototype.getCreatedTimeAgo = function () {
            return this._json.createdTimeAgo;
        };

        DataSource.prototype.getCreatedBy = function () {
            return this._json.createdBy;
        };

        DataSource.prototype.getNumberOfTables = function () {
            return this._json.numberOfTables;
        };

        DataSource.prototype.getLastLoadTime = function () {
            return this._json.lastLoadTime;
        };

        DataSource.prototype.getLoadStatistics = function () {
            return util.prop(this._json, 'statistics.dataLoadStatistics');
        };

        DataSource.prototype.getSchedule = function () {
            return JSON.parse(this._configuration.Schedule || "{}");
        };

        DataSource.prototype.isScheduled = function () {
            return !!util.prop(this._json,
            'statistics.dataLoadStatistics.scheduled');
        };

        DataSource.prototype.isScheduleEnabled = function () {
            return JSON.parse(this._configuration.Schedule.enabled || false);
        };

        DataSource.prototype.disableSchedule = function () {
            this._configuration.Schedule.enabled = false;
        };

        DataSource.prototype.getDescription = function () {
            return this._json.description;
        };

        DataSource.prototype.getTables = function () {
            return this._tables;
        };

        DataSource.prototype.getTransformations = function () {
            return _.flatMap(
            this._taskList,
            function (task) {
                return task.getTransformations();
            });
        };

        DataSource.prototype.getFilters = function () {
            return _.flatMap(
            this._taskList,
            function (task) {
                return task.getFilters();
            });
        };

        DataSource.prototype.getTaskList = function () {
            return this._taskList;
        };

        DataSource.prototype.getConfig = function () {
            return this._configuration;
        };

        DataSource.prototype.getTaskIds = function () {
        //TODO(Ashish): Ask callosum to send parsed.
            return JSON.parse(this._configuration.TaskIds || '{}');
        };

        DataSource.prototype.getDetailedLoadStatus = function (tableLoadSessionLogCallBack) {
            var loadStatistics = this.getLoadStatistics() || {};
            var statusList = loadStatistics.dataLoadStatusList || [];

            var taskIdToName = util.invertObject(this.getTaskIds());
            var dataSourceId = this.getId();
            var configuration = this.getConfig();

            return statusList.map(function(table) {
                return {
                    id: table.taskID,
                    message: strings.importData.STATUS_PREFIX + table.message,
                    sessionLog :{
                        clickText: strings.importData.SESSION_LOG_CLICK_TEXT,
                        fetchLog: tableLoadSessionLogCallBack
                    },
                    dataSourceID: dataSourceId,
                    status: table.status.toLowerCase(),
                    preScriptStatus: configuration[jsonConstants.dataSourceConfiguration.PRE_SCRIPT_STATUS],
                    postScriptStatus: configuration[jsonConstants.dataSourceConfiguration.POST_SCRIPT_STATUS],
                    name: taskIdToName[table.taskID],
                    lastLoadTime: table.lastLoadTime
                };
            });
        };

        DataSource.prototype.getId = function () {
            return this._json.id;
        };

        DataSource.prototype.hasDetails = function() {
            return !!this.details;
        };

        DataSource.prototype.setDetails = function(hasDetails) {
            this.details = hasDetails;
        };

        DataSource.prototype.setConfiguration = function(configuration) {
            this._configuration = configuration;
        };

        DataSource.prototype.setLoadStatus = function(status) {
            this._json.loadStatus = status;
        };

        DataSource.prototype.setLoadStatistics = function (dataLoadStats) {
            return util.setProp(this._json, 'statistics.dataLoadStatistics', dataLoadStats);
        };

        DataSource.prototype.setTaskList = function (taskList) {
            this._taskList = taskList;
        };

    /**
     * A wrapper class on the json DataSourceConnectionSchema definition.
     *
     * @constructor
     */
        function DataSourceConnectionSchema(json) {
            this._json = json;

            this._tables = this._json.tables.map(function(table){
                return new LogicalTableModel({
                    tableMetadata: table
                });
            });
        }

        DataSourceConnectionSchema.prototype.getJson = function () {
            return this._json;
        };

        DataSourceConnectionSchema.prototype.getTables = function () {
            return this._tables;
        };

        DataSourceConnectionSchema.prototype.setSelection = function (selectedTables, selectedColumns) {
            this._json.selectedTables = selectedTables;
            this._json.selectedColumns = selectedColumns;
        };

    /**
     * Calls callosum to get the supported dataSource types supported for import
     * @returns {promise}           A promise that should resolve with the supported DataSource types
     */
        me.getDataSourceTypes = function() {
            var command = new Command().setPath('/dataload/dstypes');
            return command.execute();
        };

    /**
     * For a given dataSourceType, returns the config values required to connect to a particular dataSource
     * @param {string} dataSourceType         The type of the dataSource for which the config values are to be fetched
     * @returns {promise}           A promise that should resolve with a set of configuration values required
     *                              to connect to the dataSource
     */
        me.getDataSourceConfig = function(dataSourceType) {
            var command = new Command()
            .setPath('/dataload/dsconfig')
            .setGetParams({
                sourcetype: dataSourceType
            });

            return command.execute();
        };

    /**
     * For a given dataSourceType, returns the list of connections to connect to that dataSource
     * @param {string} dataSourceType         The type of the dataSource for which connections are to be fetched
     * @returns {promise}           A promise that should resolve with a list of connections required
     *                              to connect to the dataSource
     */
        me.getDataSourceConnections = function(dataSourceType) {
            var command = new Command()
            .setPath('/dataload/connlist')
            .setGetParams({
                sourcetype: dataSourceType
            });

            return command.execute();
        };

    /**
     * For a given dataSourceType, returns a map of attributes of the connection
     * @param {string} dataSourceType         The type of the dataSource
     * @param {string} connectionId           id of the connection
     * @returns {promise}           A promise that should resolve with a map of attribute connections
     */
        me.getConnectionAttributes = function(dataSourceType, connectionId) {
            var command = new Command()
            .setPath('/dataload/getconnattrib')
            .setGetParams({
                sourcetype: dataSourceType,
                id: connectionId
            });

            return command.execute();
        };

    /**
     * Delete a given datasource connection
     *
     * @param id
     * @param type
     * @returns {*}
     */
        me.deleteConnection = function (id, type) {
            var command = new Command()
            .setPath('/dataload/deleteconn')
            .setPostParams({
                sourcetype: type,
                id: id
            })
            .setDeleteMethod();

            return command.execute();
        };

    /**
     * For a given connection id, returns the list of objects using search text.
     * @param {string} connectionId Connection id
     * @param {string} sourceType source type
     * @param {string} searchText search text to filter on
     * @returns {promise}           A promise that should resolve with a list of objects
     */
        me.getDataSourceConnectionObjList = function(connectionId, sourceType, searchText) {
            var command = new Command()
            .setPath('/dataload/connobjlist')
            .setGetParams({
                id: connectionId,
                sourcetype: sourceType,
                pattern: searchText
            });

            return command.execute();
        };

    /**
     * For a given connection id and obj name, returns the list of fields
     * @param {string} sourceType   Source type
     * @param {string} id           Connection id
     * @param {string} name         Obj name
     * @returns {promise}           A promise that should resolve with a list of fields
     */
        me.getDataSourceConnObjFieldList = function(sourceType, id, name) {
            var command = new Command()
            .setPath('/dataload/objfieldlist')
            .setGetParams({
                sourcetype: sourceType,
                id: id,
                name: name
            });

            return command.execute();
        };

    /**
     * Using the configuration values passed, asks Callosum to connect to the DataSource and return
     * the schema representation at the Source.
     * @param {Object} connectionConfig                 Connection config object
     * @param {Object} connectionConfig.sourcetype      Type of the DataSource object
     * @param {Object} connectionConfig.sourceconfig    Mapping Config parameters and values to connect to the DataSource
     * @returns {promise}                   A promise that should resolve to the DataSourceConnectionSchema object
     *                                      for the DataSource
     */
        me.connectToDataSource = function(connectionConfig) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/dataload/dsconnect')
            .setPostParams(connectionConfig)
            .setPostMethod();

            command.execute()
            .then(function(data) {
                var schema = new DataSourceConnectionSchema(data);
                deferred.resolve(schema);
            },function(e){
                deferred.reject(e);
            });
            return deferred.promise;
        };

    /**
     * Requests Callosum to create DataSource by importing tables, columns and relationships from an external DataSource
     * @param {string} name            Name of the created DataSource
     * @param {string} description     Description of the created DataSource
     * @param {string} type            Type of the DataSource to be imported from
     * @param {Object} configuration   Metadata of the DataSource to import from
     * @returns {promise}              A promise that should resolve to the DataSourceConnectionSchema object
     *                                 for the DataSource
     */
        me.createDataSource = function(name, description, type, configuration) {
            var command = new Command()
            .setPath('/dataload/dscreate')
            .setPostParams({
                sourcename : name,
                sourcedescription : description,
                sourcetype : type,
                sourcemetadata : JSON.stringify(configuration)
            })
            .setPostMethod();

            return command.execute().
            then(function(response) {
                var dataSourceInfo = response.data;
                response.data = new DataSource(
                    dataSourceInfo.header,
                    dataSourceInfo.dataSourceContent.configuration
                );
                return response;
            });
        };

    /**
     * Requests Callosum to create a connection to load data sources from.
     * @param {string} type                  Connection type.
     * @param {string} name                  Name of the connection being created.
     * @param {string} description           Connection description.
     * @param {string} attributes            Json respresnetation of connection attributes.
     * @returns {promise}
     */
        me.createConnection = function(type, name, description, attributes) {
            var command = new Command()
            .setPath('/dataload/createconn')
            .setPostParams({
                sourcetype: type,
                name: name,
                description: description,
                connattributes: JSON.stringify(attributes)
            })
            .setPostMethod();

            return command.execute();
        };

    /**
     * Requests Callosum to update a connection with the connection attributes passed.
     * @param {string} type                  Connection type.
     * @param {string} name                  Name of the connection being updated..
     * @param {string} connId                Connection Id of the connection being updated.
     * @param {string} description           Connection description.
     * @param {string} attributes            Json respresnetation of connection attributes.
     * @returns {promise}
     */
        me.updateConnection = function(type, name, connId, description, attributes) {
            var command = new Command()
            .setPath('/dataload/updateconn')
            .setPostParams({
                sourcetype: type,
                name: name,
                id: connId,
                description: description,
                connattributes: JSON.stringify(attributes)
            })
            .setPostMethod();

            return command.execute();
        };

    /**
     * Requests Callosum to load data by importing tables, columns and relationships from an external DataSource
     * @param {string} sourceId              DataSource GUID
     * @param {string} dataloadTaskList      Data load source target mapping Json
     * @param {string} scheduleConfig        Data load schedule
     * @param {string} preScript             Pre script to execute before data load.
     * @param {string} postScript            Post script to execute after data load.
     * @returns {promise}
     */
        me.loadDataFromSource = function(sourceId, dataloadTaskList, scheduleConfig, preScript,
                                         postScript) {
            var schedulerJson = schedulerService.getBackendJsonFromConfig(scheduleConfig);

            var command = new Command()
            .setPath('/dataload/dsload')
            .setPostParams({
                sourceid : sourceId,
                dataloadtasklist : JSON.stringify(dataloadTaskList),
                loadschedule : JSON.stringify(schedulerJson),
                prescript: preScript,
                postscript: postScript
            })
            .setPostMethod();

            return command.execute();
        };

    /**
     * Requests Callosum to get ddl command to create schema
     * @param {string} sourceType                 DataSource type
     * @param {string} id                         Connection id
     * @param {Array} dataLoadTaskList            Data load object selected fields array
     * @returns {promise}
     */
        me.getCreateDdl = function(sourceType, id, sourceName, dataLoadTaskList) {
            var taskList = dataLoadTaskList.map(function (task) {
                return task.getJson();
            });
            var command = new Command()
            .setPath('/dataload/getcreateddl')
            .setPostParams({
                sourcetype: sourceType,
                id: id,
                dataloadtasklist: JSON.stringify(taskList),
                sourcename: sourceName
            })
            .setPostMethod();

            return command.execute();
        };


        /**
         * Requests Callosum to detach tables from a datasource.
         * @param {string} sourceType                 DataSource type
         * @param {string} id                         Connection id
         * @param {Array} tablesToRemove              Tables to remove.
         * @returns {promise}
         */
        me.detachTablesFromDataSource = function(sourceType, id, tablesToRemove) {;
            var command = new Command()
                .setPath('/dataload/detachtables')
                .setPostParams({
                    sourcetype: sourceType,
                    id: id,
                    tableNameList: JSON.stringify(tablesToRemove)
                })
                .setPostMethod();

            return command.execute();
        };


    /**
     * Stop loading the selected tables.
     * @param sourceId
     * @param tableNames
     */
        me.stopLoadTasks = function(sourceId, tableNames) {
            var command = new Command()
            .setPath('/dataload/stopLoadTables')
            .setPostParams({
                sourceid: sourceId,
                tableNameList: JSON.stringify(tableNames)
            })
            .setPostMethod();
            return command.execute();
        };

    /**
     * Reloading the selected tables.
     * @param sourceId
     * @param tableNames
     */
        me.reloadTasks = function(sourceId, tableNames) {
            var command = new Command()
            .setPath('/dataload/reloadTables')
            .setPostParams({
                sourceid: sourceId,
                tableNameList: JSON.stringify(tableNames)
            })
            .setPostMethod();
            return command.execute();
        };

    /**
     * Requests Callosum to execute ddl command
     * @param {string} sourceId                   DataSource id
     * @param {Array} dataLoadTaskList            List of target object fields
     * @param {string} createDdl                  create ddl commands
     * @returns {promise}
     */
        me.executeDdl = function(sourceId, dataLoadTaskList, createDdl) {

            var command = new Command()
            .setPath('/dataload/execcreateddl')
            .setPostParams({
                sourceid: sourceId,
                dataloadtasklist: JSON.stringify(dataLoadTaskList),
                createddl: createDdl
            })
            .setPostMethod();

            return command.execute();
        };

    /**
     * Requests Callosum to update the schedule information for a data source
     * @param {string} sourceId                   DataSource id
     * @param {string} loadSchedule               Schedule info json string
     * @returns {promise}
     */
        me.updateSchedule = function(sourceId, loadSchedule) {
            var command = new Command()
            .setPath('/dataload/updateschedule')
            .setPostParams({
                sourceid: sourceId,
                loadschedule: JSON.stringify(loadSchedule)
            })
            .setPostMethod();

            return command.execute();
        };

    /**
     * Requests Callosum to disable the schedule information for a data source
     * @param {string} sourceId                   DataSource id
     * @returns {promise}
     */
        me.disableSchedule = function(sourceId) {
            var command = new Command()
            .setPath('/dataload/disableschedule')
            .setPostParams({
                sourceid: sourceId
            })
            .setPostMethod();

            return command.execute();
        };

    /**
     * Requests Callosum to enable the schedule information for a data source
     * @param {string} sourceId                   DataSource id
     * @returns {promise}
     */
        me.enableSchedule = function(sourceId) {
            var command = new Command()
            .setPath('/dataload/enableschedule')
            .setPostParams({
                sourceid: sourceId
            })
            .setPostMethod();

            return command.execute();
        };


    /**
     * Requests Callosum to get load status for data source
     * @param {string} sourceId              DataSource GUID
     * @returns {promise}
     */
        me.getDSLoadStatus = function(sourceId) {
            var command = new Command()
            .setPath('/dataload/loadstatus')
            .setGetParams({
                sourceid: sourceId
            });

            return command.execute();
        };

    /**
     * Returns a formatted Expression.
     *
     * @param sourceType
     * @param connectionId
     * @param tableName
     * @param expression
     * @returns {*}
     */
        me.getFormattedExpression = function(sourceType, connectionId, tableName, expression) {
            var command = new Command()
            .setPath('/dataload/formatExpression')
            .setGetParams({
                sourcetype: sourceType,
                id: connectionId,
                name: tableName,
                /* eslint camelcase: 1 */
                expression_name: expression
            });

            return command.execute();
        };

    /**
     * validates transformation expression.
     *
     * @param sourceType
     * @param connectionId
     * @param tableName
     * @param expression
     * @returns {*}
     */
        me.validateTransformationExpression = function(sourceType, connectionId, tableName, expression) {
            var userAction = new UserAction(UserAction.VALIDATE_TRANSFORMATION_EXPRESSION);
            var command = new Command()
            .setPath('/dataload/validateexpression')
            .setPostParams({
                sourcetype: sourceType,
                id: connectionId,
                name: tableName,
                /* eslint camelcase: 1 */
                expression_name: expression
            })
            .setPostMethod();
            return command.execute().then(function(response) {
                return response.data;
            }, function(response) {
                return $q.reject(response);
            });
        };

    /**
     * Requests Callosum to create schema from an external DataSource
     * @param {string} sourceId              DataSource GUID
     * @param {string} sourceTargetMap       Create schema source target mapping Json
     * @param {string} objFieldList          Map of objects to fields
     * @returns {promise}
     */
        me.createSchemaFromSource = function(sourceId, sourceTargetMap, objFieldList) {
            var command = new Command()
            .setPath('/dataload/dscreateschema')
            .setPostParams({
                sourceid : sourceId,
                sourcetargetmap : JSON.stringify(sourceTargetMap),
                objfieldlist : JSON.stringify(objFieldList)
            })
            .setPostMethod();

            return command.execute();
        };

    /**
     * Deletes the DataSource corresponding to the passed Id.
     * @param {string} sourceId     Id for the source to be deleted
     * @param {bool} deleteTables   bool to mandate whethere datasource tables need to be deleted.
     * @returns {promise}           A promise that should resolve once the source has been deleted
     */
        me.deleteDataSources = function(sourceIds, deleteTables) {
            var command = new Command()
            .setPath('/dataload/dsdelete')
            .setPostParams({
                datasourceids: JSON.stringify(sourceIds),
                deletetables : deleteTables
            })
            .setPostMethod();

            return command.execute();
        };

    /**
     * Returns sampleValues for the dataSource
     * @param {Object} sampleValuesConfig
     * @param {string} sampleValuesConfig.sourcetype        Type of the DataSource to be imported from
     * @param {Object} sampleValuesConfig.sourcemetadata    Metadata of the DataSource to import from
     * @param {integer} sampleValuesConfig.sampledatarows   Number of sample rows to import for each column
     * @returns {promise}
     */
        me.getSampleValues = function(sampleValuesConfig) {
            var command = new Command()
            .setPath('/dataload/sampledata')
            .setPostParams(sampleValuesConfig)
            .setPostMethod();

            return command.execute();
        };

    /**
     * Returns a list of all DataSourced from Callosum
     * @returns {promise}
     */
        me.getDataSources = function() {
            return metadataService.getMetadataList(jsonConstants.metadataType.DATA_SOURCE)
            .then(function(response) {
                var data = response.data;
                var dataSources = data.headers.map(function (json) {
                    return new DataSource(json);
                });
                response.data = dataSources;
                return response;
            });
        };

    /**
     * Returns DataSource with details for the requested DataSource id.
     * Details contain information about tables, its columns and relationships for the DataSource.
     * @param {string} sourceId
     * @returns {promise}
     */
        me.getDataSourceDetails = function(sourceId) {
            var userAction = new UserAction(UserAction.FETCH_DATA_SOURCE_DETAILS);
            return metadataService.getMetadataDetails(
            jsonConstants.metadataType.DATA_SOURCE,
            [sourceId],
            false,
            true
        )
            .then(function(response) {
                var data = response.data;
                var dataSourceInfo = data.storables[0];
                response.data = new DataSource(
                dataSourceInfo.header,
                dataSourceInfo.dataSourceContent.configuration,
                dataSourceInfo.logicalTableList
            );
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response);
            });
        };

    /**
     * Returns session log corresponding to the table load of the datasource
     * @param {string} sourceId
     * @param {tableName} tableName
     * @returns {promise}
     */
        me.getTableLoadSessionLog = function(sourceId, tableName) {
            new FormDownloader().downloadForm("callosum/v1/dataload/sessionlog", {
                sourceid: sourceId,
                name: tableName
            });
        };

    /**
     * Refreshes status of the tables under the datasource
     * @param {string} sourceId
     * @returns {promise}
     */
        me.updateloadstatus = function(sourceId) {
            var command = new Command()
            .setPath('/dataload/updateloadstatus')
            .setPostParams({
                sourceid: sourceId
            })
            .setPostMethod();

            return command.execute();
        };

        return me;
    }]);
