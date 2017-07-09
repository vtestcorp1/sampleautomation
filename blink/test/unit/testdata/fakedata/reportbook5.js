blink.app.fakeData.reportbook5 =
{
    "reportBookMetadata": {
        "reportContent": {
            "filter": {
                "filterContent": {
                    "type": "SIMPLE",
                    "rows": [
                        {
                            "column": {
                                "id": "ab1bf3da-1478-4786-b666-39ea9f930152",
                                "name": "P_CATEGORY",
                                "isPrivate": false
                            },
                            "oper": "EQ",
                            "values": [
                                {
                                    "key": "MFGR#12",
                                    "display": "MFGR#12",
                                    "selected": true
                                },
                                {
                                    "key": "MFGR#13",
                                    "display": "MFGR#13",
                                    "selected": false
                                },
                                {
                                    "key": "MFGR#14",
                                    "display": "MFGR#14",
                                    "selected": false
                                }
                            ]
                        },
                        {
                            "column": {
                                "id": "0f7361ca-de08-43b8-8170-a759d92ec654",
                                "name": "S_REGION",
                                "isPrivate": false
                            },
                            "oper": "EQ",
                            "values": [
                                {
                                    "key": "AFRICA",
                                    "display": "AFRICA",
                                    "selected": false
                                },
                                {
                                    "key": "AMERICA",
                                    "display": "AMERICA",
                                    "selected": true
                                },
                                {
                                    "key": "ASIA",
                                    "display": "ASIA",
                                    "selected": false
                                }
                            ]
                        }
                    ]
                },
                "header": {
                    "id": "589448ec-8697-46f3-bbcd-653a74a222ef",
                    "name": "Annual Brand Revenue - Filter",
                    "description": "testing hbase write and read",
                    "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                    "created": 1354006444616,
                    "modified": 1354006445722,
                    "generationNum": 1,
                    "isPrivate": true
                }
            },
            "sheets": [
                {
                    "sheetType": "QUESTION",
                    "sheetContent": {
                        "sheetContentType": "QUESTION",
                        "question": {
                            "text": "Revenue by Brand for Category MFGR#12 for Region AMERICA"
                        },
                        "visualizations": [
                            {
                                "vizContent": {
                                    "vizType": "TABLE",
                                    "columns": [
                                        {
                                            "column": {
                                                "id": "f1f13666-15fa-48ed-bf9f-c6a3f42f25ea",
                                                "name": "D_YEAR",
                                                "isPrivate": false
                                            }
                                        },
                                        {
                                            "column": {
                                                "id": "c56c023c-f3b0-43c6-8de2-ed8c25696542",
                                                "name": "P_BRAND1",
                                                "isPrivate": false
                                            }
                                        },
                                        {
                                            "column": {
                                                "id": "d8cd8978-bd01-4d57-910d-4781e8b33123",
                                                "name": "LO_REVENUE",
                                                "isPrivate": false
                                            },
                                            "formatId": "f1"
                                        }
                                    ],
                                    "title": {
                                        "value": {
                                            "text": "Annual Revenue"
                                        }
                                    },
                                    "subTitle": {
                                        "value": {
                                            "text": "by Brand"
                                        }
                                    }
                                },
                                "header": {
                                    "id": "6e297d32-0b84-4866-b85e-9f8a57a1d7e9",
                                    "name": "Annual Brand Revenue - Table",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1354006444616,
                                    "modified": 1354006445722,
                                    "generationNum": 1,
                                    "isPrivate": true
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
                                                    "id": "c56c023c-f3b0-43c6-8de2-ed8c25696542",
                                                    "name": "P_BRAND1",
                                                    "isPrivate": false
                                                }
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
                                                }
                                            }
                                        ]
                                    },
                                    "title": {
                                        "value": {
                                            "text": "Revenue Distribution"
                                        }
                                    },
                                    "subTitle": {
                                        "value": {
                                            "text": "by Brand"
                                        }
                                    }
                                },
                                "header": {
                                    "id": "0bfe0912-5b49-4089-afa5-e18bc3b8cfdf",
                                    "name": "Annual Brand Revenue - Column Chart",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1354006444616,
                                    "modified": 1354006445722,
                                    "generationNum": 1,
                                    "isPrivate": true
                                }
                            },
                            {
                                "vizContent": {
                                    "vizType": "CHART",
                                    "chartType": "LINE",
                                    "categories": {
                                        "columns": [
                                            {
                                                "column": {
                                                    "id": "c56c023c-f3b0-43c6-8de2-ed8c25696542",
                                                    "name": "P_BRAND1",
                                                    "isPrivate": false
                                                }
                                            }
                                        ]
                                    },
                                    "series": {
                                        "columns": [
                                            {
                                                "column": {
                                                    "id": "f1f13666-15fa-48ed-bf9f-c6a3f42f25ea",
                                                    "name": "D_YEAR",
                                                    "isPrivate": false
                                                }
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
                                                }
                                            }
                                        ]
                                    },
                                    "title": {
                                        "value": {
                                            "text": "Annual Revenue Distribution"
                                        }
                                    },
                                    "subTitle": {
                                        "value": {
                                            "text": "by Brand"
                                        }
                                    }
                                },
                                "header": {
                                    "id": "920632bb-7376-42cb-a63b-756799c20b7e",
                                    "name": "Annual Brand Revenue - Line Chart",
                                    "author": "4391d676-2dd8-4248-b6db-d973811f0122",
                                    "created": 1354006444616,
                                    "modified": 1354006445722,
                                    "generationNum": 1,
                                    "isPrivate": true
                                }
                            }
                        ],
                        "vizContainer": {
                            "vizType": "CONTAINER",
                            "flow": "VERTICAL",
                            "vizList": [
                                {
                                    "vizType": "VIZ_REF",
                                    "id": "920632bb-7376-42cb-a63b-756799c20b7e"
                                },
                                {
                                    "vizType": "CONTAINER",
                                    "flow": "HORIZONTAL",
                                    "vizList": [
                                        {
                                            "vizType": "VIZ_REF",
                                            "id": "0bfe0912-5b49-4089-afa5-e18bc3b8cfdf"
                                        },
                                        {
                                            "vizType": "VIZ_REF",
                                            "id": "6e297d32-0b84-4866-b85e-9f8a57a1d7e9"
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    "header": {
                        "id": "56f36a81-1eac-4462-9c9f-dd8c5a8da5c3",
                        "name": "Brand Revenue Trend",
                        "description": "Yearly Revenue analysis by Brand for specific Category and Region; Nested Visualizations",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354006444616,
                        "modified": 1354006445722,
                        "generationNum": 0,
                        "isPrivate": false,
                        "owner":"c4a51d65-2bcf-4c1d-b0b1-89c5570deddd"
                    }
                }
            ],
            "theme": "minimalist",
            "resolvedIds": {
                "0f7361ca-de08-43b8-8170-a759d92ec654": {
                    "dataType": "CHAR",
                    "type": "ATTRIBUTE",
                    "defaultAggrType": "NONE",
                    "isDerived": false,
                    "physicalColumnGUID": "49e7b7dc-902a-4de4-b4ea-ab72d15e9e7f",
                    "header": {
                        "id": "0f7361ca-de08-43b8-8170-a759d92ec654",
                        "name": "S_REGION",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053901966,
                        "modified": 1354053901966,
                        "generationNum": 1,
                        "isPrivate": false
                    }
                },
                "f1f13666-15fa-48ed-bf9f-c6a3f42f25ea": {
                    "dataType": "INT64",
                    "type": "ATTRIBUTE",
                    "defaultAggrType": "NONE",
                    "isDerived": false,
                    "physicalColumnGUID": "ea812ae7-798f-47eb-8219-87e4a5de5420",
                    "header": {
                        "id": "f1f13666-15fa-48ed-bf9f-c6a3f42f25ea",
                        "name": "D_YEAR",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053902286,
                        "modified": 1354053902286,
                        "generationNum": 1,
                        "isPrivate": false
                    }
                },
                "ab1bf3da-1478-4786-b666-39ea9f930152": {
                    "dataType": "CHAR",
                    "type": "ATTRIBUTE",
                    "defaultAggrType": "NONE",
                    "isDerived": false,
                    "physicalColumnGUID": "5d2f3e1b-8d85-48ab-82d7-c25727d02c2b",
                    "header": {
                        "id": "ab1bf3da-1478-4786-b666-39ea9f930152",
                        "name": "P_CATEGORY",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053901759,
                        "modified": 1354053901759,
                        "generationNum": 1,
                        "isPrivate": false
                    }
                },
                "4391d676-2dd8-4248-b6db-d973811f0122": {
                    "header": {
                        "id": "4391d676-2dd8-4248-b6db-d973811f0122",
                        "name": "Vijay Ganesan",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354006445722,
                        "modified": 1354006445987,
                        "generationNum": 0,
                        "isPrivate": false
                    }
                },
                "c56c023c-f3b0-43c6-8de2-ed8c25696542": {
                    "dataType": "CHAR",
                    "type": "ATTRIBUTE",
                    "defaultAggrType": "NONE",
                    "isDerived": false,
                    "physicalColumnGUID": "d66241bc-6c8c-4722-bece-821bb6b7be88",
                    "header": {
                        "id": "c56c023c-f3b0-43c6-8de2-ed8c25696542",
                        "name": "P_BRAND1",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053901769,
                        "modified": 1354053901769,
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
            },
            "formatMap": {
                "f1": {
                    "formatType": "CELL"
                },
                "f2": {
                    "formatType": "NUMBER"
                }
            }
        },
        "header": {
            "id": "c4a51d65-2bcf-4c1d-b0b1-89c5570deddd",
            "name": "Brand Revenue Trend",
            "description": "Yearly Revenue analysis by Brand for specific Category and Region; Nested Visualizations",
            "author": "4391d676-2dd8-4248-b6db-d973811f0122",
            "created": 1354006444616,
            "modified": 1354006445722,
            "generationNum": 0,
            "isPrivate": false
        }
    },
    "reportBookData": {
        "56f36a81-1eac-4462-9c9f-dd8c5a8da5c3": {
            "vizData": {
                "6e297d32-0b84-4866-b85e-9f8a57a1d7e9": {
                    "dataSets": {
                        "TABLE": {
                            "data": [
                                [
                                    1992,
                                    "MFGR#1215",
                                    1198812
                                ],
                                [
                                    1992,
                                    "MFGR#1221",
                                    6836244
                                ],
                                [
                                    1992,
                                    "MFGR#123",
                                    6393485
                                ],
                                [
                                    1992,
                                    "MFGR#1231",
                                    2039737
                                ],
                                [
                                    1992,
                                    "MFGR#124",
                                    1548845
                                ],
                                [
                                    1992,
                                    "MFGR#127",
                                    3393363
                                ],
                                [
                                    1992,
                                    "MFGR#129",
                                    2993129
                                ],
                                [
                                    1993,
                                    "MFGR#1221",
                                    1526466
                                ],
                                [
                                    1993,
                                    "MFGR#1229",
                                    4849738
                                ],
                                [
                                    1993,
                                    "MFGR#123",
                                    5793640
                                ],
                                [
                                    1993,
                                    "MFGR#1231",
                                    1552911
                                ],
                                [
                                    1993,
                                    "MFGR#1238",
                                    4825764
                                ],
                                [
                                    1993,
                                    "MFGR#124",
                                    6224336
                                ],
                                [
                                    1994,
                                    "MFGR#1216",
                                    1910749
                                ],
                                [
                                    1994,
                                    "MFGR#1222",
                                    2042056
                                ],
                                [
                                    1994,
                                    "MFGR#1228",
                                    4397159
                                ],
                                [
                                    1994,
                                    "MFGR#1231",
                                    3043144
                                ],
                                [
                                    1994,
                                    "MFGR#1233",
                                    1962757
                                ],
                                [
                                    1994,
                                    "MFGR#1237",
                                    5814412
                                ],
                                [
                                    1994,
                                    "MFGR#129",
                                    4621429
                                ],
                                [
                                    1995,
                                    "MFGR#1212",
                                    4099922
                                ],
                                [
                                    1995,
                                    "MFGR#1214",
                                    3332268
                                ],
                                [
                                    1995,
                                    "MFGR#1216",
                                    1104564
                                ],
                                [
                                    1995,
                                    "MFGR#1218",
                                    9361799
                                ],
                                [
                                    1995,
                                    "MFGR#1238",
                                    822929
                                ],
                                [
                                    1995,
                                    "MFGR#127",
                                    268416
                                ],
                                [
                                    1996,
                                    "MFGR#1212",
                                    869217
                                ],
                                [
                                    1996,
                                    "MFGR#1216",
                                    3174462
                                ],
                                [
                                    1996,
                                    "MFGR#122",
                                    2681289
                                ],
                                [
                                    1996,
                                    "MFGR#1230",
                                    7249993
                                ],
                                [
                                    1996,
                                    "MFGR#1237",
                                    1748203
                                ],
                                [
                                    1997,
                                    "MFGR#123",
                                    6951206
                                ],
                                [
                                    1997,
                                    "MFGR#1236",
                                    4201165
                                ],
                                [
                                    1997,
                                    "MFGR#127",
                                    3213882
                                ]
                            ],
                            "uniques": {
                                "0": [
                                    1992,
                                    1993,
                                    1994,
                                    1995,
                                    1996,
                                    1997
                                ],
                                "1": [
                                    "MFGR#1215",
                                    "MFGR#1221",
                                    "MFGR#123",
                                    "MFGR#1231",
                                    "MFGR#124",
                                    "MFGR#127",
                                    "MFGR#129",
                                    "MFGR#1229",
                                    "MFGR#1238",
                                    "MFGR#1216",
                                    "MFGR#1222",
                                    "MFGR#1228",
                                    "MFGR#1233",
                                    "MFGR#1237",
                                    "MFGR#1212",
                                    "MFGR#1214",
                                    "MFGR#1218",
                                    "MFGR#122",
                                    "MFGR#1230",
                                    "MFGR#1236"
                                ]
                            }
                        }
                    }
                },
                "0bfe0912-5b49-4089-afa5-e18bc3b8cfdf": {
                    "dataSets": {
                        "CHART": {
                            "data": [
                                [
                                    "MFGR#1212",
                                    4969139
                                ],
                                [
                                    "MFGR#1214",
                                    3332268
                                ],
                                [
                                    "MFGR#1215",
                                    1198812
                                ],
                                [
                                    "MFGR#1216",
                                    6189775
                                ],
                                [
                                    "MFGR#1218",
                                    9361799
                                ],
                                [
                                    "MFGR#122",
                                    2681289
                                ],
                                [
                                    "MFGR#1221",
                                    8362710
                                ],
                                [
                                    "MFGR#1222",
                                    2042056
                                ],
                                [
                                    "MFGR#1228",
                                    4397159
                                ],
                                [
                                    "MFGR#1229",
                                    4849738
                                ],
                                [
                                    "MFGR#123",
                                    19138331
                                ],
                                [
                                    "MFGR#1230",
                                    7249993
                                ],
                                [
                                    "MFGR#1231",
                                    6635792
                                ],
                                [
                                    "MFGR#1233",
                                    1962757
                                ],
                                [
                                    "MFGR#1236",
                                    4201165
                                ],
                                [
                                    "MFGR#1237",
                                    7562615
                                ],
                                [
                                    "MFGR#1238",
                                    5648693
                                ],
                                [
                                    "MFGR#124",
                                    7773181
                                ],
                                [
                                    "MFGR#127",
                                    6875661
                                ],
                                [
                                    "MFGR#129",
                                    7614558
                                ]
                            ],
                            "uniques": {
                                "0": [
                                    "MFGR#1212",
                                    "MFGR#1214",
                                    "MFGR#1215",
                                    "MFGR#1216",
                                    "MFGR#1218",
                                    "MFGR#122",
                                    "MFGR#1221",
                                    "MFGR#1222",
                                    "MFGR#1228",
                                    "MFGR#1229",
                                    "MFGR#123",
                                    "MFGR#1230",
                                    "MFGR#1231",
                                    "MFGR#1233",
                                    "MFGR#1236",
                                    "MFGR#1237",
                                    "MFGR#1238",
                                    "MFGR#124",
                                    "MFGR#127",
                                    "MFGR#129"
                                ]
                            }
                        }
                    }
                },
                "920632bb-7376-42cb-a63b-756799c20b7e": {
                    "dataSets": {
                        "CHART": {
                            "data": [
                                [
                                    1992,
                                    "MFGR#1215",
                                    1198812
                                ],
                                [
                                    1992,
                                    "MFGR#1221",
                                    6836244
                                ],
                                [
                                    1992,
                                    "MFGR#123",
                                    6393485
                                ],
                                [
                                    1992,
                                    "MFGR#1231",
                                    2039737
                                ],
                                [
                                    1992,
                                    "MFGR#124",
                                    1548845
                                ],
                                [
                                    1992,
                                    "MFGR#127",
                                    3393363
                                ],
                                [
                                    1992,
                                    "MFGR#129",
                                    2993129
                                ],
                                [
                                    1993,
                                    "MFGR#1221",
                                    1526466
                                ],
                                [
                                    1993,
                                    "MFGR#1229",
                                    4849738
                                ],
                                [
                                    1993,
                                    "MFGR#123",
                                    5793640
                                ],
                                [
                                    1993,
                                    "MFGR#1231",
                                    1552911
                                ],
                                [
                                    1993,
                                    "MFGR#1238",
                                    4825764
                                ],
                                [
                                    1993,
                                    "MFGR#124",
                                    6224336
                                ],
                                [
                                    1994,
                                    "MFGR#1216",
                                    1910749
                                ],
                                [
                                    1994,
                                    "MFGR#1222",
                                    2042056
                                ],
                                [
                                    1994,
                                    "MFGR#1228",
                                    4397159
                                ],
                                [
                                    1994,
                                    "MFGR#1231",
                                    3043144
                                ],
                                [
                                    1994,
                                    "MFGR#1233",
                                    1962757
                                ],
                                [
                                    1994,
                                    "MFGR#1237",
                                    5814412
                                ],
                                [
                                    1994,
                                    "MFGR#129",
                                    4621429
                                ],
                                [
                                    1995,
                                    "MFGR#1212",
                                    4099922
                                ],
                                [
                                    1995,
                                    "MFGR#1214",
                                    3332268
                                ],
                                [
                                    1995,
                                    "MFGR#1216",
                                    1104564
                                ],
                                [
                                    1995,
                                    "MFGR#1218",
                                    9361799
                                ],
                                [
                                    1995,
                                    "MFGR#1238",
                                    822929
                                ],
                                [
                                    1995,
                                    "MFGR#127",
                                    268416
                                ],
                                [
                                    1996,
                                    "MFGR#1212",
                                    869217
                                ],
                                [
                                    1996,
                                    "MFGR#1216",
                                    3174462
                                ],
                                [
                                    1996,
                                    "MFGR#122",
                                    2681289
                                ],
                                [
                                    1996,
                                    "MFGR#1230",
                                    7249993
                                ],
                                [
                                    1996,
                                    "MFGR#1237",
                                    1748203
                                ],
                                [
                                    1997,
                                    "MFGR#123",
                                    6951206
                                ],
                                [
                                    1997,
                                    "MFGR#1236",
                                    4201165
                                ],
                                [
                                    1997,
                                    "MFGR#127",
                                    3213882
                                ]
                            ],
                            "uniques": {
                                "0": [
                                    1992,
                                    1993,
                                    1994,
                                    1995,
                                    1996,
                                    1997
                                ],
                                "1": [
                                    "MFGR#1215",
                                    "MFGR#1221",
                                    "MFGR#123",
                                    "MFGR#1231",
                                    "MFGR#124",
                                    "MFGR#127",
                                    "MFGR#129",
                                    "MFGR#1229",
                                    "MFGR#1238",
                                    "MFGR#1216",
                                    "MFGR#1222",
                                    "MFGR#1228",
                                    "MFGR#1233",
                                    "MFGR#1237",
                                    "MFGR#1212",
                                    "MFGR#1214",
                                    "MFGR#1218",
                                    "MFGR#122",
                                    "MFGR#1230",
                                    "MFGR#1236"
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
            "serviceInvocTime(ms)": 44,
            "dataInfo": [
                {
                    "56f36a81-1eac-4462-9c9f-dd8c5a8da5c3": [
                        {
                            "6e297d32-0b84-4866-b85e-9f8a57a1d7e9": [
                                {
                                    "TABLE": {
                                        "rowCount": 34,
                                        "columnCount": 3,
                                        "uniquesCount": [
                                            {
                                                "0": 6
                                            },
                                            {
                                                "1": 20
                                            }
                                        ],
                                        "queryTime(ms)": 0
                                    }
                                }
                            ]
                        },
                        {
                            "0bfe0912-5b49-4089-afa5-e18bc3b8cfdf": [
                                {
                                    "CHART": {
                                        "rowCount": 20,
                                        "columnCount": 2,
                                        "uniquesCount": [
                                            {
                                                "0": 20
                                            }
                                        ],
                                        "queryTime(ms)": 0
                                    }
                                }
                            ]
                        },
                        {
                            "920632bb-7376-42cb-a63b-756799c20b7e": [
                                {
                                    "CHART": {
                                        "rowCount": 34,
                                        "columnCount": 3,
                                        "uniquesCount": [
                                            {
                                                "0": 6
                                            },
                                            {
                                                "1": 20
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
                    "queryTime(ms)": 5
                }
            ]
        }
    }
};
