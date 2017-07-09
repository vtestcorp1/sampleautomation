/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Service that returns the current schema
 *
 *
 */

'use strict';

/* eslint camelcase: 1 */

describe('schema-service', function () {

    var schema;
    var numTables = 37;
    var allSchema = 31;
    var columns;
    var ctrl;
    var numSystemTables = 21;
    var numWks = 14;
    var numImportedDatas = 2;
    var cleanedResponse;
    var service;
    var scope;
    var metadataService = {};

    beforeEach(function (done) {
        module('blink.app');

        module(function ($provide) {
            $provide.value('metadataService', metadataService);
        });

        inject(function (_$rootScope_, schemaService, $q, _WorksheetViewerController_, WorksheetModel, graphFactoryService) {
            service = schemaService;
            scope = _$rootScope_;
            metadataService.getSchema = function () {
                var response = blink.app.fakeData['/callosum/v1/metadata/getSchema'];
                cleanedResponse = response.map(function(d) {
                    return JSON.parse(d);
                }).filter(function(table) {
                    // Note(chab)  Private worksheet and aggregated worksheet are excluded for now
                    return table.type === 'ONE_TO_ONE_LOGICAL' || table.type === 'USER_DEFINED'  || table.type === 'WORKSHEET' ;
                });
                return $q.when(cleanedResponse);
            };
            schemaService.getSchema(31).then(function(_schema){
                schema = _schema;

                var wksData = blink.app.fakeData['/callosum/v1/metadata/detail'];
                var wksJSON = JSON.parse(wksData);
                var wks = new WorksheetModel({
                    tableMetadata: wksJSON
                });
                columns = wks.getColumns();
                ctrl = new _WorksheetViewerController_('a', {}, {});
                graphFactoryService.buildGraphForWorksheet(schema, wks);

                spyOn(ctrl.graphViewerController, "selectColumnInTable").and.returnValue(null);
                done();
            });
            scope.$digest();
        });
    });

    //TODO(chab) try to find when extracted to a single file
    it('should highlight correct columns', function(){
        // Lineorder Partkey is the 6th in the UI
        var expectTarget = {
            tableId: '2445fe81-30d6-46fa-9f42-f6b1b4e01623',
            columnIdx: 6
        };
        var expectedColor = '#FFCCCC';
        ctrl.graphViewerController.highlightWorksheetColumn(
            columns[0],
            '#FFCCCC'
        );
        expect(ctrl.graphViewerController.selectColumnInTable.calls.argsFor(1)).toEqual(
            [[expectTarget], expectedColor] // highlighting column
        );
    });

    it("should return the correct number of tables", function(){
        expect(schema.tables.length).toBe(numTables);
    });

    it("should fiter correctly on system table", function(done){
        service.getSchema(1).then(function(_schema){
            schema = _schema;
            expect(schema.tables.length).toBe(numSystemTables);
            done();
        });
        scope.$digest();
    });

    it("should filter correctly on imported data", function(done){
        service.getSchema(2).then(function(_schema){
            schema = _schema;
            expect(schema.tables.length).toBe(numImportedDatas);
            done();
        });
        scope.$digest();
    });

    it("should filter correctly on worksheet", function(done){
        service.getSchema(4).then(function(_schema){
            schema = _schema;
            expect(schema.tables.length).toBe(numWks);
            done();
        });
        scope.$digest();
    });

    it("should filter correctly on worksheet", function(done){
        service.getSchema(1 + 2 + 4).then(function(_schema){
            schema = _schema;
            expect(schema.tables.length).toBe(21 + 2 + 14);
            done();
        });
        scope.$digest();
    });



    it("should return correct informations about a table", function() {
        cleanedResponse.forEach(function(jsonTable){
            var table = schema.resolver.findTableById(jsonTable.header.id_guid);
            expect(table.getId()).toBe(jsonTable.header.id_guid);
            expect(table.getName()).toBe(jsonTable.header.name);
        });
    });

    it("should return the correct number of columns for every tables", function(){
        cleanedResponse.forEach(function(jsonTable){
            var table = schema.resolver.findTableById(jsonTable.header.id_guid);
            var columnLengths = (!jsonTable.column ? 0 : jsonTable.column.length);
            expect(table.getColumns().length).toEqual(columnLengths);
        });
    });

    it("should return correct informations about a column", function() {
        var columns = schema.tables[3].getColumns();
        var json = cleanedResponse[3].column;

        for (var i = 0; i < columns.length; i++) {
            expect(columns[i].getId()).toEqual(json[i].header.id_guid);
            expect(columns[i].getSourceTableId()).toEqual(schema.tables[3].getId());
            expect(columns[i].getSourceTable()).toEqual(schema.tables[3]);
        }
    });

    // TODO(chab) Use the same test with a very simple schema
    it("should return the correct source and target table for a GENERIC join between two tables", function(){

        var partTable = schema.tables[26];
        var genericJoin = partTable.getRelationShips()[0];

        expect(genericJoin.getName()).toEqual('PART - Part Details');

        var sourceCols = genericJoin.getRelationShips().getSourceColumns();
        var destinationCols = genericJoin.getRelationShips().getDestinationColumns();

        expect(sourceCols.length).toBe(1);
        expect(destinationCols.length).toBe(1);

        expect(sourceCols[0].getName()).toBe('Category');
        expect(destinationCols[0].getName()).toBe('category');
    });

    it("should return the correct source and target columns for a PK_FK join between two tables", function(){
        var lineOrderTable = schema.tables[8];
        var pkFk = lineOrderTable.getRelationShips()[0];

        expect(lineOrderTable.getRelationShips().length).toBe(5);
        expect(pkFk.getName()).toEqual('Commit Date');

        var sourceCols = pkFk.getRelationShips().getSourceColumns();
        var destinationCols = pkFk.getRelationShips().getDestinationColumns();

        expect(sourceCols.length).toBe(1);
        expect(destinationCols.length).toBe(1);

        expect(sourceCols[0].getName()).toBe('Commit Date');
        expect(destinationCols[0].getName()).toBe('Datekey');
    });

    it("should put columns in correct order", function() {
        var lineOrderTableSortedColumns = schema.tables[8].getSortedColumnsForSchema();

        function testColumn(start, end, predicate) {
            for (var i = start; i <= end; i++) {
                expect(lineOrderTableSortedColumns[i][predicate]()).toBe(true);
                if (i < end) {
                    expect(lineOrderTableSortedColumns[i].getName() < lineOrderTableSortedColumns[i + 1].getName()).toBe(true);
                }
            }
        }


        testColumn(0, 1, 'isPrimaryKey');
        //testColumn(2, 6, 'isForeignKey'); Callossum fake metadata are wrong
        testColumn(7, 15, 'isNorPkNorFk');
    });

    /*
    xit("should return the correct source and target columns for a USER_DEFINED join between two tables", function() {

    });
    */
});
