/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

// This file contains various artifacts from TPCH.5K dataset that the perf
// tests should run against.

// Artifacts for tests in pinboard-scenarios.js.
let revenuePinboard = {
    id: '061457a2-27bc-43a9-9754-0cd873691bf0',
    name: 'Revenue Trends',
};
let genericPinboard = {
    id: 'c836ad16-660d-4d28-a3a0-e07cb9eb6ab1',
    name: 'GenericJoin Pinboard 2',
};
let basicPinboard = {
    id: '7752fa9e-db22-415e-bf34-e082c4bc41c3',
    name: 'Basic Pinboard 1'
};

// Artifacts for tests in home-page-scenarios.js.
let homePageScenarios = {
    loadHomePage: [
        {
            pinboard: genericPinboard,
            bounds: {
                lower: 2500,
                upper: 4500
            }
        }
    ],
    switchPinboard: [
        {
            from: revenuePinboard,
            to: genericPinboard,
            bounds: {
                lower: 4000,
                upper: 5000
            }
        },
        {
            from: genericPinboard,
            to: revenuePinboard,
            bounds: {
                lower: 9000,
                upper: 11000
            }
        }
    ],
};

let listPageScenarios = {
    pinboardsListPage: {},
    answersListPage: {}
};

let pinboardScenarios = {
    // Sample pinboards that are used to measure load times for pinboards.
    // NOTE: @id field in @goldenPinboards aren't currently used.
    loadPinboard: [
        {
            pinboard: revenuePinboard,
            bounds: {
                lower: 10000,
                upper: 13000
            }
        }
    ],
    editViz: [
        {
            pinboard: revenuePinboard,
            viz: 'Total Revenue Trend',
            bounds: {
                lower: 2500,
                upper: 4500
            }
        }
    ],
    openViz: [
        {
            pinboard: revenuePinboard,
            viz: 'Total Revenue Trend',
            bounds: {
                lower: 5500,
                upper: 7500
            }
        }
    ],
    addViz: [
        {
            pinboard: genericPinboard,
            query: {
                sources: ['Generic-NonGeneric WS'],
                text: 'customer region customer city'
            },
            bounds: {
                lower: 3500,
                upper: 5000
            }
        }
    ],
    addFilter: [
        {
            pinboard: genericPinboard,
            filter: {
                source: 'Generic-NonGeneric WS',
                column: 'Customer Region',
                value: 'asia'
            },
            bounds: {
                lower: 5000,
                upper: 6500
            }
        }
    ],
    makeCopy: [
        {
            pinboard: revenuePinboard,
            bounds: {
                lower: 8000,
                upper: 11000
            }
        }
    ],
    slideShow: [
        {
            pinboard: revenuePinboard,
            bounds: {
                lower: 2500,
                upper: 4000
            }
        }
    ],
    sharePinboard: [
        {
            pinboard: revenuePinboard,
            principals: ['All', 'Administrator', 'guest1'],
            bounds: {
                lower: 14000,
                upper: 17000
            }
        }
    ],
    switchPinboard: [
        {
            from: revenuePinboard,
            to: genericPinboard,
            bounds: {
                lower: 4000,
                upper: 5000
            }
        },
        {
            from: genericPinboard,
            to: revenuePinboard,
            bounds: {
                lower: 9000,
                upper: 11000
            }
        }
    ],
    transformViz: [
        {
            pinboard: basicPinboard,
            viz: {
                name: 'Visualization 1',
                column: 'Customer Region'
            },
            bounds: {
                lower: 9000,
                upper: 12000
            }
        }
    ],
    scrollPinboard: [
        {
            sources: ['LINEORDER', 'PART'],
            text: 'revenue color',
            vizCount: 5
        }
    ]
};

// Artifacts for tests in answer-page-scenarios.js.
let answerPageScenarios = {
    // Data sources that are pre-selected when testing load time for
    // answer-page.
    loadAnswerPage: {
        sources: [
            'LINEORDER', 'CUSTOMER', 'PART', 'SALES', 'PURCHASES'
        ],
        bounds: {
            lower: 3200,
            upper: 3800
        }
    },
    selectAllSources: {
        bounds: {
            lower: 1800,
            upper: 2500
        }
    },
    // Queries made to measure time to execute adhoc queries from Search bar.
    adhocQueries: [
        {
            sources: ['LINEORDER', 'PART'],
            text: 'revenue color',
            bounds: {
                lower: 2000,
                upper: 2700
            }
        }
    ],
    // Input for test to measure runtime for choosing sources from left panel.
    chooseSources: [
        {
            name: '5 sources - small',
            sources: ['LINEORDER', 'CUSTOMER', 'PART', 'SALES', 'PURCHASES'],
            bounds: {
                lower: 6500,
                upper: 8500
            }
        }
    ]
};

// Artifacts for tests in saved-answer-scenarios.js.
let regionRevenueByPartAnswer = {
    id: '2798f0da-4b99-4663-a9fe-b60e4d9e867f',
    name: 'Region Revenue by Part'
};
let brandRevenueTrendAnswer = {
    id: 'c4a51d65-2bcf-4c1d-b0b1-89c5570deddd',
    name: 'Brand Revenue Trend'
};
let basicAnswer1 = {
    id: 'c4a51d65-2bcf-4c1d-b0b1-89c5570deddd',
    name: 'Basic Answer 1'
};
let thoughtSpotFirstReportAnswer = {
    name: 'ThoughtSpot first report',
    guid: '540c45f4-397b-4455-b576-2ddf9af0a33c'
};
let brandRevenueIIAnswer = {
    name: 'Brand Revenue II',
    guid: '4f28ae5d-7ef8-40f7-a3e5-84b6fdb574e3'
};
let averageRevenueByPartAnswer = {
    name: 'Average Revenue by Part',
    guid: '186d5a92-d5f1-44a0-9793-7cadc6c8b4b1'
};

let savedAnswerScenarios = {
    // Sample answers that used to measure load time for saved answers.
    // NOTE: @id field in @loadAnswers isn't used.
    loadAnswers: [
        {
            answer: regionRevenueByPartAnswer,
            bounds: {
                lower: 1800,
                upper: 2700
            }
        }
    ],
    // Sample answers that are used measure time to edit tokens in an Answer.
    // NOTE: @id field in @editAnswers isn't used.
    editAnswers: [
        {
            answer: regionRevenueByPartAnswer,
            bounds: {
                lower: 2200,
                upper: 3000
            }
        }
    ],
    // Add Formula to Saved Answer test scenario inputs.
    addFormula: [
        {
            answer: brandRevenueTrendAnswer,
            formula: {
                name: 'some-formula',
                expr: 'revenue + tax * strlen (color)'
            },
            bounds: {
                lower: 7000,
                upper: 9000
            }
        }
    ],
    // Tables for which download performance should be tested.
    downloadTable: [
        {
            answer: basicAnswer1,
            formats: {
                csv: {
                    name: 'csv',
                    bounds: {
                        lower: 1000,
                        upper: 2000
                    }
                },
                pdf: {
                    name: 'pdf',
                    bounds: {
                        lower: 1000,
                        upper: 2500
                    }
                },
                xlsx: {
                    name: 'xlsx',
                    bounds: {
                        lower: 1000,
                        upper: 2500
                    }
                }
            }
        }
    ],
    // Input for test to measure drill down on an Answer performance.  Answers
    // in the specification should contain Chart viz.
    drillDown: [
        {
            answer: thoughtSpotFirstReportAnswer,
            column: 'Ship Priority',
            bounds: {
                lower: 3000,
                upper: 4500
            }
        }
    ],
    // Input for test to measure performance of renaming an Answer.  Input
    // should contain Answers with small, medium & large payload.
    renameAnswer: [
        {
            answer: brandRevenueIIAnswer,
            bounds: {
                lower: 2500,
                upper: 4000
            }
        }
    ],
    // Input for test to measure performance of creating copy of an Answer.
    // Input should contain Answers with small, medium & large payload.
    copyAnswer: [
        {
            answer: brandRevenueIIAnswer,
            bounds: {
                lower: 4500,
                upper: 6500
            }
        }
    ],
    // Input for test to measure performance of adding & removing column
    // from the left panel.
    addColumnFromLeftPanel: [
        {
            answer: averageRevenueByPartAnswer,
            column: {
                source: 'PART',
                name: 'Color'
            },
            bounds: {
                lower: 5000,
                upper: 6500
            }
        }
    ],
    // Input for test to measure performance of adding filter from the left
    // panel.
    addFilterFromLeftPanel: [
        {
            answer: averageRevenueByPartAnswer,
            column: {
                source: 'PART',
                name: 'Color'
            },
            values: ['almond', 'antique'],
            bounds: {
                lower: 5000,
                upper: 7000
            }
        }
    ],
    // Input for test to measure performance of saving an Answer as Aggregated
    // Worksheet.
    saveAsAggregatedWkSheet: [
        {
            answer: averageRevenueByPartAnswer,
            bounds: {
                lower: 5000,
                upper: 7500
            }
        }
    ],
    // Input for test to measure performance of changing viz type of an Answer.
    changeVizType: [
        {
            answer: brandRevenueIIAnswer,
            // This value can be either 'TABLE' or one of the chart types
            // defined in scenarios/charts/charts.js
            vizType: 'TABLE',
            bounds: {
                lower: 2500,
                upper: 4500
            }
        }
    ]
};

var phoneChasmTrapWorksheet = {
    id: 'd61d3b15-a774-4830-a372-0ac1f9769531',
    name: 'Phone Chasmtrap',
    columns: [
        {
            name: 'Clicks',
            source: 'Phone Contacts'
        }
    ]
};

var chasmTrapWorksheet = {
    id: '07a8af30-cd9d-4ab0-a58a-544a818ddac7',
    name: 'Chasmtrap',
    formulas: [
        {
            name: 'dow_today',
            expression: 'day_of_week(today())'
        }
    ]
};

var worksheetScenarios = {
    // Create worksheet test scenario inputs.
    createWorksheet: [
        {
            name: '4 sources - small',
            sources: ['LINEORDER', 'CUSTOMER', 'PART', 'SUPPLIER'],
            bounds: {
                lower: 11000,
                upper: 14000
            }
        }
    ],
    // Open worksheet test scenario inputs.
    openWorksheet: [
        {
            worksheet: phoneChasmTrapWorksheet,
            bounds: {
                lower: 200,
                upper: 500
            }
        }
    ],
    // Edit worksheet test scenario inputs.
    editWorksheet: [
        {
            worksheet: phoneChasmTrapWorksheet,
            column: phoneChasmTrapWorksheet.columns[0],
            bounds: {
                lower: 6000,
                upper: 7500
            }
        }
    ],
    // Copy worksheet test scenario inputs.
    copyWorksheet: [
        {
            worksheet: phoneChasmTrapWorksheet,
            bounds: {
                lower: 5500,
                upper: 8000
            }
        }
    ],
    // Delete worksheet test scenario inputs.
    deleteWorksheet: [
        {
            worksheet: phoneChasmTrapWorksheet,
            bounds: {
                lower: 6000,
                upper: 8000
            }
        }
    ],
    // Add formula to worksheet test scenario inputs.
    addFormula: [
        {
            worksheet: chasmTrapWorksheet,
            formulas: chasmTrapWorksheet.formulas,
            bounds: {
                lower: 6000,
                upper: 8000
            }
        }
    ],
    // Delete formula from worksheet test scenario inputs.
    deleteFormula: [
        {
            worksheet: chasmTrapWorksheet,
            formulas: chasmTrapWorksheet.formulas,
            bounds: {
                lower: 2000,
                upper: 3000
            }
        }
    ],
    // Edit formula in worksheet test scenario inputs.
    editFormula: [
        {
            worksheet: chasmTrapWorksheet,
            formulas: chasmTrapWorksheet.formulas,
            bounds: {
                lower: 5500,
                upper: 7500
            }
        }
    ]
};

let adminUser1 = {
    userName: 'perf-test-admin-user',
    displayName: 'Perf Admin',
    password: 'perf-test-admin-password'
};

let nonAdminUser1 = {
    userName: 'perf-test-user-1',
    displayName: 'Perf Tester',
    password: 'perf-test-password'
};

let adminGroup1 = {
    groupName: 'perf-test-admin-group',
    displayName: 'Perf Admin Group'
};

let nonAdminGroup1 = {
    groupName: 'perf-test-user-group',
    displayName: 'Perf Tester Group'
};

let perfTestGroups = [
    {
        groupName: 'perf-test-group-1',
        displayName: 'Perf Test Group 1'
    },
    {
        groupName: 'perf-test-group-2',
        displayName: 'Perf Test Group 2'
    },
    {
        groupName: 'perf-test-group-3',
        displayName: 'Perf Test Group 3'
    }
];

let userManagementScenarios = {
    addNonAdminUsers: [
        {
            user: nonAdminUser1,
            bounds: {
                lower: 4000,
                upper: 6000
            }
        }
    ],
    addAdminUsers: [
        {
            user: adminUser1,
            bounds: {
                lower: 5000,
                upper: 7000
            }
        }
    ],
    deleteNonAdminUsers: [
        {
            user: nonAdminUser1,
            bounds: {
                lower: 5000,
                upper: 7000
            }
        }
    ],
    deleteAdminUsers: [
        {
            user: adminUser1,
            bounds: {
                lower: 5000,
                upper: 7000
            }
        }
    ],
    addAdminGroups: [
        {
            group: adminGroup1,
            bounds: {
                lower: 3500,
                upper: 4500
            }
        }
    ],
    deleteAdminGroups: [
        {
            group: adminGroup1,
            bounds: {
                lower: 5000,
                upper: 7000
            }
        }
    ],
    addNonAdminGroups: [
        {
            group: nonAdminGroup1,
            bounds: {
                lower: 3500,
                upper: 4500
            }
        }
    ],
    deleteNonAdminGroups: [
        {
            group: nonAdminGroup1,
            bounds: {
                lower: 5000,
                upper: 7000
            }
        }
    ],
    addUserToGroups: [
        {
            testName: 'addNonAdminUserToMultipleGroups',
            user: nonAdminUser1,
            groupsToBeAddedTo: perfTestGroups,
            bounds: {
                lower: 5000,
                upper: 7000
            }
        }
    ],
    addGroupToGroups: [
        {
            testName: 'addAGroupToMultipleGroups',
            groupToAdd: nonAdminGroup1,
            groupsToBeAddedTo: perfTestGroups,
            bounds: {
                lower: 5000,
                upper: 7000
            }
        }
    ],
    removeUserFromGroups: [
        {
            testName: 'removeNonAdminUserFromNonAdminGroup',
            user: nonAdminUser1,
            group: nonAdminGroup1,
            bounds: {
                lower: 4000,
                upper: 6000
            }
        }
    ],
    removeGroupFromGroups: [
        {
            testName: 'removeGroupFromNonAdminGroup',
            groupToRemove: perfTestGroups[0],
            groupToBeRemovedFrom: nonAdminGroup1,
            bounds: {
                lower: 4000,
                upper: 6000
            }
        }
    ]
};

module.exports = {
    name: 'tpch',
    label: 'perf-tpch',
    homePageScenarios: homePageScenarios,
    listPageScenarios: listPageScenarios,
    pinboardScenarios: pinboardScenarios,
    savedAnswerScenarios: savedAnswerScenarios,
    answerPageScenarios: answerPageScenarios,
    worksheetScenarios: worksheetScenarios,
    userManagementScenarios: userManagementScenarios,
};
