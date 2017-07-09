blink.app.fakeData.reportbook4 =
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
                                                "typedKeyValue": 1
                                            }
                                        ]
                                    },
                                    {
                                        "column": {
                                            "id": "e70b2306-98c2-4f86-8460-870fcb3712ee",
                                            "name": "LO_SUPPLYCOST",
                                            "isPrivate": false
                                        },
                                        "oper": "LT",
                                        "values": [
                                            {
                                                "selected": true,
                                                "typedKeyValue": 58000
                                            }
                                        ]
                                    }
                                ]
                            },
                            "header": {
                                "id": "1d6d7988-f73b-4259-a901-326965df892b",
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
                                            "hasSubTotal": true,
                                            "aggrTypeOverride": "NONE",
                                            "typeOverride": "ATTRIBUTE",
                                            "groupBy": true
                                        },
                                        {
                                            "column": {
                                                "id": "d1c6c143-beb1-4b2f-93a1-7ae773f12b9e",
                                                "name": "LO_PARTKEY",
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
                                        },
                                        {
                                            "column": {
                                                "id": "e70b2306-98c2-4f86-8460-870fcb3712ee",
                                                "name": "LO_SUPPLYCOST",
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
                                    "id": "59cbfee4-9e8d-4a4d-b83a-233ae297695a",
                                    "name": "Table Viz revenue by linenumber by partkey for ordtotalprice \u003e 1 for supplycost \u003c 58000",
                                    "generationNum": 0,
                                    "isPrivate": true
                                }
                            },
                            {
                                "vizContent": {
                                    "vizType": "CHART",
                                    "chartType": "BUBBLE",
                                    "categories": {
                                        "columns": [
                                            {
                                                "column": {
                                                    "id": "d1c6c143-beb1-4b2f-93a1-7ae773f12b9e",
                                                    "name": "LO_PARTKEY",
                                                    "isPrivate": false
                                                },
                                                "aggrTypeOverride": "NONE",
                                                "typeOverride": "ATTRIBUTE",
                                                "groupBy": true
                                            }
                                        ]
                                    },
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
                                            },
                                            {
                                                "column": {
                                                    "id": "e70b2306-98c2-4f86-8460-870fcb3712ee",
                                                    "name": "LO_SUPPLYCOST",
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
                                    "id": "80dd5a4c-3e15-420a-b412-9b89d16da5cb",
                                    "name": "Chart Viz revenue by linenumber by partkey for ordtotalprice \u003e 1 for supplycost \u003c 58000",
                                    "generationNum": 0,
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
                                    "id": "59cbfee4-9e8d-4a4d-b83a-233ae297695a"
                                },
                                {
                                    "vizType": "VIZ_REF",
                                    "id": "80dd5a4c-3e15-420a-b412-9b89d16da5cb"
                                }
                            ]
                        }
                    },
                    "header": {
                        "id": "c5bda656-75c0-4d03-9701-e8aa2cca469c",
                        "name": "Answer Sheet revenue by linenumber by partkey for ordtotalprice \u003e 1 for supplycost \u003c 58000",
                        "generationNum": 0,
                        "isPrivate": true,
                        "owner":"5f09cf65-a8de-4d96-a2bf-36aec15ca8c1"
                    }
                }
            ],
            "resolvedIds": {
                "d1c6c143-beb1-4b2f-93a1-7ae773f12b9e": {
                    "dataType": "INT64",
                    "type": "ATTRIBUTE",
                    "defaultAggrType": "NONE",
                    "isDerived": false,
                    "physicalColumnGUID": "dedda9c0-4e35-4cdb-b45e-d72f2311fbe1",
                    "header": {
                        "id": "d1c6c143-beb1-4b2f-93a1-7ae773f12b9e",
                        "name": "LO_PARTKEY",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053901597,
                        "modified": 1354053901597,
                        "generationNum": 1,
                        "isPrivate": false
                    }
                },
                "e70b2306-98c2-4f86-8460-870fcb3712ee": {
                    "dataType": "INT64",
                    "type": "MEASURE",
                    "defaultAggrType": "SUM",
                    "isDerived": false,
                    "physicalColumnGUID": "26b90ed9-dca4-486d-814c-eb0ec179896b",
                    "header": {
                        "id": "e70b2306-98c2-4f86-8460-870fcb3712ee",
                        "name": "LO_SUPPLYCOST",
                        "author": "59481331-ee53-42be-a548-bd87be6ddd4a",
                        "created": 1354053901635,
                        "modified": 1354053901635,
                        "generationNum": 1,
                        "isPrivate": false
                    }
                },
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
            "id": "5f09cf65-a8de-4d96-a2bf-36aec15ca8c1",
            "name": "revenue by linenumber by partkey for ordtotalprice \u003e 1 for supplycost \u003c 58000",
            "generationNum": 0,
            "isPrivate": true
        }
    },
    "reportBookData": {
        "c5bda656-75c0-4d03-9701-e8aa2cca469c": {
            "vizData": {
                "59cbfee4-9e8d-4a4d-b83a-233ae297695a": {
                    "dataSets": {
                        "TABLE": {
                            "data": [
                                [
                                    1,
                                    1035,
                                    1263640,
                                    11853660,
                                    56161
                                ],
                                [
                                    1,
                                    3007,
                                    2401490,
                                    3189614,
                                    54600
                                ],
                                [
                                    1,
                                    3054,
                                    516807,
                                    20538744,
                                    57423
                                ],
                                [
                                    1,
                                    4034,
                                    2345075,
                                    22748587,
                                    56281
                                ],
                                [
                                    1,
                                    4039,
                                    254618,
                                    274987,
                                    56581
                                ],
                                [
                                    1,
                                    6014,
                                    1590697,
                                    11938494,
                                    55200
                                ],
                                [
                                    1,
                                    8022,
                                    744016,
                                    29376456,
                                    55801
                                ],
                                [
                                    1,
                                    11038,
                                    1639923,
                                    17210527,
                                    56941
                                ],
                                [
                                    1,
                                    15018,
                                    633513,
                                    5124314,
                                    55980
                                ],
                                [
                                    1,
                                    15046,
                                    2248833,
                                    3067824,
                                    57662
                                ],
                                [
                                    1,
                                    17017,
                                    773360,
                                    24789884,
                                    56040
                                ],
                                [
                                    1,
                                    35025,
                                    3886160,
                                    18971387,
                                    57601
                                ],
                                [
                                    1,
                                    38003,
                                    1326810,
                                    15025017,
                                    56460
                                ],
                                [
                                    1,
                                    46009,
                                    1054320,
                                    11106685,
                                    57300
                                ],
                                [
                                    2,
                                    1062,
                                    92453,
                                    14423038,
                                    57783
                                ],
                                [
                                    2,
                                    3059,
                                    2308920,
                                    12356699,
                                    57723
                                ],
                                [
                                    2,
                                    5043,
                                    2878249,
                                    11288896,
                                    56882
                                ],
                                [
                                    2,
                                    6056,
                                    1809616,
                                    12509090,
                                    57723
                                ],
                                [
                                    2,
                                    10005,
                                    2779770,
                                    3589967,
                                    54900
                                ],
                                [
                                    2,
                                    12042,
                                    1049444,
                                    15238767,
                                    57242
                                ],
                                [
                                    2,
                                    13052,
                                    2995515,
                                    6219762,
                                    57903
                                ],
                                [
                                    2,
                                    16038,
                                    257588,
                                    21800348,
                                    57241
                                ],
                                [
                                    2,
                                    19036,
                                    4211682,
                                    16746878,
                                    57301
                                ],
                                [
                                    2,
                                    19045,
                                    4676558,
                                    23043357,
                                    57842
                                ],
                                [
                                    2,
                                    32028,
                                    3830479,
                                    14149092,
                                    57601
                                ],
                                [
                                    2,
                                    38012,
                                    1048811,
                                    9106574,
                                    57000
                                ],
                                [
                                    2,
                                    41007,
                                    2844000,
                                    5009921,
                                    56880
                                ],
                                [
                                    2,
                                    42003,
                                    3175200,
                                    19332086,
                                    56700
                                ],
                                [
                                    2,
                                    44019,
                                    1151759,
                                    21568107,
                                    57780
                                ],
                                [
                                    2,
                                    44020,
                                    3374070,
                                    11110264,
                                    57841
                                ],
                                [
                                    2,
                                    46001,
                                    1609900,
                                    20631506,
                                    56820
                                ],
                                [
                                    2,
                                    47010,
                                    3713198,
                                    10016767,
                                    57420
                                ],
                                [
                                    2,
                                    52014,
                                    286904,
                                    12774779,
                                    57960
                                ],
                                [
                                    2,
                                    53004,
                                    189486,
                                    26639764,
                                    57420
                                ],
                                [
                                    3,
                                    8016,
                                    4082276,
                                    6692630,
                                    55440
                                ],
                                [
                                    3,
                                    14011,
                                    976810,
                                    18688332,
                                    55500
                                ],
                                [
                                    3,
                                    17043,
                                    2296415,
                                    18332387,
                                    57602
                                ],
                                [
                                    3,
                                    23025,
                                    1951025,
                                    27267214,
                                    56881
                                ],
                                [
                                    3,
                                    26013,
                                    3474337,
                                    24233117,
                                    56340
                                ],
                                [
                                    3,
                                    31032,
                                    693381,
                                    28998452,
                                    57781
                                ],
                                [
                                    3,
                                    53012,
                                    439079,
                                    9106574,
                                    57900
                                ],
                                [
                                    3,
                                    55001,
                                    2870868,
                                    15699988,
                                    57360
                                ],
                                [
                                    4,
                                    10045,
                                    3215619,
                                    24047892,
                                    57302
                                ],
                                [
                                    4,
                                    12039,
                                    1326686,
                                    11575870,
                                    57061
                                ],
                                [
                                    4,
                                    16003,
                                    2573200,
                                    15240791,
                                    55140
                                ],
                                [
                                    4,
                                    20003,
                                    708864,
                                    16884654,
                                    55380
                                ],
                                [
                                    4,
                                    28004,
                                    268416,
                                    16049143,
                                    55920
                                ],
                                [
                                    4,
                                    31009,
                                    3534400,
                                    9007831,
                                    56400
                                ],
                                [
                                    4,
                                    39004,
                                    1448448,
                                    20846293,
                                    56580
                                ],
                                [
                                    4,
                                    46002,
                                    3488640,
                                    25585561,
                                    56880
                                ],
                                [
                                    5,
                                    3059,
                                    4114687,
                                    16667591,
                                    57723
                                ],
                                [
                                    5,
                                    5035,
                                    4064689,
                                    22000011,
                                    56401
                                ],
                                [
                                    5,
                                    10008,
                                    247860,
                                    17896663,
                                    55080
                                ],
                                [
                                    5,
                                    15001,
                                    1917188,
                                    25266084,
                                    54960
                                ],
                                [
                                    5,
                                    17028,
                                    4086266,
                                    18145349,
                                    56701
                                ],
                                [
                                    5,
                                    21017,
                                    545921,
                                    8368047,
                                    56280
                                ],
                                [
                                    5,
                                    48007,
                                    3758880,
                                    27981893,
                                    57300
                                ],
                                [
                                    6,
                                    6041,
                                    609893,
                                    19011325,
                                    56822
                                ],
                                [
                                    6,
                                    12009,
                                    1173354,
                                    25227424,
                                    55260
                                ],
                                [
                                    6,
                                    19043,
                                    184711,
                                    16169562,
                                    57722
                                ],
                                [
                                    7,
                                    8008,
                                    791424,
                                    24226582,
                                    54960
                                ],
                                [
                                    7,
                                    15029,
                                    1686019,
                                    19618122,
                                    56641
                                ],
                                [
                                    7,
                                    27031,
                                    836360,
                                    34617967,
                                    57481
                                ],
                                [
                                    7,
                                    44017,
                                    2623557,
                                    17786231,
                                    57660
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
                                ],
                                "1": [
                                    1035,
                                    3007,
                                    3054,
                                    4034,
                                    4039,
                                    6014,
                                    8022,
                                    11038,
                                    15018,
                                    15046,
                                    17017,
                                    35025,
                                    38003,
                                    46009,
                                    1062,
                                    3059,
                                    5043,
                                    6056,
                                    10005,
                                    12042,
                                    13052,
                                    16038,
                                    19036,
                                    19045,
                                    32028,
                                    38012,
                                    41007,
                                    42003,
                                    44019,
                                    44020,
                                    46001,
                                    47010,
                                    52014,
                                    53004,
                                    8016,
                                    14011,
                                    17043,
                                    23025,
                                    26013,
                                    31032,
                                    53012,
                                    55001,
                                    10045,
                                    12039,
                                    16003,
                                    20003,
                                    28004,
                                    31009,
                                    39004,
                                    46002,
                                    5035,
                                    10008,
                                    15001,
                                    17028,
                                    21017,
                                    48007,
                                    6041,
                                    12009,
                                    19043,
                                    8008,
                                    15029,
                                    27031,
                                    44017
                                ]
                            }
                        }
                    }
                },
                "80dd5a4c-3e15-420a-b412-9b89d16da5cb": {
                    "dataSets": {
                        "CHART": {
                            "data": [
                                [
                                    1,
                                    1035,
                                    1263640,
                                    11853660,
                                    26161
                                ],
                                [
                                    1,
                                    3007,
                                    2401490,
                                    3189614,
                                    84600
                                ],
                                [
                                    1,
                                    3054,
                                    516807,
                                    20538744,
                                    117423
                                ],
                                [
                                    1,
                                    4034,
                                    2345075,
                                    22748587,
                                    56281
                                ],
                                [
                                    1,
                                    4039,
                                    254618,
                                    274987,
                                    46581
                                ],
                                [
                                    1,
                                    6014,
                                    1590697,
                                    11938494,
                                    35200
                                ],
                                [
                                    1,
                                    8022,
                                    744016,
                                    29376456,
                                    25801
                                ],
                                [
                                    1,
                                    11038,
                                    1639923,
                                    17210527,
                                    26941
                                ],
                                [
                                    1,
                                    15018,
                                    633513,
                                    5124314,
                                    25980
                                ],
                                [
                                    1,
                                    15046,
                                    2248833,
                                    3067824,
                                    57662
                                ],
                                [
                                    1,
                                    17017,
                                    773360,
                                    24789884,
                                    66040
                                ],
                                [
                                    1,
                                    35025,
                                    3886160,
                                    18971387,
                                    97601
                                ],
                                [
                                    1,
                                    38003,
                                    1326810,
                                    15025017,
                                    96460
                                ],
                                [
                                    1,
                                    46009,
                                    1054320,
                                    11106685,
                                    127300
                                ],
                                [
                                    2,
                                    1062,
                                    92453,
                                    14423038,
                                    107783
                                ],
                                [
                                    2,
                                    3059,
                                    2308920,
                                    12356699,
                                    77723
                                ],
                                [
                                    2,
                                    5043,
                                    2878249,
                                    11288896,
                                    26882
                                ],
                                [
                                    2,
                                    6056,
                                    1809616,
                                    12509090,
                                    57723
                                ],
                                [
                                    2,
                                    10005,
                                    2779770,
                                    3589967,
                                    54900
                                ],
                                [
                                    2,
                                    12042,
                                    1049444,
                                    15238767,
                                    57242
                                ],
                                [
                                    2,
                                    13052,
                                    2995515,
                                    6219762,
                                    57903
                                ],
                                [
                                    2,
                                    16038,
                                    257588,
                                    21800348,
                                    57241
                                ],
                                [
                                    2,
                                    19036,
                                    4211682,
                                    16746878,
                                    57301
                                ],
                                [
                                    2,
                                    19045,
                                    4676558,
                                    23043357,
                                    57842
                                ],
                                [
                                    2,
                                    32028,
                                    3830479,
                                    14149092,
                                    57601
                                ],
                                [
                                    2,
                                    38012,
                                    1048811,
                                    9106574,
                                    57000
                                ],
                                [
                                    2,
                                    41007,
                                    2844000,
                                    5009921,
                                    56880
                                ],
                                [
                                    2,
                                    42003,
                                    3175200,
                                    19332086,
                                    56700
                                ],
                                [
                                    2,
                                    44019,
                                    1151759,
                                    21568107,
                                    57780
                                ],
                                [
                                    2,
                                    44020,
                                    3374070,
                                    11110264,
                                    57841
                                ],
                                [
                                    2,
                                    46001,
                                    1609900,
                                    20631506,
                                    56820
                                ],
                                [
                                    2,
                                    47010,
                                    3713198,
                                    10016767,
                                    57420
                                ],
                                [
                                    2,
                                    52014,
                                    286904,
                                    12774779,
                                    57960
                                ],
                                [
                                    2,
                                    53004,
                                    189486,
                                    26639764,
                                    57420
                                ],
                                [
                                    3,
                                    8016,
                                    4082276,
                                    6692630,
                                    55440
                                ],
                                [
                                    3,
                                    14011,
                                    976810,
                                    18688332,
                                    55500
                                ],
                                [
                                    3,
                                    17043,
                                    2296415,
                                    18332387,
                                    57602
                                ],
                                [
                                    3,
                                    23025,
                                    1951025,
                                    27267214,
                                    56881
                                ],
                                [
                                    3,
                                    26013,
                                    3474337,
                                    24233117,
                                    56340
                                ],
                                [
                                    3,
                                    31032,
                                    693381,
                                    28998452,
                                    57781
                                ],
                                [
                                    3,
                                    53012,
                                    439079,
                                    9106574,
                                    57900
                                ],
                                [
                                    3,
                                    55001,
                                    2870868,
                                    15699988,
                                    57360
                                ],
                                [
                                    4,
                                    10045,
                                    3215619,
                                    24047892,
                                    57302
                                ],
                                [
                                    4,
                                    12039,
                                    1326686,
                                    11575870,
                                    57061
                                ],
                                [
                                    4,
                                    16003,
                                    2573200,
                                    15240791,
                                    55140
                                ],
                                [
                                    4,
                                    20003,
                                    708864,
                                    16884654,
                                    55380
                                ],
                                [
                                    4,
                                    28004,
                                    268416,
                                    16049143,
                                    55920
                                ],
                                [
                                    4,
                                    31009,
                                    3534400,
                                    9007831,
                                    56400
                                ],
                                [
                                    4,
                                    39004,
                                    1448448,
                                    20846293,
                                    56580
                                ],
                                [
                                    4,
                                    46002,
                                    3488640,
                                    25585561,
                                    56880
                                ],
                                [
                                    5,
                                    3059,
                                    4114687,
                                    16667591,
                                    57723
                                ],
                                [
                                    5,
                                    5035,
                                    4064689,
                                    22000011,
                                    56401
                                ],
                                [
                                    5,
                                    10008,
                                    247860,
                                    17896663,
                                    55080
                                ],
                                [
                                    5,
                                    15001,
                                    1917188,
                                    25266084,
                                    54960
                                ],
                                [
                                    5,
                                    17028,
                                    4086266,
                                    18145349,
                                    56701
                                ],
                                [
                                    5,
                                    21017,
                                    545921,
                                    8368047,
                                    56280
                                ],
                                [
                                    5,
                                    48007,
                                    3758880,
                                    27981893,
                                    57300
                                ],
                                [
                                    6,
                                    6041,
                                    609893,
                                    19011325,
                                    56822
                                ],
                                [
                                    6,
                                    12009,
                                    1173354,
                                    25227424,
                                    55260
                                ],
                                [
                                    6,
                                    19043,
                                    184711,
                                    16169562,
                                    57722
                                ],
                                [
                                    7,
                                    8008,
                                    791424,
                                    24226582,
                                    54960
                                ],
                                [
                                    7,
                                    15029,
                                    1686019,
                                    19618122,
                                    56641
                                ],
                                [
                                    7,
                                    27031,
                                    836360,
                                    34617967,
                                    57481
                                ],
                                [
                                    7,
                                    44017,
                                    2623557,
                                    17786231,
                                    57660
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
                                ],
                                "1": [
                                    1035,
                                    3007,
                                    3054,
                                    4034,
                                    4039,
                                    6014,
                                    8022,
                                    11038,
                                    15018,
                                    15046,
                                    17017,
                                    35025,
                                    38003,
                                    46009,
                                    1062,
                                    3059,
                                    5043,
                                    6056,
                                    10005,
                                    12042,
                                    13052,
                                    16038,
                                    19036,
                                    19045,
                                    32028,
                                    38012,
                                    41007,
                                    42003,
                                    44019,
                                    44020,
                                    46001,
                                    47010,
                                    52014,
                                    53004,
                                    8016,
                                    14011,
                                    17043,
                                    23025,
                                    26013,
                                    31032,
                                    53012,
                                    55001,
                                    10045,
                                    12039,
                                    16003,
                                    20003,
                                    28004,
                                    31009,
                                    39004,
                                    46002,
                                    5035,
                                    10008,
                                    15001,
                                    17028,
                                    21017,
                                    48007,
                                    6041,
                                    12009,
                                    19043,
                                    8008,
                                    15029,
                                    27031,
                                    44017
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
            "serviceInvocTime(ms)": 49,
            "dataInfo": [
                {
                    "c5bda656-75c0-4d03-9701-e8aa2cca469c": [
                        {
                            "59cbfee4-9e8d-4a4d-b83a-233ae297695a": [
                                {
                                    "TABLE": {
                                        "rowCount": 64,
                                        "columnCount": 5,
                                        "uniquesCount": [
                                            {
                                                "0": 7
                                            },
                                            {
                                                "1": 63
                                            }
                                        ],
                                        "queryTime(ms)": 3
                                    }
                                }
                            ]
                        },
                        {
                            "80dd5a4c-3e15-420a-b412-9b89d16da5cb": [
                                {
                                    "CHART": {
                                        "rowCount": 64,
                                        "columnCount": 5,
                                        "uniquesCount": [
                                            {
                                                "0": 7
                                            },
                                            {
                                                "1": 63
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
                    "queryTime(ms)": 9
                }
            ]
        }
    }
};
