/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Unit tests for table context menu
 */

'use strict';

/* eslint camelcase: 1 */

describe('Table context menu util', function() {
    var basePath = getBasePath(document.currentScript.src);

    var getInputForTableContextMenu, tableUtil, sessionService, strings, originalFlagGetValue,
        VizContextMenuOptionType;

    function getTableModel(missingUnderlyingDataAccess) {
        return {
            isMissingUnderlyingDataAccess: jasmine.createSpy()
                .and.returnValue(missingUnderlyingDataAccess)
        };
    }

    function getVizColumn(isAttribute, isGrowth, isFormula, isDateColumn) {
        return {
            isAttribute: function() {
                return isAttribute;
            },
            convertValueFromBackend: function(x) {
                return x;
            },
            isGrowth: function() {
                return isGrowth;
            },
            isFormula: function() {
                return isFormula;
            },
            isDateColumn: function() {
                return isDateColumn;
            }
        };
    }

    function getSlickGridInputs(selectionRange,
                                missingUnderlyingAccess,
                                isChasmTrapQuery,
                                allFormulaColumn,
                                makeMeasureColumnGrowth) {
        var slickGrid = {
            getData: function() {
                return {
                    getItems: function() {
                        return [
                            {f1: 'Jan 2017', f2: 'red', f3: 123},
                            {f1: 'Feb 2017', f2: 'blue', f3: 456},
                        ];
                    }
                };
            },
            getColumns: function() {
                return [{field: 'f1'}, {field: 'f2'}, {field: 'f3'}];
            }
        };
        var fidToVizColumnMap = {
            f1: getVizColumn(
                /*isAttribute*/true, /*isGrowth*/false,
                /*isFormula*/allFormulaColumn, /*isDateColumn*/true),
            f2: getVizColumn(/*isAttribute*/true, /*isGrowth*/false,
                /*isFormula*/allFormulaColumn, /*isDateColumn*/false),
            f3: getVizColumn(/*isAttribute*/false, /*isGrowth*/makeMeasureColumnGrowth,
                /*isFormula*/allFormulaColumn, /*isDateColumn*/false),
        };

        var fromRowIdx = selectionRange[0], toRowIdx = selectionRange[1],
            fromColIdx = selectionRange[2], toColIdx = selectionRange[3];
        tableUtil.isCellSelected = function(grid, rowIdx, colIdx) {
            return colIdx >= fromColIdx && colIdx <= toColIdx &&
                rowIdx >= fromRowIdx && rowIdx <= toRowIdx;
        };

        tableUtil.isExactlyOneRowSelected = function(grid, rowIndex) {
            return fromColIdx == 0 && toColIdx == 2 && fromRowIdx == toRowIdx;
        };

        tableUtil.isExactlyOneCellSelected = function(grid) {
            return fromRowIdx == toRowIdx && fromColIdx == toColIdx;
        };

        sessionService.isA3Enabled = function() {
            return false;
        };

        return {
            slickGrid: slickGrid,
            fidToVizColumnMap: fidToVizColumnMap,
            tableModel: getTableModel(missingUnderlyingAccess),
            clickedCell: {row: 0},
            isChasmTrapQuery: isChasmTrapQuery
        };
    }

    beforeEach(function(done) {
        module('blink.app');
        originalFlagGetValue = flags.getValue;
        flags.getValue = function() {
            return false;
        };
        Promise.all([
            freshImport(basePath, './table-context-menu-util'),
            freshImport(basePath, './viz-context-menu-util'),
            freshImport(basePath, '../../base/strings'),
        ]).then(function(modules) {
            getInputForTableContextMenu = modules[0].getInputForTableContextMenu;
            VizContextMenuOptionType = modules[1].VizContextMenuOptionType;
            strings = modules[2].strings;
            inject(function($injector) {
                tableUtil = $injector.get('tableUtil');
                sessionService = $injector.get('sessionService');
                done();
            });
        });
    });

    afterEach(function() {
        flags.getValue = originalFlagGetValue;
    });

    function doTestContextMenuItems(inputParams, totalCount, disabledItems, order) {
        var inputs = getSlickGridInputs(...inputParams);
        var contextMenuInput = getInputForTableContextMenu(
            inputs.tableModel,
            inputs.clickedCell,
            inputs.slickGrid,
            inputs.fidToVizColumnMap,
            inputs.isChasmTrapQuery
        );
        var items = contextMenuInput.menuItems;

        var itemsObj = {};
        items.forEach(item => {
            itemsObj[item.id] = item;
        });

        expect(items.length).toBe(totalCount);
        if (!!disabledItems) {
            Object.keys(itemsObj).forEach(itemID => {
                var item = itemsObj[itemID];
                if (item.enabled) {
                    expect(disabledItems[itemID]).toBe(void 0);
                } else {
                    expect(disabledItems[itemID]).toEqual(item.disabledHelp);
                }
            });
        }

        if (!!order) {
            expect(items.map(item => item.id)).toEqual(order);
        }
    }

    it('should show correct set of context menu items', function() {
        var helps = strings.vizContextMenu.disabledHelp;
        var cases = [
            {
                // unerlying data access must be needed for these 4 operations.
                inputParams: [
                    [0, 0, 1, 1],  // selectionRange
                    true,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.requiresUnderlyingAccess, EXCLUDE: helps.requiresUnderlyingAccess,
                    DRILL: helps.drillDownPartialRow, LEAF_LEVEL: helps.underlyingDataPartialRow
                }
            },
            {
                // unerlying data access must be needed for these 4 operations.
                inputParams: [
                    [0, 0, 0, 2],  // selectionRange
                    true,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.multiCellInclude, EXCLUDE: helps.multiCellExclude,
                    DRILL: helps.requiresUnderlyingAccess, LEAF_LEVEL: helps.requiresUnderlyingAccess
                }
            },
            {
                // Drill down and show underlying data must require viewer to select the entire row
                inputParams: [
                    [0, 0, 1, 1],  // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    DRILL: helps.drillDownPartialRow, LEAF_LEVEL: helps.underlyingDataPartialRow
                }
            },
            {
                // include exclude requires viewer to select exactly once cell.
                inputParams: [
                    [0, 0, 0, 2],  // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.multiCellInclude, EXCLUDE: helps.multiCellExclude,
                }
            },
            {
                // Include exclude doesn't work on bucketed date column.
                inputParams: [
                    [0, 0, 0, 0],  // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.dateColumn, EXCLUDE: helps.dateColumn,
                    DRILL: helps.drillDownPartialRow, LEAF_LEVEL: helps.underlyingDataPartialRow
                }
            },
            {
                // include exclude will not work on a measure.
                inputParams: [
                    [0, 0, 2, 2],  // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.multipleFilters, EXCLUDE: helps.multipleFilters,
                    DRILL: helps.drillDownPartialRow, LEAF_LEVEL: helps.underlyingDataPartialRow
                }
            },
            {
                inputParams: [
                    [0, 0, 1, 2],  // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.multiCellInclude, EXCLUDE: helps.multiCellExclude,
                    DRILL: helps.drillDownPartialRow, LEAF_LEVEL: helps.underlyingDataPartialRow
                }
            },
            {
                // Show underlying data must be disabled for chasm trap
                inputParams: [
                    [0, 0, 0, 2],  // selectionRange
                    false,          // missingUnderlyingAccess
                    true,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.multiCellInclude, EXCLUDE: helps.multiCellExclude,
                    LEAF_LEVEL: helps.underlyingDataNotAvailable
                }
            },
            {
                // Show underlying data must be disabled if all column are formula
                inputParams: [
                    [0, 0, 0, 2],  // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    true,         // allFormulaColumn
                    false          // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.multiCellInclude, EXCLUDE: helps.multiCellExclude,
                    LEAF_LEVEL: helps.allFormula
                }
            },
            {
                // Both drill down and show underlying data will be disabled if a measure column
                // is a growth column.
                inputParams: [
                    [0, 0, 0, 2],   // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    true           // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                disabledItems: {
                    INCLUDE: helps.multiCellInclude, EXCLUDE: helps.multiCellExclude,
                    LEAF_LEVEL: helps.growthColumn, DRILL: helps.growthColumn
                }
            },
            {
                // items should be returned in the correct order.
                inputParams: [
                    [0, 0, 0, 2],   // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false           // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                order: [
                    VizContextMenuOptionType.COPY_TO_CLIPBOARD,
                    VizContextMenuOptionType.DRILL,
                    VizContextMenuOptionType.LEAF_LEVEL,
                    VizContextMenuOptionType.EXCLUDE,
                    VizContextMenuOptionType.INCLUDE
                ]
            },
            {
                // items should be returned in the correct order.
                inputParams: [
                    [0, 0, 1, 1],   // selectionRange
                    false,          // missingUnderlyingAccess
                    false,         // isChasmTrapQuery
                    false,         // allFormulaColumn
                    false           // makeMeasureColumnGrowth
                ],
                totalCount: 5,
                order: [
                    VizContextMenuOptionType.COPY_TO_CLIPBOARD,
                    VizContextMenuOptionType.EXCLUDE,
                    VizContextMenuOptionType.INCLUDE,
                    VizContextMenuOptionType.DRILL,
                    VizContextMenuOptionType.LEAF_LEVEL
                ]
            }
        ];

        cases.forEach(function(testCase) {
            doTestContextMenuItems(
                testCase.inputParams,
                testCase.totalCount,
                testCase.disabledItems,
                testCase.order
            );
        });
    });
});
