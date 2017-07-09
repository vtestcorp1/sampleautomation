/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Spec for Logical Table Model and Logical Column
 */

'use strict';

describe('logical table model', function () {
    var jsonConstants,
        DataExplrViewModes,
        blinkStrings,
        LogicalTableModel,
        json,
        model;

    beforeEach(function() {
        module('blink.app');
        /* eslint camelcase: 1 */
        inject(function (_jsonConstants_, _blinkConstants_, _strings_, _LogicalTableModel_) {
            jsonConstants = _jsonConstants_;
            blinkStrings = _strings_;
            DataExplrViewModes = _blinkConstants_;
            LogicalTableModel = _LogicalTableModel_;

            json = angular.copy(blink.app.fakeData['/callosum/v1/logical-table-model']);
            model = new LogicalTableModel(json);
        });
    });

    it('init test - should be a valid json constants object', function () {
        expect(jsonConstants).toEqual(jasmine.any(Object));
        expect(jsonConstants.LOGICAL_TABLE_METADATA_KEY).toBe('tableMetadata');
        expect(jsonConstants.LOGICAL_TABLE_DATA_KEY).toBe('tableData');
    });

    it('should return a constructor for logical table model', function() {
        expect(LogicalTableModel).toEqual(jasmine.any(Function));
    });

    it('should return a valid table model', function() {
        expect(model.getId()).toBe("2445fe81-30d6-46fa-9f42-f6b1b4e01623");
        expect(model.getAuthorId()).toBe("0f0dd0f7-7411-4195-a4aa-0dc6b58413c9");
        expect(model.getName()).toBe("LINEORDER");
        expect(model.hasNoData()).toBeFalsy();
        expect(model.getColumns().length).toBe(18);
        expect(model.getData().length).toBe(2);
    });

    it('should set and update name', function () {
        var newName = 'TEST';

        expect(model.getName()).toBe("LINEORDER");
        // Set it to empty  name - should be a noop
        model.setName('');
        expect(model.getName()).toBe("LINEORDER");

        // Set it to valid name
        model.setName(newName);
        expect(model.getName()).toBe(newName);
    });

    it('should give invalid column name for columns with same name', function () {
        var columns = model.getColumns();

        expect(columns.length).toBe(18);
        // 2nd and 3rd column have the same name
        expect(columns[1].getName()).toBe('Same');
        expect(columns[2].getName()).toBe('Same');
        expect(model.isInvalidColumnName(0)).toBeFalsy();
        expect(model.isInvalidColumnName(1)).toBeTruthy();
        expect(model.isInvalidColumnName(2)).toBeTruthy();
    });

    it('should convert logical table model to valid slickgrid model and config', function () {
        var params = model.toSlickgridTable({viewMode: DataExplrViewModes.DataExplorerViewModes.DATA_VIEW});

        // check config
        expect(params.config).toBeDefined();
        expect(params.config.editableColumnHeaders).toBeTruthy();

        // check model
        var tableModel = params.model;
        expect(tableModel).toBeDefined();

        // check tableModel - columns
        expect(tableModel.columns.length).toBe(18);
        expect(tableModel.columns[0].field).toBe('f0');
        expect(tableModel.columns[0].name).toBe('Test Measure LogicalColumn 0');

        // check that update name callback is correct
        tableModel.columns[0].onUpdate(tableModel.columns[0], 'newName');
        expect(model.getColumns()[0].getName()).toBe('newName');

        // check tableModel - data
        expect(tableModel.data.length).toBe(2);
        expect(tableModel.data[0].f0).toBe(796636800);
        expect(tableModel.data[0].f16).toBe(2);
    });
});

describe('logical table column', function () {
    // Logical Table Model has logical columns. We are testing logical column via constructing a
    // Table using fake data
    var jsonConstants,
        derivedColExprTyp,
        blinkStrings,
        LogicalTableModel,
        derivedCol,
        generalCol,
        geoCol,
        json,
        model;

    beforeEach(function() {
        module('blink.app');

        inject(function ($injector) {
            jsonConstants = $injector.get('jsonConstants');
            derivedColExprTyp = $injector.get('blinkConstants');
            blinkStrings = $injector.get('strings');
            LogicalTableModel = $injector.get('LogicalTableModel');
        });

        json = angular.copy(blink.app.fakeData['/callosum/v1/logical-table-model']);
        model = new LogicalTableModel(json);
        // The first one is the derived column
        derivedCol = model.getColumns()[0];
        // The second one is a general column
        generalCol = model.getColumns()[1];
        geoCol = model.getColumns()[17];
    });

    it('should return a constructor for logical column', function() {
        expect(LogicalTableModel.LogicalColumn).toEqual(jasmine.any(Function));
    });

    it('should return a valid logical column', function() {
        expect(generalCol.getDataRowIndex()).toBe(1);
        expect(generalCol.isAttribute()).toBeTruthy();
        expect(generalCol.isMeasure()).toBeFalsy();
        expect(generalCol.getName()).toBe('Same');
        expect(generalCol.getOwnerName()).toBe('LINEORDER');
        expect(generalCol.getType()).toBe('ATTRIBUTE');
        expect(generalCol.getDataType()).toBe('INT64');
        // It should match itself
        expect(generalCol.matches(generalCol)).toBeTruthy();
    });

    it('should set and update name', function () {
        var newName = 'TEST';

        expect(generalCol.getName()).toBe("Same");
        // Set it to empty  name - should be a noop
        generalCol.setName('');
        expect(generalCol.getName()).toBe("Same");

        // Set it to valid name
        generalCol.setName(newName);
        expect(generalCol.getName()).toBe(newName);
    });

    it('should get logical key', function () {
        var colJson = angular.copy(generalCol.getJson());
        colJson.isDerived = false;
        expect((LogicalTableModel.createLogicalColumn(colJson)).getLogicalKey()).toBe(colJson.header.id);

        colJson.isDerived = true;
        colJson.derivationExpr = null;
        expect((LogicalTableModel.createLogicalColumn(colJson)).getLogicalKey()).toBe(colJson.header.id);

        // Expression with no child (error case)
        colJson.derivationExpr = {
            exprType: derivedColExprTyp.derivedColumnExprTypes.DERIVATION_TYPE_EXPRESSION
        };

        expect((LogicalTableModel.createLogicalColumn(colJson)).getLogicalKey()).toBe(colJson.header.id);

        var baseColJson = angular.copy(generalCol.getJson());
        baseColJson.header.id = 'baseColId';

        // Identity expression with empty join path.
        colJson.derivationExpr = {
            exprType: derivedColExprTyp.derivedColumnExprTypes.DERIVATION_TYPE_LCR,
            logicalColumn: baseColJson,
            joinPaths: []
        };

        expect((LogicalTableModel.createLogicalColumn(colJson)).getLogicalKey()).toBe(baseColJson.header.id);

        // Identity expression with non-empty join path.
        colJson.derivationExpr = {
            exprType: derivedColExprTyp.derivedColumnExprTypes.DERIVATION_TYPE_LCR,
            logicalColumn: baseColJson,
            joinPaths: [{
                joins: [{
                    header: {
                        id: 'joinName'
                    }
                }]
            }]
        };

        expect((LogicalTableModel.createLogicalColumn(colJson)).getLogicalKey()).toBe(baseColJson.header.id + '.joinName');

        // True expression with non-empty join path.
        colJson.derivationExpr = {
            exprType: derivedColExprTyp.derivedColumnExprTypes.DERIVATION_TYPE_EXPRESSION,
            children: [{
                exprType: derivedColExprTyp.derivedColumnExprTypes.DERIVATION_TYPE_LCR,
                logicalColumn: baseColJson,
                joinPaths: [
                    {
                        joins: [{
                            header: {
                                id: 'joinName1'
                            }
                        }, {
                            header: {
                                id: 'joinName2'
                            }
                        }]
                    }
                ]
            }]
        };

        expect((LogicalTableModel.createLogicalColumn(colJson)).getLogicalKey()).toBe(baseColJson.header.id + '.joinName1,joinName2');
    });

    it('should format geo columns literally', function(){
        expect(geoCol.getDataFormatter()(94086)).toBe('94086');
    });
});
