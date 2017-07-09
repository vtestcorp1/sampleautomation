/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Unit test for table controller
 */

'use strict';

describe('TableController', function() {
    var scope, $qService, _$timeout, dataServiceService, util, _events;

    var originalSlickCtor;
    beforeEach(function() {
        module('blink.app');

        inject(function($rootScope, $controller, $q, $timeout, dataService, tableUtil, events) {
            scope = $rootScope.$new();
            scope.getTooltipType = angular.noop;
            tableUtil.getPaginationInfo = angular.noop;
            tableUtil.getFormattedValue = function(col, val) {
                return val;
            };
            // Mock userService
            dataServiceService = jasmine.createSpyObj('dataService', ['downloadExcelFile']);
            var ctrl = $controller('TableController', {
                $scope: scope,
                dataService: dataServiceService
            });
            $qService = $q;
            _$timeout = $timeout;
            _events = events;
            _events.stopPropagation = angular.noop;
        });

        function MockCellSelectionModel() {
            this.onSelectedRangesChanged = {
                subscribe: angular.noop
            };
        }

        function MockHeaderButtonsPlugin() {
            this.onCommand = {
                subscribe: angular.noop
            };
        }

        // Mock the global variable Slick
        originalSlickCtor = window.Slick;
        window.Slick = jasmine.createSpyObj('slick', ['Grid', 'AutoTooltips']);
        window.Slick.Custom = {HeaderButtons: MockHeaderButtonsPlugin};
        window.Slick.Grid.and.returnValue(getMockSlickGrid());
        angular.extend(window.Slick, {Editors: {Text: ''}, CellSelectionModel: MockCellSelectionModel});
    });

    afterEach(function() {
        delete window.Slick;
        window.Slick = originalSlickCtor;
    });

    /**
     * Data for the table on which sort needs to be performed
     * @returns {Array}
     */
    function formMockGridColumns() {
        var columns = [{
            a: 'blink',
            b: 'callosum',
            c: 'blink1'
        }, {
            a: 'BLInk'
        }, {
            a: 'blink',
            b: 'callosum',
            c: 'blink2'
        }, {
            b: 'sage'
        }, {
            a: null
        }, {
            a: 'blink',
            b: 'callosum',
            c: 'blink3'
        }, {
            a: 'Sage',
            b: 'Blink rocks'
        }];

        return columns;
    }

    /**
     * Columns to perform sort on. It determines the order for multi-column sorting.
     * The 0th index is the primary column and so on.
     */
    function formSortOrder(sortAsc) {
        var sortCol = [{
            sortCol: {field: 'a'},
            sortAsc: !!sortAsc
        }, {
            sortCol: {field: 'b'},
            sortAsc: !!sortAsc
        }];

        return sortCol;
    }

    function getMockVizColumn(name, methodReturnOverrides) {
        var col = jasmine.createSpyObj(name, ['getSageOutputColumnId', 'getName', 'isNumeric', 'getSourceName',
            'getSageOutputColumnId', 'getTooltipInformationModel', 'supportsDateBucketizationChange',
            'supportsAggregationChange', 'isFormula', 'isVisible', 'isGrowth']);
        col.getName.and.returnValue(name);
        col.isVisible.and.returnValue(true);
        col.getTooltipInformationModel.and.returnValue({
            getTemplate: angular.noop
        });

        for (var methodName in methodReturnOverrides) {
            if (methodReturnOverrides.hasOwnProperty(methodName)) {
                col[methodName].and.returnValue(methodReturnOverrides[methodName]);
            }
        }
        return col;
    }

    function getMockSlickGrid() {
        var mock = jasmine.createSpyObj('mockSlickGrid', ['setSelectionModel', 'registerPlugin',
            'setSortColumns', 'invalidate', 'scrollRowToTop', 'resizeCanvas', 'autosizeColumns',
            'updateRowCount', 'render']);

        angular.extend(mock, {
            onSort: {
                sortFunc: null,
                subscribe: function(f) {
                    this.sortFunc = f;
                }
            },
            onViewportChanged: {
                viewportChangeFunc: null,
                subscribe: function(f) {
                    this.viewportChangeFunc = f;
                }
            },
            onHeaderCellRendered: {
                subscribe: angular.noop
            },
            onClick: {
                subscribe: angular.noop
            },
            onColumnsReordered: {
                subscribe: angular.noop
            },
            onColumnsResized: {
                subscribe: angular.noop
            },
            onKeyDown: {
                subscribe: angular.noop
            },
            onContextMenu: {
                subscribe: angular.noop
            },
            onDblClick: {
                subscribe: angular.noop
            },
            onBeforeDestroy: {
                subscribe: angular.noop
            },
            getCanvasNode : angular.noop
        });

        return mock;
    }

    it('should have correct initial state', function() {
        expect(scope.orderedSortedColumns.length).toBe(0);
    });

    it('should create rows of table data with correct fids', function () {
        var mockVizModel = {
            data: [['a', 'b'], ['a0']],
            getData: function() {
                return this.data;
            },
            getVizColumns: function() {
                return [getMockVizColumn('col1'), getMockVizColumn('col2')];
            },
            getColumnOrder: function () {
                return null;
            },

            hasMoreData: function () {
                return false;
            }
        };
        // Mock the scope
        scope.viz = {
            getModel: function () {
                return mockVizModel;
            },
            noData: false
        };
        scope.nbOfCols = 2;
        scope.maxDataLengthForField = [];

        // Call the function to test
        var rows = scope.getSlickGridDataRows();

        // Verify the correctness
        expect(rows.length).toBe(2);
        expect(rows[0].f0).toBe('a');
        expect(rows[0].f1).toBe('b');
        expect(rows[1].f0).toBe('a0');
        expect(rows[1].f1).toBe(undefined);
        expect(scope.maxDataLengthForField.f0).toBe(2);
        // 9 because undefined has a length 9
        expect(scope.maxDataLengthForField.f1).toBe(9);
    });

    it('should create columns with correct fid', function () {
        var col1 = getMockVizColumn('col1'),
            col2 = getMockVizColumn('col2', {isVisible: false}),
            col3 = getMockVizColumn('col3');

        var mockVizModel = {
            vizColumns: [col1, col2, col3],
            getVizColumns: function() {
                return this.vizColumns;
            },
            getColumnOrder: function () {
                return null;
            },
            getUserSpecifiedColumnWidth: function() {
                return null;
            },
            isSortable: function() {
                return true;
            },
            getContainingAnswerModel: function () {
                return {
                    getPermission: function () {
                        return {
                            isMissingUnderlyingAccess: function () {
                                return false;
                            },
                            isChangingFiltersAllowed: function() {
                                return true;
                            }
                        };
                    }
                };
            }
        };
        // Mock the scope
        scope.viz = {
            getModel: function () {
                return mockVizModel;
            }
        };
        scope.layoutTile = {};
        scope.maxDataLengthForField = [];

        // Call the function to test
        var columns = scope.getColumnsForSlickGrid();

        // Should only have two columns in the table, because hidden column should get ignored.
        expect(columns.length).toBe(2);
        expect(columns[0].field).toBe('f0');
        expect(columns[1].field).toBe('f2');
        expect(columns[0].sortable).toBe(true);
        expect(columns[1].sortable).toBe(true);
    });

    it('should disallow table sorting when model is not sortable', function(){
        var col1 = getMockVizColumn('col1'),
            col2 = getMockVizColumn('col2');

        var mockVizModel = {
            vizColumns: [col1, col2],
            getVizColumns: function() {
                return this.vizColumns;
            },
            getColumnOrder: function () {
                return null;
            },
            getUserSpecifiedColumnWidth: function() {
                return null;
            },
            isSortable: function() {
                //false for pinboards
                return false;
            },
            getContainingAnswerModel: function () {
                return {
                    getPermission: function () {
                        return {
                            isMissingUnderlyingAccess: function () {
                                return false;
                            },
                            isChangingFiltersAllowed: function() {
                                return true;
                            }
                        };
                    }
                };
            }
        };

        // Mock the scope
        scope.viz = {
            getModel: function() {
                return mockVizModel;
            }
        };
        scope.layoutTile = {};
        scope.maxDataLengthForField = [];

        // Call the function to test
        var columns = scope.getColumnsForSlickGrid();

        // verify the correctness
        expect(columns.length).toBe(2);
        expect(columns[0].sortable).toBe(false);
        expect(columns[1].sortable).toBe(false);
    });

    it('should set properties of Slick Grid', function () {
        scope.grid = getMockSlickGrid();
        scope.orderedSortedColumns = ['dummy'];
        var mockVizModel = {
            getContainingAnswerModel: function () {
                return {
                    getPermission: function () {
                        return {
                            isMissingUnderlyingAccess: function () {
                                return false;
                            },
                            isChangingFiltersAllowed: function() {
                                return true;
                            }
                        };
                    }
                };
            }
        };
        scope.viz = {
            getModel: function() {
                return mockVizModel;
            }
        };

        // Call the function to be tested
        scope.setSlickGridProperties();

        // verify that the properties were set
        expect(scope.grid.setSelectionModel).toHaveBeenCalled();
        expect(scope.grid.registerPlugin.calls.count()).toBe(1);
        expect(scope.grid.setSortColumns).toHaveBeenCalledWith(scope.orderedSortedColumns);
        expect(scope.grid.onSort.sortFunc).not.toBe(null);
        expect(scope.grid.onViewportChanged.viewportChangeFunc).not.toBe(null);
    });

    it('Should call scope handlers when when relevant events are emitted', function () {
        scope.grid = getMockSlickGrid();
        scope.viz = {};

        scope.updatePaginationInfo = jasmine.createSpy('updatePaginationInfo');

        // Call the function to be tested
        scope.configureScopeHandlers();

        expect(scope.viz.onLayoutReflowDone).not.toBe(undefined);
        scope.viz.onLayoutReflowDone();
        expect(scope.grid.resizeCanvas.calls.count()).toBe(1);
        expect(scope.grid.invalidate.calls.count()).toBe(1);

        scope.viz.onMaximizeStateChanged(true);
        expect(scope.updatePaginationInfo.calls.count()).toBe(1);
        // Called once more
        expect(scope.grid.resizeCanvas.calls.count()).toBe(2);
        expect(scope.grid.autosizeColumns.calls.count()).toBe(0);
        expect(scope.grid.invalidate.calls.count()).toBe(2);
    });

    it('should pass columns for download in user sorted order', function () {
        var mockVizModel = jasmine.createSpyObj('mockVizModel',
            [
                'getColumnOrder',
                'getVizColumns',
                'getJson',
                'getContainingAnswerModel',
                'getReferencingViz',
                'getId'
            ]
        );
        var mockAnswerModel = jasmine.createSpyObj('mockAnswerModel',
            ['getJson', 'getVizById', 'clone']);

        var formatType = 'CSV';
        var vizId = 'vizId';

        mockVizModel.getContainingAnswerModel.and.returnValue(mockAnswerModel);
        mockVizModel.getColumnOrder.and.returnValue(void 0);
        mockVizModel.getReferencingViz.and.returnValue(void 0);
        mockVizModel.getId.and.returnValue(vizId);
        mockAnswerModel.getVizById.and.returnValue(mockVizModel);

        scope.viz = {
            isDownloading: function () {
                return false;
            },
            getModel: function () {
                return mockVizModel;
            },
            _getVizId: function() {
                return vizId;
            }
        };

        scope.showLoadingIndicator = scope.hideLoadingIndicator = _.noop;

        var downloadTableDeferred = $qService.defer();
        dataServiceService.downloadExcelFile.and.returnValue(downloadTableDeferred.promise);
        downloadTableDeferred.resolve();

        expect(dataServiceService.downloadExcelFile.calls.count()).toBe(0);

        scope.downloadTable(formatType);

        expect(dataServiceService.downloadExcelFile.calls.count()).toBe(1);
        expect(dataServiceService.downloadExcelFile).toHaveBeenCalledWith(mockAnswerModel, vizId, formatType);

        mockAnswerModel.clone.and.returnValue(mockAnswerModel);

        var vizColJson1 = {colId: '1'},
            vizColJson2 = {colId: '2'},
            vizCol1 = jasmine.createSpyObj('vizCol', ['getJson', 'getSageOutputColumnId']),
            vizCol2 = jasmine.createSpyObj('vizCol', ['getJson', 'getSageOutputColumnId']),
            vizModelJson = {columns: [vizColJson1, vizColJson2]};

        vizCol1.getSageOutputColumnId.and.returnValue('vizColId1');
        vizCol2.getSageOutputColumnId.and.returnValue('vizColId2');

        vizCol1.getJson.and.returnValue(vizColJson1);
        vizCol2.getJson.and.returnValue(vizColJson2);

        mockVizModel.getJson.and.returnValue(vizModelJson);
        mockVizModel.getVizColumns.and.returnValue([vizCol1, vizCol2]);

        expect(vizModelJson.columns.map('colId')).toEqual(['1', '2']);

        mockVizModel.getColumnOrder.and.returnValue(['vizColId2', 'vizColId1']);

        scope.downloadTable();
        var newVizModelJson = mockAnswerModel.getVizById(vizId).getJson();

        expect(newVizModelJson.columns.map('colId')).toEqual(['2', '1']);
    });

    it('Should split the table into smaller tables correctly for print view', function () {
        var columns = [{width: 100}];
        var colGroups = scope.splitColumnsForPrintView(columns);
        expect(colGroups.length).toBe(1);

        columns = [
            {width: 300},
            {width: 600},
            {width: 500},
            {width: 100},
            {width: 700}
        ];
        colGroups = scope.splitColumnsForPrintView(columns);
        expect(colGroups.length).toBe(3);
        expect(colGroups[0].length).toBe(2);
        expect(colGroups[1].length).toBe(2);
        expect(colGroups[2].length).toBe(1);

        var rows = [];
        for(var i = 0; i < 50; i++) {
            rows.push({});
        }

        var rowGroups = scope.splitRowsForPrintView(rows, 19);
        expect(rowGroups.length).toBe(2);
        expect(rowGroups[0].length).toBe(36);
        expect(rowGroups[1].length).toBe(14);
    });
});
