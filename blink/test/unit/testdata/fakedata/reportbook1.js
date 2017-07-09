blink.app.fakeData.reportbook1 =
{
    "reportBookMetadata": {
        "reportContent": {
            "sheets": [
                {
                    "sheetType": "QUESTION",
                    "sheetContent": {
                        "sheetContentType": "QUESTION",
                        "filter": {
                            "filterContent": {
                                "type": "SIMPLE",
                                "rows": [
                                    {
                                        "column": {
                                            "id": "68b814a8-2389-498e-8dec-8ff0fae22809",
                                            "name": "LO_ORDTOTALPRICE",
                                            "isPrivate": false
                                        },
                                        "oper": "GT",
                                        "values": [
                                            {
                                                "selected": true,
                                                "typedKeyValue": 10
                                            }
                                        ]
                                    }
                                ]
                            },
                            "header": {
                                "id": "1cec4704-c714-4df1-8ad9-c3060a28e279",
                                "name": "Filter null",
                                "generationNum": 0,
                                "isPrivate": true
                            }
                        },
                        "visualizations": [
                            {
                                "vizContent": {
                                    "vizType": "TABLE",
                                    "columns": [
                                        {
                                            "column": {
                                                "id": "3aa53aa7-d131-46ec-a487-c9a0f67fa6bb",
                                                "name": "LO_LINENUMBER",
                                                "isPrivate": false
                                            },
                                            "aggrTypeOverride": "NONE",
                                            "typeOverride": "ATTRIBUTE",
                                            "groupBy": true
                                        },
                                        {
                                            "column": {
                                                "id": "d8cd8978-bd01-4d57-910d-4781e8b33123",
                                                "name": "LO_REVENUE",
                                                "isPrivate": false
                                            },
                                            "aggrTypeOverride": "NONE",
                                            "typeOverride": "MEASURE"
                                        },
                                        {
                                            "column": {
                                                "id": "68b814a8-2389-498e-8dec-8ff0fae22809",
                                                "name": "LO_ORDTOTALPRICE",
                                                "isPrivate": false
                                            }
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
                                    "id": "c0c3424e-968e-4297-98d5-0d3ae805904d",
                                    "name": "Table Viz revenue by linenumber for ordtotalprice \u003e 10",
                                    "generationNum": 0,
                                    "isPrivate": true
                                }
                            },
                            {
                                "vizContent": {
                                    "vizType": "CHART",
                                    "chartType": "SCATTER",
                                    "series": {
                                        "columns": [
                                            {
                                                "column": {
                                                    "id": "3aa53aa7-d131-46ec-a487-c9a0f67fa6bb",
                                                    "name": "LO_LINENUMBER",
                                                    "isPrivate": false
                                                },
                                                "aggrTypeOverride": "NONE",
                                                "typeOverride": "ATTRIBUTE",
                                                "groupBy": true
                                            }
                                        ]
                                    },
                                    "values": {
                                        "columns": [
                                            {
                                                "column": {
                                                    "id": "d8cd8978-bd01-4d57-910d-4781e8b33123",
                                                    "name": "LO_REVENUE",
                                                    "isPrivate": false
                                                },
                                                "aggrTypeOverride": "NONE",
                                                "typeOverride": "MEASURE"
                                            },
                                            {
                                                "column": {
                                                    "id": "68b814a8-2389-498e-8dec-8ff0fae22809",
                                                    "name": "LO_ORDTOTALPRICE",
                                                    "isPrivate": false
                                                }
                                            }
                                        ]
                                    },
                                    "title": {
                                        "value": {
                                            "text": "Chart 1"
                                        }
                                    }
                                },
                                "header": {
                                    "id": "62be0d6c-c015-4e6c-a706-a97d608d4456",
                                    "name": "Chart Viz revenue by linenumber for ordtotalprice \u003e 10",
                                    "generationNum": 0,
                                    "isPrivate": true
                                }
                            }
                        ],
                        "vizContainer": {
                            "vizType": "CONTAINER",
                            "flow": "HORIZONTAL",
                            "vizList": [
                                {
                                    "vizType": "VIZ_REF",
                                    "id": "c0c3424e-968e-4297-98d5-0d3ae805904d"
                                },
                                {
                                    "vizType": "VIZ_REF",
                                    "id": "62be0d6c-c015-4e6c-a706-a97d608d4456"
                                }
                            ]
                        }
                    },
                    "header": {
                        "id": "e60a3710-8d05-4839-9d11-d4041a26f134",
                        "name": "Answer Sheet revenue by linenumber for ordtotalprice \u003e 10",
                        "generationNum": 0,
                        "isPrivate": true,
                        "owner":"fea747f3-ee26-44fd-8f83-b0706665c3c6"
                    }
                }
            ],
            "resolvedIds": {
                "68b814a8-2389-498e-8dec-8ff0fae22809": {
                    "dataType": "INT64",
                    "type": "MEASURE",
                    "defaultAggrType": "SUM",
                    "isDerived": false,
                    "physicalColumnGUID": "77c43672-ba7f-4151-a563-80e6523a19b4",
                    "header": {
                        "id": "68b814a8-2389-498e-8dec-8ff0fae22809",
                        "name": "LO_ORDTOTALPRICE",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053901621,
                        "modified": 1354053901621,
                        "generationNum": 1,
                        "isPrivate": false
                    }
                },
                "3aa53aa7-d131-46ec-a487-c9a0f67fa6bb": {
                    "dataType": "INT64",
                    "type": "ATTRIBUTE",
                    "defaultAggrType": "NONE",
                    "isDerived": false,
                    "physicalColumnGUID": "4b605078-58d3-4593-b869-773ce3d8fea0",
                    "header": {
                        "id": "3aa53aa7-d131-46ec-a487-c9a0f67fa6bb",
                        "name": "LO_LINENUMBER",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053901590,
                        "modified": 1354053901590,
                        "generationNum": 1,
                        "isPrivate": false
                    }
                },
                "d8cd8978-bd01-4d57-910d-4781e8b33123": {
                    "dataType": "INT64",
                    "type": "MEASURE",
                    "defaultAggrType": "SUM",
                    "isDerived": false,
                    "physicalColumnGUID": "bed02700-f894-423c-b7ac-c2d41e42de93",
                    "header": {
                        "id": "d8cd8978-bd01-4d57-910d-4781e8b33123",
                        "name": "LO_REVENUE",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053901630,
                        "modified": 1354053901630,
                        "generationNum": 1,
                        "isPrivate": false
                    }
                }
            }
        },
        "header": {
            "id": "fea747f3-ee26-44fd-8f83-b0706665c3c6",
            "name": "revenue by linenumber for ordtotalprice \u003e 10",
            "generationNum": 0,
            "isPrivate": true
        }
    },
    "reportBookData": {
        "e60a3710-8d05-4839-9d11-d4041a26f134": {
            "vizData": {
                "c0c3424e-968e-4297-98d5-0d3ae805904d": {
                    "dataSets": {
                        "TABLE": {
                            "data": [
                                [
                                    1,
                                    4399798880,
                                    18782228186
                                ],
                                [
                                    2,
                                    3842550308,
                                    18140322688
                                ],
                                [
                                    3,
                                    3197783738,
                                    16940266494
                                ],
                                [
                                    4,
                                    2604089918,
                                    15012853658
                                ],
                                [
                                    5,
                                    1942051194,
                                    12259760018
                                ],
                                [
                                    6,
                                    1361452579,
                                    9110282198
                                ],
                                [
                                    7,
                                    703495818,
                                    5312800229
                                ]
                            ],
                            "uniques": {
                                "0": [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5,
                                    6,
                                    7
                                ]
                            }
                        }
                    }
                },
                "62be0d6c-c015-4e6c-a706-a97d608d4456": {
                    "dataSets": {
                        "CHART": {
                            "data": [
                                [
                                    1,
                                    4399798880,
                                    18782228186
                                ],
                                [
                                    2,
                                    3842550308,
                                    18140322688
                                ],
                                [
                                    3,
                                    3197783738,
                                    16940266494
                                ],
                                [
                                    4,
                                    2604089918,
                                    15012853658
                                ],
                                [
                                    5,
                                    1942051194,
                                    12259760018
                                ],
                                [
                                    6,
                                    1361452579,
                                    9110282198
                                ],
                                [
                                    7,
                                    703495818,
                                    5312800229
                                ]
                            ],
                            "uniques": {
                                "0": [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5,
                                    6,
                                    7
                                ]
                            }
                        }
                    }
                }
            }
        }
    },
    "debugInfo": {
        "members": {
            "serviceInvocTime(ms)": 53,
            "dataInfo": [
                {
                    "e60a3710-8d05-4839-9d11-d4041a26f134": [
                        {
                            "c0c3424e-968e-4297-98d5-0d3ae805904d": [
                                {
                                    "TABLE": {
                                        "rowCount": 7,
                                        "columnCount": 3,
                                        "uniquesCount": [
                                            {
                                                "0": 7
                                            }
                                        ],
                                        "queryTime(ms)": 3
                                    }
                                }
                            ]
                        },
                        {
                            "62be0d6c-c015-4e6c-a706-a97d608d4456": [
                                {
                                    "CHART": {
                                        "rowCount": 7,
                                        "columnCount": 3,
                                        "uniquesCount": [
                                            {
                                                "0": 7
                                            }
                                        ],
                                        "queryTime(ms)": 0
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "queryTime(ms)": 11
                }
            ]
        }
    }
};
