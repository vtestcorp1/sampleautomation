/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Unit test for natural query builder
 */

'use strict';

describe('Natural query builder', function () {
    beforeEach(module('blink.app'));

    var scope, json, $target, $natQueryInfoElem, session, $compile, $rootScope;
    beforeEach(inject(function ($injector) {
        session = $injector.get('session');
        $compile = $injector.get('$compile');
        $rootScope = $injector.get('$rootScope');
        /* global spyOnSessionTimezone */
        spyOnSessionTimezone(session);
        var templateStr = '<blink-natural-query answer-model="answerModel" max-grouping-columns-to-show="maxGroupingColumnsToShow" max-measures-to-show="maxMeasuresToShow" max-list-columns-to-show="maxListColumnsToShow"></blink-natural-query>';
        $target = $(templateStr);
        scope = $rootScope;
        scope.maxGroupingColumnsToShow = 2;
        scope.maxMeasuresToShow = 2;
        scope.maxListColumnsToShow = 2;
        $compile($target)(scope);
        scope.$digest();
    }));

    function shownText() {
        return $target.text().trim().replace(/\s+/g, ' ');
    }

    it('should show natural query for "revenue"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe('ThoughtSpot computed total Revenue');
    });

    it('should show natural query for "revenue and average tax"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }, {
                column: {
                    id: 'tax-id',
                    name: 'Tax',
                    table: {
                        id: 'tax-table-id',
                        name: 'tax-table-name'
                    }
                },
                aggregation: 'AVERAGE'

            }]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe('ThoughtSpot computed total Revenue average Tax');
    });

    it('should show natural query for "revenue by ship priority color"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }],
            groupingColumns: [{
                column: {
                    id: 'ship-priority-id',
                    name: 'Ship Priority',
                    table: {
                        id: 'ship-priority-table-id',
                        name: 'ship-priority-table-name'
                    }
                }
            }, {
                column: {
                    id: 'color-id',
                    name: 'Color',
                    table: {
                        id: 'color-table-id',
                        name: 'color-table-name'
                    }
                }
            }]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe('ThoughtSpot computed total Revenue for each combination of Ship Priority and 1 more columns');
    });

    it('should show natural query for "revenue average tax supplier cost"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }, {
                column: {
                    id: 'tax-id',
                    name: 'Tax',
                    table: {
                        id: 'tax-table-id',
                        name: 'tax-table-name'
                    }
                },
                aggregation: 'AVERAGE'
            }, {
                column: {
                    id: 'sc-id',
                    name: 'Supplier Cost',
                    table: {
                        id: 'sc-table-id',
                        name: 'sc-table-name'
                    }
                },
                aggregation: 'SUM'
            }]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe('ThoughtSpot computed total Revenue and 1 more metrics average Tax');
    });

    it('should show natural query for "customer region"', function () {
        json = {
            outputColumns: [],
            groupingColumns: [{
                column: {
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }
            }]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe('ThoughtSpot compiled a list of Customer Regions');
    });

    it('should show natural query for "revenue customer region"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }],
            groupingColumns: [{
                column: {
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }
            }],
            joinRepresentations: [{
                source: {
                    id: '2445fe81-30d6-46fa-9f42-f6b1b4e01623',
                    name: 'LineOrder',
                    type: 'ONE_TO_ONE_LOGICAL'
                },
                destination: {
                    id: '5de19354-710f-448e-8ed2-4315d926a264',
                    name: 'Customer',
                    type: 'ONE_TO_ONE_LOGICAL'
                },
                relationshipName: 'CustKey'
            }]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot computed total Revenue for each Customer Region by linking information from ' +
            'LineOrder and Customer tables using CustKey relation');
    });

    it('should show natural query for "revenue customer region year 1992"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }],
            groupingColumns: [{
                column: {
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }
            }],
            userFilters: [[{
                filterColumn: {
                    column: {
                        id: 'year-id',
                        name: 'Year',
                        tableId: 'year-table-id',
                        tableName: 'year-table-name'
                    }
                },
                filterOperator: 'IN',
                value: [{key: '1992'}]
            }]]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot computed total Revenue for each Customer Region filtered on Year being equal to 1992');
    });

    it('should show natural query for "revenue customer region year 1992 1993"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }],
            groupingColumns: [{
                column: {
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }
            }],
            userFilters: [[{
                filterColumn: {
                    column: {
                        id: 'year-id',
                        name: 'Year',
                        tableId: 'year-table-id',
                        tableName: 'year-table-name'
                    }
                },
                filterOperator: 'IN',
                value: [{key: 1992}, {key: 1993}]
            }]]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot computed total Revenue for each Customer Region filtered on Year in the list 1992 and 1993');
    });

    it('should show natural query for "top 5 customer regions by revenue"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }],
            groupingColumns: [{
                column: {
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }
            }],
            sortColumns: [{
                ascending: false,
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                }
            }, {
                ascending: true,
                column: {
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }
            }, {
                ascending: false,
                column: {
                    id: 'state-id',
                    name: 'State',
                    table: {
                        id: 'state-table-id',
                        name: 'state-table-name'
                    }
                }
            }, {
                ascending: true,
                column: {
                    id: 'tax-id',
                    name: 'Tax',
                    table: {
                        id: 'tax-table-id',
                        name: 'tax-table-name'
                    }
                }
            }, {
                ascending: true,
                column: {
                    id: 'sc-id',
                    name: 'Supplier Cost',
                    table: {
                        id: 'sc-table-id',
                        name: 'sc-table-name'
                    }
                }
            }],
            topRepresentation: {
                topCount: 5,
                topKeyword: 'TOP',
                rankedByColumns: [{
                    column: {
                        id: 'revenue-id',
                        name: 'Revenue',
                        tableId: 'revenue-table-id',
                        tableName: 'revenue-table-name'
                    },
                    aggregation: 'SUM',
                    ascending: false
                }],
                topColumns: [{
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }]
            }
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot computed total Revenue for each Customer Region sorted by' +
            ' Revenue and State in descending order Customer Region , Tax and Supplier Cost in ascending order' +
            ' And then picked top 5 Customer Regions ranked by Revenue');
    });

    it('should show natural query for "growth of revenue by order date monthly"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM',
                isGrowth: true
            }],
            groupingColumns: [{
                column: {
                    id: 'order-date-id',
                    name: 'Month (Order Date)',
                    table: {
                        id: 'order-date-table-id',
                        name: 'order-date-table-name'
                    }
                }
            }],
            growthRepresentation: {
                growthBucket: "MONTH",
                isYOY: false
            }
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot computed total Revenue for each Month (Order Date) And then determined monthly growth of Revenue');
    });

    it('should show natural query for "revenue tax supplier cost quantity state customer"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }, {
                column: {
                    id: 'tax-id',
                    name: 'Tax',
                    table: {
                        id: 'tax-table-id',
                        name: 'tax-table-name'
                    }
                },
                aggregation: 'AVERAGE'
            }, {
                column: {
                    id: 'sc-id',
                    name: 'Supplier Cost',
                    table: {
                        id: 'sc-table-id',
                        name: 'sc-table-name'
                    }
                },
                aggregation: 'SUM'
            }, {
                column: {
                    id: 'quantity-id',
                    name: 'Quantity Cost',
                    table: {
                        id: 'quantity-table-id',
                        name: 'quantity-table-name'
                    }
                },
                aggregation: 'SUM'
            }, {
                column: {
                    id: 'state-id',
                    name: 'State',
                    table: {
                        id: 'state-table-id',
                        name: 'state-table-name'
                    }
                },
                aggregation: 'COUNT'
            }, {
                column: {
                    id: 'customer-id',
                    name: 'Customer',
                    table: {
                        id: 'customer-table-id',
                        name: 'customer-table-name'
                    }
                },
                aggregation: 'COUNT_DISTINCT'
            }]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot computed total Revenue and 2 more metrics' +
            ' average Tax total number of State unique number of Customer');
    });

    it('should show natural query for "revenue customer region year date equal 04/11/1994 between 04/11/1994 and 08/12/2000' +
        '<=  04/11/1994 Year equal 1995 equal 1997 >= 2000 in 1992 1993 1994"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }],
            groupingColumns: [{
                column: {
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }
            }],
            userFilters: [[{
                filterColumn: {
                    column: {
                        id: 'year-id',
                        name: 'Year',
                        tableId: 'year-table-id',
                        tableName: 'year-table-name'
                    }
                },
                filterOperator: 'IN',
                value: [{key: 1992}, {key: 1993}, {key: 1994}]
            }, {
                filterColumn: {
                    column: {
                        id: 'date-id',
                        name: 'Date',
                        tableId: 'date-table-id',
                        tableName: 'date-table-name'
                    },
                    formatPattern: 'MM/dd/yyyy',
                    effectiveDataType: 'DATE'
                },
                filterOperator: 'BW_INC',
                value: [{key: 766047600}, {key: 766047601}]
            }, {
                filterColumn: {
                    column: {
                        id: 'year-id',
                        name: 'Year',
                        tableId: 'year-table-id',
                        tableName: 'year-table-name'
                    }
                },
                filterOperator: 'EQ',
                value: [{key: 1995}]
            }, {
                filterColumn: {
                    column: {
                        id: 'year-id',
                        name: 'Year',
                        tableId: 'year-table-id',
                        tableName: 'year-table-name'
                    }
                },
                filterOperator: 'GE',
                value: [{key: 2000}]
            }, {
                filterColumn: {
                    column: {
                        id: 'date-id',
                        name: 'Date',
                        tableId: 'date-table-id',
                        tableName: 'date-table-name'
                    },
                    formatPattern: 'MM/dd/yyyy',
                    effectiveDataType: 'DATE'
                },
                filterOperator: 'LE',
                value: [{key: 766047600}]
            }, {
                filterColumn: {
                    column: {
                        id: 'date-id',
                        name: 'Date',
                        tableId: 'date-table-id',
                        tableName: 'date-table-name'
                    },
                    formatPattern: 'MM/dd/yyyy',
                    effectiveDataType: 'DATE'
                },
                filterOperator: 'BW_INC',
                value: [{key: 766047600}, {key: 966133999}]
            }, {
                filterColumn: {
                    column: {
                        id: 'year-id',
                        name: 'Year',
                        tableId: 'year-table-id',
                        tableName: 'year-table-name'
                    }
                },
                filterOperator: 'EQ',
                value: [{key: 1997}]
            }]]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot computed total Revenue for each Customer Region filtered on Year in the list' +
            ' 1992 , 1993 and 1994 , being equal to 1995 , not less than 2000 and being equal to 1997 Date being' +
            ' equal to 04/11/1994 , not after 04/11/1994 and between 04/11/1994 and 08/12/2000');
    });

    it('should show natural query for "revenue customer region year date equal 04/11/1994 or 04/11/1995"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'revenue-id',
                    name: 'Revenue',
                    table: {
                        id: 'revenue-table-id',
                        name: 'revenue-table-name'
                    }
                },
                aggregation: 'SUM'
            }],
            groupingColumns: [{
                column: {
                    id: 'customer-region-id',
                    name: 'Customer Region',
                    table: {
                        id: 'customer-region-table-id',
                        name: 'customer-region-table-name'
                    }
                }
            }],
            userFilters: [[{
                filterColumn: {
                    column: {
                        id: 'date-id',
                        name: 'Date',
                        tableId: 'date-table-id',
                        tableName: 'date-table-name'
                    },
                    formatPattern: 'MM/dd/yyyy',
                    effectiveDataType: 'DATE'
                },
                multiOperatorsValues: [{
                    operator:"BW_INC",
                    values:[{key:766047600}, {key: 766047601}]
                }, {
                    operator:"BW_INC",
                    values:[{key:797583600}, {key: 797583601}]
                }]
            }]]
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot computed total Revenue for each Customer Region filtered on Date being equal to 04/11/1994 '
            + 'and being equal to 04/11/1995');
    });

    function getJsonForOperator(operator) {
        json = {
            "outputColumns": [],
            "groupingColumns": [
                {
                    "column": {
                        "id": "customer-region-col-id",
                        "name": "Customer Region",
                        "tableId": "customer-table-id",
                        "tableName": "CUSTOMER"
                    },
                    "effectiveDataType": "VARCHAR"
                }
            ],
            "sortColumns": [
                {
                    "column": {
                        "id": "customer-region-col-id",
                        "name": "Customer Region",
                        "tableId": "customer-table-id",
                        "tableName": "CUSTOMER"
                    },
                    "ascending": true
                }
            ],
            "userFilters": [
                [
                    {
                        "filterColumn": {
                            "column": {
                                "id": "customer-region-col-id",
                                "name": "Customer Region",
                                "tableId": "customer-table-id",
                                "tableName": "CUSTOMER"
                            },
                            "effectiveDataType": "VARCHAR"
                        },
                        "filterOperator": operator,
                        "value": [
                            {
                                "key": "middle",
                                "selected": true
                            }
                        ]
                    }
                ]
            ],
            "securityFilters": [],
            "joinConditions": []
        };
    }

    it('should show natural query for "customer region not contains middle"', function () {
        getJsonForOperator('NOT_CONTAINS');
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot compiled a list of Customer Regions filtered on Customer Region not containing text middle ' +
                'sorted by Customer Region in ascending order');
    });

    it('should show natural query for "customer region not begins with middle"', function () {
        getJsonForOperator('NOT_BEGINS_WITH');
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot compiled a list of Customer Regions filtered on Customer Region not beginning with middle ' +
                'sorted by Customer Region in ascending order');
    });

    it('should show natural query for "customer region not ends with middle"', function () {
        getJsonForOperator('NOT_ENDS_WITH');
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe(
            'ThoughtSpot compiled a list of Customer Regions filtered on Customer Region not ending with middle ' +
                'sorted by Customer Region in ascending order');
    });

    it('should show natural query for "customer region = {a very large filter value}"', function () {
        getJsonForOperator('IN');
        json.userFilters[0][0].value[0].key = 'A ' + 'really '.repeat(13) + ' long filter value';
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe('ThoughtSpot compiled a list of Customer Regions filtered on Customer Region ' +
            'being equal to A really really really really really really really really really really really... ' +
            'sorted by Customer Region in ascending order');
    });

    it('should show natural query for a worksheet containing the columns "commit date quantity"', function () {
        json = {
            outputColumns: [{
                column: {
                    id: 'commit-date-id',
                    name: 'Commit Date',
                    table: {
                        id: 'commit-date-table-id',
                        name: 'commit-date-table-name'
                    }
                },
                effectiveDataType: "INT64",
                formatPattern: "#,##0.###"
            }, {
                column: {
                    id: 'qantity-id',
                    name: 'Quantity',
                    table: {
                        id: 'qantity-table-id',
                        name: 'qantity-table-name'
                    }
                },
                effectiveDataType: "INT64",
                formatPattern: "#,##0.###"
            }],
            queryType: "worksheetList"
        };
        scope.answerModel = {
            getNaturalQuery: function () {
                return json;
            }
        };
        scope.$digest();
        expect(shownText()).toBe('ThoughtSpot compiled a list of Commit Dates and 1 more columns');
    });
});
