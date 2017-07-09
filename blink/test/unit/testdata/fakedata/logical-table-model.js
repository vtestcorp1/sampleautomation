/**
 * This is the config:
 *
 * 17 columns
 * 2 rows
 * 1st column is derived column
 * 2nd and 3rd columns have the same name
 * sage-question node
 */

blink.app.fakeData['/callosum/v1/logical-table-model'] =
{
    "tableMetadata":{
        "logicalTableContent":{
            "question":{
                "text":"saudi ara8",
                //"[{\"token\":\"saudi ara8\",\"type_enum\":4,\"guid\":\"" +
                //    "788e1538-6169-49a9-90b0-c1b116ec5ec2\",\"value_match\":false,\"ranking_score\":30001.044444444444,\"" +
                //"token_metadata\":{\"table_name\":\"CUSTOMER\",\"name\":\"Customer City\"},\"disambiguation\"" +
                //":\"\",\"requires_delimiters\":false,\"placeholder_text\":\"\",\"has_space_after\":true,\"join_path_from_root\"" +
                //":[],\"can_edit_join_path\":false,\"explicit_join_path_edit\":false,\"history\":[],\"startPosition\":0,\"" +
                //"cssProperties\":{\"position\":\"absolute\",\"left\":0,\"width\":61},\"$$hashKey\":\"0JR\"}]"
                "sageContextProto":"CsEBGmEKXwoKc2F1ZGkgYXJhOBAEKiQ3ODhlMTUzOC02MTY5LTQ5YTktOTBiMC1jMWIxMTZlYzVlYzJSGQoIQ1VTVE9NRVISDUN1c3RvbWVyIENpdHlYAGHYgi3YQkzdQGgAgAEBIlxFa01LRFVOMWMzUnZiV1Z5SUVOcGRIa1NKRGM0T0dVeE5UTTRMVFl4TmprdE5EbGhPUzA1TUdJd0xXTXhZakV4Tm1Wak5XVmpNaGdBS2dwellYVmthU0JoY21FNA"
            }
        },
        "columns":[
            {
                // This is a derived column.
                "isDerived":true,
                "header":{
                    "id":"a190dbc9-a194-4491-9b1b-e45f4e248d68",
                    "name":"Test Measure LogicalColumn 0",
                    "generationNum":0,
                    "owner":"22c2c37a-c65d-4f1b-bf1e-87008f8d4f0f"
                },
                "dataType":"FLOAT",
                "type":"UNKNOWN",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0,
                "derivationExpr":{
                    "exprType":"EXPRESSION",
                    "id":"17ff2f3b-9a3e-4389-a4a5-837587ba8b31",
                    "leftNode":{
                        "exprType":"LOGICAL_COLUMN_REFERENCE",
                        "logicalColumn":{
                            "isDerived":false,
                            "physicalColumnGUID":"9ee3f73f-bd32-4ea1-9725-009d55e54dd9",
                            "header":{
                                "id":"cb6c7fa6-74fd-44e1-88bf-312a599407a0",
                                "name":"Test Measure LogicalColumn 0",
                                "generationNum":0,
                                "owner":"2d97de56-e803-41c5-9132-3075425c8b41"
                            },
                            "dataType":"FLOAT",
                            "type":"MEASURE",
                            "defaultAggrType":"SUM",
                            "indexType":"DEFAULT",
                            "indexPriority":1.0
                        },
                        "joinPaths":[
                            { "joins" : []}
                        ]
                    }
                }
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"4b605078-58d3-4593-b869-773ce3d8fea0",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"3aa53aa7-d131-46ec-a487-c9a0f67fa6bb",
                    "name":"Same",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354398,
                    "modified":1382736354398,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"40a2705a-42cc-4829-884b-1e539bc68c5b",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"a85876c3-61d9-48b2-a447-cd8c51c60709",
                    "name":"Same",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354398,
                    "modified":1382736354398,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"dedda9c0-4e35-4cdb-b45e-d72f2311fbe1",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"d1c6c143-beb1-4b2f-93a1-7ae773f12b9e",
                    "name":"Lineorder PartKey",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354398,
                    "modified":1382736354399,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"85654b98-85c0-4155-8684-842003e07172",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"dbe6f9f3-5dc2-4bb5-b6d6-2f2b91e9af80",
                    "name":"Lineorder Suppkey",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354399,
                    "modified":1382736354399,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"f5cb3717-9750-4f11-93e6-14f8357da74a",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"fb029781-9300-4fa0-9ec8-ae2a4076d387",
                    "name":"Order Date",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354399,
                    "modified":1382736354399,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"DATE",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"b5072c67-316e-4e9d-8265-3c4b19ecbe18",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"94d39358-606d-4602-9fa6-136929b1ea69",
                    "name":"Order Priority",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354399,
                    "modified":1382736354399,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"VARCHAR",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"64bf162c-044c-4394-a39a-d4370946e49d",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"94313c93-9ea7-4c67-b6ac-ee0d145922bd",
                    "name":"Ship Priority",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354399,
                    "modified":1382736354399,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"VARCHAR",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"8cf480eb-c829-48a6-abf6-125f6fd6d557",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"8eab0b4b-e3ad-4114-a810-a3665c5defbd",
                    "name":"Quantity",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354399,
                    "modified":1382736354399,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"MEASURE",
                "defaultAggrType":"SUM",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"6cb232bc-bd5e-4c61-832d-75696e27a861",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"f13886dd-2e38-4808-a47f-49da3a40bae6",
                    "name":"Extended Price",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354399,
                    "modified":1382736354399,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"MEASURE",
                "defaultAggrType":"SUM",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"77c43672-ba7f-4151-a563-80e6523a19b4",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"68b814a8-2389-498e-8dec-8ff0fae22809",
                    "name":"Order Total Price",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354399,
                    "modified":1382736354399,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"MEASURE",
                "defaultAggrType":"SUM",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"ed1a28d3-224f-4960-b971-d35ef77e6493",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"98da48a9-670e-4d7e-b478-4c5d4218c01b",
                    "name":"Discount",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354400,
                    "modified":1382736354400,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"MEASURE",
                "defaultAggrType":"SUM",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"bed02700-f894-423c-b7ac-c2d41e42de93",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"d8cd8978-bd01-4d57-910d-4781e8b33123",
                    "name":"Revenue",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354400,
                    "modified":1382736354400,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"MEASURE",
                "defaultAggrType":"SUM",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"26b90ed9-dca4-486d-814c-eb0ec179896b",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"e70b2306-98c2-4f86-8460-870fcb3712ee",
                    "name":"Supply Cost",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354400,
                    "modified":1382736354400,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"MEASURE",
                "defaultAggrType":"SUM",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"8ff7bc97-501c-4d19-a50b-21ed7ad2fe8a",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"6ac1cf06-71c5-4f08-a1b5-08033496ff17",
                    "name":"Tax",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354400,
                    "modified":1382736354400,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"INT64",
                "type":"MEASURE",
                "defaultAggrType":"SUM",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"3e1615ef-f9b6-4749-aab3-ff1142977c8f",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"7924554d-537e-4b85-b20e-01423626f5c3",
                    "name":"Commit Date",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354400,
                    "modified":1382736354400,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"DATE",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },
            {
                "isDerived":false,
                "physicalColumnGUID":"76bf0a53-cd46-4bed-9804-ebb1249bd358",
                "ownerName":"LINEORDER",
                "header":{
                    "id":"4f1e2f95-8ec6-4567-8c4c-bc77d55b9d67",
                    "name":"Ship Mode",
                    "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
                    "created":1382736354400,
                    "modified":1382736354400,
                    "generationNum":0,
                    "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
                    "isDeleted":false,
                    "isHidden":false
                },
                "dataType":"VARCHAR",
                "type":"ATTRIBUTE",
                "defaultAggrType":"NONE",
                "indexType":"DEFAULT",
                "indexPriority":1.0
            },{
                "isDerived": false,
                "physicalColumnGUID": "50e35d1d-8088-4c27-8380-bbba17a0e388",
                "header": {
                    "id": "c58bc64e-f2c3-4340-bcec-5d8f491df1cf",
                    "name": "Zip Code",
                    "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                    "created": 1445118365561,
                    "modified": 1445118395297,
                    "modifiedBy": "59481331-ee53-42be-a548-bd87be6ddd4a",
                    "generationNum": 0,
                    "owner": "4e97ce5f-fcf8-4f0e-82a8-0906b763e303",
                    "isDeleted": false,
                    "isHidden": false,
                    "schemaStripe": "FalconUserDataSchema",
                    "databaseStripe": "FalconUserDataDataBase",
                    "tags": []
                },
                "complete": true,
                "dataType": "INT64",
                "type": "MEASURE",
                "defaultAggrType": "SUM",
                "isAdditive": true,
                "indexType": "DEFAULT",
                "indexPriority": 1,
                "physicalColumnName": "Zip Code",
                "geoConfig": {
                    type: "ZIP_CODE",
                    parent: {
                        type: "ADMIN_DIV_0",
                        fixedValue: "US"
                    }
                },
                "isAttributionDimension": true,
                "ownerName": "WalMart",
                "ownerType": "USER_DEFINED",
                "sources": [],
                "synonyms": [],
                "precision": 26,
                "scale": 0,
                "schemaVersion": "3.1.0",
                "isPrimaryKey": false,
                "dataRecency": 1445118369
            }
        ],
        "physicalTableGUID":"63d0e10c-1769-4876-b511-22144a84f7db",
        "physicalTableVersion":0,
        "header":{
            "id":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
            "name":"LINEORDER",
            "author":"0f0dd0f7-7411-4195-a4aa-0dc6b58413c9",
            "created":1382736354340,
            "modified":1382736354391,
            "generationNum":0,
            "owner":"2445fe81-30d6-46fa-9f42-f6b1b4e01623",
            "isDeleted":false,
            "isHidden":false
        }
    },
    "tableData":{
        "data":[
            [
                796636800,
                4,
                2116823,
                1,
                25738,
                155190,
                828,
                793094400,
                "2-high",
                7730149,
                1,
                17,
                2032150,
                "truck",
                "0",
                74711,
                2,
                94085
            ],
            [
                798015600,
                9,
                4598316,
                2,
                25738,
                67310,
                163,
                793094400,
                "2-high",
                7730149,
                1,
                36,
                4184467,
                "mail",
                "0",
                76638,
                6,
                94086
            ]
        ],
        "uniques":{
            "0":[
                796636800,
                798015600
            ],
            "1":[
                4,
                9
            ],
            "2":[
                2116823,
                4598316
            ],
            "3":[
                1,
                2
            ],
            "4":[
                25738
            ],
            "5":[
                155190,
                67310
            ],
            "6":[
                828,
                163
            ],
            "7":[
                793094400
            ],
            "8":[
                "2-high"
            ],
            "9":[
                7730149
            ],
            "10":[
                1
            ],
            "11":[
                17,
                36
            ],
            "12":[
                2032150,
                4184467
            ],
            "13":[
                "truck",
                "mail"
            ],
            "14":[
                "0"
            ],
            "15":[
                74711,
                76638
            ],
            "16":[
                2,
                6
            ],
            "17": [
                94085,
                94086
            ]
        },
        "completionRatio":1.0,
        "currentOffset":0,
        "isLastBatch":false,
        "currentBatchSize":2
    },
    "completionRatio":1.0,
    "debugInfo":{
        "falcon":{
            "duration":59000,
            "detail":[
                {
                    "TABLE":{
                        "rowCount":2,
                        "columnCount":17,
                        "uniquesCount":[
                            {
                                "0":2
                            },
                            {
                                "1":2
                            },
                            {
                                "2":2
                            },
                            {
                                "3":2
                            },
                            {
                                "4":1
                            },
                            {
                                "5":2
                            },
                            {
                                "6":2
                            },
                            {
                                "7":1
                            },
                            {
                                "8":1
                            },
                            {
                                "9":1
                            },
                            {
                                "10":1
                            },
                            {
                                "11":2
                            },
                            {
                                "12":2
                            },
                            {
                                "13":2
                            },
                            {
                                "14":1
                            },
                            {
                                "15":2
                            },
                            {
                                "16":2
                            },
                            {
                                "17": 2
                            }
                        ],
                        "queryTime":21000
                    }
                }
            ]
        },
        "serviceInvocTime":182000,
        "postgres":{
            "duration":103000
        }
    }
};