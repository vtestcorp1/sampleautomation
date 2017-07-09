/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */
'use strict';

/* eslint camelcase: 1, no-undef: 0 */

describe('Import data controller', function () {
    var scope, dataManagementService, metadataService, dialog, dataSourceTask,
        $q, userDialogs, util, mockDsDetails;

    beforeEach(function() {
        module('blink.app');
        inject(function (_$q_,
                         _$route_,
                         $rootScope,
                         $controller,
                         _dialog_,
                         _DataSourceTask_,
                         _dataManagementService_,
                         _metadataService_,
                         _userDialogs_,
                         _util_) {
            $q = _$q_;
            util = _util_;
            scope = $rootScope.$new();
            scope.transformation = {
                isExisting: false
            };
            dialog = _dialog_;
            dataManagementService = _dataManagementService_;
            dataSourceTask = _DataSourceTask_;
            metadataService = _metadataService_;
            dataManagementService.getDataSourceTypes = function () {
                return $q.when({
                    data: []
                });
            };
            userDialogs = _userDialogs_;
            mockDsDetails = {
                "storables": [
                    {
                        "type": "IPAAS_INFORMATICA",
                        "dataSourceContent": {
                            "configuration": {
                                "ConnectionType": "IPAAS_INFORMATICA_SQL_SERVER",
                                "ConnectionId": "001E4E0B0000000002ME",
                                "ConnectionName": "northwind_sql",
                                "enableEmails": "true",
                                "TaskIds": "{\"rbmv_table\":\"001E4E0Z000000000593\"}",
                                "taskConfig": "[{\"sourceObjName\":\"rbmv_table\"," +
                                "\"targetSchemaName\":\"mock-ds\",\"targetdbName\":" +
                                "\"ImportedDatabase\",\"targetObjName\":\"rbmv_table\"," +
                                "\"objFieldMappings\":[{\"sourceFieldname\":\"sample_date\"," +
                                "\"targetFieldname\":\"sample_date\",\"targetFieldDataType\":" +
                                "\"DATE_TIME\",\"expression\":\"\"}],\"filterCondition\":[],\"createTarget\":" +
                                "false,\"truncateTable\":false,\"enableEmails\":true,\"createDDL\":" +
                                "\"CREATE TABLE \\\"ImportedDatabase\\\".\\\"mock-ds\\\"." +
                                "\\\"rbmv_table\\\" (\\n\\\"sample_date\\\" DATETIME,\\n\\\"id\\\" " +
                                "VARCHAR(0),\\nPRIMARY KEY (\\\"id\\\")\\n);\\n\"}]"
                            },
                            "statistics": {},
                            "dataLoadInfo": {
                                "tableToTaskIdMap": {
                                    "rbmv_table": "001E4E0Z000000000593"
                                }
                            },
                            "schemaVersion": "3.5.0"
                        },
                        "logicalTableList": [],
                        "header": {
                            "id": "bc49b657-d963-468f-9c4e-044817b96092",
                            "indexVersion": 0,
                            "generationNum": 4,
                            "name": "mock-ds",
                            "description": "",
                            "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                            "created": 1474403258786,
                            "modified": 1474403266896,
                            "modifiedBy": "59481331-ee53-42be-a548-bd87be6ddd4a",
                            "owner": "bc49b657-d963-468f-9c4e-044817b96092",
                            "isDeleted": false,
                            "isHidden": false,
                            "statistics": {
                                "dataLoadStatistics": {
                                    "scheduled": false,
                                    "connectionType": "IPAAS_INFORMATICA_SQL_SERVER",
                                    "connectionDisplayName": "SQL Server",
                                    "dataLoadStatusList": [
                                        {
                                            "taskID": "001E4E0Z000000000593",
                                            "status": "inprogress",
                                            "message": "Load is in progress.",
                                            "runId": 0,
                                            "header": {
                                                "id": "53cfc9a2-f0e7-4ae7-81e5-5790887d9754",
                                                "indexVersion": 0,
                                                "generationNum": -1,
                                                "tags": []
                                            },
                                            "complete": true,
                                            "incompleteDetail": []
                                        }
                                    ],
                                    "header": {
                                        "id": "9f3271e7-1bac-462b-bdcc-b7dd96844840",
                                        "indexVersion": 0,
                                        "generationNum": -1,
                                        "tags": []
                                    },
                                    "complete": true,
                                    "incompleteDetail": []
                                }
                            },
                            "tags": [],
                            "type": "IPAAS_INFORMATICA"
                        },
                        "complete": true,
                        "incompleteDetail": []
                    }
                ]
            };

            $controller('ImportDataController', {
                $scope: scope,
                dataManagementService: dataManagementService,
                userDialogs: userDialogs,
                util: util
            });
            scope.$apply();
        });
    });

    describe('Step Final loading workflow', function () {
        it('disable import when name not datasource name not given', function () {
            expect(scope.isImportDisabled()).toBe(true);
        });

        function mockImportDataDetails() {
            scope.shuttleModel.selectedItems = [{
                name: 't1',
                subItems: [{
                    name: 'c1',
                    isChecked: true
                }, {
                    name: 'c2',
                    isChecked: false
                }]
            }, {
                name: 't2',
                subItems: []
            }, {
                name: 't3',
                subItems: []
            }, {
                name: 't4',
                subItems: [{
                    sourceFieldname: 'f1',
                    targetFieldname: 'tgt1',
                    isChecked: true
                }]

            }];
            scope.transformations = [{
                name: 'exp1',
                expression: 'expression1',
                table: {
                    name: 't3'
                }
            }];
            scope.dataFilters = [];
            spyOn(dataManagementService, 'getDataSourceConnObjFieldList').and.returnValue(
                $q.when({
                    data: {
                        col1: 'VARCHAR',
                        col2: 'INT'
                    }
                })
            );
            scope.dsMetaData = {
                connectionType: 'type1',
                selectedConnection: 'conn1',
                name: 'test'
            };
        }

        function getMockExpectedTaskList() {
            return [
                {
                    "sourceObjName": "t1",
                    "targetObjName": "t1",
                    "objFieldMappings": [
                        {
                            "sourceFieldname": "c1",
                            "targetFieldname": "c1"
                        }
                    ],
                    "truncateTable": false,
                    "enableEmails": false,
                    "taskState": 'NEW',
                    filterCondition: []
                },
                {
                    "sourceObjName": "t2",
                    "targetObjName": "t2",
                    "objFieldMappings": [],
                    "truncateTable": false,
                    "enableEmails": false,
                    "taskState": 'NEW',
                    filterCondition: []
                },
                {
                    "sourceObjName": "t3",
                    "targetObjName": "t3",
                    "objFieldMappings": [
                        {
                            "expression": "expression1",
                            "targetFieldname": "exp1"
                        },
                        {
                            "sourceFieldname": "col1",
                            "targetFieldname": "col1"
                        },
                        {
                            "sourceFieldname": "col2",
                            "targetFieldname": "col2"
                        }
                    ],
                    filterCondition: [],
                    "truncateTable": false,
                    "taskState": 'NEW',
                    "enableEmails": false
                },
                {
                    "sourceObjName": "t4",
                    "targetObjName": "t4",
                    "objFieldMappings": [
                        {
                            "sourceFieldname": "f1",
                            "targetFieldname": "tgt1"
                        }
                    ],
                    filterCondition: [],
                    "truncateTable": false,
                    "taskState": 'NEW',
                    "enableEmails": false
                }
            ];
        }

        it('should correctly get the data task list', function () {
            mockImportDataDetails();

            spyOn(dataManagementService, 'getCreateDdl');

            scope.startImportDataWorkflow();
            scope.$apply();
            var expectedTaskList = getMockExpectedTaskList();
            expect(dataManagementService.getCreateDdl).toHaveBeenCalledWith(
                'type1',
                'conn1',
                'test',
                jasmine.any(Object)
            );
            var taskList = dataManagementService.getCreateDdl.calls.mostRecent().args[3];
            taskList = taskList.map(function (task) {
                return task.getJson();
            });
            expect(JSON.parse(JSON.stringify(taskList))).toEqual(expectedTaskList);
        });

        it('should show edit schema dialog with schema text', function () {
            mockImportDataDetails();
            var schemaText1 = 'Create sample schema1';
            var schemaText2 = 'Create sample schema2';
            dataManagementService.getCreateDdl = function () {
                return $q.when({
                    data: {ddlStatements: [
                        schemaText1,
                        schemaText2
                    ]}
                });
            };
            spyOn(userDialogs, 'showEditSchemaDialog');

            scope.startImportDataWorkflow();
            scope.$apply();

            var expectedSchema = schemaText1 + '\n' + schemaText2;
            expect(userDialogs.showEditSchemaDialog).toHaveBeenCalledWith(
                    expectedSchema,
                jasmine.any(Function)
            );
        });

        it('should create a datasource if it does not exist with correct params', function () {
            mockImportDataDetails();
            dataManagementService.getCreateDdl = function () {
                return $q.when(
                    {
                        data: {
                            ddlStatements: []
                        }
                    });
            };
            userDialogs.showEditSchemaDialog = function(text, callback) {
                callback({});
            };
            scope.connections = {
                conn1: 'name1'
            };
            spyOn(dataManagementService, 'createDataSource');

            scope.startImportDataWorkflow();
            scope.$apply();

            expect(dataManagementService.createDataSource).toHaveBeenCalledWith(
                'test',
                undefined,
                'type1',
                {
                    configuration : {
                        ConnectionType : 'type1',
                        ConnectionId : 'conn1',
                        ConnectionName : 'name1',
                        enableEmails : false
                    }
                }
            );
        });

        it('should edit an existing connection and create it if passed with correct params', function () {
            // mock out connection creation dialog.
            userDialogs.showEditConnectionDialog = function(data, callback) {
                callback(data);
            };
            scope.dsMetaData.connectionType = 'mock-conn-type';
            scope.dsMetaData.selectedConnection = 'mock-conn-id';
            scope.existingDataId = 'mock-ds-id';

            spyOn(dataManagementService, 'getConnectionAttributes').and.returnValue(
                $q.when({ data: [
                    {
                        "type": "TEXT",
                        "name": "Username",
                        "listOptions": [],
                        "defaultValue": "sa",
                        "isRequired": true,
                        "value": "mock-user-value"
                    },
                    {
                        "type": "TEXT",
                        "name": "name",
                        "listOptions": [],
                        "defaultValue": "mock-conn",
                        "isRequired": true,
                        "value": 'mock-name-value'
                    },
                    {
                        "type": "PASSWORD",
                        "name": "Password",
                        "listOptions": [],
                        "defaultValue": "********",
                        "isRequired": true,
                        "value": 'mock-pwd-value'
                    }
                ]}
            ));
            spyOn(dataManagementService, 'updateConnection').and.returnValue(
                $q.when(
                    {data :'mock-conn'}
                )
            );
            spyOn(dataManagementService, 'getDataSourceConnections').and.returnValue(
                $q.when({
                    data : { "001E4E0B0000000000HT":"mock-conn"}
                })
            );
            spyOn(dataManagementService, 'getDataSourceConnectionObjList').and.returnValue( $q.when({
                data : {
                    col1: 'VARCHAR',
                    col2: 'INT'
                }
            }));

            spyOn(dataManagementService, 'getDataSourceDetails');

            var evt = {
                stopPropagation : function () {
                }
            };

            var connection = {
                id : 'mock-conn-id',
                name: 'mock-conn-name'
            };

            scope.editConnection(evt, connection, 'mock-conn-name');
            scope.$apply();

            expect(dataManagementService.getConnectionAttributes).toHaveBeenCalledWith(
                'mock-conn-type',
                'mock-conn-id'
            );

            expect(dataManagementService.updateConnection).toHaveBeenCalledWith(
                'mock-conn-type',
                'mock-conn-name',
                'mock-conn-id',
                '',
                {
                    Username : "mock-user-value",
                    name : "mock-name-value",
                    Password : "mock-pwd-value"
                }
            );

            expect(dataManagementService.getDataSourceDetails).toHaveBeenCalledWith(
                'mock-ds-id'
            );
            expect(scope.isValidConnection).toBe(true);
        });

        it('Should call dsload with transformed taskList after applying modifications recieved', function () {
            mockImportDataDetails();
            dataManagementService.getCreateDdl = function () {
                return $q.when(
                    {
                        data: {
                            ddlStatements: []
                        }
                    });
            };
            userDialogs.showEditSchemaDialog = function(text, callback) {
                callback({});
            };
            scope.connections = {
                conn1: 'name1'
            };
            dataManagementService.createDataSource = function () {
                return $q.when({
                    data: {
                        getId: _.noop
                    }
                });
            };
            var transformedTaskList = [
                {
                    "sourceObjName": "t1",
                    "targetObjName": "dbtable1",
                    "objFieldMappings": [
                        {
                            "sourceFieldname": "c1",
                            "targetFieldname": "db-c1"
                        }
                    ],
                    "truncateTable": false,
                    "enableEmails": false
                },
                {
                    "sourceObjName": "t2",
                    "targetObjName": "t2",
                    "objFieldMappings": [],
                    "truncateTable": false,
                    "enableEmails": false
                },
                {
                    "sourceObjName": "t3",
                    "targetObjName": "dbtable3",
                    "objFieldMappings": [
                        {
                            "expression": "expression1",
                            "targetFieldname": "db-exp1"
                        },
                        {
                            "sourceFieldname": "col1",
                            "targetFieldname": "col1"
                        },
                        {
                            "sourceFieldname": "col2",
                            "targetFieldname": "db-col2"
                        }
                    ],
                    "truncateTable": false,
                    "enableEmails": false
                },
                {
                    "sourceObjName": "t4",
                    "targetObjName": "t4",
                    "objFieldMappings": [
                        {
                            "sourceFieldname": "f1",
                            "targetFieldname": "tgt1"
                        }
                    ],
                    "truncateTable": false,
                    "enableEmails": false
                }
            ];
            dataManagementService.executeDdl = function () {
                return $q.when({
                    data: transformedTaskList
                });
            };
            spyOn(dataManagementService, 'loadDataFromSource');

            scope.startImportDataWorkflow();
            scope.$apply();

            expect(dataManagementService.loadDataFromSource).toHaveBeenCalled();
            var taskList = dataManagementService.loadDataFromSource.calls.mostRecent().args[1];
            expect(JSON.parse(JSON.stringify(taskList))).toEqual(transformedTaskList);
        });
    });

    it('should fetch list of objects corresponding to a connection', function () {

        scope.dsMetaData.connectionType = 'mock-conn-type';
        scope.dsMetaData.selectedConnection = 'mock-conn';

        spyOn(dataManagementService, 'getDataSourceConnectionObjList').and.returnValue( $q.when({
            data : [
                'mock-table-1',
                'mock-table-2'
            ]
        }));

        var evt = {
            stopPropagation : function () {
            }
        };

        var connection = {
            id : 'mock-conn'
        };

        scope.resetWizard();
        scope.getTables();
        scope.$apply();

        expect(dataManagementService.getDataSourceConnectionObjList).toHaveBeenCalledWith(
            'mock-conn',
            'mock-conn-type',
            ''
        );

    });

    it('should fetch list of objects corresponding to a connection id and search pattern', function () {

        scope.dsMetaData.connectionType = 'mock-conn-type';
        scope.dsMetaData.selectedConnection = 'mock-conn';

        spyOn(dataManagementService, 'getDataSourceConnectionObjList').and.returnValue( $q.when({
            data : [
                'mock-table-1',
                'mock-table-2'
            ]
        }));

        var evt = {
            stopPropagation : function () {
            }
        };

        var connection = {
            id : 'mock-conn'
        };

        scope.shuttleModel.listSearch('mock-search-pattern');
        scope.$apply();

        expect(dataManagementService.getDataSourceConnectionObjList).toHaveBeenCalledWith(
            'mock-conn',
            'mock-conn-type',
            'mock-search-pattern'
        );

    });


    it('should warn when unsupported columns are present in imported tables', function () {
        // Mocking external calls
        var connObjFieldListSpy = spyOn(dataManagementService, 'getDataSourceConnObjFieldList').
            and.returnValue( $q.when({
                data :{
                    "mock-col-1" : 'VARCHAR',
                    "mock-col-2" : 'VARCHAR'
                }
            }
        ));
        spyOn(dialog, 'show');
        scope.shuttleModel.selectedItems = [{name:'mock-table-1'}];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        expect(dataManagementService.getDataSourceConnObjFieldList).toHaveBeenCalled();
        expect(dialog.show).not.toHaveBeenCalled();
        // Table contains unsupported col
        connObjFieldListSpy.and.returnValue( $q.when(
            {
                data :{
                    "mock-col-1" : 'VARCHAR',
                    "mock-col-2" : 'UNKNOWN'
                }
            }
        ));
        scope.shuttleModel.selectedItems = [{name:'mock-table-1'}];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        expect(dataManagementService.getDataSourceConnObjFieldList).toHaveBeenCalled();
        expect(dialog.show).toHaveBeenCalled();
    });

    it('persist selected columns in selected tables when checking for unsupported cols', function () {
        // Mocking external calls
        var connObjFieldListSpy = spyOn(dataManagementService, 'getDataSourceConnObjFieldList').
            and.returnValue( $q.when({
                data :{
                    "mock-col-1" : 'VARCHAR',
                    "mock-col-2" : 'VARCHAR'
                }
            }
        ));
        spyOn(dialog, 'show');
        scope.shuttleModel.selectedItems = [{name:'mock-table-1', subItems: [
            {
                isChecked: true,
                name: 'mock-col1',
                isDisabled: false
            },
            {
                isChecked: false,
                name: 'mock-col2',
                isDisabled: false
            }
        ]}];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        // Since subItems are already available.
        expect(dataManagementService.getDataSourceConnObjFieldList).not.toHaveBeenCalled();
        expect(dialog.show).not.toHaveBeenCalled();
        expect(scope.shuttleModel.selectedItems[0].subItems[0].isChecked).toBe(true);
        expect(scope.shuttleModel.selectedItems[0].subItems[1].isChecked).toBe(false);
    });

    it('persist un-selected columns in selected tables when shuttling left/right', function () {
        // Mocking external calls
        var connObjFieldListSpy = spyOn(dataManagementService, 'getDataSourceConnObjFieldList').
            and.returnValue( $q.when({
                data :{
                    "mock-col-1" : 'VARCHAR',
                    "mock-col-2" : 'VARCHAR'
                }}
        ));
        spyOn(dialog, 'show');
        scope.shuttleModel.selectedItems = [{name:'mock-table-1', subItems: [
            {
                isChecked: true,
                name: 'mock-col1',
                isDisabled: false
            },
            {
                isChecked: false,
                name: 'mock-col2',
                isDisabled: false
            }
        ]}];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        // Since subItems are already available.
        expect(dataManagementService.getDataSourceConnObjFieldList).not.toHaveBeenCalled();
        expect(dialog.show).not.toHaveBeenCalled();
        expect(scope.shuttleModel.selectedItems[0].subItems[0].isChecked).toBe(true);
        expect(scope.shuttleModel.selectedItems[0].subItems[1].isChecked).toBe(false);
    });

    it('optional call to connObjField list when subItems are not present', function () {
        // Mocking external calls
        var connObjFieldListSpy = spyOn(dataManagementService, 'getDataSourceConnObjFieldList').
            and.returnValue( $q.when({
                data :{
                    "mock-col-1" : 'VARCHAR',
                    "mock-col-2" : 'VARCHAR'
                }
            }
        ));
        spyOn(dialog, 'show');
        scope.shuttleModel.selectedItems = [{name:'mock-table-1', subItems: [
            {
                isChecked: true,
                name: 'mock-col1',
                isDisabled: false
            },
            {
                isChecked: false,
                name: 'mock-col2',
                isDisabled: false
            }
        ]}];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        // Since subItems are already available.
        expect(dataManagementService.getDataSourceConnObjFieldList).not.toHaveBeenCalled();
        expect(dialog.show).not.toHaveBeenCalled();

        scope.shuttleModel.selectedItems = [{name:'mock-table-1'}];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        // Since subItems are not available.
        expect(dataManagementService.getDataSourceConnObjFieldList).toHaveBeenCalled();
    });

    it('use enableEmails from dataSource object to set the checkbox state', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
            and.returnValue( $q.when({
                data : mockDsDetails
            }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
            and.returnValue( $q.when({
                data :[
                    "rbmv_table",
                    "mock-table-1",
                    "mock-table-2"
                ]
            }));
        // Call getDataSourceDetails
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        // Since enableEmails is enabled in mockDsDetails, we expect it to be set to true.
        expect(scope.enableEmails).toBe(true);
    });

    it('Selected/unselected columns should be shown for selected tables in edit mode', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
        and.returnValue( $q.when({
            data : mockDsDetails
        }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
        and.returnValue( $q.when({
            data :[
                "rbmv_table",
                "mock-table-1",
                "mock-table-2"
            ]
        }));
        spyOn(scope, 'getObjFieldList').and.returnValue($q.when(
            [{name:"sample_date",dataType:"DATE_TIME",isDisabled:false},
                {name:"id",dataType:"VARCHAR",isDisabled:false}]
        ));
        // Call getDataSourceDetails
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        // verifying that selected items has been captured correctly.
        expect(scope.shuttleModel.selectedItems).not.toBe(void 0);
        expect(scope.shuttleModel.selectedItems.length).toBe(1);
        // TODO(Rahul.B): Add tests for general-item-viewer, which implements the checked Item
        // selection.
    });

    it('Persist selected columns of a table to further wizard steps', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
        and.returnValue( $q.when({
            data : mockDsDetails
        }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
        and.returnValue( $q.when({
            data :[
                "rbmv_table",
                "mock-table-1",
                "mock-table-2"
            ]
        }));
        spyOn(scope, 'getObjFieldList').and.returnValue($q.when(
            [{name:"sample_date",dataType:"DATE_TIME",isDisabled:false},
                {name:"id",dataType:"VARCHAR",isDisabled:false}]
        ));
        // Call getDataSourceDetails
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        scope.getTableColumns('rbmv_table');
        scope.$apply();
        expect(scope.shuttleModel.selectedItems).not.toBe(void 0);
        expect(scope.shuttleModel.selectedItems.length).toBe(1);
        expect(scope.shuttleModel.selectedItems[0].subItems.length).toBe(2);
        scope.shuttleModel.selectedItems[0].subItems.map(
            function(subItem) {
                subItem.isChecked = true;
            }
        );
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        expect(scope.tablesToLoad).not.toBe(void 0);
        expect(scope.tablesToLoad.length).toBe(1);
        expect(scope.tablesToLoad[0].subItems.length).toBe(2);
        scope.tablesToLoad[0].subItems.map(
            function(subItem) {
                expect(subItem.isChecked).toBe(true);
            }
        );
    });

    it('verify params passed to create datasource after adding/deleting table columns', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
        and.returnValue( $q.when({
            data : mockDsDetails
        }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
        and.returnValue( $q.when({
            data :[
                "rbmv_table",
                "mock-table-1",
                "mock-table-2"
            ]
        }));
        spyOn(scope, 'getObjFieldList').and.returnValue($q.when(
            [{name:"sample_date",dataType:"DATE_TIME",isDisabled:false, colType:'NONE'},
                {name:"id",dataType:"VARCHAR",isDisabled:false, colType: 'NONE'}]
        ));
        // Call getDataSourceDetails
        scope.existingDataId = 'mock-ds-id';
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        scope.getTableColumns('rbmv_table');
        scope.$apply();
        expect(scope.shuttleModel.selectedItems).not.toBe(void 0);
        expect(scope.shuttleModel.selectedItems.length).toBe(1);
        expect(scope.shuttleModel.selectedItems[0].subItems.length).toBe(2);
        scope.shuttleModel.selectedItems[0].subItems =
            scope.shuttleModel.selectedItems[0].subItems.map(
                function(subItem) {
                    subItem.isChecked = true;
                    return subItem;
                }
            );
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        userDialogs.showEditSchemaDialog = function(schema, callback) {
        };
        scope.dsMetaData.name = 'mock-ds';
        spyOn(dataManagementService, 'getCreateDdl');
        scope.startImportDataWorkflow();
        scope.$apply();
        var task = dataSourceTask.create(
            {
                sourceObjName: 'rbmv_table',
                targetObjName: 'rbmv_table',
                objFieldMappings :[
                    {
                        sourceFieldname:"sample_date",
                        targetFieldname:"sample_date",
                        expression:"",
                        targetFieldDataType:"DATE_TIME"
                    },
                    {
                        sourceFieldname:"id",
                        targetFieldname:"id",
                        expression:"",
                        targetFieldDataType:"VARCHAR",
                        colType:"ADD_COL"
                    }
                ],
                filterCondition: [],
                truncateTable: false,
                enableEmails: true,
                targetSchemaName: 'mock-ds',
                targetdbName: 'ImportedDatabase'
            }
        );
        task.taskState = 'UPDATE_COLS';

        expect(dataManagementService.getCreateDdl).toHaveBeenCalledWith(
            'IPAAS_INFORMATICA_SQL_SERVER',
            '001E4E0B0000000002ME',
            'mock-ds',
            [task]
        );
    });

    it('Change task params in edit-mode and make sure it reflects in datasource', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
        and.returnValue( $q.when({
            data : mockDsDetails
        }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
        and.returnValue( $q.when({
            data :[
                "rbmv_table",
                "mock-table-1",
                "mock-table-2"
            ]
        }));
        spyOn(scope, 'getObjFieldList').and.returnValue($q.when(
            [{name:"sample_date",dataType:"DATE_TIME",isDisabled:false, colType:'NONE'},
                {name:"id",dataType:"VARCHAR",isDisabled:false, colType: 'NONE'}]
        ));
        spyOn(dialog, 'show');
        scope.shuttleModel.selectedItems = [
            {name:"rbmv_table"}
        ];
        scope.existingDataId = 'mock-ds-id';
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        var spy = jasmine.createSpy('spy');
        userDialogs.showEditSchemaDialog = function(schema, callback) {
            return callback.call(schema);
        };
        scope.dsMetaData.name = 'mock-ds';
        spyOn(dataManagementService, 'getCreateDdl').and.returnValue($q.when({}));
        scope.enableEmails = true;
        scope.shouldTruncate = true;
        scope.startImportDataWorkflow();
        scope.$apply();
        var allTasks = dataManagementService.getCreateDdl.calls.mostRecent().args[3];
        expect(allTasks.length).toEqual(1);
        expect(allTasks[0].enableEmails).toEqual(true);
        expect(allTasks[0].truncateTable).toEqual(true);
    });

    it('verify params passed to create datasource after adding/removing expressions', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
        and.returnValue( $q.when({
            data : mockDsDetails
        }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
        and.returnValue( $q.when({
            data :[
                "rbmv_table",
                "mock-table-1",
                "mock-table-2"
            ]
        }));
        spyOn(scope, 'getObjFieldList').and.returnValue($q.when(
            [{name:"sample_date",dataType:"DATE_TIME",isDisabled:false, colType:'NONE'},
                {name:"id",dataType:"VARCHAR",isDisabled:false, colType: 'NONE'}]
        ));
        // Call getDataSourceDetails
        scope.existingDataId = 'mock-ds-id';
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        scope.getTableColumns('rbmv_table');
        scope.$apply();
        expect(scope.shuttleModel.selectedItems).not.toBe(void 0);
        expect(scope.shuttleModel.selectedItems.length).toBe(1);
        expect(scope.shuttleModel.selectedItems[0].subItems.length).toBe(2);
        scope.shuttleModel.selectedItems[0].subItems =
            scope.shuttleModel.selectedItems[0].subItems.map(
                function(subItem) {
                    subItem.isChecked = true;
                    return subItem;
                }
            );
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        userDialogs.showEditSchemaDialog = function(schema, callback) {
        };
        scope.dsMetaData.name = 'mock-ds';
        spyOn(dataManagementService, 'getCreateDdl');
        scope.transformations = [{
            "name": "hello",
            "expression": "[string]'hello'",
            "table": {
                "name": "rbmv_table"
            }
        }];
        scope.startImportDataWorkflow();
        scope.$apply();
        var task = dataSourceTask.create(
            {
                sourceObjName: 'rbmv_table',
                targetObjName: 'rbmv_table',
                objFieldMappings :[
                    {
                        sourceFieldname:"sample_date",
                        targetFieldname:"sample_date",
                        expression:"",
                        targetFieldDataType:"DATE_TIME"
                    },
                    {
                        sourceFieldname:"hello",
                        targetFieldname:"hello",
                        expression:"[string]'hello'",
                        targetFieldDataType: void 0,
                        colType:"ADD_COL"
                    },
                    {
                        sourceFieldname:"id",
                        targetFieldname:"id",
                        expression:"",
                        targetFieldDataType:"VARCHAR",
                        colType:"ADD_COL"
                    }
                ],
                filterCondition: [],
                truncateTable: false,
                enableEmails: true,
                targetSchemaName: 'mock-ds',
                targetdbName: 'ImportedDatabase'
            }
        );
        task.taskState = 'UPDATE_COLS';
        expect(dataManagementService.getCreateDdl).toHaveBeenCalledWith(
            'IPAAS_INFORMATICA_SQL_SERVER',
            '001E4E0B0000000002ME',
            'mock-ds',
            [task]
        );
    });

    it('Tables not found on available-tables should be fetched using connObj search API', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
        and.returnValue( $q.when({
            data : mockDsDetails
        }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
        and.returnValues( $q.when({
            data :[
                "mock-table-1",
                "mock-table-2"
            ]
        }),
            $q.when({
                data :[
                    "rbmv_table2",
                    "rbmv_table"
                ]
            }));
        scope.existingDataId = 'mock-ds-id';
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        var searchText = dataManagementService.getDataSourceConnectionObjList.calls.mostRecent().args[2];
        expect(searchText).toEqual('rbmv_table');
        var tableAddedAfterSearch = scope.shuttleModel.selectedItems.any(
            function(item) {
                return item.name === 'rbmv_table';
            }
        );
        expect(tableAddedAfterSearch).toEqual(true);
        // Check that rbmv_table2 has not been added.
        expect(scope.shuttleModel.availableItems.length).toEqual(2);
        expect(scope.shuttleModel.selectedItems.length).toEqual(1);
    });

    it('Mark task as deleted when removed from right-shuttle', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
        and.returnValue( $q.when({
            data : mockDsDetails
        }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
        and.returnValue( $q.when({
            data :[
                "mock-table-1",
                "mock-table-2"
            ]
        }));
        spyOn(scope, 'getObjFieldList').and.returnValue($q.when(
            [{name:"sample_date",dataType:"DATE_TIME",isDisabled:false, colType:'NONE'},
                {name:"id",dataType:"VARCHAR",isDisabled:false, colType: 'NONE'}]
        ));
        spyOn(dialog, 'show');
        scope.shuttleModel.selectedItems = [
            {name:'mock-table-1'},
            {name:'mock-table-2'}
        ];
        scope.existingDataId = 'mock-ds-id';
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        scope.shuttleModel.selectedItems = [
            {name:'mock-table-1'},
            {name:'mock-table-2'}
        ];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        var spy = jasmine.createSpy('spy');
        userDialogs.showEditSchemaDialog = function(schema, callback) {
            return callback.call(schema);
        };
        scope.dsMetaData.name = 'mock-ds';
        spyOn(dataManagementService, 'detachTablesFromDataSource');
        spyOn(dataManagementService, 'getCreateDdl').and.returnValue($q.when({
            data : {
                ddlStatements: []
            }
        }));
        scope.startImportDataWorkflow();
        scope.$apply();
        var detachedTables = dataManagementService.detachTablesFromDataSource.calls.mostRecent().args[2];
        expect(detachedTables.length).toEqual(1);
        expect(detachedTables[0]).toEqual('rbmv_table');
    });

    it('should warn when no columns are selected in one or more of selected tables', function () {
        // Mocking external calls
        var connObjFieldListSpy = spyOn(dataManagementService, 'getDataSourceConnObjFieldList').
        and.returnValue(
            $q.when({
                data: {
                    "mock-col-1": 'VARCHAR',
                    "mock-col-2": 'VARCHAR'
                }
            }
        ));
        spyOn(dialog, 'show');
        scope.shuttleModel.selectedItems = [{name: 'mock-table-1'}];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        expect(dataManagementService.getDataSourceConnObjFieldList).toHaveBeenCalled();
        expect(dialog.show).not.toHaveBeenCalled();
        // Table contains unsupported col
        scope.shuttleModel.selectedItems = [{
            name: 'mock-table-1',
            subItems: [{
                name: "sample_date",
                dataType: "DATE_TIME",
                isChecked: false,
                isDisabled: false,
                colType: 'NONE'
            },
            {
                name: "id",
                dataType: "VARCHAR",
                isDisabled: false,
                isChecked: false,
                colType: 'NONE'
            }]
        }];
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        expect(dataManagementService.getDataSourceConnObjFieldList).toHaveBeenCalled();
        expect(dialog.show).toHaveBeenCalled();
    });

    it('selecting a column and then un-selecting should not drop the column', function () {
        // Mocking external calls
        var dsDetails = spyOn(metadataService, 'getMetadataDetails').
        and.returnValue($q.when({
            data : mockDsDetails
        }));
        var connObjListSpy = spyOn(dataManagementService, 'getDataSourceConnectionObjList').
        and.returnValue($q.when({
            data :[
                "rbmv_table",
                "mock-table-1",
                "mock-table-2"
            ]
        }));
        spyOn(scope, 'getObjFieldList').and.returnValue($q.when(
            [
                {
                    name: "sample_date",
                    dataType: "DATE_TIME",
                    isDisabled: false,
                    colType: 'NONE'
                },
                {
                    name: "id",
                    dataType: "VARCHAR",
                    isDisabled: false,
                    colType: 'NONE'
                }
            ]
        ));
        // Call getDataSourceDetails
        scope.existingDataId = 'mock-ds-id';
        scope.userDataWizard.getStep(1).getStartPromise();
        scope.$apply();
        scope.getTableColumns('rbmv_table');
        scope.$apply();
        expect(scope.shuttleModel.selectedItems).not.toBe(void 0);
        expect(scope.shuttleModel.selectedItems.length).toBe(1);
        expect(scope.shuttleModel.selectedItems[0].subItems.length).toBe(2);
        scope.shuttleModel.selectedItems[0].subItems =
            scope.shuttleModel.selectedItems[0].subItems.map(
                function(subItem) {
                    subItem.isChecked = true;
                    return subItem;
                }
            );
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        userDialogs.showEditSchemaDialog = function(schema, callback) {
        };
        scope.dsMetaData.name = 'mock-ds';
        spyOn(dataManagementService, 'getCreateDdl');
        scope.startImportDataWorkflow();
        scope.$apply();
        var task = dataSourceTask.create(
            {
                sourceObjName: 'rbmv_table',
                targetObjName: 'rbmv_table',
                objFieldMappings :[
                    {
                        sourceFieldname:"sample_date",
                        targetFieldname:"sample_date",
                        expression:"",
                        targetFieldDataType:"DATE_TIME"
                    },
                    {
                        sourceFieldname:"id",
                        targetFieldname:"id",
                        expression:"",
                        targetFieldDataType:"VARCHAR",
                        colType:"ADD_COL"
                    }
                ],
                filterCondition: [],
                truncateTable: false,
                enableEmails: true,
                targetSchemaName: 'mock-ds',
                targetdbName: 'ImportedDatabase'
            }
        );
        task.taskState = 'UPDATE_COLS';

        expect(dataManagementService.getCreateDdl).toHaveBeenCalledWith(
            'IPAAS_INFORMATICA_SQL_SERVER',
            '001E4E0B0000000002ME',
            'mock-ds',
            [task]
        );
        //Un-select the column now.
        scope.shuttleModel.selectedItems[0].subItems[1].isChecked = false;
        scope.userDataWizard.getStep(1).getNextStepPromise();
        scope.$apply();
        userDialogs.showEditSchemaDialog = function(schema, callback) {
        };
        scope.dsMetaData.name = 'mock-ds';
        scope.startImportDataWorkflow();
        scope.$apply();
        task = dataSourceTask.create(
            {
                sourceObjName: 'rbmv_table',
                targetObjName: 'rbmv_table',
                objFieldMappings: [
                    {
                        sourceFieldname:"sample_date",
                        targetFieldname:"sample_date",
                        expression:"",
                        targetFieldDataType:"DATE_TIME"
                    }
                ],
                filterCondition: [],
                truncateTable: false,
                enableEmails: true,
                targetSchemaName: 'mock-ds',
                targetdbName: 'ImportedDatabase'
            }
        );
        task.taskState = 'EXISTING';

        expect(dataManagementService.getCreateDdl).toHaveBeenCalledWith(
            'IPAAS_INFORMATICA_SQL_SERVER',
            '001E4E0B0000000002ME',
            'mock-ds',
            [task]
        );
    });
});
