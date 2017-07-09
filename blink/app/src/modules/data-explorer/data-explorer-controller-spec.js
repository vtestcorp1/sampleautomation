/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit test for Data Explorer module's controller
 *
 */

'use strict';
/* global addCustomMatchers*/

describe('DataExplorerController', function () {
    var _controller,
        _$scope,
        _$q,
        mockAPIService,
        mockAlertService,
        DATA_EXPLORER_MAX_ROWS = 1000;

    beforeEach(module('blink.app'));
    beforeEach(addCustomMatchers());

    var listsDeferred, cancelablePromise, jsonConstants, blinkConstants;

    beforeEach(inject(function ($q, $rootScope, $controller, $injector) {
        _$q = $q;
        cancelablePromise = $injector.get('CancelablePromise');
        jsonConstants = $injector.get('jsonConstants');
        blinkConstants = $injector.get('blinkConstants');

        var worksheetModelDeferred = _$q.defer();
        var permissionsDeferred = _$q.defer();
        var dependencyDeferred = _$q.defer();
        listsDeferred = _$q.defer();

        mockAPIService = {
            listsDeferred: listsDeferred,
            getMetadata: jasmine.createSpy().and.returnValue(_$q.defer()),
            worksheetModelDeferred: worksheetModelDeferred,
            dependencyDeferred: dependencyDeferred,
            getColumnDependents: jasmine.createSpy().and.returnValue(dependencyDeferred.promise),
            getLogicalTableModel: jasmine.createSpy().and.returnValue(worksheetModelDeferred.promise),
            getLogicalTableModelWithData: jasmine.createSpy().and.returnValue(worksheetModelDeferred.promise),
            updateLogicalTableData: jasmine.createSpy().and.returnValue(_$q.defer())
        };

        mockAlertService = {
            showUserActionFailureAlert: jasmine.createSpy(),
            showUserActionSuccessAlert: jasmine.createSpy(),
            showAlert: jasmine.createSpy()
        };

        _$scope = $rootScope.$new();
        _$scope.data = [{
            values: {
                id: 'tableid'
            }
        }];
        _controller = $controller('DataExplorerController', {
            $scope: _$scope,
            worksheetUtil: mockAPIService,
            util: $injector.get('util'),
            CancelablePromise: cancelablePromise,
            alertService: mockAlertService,
            dependencyService: mockAPIService,
            metadataPermissionService: {
                permissionsDeferred: permissionsDeferred,
                getEffectivePermissions: jasmine.createSpy().and
                    .returnValue(permissionsDeferred.promise),
                isEditable: jasmine.createSpy().and.returnValue(true),
                isEditableWithUnderlyingAccess: jasmine.createSpy().and.returnValue(true)
            }
        });
        permissionsDeferred.resolve({data: {}});
        _$scope.$digest();
    }));

    it('should test init state of the controller', function () {
        _$scope.init();
        _$scope.$apply();
        expect(_$scope.tableModel).toBeNull();
        // Since no tables are selected on init. isLoading is False.
        expect(_$scope.isLoading()).toBeFalsy();
    });

    it('should test onTableNameClick', function () {
        _$scope.init();
        _$scope.$apply();
        var tableId = 'imported_table_1';
        _$scope.onTableNameClick(tableId);
        _$scope.$apply();
        expect(_$scope.selectedTableId).toBe('imported_table_1');

        tableId = 'worksheet1';
        _$scope.onTableNameClick(tableId);
        _$scope.$apply();
        expect(_$scope.selectedTableId).toBe('worksheet1');

        var mockTableModel = {
            data: {
                getId: function () {
                    return tableId;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return true;
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.WORKSHEET;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };

        tableId = 'table2';
        _$scope.isInDataMode = jasmine.createSpy().and.returnValue(true);
        _$scope.onTableNameClick(tableId);
        mockAPIService.worksheetModelDeferred.resolve(mockTableModel);
        _$scope.$apply();
        expect(_$scope.selectedTableId).toBe('table2');
        expect(_$scope.tableModel).toBe('mockTableModel2');

        expect(mockAPIService.getLogicalTableModel.calls.count()).toBe(3);
    });

    it('should set editable state on selected Table changed', function () {
        _$scope.init();
        _$scope.$apply();
        var tableId = 'imported_table_1';
        var tableId2 = 'imported_table_2';
        _$scope.isInDataMode = jasmine.createSpy().and.returnValue(false);
        _$scope.selectedTableId = tableId;
        var mockModel = {
            data: {
                getId: function () {
                    return tableId;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return true;
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.IMPORTED_DATA;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockModel);
        _$scope.$apply();
        expect(_$scope.isEditable).toBeTruthy();

        _$scope.isInDataMode = jasmine.createSpy().and.returnValue(true);
        _$scope.selectedTableId = tableId2;
        mockAPIService.worksheetModelDeferred.resolve(mockModel);
        _$scope.$apply();
        expect(_$scope.isEditable).toBeFalsy();
    });

    it('should clear the table model when fetching an empty or invalid table', function () {
        _$scope.init();
        _$scope.tableModel = { a: 1, b: 2, c: 3 };
        _$scope.addTableUI = angular.noop;
        var tableId = 'worksheet1';
        _$scope.isInDataMode = jasmine.createSpy().and.returnValue(true);
        _$scope.onTableNameClick(tableId);
        mockAPIService.worksheetModelDeferred.reject({});
        _$scope.$apply();
        expect(_$scope.tableModel).toBe(null);
    });

    it('SetViewMode should set edit state and refresh slickgrid for data/columns mode', function () {
        _$scope.init();
        var tableId = '123';
        _$scope.selectedTableId = tableId;

        var mockTableModel = {
            data: {
                getId: function () {
                    return tableId;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return true;
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.SYSTEM_TABLE;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockTableModel);
        _$scope.$apply();
        _$scope.addTableUI = jasmine.createSpy();
        _$scope.setViewMode('PROP_VIEW');
        expect(_$scope.isEditable).toBeTruthy();
        expect(_$scope.addTableUI).toHaveBeenCalled();

        _$scope.setViewMode('DATA_VIEW');
        expect(_$scope.isEditable).toBeFalsy();
        expect(_$scope.addTableUI).toHaveBeenCalled();
    });

    it('SetViewMode should set edit state for relationship mode and remove Table UI', function () {
        _$scope.init();
        var tableId = '123';
        _$scope.selectedTableId = tableId;

        _$scope.removeTableUI = jasmine.createSpy();
        expect(_$scope.isEditable).toBeFalsy();

        _$scope.setViewMode('RELATIONSHIP_VIEW');

        var mockWorksheetModel = {
            data: {
                getId: function () {
                    return tableId;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return true;
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.SYSTEM_TABLE;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockWorksheetModel);
        _$scope.$apply();

        expect(_$scope.isEditable).toBeTruthy();
        expect(_$scope.removeTableUI).toHaveBeenCalled();
    });

    it('should call onNavigateAway(if defined) when edit clicked', function () {
        _$scope.init();
        _$scope.$apply();
        var tableId = '1234';
        _$scope.selectedTableId = tableId;
        _$scope.onNavigateAway = jasmine.createSpy();
        var mockWorksheetModel = {
            data: {
                getId: function () {
                    return tableId;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return true;
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.SYSTEM_TABLE;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockWorksheetModel);
        _$scope.$apply();
        _$scope.onEditClick();
        _$scope.$apply();
        expect(_$scope.onNavigateAway).toHaveBeenCalled();
    });

    it('should update view for the latest selected table, even if a previous call returns later', function () {
        _$scope.init();
        var table1Id ='imported_table_1';
        var table2Id = 'imported_table_2';
        _$scope.isInDataMode = jasmine.createSpy().and.returnValue(true);
        _$scope.selectedTableId = table1Id;
        _$scope.$apply();
        _$scope.selectedTableId = table2Id;
        _$scope.$apply();
        var mockModel1 = {
            data: {
                getId: function () {
                    return table1Id;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel1'
                    };
                },
                getData: function() {
                    return true;
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.IMPORTED_DATA;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        var mockModel2 = {
            data: {
                getId: function () {
                    return table2Id;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return true;
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.IMPORTED_DATA;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockModel2);
        _$scope.$apply();
        expect(_$scope.tableModel).toBe('mockTableModel2');
        mockAPIService.worksheetModelDeferred.resolve(mockModel1);
        _$scope.$apply();
        expect(_$scope.tableModel).toBe('mockTableModel2');
    });

    it('Data call should get the hidden columns as well', function () {
        _$scope.init();
        var table1Id = 'imported_table_1';
        _$scope.selectedTableId = table1Id;
        _$scope.addTableUI = jasmine.createSpy();
        _$scope.isInDataMode = jasmine.createSpy().and.returnValue(true);
        var mockWorksheetModel = {
            data: {
                getId: function () {
                    return table1Id;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return [];
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.IMPORTED_DATA;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockWorksheetModel);
        _$scope.$apply();
        expect(mockAPIService.updateLogicalTableData).toHaveBeenCalledWith(mockWorksheetModel.data, {
            showHidden: true
        });
    });

    it('should listen to changes in viewMode if mode provided in the begining', function () {
        _$scope.mode = 'PROP_VIEW';
        var table1Id = 'imported_table_1';
        _$scope.selectedTableId = table1Id;
        _$scope.init();
        _$scope.addTableUI = jasmine.createSpy();
        var mockWorksheetModel = {
            data: {
                getId: function () {
                    return table1Id;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return [];
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.IMPORTED_DATA;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockWorksheetModel);
        _$scope.$apply();
        _$scope.mode = 'SECURITY_VIEW';
        _$scope.$apply();
        expect(_$scope.isInSecurityMode()).toBeTruthy();
    });

    it('should call failure alert if the selected object is corrupted.', function () {
        _$scope.mode = 'PROP_VIEW';
        var table1Id = 'imported_table_1';
        _$scope.selectedTableId = table1Id;
        _$scope.init();
        _$scope.addTableUI = jasmine.createSpy();
        var mockWorksheetModel = {
            data: {
                getId: function () {
                    return table1Id;
                },
                getName: function () {
                    return 'mocka';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return [];
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.IMPORTED_DATA;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(true),
                getCorruptionDetails: jasmine.createSpy().and.returnValue([{
                    code: 10005
                }])
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockWorksheetModel);
        _$scope.$apply();
        expect(mockAlertService.showUserActionFailureAlert).toHaveBeenCalled();
    });

    it('Should update dependencies correctly with type names', function () {
        _$scope.init();
        var table1Id = 'imported_table_1';
        _$scope.selectedTableId = table1Id;
        _$scope.addTableUI = jasmine.createSpy();
        _$scope.isInDependentsMode = jasmine.createSpy().and.returnValue(true);
        var mockWorksheetModel = {
            data: {
                getId: function () {
                    return table1Id;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return [];
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getColumns: function () {
                    return [{
                        getGuid: jasmine.createSpy().and.returnValue('colid1'),
                        getName: jasmine.createSpy().and.returnValue('colName1')
                    }];
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.IMPORTED_DATA;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false),
                setDependents: jasmine.createSpy()
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockWorksheetModel);

        var mockDependentsModel = {
            data: {
                LOGICAL_TABLE: [{
                    id: 'id',
                    dependency: 'colid1',
                    type: 'ONE_TO_ONE_LOGICAL'
                }, {
                    id: 'id2',
                    dependency: 'colid1',
                    type: 'PRIVATE_WORKSHEET'
                },{
                    id: 'id3',
                    dependency: 'colid1',
                    type: 'ONE_TO_ONE_LOGICAL',
                    isDeleted: true
                }]
            }
        };
        mockAPIService.dependencyDeferred.resolve(mockDependentsModel);
        _$scope.$apply();
        expect(mockWorksheetModel.data.setDependents).toHaveBeenCalledWith([
            {
                id: 'id',
                dependency: 'colid1',
                type: 'LOGICAL_TABLE',
                subtype: 'ONE_TO_ONE_LOGICAL',
                typeName: 'Table',
                dependencyName: 'colName1'
            }
        ]);
    });

    it('SetViewMode when in analyze mode sets editTable to false and removes Table UI', function () {
        _$scope.init();
        var tableId = '123';
        _$scope.selectedTableId = tableId;

        _$scope.removeTableUI = jasmine.createSpy();
        expect(_$scope.isEditable).toBeFalsy();
        _$scope.setViewMode(blinkConstants.DataExplorerViewModes.ANALYZE_VIEW);
        _$scope.$apply();
        expect(_$scope.isEditable).toBeFalsy();
        expect(_$scope.removeTableUI).toHaveBeenCalled();
    });

    it('Should fetch analyze remarks when mode is switched to analyze mode.', function () {
        _$scope.init();
        var tableId = '123';
        _$scope.selectedTableId = tableId;
        var mockTableModel = {
            data: {
                getId: function () {
                    return tableId;
                },
                getName : function () {
                    return 'mockTableName';
                },
                toSlickgridTable: function () {
                    return {
                        model: 'mockTableModel2'
                    };
                },
                getData: function() {
                    return true;
                },
                getMetadataType: function () {
                    return jsonConstants.metadataType.LOGICAL_TABLE;
                },
                getMetadataSubType: function () {
                    return jsonConstants.metadataType.subType.SYSTEM_TABLE;
                },
                isCorrupted: jasmine.createSpy().and.returnValue(false)
            }
        };
        mockAPIService.worksheetModelDeferred.resolve(mockTableModel);
        _$scope.addTableUI = jasmine.createSpy();

        // We are in Prop view
        _$scope.setViewMode(blinkConstants.DataExplorerViewModes.PROP_VIEW);
        _$scope.removeTableUI = jasmine.createSpy();

        _$scope.$apply();
        expect(_$scope.isEditable).toBeTruthy();
        expect(_$scope.addTableUI).toHaveBeenCalled();
        expect(_$scope.analyzeCtrl).toBeDefined();
        expect(_$scope.analyzeCtrl.id).toBe('123');
        expect(_$scope.analyzeCtrl.fetchCount).toBe(1);

        // Now switch to analyze view.
        _$scope.setViewMode(blinkConstants.DataExplorerViewModes.ANALYZE_VIEW);
        expect(_$scope.isEditable).toBeFalsy();
        expect(_$scope.removeTableUI).toHaveBeenCalled();
        expect(_$scope.analyzeCtrl).toBeDefined();
        expect(_$scope.analyzeCtrl.id).toBe('123');
        // on just change of view fetchRemarks should not be called again.
        expect(_$scope.analyzeCtrl.fetchCount).toBe(1);
    });
});

