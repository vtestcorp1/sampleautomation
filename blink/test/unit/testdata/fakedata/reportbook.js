blink.app.fakeData.reportbook =
{
    "reportBookMetadata": {
        "reportContent": {
            "sheets": [
                {
                    "sheetType": "QUESTION",
                    "sheetContent": {
                        "sheetContentType": "QUESTION",
                        "question": {
                            "text": "amount vendor 2013",
                            "resolvedText": "[{\"token\":\"Amount\",\"type_enum\":2,\"type_name\":\"measure\",\"guid\":\"c59b3e41-aa2b-4ea2-8d3b-14ae072bc75a\",\"value_match\":false,\"ranking_score\":100,\"token_metadata\":{\"table_name\":\"transactions\",\"name\":\"Amount\"},\"cssProperties\":{\"position\":\"absolute\",\"left\":0,\"width\":55},\"$$hashKey\":\"09E\"},{\"token\":\"Vendor\",\"type_enum\":3,\"type_name\":\"attribute\",\"guid\":\"286a337e-a32d-4d44-b54c-3eb2b6841e79\",\"value_match\":false,\"ranking_score\":1000,\"token_metadata\":{\"table_name\":\"transactions\",\"column_name\":\"Vendor\"},\"cssProperties\":{\"position\":\"absolute\",\"left\":59,\"width\":50},\"$$hashKey\":\"09G\"},{\"token\":\"2013\",\"type_enum\":4,\"type_name\":\"c:Year\",\"guid\":\"9be89474-c654-41fb-9a7d-f41234ea0fde\",\"value_match\":false,\"ranking_score\":0.005479999861563556,\"token_metadata\":{\"table_name\":\"transactions\",\"column_name\":\"Year\"},\"cssProperties\":{\"position\":\"absolute\",\"left\":113,\"width\":35},\"$$hashKey\":\"09I\"}]"
                        },
                        "filter": {
                            "filterContent": {
                                "type": "SIMPLE",
                                "rows": [
                                    {
                                        "column": {
                                            "column": {
                                                "dataType": "INT64",
                                                "type": "ATTRIBUTE",
                                                "defaultAggrType": "NONE",
                                                "isDerived": false,
                                                "physicalColumnGUID": "946013eb-c4cc-4f7c-acc3-f8a41bb05f0d",
                                                "indexType": "DEFAULT",
                                                "indexPriority": 1,
                                                "header": {
                                                    "id": "9be89474-c654-41fb-9a7d-f41234ea0fde",
                                                    "name": "Year",
                                                    "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                    "created": 1354053901416,
                                                    "modified": 1354053901416,
                                                    "generationNum": 0,
                                                    "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                    "isDeleted": false,
                                                    "isHidden": false
                                                },
                                                "id": "9be89474-c654-41fb-9a7d-f41234ea0fde",
                                                "name": "Year"
                                            },
                                            "effectiveAggrType": "NONE",
                                            "effectiveDataType": "INT64",
                                            "effectiveType": "ATTRIBUTE",
                                            "formatPattern": "#,##0.###"
                                        },
                                        "oper": "EQ",
                                        "values": [
                                            {
                                                "key": "2013",
                                                "selected": true
                                            }
                                        ]
                                    }
                                ]
                            },
                            "header": {
                                "id": "9d5d3f9e-6dd3-4473-8dc3-1d6599e9d867",
                                "name": "Filter null",
                                "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                "created": 1375993248891,
                                "modified": 1375993710946,
                                "generationNum": 0,
                                "owner": "b21a9400-ab03-4189-92e4-9233a32118bf",
                                "isDeleted": false,
                                "isHidden": false
                            }
                        },
                        "visualizations": [
                            {
                                "vizContent": {
                                    "vizType": "HEADLINE",
                                    "template": "ATTRIBUTE",
                                    "columns": [
                                        {
                                            "column": {
                                                "column": {
                                                    "dataType": "VARCHAR",
                                                    "type": "ATTRIBUTE",
                                                    "defaultAggrType": "NONE",
                                                    "isDerived": false,
                                                    "physicalColumnGUID": "9634d8bb-1bd2-4239-8135-8ce1dc491b60",
                                                    "indexType": "DEFAULT",
                                                    "indexPriority": 1,
                                                    "header": {
                                                        "id": "286a337e-a32d-4d44-b54c-3eb2b6841e79",
                                                        "name": "Vendor",
                                                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                        "created": 1354053901416,
                                                        "modified": 1354053901416,
                                                        "generationNum": 0,
                                                        "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                        "isDeleted": false,
                                                        "isHidden": false
                                                    },
                                                    "id": "286a337e-a32d-4d44-b54c-3eb2b6841e79",
                                                    "name": "Vendor"
                                                },
                                                "aggrTypeOverride": "NONE",
                                                "typeOverride": "ATTRIBUTE",
                                                "effectiveAggrType": "NONE",
                                                "effectiveDataType": "VARCHAR",
                                                "effectiveType": "ATTRIBUTE"
                                            },
                                            "aggrs": [
                                                "COUNT_DISTINCT"
                                            ],
                                            "tableSummary": true
                                        }
                                    ],
                                    "title": {
                                        "value": {
                                            "text": "Headline 0"
                                        }
                                    },
                                    "locked": true
                                },
                                "header": {
                                    "id": "6ae16740-8977-48dc-83cf-9af5204e103a",
                                    "name": "Headline Viz amount vendor 2013",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1375993248891,
                                    "modified": 1375993710946,
                                    "generationNum": 0,
                                    "owner": "b21a9400-ab03-4189-92e4-9233a32118bf",
                                    "isDeleted": false,
                                    "isHidden": false
                                }
                            },
                            {
                                "vizContent": {
                                    "vizType": "HEADLINE",
                                    "template": "ATTRIBUTE",
                                    "columns": [
                                        {
                                            "column": {
                                                "column": {
                                                    "dataType": "INT64",
                                                    "type": "ATTRIBUTE",
                                                    "defaultAggrType": "NONE",
                                                    "isDerived": false,
                                                    "physicalColumnGUID": "946013eb-c4cc-4f7c-acc3-f8a41bb05f0d",
                                                    "indexType": "DEFAULT",
                                                    "indexPriority": 1,
                                                    "header": {
                                                        "id": "9be89474-c654-41fb-9a7d-f41234ea0fde",
                                                        "name": "Year",
                                                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                        "created": 1354053901416,
                                                        "modified": 1354053901416,
                                                        "generationNum": 0,
                                                        "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                        "isDeleted": false,
                                                        "isHidden": false
                                                    },
                                                    "id": "9be89474-c654-41fb-9a7d-f41234ea0fde",
                                                    "name": "Year"
                                                },
                                                "effectiveAggrType": "NONE",
                                                "effectiveDataType": "INT64",
                                                "effectiveType": "ATTRIBUTE",
                                                "formatPattern": "#,##0.###"
                                            },
                                            "aggrs": [
                                                "COUNT_DISTINCT"
                                            ],
                                            "tableSummary": true
                                        }
                                    ],
                                    "title": {
                                        "value": {
                                            "text": "Headline 1"
                                        }
                                    },
                                    "locked": true
                                },
                                "header": {
                                    "id": "6907c777-bd06-43d4-b95b-c7fbd68efb7d",
                                    "name": "Headline Viz amount vendor 2013",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1375993248891,
                                    "modified": 1375993710946,
                                    "generationNum": 0,
                                    "owner": "b21a9400-ab03-4189-92e4-9233a32118bf",
                                    "isDeleted": false,
                                    "isHidden": false
                                }
                            },
                            {
                                "vizContent": {
                                    "vizType": "HEADLINE",
                                    "template": "MEASURE",
                                    "columns": [
                                        {
                                            "column": {
                                                "column": {
                                                    "dataType": "DOUBLE",
                                                    "type": "MEASURE",
                                                    "defaultAggrType": "SUM",
                                                    "isDerived": false,
                                                    "physicalColumnGUID": "ffa9632a-c857-4304-9d04-8ec1b60ff66b",
                                                    "indexType": "DEFAULT",
                                                    "indexPriority": 1,
                                                    "header": {
                                                        "id": "c59b3e41-aa2b-4ea2-8d3b-14ae072bc75a",
                                                        "name": "Amount",
                                                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                        "created": 1354053901416,
                                                        "modified": 1354053901416,
                                                        "generationNum": 0,
                                                        "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                        "isDeleted": false,
                                                        "isHidden": false
                                                    },
                                                    "id": "c59b3e41-aa2b-4ea2-8d3b-14ae072bc75a",
                                                    "name": "Amount"
                                                },
                                                "aggrTypeOverride": "NONE",
                                                "typeOverride": "MEASURE",
                                                "effectiveAggrType": "SUM",
                                                "effectiveDataType": "DOUBLE",
                                                "effectiveType": "MEASURE",
                                                "formatPattern": "#,##0.###"
                                            },
                                            "aggrs": [
                                                "SUM"
                                            ],
                                            "tableSummary": true
                                        }
                                    ],
                                    "title": {
                                        "value": {
                                            "text": "Headline 0"
                                        }
                                    },
                                    "locked": true
                                },
                                "header": {
                                    "id": "fa04af8e-3223-4bd1-b62d-6021c4a2f484",
                                    "name": "Headline Viz amount vendor 2013",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1375993248891,
                                    "modified": 1375993710946,
                                    "generationNum": 0,
                                    "owner": "b21a9400-ab03-4189-92e4-9233a32118bf",
                                    "isDeleted": false,
                                    "isHidden": false
                                }
                            },
                            {
                                "vizContent": {
                                    "vizType": "FILTER",
                                    "rowIndex": 0,
                                    "title": {
                                        "value": {
                                            "text": "Filter 0"
                                        }
                                    },
                                    "dataOnDemand": true
                                },
                                "header": {
                                    "id": "4c6676f8-821c-4078-9be0-c2cc2d1d4671",
                                    "name": "Filter Viz amount vendor 2013 Row: 0",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1375993248891,
                                    "modified": 1375993710946,
                                    "generationNum": 0,
                                    "owner": "b21a9400-ab03-4189-92e4-9233a32118bf",
                                    "isDeleted": false,
                                    "isHidden": false
                                }
                            },
                            {
                                "vizContent": {
                                    "vizType": "TABLE",
                                    "columns": [
                                        {
                                            "column": {
                                                "dataType": "VARCHAR",
                                                "type": "ATTRIBUTE",
                                                "defaultAggrType": "NONE",
                                                "isDerived": false,
                                                "physicalColumnGUID": "9634d8bb-1bd2-4239-8135-8ce1dc491b60",
                                                "indexType": "DEFAULT",
                                                "indexPriority": 1,
                                                "header": {
                                                    "id": "286a337e-a32d-4d44-b54c-3eb2b6841e79",
                                                    "name": "Vendor",
                                                    "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                    "created": 1354053901416,
                                                    "modified": 1354053901416,
                                                    "generationNum": 0,
                                                    "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                    "isDeleted": false,
                                                    "isHidden": false
                                                },
                                                "id": "286a337e-a32d-4d44-b54c-3eb2b6841e79",
                                                "name": "Vendor"
                                            },
                                            "sortAscending": true,
                                            "hasSubTotal": true,
                                            "aggrTypeOverride": "NONE",
                                            "typeOverride": "ATTRIBUTE",
                                            "effectiveAggrType": "NONE",
                                            "effectiveDataType": "VARCHAR",
                                            "effectiveType": "ATTRIBUTE"
                                        },
                                        {
                                            "column": {
                                                "dataType": "INT64",
                                                "type": "ATTRIBUTE",
                                                "defaultAggrType": "NONE",
                                                "isDerived": false,
                                                "physicalColumnGUID": "946013eb-c4cc-4f7c-acc3-f8a41bb05f0d",
                                                "indexType": "DEFAULT",
                                                "indexPriority": 1,
                                                "header": {
                                                    "id": "9be89474-c654-41fb-9a7d-f41234ea0fde",
                                                    "name": "Year",
                                                    "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                    "created": 1354053901416,
                                                    "modified": 1354053901416,
                                                    "generationNum": 0,
                                                    "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                    "isDeleted": false,
                                                    "isHidden": false
                                                },
                                                "id": "9be89474-c654-41fb-9a7d-f41234ea0fde",
                                                "name": "Year"
                                            },
                                            "sortAscending": true,
                                            "effectiveAggrType": "NONE",
                                            "effectiveDataType": "INT64",
                                            "effectiveType": "ATTRIBUTE",
                                            "formatPattern": "#,##0.###"
                                        },
                                        {
                                            "column": {
                                                "dataType": "DOUBLE",
                                                "type": "MEASURE",
                                                "defaultAggrType": "SUM",
                                                "isDerived": false,
                                                "physicalColumnGUID": "ffa9632a-c857-4304-9d04-8ec1b60ff66b",
                                                "indexType": "DEFAULT",
                                                "indexPriority": 1,
                                                "header": {
                                                    "id": "c59b3e41-aa2b-4ea2-8d3b-14ae072bc75a",
                                                    "name": "Amount",
                                                    "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                    "created": 1354053901416,
                                                    "modified": 1354053901416,
                                                    "generationNum": 0,
                                                    "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                    "isDeleted": false,
                                                    "isHidden": false
                                                },
                                                "id": "c59b3e41-aa2b-4ea2-8d3b-14ae072bc75a",
                                                "name": "Amount"
                                            },
                                            "aggrTypeOverride": "NONE",
                                            "typeOverride": "MEASURE",
                                            "effectiveAggrType": "SUM",
                                            "effectiveDataType": "DOUBLE",
                                            "effectiveType": "MEASURE",
                                            "formatPattern": "#,##0.###"
                                        }
                                    ],
                                    "hasTotal": true,
                                    "title": {
                                        "value": {
                                            "text": "Table 1"
                                        }
                                    }
                                },
                                "header": {
                                    "id": "be1e8ecf-8d4a-4be4-8abc-dad37d5ffd88",
                                    "name": "Table Viz amount vendor 2013",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1375993248891,
                                    "modified": 1375993710946,
                                    "generationNum": 0,
                                    "owner": "b21a9400-ab03-4189-92e4-9233a32118bf",
                                    "isDeleted": false,
                                    "isHidden": false
                                }
                            },
                            {
                                "vizContent": {
                                    "vizType": "CHART",
                                    "chartType": "COLUMN",
                                    "categories": {
                                        "columns": [
                                            {
                                                "column": {
                                                    "dataType": "VARCHAR",
                                                    "type": "ATTRIBUTE",
                                                    "defaultAggrType": "NONE",
                                                    "isDerived": false,
                                                    "physicalColumnGUID": "9634d8bb-1bd2-4239-8135-8ce1dc491b60",
                                                    "indexType": "DEFAULT",
                                                    "indexPriority": 1,
                                                    "header": {
                                                        "id": "286a337e-a32d-4d44-b54c-3eb2b6841e79",
                                                        "name": "Vendor",
                                                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                        "created": 1354053901416,
                                                        "modified": 1354053901416,
                                                        "generationNum": 0,
                                                        "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                        "isDeleted": false,
                                                        "isHidden": false
                                                    },
                                                    "id": "286a337e-a32d-4d44-b54c-3eb2b6841e79",
                                                    "name": "Vendor"
                                                },
                                                "sortAscending": true,
                                                "aggrTypeOverride": "NONE",
                                                "typeOverride": "ATTRIBUTE",
                                                "effectiveAggrType": "NONE",
                                                "effectiveDataType": "VARCHAR",
                                                "effectiveType": "ATTRIBUTE"
                                            }
                                        ]
                                    },
                                    "series": {
                                        "columns": [
                                            {
                                                "column": {
                                                    "dataType": "INT64",
                                                    "type": "ATTRIBUTE",
                                                    "defaultAggrType": "NONE",
                                                    "isDerived": false,
                                                    "physicalColumnGUID": "946013eb-c4cc-4f7c-acc3-f8a41bb05f0d",
                                                    "indexType": "DEFAULT",
                                                    "indexPriority": 1,
                                                    "header": {
                                                        "id": "9be89474-c654-41fb-9a7d-f41234ea0fde",
                                                        "name": "Year",
                                                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                        "created": 1354053901416,
                                                        "modified": 1354053901416,
                                                        "generationNum": 0,
                                                        "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                        "isDeleted": false,
                                                        "isHidden": false
                                                    },
                                                    "id": "9be89474-c654-41fb-9a7d-f41234ea0fde",
                                                    "name": "Year"
                                                },
                                                "sortAscending": true,
                                                "effectiveAggrType": "NONE",
                                                "effectiveDataType": "INT64",
                                                "effectiveType": "ATTRIBUTE",
                                                "formatPattern": "#,##0.###"
                                            }
                                        ]
                                    },
                                    "values": {
                                        "columns": [
                                            {
                                                "column": {
                                                    "dataType": "DOUBLE",
                                                    "type": "MEASURE",
                                                    "defaultAggrType": "SUM",
                                                    "isDerived": false,
                                                    "physicalColumnGUID": "ffa9632a-c857-4304-9d04-8ec1b60ff66b",
                                                    "indexType": "DEFAULT",
                                                    "indexPriority": 1,
                                                    "header": {
                                                        "id": "c59b3e41-aa2b-4ea2-8d3b-14ae072bc75a",
                                                        "name": "Amount",
                                                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                                                        "created": 1354053901416,
                                                        "modified": 1354053901416,
                                                        "generationNum": 0,
                                                        "owner": "b8215431-0719-472d-aa2d-4f1573312af2",
                                                        "isDeleted": false,
                                                        "isHidden": false
                                                    },
                                                    "id": "c59b3e41-aa2b-4ea2-8d3b-14ae072bc75a",
                                                    "name": "Amount"
                                                },
                                                "aggrTypeOverride": "NONE",
                                                "typeOverride": "MEASURE",
                                                "effectiveAggrType": "SUM",
                                                "effectiveDataType": "DOUBLE",
                                                "effectiveType": "MEASURE",
                                                "formatPattern": "#,##0.###"
                                            }
                                        ]
                                    },
                                    "hiddenColumns": {},
                                    "title": {
                                        "value": {
                                            "text": "Chart 1"
                                        }
                                    },
                                    "subTitle": {
                                        "value": {
                                            "text": "Total Amount"
                                        }
                                    }
                                },
                                "header": {
                                    "id": "9d552576-2f43-46d7-a0c0-862e02889032",
                                    "name": "Chart Viz amount vendor 2013",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1375993248891,
                                    "modified": 1375993710946,
                                    "generationNum": 0,
                                    "owner": "b21a9400-ab03-4189-92e4-9233a32118bf",
                                    "isDeleted": false,
                                    "isHidden": false
                                }
                            }
                        ],
                        "vizContainer": {
                            "vizType": "CONTAINER",
                            "flow": "VERTICAL",
                            "type": "ANSWER_ROOT",
                            "vizList": [
                                {
                                    "vizType": "CONTAINER",
                                    "flow": "HORIZONTAL",
                                    "type": "HEADLINE_AREA",
                                    "vizList": [
                                        {
                                            "vizType": "VIZ_REF",
                                            "id": "7ea6fc84-0b5f-4711-af4c-a2c88b73300b"
                                        },
                                        {
                                            "vizType": "VIZ_REF",
                                            "id": "6907c777-bd06-43d4-b95b-c7fbd68efb7d"
                                        },
                                        {
                                            "vizType": "VIZ_REF",
                                            "id": "9addfd93-5bee-4a20-9909-e7d1fd2ce789"
                                        }
                                    ]
                                },
                                {
                                    "vizType": "CONTAINER",
                                    "flow": "HORIZONTAL",
                                    "type": "FILTERS_AND_CONTENT_AREA",
                                    "vizList": [
                                        {
                                            "vizType": "CONTAINER",
                                            "flow": "VERTICAL",
                                            "type": "FILTERS_AREA",
                                            "vizList": [
                                                {
                                                    "vizType": "VIZ_REF",
                                                    "id": "4c6676f8-821c-4078-9be0-c2cc2d1d4671"
                                                }
                                            ]
                                        },
                                        {
                                            "vizType": "CONTAINER",
                                            "flow": "HORIZONTAL",
                                            "type": "CONTENT_AREA",
                                            "vizList": [
                                                {
                                                    "vizType": "VIZ_REF",
                                                    "id": "a5fd863e-6301-429e-bae5-4acc986eb88e"
                                                },
                                                {
                                                    "vizType": "VIZ_REF",
                                                    "id": "99d9e9ed-d693-4d36-8a8b-d258e3320ef3"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        "layout": {
                            "layoutMode": "auto",
                            "layoutTemplate": "answer",
                            "tiles": []
                        }
                    },
                    "header": {
                        "id": "b21a9400-ab03-4189-92e4-9233a32118bf",
                        "name": "Answer Sheet amount",
                        "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                        "created": 1375993248891,
                        "modified": 1375993710946,
                        "generationNum": 0,
                        "owner": "3c9b9308-bcd5-42a4-8ecc-c7d79b701f3e",
                        "isDeleted": false,
                        "isHidden": false,
                        "statistics": {
                            "vizTypeList": [
                                "HEADLINE",
                                "HEADLINE",
                                "HEADLINE",
                                "FILTER",
                                "TABLE",
                                "CHART::COLUMN"
                            ]
                        }
                    }
                }
            ]
        },
        "header": {
            "id": "3c9b9308-bcd5-42a4-8ecc-c7d79b701f3e",
            "name": "Answer Sheet amount",
            "author": "4391d676-2dd8-4248-b6db-d973811f0122",
            "created": 1375993248891,
            "modified": 1375993710946,
            "generationNum": 0,
            "owner": "3c9b9308-bcd5-42a4-8ecc-c7d79b701f3e",
            "isDeleted": false,
            "isHidden": false
        }
    },
    "reportBookData": {
        "b21a9400-ab03-4189-92e4-9233a32118bf": {
            "vizData": {
                "6ae16740-8977-48dc-83cf-9af5204e103a": {
                    "dataSets": {
                        "HEADLINE": {
                            "data": [
                                [
                                    139
                                ]
                            ]
                        }
                    }
                },
                "6907c777-bd06-43d4-b95b-c7fbd68efb7d": {
                    "dataSets": {
                        "HEADLINE": {
                            "data": [
                                [
                                    1
                                ]
                            ]
                        }
                    }
                },
                "fa04af8e-3223-4bd1-b62d-6021c4a2f484": {
                    "dataSets": {
                        "HEADLINE": {
                            "data": [
                                [
                                    1891165.7000000002
                                ]
                            ]
                        }
                    }
                },
                "be1e8ecf-8d4a-4be4-8abc-dad37d5ffd88": {
                    "dataSets": {
                        "TABLE": {
                            "data": [
                                [
                                    "\"Jewell & Associates, PC\"",
                                    2013,
                                    1000
                                ],
                                [
                                    "\"The Brenner Group, Inc.\"",
                                    2013,
                                    5750
                                ],
                                [
                                    "\"Thomas International USA Inc,\"",
                                    2013,
                                    900
                                ],
                                [
                                    "\"White Summers Caffee & James, LLP\"",
                                    2013,
                                    245.4
                                ],
                                [
                                    "ACE Parking",
                                    2013,
                                    1
                                ],
                                [
                                    "AT&T",
                                    2013,
                                    1012.5
                                ],
                                [
                                    "Account Maintenance Fee",
                                    2013,
                                    20
                                ],
                                [
                                    "Adobe Systems",
                                    2013,
                                    20
                                ],
                                [
                                    "Agi Abic Ins",
                                    2013,
                                    20.1
                                ],
                                [
                                    "Alana Cafe",
                                    2013,
                                    20
                                ],
                                [
                                    "Amarin Thai Cuisine",
                                    2013,
                                    33.3
                                ],
                                [
                                    "Amazon",
                                    2013,
                                    7395.599999999999
                                ],
                                [
                                    "Amicis East Coast",
                                    2013,
                                    542
                                ],
                                [
                                    "Amitoxford Ca Mcc",
                                    2013,
                                    74.7
                                ],
                                [
                                    "Ampco Parking",
                                    2013,
                                    8
                                ],
                                [
                                    "Anthem Blue Cross",
                                    2013,
                                    34457
                                ],
                                [
                                    "Apple",
                                    2013,
                                    2840.8
                                ],
                                [
                                    "Atlassian Pty Ltd",
                                    2013,
                                    84
                                ],
                                [
                                    "Bangkok Bay Thai",
                                    2013,
                                    12.1
                                ],
                                [
                                    "Best Buy",
                                    2013,
                                    651
                                ],
                                [
                                    "CT Corporation",
                                    2013,
                                    365
                                ],
                                [
                                    "Ca Secretary State",
                                    2013,
                                    25
                                ],
                                [
                                    "California Department of Corporations",
                                    2013,
                                    959
                                ],
                                [
                                    "Caltrain",
                                    2013,
                                    18
                                ],
                                [
                                    "Chipotle",
                                    2013,
                                    1018.8
                                ],
                                [
                                    "ClickAway.com",
                                    2013,
                                    607.6
                                ],
                                [
                                    "Client Analysis Srvc",
                                    2013,
                                    35
                                ],
                                [
                                    "Comcast",
                                    2013,
                                    170.5
                                ],
                                [
                                    "Conservice",
                                    2013,
                                    440.70000000000005
                                ],
                                [
                                    "Costco",
                                    2013,
                                    1582.6999999999998
                                ],
                                [
                                    "Curry Up Now",
                                    2013,
                                    266.20000000000005
                                ],
                                [
                                    "Customer Satisfaction",
                                    2013,
                                    35
                                ],
                                [
                                    "Darryl Warren",
                                    2013,
                                    219.8
                                ],
                                [
                                    "Delaware Corp De",
                                    2013,
                                    2511.5
                                ],
                                [
                                    "Deposit Made In",
                                    2013,
                                    416.6
                                ],
                                [
                                    "Discountmugs Com Can",
                                    2013,
                                    346
                                ],
                                [
                                    "Dri Jetbrains Element",
                                    2013,
                                    49
                                ],
                                [
                                    "Dri Jetbrains Mn",
                                    2013,
                                    49
                                ],
                                [
                                    "Ds Waters Standard",
                                    2013,
                                    240.1
                                ],
                                [
                                    "East West Administrators",
                                    2013,
                                    250
                                ],
                                [
                                    "East West Adminstrator",
                                    2013,
                                    375
                                ],
                                [
                                    "East West Adminstrators",
                                    2013,
                                    3140.1000000000004
                                ],
                                [
                                    "Eb Pinnacle What",
                                    2013,
                                    53.5
                                ],
                                [
                                    "Ellisonsyst Ny",
                                    2013,
                                    22.9
                                ],
                                [
                                    "Erik Deli Cafe",
                                    2013,
                                    248.9
                                ],
                                [
                                    "Excess Activity Fee",
                                    2013,
                                    10
                                ],
                                [
                                    "Expensify Ca",
                                    2013,
                                    20
                                ],
                                [
                                    "Federal Express",
                                    2013,
                                    117
                                ],
                                [
                                    "Franchise tax Board",
                                    2013,
                                    800
                                ],
                                [
                                    "Gelato Classico Mcc",
                                    2013,
                                    61
                                ],
                                [
                                    "Getquik Com Ca",
                                    2013,
                                    1772.8000000000002
                                ],
                                [
                                    "Gianlui Pizzuti",
                                    2013,
                                    187.5
                                ],
                                [
                                    "Go Dry Erase",
                                    2013,
                                    40.4
                                ],
                                [
                                    "Google",
                                    2013,
                                    65
                                ],
                                [
                                    "Gunderson Dettmer",
                                    2013,
                                    50064.1
                                ],
                                [
                                    "Harvard Investment Company",
                                    2013,
                                    69256.9
                                ],
                                [
                                    "Homestead Mcc",
                                    2013,
                                    2155.4
                                ],
                                [
                                    "Hotels.com",
                                    2013,
                                    2584.8
                                ],
                                [
                                    "IKEA",
                                    2013,
                                    601.5999999999999
                                ],
                                [
                                    "Ideapaint Ma",
                                    2013,
                                    93.89999999999999
                                ],
                                [
                                    "Interest",
                                    2013,
                                    4938.700000000001
                                ],
                                [
                                    "Intuit",
                                    2013,
                                    160
                                ],
                                [
                                    "Iron Systems",
                                    2013,
                                    120.7
                                ],
                                [
                                    "Iron Systems Ca",
                                    2013,
                                    1414.7
                                ],
                                [
                                    "Jj Wj Llc",
                                    2013,
                                    1029
                                ],
                                [
                                    "Jonathan Moreira",
                                    2013,
                                    3520.1
                                ],
                                [
                                    "Law Office of Ning Gan",
                                    2013,
                                    12945
                                ],
                                [
                                    "Madisonseat Ny",
                                    2013,
                                    625
                                ],
                                [
                                    "Marshall Choi",
                                    2013,
                                    5832.5
                                ],
                                [
                                    "Mike McMillin",
                                    2013,
                                    80
                                ],
                                [
                                    "Nespresso Usa Ny",
                                    2013,
                                    69.9
                                ],
                                [
                                    "New York Pizza",
                                    2013,
                                    70.3
                                ],
                                [
                                    "Newegg",
                                    2013,
                                    4162.099999999999
                                ],
                                [
                                    "Newton Software",
                                    2013,
                                    1245
                                ],
                                [
                                    "Nicholas Swanson",
                                    2013,
                                    3237.2
                                ],
                                [
                                    "Office Depot",
                                    2013,
                                    109
                                ],
                                [
                                    "PG&E",
                                    2013,
                                    192.8
                                ],
                                [
                                    "Palomo Archery",
                                    2013,
                                    445
                                ],
                                [
                                    "Paradies",
                                    2013,
                                    38.5
                                ],
                                [
                                    "Paychex Eib Invoice",
                                    2013,
                                    1259.5
                                ],
                                [
                                    "Paychex Payroll X",
                                    2013,
                                    414710.7
                                ],
                                [
                                    "Paychex Tps Taxes",
                                    2013,
                                    253947.30000000002
                                ],
                                [
                                    "Payx Pia Wc",
                                    2013,
                                    1345.8000000000002
                                ],
                                [
                                    "Peet's Coffee",
                                    2013,
                                    5
                                ],
                                [
                                    "Philz Coffee Mcc",
                                    2013,
                                    38.8
                                ],
                                [
                                    "Pizza Hut",
                                    2013,
                                    29.6
                                ],
                                [
                                    "Pizza My Heart",
                                    2013,
                                    596.1
                                ],
                                [
                                    "Pizzeria Venti",
                                    2013,
                                    84.1
                                ],
                                [
                                    "Poppin Ny",
                                    2013,
                                    29
                                ],
                                [
                                    "Pp Code Ca",
                                    2013,
                                    2
                                ],
                                [
                                    "Principal Financial Group",
                                    2013,
                                    500
                                ],
                                [
                                    "Pur Rtrn Amazon",
                                    2013,
                                    280
                                ],
                                [
                                    "Pur Rtrn Costco",
                                    2013,
                                    39.2
                                ],
                                [
                                    "Pur Rtrn Getquik",
                                    2013,
                                    139.4
                                ],
                                [
                                    "Pur Rtrn Hotels",
                                    2013,
                                    110.3
                                ],
                                [
                                    "Rangoli",
                                    2013,
                                    84.6
                                ],
                                [
                                    "Rangoli Santa Clara",
                                    2013,
                                    6
                                ],
                                [
                                    "Recur Pmt Naturebox",
                                    2013,
                                    180
                                ],
                                [
                                    "Recur Pmt Www",
                                    2013,
                                    75
                                ],
                                [
                                    "Red Hot Chilli",
                                    2013,
                                    339.9
                                ],
                                [
                                    "Reliable Il Mcc",
                                    2013,
                                    85.1
                                ],
                                [
                                    "Safeway",
                                    2013,
                                    1686
                                ],
                                [
                                    "Saffron Indian Bistro",
                                    2013,
                                    128
                                ],
                                [
                                    "San Mateo Lock",
                                    2013,
                                    69.7
                                ],
                                [
                                    "Sequoia at Wellesey",
                                    2013,
                                    6380
                                ],
                                [
                                    "Sf Soup Battery",
                                    2013,
                                    5.9
                                ],
                                [
                                    "Sfo Parking It",
                                    2013,
                                    6
                                ],
                                [
                                    "Shiva Indian Restaur",
                                    2013,
                                    57
                                ],
                                [
                                    "Sonic",
                                    2013,
                                    358.8
                                ],
                                [
                                    "Specialty Cafe Ca",
                                    2013,
                                    962.7
                                ],
                                [
                                    "Starbucks",
                                    2013,
                                    309.3
                                ],
                                [
                                    "Sun Life Financial",
                                    2013,
                                    5150
                                ],
                                [
                                    "Sun Life Finanical",
                                    2013,
                                    1351
                                ],
                                [
                                    "Svcsapps Scali",
                                    2013,
                                    298
                                ],
                                [
                                    "Tamarine Restaurant",
                                    2013,
                                    68.8
                                ],
                                [
                                    "Target",
                                    2013,
                                    31.1
                                ],
                                [
                                    "Tecno Uno",
                                    2013,
                                    93.3
                                ],
                                [
                                    "Tecno Uno Mcc",
                                    2013,
                                    80
                                ],
                                [
                                    "Thai House Restaurant",
                                    2013,
                                    279.59999999999997
                                ],
                                [
                                    "Tonerpirate Com Tx",
                                    2013,
                                    49.4
                                ],
                                [
                                    "USPS",
                                    2013,
                                    52.3
                                ],
                                [
                                    "Viansa Com Ca",
                                    2013,
                                    402.2
                                ],
                                [
                                    "Virgin America",
                                    2013,
                                    563.8
                                ],
                                [
                                    "Waiterdotcom Mcc",
                                    2013,
                                    2861.5
                                ],
                                [
                                    "Waiterdotcom Mountaiiewcaus",
                                    2013,
                                    194.8
                                ],
                                [
                                    "Waiters Whee",
                                    2013,
                                    374.7
                                ],
                                [
                                    "Waiters Wheels Ca",
                                    2013,
                                    4471.999999999999
                                ],
                                [
                                    "Wal-Mart",
                                    2013,
                                    18.6
                                ],
                                [
                                    "WebEx",
                                    2013,
                                    225
                                ],
                                [
                                    "Webmarketi Ca Mcc",
                                    2013,
                                    700
                                ],
                                [
                                    "Wilson Sonsini Goodrich & Rosati",
                                    2013,
                                    236
                                ],
                                [
                                    "Wire Trans Svc",
                                    2013,
                                    46
                                ],
                                [
                                    "Wt F Rbc",
                                    2013,
                                    99999.8
                                ],
                                [
                                    "Wt Fed Pentagon",
                                    2013,
                                    99999.8
                                ],
                                [
                                    "Wt Fed Silicon",
                                    2013,
                                    749999.4
                                ],
                                [
                                    "Wt Ubs Ag",
                                    2013,
                                    2577.9
                                ],
                                [
                                    "Www Linkedin Com",
                                    2013,
                                    525
                                ],
                                [
                                    "Yellow Services Ca",
                                    2013,
                                    25.6
                                ],
                                [
                                    "Youtube",
                                    2013,
                                    40
                                ]
                            ],
                            "uniques": {
                                "0": [
                                    "\"Jewell & Associates, PC\"",
                                    "\"The Brenner Group, Inc.\"",
                                    "\"Thomas International USA Inc,\"",
                                    "\"White Summers Caffee & James, LLP\"",
                                    "ACE Parking",
                                    "AT&T",
                                    "Account Maintenance Fee",
                                    "Adobe Systems",
                                    "Agi Abic Ins",
                                    "Alana Cafe",
                                    "Amarin Thai Cuisine",
                                    "Amazon",
                                    "Amicis East Coast",
                                    "Amitoxford Ca Mcc",
                                    "Ampco Parking",
                                    "Anthem Blue Cross",
                                    "Apple",
                                    "Atlassian Pty Ltd",
                                    "Bangkok Bay Thai",
                                    "Best Buy",
                                    "CT Corporation",
                                    "Ca Secretary State",
                                    "California Department of Corporations",
                                    "Caltrain",
                                    "Chipotle",
                                    "ClickAway.com",
                                    "Client Analysis Srvc",
                                    "Comcast",
                                    "Conservice",
                                    "Costco",
                                    "Curry Up Now",
                                    "Customer Satisfaction",
                                    "Darryl Warren",
                                    "Delaware Corp De",
                                    "Deposit Made In",
                                    "Discountmugs Com Can",
                                    "Dri Jetbrains Element",
                                    "Dri Jetbrains Mn",
                                    "Ds Waters Standard",
                                    "East West Administrators",
                                    "East West Adminstrator",
                                    "East West Adminstrators",
                                    "Eb Pinnacle What",
                                    "Ellisonsyst Ny",
                                    "Erik Deli Cafe",
                                    "Excess Activity Fee",
                                    "Expensify Ca",
                                    "Federal Express",
                                    "Franchise tax Board",
                                    "Gelato Classico Mcc",
                                    "Getquik Com Ca",
                                    "Gianlui Pizzuti",
                                    "Go Dry Erase",
                                    "Google",
                                    "Gunderson Dettmer",
                                    "Harvard Investment Company",
                                    "Homestead Mcc",
                                    "Hotels.com",
                                    "IKEA",
                                    "Ideapaint Ma",
                                    "Interest",
                                    "Intuit",
                                    "Iron Systems",
                                    "Iron Systems Ca",
                                    "Jj Wj Llc",
                                    "Jonathan Moreira",
                                    "Law Office of Ning Gan",
                                    "Madisonseat Ny",
                                    "Marshall Choi",
                                    "Mike McMillin",
                                    "Nespresso Usa Ny",
                                    "New York Pizza",
                                    "Newegg",
                                    "Newton Software",
                                    "Nicholas Swanson",
                                    "Office Depot",
                                    "PG&E",
                                    "Palomo Archery",
                                    "Paradies",
                                    "Paychex Eib Invoice",
                                    "Paychex Payroll X",
                                    "Paychex Tps Taxes",
                                    "Payx Pia Wc",
                                    "Peet's Coffee",
                                    "Philz Coffee Mcc",
                                    "Pizza Hut",
                                    "Pizza My Heart",
                                    "Pizzeria Venti",
                                    "Poppin Ny",
                                    "Pp Code Ca",
                                    "Principal Financial Group",
                                    "Pur Rtrn Amazon",
                                    "Pur Rtrn Costco",
                                    "Pur Rtrn Getquik",
                                    "Pur Rtrn Hotels",
                                    "Rangoli",
                                    "Rangoli Santa Clara",
                                    "Recur Pmt Naturebox",
                                    "Recur Pmt Www",
                                    "Red Hot Chilli",
                                    "Reliable Il Mcc",
                                    "Safeway",
                                    "Saffron Indian Bistro",
                                    "San Mateo Lock",
                                    "Sequoia at Wellesey",
                                    "Sf Soup Battery",
                                    "Sfo Parking It",
                                    "Shiva Indian Restaur",
                                    "Sonic",
                                    "Specialty Cafe Ca",
                                    "Starbucks",
                                    "Sun Life Financial",
                                    "Sun Life Finanical",
                                    "Svcsapps Scali",
                                    "Tamarine Restaurant",
                                    "Target",
                                    "Tecno Uno",
                                    "Tecno Uno Mcc",
                                    "Thai House Restaurant",
                                    "Tonerpirate Com Tx",
                                    "USPS",
                                    "Viansa Com Ca",
                                    "Virgin America",
                                    "Waiterdotcom Mcc",
                                    "Waiterdotcom Mountaiiewcaus",
                                    "Waiters Whee",
                                    "Waiters Wheels Ca",
                                    "Wal-Mart",
                                    "WebEx",
                                    "Webmarketi Ca Mcc",
                                    "Wilson Sonsini Goodrich & Rosati",
                                    "Wire Trans Svc",
                                    "Wt F Rbc",
                                    "Wt Fed Pentagon",
                                    "Wt Fed Silicon",
                                    "Wt Ubs Ag",
                                    "Www Linkedin Com",
                                    "Yellow Services Ca",
                                    "Youtube"
                                ],
                                "1": [
                                    2013
                                ]
                            },
                            "completionRatio": 0,
                            "currentOffset": 0,
                            "isLastBatch": true,
                            "currentBatchSize": 500000
                        }
                    }
                },
                "9d552576-2f43-46d7-a0c0-862e02889032": {
                    "dataSets": {
                        "CHART": {
                            "data": [
                                [
                                    2013,
                                    "\"Jewell & Associates, PC\"",
                                    1000
                                ],
                                [
                                    2013,
                                    "\"The Brenner Group, Inc.\"",
                                    5750
                                ],
                                [
                                    2013,
                                    "\"Thomas International USA Inc,\"",
                                    900
                                ],
                                [
                                    2013,
                                    "\"White Summers Caffee & James, LLP\"",
                                    245.4
                                ],
                                [
                                    2013,
                                    "ACE Parking",
                                    1
                                ],
                                [
                                    2013,
                                    "AT&T",
                                    1012.5
                                ],
                                [
                                    2013,
                                    "Account Maintenance Fee",
                                    20
                                ],
                                [
                                    2013,
                                    "Adobe Systems",
                                    20
                                ],
                                [
                                    2013,
                                    "Agi Abic Ins",
                                    20.1
                                ],
                                [
                                    2013,
                                    "Alana Cafe",
                                    20
                                ],
                                [
                                    2013,
                                    "Amarin Thai Cuisine",
                                    33.3
                                ],
                                [
                                    2013,
                                    "Amazon",
                                    7395.599999999999
                                ],
                                [
                                    2013,
                                    "Amicis East Coast",
                                    542
                                ],
                                [
                                    2013,
                                    "Amitoxford Ca Mcc",
                                    74.7
                                ],
                                [
                                    2013,
                                    "Ampco Parking",
                                    8
                                ],
                                [
                                    2013,
                                    "Anthem Blue Cross",
                                    34457
                                ],
                                [
                                    2013,
                                    "Apple",
                                    2840.8
                                ],
                                [
                                    2013,
                                    "Atlassian Pty Ltd",
                                    84
                                ],
                                [
                                    2013,
                                    "Bangkok Bay Thai",
                                    12.1
                                ],
                                [
                                    2013,
                                    "Best Buy",
                                    651
                                ],
                                [
                                    2013,
                                    "CT Corporation",
                                    365
                                ],
                                [
                                    2013,
                                    "Ca Secretary State",
                                    25
                                ],
                                [
                                    2013,
                                    "California Department of Corporations",
                                    959
                                ],
                                [
                                    2013,
                                    "Caltrain",
                                    18
                                ],
                                [
                                    2013,
                                    "Chipotle",
                                    1018.8
                                ],
                                [
                                    2013,
                                    "ClickAway.com",
                                    607.6
                                ],
                                [
                                    2013,
                                    "Client Analysis Srvc",
                                    35
                                ],
                                [
                                    2013,
                                    "Comcast",
                                    170.5
                                ],
                                [
                                    2013,
                                    "Conservice",
                                    440.70000000000005
                                ],
                                [
                                    2013,
                                    "Costco",
                                    1582.6999999999998
                                ],
                                [
                                    2013,
                                    "Curry Up Now",
                                    266.20000000000005
                                ],
                                [
                                    2013,
                                    "Customer Satisfaction",
                                    35
                                ],
                                [
                                    2013,
                                    "Darryl Warren",
                                    219.8
                                ],
                                [
                                    2013,
                                    "Delaware Corp De",
                                    2511.5
                                ],
                                [
                                    2013,
                                    "Deposit Made In",
                                    416.6
                                ],
                                [
                                    2013,
                                    "Discountmugs Com Can",
                                    346
                                ],
                                [
                                    2013,
                                    "Dri Jetbrains Element",
                                    49
                                ],
                                [
                                    2013,
                                    "Dri Jetbrains Mn",
                                    49
                                ],
                                [
                                    2013,
                                    "Ds Waters Standard",
                                    240.1
                                ],
                                [
                                    2013,
                                    "East West Administrators",
                                    250
                                ],
                                [
                                    2013,
                                    "East West Adminstrator",
                                    375
                                ],
                                [
                                    2013,
                                    "East West Adminstrators",
                                    3140.1000000000004
                                ],
                                [
                                    2013,
                                    "Eb Pinnacle What",
                                    53.5
                                ],
                                [
                                    2013,
                                    "Ellisonsyst Ny",
                                    22.9
                                ],
                                [
                                    2013,
                                    "Erik Deli Cafe",
                                    248.9
                                ],
                                [
                                    2013,
                                    "Excess Activity Fee",
                                    10
                                ],
                                [
                                    2013,
                                    "Expensify Ca",
                                    20
                                ],
                                [
                                    2013,
                                    "Federal Express",
                                    117
                                ],
                                [
                                    2013,
                                    "Franchise tax Board",
                                    800
                                ],
                                [
                                    2013,
                                    "Gelato Classico Mcc",
                                    61
                                ],
                                [
                                    2013,
                                    "Getquik Com Ca",
                                    1772.8000000000002
                                ],
                                [
                                    2013,
                                    "Gianlui Pizzuti",
                                    187.5
                                ],
                                [
                                    2013,
                                    "Go Dry Erase",
                                    40.4
                                ],
                                [
                                    2013,
                                    "Google",
                                    65
                                ],
                                [
                                    2013,
                                    "Gunderson Dettmer",
                                    50064.1
                                ],
                                [
                                    2013,
                                    "Harvard Investment Company",
                                    69256.9
                                ],
                                [
                                    2013,
                                    "Homestead Mcc",
                                    2155.4
                                ],
                                [
                                    2013,
                                    "Hotels.com",
                                    2584.8
                                ],
                                [
                                    2013,
                                    "IKEA",
                                    601.5999999999999
                                ],
                                [
                                    2013,
                                    "Ideapaint Ma",
                                    93.89999999999999
                                ],
                                [
                                    2013,
                                    "Interest",
                                    4938.700000000001
                                ],
                                [
                                    2013,
                                    "Intuit",
                                    160
                                ],
                                [
                                    2013,
                                    "Iron Systems",
                                    120.7
                                ],
                                [
                                    2013,
                                    "Iron Systems Ca",
                                    1414.7
                                ],
                                [
                                    2013,
                                    "Jj Wj Llc",
                                    1029
                                ],
                                [
                                    2013,
                                    "Jonathan Moreira",
                                    3520.1
                                ],
                                [
                                    2013,
                                    "Law Office of Ning Gan",
                                    12945
                                ],
                                [
                                    2013,
                                    "Madisonseat Ny",
                                    625
                                ],
                                [
                                    2013,
                                    "Marshall Choi",
                                    5832.5
                                ],
                                [
                                    2013,
                                    "Mike McMillin",
                                    80
                                ],
                                [
                                    2013,
                                    "Nespresso Usa Ny",
                                    69.9
                                ],
                                [
                                    2013,
                                    "New York Pizza",
                                    70.3
                                ],
                                [
                                    2013,
                                    "Newegg",
                                    4162.099999999999
                                ],
                                [
                                    2013,
                                    "Newton Software",
                                    1245
                                ],
                                [
                                    2013,
                                    "Nicholas Swanson",
                                    3237.2
                                ],
                                [
                                    2013,
                                    "Office Depot",
                                    109
                                ],
                                [
                                    2013,
                                    "PG&E",
                                    192.8
                                ],
                                [
                                    2013,
                                    "Palomo Archery",
                                    445
                                ],
                                [
                                    2013,
                                    "Paradies",
                                    38.5
                                ],
                                [
                                    2013,
                                    "Paychex Eib Invoice",
                                    1259.5
                                ],
                                [
                                    2013,
                                    "Paychex Payroll X",
                                    414710.7
                                ],
                                [
                                    2013,
                                    "Paychex Tps Taxes",
                                    253947.30000000002
                                ],
                                [
                                    2013,
                                    "Payx Pia Wc",
                                    1345.8000000000002
                                ],
                                [
                                    2013,
                                    "Peet's Coffee",
                                    5
                                ],
                                [
                                    2013,
                                    "Philz Coffee Mcc",
                                    38.8
                                ],
                                [
                                    2013,
                                    "Pizza Hut",
                                    29.6
                                ],
                                [
                                    2013,
                                    "Pizza My Heart",
                                    596.1
                                ],
                                [
                                    2013,
                                    "Pizzeria Venti",
                                    84.1
                                ],
                                [
                                    2013,
                                    "Poppin Ny",
                                    29
                                ],
                                [
                                    2013,
                                    "Pp Code Ca",
                                    2
                                ],
                                [
                                    2013,
                                    "Principal Financial Group",
                                    500
                                ],
                                [
                                    2013,
                                    "Pur Rtrn Amazon",
                                    280
                                ],
                                [
                                    2013,
                                    "Pur Rtrn Costco",
                                    39.2
                                ],
                                [
                                    2013,
                                    "Pur Rtrn Getquik",
                                    139.4
                                ],
                                [
                                    2013,
                                    "Pur Rtrn Hotels",
                                    110.3
                                ],
                                [
                                    2013,
                                    "Rangoli",
                                    84.6
                                ],
                                [
                                    2013,
                                    "Rangoli Santa Clara",
                                    6
                                ],
                                [
                                    2013,
                                    "Recur Pmt Naturebox",
                                    180
                                ],
                                [
                                    2013,
                                    "Recur Pmt Www",
                                    75
                                ],
                                [
                                    2013,
                                    "Red Hot Chilli",
                                    339.9
                                ],
                                [
                                    2013,
                                    "Reliable Il Mcc",
                                    85.1
                                ],
                                [
                                    2013,
                                    "Safeway",
                                    1686
                                ],
                                [
                                    2013,
                                    "Saffron Indian Bistro",
                                    128
                                ],
                                [
                                    2013,
                                    "San Mateo Lock",
                                    69.7
                                ],
                                [
                                    2013,
                                    "Sequoia at Wellesey",
                                    6380
                                ],
                                [
                                    2013,
                                    "Sf Soup Battery",
                                    5.9
                                ],
                                [
                                    2013,
                                    "Sfo Parking It",
                                    6
                                ],
                                [
                                    2013,
                                    "Shiva Indian Restaur",
                                    57
                                ],
                                [
                                    2013,
                                    "Sonic",
                                    358.8
                                ],
                                [
                                    2013,
                                    "Specialty Cafe Ca",
                                    962.7
                                ],
                                [
                                    2013,
                                    "Starbucks",
                                    309.3
                                ],
                                [
                                    2013,
                                    "Sun Life Financial",
                                    5150
                                ],
                                [
                                    2013,
                                    "Sun Life Finanical",
                                    1351
                                ],
                                [
                                    2013,
                                    "Svcsapps Scali",
                                    298
                                ],
                                [
                                    2013,
                                    "Tamarine Restaurant",
                                    68.8
                                ],
                                [
                                    2013,
                                    "Target",
                                    31.1
                                ],
                                [
                                    2013,
                                    "Tecno Uno",
                                    93.3
                                ],
                                [
                                    2013,
                                    "Tecno Uno Mcc",
                                    80
                                ],
                                [
                                    2013,
                                    "Thai House Restaurant",
                                    279.59999999999997
                                ],
                                [
                                    2013,
                                    "Tonerpirate Com Tx",
                                    49.4
                                ],
                                [
                                    2013,
                                    "USPS",
                                    52.3
                                ],
                                [
                                    2013,
                                    "Viansa Com Ca",
                                    402.2
                                ],
                                [
                                    2013,
                                    "Virgin America",
                                    563.8
                                ],
                                [
                                    2013,
                                    "Waiterdotcom Mcc",
                                    2861.5
                                ],
                                [
                                    2013,
                                    "Waiterdotcom Mountaiiewcaus",
                                    194.8
                                ],
                                [
                                    2013,
                                    "Waiters Whee",
                                    374.7
                                ],
                                [
                                    2013,
                                    "Waiters Wheels Ca",
                                    4471.999999999999
                                ],
                                [
                                    2013,
                                    "Wal-Mart",
                                    18.6
                                ],
                                [
                                    2013,
                                    "WebEx",
                                    225
                                ],
                                [
                                    2013,
                                    "Webmarketi Ca Mcc",
                                    700
                                ],
                                [
                                    2013,
                                    "Wilson Sonsini Goodrich & Rosati",
                                    236
                                ],
                                [
                                    2013,
                                    "Wire Trans Svc",
                                    46
                                ],
                                [
                                    2013,
                                    "Wt F Rbc",
                                    99999.8
                                ],
                                [
                                    2013,
                                    "Wt Fed Pentagon",
                                    99999.8
                                ],
                                [
                                    2013,
                                    "Wt Fed Silicon",
                                    749999.4
                                ],
                                [
                                    2013,
                                    "Wt Ubs Ag",
                                    2577.9
                                ],
                                [
                                    2013,
                                    "Www Linkedin Com",
                                    525
                                ],
                                [
                                    2013,
                                    "Yellow Services Ca",
                                    25.6
                                ],
                                [
                                    2013,
                                    "Youtube",
                                    40
                                ]
                            ],
                            "uniques": {
                                "0": [
                                    2013
                                ],
                                "1": [
                                    "\"Jewell & Associates, PC\"",
                                    "\"The Brenner Group, Inc.\"",
                                    "\"Thomas International USA Inc,\"",
                                    "\"White Summers Caffee & James, LLP\"",
                                    "ACE Parking",
                                    "AT&T",
                                    "Account Maintenance Fee",
                                    "Adobe Systems",
                                    "Agi Abic Ins",
                                    "Alana Cafe",
                                    "Amarin Thai Cuisine",
                                    "Amazon",
                                    "Amicis East Coast",
                                    "Amitoxford Ca Mcc",
                                    "Ampco Parking",
                                    "Anthem Blue Cross",
                                    "Apple",
                                    "Atlassian Pty Ltd",
                                    "Bangkok Bay Thai",
                                    "Best Buy",
                                    "CT Corporation",
                                    "Ca Secretary State",
                                    "California Department of Corporations",
                                    "Caltrain",
                                    "Chipotle",
                                    "ClickAway.com",
                                    "Client Analysis Srvc",
                                    "Comcast",
                                    "Conservice",
                                    "Costco",
                                    "Curry Up Now",
                                    "Customer Satisfaction",
                                    "Darryl Warren",
                                    "Delaware Corp De",
                                    "Deposit Made In",
                                    "Discountmugs Com Can",
                                    "Dri Jetbrains Element",
                                    "Dri Jetbrains Mn",
                                    "Ds Waters Standard",
                                    "East West Administrators",
                                    "East West Adminstrator",
                                    "East West Adminstrators",
                                    "Eb Pinnacle What",
                                    "Ellisonsyst Ny",
                                    "Erik Deli Cafe",
                                    "Excess Activity Fee",
                                    "Expensify Ca",
                                    "Federal Express",
                                    "Franchise tax Board",
                                    "Gelato Classico Mcc",
                                    "Getquik Com Ca",
                                    "Gianlui Pizzuti",
                                    "Go Dry Erase",
                                    "Google",
                                    "Gunderson Dettmer",
                                    "Harvard Investment Company",
                                    "Homestead Mcc",
                                    "Hotels.com",
                                    "IKEA",
                                    "Ideapaint Ma",
                                    "Interest",
                                    "Intuit",
                                    "Iron Systems",
                                    "Iron Systems Ca",
                                    "Jj Wj Llc",
                                    "Jonathan Moreira",
                                    "Law Office of Ning Gan",
                                    "Madisonseat Ny",
                                    "Marshall Choi",
                                    "Mike McMillin",
                                    "Nespresso Usa Ny",
                                    "New York Pizza",
                                    "Newegg",
                                    "Newton Software",
                                    "Nicholas Swanson",
                                    "Office Depot",
                                    "PG&E",
                                    "Palomo Archery",
                                    "Paradies",
                                    "Paychex Eib Invoice",
                                    "Paychex Payroll X",
                                    "Paychex Tps Taxes",
                                    "Payx Pia Wc",
                                    "Peet's Coffee",
                                    "Philz Coffee Mcc",
                                    "Pizza Hut",
                                    "Pizza My Heart",
                                    "Pizzeria Venti",
                                    "Poppin Ny",
                                    "Pp Code Ca",
                                    "Principal Financial Group",
                                    "Pur Rtrn Amazon",
                                    "Pur Rtrn Costco",
                                    "Pur Rtrn Getquik",
                                    "Pur Rtrn Hotels",
                                    "Rangoli",
                                    "Rangoli Santa Clara",
                                    "Recur Pmt Naturebox",
                                    "Recur Pmt Www",
                                    "Red Hot Chilli",
                                    "Reliable Il Mcc",
                                    "Safeway",
                                    "Saffron Indian Bistro",
                                    "San Mateo Lock",
                                    "Sequoia at Wellesey",
                                    "Sf Soup Battery",
                                    "Sfo Parking It",
                                    "Shiva Indian Restaur",
                                    "Sonic",
                                    "Specialty Cafe Ca",
                                    "Starbucks",
                                    "Sun Life Financial",
                                    "Sun Life Finanical",
                                    "Svcsapps Scali",
                                    "Tamarine Restaurant",
                                    "Target",
                                    "Tecno Uno",
                                    "Tecno Uno Mcc",
                                    "Thai House Restaurant",
                                    "Tonerpirate Com Tx",
                                    "USPS",
                                    "Viansa Com Ca",
                                    "Virgin America",
                                    "Waiterdotcom Mcc",
                                    "Waiterdotcom Mountaiiewcaus",
                                    "Waiters Whee",
                                    "Waiters Wheels Ca",
                                    "Wal-Mart",
                                    "WebEx",
                                    "Webmarketi Ca Mcc",
                                    "Wilson Sonsini Goodrich & Rosati",
                                    "Wire Trans Svc",
                                    "Wt F Rbc",
                                    "Wt Fed Pentagon",
                                    "Wt Fed Silicon",
                                    "Wt Ubs Ag",
                                    "Www Linkedin Com",
                                    "Yellow Services Ca",
                                    "Youtube"
                                ]
                            },
                            "completionRatio": 0,
                            "currentOffset": 0,
                            "isLastBatch": true,
                            "currentBatchSize": 500000
                        }
                    }
                }
            }
        }
    }
};