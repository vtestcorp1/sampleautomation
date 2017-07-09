/**
 *  * Copyright: ThoughtSpot Inc. 2015
 *   * Author: Pradeep Dorairaj (pradeep.dorairaj@thoughtspot.com)
 *    *
 *     * @fileoverview Controller for user data feature.
 *      */

'use strict';

/* eslint max-params: 1 */
blink.app.controller('ImportDataController', ['$scope',
    '$q',
    '$route',
    'AccordionListViewerComponent',
    'AccordionListViewerItemComponent',
    'Logger',
    'alertService',
    'blinkConstants',
    'strings',
    'CheckboxComponent',
    'dataManagementService',
    'DataSourceTask',
    'dialog',
    'itemViewerService',
    'jsonConstants',
    'loadingIndicator',
    'navService',
    'schedulerService',
    'sessionService',
    'UserAction',
    'userDialogs',
    'util',
    'Wizard',
    function ($scope,
              $q,
              $route,
              AccordionListViewerComponent,
              AccordionListViewerItemComponent,
              Logger,
              alertService,
              blinkConstants,
              strings,
              CheckboxComponent,
              dataManagementService,
              DataSourceTask,
              dialog,
              itemViewerService,
              jsonConstants,
              loadingIndicator,
              navService,
              schedulerService,
              sessionService,
              UserAction,
              userDialogs,
              util,
              Wizard) {

        var _logger = Logger.create('import-data-controller');

        $scope.dsMetaData = {
            name: "",
            desc: "",
            selectedConnection: "",
            preScriptText: "",
            postScriptText: ""
        };

        $scope.scheduleConfig = schedulerService.getConfigFromBackendJson();
        $scope.strings = strings.importData;

        $scope.btnStrings = strings;

        function initTables() {
            $scope.shuttleModel = {
                leftName: $scope.strings.AVAILABLE_TABLES,
                rightName: $scope.strings.SELECTED_TABLES,
                availableItems: [],
                selectedItems: [],
                showShuttle: false,
                listSearch : fetchTables
            };
        }

        function reset() {
            initTables();
            $scope.dataFilters = [];
            $scope.transformations = [];
            $scope.dsMetaData.selectedConnection = "";
        }

        $scope.filterByConnectionName = function(inputSearch) {
            return function(connection) {
                var regex = new RegExp(inputSearch.escapeRegExp(), 'gi');
                return connection.name.match(regex);
            };
        };


        $scope.itemViewerConfig = {
            selectionAllowed: false
        };

        $scope.tablesToLoad = [];

        $scope.tablesLoadedByName = {};

        $scope.isValidConnection = true;

        initTables();

        var dataSource;



        $scope.getTableColumns = function(tableName) {
            if( !dataSource) {
                return $scope.getObjFieldList(tableName);
            }
            var task = $scope.tablesLoadedByName[tableName];

            if( !task) {
                // Tablename passed is not present in the existing datasource. It could have been
                // newly added in edit-mode.
                return $scope.getObjFieldList(tableName);
            }

            var loadedTable = _.find(
                $scope.shuttleModel.selectedItems,
                function(availableItem) {
                    return availableItem.name === tableName;
                }
            );

            var checkedColumns = _.keyBy(task.getColumns(),
                DataSourceTask.ObjFieldMappingFields.SOURCE_FIELD_NAME);

            return $scope.getObjFieldList(tableName).then(
                function(items) {
                    loadedTable.subItems =  items.map(
                        function(subItem) {
                            if(!!checkedColumns[subItem.name]) {
                                subItem.isChecked = !checkedColumns[subItem.name].colType ||
                                    (checkedColumns[subItem.name].colType
                                != DataSourceTask.ColTypeMappingState.DEL_COL);
                            } else {
                                subItem.isChecked = false;
                            }
                            if(!subItem.isChecked) {
                                loadedTable.checkedState = itemViewerService.CheckedStates.partial;
                            }
                            return subItem;
                        }
                    );
                    return loadedTable.subItems;
                }
            );
        };

        $scope.getObjFieldList = function (tableName) {
            var userAction = new UserAction(UserAction.GET_DATA_SOURCE_CONN_FIELD_LIST);
            return dataManagementService.getDataSourceConnObjFieldList(
                $scope.dsMetaData.connectionType,
                $scope.dsMetaData.selectedConnection,
                tableName
            ).then(function(response) {
                var columnsObj = response.data;
                return Object.
                    keys(columnsObj).
                    map(function(columnName) {
                        var dataType = columnsObj[columnName];
                        var isDisabled = dataType === util.dataTypes.UNKNOWN;
                        return {
                            name: columnName,
                            dataType: dataType,
                            isDisabled: isDisabled
                        };
                    });
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        };



        $scope.dataFilters = [];
        $scope.transformations = [];
        $scope.shouldTruncate = false;
        $scope.enableEmails = false;

        function getObjFieldList(table) {

            function getFieldList(listOfColumns) {
                return listOfColumns.map(function(column) {
                    return {
                        // For non existing columns, there is no source/target.
                        sourceFieldname: column.sourceFieldname || column.name,
                        targetFieldname: column.targetFieldname || column.name
                    };
                });
            }

            function removeDuplicateTargets(fieldList, transformationList) {
                return _.unionBy(transformationList, fieldList, function(field) {
                    return field.targetFieldname;
                });
            }

            var selectedSubItems = table.subItems.
                filter(function(subItem){
                    return subItem.isChecked;
                });

            var objFieldList = getFieldList(selectedSubItems);

            var transformationList = $scope.transformations.reduce(function(result, transform) {
                if(transform.table.name === table.name) {
                    result.push({
                        expression: transform.expression,
                        targetFieldname: transform.name
                    });
                }
                return result;
            }, []);

            if(transformationList.length && !objFieldList.length) {
                return $scope.getTableColumns(table.name).
                    then(function (columns) {
                        return removeDuplicateTargets(getFieldList(columns), transformationList);
                    });
            }

            return $q.when(removeDuplicateTargets(objFieldList, transformationList));
        }

        function getErrorContent(userAction, response) {
            var errorData = alertService.getUserActionFailureAlertContent(userAction,
                response);
            errorData.data = response.data;
            return errorData;
        }

        //region Step final loading
        $scope.isImportDisabled = function () {
            var toolTip = $scope.getImportTooltip();
            if( toolTip != $scope.strings.IMPORT_TIP) {
                return true;
            }
            return false;
        };

        $scope.getImportTooltip = function () {
            if(! $scope.dsMetaData.name) {
                return $scope.strings.IMPORT_DISABLED_TIP;
            }
            var errorResp = schedulerService.isScheduleConfigValid($scope.scheduleConfig);
            if(!!errorResp) {
                return errorResp.message;
            }
            return $scope.strings.IMPORT_TIP;
        };

        /**
         * The Import Workflow:
         *
         * This has the following steps:
         *
         * 1. get the objFieldList comprised of selected columns and transformations
         *    added. [getObjectFieldLists].
         * 2. get the TaskList to be imported [populateDataSourceTaskList()]
         *    The taskList contains both the existing tables and newly selected.
         * 3. Pass the newlySelected tables' task list to get the SQL string [getDDL]
         * 4. Show the editor dialog containing the SQL,
         *    user can make changes here [showEditSchemaDialog].
         * 5. When the user click load, create a new datasource if not present. [createDataSource]
         * 6. Execute the SQL in the editor, also pass the task list to the backend.
         *    [executeSchema]. The backend returns a modified task list based on targets.
         * 7. Merge the backend task list changes with the client task list and then
         *    call dsload. [loadData].
         *
         * This flow follows the accumulator pattern of promise chaining, where a prop
         * is added to the result object at each step and passed to the next. An empty ({})
         * is dropped at the first step.
         */
        $scope.startImportDataWorkflow = function() {
            if(!$scope.dsMetaData.name) {
                return;
            }
            //pass the initial empty accumulator.
            getObjFieldLists({}).
                then(populateDataSourceTaskList).
                then(getDDL).
                then(function(params) {
                    var schema = fetchSchema(params);
                    return userDialogs.showEditSchemaDialog(
                        schema,
                        continueImportDataWorkflow.bind(null, params)
                    );
                });

            function continueImportDataWorkflow(params, schema) {
                _.assign(params, {schema: schema});
                return createDataSource(params).
                    then(detachRemovedTablesFromDataSource).
                    then(executeSchema).
                    then(loadData).
                    then(function() {
                        navService.goToDataSources();
                    });
            }
        };

        function validateImportMetadata() {
            var userAction = new UserAction(UserAction.DATA_SOURCE_SCHEDULE_VALIDATION);
            var errorResp = schedulerService.isScheduleConfigValid($scope.scheduleConfig);
            if(errorResp === void 0) {
                return $q.when();
            } else {
                alertService.showUserActionFailureAlert(userAction, {} /* trace response */ , {
                    substitutions:
                    {
                        0 : errorResp.message
                    }
                });
                return $q.reject();
            }
        }

        function detachRemovedTablesFromDataSource(params) {
            var datasource = params.dataSource;
            var removedTasks = params.removedTasks;
            if( !removedTasks || removedTasks.length === 0) {
                return params;
            }
            var tablesToRemove = removedTasks.map(
                function(task) {
                    return task.sourceObjName;
                }
            );
            loadingIndicator.show();
            var userAction = new UserAction(UserAction.DATA_SOURCE_GET_CREATE_DDL);
            return dataManagementService.detachTablesFromDataSource(
                $scope.dsMetaData.connectionType,
                datasource.getId(),
                tablesToRemove
            ).
            then(function(response) {
                loadingIndicator.hide();
                return params;
            }, function(response) {
                loadingIndicator.hide();
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        function fetchSchema(params) {
            var ddlData = params.ddlData;
            params.newTasks = ddlData.taskSet;
            var ddlStatements = ddlData.ddlStatements;
            return ddlStatements.join('\n');
        }

        function getObjFieldLists(params) {
            var columnListPromises = $scope.shuttleModel.selectedItems.map(function(table) {
                return getObjFieldList(table);
            });

            return util.getAggregatedPromise(columnListPromises).
                then(function(result) {
                    var fieldLists = result.reduce(function(srcColMap, columns, index) {
                        srcColMap[$scope.shuttleModel.selectedItems[index].name] = columns;
                        return srcColMap;
                    }, {});
                    return _.assign(params, {
                        fieldLists: fieldLists
                    });
                });
        }

        /**
         * Get the DDL string for a given task list
         * @param params
         * @param {Array<DataSourceTask>} params.newTasks
         * @returns {*}
         */
        function getDDL(params) {
            var taskList = params.newTasks;
            Array.prototype.push.apply(taskList,  params.alreadyLoadedTasks);
            loadingIndicator.show();
            var userAction = new UserAction(UserAction.DATA_SOURCE_GET_CREATE_DDL);
            return dataManagementService.getCreateDdl(
                $scope.dsMetaData.connectionType,
                $scope.dsMetaData.selectedConnection,
                $scope.dsMetaData.name,
                taskList
            ).
            then(function(response) {
                loadingIndicator.hide();
                return _.assign(params, {
                    ddlData: response.data
                });
            }, function(response) {
                loadingIndicator.hide();
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        /**
         * Creates data source on the server
         * @param name          data source name
         * @param description   data source description
         * @param type          data source type
         * @param configuration meta data about the data source
         * @returns {Promise}   A promise that resolves with server response from create data source
         */
        function createDataSource(params) {
            if(!!dataSource && !!dataSource.getId()) {
                return $q.when(_.assign(params, {
                    dataSource: dataSource
                }));
            }
            var configuration = {
                configuration: {
                    ConnectionType: $scope.dsMetaData.connectionType,
                    ConnectionId: $scope.dsMetaData.selectedConnection,
                    ConnectionName: $scope.connections[$scope.dsMetaData.selectedConnection],
                    enableEmails : $scope.enableEmails
                }
            };
            loadingIndicator.show({loadingText: $scope.strings.CREATING_DS});
            var userAction = new UserAction(UserAction.CREATE_DATA_SOURCE);
            return dataManagementService.createDataSource(
                $scope.dsMetaData.name,
                $scope.dsMetaData.desc,
                $scope.dsMetaData.connectionType,
                configuration
            ).
                then(function(response) {
                    loadingIndicator.hide();
                    dataSource = response.data;
                    return _.assign(params, {
                        dataSource: dataSource
                    });
                }, function(response) {
                    loadingIndicator.hide();
                    var errorContent = getErrorContent(userAction, response);
                    return $q.reject(errorContent);
                });
        }

        /**
         *
         * @param params
         * @param {Object} params.schema
         * @param {Array<DataSourceTask>} params.newTasks DataSourceTaskList
         * @returns {Promise}
         */
        function executeSchema(params) {
            var schemaText = params.schema.schemaText;
            var newTasksList = params.newTasks;

            var userAction = new UserAction(UserAction.DATA_SOURCE_EXECUTE_DDL);
            loadingIndicator.show({loadingText: $scope.strings.EXECUTING_DDL});
            return dataManagementService.executeDdl(
                dataSource.getId(),
                newTasksList,
                schemaText
            ).then(function(response) {
                loadingIndicator.hide();
                return _.assign(params, {
                    newTasks: response.data
                });
            }, function(response) {
                loadingIndicator.hide();
                var errorContent = getErrorContent(userAction, response);
                return $q.reject(errorContent);
            });
        }

        /**
         * Given data json from server(create schema response), loads data into ThoughtSpot
         *
         *  @param {Array<DataSourceTask>} params.newTasks Tasks which correspond to tables added now.
         * @param {Array<DataSourceTask>} params.alreadyLoadedTasks The tasks which correspond to
         *                                                          already loaded tables.
         * @returns {promise} A promise that resolves with server response from load data
         */
        function loadData(params) {
            // Remove tasks that originally were not altered from UI, but have been altered in the
            // backend. They need to be removed from the alreadyLoadedTasks list to avoid
            // duplication.
            var dataSourceTaskList = _.unionBy(params.newTasks, params.alreadyLoadedTasks,
                function(task) {
                    return task[DataSourceTask.Fields.SOURCE_NAME];
                });

            loadingIndicator.show({loadingText: $scope.strings.LOADING_DATA});
            var userAction = new UserAction(UserAction.LOAD_FROM_DATA_SOURCE);
            return dataManagementService.loadDataFromSource(dataSource.getId(),
                dataSourceTaskList,
                $scope.scheduleConfig,
                $scope.dsMetaData.preScriptText,
                $scope.dsMetaData.postScriptText).
                then(function(response) {
                    loadingIndicator.hide();
                    alertService.showUserActionSuccessAlert(userAction);
                    return response.data;
                }, function (response) {
                    loadingIndicator.hide();
                    var errorContent = getErrorContent(userAction, response);
                    return $q.reject(errorContent);
                });
        }

        function populateDataSourceTaskList(params) {
            var fieldLists = params.fieldLists;
            var newlyAddedTables = $scope.shuttleModel.selectedItems.filter(
                function(table) {
                    return !table.alreadyLoaded;
                }
            );

            var updateTransformations = function(task, transformations) {
                // Fetch current transformations present for the datsource.
                var newExpressionsByTarget = transformations.reduce(
                    function(map, expression) {
                        map[expression.name] = expression;
                        return map;
                    }, {}
                );
                // Fetch old transforms from datasource for the current task.
                var oldTransforms = dataSource.getTransformations();
                var oldTransforms = oldTransforms.filter(
                    function(expression) {
                        return  expression.table.name === task.sourceObjName;
                    }
                );
                var oldExpressionsByTarget = oldTransforms.reduce(
                    function(map, expression) {
                        map[expression.name] = expression;
                        return map;
                    }, {}
                );
                var mappingsByTarget = task.objFieldMappings.reduce(
                    function(map, mapping) {
                        map[mapping.targetFieldname] = mapping;
                        return map;
                    }, {}
                );
                // Update objField mappings which are added a transformation.
                _.forEach(mappingsByTarget, function(value, key) {
                    if(!!newExpressionsByTarget[key]) {
                        value.expression = newExpressionsByTarget[key].expression;
                    }
                });
                // The transforms that are not present in the task mappings would be new columns.
                // so marking the task to add them.
                _.forEach(newExpressionsByTarget, function(value, key) {
                    if(!mappingsByTarget[key]) {
                        // New column using expression has been added.
                        task.markMappingForAddition(value.name, value.expression,
                            void 0);
                    }
                });

                _.forEach(oldExpressionsByTarget, function(value, key) {
                    if(!newExpressionsByTarget[key]) {
                        // Old column using expression needs to be deleted as it couldnt be found
                        // in the list of new expressions.
                        task.markMappingForDeletion(value.name, value.name, value.expression,
                            void 0);
                    }
                });
            };

            var updateExistingTasks = function() {
                var taskList = dataSource.getTaskList();
                taskList = taskList.map(
                    function(task) {
                        task.truncateTable = $scope.shouldTruncate;
                        task.enableEmails = $scope.enableEmails;
                        // Update task mappings for addition and deletion of transformations.
                        var transformations = $scope.transformations.filter(
                            function(expression) {
                                return  expression.table.name === task.sourceObjName;
                            }
                        );
                        updateTransformations(task, transformations);
                        var filters = getDataFiltersForTable(task.sourceObjName);
                        var filterCondition = filters.map(function(filter) {
                            return {
                                fieldName: filter.column.name,
                                operator: filter.option.toUpperCase(),
                                value: filter.text
                            };
                        });
                        task.filterCondition = filterCondition;
                        return task;
                    }
                );
                dataSource.setTaskList(taskList);
            };

            var markUpdatedColumnSelectionsInTask = function(task, newCols, oldCols) {
                var addedCols = _.differenceWith(newCols, oldCols,
                    function(newVal, oldVal) {
                        return newVal.sourceFieldname === oldVal.sourceFieldname
                            && newVal.type === oldVal.type;
                    });
                var removedCols = _.differenceWith(oldCols, newCols,
                    function(newVal, oldVal) {
                        return newVal.sourceFieldname === oldVal.sourceFieldname
                            && newVal.type === oldVal.type;
                    });
                addedCols.map(
                    function(col) {
                        task.markMappingForAddition(col.sourceFieldname, '', col.type);
                    }
                );
                removedCols.map(
                    function(col) {
                        task.markMappingForDeletion(col.sourceFieldname,
                            col.targetFieldname, '', col.type);
                    }
                );
            };

            var appendTaskListWithDeletedTasks = function(newTaskList) {
                var oldTaskList = dataSource.getTaskList();
                var removedTasks = _.differenceWith(oldTaskList, newTaskList,
                    function(newVal, oldVal) {
                        return newVal.sourceObjName === oldVal.sourceObjName;
                    });
                removedTasks = removedTasks.map(
                    function(removedTask) {
                        removedTask.taskState = DataSourceTask.State.DELETED;
                        return removedTask;
                    }
                );
                Array.prototype.push.apply(newTaskList, removedTasks);
            };

            var updateTaskMappings = function(tables) {
                var taskList = [];
                tables = tables.map(
                    function(table) {
                        var task = $scope.tablesLoadedByName[table.name];
                        if( !task) {
                            return table;
                        }
                        task.taskState = DataSourceTask.State.EXISTING;
                        if(!table.subItems || table.subItems.length === 0) {
                            // This means that the user hasnt expanded an already loaded table
                            // and hence there wont be any added/deleted columns for the table.
                            taskList.push(task);
                            return;
                        }

                        var checkedTableSubItems = table.subItems.filter(
                            function(col) {
                                return col.isChecked;
                            }
                        );
                        // Fetched from the subItems selected by the user when the selected
                        // tables are expanded in the shuttle step.(Step 2)
                        var newTableCols = checkedTableSubItems.map(
                            function(col) {
                                return {
                                    sourceFieldname : col.name,
                                    targetFieldname : col.name,
                                    type : col.dataType
                                };
                            }
                        );
                        // Fetched from the dataSource object, which was populated when it was
                        // created/last updated.
                        var oldTableCols = task.getColumns().map(
                            function(col) {
                                return {
                                    sourceFieldname : col.sourceFieldname,
                                    targetFieldname : col.targetFieldname,
                                    type : col.targetFieldDataType
                                };
                            }
                        );
                        // Compare the set of columns in the table that were previously selected
                        // with the set of columns that have been selected currently during
                        // datasource edit. We mark the newly selected columns as ADD_COL and
                        // previously selected columns that are un-selected now as DEL_COL. This
                        // allows callosum the intelligence to generate alter statements on falcon
                        // to accomplish what the user intends.
                        markUpdatedColumnSelectionsInTask(task, newTableCols, oldTableCols);
                        taskList.push(task);
                    }
                );
                // Compare the current taskList vs the old taskList before the datasource was
                // edited by the user. If any tables were removed from the datasource, the
                // corresponding tasks will be missing and those shall be marked as DELETED, which
                // will tell callosum to detach those tables from the current datasource in
                // postgres. This will inturn mark the detached tables under 'default' datasource
                // in the tables section.
                appendTaskListWithDeletedTasks(taskList);
                // Update the datasource object withe the modified tasklist as user inteded in the
                // edit mode.
                dataSource.setTaskList(taskList);
            };

            if( !!dataSource) {
                updateExistingTasks();
                updateTaskMappings($scope.shuttleModel.selectedItems);
            }
            var dataSourceTaskLists = DataSourceTask.getDataSourceTaskLists(
                dataSource,
                fieldLists,
                getDataFiltersForTable,
                newlyAddedTables,
                $scope.shouldTruncate,
                $scope.enableEmails);

            return _.assign(params, dataSourceTaskLists);
        }

        function getDataFiltersForTable(tableName) {
            return $scope.dataFilters.
                findAll(function(filter) {
                    return filter.values.name === tableName;
                }).
                map(function(filter) {
                    return filter.values;
                });
        }

        function getLoadDataController() {
            function initTypeStepState() {
                $scope.errorRowMsg = '';
            }

            var truncateCheckboxCtrl = new CheckboxComponent(
                $scope.strings.TRUNCATE_TABLES,
                function() {
                    return $scope.shouldTruncate;
                }
            ).setOnClick(function($event) {
                $scope.shouldTruncate = !$scope.shouldTruncate;
            });

            var enableEmailsCheckboxCtrl = new CheckboxComponent(
                $scope.strings.ENABLE_EMAILS,
                function () {
                    return $scope.enableEmails;
                }
            ).setOnClick(function ($event) {
                $scope.enableEmails = !$scope.enableEmails;
            });

            $scope.truncateCheckboxCtrl = truncateCheckboxCtrl;
            $scope.enableEmailsCheckboxCtrl = enableEmailsCheckboxCtrl;
            $scope.accordion = new AccordionListViewerComponent(
                false /* expand only a single item in the viewer */);
            $scope.accordionItem = {
                Schedule: new AccordionListViewerItemComponent(
                    $scope.accordion /* accordion list viewer */,
                    $scope.strings.ACCORDION.SCHEDULE.TITLE /* title header */,
                    void 0 /* title description */,
                    'scheduler_id' /* content template id */,
                    false /* item expanded status */
                ),
                PreScript: new AccordionListViewerItemComponent(
                    $scope.accordion /* accordion list viewer */,
                    $scope.strings.ACCORDION.PRE_SCRIPT.TITLE /* title header */,
                    $scope.strings.ACCORDION.PRE_SCRIPT.DESCRIPTION /* title description */,
                    'pre_script' /* content template id */,
                    false /* item expanded status */
                ),
                PostScript: new AccordionListViewerItemComponent(
                    $scope.accordion /* accordion list viewer */,
                    $scope.strings.ACCORDION.POST_SCRIPT.TITLE /* title header */,
                    $scope.strings.ACCORDION.POST_SCRIPT.DESCRIPTION /* title description */,
                    'post_script' /* content template id */,
                    false /* item expanded status */
                )
            };

            function getLoadDataPromise() {
                return $q.when();
            }

            return {
                title: strings.importData.LOAD_DATA,
                contentUrl: 'src/modules/data-sources/import-data/import-data-step-final.html',
                getProceedInstructions: function () {
                    return '';
                },
                getNextStepPromise: getLoadDataPromise,
                onBack: function () {
                    initTypeStepState();
                },
                onRevisitFromNextStep: function() {
                    initTypeStepState();
                }
            };
        }

        //endregion

        //region STEP select datasource type
        function getSelectDataSourceTypeController () {
            var DATA_SOURCES_IMAGE_PATH = '/resources/img/data-sources/';
            var defaultImagePath =  DATA_SOURCES_IMAGE_PATH + 'default.png';
            var oldType;

            function goToNextStep() {
                if(oldType !== $scope.dsMetaData.connectionType) {
                    reset();
                }
                return refreshConnectionList();
            }

            $scope.selectSourceType = function (name) {
                $scope.dsMetaData.connectionType = $scope.dsDisplayNameToType[name];
                $scope.userDataWizard.goToNextStep();
            };

            $scope.getImageSource = function (name) {
                return $scope.dsTypeToImagePath[$scope.dsDisplayNameToType[name]];
            };

            $scope.getShowCaseImageTooltip = function (type) {
                return '';
            };

            $scope.isSelected = function (name) {
                return $scope.dsMetaData.connectionType === $scope.dsDisplayNameToType[name];
            };

            var getDataSourceTypes = function() {
                var userAction = new UserAction(UserAction.FETCH_DATA_SOURCE_TYPES);
                return dataManagementService.getDataSourceTypes()
                    .then(function(response) {
                        $scope.dsTypeToDisplayName = response.data;
                        $scope.dsDisplayNameToType = _.invert($scope.dsTypeToDisplayName);
                        $scope.displayNames = Object.keys($scope.dsDisplayNameToType);
                        return response.data;
                    }, function(response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        return $q.reject(response.data);
                    })
                    .then(function(response) {
                        var dsTypes = Object.keys($scope.dsTypeToDisplayName);
                        $scope.dsTypeToImagePath = dsTypes.reduce(function( map, dsType) {
                            map[dsType] = defaultImagePath;
                            return map;
                        }, {});
                        var imageFetchPromises = dsTypes.reduce(function(arr, dsType) {
                            arr.push(getImageFetchPromise(DATA_SOURCES_IMAGE_PATH + dsType + '.svg',
                                dsType));
                            arr.push(getImageFetchPromise(DATA_SOURCES_IMAGE_PATH + dsType + '.png',
                                dsType));
                            return arr;
                        }, []);
                        return util.getAggregatedPromise(imageFetchPromises)
                            .then(function(imageFetchResponses) {
                                imageFetchResponses.map(function(imageFetchResponse) {
                                    var resp = imageFetchResponse.response;
                                    var dsType = imageFetchResponse.dsType;
                                    var status = imageFetchResponse.status;
                                    if( status === 200) {
                                        var currImagePath = $scope.dsTypeToImagePath[dsType];
                                        if(currImagePath === defaultImagePath || currImagePath
                                            == DATA_SOURCES_IMAGE_PATH + dsType + '.png') {
                                            $scope.dsTypeToImagePath[dsType] = imageFetchResponse.url;
                                        }
                                    }
                                })

                            });
                    });
            };

            var isNextDisabled = function () {
                return !$scope.dsMetaData.connectionType;
            };


            var getImageFetchPromise = function (url, dsType) {
                var deferred = $q.defer();
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.addEventListener('load', function() {
                    deferred.resolve(
                        {
                            response : xhr.response,
                            dsType : dsType,
                            status : xhr.status,
                            url : url
                        });
                });
                xhr.send();
                return deferred.promise;
            };

            return {
                title: $scope.strings.SELECT_CONNECTION_TYPE,
                contentUrl: 'src/modules/data-sources/import-data/import-data-step-type.html',
                getProceedInstructions: function () {
                    return '';
                },
                getNextStepPromise: goToNextStep,
                getStartPromise: getDataSourceTypes,
                onBack: function() {
                },
                onRevisitFromNextStep: function() {
                    oldType = $scope.dsMetaData.connectionType;
                },
                isNextDisabled: isNextDisabled,
                hideFooter: true
            };
        }
        //endregion

        //region Step Shuttle

        //region Create/Refresh Connections
        $scope.shouldAllowNewConnection = function() {
            return !$scope.existingDataId;
        };

        var connectionProperties;
        $scope.createNewConnection = function() {
            getConnectionAttributes().
                then( function(data) {
                    return userDialogs.showCreateConnectionDialog(data,
                        createConnection);
                }).
                then(refreshConnectionList).
                then($scope.getTables).
                then(function () {
                    connectionProperties = undefined;
                });
        };

        function alterConnection(data, alterConnCallback, userActionEnum) {
            connectionProperties = data;
            var userAction = new UserAction(userActionEnum);
            return alterConnCallback()
                .then(function(response) {
                    alertService.showUserActionSuccessAlert(userAction, response);
                    $scope.dsMetaData.selectedConnection = response.data;
                }, function(response) {
                // shows error message on the footer without closing the dialog box.
                // Previous behaviour involved closing of the dialog box and
                // displaying the error on the red-bar.[SCAL-13457]
                    var errorData = alertService.getUserActionFailureAlertContent(
                    userAction,
                    response
                );
                    errorData.data = response.data;
                    initTables();
                    return $q.reject(errorData);
                });
        }

        function createConnection(data) {
            var connAttributes = data.attributes.reduce(function(result, attribute) {
                result[attribute.name] = attribute.value;
                return result;
            }, {});
            return alterConnection(data,
                function() {
                    return dataManagementService.createConnection(
                        $scope.dsMetaData.connectionType,
                        data.name,
                        '',
                        connAttributes
                    );
                },
                UserAction.DATA_SOURCE_CREATE_CONNECTION);
        }

        function updateConnection(data) {
            var connAttributes = data.attributes.reduce(function(result, attribute) {
                result[attribute.name] = attribute.value;
                return result;
            }, {});
            return alterConnection(data,
                function() {
                    return dataManagementService.updateConnection(
                        $scope.dsMetaData.connectionType,
                        data.name,
                        data.connId,
                        '',
                        connAttributes
                    );
                },
                UserAction.DATA_SOURCE_EDIT_CONNECTION);
        }

        function getConnectionAttributes(connectionId) {
            if(!!connectionProperties) {
                return $q.when(connectionProperties);
            }
            var userAction = new UserAction(UserAction.GET_DATA_SOURCE_CONNECTION_ATTRIBUTES);
            return dataManagementService.getConnectionAttributes(
                $scope.dsMetaData.connectionType,
                connectionId
            ).then(function (response) {
                return {
                    name: '',
                    attributes: response.data
                };
            }, function (response) {
                alertService.showUserActionFailureAlert(userAction, response);
                _logger.error('failed to get data source connections', response);
                return $q.reject(response.data);
            });
        }

        function refreshConnectionList() {
            var userAction = new UserAction(UserAction.GET_DATA_SOURCE_CONNECTIONS);
            return dataManagementService.getDataSourceConnections(
                $scope.dsMetaData.connectionType
            ).then(function (response) {
                $scope.connections = response.data;
                // Need to build a list because ui-select does not like objects.
                $scope.connectionList = Object.keys($scope.connections).map(function(id) {
                    return {
                        id: id,
                        name: $scope.connections[id]
                    };
                });
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        $scope.deleteConnection = function ($evt, connection) {
            $evt.stopPropagation();
            if($scope.dsMetaData.selectedConnection === connection.id) {
                $scope.dsMetaData.selectedConnection = "";
                initTables();
            }
            var userAction = new UserAction(UserAction.DATA_SOURCE_DELETE_CONNECTION);
            return dataManagementService.deleteConnection(
                connection.id,
                $scope.dsMetaData.connectionType
            ).
                then(function(response) {
                    alertService.showUserActionSuccessAlert(userAction, response);
                    return response;
                }, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response);
                }).
                then(refreshConnectionList);
        };

        $scope.editConnection = function ($evt, connection, connName) {
            $evt.stopPropagation();

            return getConnectionAttributes(connection.id)
                .then( function(data) {
                    data.name = connection.name;
                    data.connId = connection.id;
                    // TODO (Rahul B): this is a temporary fix to not allow users to change conn name
                    // Since multiple data source can be mapped to a single connection,
                    // it is very costly to iterate over all data sources in the system. A permenant
                    // fix for this issue would be addressed as a part of metadata revamp for
                    // data connect, which should decouple tasks, connections, schedules etc from
                    // datasource object.
                    data.nameReadOnly = true;
                    return data;
                })
                .then(function(data) {
                    return userDialogs.showEditConnectionDialog(data,
                        updateConnection);
                })
                .then( function() {
                    $scope.dsMetaData.selectedConnection = connection.id;
                    if(!$scope.existingDataId) {
                        // Fetch the tables with the edited connection.
                        return $scope.getTables();
                    } else{
                        // make sure that the edited connection is consistent with the
                        // tables that the datasource already has.
                        return getDataSourceDetails();
                    }
                })
                .finally(
                    function() {
                        connectionProperties = null;
                    }
                );
        };

        //endregion

        function populateAvailableTables(connObjs) {
            $scope.shuttleModel.availableItems = connObjs.map(function(tableName) {
                return {
                    name: tableName,
                    checkedState: itemViewerService.CheckedStates.unchecked,
                    subItems: []
                };
            });
            $scope.shuttleModel.showShuttle = true;
        }

        $scope.getTables = function () {
            initTables();
            return fetchTables();
        };

        function fetchTables(searchText) {
            loadingIndicator.show();
            return getConnObjList(searchText)
                .then(populateAvailableTables)
                .finally(loadingIndicator.hide);
        }

        function getConnObjList(searchText) {
            if( !searchText || searchText === void 0) {
                searchText = '';
            }
            var userAction = new UserAction(UserAction.GET_DATA_SOURCE_CONNECTION_LIST);
            return dataManagementService.getDataSourceConnectionObjList(
                $scope.dsMetaData.selectedConnection,
                $scope.dsMetaData.connectionType,
                encodeURI(searchText))
                .then(function(response) {
                    return response.data;
                }, function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                });
        }

        //region Load Old DS details
        function moveTablesToSelectedAndAlreadyLoaded() {
            function getCheckboxItemFromColumn(column) {
                return _.assign(column, {
                    isChecked: true,
                    name: column.targetFieldname
                });
            }
            var taskList = dataSource.getTaskList();
            $scope.tablesLoadedByName =
                _.keyBy(taskList, DataSourceTask.Fields.SOURCE_NAME);

            var previouslySelectedItems = $scope.shuttleModel.availableItems.findAll(
                function(availableItem) {
                    return !!$scope.tablesLoadedByName[availableItem.name];
                }
            );
            // Get the set of tables that are currently selectable from the list of available tables
            var currentAvailableTableNames = previouslySelectedItems.map(function( table ) {
                return table.name;
            });

            // If there is a difference in the set of tables that are present in the datasource and
            // the set of tables that are currently available for selection, we make an attempt to
            // fetch the tables from informatica. This happens if the table to select is not in the
            // first 200 set of tables. Informatica only returns 200 tables and currently has no
            // pagination support.
            var previouslyLoadedTableNames = Object.keys($scope.tablesLoadedByName);
            // Tables that are not yet found in available set.
            var unFoundTables = _.difference(previouslyLoadedTableNames, currentAvailableTableNames);
            var unFoundTableFetchPromises = unFoundTables.map(
                function(tableName) {
                    return getConnObjList(tableName)
                        .then(function(connObjs) {
                            var fetchedObjs = connObjs.reduce(function(arr, objName) {
                                if( objName === tableName) {
                                    arr.push(
                                        {
                                            name: objName,
                                            checkedState: itemViewerService.CheckedStates.unchecked,
                                            subItems: []
                                        }
                                    );
                                }
                                return arr;
                            }, []);
                            // Add to available set of tables.
                            Array.prototype.push.apply($scope.shuttleModel.availableItems,
                                fetchedObjs);
                        });
                });

            return util.getAggregatedPromise(unFoundTableFetchPromises)
                .then(function(tables) {
                    previouslySelectedItems = $scope.shuttleModel.availableItems.findAll(
                        function(availableItem) {
                            return !!$scope.tablesLoadedByName[availableItem.name];
                        }
                    );
                    var alreadyLoadedTables = previouslySelectedItems.map(
                        function(loadedTable) {
                            var task = $scope.tablesLoadedByName[loadedTable.name];
                            loadedTable.alreadyLoaded = true;
                            loadedTable.disallowDeselection = false;
                            _.assign(loadedTable, _.pick(task, [
                                DataSourceTask.Fields.DB_NAME,
                                DataSourceTask.Fields.SCHEMA_NAME,
                                DataSourceTask.Fields.SOURCE_NAME,
                                DataSourceTask.Fields.TARGET_NAME
                            ]));
                            loadedTable.checkedState = itemViewerService.CheckedStates.checked;
                            return loadedTable;
                        });
                    Array.prototype.remove.apply($scope.shuttleModel.availableItems, alreadyLoadedTables);
                    $scope.shuttleModel.selectedItems = alreadyLoadedTables;
                    $scope.isValidConnection = true;
                });

        }

        /**
         * Given data source id, gets the details of it
         * @param id  data source id
         * @returns {promise}   A promise that resolves with server response from data source details
         */
        function updateFiltersTransformsAndSchedule(dataSource) {
            var schedule = dataSource.getSchedule();
            $scope.scheduleConfig = schedulerService.getConfigFromBackendJson(schedule);
            // TODO(Rahul.b): Need a better way than this to show the disable checkbox. Probably
            // would need to move that out of the scheduler. Currently that poses an issue as we
            // have a linker based functionality which needs to be applied on the rest of the dom
            // elements when the disable checkbox is checked, which essentially grays out the items.
            $scope.scheduleConfig.showDisable = true;
            $scope.dataFilters = dataSource.getFilters();
            $scope.transformations = dataSource.getTransformations();
        }

        function enableEmailsIfPreviouslyEnabled(tasks) {
            $scope.enableEmails = tasks.any(
                function(task) {
                    return !!task.enableEmails;
                }
            );
        }

        function enableTableTruncateIfPreviouslyEnabled(tasks) {
            $scope.shouldTruncate = tasks.any(
                function(task) {
                    return !!task.truncateTable;
                }
            );
        }

        function getDataSourceDetails () {
            loadingIndicator.show();
            return dataManagementService.getDataSourceDetails($scope.existingDataId)
                .then(function(dataSourceObj) {
                    dataSource = dataSourceObj;
                    $scope.dsMetaData.name = dataSource.getName();
                    $scope.dsMetaData.desc = dataSource.getDescription();

                    var config = dataSource.getConfig();
                    $scope.dsMetaData.selectedConnection = config.ConnectionId;
                    $scope.dsMetaData.connectionType = config.ConnectionType;
                    $scope.dsMetaData.preScriptText = config.PreScript;
                    $scope.dsMetaData.postScriptText = config.PostScript;
                    $scope.connections = {};
                    $scope.connections[config.ConnectionId] = config.ConnectionName;
                    $scope.connectionList = [{id:config.ConnectionId, name:config.ConnectionName}];
                    updateFiltersTransformsAndSchedule(dataSource);
                    enableEmailsIfPreviouslyEnabled(dataSource.getTaskList());
                    enableTableTruncateIfPreviouslyEnabled(dataSource.getTaskList());
                    return dataSource;
                }, function(response) {
                    return $q.reject(response);
                })
                .then($scope.getTables)
                .then(moveTablesToSelectedAndAlreadyLoaded)
                .finally(loadingIndicator.hide);
        }
        //endregion

        function getChooseTableController() {
            // This indicates whether the user has clicked the Next button
            var isNextClicked = false;
            var showUnsupportedColumnsWarning = true;

            function initChooseTableState() {
                $scope.errorRowMsg = '';
            }

            function showUnsupportedColumnsDialog(tableNames) {
                var dialogData = {};
                var unsupportedMessage = strings.importData.TABLE_CONTAINS_UNSUPPORTED_COL;
                if( tableNames.length > 1) {
                    dialogData = {
                        tables: tableNames,
                        message: unsupportedMessage.MULTIPLE_TABLES,
                        listFunction: function(index, table) {
                            return '' + (index + 1) + '. ' + table;
                        }
                    };
                } else {
                    dialogData = {
                        message: unsupportedMessage.SINGLE_TABLE.assign(tableNames[0])
                    };
                }
                var deferred = $q.defer();
                dialog.show({
                    title: strings.importData.UNSUPPORTED_COLUMN,
                    confirmBtnLabel: strings.OK,
                    customBodyUrl: 'src/common/widgets/dialogs/templates/' +
                    'import-selected-tables-warning-dialog.html',
                    skipCancelBtn: true,
                    onConfirm: function() {
                        deferred.reject();
                        $scope.showUnsupportedColumnsWarning = false;
                        return true;
                    },
                    onDismiss: function() {
                        deferred.reject();
                        return true;
                    },
                    customData: dialogData
                });
                return deferred.promise;
            }

            function showTablesWithNoColumnsDialog(tableNames) {
                var dialogData = {};
                var noColumnsSelected = strings.importData.TABLE_CONTAINS_NO_COL;
                if( tableNames.length > 1) {
                    dialogData = {
                        tables: tableNames,
                        message: noColumnsSelected.MULTIPLE_TABLES,
                        listFunction: function(index, table) {
                            return '' + (index + 1) + '. ' + table;
                        }
                    };
                } else {
                    dialogData = {
                        message: noColumnsSelected.SINGLE_TABLE.assign(tableNames[0])
                    };
                }
                var deferred = $q.defer();
                dialog.show({
                    title: strings.importData.NO_COLUMNS_SELECTED,
                    confirmBtnLabel: strings.OK,
                    customBodyUrl: 'src/common/widgets/dialogs/templates/' +
                    'import-selected-tables-warning-dialog.html',
                    skipCancelBtn: true,
                    onConfirm: function() {
                        deferred.reject();
                        return true;
                    },
                    onDismiss: function() {
                        deferred.reject();
                        return true;
                    },
                    customData: dialogData
                });
                return deferred.promise;
            }

            $scope.showUnsupportedColumnsWarning = true;
            /**
             * Determine if a warning needs to be shown for un-supported columns. We do not
             * show a warning for the same set of table multiple times to the user.
             */
            $scope.$watch(function() {
                return $scope.shuttleModel.selectedItems;
            }, function () {
                $scope.showUnsupportedColumnsWarning = true;
            });

            /**
             * Resolves if all the column names are valid, else shows an error.
             */
            function getChooseTablePromise() {
                isNextClicked = true;
                initChooseTableState();
                if(!$scope.shuttleModel.selectedItems.length) {
                    $scope.errorRowMsg = strings.importData.TABLE_ERROR;
                    return $q.reject();
                }
                // Do not show warning if we have shown it already.
                if( $scope.showUnsupportedColumnsWarning === false) {
                    return $q.resolve();
                }
                var getTableSubItems = function(table) {
                    if( !!table.subItems && table.subItems.length > 0) {
                        return $q.when(table.subItems);
                    } else {
                        return $scope.getTableColumns(table.name);
                    }
                };

                var updateTableWithSelectedItems = function(table, tableColumns) {
                    table.subItems = tableColumns.map(function(column) {
                        column.isChecked = !(column.isDisabled || (column.isChecked === false));
                        return column;
                    });
                    return $q.when(table);
                };

                var tableExpandPromises = $scope.shuttleModel.selectedItems.map(
                    function(table) {
                        if( !!table.alreadyLoaded) {
                            return $q.when(table);
                        } else {
                            return getTableSubItems(table)
                                .then(function(tableColumns) {
                                    return updateTableWithSelectedItems(table,
                                        tableColumns);
                                });
                        }
                    });

                return util.getAggregatedPromise(tableExpandPromises)
                    .then(function(tables) {
                        $scope.tablesToLoad = _.cloneDeep(tables);
                        $scope.tablesToLoad.forEach(function(table) {
                            table.subItems = table.subItems.filter(function(column) {
                                return column.isChecked;
                            });
                        });
                        // Check if there are any tables which has all of its columns unselected.
                        var tablesWithNoColumns =  tables.filter(function(table) {
                            if(table.subItems.length === 0) {
                                // Un-expanded subItems mean that there were no un-selections.
                                return false;
                            }
                            return !table.subItems.any(function(subItem) {
                                return subItem.isChecked;
                            })
                        });
                        // Show a warning dialog and do not let the user proceed to the next step
                        // of the wizard if the issue is not rectified.
                        if(tablesWithNoColumns.length > 0) {
                            return showTablesWithNoColumnsDialog(tablesWithNoColumns.map(
                                function(table) {
                                    return table.name;
                                }
                            ));
                        }
                        var tablesWithUnSupportedCols = tables.filter(function(table) {
                            if(!!table.alreadyLoaded) {
                                return false;
                            }
                            return table.subItems.some(function(item) {
                                return item.isDisabled;
                            });
                        });
                        if(tablesWithUnSupportedCols.length > 0) {
                            return showUnsupportedColumnsDialog(tablesWithUnSupportedCols.map(
                                function(table) {
                                    table.checkedState = itemViewerService.CheckedStates.partial;
                                    return table.name;
                                }
                            ));
                        }
                    });
            }

            function isNextDisabled() {
                return !$scope.isValidConnection;
            }

            return {
                title: strings.importData.SELECT_TABLES,
                contentUrl: 'src/modules/data-sources/import-data/import-data-step-shuttle.html',
                proceedInstructions: '',
                getNextStepPromise: getChooseTablePromise,
                onBack: function () {
                    initChooseTableState();
                    connectionProperties = undefined;
                    isNextClicked = false;

                },
                onRevisitFromNextStep: function() {
                    initChooseTableState();
                    isNextClicked = false;
                    showUnsupportedColumnsWarning = true;

                },
                getStartPromise: getDataSourceDetails,
                isNextDisabled: isNextDisabled
            };
        }
        //endregion

        //region STEP filters and transforms
        function getDataFilterController() {
            // This indicates whether the user has clicked the Next button
            var isNextClicked = false;

            function initChooseTableState() {
                $scope.errorRowMsg = '';
            }

            /**
             * Resolves if all the column names are valid, else shows an error.
             */
            function getChooseTablePromise() {
                isNextClicked = true;
                return $q.when();
            }

            return {
                title: strings.importData.FILTERS_TRANSFORMS,
                contentUrl: 'src/modules/data-sources/import-data/import-data-step-datafilters.html',
                proceedInstructions: '',
                getNextStepPromise: getChooseTablePromise,
                onBack: function () {
                    initChooseTableState();
                    isNextClicked = false;
                },
                onRevisitFromNextStep: function() {
                    initChooseTableState();
                    isNextClicked = false;
                }
            };
        }
        //endregion

        $scope.errorRowMsg = '';
        $scope.systemError = '';
        $scope.nextBtnLabel = $scope.strings.NEXT;

        //in case of updating an existing user data object, the id of the existing data object is passed as the "id" url
        //parameter
        $scope.existingDataId = ($route.current && $route.current.pathParams.existingDataId) || void 0;
        $scope.cacheGuid = null;

        $scope.isWizardCancellable = true;
        // TODO(Rahul.b) Add an integration test for the datasource name editable that uses this
        // function. Current e2e tests are still nascent.
        $scope.isEditMode = function() {
            return !!$scope.existingDataId;
        };
        var steps;
        if(!$scope.isEditMode()) {
            steps = [getSelectDataSourceTypeController(), getChooseTableController(), getDataFilterController(), getLoadDataController()];
        } else {
            steps = [getChooseTableController(), getDataFilterController(), getLoadDataController()];
        }

        $scope.showForwardArrow = function(index) {
            return index < steps.length - 1;
        };

        $scope.userDataWizard = new Wizard(steps);

        var confirmationDialogMessages = {
            title: strings.importData.ABORT_DATA_IMPORT,
            message: strings.importData.ABORT_CONFIRMATION_MESSAGE,
            cancelBtnLabel: strings.importData.CANCEL_BTN_LABEL,
            confirmBtnLabel: strings.importData.CONFIRM_BTN_LABEL
        };

        function generateAbortDialogConfig() {
            return angular.extend({}, confirmationDialogMessages, {
                onConfirm: function () {
                    navService.goToDataSources();
                    return true;
                }
            });
        }

        $scope.onCancel = function () {
            var abortDialogConfig = generateAbortDialogConfig();
            dialog.show(abortDialogConfig);
        };
        $scope.isTimelySchedulingEnabled = sessionService.isDataConnectUsingTimely();

        $scope.resetWizard = function () {
            $scope.userDataWizard.reset();
            $scope.errorRowMsg = '';
            $scope.systemError = '';
            $scope.nextBtnLabel = $scope.strings.NEXT;
        };
    }]);
