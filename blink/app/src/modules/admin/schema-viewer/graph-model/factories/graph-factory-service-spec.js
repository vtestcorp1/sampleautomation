/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for graph factory
 *
 *
 */

'use strict';

/* eslint camelcase: 1 */

describe('schema-service', function () {

    var schema;
    var service;
    var scope;
    var metadataService = {};
    var factory;
    var valueToReturn;
    var schemaService;
    var basePath = getBasePath(document.currentScript.src);

    // test tables with one valid relationship
    // test table with relationship with no matching columns
    var simpleSchema = '[{\"header\": {\"id_guid\": \"f\",\"name\": \"TEST3\",\"author_guid\":' +
        ' \"f\",\"created\": 1,\"modified\": 1,\"generation_num\": 1,\"deleted\": false,\"hidden\": ' +
        'false,\"database_stripe\": \"TP\",\"schema_stripe\": \"f\"},' +
        '\"content\": {' +
        '\"relationship\": [ {' +
        '\"source_table_guid\" : \"f\",  \"destination_table_guid\" :  \"g\", ' +
        '\"relationship\" :[ {\"source_column_guid\": \"f9\",\"destination_column_guid\": \"fa0\"}], ' +
        ' \"join_type\": \"INNER\"}],\"physical_table_name\": \"TEST3\",\"worksheet_type\":' +
        ' \"VIEW\",\"aggregated_worksheet\": false},\"physical_table_guid\": \"b\",\"physical_table_version\"' +
        ': 0,\"type\": \"ONE_TO_ONE_LOGICAL\"}]';

    // test table with relationship with no matching tables
    var tableWithRelationships = "[{\"header\": {\"id_guid\": \"bcff5daf-38c5-46c1-b22b-2b5f51ba239b\"," +
        "\"name\": \"TEST1\",\"author_guid\": \"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9\",\"author_name\": " +
        "\"su\",\"author_display_name\": \"A\",\"created\": 9,\"modified\": 49,\"generation_num\": 1,\"own" +
        "er_guid\": \"b\",\"deleted\": false,\"hidden\": false,\"database_stripe\": \"TPCH5K\",\"schema" +
        "_stripe\": \"falcon\"},\"content\":" +
        " {\"join_type\": \"INNER\",\"physical_table_name\":" +
        " \"TEST1\",\"worksheet_type\": \"VIEW\",\"aggregated_worksheet\": false}," +
        "\"column\": [{\"header\": {\"id_guid\": \"73e76952-b6c7-4316-b5df-33b4ee77e85f\",\"" +
        "name\": \"T1_ID\",\"author_guid\": \"0\",\"created\": 1,\"modified\": 1,\"modified_by\": \"0\"," +
        "\"generation_num\": 0,\"owner_guid\": \"bc\",\"deleted\": false,\"hidden\": true,\"database_stripe\": \"TPCH5K\"" +
        ",\"schema_stripe\": \"falcon_default_schema\"},\"content\": {\"data_type\": \"INT64\",\"type\": \"ATTRIBUTE\"," +
        "\"default_aggr_type\": \"SUM\",\"attribution_dimension\": true,\"primary_key\": true,\"foreign_key\": false," +
        "\"index_type\": \"DEFAULT\",\"index_priority\": 1.0,\"physical_column_name\": \"T1_ID\",\"entity_category\": \"DEFAULT\"}," +
        "\"derived\": false,\"physical_column_guid\": \"99a5598d-3978-48d4-ad9c-f76febad1745\"}," +
        "{\"header\": {\"id_guid\": \"4e41b80b-5191-44d7-9f59-63477ea50e31\",\"name\": \"T1_NAME\"," +
        "\"author_guid\": \"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9\",\"created\": 1394152204049,\"modified\": 1394152204049,\"modified_by\": \"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9\",\"generation_num\": 0,\"owner_guid\": \"b\",\"deleted\": false,\"hidden\": false,\"database_stripe\": \"TPCH5K\",\"schema_stripe\": \"falcon_default_schema\"},\"content\": {\"data_type\": \"VARCHAR\",\"type\": \"ATTRIBUTE\",\"default_aggr_type\": \"NONE\",\"attribution_dimension\": true,\"primary_key\": false,\"foreign_key\": false,\"index_type\": \"DEFAULT\",\"index_priority\": 1.0,\"physical_column_name\": \"T1_NAME\",\"entity_category\": \"DEFAULT\"},\"derived\": false,\"physical_column_guid\": \"54359b49-025f-4a36-9a33-8c9ebc8a479a\"},{\"header\": {\"id_guid\": \"2b609b09-9fd5-4c13-b23f-08aa0c11f976\",\"name\": \"T1_TITLE\",\"author_guid\": \"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9\",\"created\": 1396578342613,\"modified\": 1396578342613,\"modified_by\": \"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9\",\"generation_num\": 0,\"owner_guid\": \"bcff5daf-38c5-46c1-b22b-2b5f51ba239b\",\"deleted\": false,\"hidden\": true,\"database_stripe\": \"TPCH5K\",\"schema_stripe\": \"falcon_default_schema\"},\"content\": {\"data_type\": \"VARCHAR\",\"type\": \"ATTRIBUTE\",\"default_aggr_type\": \"NONE\",\"attribution_dimension\": true,\"primary_key\": false,\"foreign_key\": false,\"index_type\": \"DEFAULT\",\"index_priority\": 1.0,\"physical_column_name\": \"T1_TITLE\",\"entity_category\": \"DEFAULT\"},\"derived\": false,\"physical_column_guid\": \"c089799f-e6b3-4843-addb-7f3dddda589e\"}]," +
        "\"relationship\": [{\"header\": {\"id_guid\": \"5\",\"name\": \"Test1-to-Test2-title\",\"author_guid\": \"5a\",\"created\": 10,\"modified\": 10,\"modified_by\": \"a\",\"generation_num\": 0,\"owner_guid\": \"55e\",\"deleted\": false,\"hidden\": false}," +
        "\"content\": {\"relationship\": [{\"source_column_guid\": \"2b609b09-9fd5-4c13-b23f-08aa0c11f976\",\"destination_column_guid\": \"6e7904b7-c170-4b9b-b830-80102982373d\"}]," +
        "\"weight\": 1.0},\"source_table_guid\": \"bcff5daf-38c5-46c1-b22b-2b5f51ba239b\",\"destination_table_guid\": \"3f565765-a6a6-4400-b9a4-fe6dfac66892\",\"join_type\": \"INNER\",\"type\": \"USER_DEFINED\"},{\"header\": {\"id_guid\": \"211f1b7f-ff64-4388-9222-41a8816849d7\",\"name\": \"t1t4\",\"author_guid\": \"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9\",\"created\": 1460074914837,\"modified\": 1460074914837,\"modified_by\": \"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9\",\"generation_num\": 0,\"owner_guid\": \"bcff5daf-38c5-46c1-b22b-2b5f51ba239b\",\"deleted\": true,\"hidden\": false},\"content\": {\"generic_join\": {\"name\": \"OP_EQUALS(T1_ID,T4_ID)\",\"id\": \"8cca1069-7bfc-3402-b430-34303efd4f81\",\"column_type\": \"NONE\",\"child\": [{\"name\": \"T1_ID\",\"id\": \"af843c61-04d9-3037-89b3-eeb689600bd4\",\"column_type\": \"LOGICAL_COLUMN\",\"join_path\": {}},{\"name\": \"T4_ID\",\"id\": \"6713d491-71b7-3158-87cb-22e88e7fb830\",\"column_type\": \"LOGICAL_COLUMN\",\"join_path\": {}}],\"operator\": \"OP_EQUALS\"},\"weight\": 1.0},\"source_table_guid\": \"bcff5daf-38c5-46c1-b22b-2b5f51ba239b\",\"destination_table_guid\": \"9ea3e5b1-3079-4c4d-9aae-87f125493ae2\",\"join_type\": \"INNER\",\"type\": \"GENERIC\"},{\"header\": {\"id_guid\": \"626277c9-5cad-46b9-b114-7e217424fd7b\",\"name\": \"T1_ID\",\"description\": \"Copy of physical relationship\",\"author_guid\": \"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9\",\"created\": 0,\"modified\": 0,\"generation_num\": 0,\"owner_guid\": \"bcff5daf-38c5-46c1-b22b-2b5f51ba239b\",\"deleted\": false,\"hidden\": false},\"content\": {\"relationship\": [{\"source_column_guid\": \"73e76952-b6c7-4316-b5df-33b4ee77e85f\",\"destination_column_guid\": \"f3398c22-b0c2-4d28-a79f-91e98e79067d\"}],\"weight\": 1.0},\"source_table_guid\": \"bcff5daf-38c5-46c1-b22b-2b5f51ba239b\",\"destination_table_guid\": \"3f565765-a6a6-4400-b9a4-fe6dfac66892\",\"join_type\": \"INNER\",\"type\": \"PK_FK\"}],\"physical_table_guid\": \"c57cbd05-d7f3-456f-9ea4-228959078adf\",\"physical_table_version\": 0,\"type\": " +
        "\"ONE_TO_ONE_LOGICAL\"}]";

    var correctSchemaTableOne =
        '{"header":{"id_guid":"95158b73-8da8-44e5-86a7-9973b2f04c17","name":"stats_data_table","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","author_name":"system","author_display_name":"System User","created":1451380780531,"modified":1451380780531,' +
        '"generation_num":0,"owner_guid":"95158b73-8da8-44e5-86a7-9973b2f04c17","deleted":false,"hidden":false,' +
        '"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},' +
        '"content":{"join_type":"INNER","physical_table_name":"stats_data_table","worksheet_type":"VIEW",' +
        '"aggregated_worksheet":false},"column":[{"header":{"id_guid":"3c48a856-52f3-4eab-9d3f-d7393bff45e9",' +
        '"name":"metadata_id","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f",' +
        '"created":1451380780531,"modified":1451380780531,"modified_by"' +
        ':"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9","generation_num":0,"owner_guid"' +
        ':"95158b73-8da8-44e5-86a7-9973b2f04c17","deleted":false,"hidden":false,' +
        '"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"INT32","type":"MEASURE","default_aggr_type":"SUM","attribution_dimension":true,"primary_key":false,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"metadata_id","entity_category":"DEFAULT"},"derived":false,"physical_column_guid":"cb56a8a7-333a-48a3-9023-a179fcaeb590"},{"header":{"id_guid":"0d611c77-f7fe-46b2-a8df-2554bb5bf26b","name":"timestamp","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","created":1451380780532,"modified":1451380780532,"generation_num":0,"owner_guid":"95158b73-8da8-44e5-86a7-9973b2f04c17","deleted":false,"hidden":false,' +
        '"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"DATE_TIME","type":"ATTRIBUTE","default_aggr_type":"NONE","attribution_dimension":true,"primary_key":false,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"timestamp","entity_category":"DEFAULT"},"derived":false,"physical_column_guid":"c584f63d-46e0-40d9-87f9-c3c567d011d7"},' +
        '{"header":{"id_guid":"8e2a4d29-9ddd-4843-99f6-529f005ac7a7","name":"value_int64","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","created":1451380780532,"modified":1451380780532,"generation_num":0,"owner_guid":"95158b73-8da8-44e5-86a7-9973b2f04c17","deleted":false,"hidden":false,"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"INT64","type":"MEASURE","default_aggr_type":"SUM","attribution_dimension":true,"primary_key":false,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"value_int64","entity_category":"DEFAULT"},' +
        '"derived":false,"physical_column_guid":"98a2a74c-63c7-4efa-b0d5-d4fbc4b37d39"},{"header":{"id_guid":"980e4bee-4c61-43c3-8444-ec0cbf84af78","name":"value_double","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","created":1451380780532,"modified":1451380780532,"generation_num":0,"owner_guid":"95158b73-8da8-44e5-86a7-9973b2f04c17","deleted":false,"hidden":false,"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"DOUBLE","type":"MEASURE","default_aggr_type":"SUM","attribution_dimension":true,"primary_key":false,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"value_double","entity_category":"DEFAULT"},"derived":false,"physical_column_guid":"fdd96460-81c4-4bb4-9a62-14297524ee91"}],"relationship":[{"header":{"id_guid":"dc47c7f2-5593-4e9c-9b16-52903a2707c2","name":"metadata_id - metadata_id","description":"1-1 physical relationship","author_guid":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9","created":0,"modified":0,"generation_num":0,"owner_guid":"95158b73-8da8-44e5-86a7-9973b2f04c17","deleted":false,"hidden":false},"content":{"relationship":[{"source_column_guid":"3c48a856-52f3-4eab-9d3f-d7393bff45e9","destination_column_guid":"19a3df69-84ee-4f76-baf5-cb7d3652a2a5"}],"weight":1},"source_table_guid":"95158b73-8da8-44e5-86a7-9973b2f04c17","destination_table_guid":"ddacea33-cd54-465d-9ed0-ec7047bebb58","join_type":"INNER","type":"PK_FK"}],"physical_table_guid":"f657afd6-5bd0-4036-97c3-dcc188f8312d","physical_table_version":0,"type":"ONE_TO_ONE_LOGICAL","data_source_guid":"43121d86-347a-4dbb-bea8-5e5bb899e427"}'

    var correctSchemaTableTwo =
        '{"header":{"id_guid":"ddacea33-cd54-465d-9ed0-ec7047bebb58","name":"stats_metadata_table","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","author_name":"system","author_display_name":"System User","created":1451380780532,"modified":1451380780532,"generation_num":0,"owner_guid":"ddacea33-cd54-465d-9ed0-ec7047bebb58","deleted":false,"hidden":false,"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"join_type":"INNER","physical_table_name":"stats_metadata_table","worksheet_type":"VIEW","aggregated_worksheet":false},"column":[{"header":{"id_guid":"19a3df69-84ee-4f76-baf5-cb7d3652a2a5","name":"metadata_id","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","created":1451380780532,"modified":1451380780532,"modified_by":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9","generation_num":0,"owner_guid":"ddacea33-cd54-465d-9ed0-ec7047bebb58","deleted":false,"hidden":false,"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"INT32","type":"ATTRIBUTE","default_aggr_type":"NONE","attribution_dimension":true,"primary_key":true,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"metadata_id","entity_category":"DEFAULT"},"derived":false,"physical_column_guid":"8dc5b223-cde8-414b-95dc-10cb4a082cd3"},{"header":{"id_guid":"60b37f78-d443-4914-8c65-c5660f15bcd0","name":"cluster_id","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","created":1451380780532,"modified":1451380780532,"generation_num":0,"owner_guid":"ddacea33-cd54-465d-9ed0-ec7047bebb58","deleted":false,"hidden":false,"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"VARCHAR","type":"ATTRIBUTE","default_aggr_type":"NONE","attribution_dimension":true,"primary_key":false,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"cluster_id","entity_category":"DEFAULT"},"derived":false,"physical_column_guid":"b0ae612c-ce0d-4d86-9542-1fa0340ebf24"},{"header":{"id_guid":"24b230cb-088d-4b69-abf6-707f17af11d1","name":"hostname","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","created":1451380780532,"modified":1451380780532,"generation_num":0,"owner_guid":"ddacea33-cd54-465d-9ed0-ec7047bebb58","deleted":false,"hidden":false,"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"VARCHAR","type":"ATTRIBUTE","default_aggr_type":"NONE","attribution_dimension":true,"primary_key":false,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"hostname","entity_category":"DEFAULT"},"derived":false,"physical_column_guid":"ac091e98-9637-4f25-902e-11ef80fe417d"},{"header":{"id_guid":"5e4f429e-fec7-4268-8efd-71ad060a61cb","name":"metric_name","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","created":1451380780532,"modified":1451380780532,"generation_num":0,"owner_guid":"ddacea33-cd54-465d-9ed0-ec7047bebb58","deleted":false,"hidden":false,"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"VARCHAR","type":"ATTRIBUTE","default_aggr_type":"NONE","attribution_dimension":true,"primary_key":false,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"metric_name","entity_category":"DEFAULT"},"derived":false,"physical_column_guid":"7b69ee36-38e9-4d54-b7e1-aec9286fc19d"},{"header":{"id_guid":"932a9424-8a83-4ecc-8071-bcf502bbc064","name":"description","author_guid":"67e15c06-d153-4924-a4cd-ff615393b60f","created":1451380780532,"modified":1451380780532,"generation_num":0,"owner_guid":"ddacea33-cd54-465d-9ed0-ec7047bebb58","deleted":false,"hidden":false,"database_stripe":"thoughtspot_internal_stats","schema_stripe":"falcon_default_schema"},"content":{"data_type":"VARCHAR","type":"ATTRIBUTE","default_aggr_type":"NONE","attribution_dimension":true,"primary_key":false,"foreign_key":false,"index_type":"DONT_INDEX","index_priority":1,"physical_column_name":"description","entity_category":"DEFAULT"},"derived":false,"physical_column_guid":"99279a60-c57a-4743-baad-83d7f314dfea"}],"physical_table_guid":"898d34fd-2f20-471e-a46a-486e236203ae","physical_table_version":0,"type":"ONE_TO_ONE_LOGICAL","data_source_guid":"43121d86-347a-4dbb-bea8-5e5bb899e427"}'


    beforeEach(function (done) {

        module('blink.app');
        module(function ($provide) {
            $provide.value('metadataService', metadataService);
        });

        Promise.all([
            freshImport(basePath, '../../schema-fetcher/schema-service'),
            freshImport(basePath, './graph-factory-service')
        ]).then(function(modules){
            factory = modules[1];
            schemaService = modules[0];
            inject(function (_$rootScope_, $q) {
                scope = _$rootScope_;
                metadataService.getSchema = function () {
                    return $q.when(valueToReturn);
                };
            });
            done();
            scope.$digest();
        }).catch(function(error) {
            done.fail(error);
        });
    });
    // SCAL-19438 factory should accept a schema with relationships that points
    // to a dangling columns
    // In that case, the relationship will be skipped
    it('should ignore relationship with dangling source/target columns', function(done){
        valueToReturn = JSON.parse(simpleSchema);
        schemaService.getSchema(31).then(function(schema){
            var graph = factory.buildFullSchemaGraphForSchema(schema);
            console.log(graph.verticesMap);
            expect(graph.getNumberOfEdges()).toBe(0);
            expect(graph.getNumberOfVertices()).toBe(1);
            done();
        },function(err) {
            done.fail(err)
        });
    });
    // SCAL-19438 factory should accept a schema with relationships that points
    // to a dangling table
    // In that case, the relationship will be skipped
    it('should ignore relationship with dangling source/target tables', function(done){
        valueToReturn = JSON.parse(tableWithRelationships);
        schemaService.getSchema(31).then(function(schema){
            var graph = factory.buildFullSchemaGraphForSchema(schema);
            console.log(graph.verticesMap);
            expect(graph.getNumberOfEdges()).toBe(0);
            expect(graph.getNumberOfVertices()).toBe(1);
            done();
        },function(err) {
            done.fail(err)
        });
    });
    // test for correct schema
    it('should reutn a correct graph for a well-formed schema', function(done){
        valueToReturn = [JSON.parse(correctSchemaTableOne), JSON.parse(correctSchemaTableTwo)];
        schemaService.getSchema(31).then(function(schema) {
            var graph = factory.buildFullSchemaGraphForSchema(schema);
            expect(graph.getNumberOfEdges()).toBe(1);
            expect(graph.getNumberOfVertices()).toBe(2);
            done();
        },function(err) {
            done.fail(err)
        });
    });
});
