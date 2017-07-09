/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Rules regarding data modelling.
 *
 * Each property can take the following descriptor rules:
 *
 *  1. constraints: [required, unique] on the value of the field.
 *  2. type: the data type of the field.
 *  3. allValues: For enum types, a list of all possible values
 *  4. filterValues: list of items on which the values are dependant
 *      4.1 dependsOn: the field(target) on whose value the values for the current field are dependant
 *      4.2 values: list of pairs of targetValue and valid Values for that target value
 *          4.2.1: dependeeValue: a list of the targetValues to match
 *          4.2.2: validValues: a list of valid possible values according to the target dependee field's value
 *  5. default: the default value for this field.
 */

'use strict';

blink.app.factory('dataRulesJson', [
    function () {
        return {
            "table": {
                "tableName": {
                    "constraints": [
                        "required",
                        "unique"
                    ],
                    "type": "string"
                },
                "columns": {
                    "colName": {
                        "constraints": [
                            "required",
                            "unique"
                        ],
                        "type": "string"
                    },
                    "colDesc": {
                        "type": "string"
                    },
                    "colType": {
                        "type": "enum",
                        "allValues": [
                            "ATTRIBUTE",
                            "MEASURE"
                        ],
                        "filterValues": [
                            {
                                "dependsOn": "dataType",
                                "values": [
                                    {
                                        "dependeeValue": [
                                            "BOOL",
                                            "CHAR",
                                            "VARCHAR",
                                            "DATE",
                                            "DATE_TIME"
                                        ],
                                        "validValues": [
                                            "ATTRIBUTE"
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    "isAdditive": {
                        "type": "boolean",
                        "filterValues": [
                            {
                                "dependsOn": "colType",
                                "values": [
                                    {
                                        "dependeeValue": ["MEASURE"],
                                        "validValues": [true]

                                    }
                                ]
                            },
                            {
                                "dependsOn": "dataType",
                                "values": [
                                    {
                                        "dependeeValue": [
                                            "BOOL",
                                            "CHAR",
                                            "VARCHAR"
                                        ],
                                        "validValues": [false]
                                    }
                                ]
                            }
                        ]
                    },
                    "aggType": {
                        "type": "enum",
                        "allValues": [
                            "COUNT",
                            "COUNT_DISTINCT",
                            "SUM",
                            "AVERAGE",
                            "MIN",
                            "MAX",
                            "STD_DEVIATION",
                            "VARIANCE",
                            "NONE"
                        ],
                        "filterValues": [
                            {
                                "dependsOn": "isAdditive",
                                "values": [
                                    {
                                        "dependeeValue": [true],
                                        "validValues": [
                                            "COUNT",
                                            "COUNT_DISTINCT",
                                            "SUM",
                                            "AVERAGE",
                                            "MIN",
                                            "MAX",
                                            "STD_DEVIATION",
                                            "VARIANCE"
                                        ]
                                    },
                                    {
                                        "dependeeValue": [false],
                                        "validValues": [
                                            "NONE",
                                            "MIN",
                                            "MAX",
                                            "COUNT",
                                            "COUNT_DISTINCT"
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    "isHidden": {
                        "type": "boolean",
                        "default": false
                    },
                    "indexType": {
                        "type": "enum",
                        "allValues": [
                            "DEFAULT",
                            "DONT_INDEX",
                            "PREFIX_ONLY",
                            "PREFIX_AND_WORD_SUBSTRING",
                            "PREFIX_AND_SUBSTRING"
                        ],
                        "default": "DEFAULT"
                    },
                    "indexPriority": {
                        "type": "float",
                        "constraints": [
                            "gt0"
                        ]
                    },
                    "synonymns": {
                        "type": "stringArray"
                    },
                    "entity": {
                        "type": "enum",
                        "allValues": [
                            "DEFAULT",
                            "PERSON",
                            "PLACE",
                            "TIME",
                            "MONEY",
                            "PRODUCT"
                        ],
                        "default": "DEFAULT"
                    },
                    "format": {
                        "type": "string"
                    }
                }
            }
        };

    }
]);
