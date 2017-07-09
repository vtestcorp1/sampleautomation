/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

// This file contains various artificats from Charles Schwab's dataset that the
// perf tests should run against.

var executiveSummaryPinboard = {
    id: '5ac19a74-3744-4ef5-8eb7-28ac374e8c0b',
    name: 'Executive Summary',
};
var SLMarketTemperaturePinboard = {
    id: '6230e651-d761-47ef-8653-80a81b6561b9',
    name: 'SL Market Temperature',
};
var buyInRiskPinboard = {
    id: '113018d3-4603-4e43-997f-e5e3ec5ca39b',
    name: 'Buy In Risk',
};
var securitiesCategorizationsPinboard = {
    id: '5475d42e-01bc-4e74-9f2a-a56f5b401b5f',
    name: 'Securities - Categorizations',
};
var SL7DataMarketTemperaturePinboard = {
    id: '8b81c345-d6ba-4c46-87d9-8db4e8fb5664',
    name: 'SL 7-Day Market Temperature',
};

// Artifacts for tests in home-page-scenarios.js.
var homePageScenarios = {
    loadHomePage: [
        {
            pinboard: SLMarketTemperaturePinboard
        }
    ],
    switchPinboard: []
};

let listPageScenarios = {
    pinboardsListPage: {},
    answersListPage: {}
};

// Artifacts for tests in pinboard-scenarios.js.
var pinboardScenarios = {
    // Sample pinboards that are used to measure load times for pinboards.
    // NOTE: @id field in @goldenPinboards aren't currently used.
    // {
    //     id: '38728969-c6e5-4190-899d-60a7edf01922',
    //     name: 'Fullypaid Reporting',
    //     editViz: 'FP Landscape Yesterday'
    // },
    loadPinboard: [
        {
            pinboard: executiveSummaryPinboard
        },
        {
            pinboard: SLMarketTemperaturePinboard
        },
        {
            pinboard: buyInRiskPinboard
        },
        {
            pinboard: securitiesCategorizationsPinboard
        },
        {
            pinboard: SL7DataMarketTemperaturePinboard
        }
    ],
    openViz: [
        {
            pinboard: executiveSummaryPinboard,
            viz: 'Top 10 Securities'
        },
        {
            pinboard: SLMarketTemperaturePinboard,
            viz: 'Schwab vs. Market loan rate, last 7 days'
        },
        {
            pinboard: buyInRiskPinboard,
            viz: 'Collateral Deficit Sensitivity Analysis'
        },
        {
            pinboard: securitiesCategorizationsPinboard,
            viz: 'ETF vs non ETF - Revenue'
        },
        {
            pinboard: SL7DataMarketTemperaturePinboard,
            viz: 'Top 1 Symbol, yesterday'
        }
    ],
    editViz: [
        {
            pinboard: executiveSummaryPinboard,
            viz: 'Top 10 Securities'
        },
        {
            pinboard: SLMarketTemperaturePinboard,
            viz: 'Schwab vs. Market loan rate, last 7 days'
        },
        {
            pinboard: buyInRiskPinboard,
            viz: 'Collateral Deficit Sensitivity Analysis'
        },
        {
            pinboard: securitiesCategorizationsPinboard,
            viz: 'ETF vs non ETF - Revenue'
        },
        {
            pinboard: SL7DataMarketTemperaturePinboard,
            viz: 'Top 1 Symbol, yesterday'
        }
    ],
    addViz: [],
    addFilter: [],
    makeCopy: [],
    slideShow: [],
    sharePinboard: [],
    switchPinboard: [],
    transformViz: [],
    scrollPinboard: []
};

// Artifacts for tests in answer-page-scenarios.js.
var answerPageScenarios = {
    // Data sources that are pre-selected when testing load time for
    // answer-page.
    loadAnswerPage: {
        sources: [
            '7 Days Ago Total Loan Amt', 'ACCT_BALANCE', 'Availability',
            'BPT_Positions', 'BPT_Short_Positions', 'client whole position symbols',
            'DividendAggregateResult2', 'FOXA Price range 2015',
            'high vs low revenue', 'Historical_Margin_Balances', 'Hotstock',
            'Open Contract - Holidays', 'Open Contracts WS', 'Rough Calc',
            'SLFP_ACCOUNT_INFO2'
        ]
    },
    selectAllSources: {
    },
    // Queries made to measure time to execute adhoc queries from Search bar.
    adhocQueries: [
        {
            sources: ['SL Market Temp Top 5 Securities'],
            text: 'rank = 1 symbol gross revenue yesterday schwab utilization '
        },
        {
            sources: ['Rate Logic Pre-Final Aggregated WS'],
            text: 'deepening etf/hard rate schwab deepest rate lp min rate cash borrow rate standard hard rate lp total rate '
        },
        {
            sources: ['biz_days', 'BPT_Trans', 'ContractInfo', 'COST_OF_FUNDS',
                'DividendAggregateResult2', 'LFA_Daily_Stmt', 'LFArates',
                'OpenContract', 'Recalls', 'ShortSale'],
            text: 'orig system cd m order taker id biz_days_ago cost_of_funds client pct rt si acct cd audit_user '
        },
        {
            sources: ['Counterparties, Securities aggr WS'],
            text: 'loan amount cusip '
        },
        {
            sources: ['FP AS Outreach Worksheet'],
            text: 'cusip customer name borrowed yesterday market value '
        },
        {
            sources: ['COST_OF_FUNDS', 'DataExplorer', 'OpenContract'],
            text: 'active avail val bal 3 day record type bal 7 day business date contract amt cost_of_funds '
        },
    ],
    // Input for test to measure runtime for choosing sources from left panel.
    chooseSources: [
    ]
};

// Artifacts for tests in saved-answer-scenarios.js.
var rateLoginSecurityClassificationAnswer = {
    id: '84a0709a-7af1-4798-a7c6-fae3e72126e3',
    name: 'Rate Logic Security Classification'
};
var topRerateOppsFasterAnswer = {
    id: 'eccab8c3-b2a3-421d-a0aa-262964e1077d',
    name: 'Top Rerate Opps (faster)'
};
var rateLogicAnswer = {
    id: 'fdb5ab9b-ad36-47f2-b558-64da20723bda',
    name: 'Rate Logic Answer'
};
var hotstocksPerAccountAnswer = {
    id: '32a2a799-ff77-4479-9a05-9b290b4f19f3',
    name: 'hotstocks per account'
};
var collateralDiversificationAnswer = {
    id: '7a999d47-3fc9-4963-9008-85b82fd46246',
    name: 'Collateral Diversification'
};
var recentOpenContractLoadsAnswer = {
    id: 'c2dde263-c1c4-493a-bec1-0982091be064',
    name: 'Recent OpenContract loads'
};
var queryHashIssueReproAnswer = {
    id: 'c34cb9d7-e54e-40d5-8a6d-f44f4b16e58b',
    name: 'query hash issue repro'
};
var savedAnswerScenarios = {
    // Sample answers that used to measure load time for saved answers.
    // NOTE: @id field in @loadAnswers aren't currently used.
    loadAnswers: [
        {
            answer: rateLoginSecurityClassificationAnswer
        },
        {
            answer: topRerateOppsFasterAnswer
        },
        {
            answer: rateLogicAnswer
        },
        {
            answer: hotstocksPerAccountAnswer
        },
        {
            answer: collateralDiversificationAnswer
        },
        {
            answer: recentOpenContractLoadsAnswer
        },
        {
            answer: queryHashIssueReproAnswer
        }
    ],
    // Sample answers that used to measure time to edit tokens in saved answers.
    // NOTE: @id field in @editAnswers aren't currently used.
    editAnswers: [
        {
            answer: rateLoginSecurityClassificationAnswer
        },
        {
            answer: topRerateOppsFasterAnswer
        },
        {
            answer: rateLogicAnswer
        },
        {
            answer: hotstocksPerAccountAnswer
        },
        {
            answer: collateralDiversificationAnswer
        },
        {
            answer: recentOpenContractLoadsAnswer
        },
        {
            answer: queryHashIssueReproAnswer
        }
    ],
    // Add Formula to Saved Answer test scenario inputs.
    addFormula: [
    ],
    // Tables for which download performance should be tested.
    downloadTable: [
    ],
    // Input for test to measure drill down on an Answer performance.
    drillDown: [
    ],
    // Input for test to measure performance of renaming an Answer.  Input
    // should contain Answers with small, medium & large payload.
    renameAnswer: [
    ],
    // Input for test to measure performance of creating copy of an Answer.
    // Input should contain Answers with small, medium & large payload.
    copyAnswer: [
    ],
    // Input for test to measure performance of adding & removing column
    // from the left panel.
    addColumnFromLeftPanel: [
    ],
    // Input for test to measure performance of adding filter from the left
    // panel.
    addFilterFromLeftPanel: [
    ],
    // Input for test to measure performance of saving an Answer as Aggregated
    // Worksheet.
    saveAsAggregatedWkSheet: [
    ],
    // Input for test to measure performance of changing viz type of an Answer.
    changeVizType: [
    ]
};

var worksheetScenarios = {
    // Create worksheet test scenario inputs.
    createWorksheet: [],
    // Open worksheet test scenario inputs.
    openWorksheet: [],
    // Edit worksheet test scenario inputs.
    editWorksheet: [],
    // Copy worksheet test scenario inputs.
    copyWorksheet: [],
    // Delete worksheet test scenario inputs.
    deleteWorksheet: [],
    // Add formula to worksheet test scenario inputs.
    addFormula: [],
    // Delete formula from worksheet test scenario inputs.
    deleteFormula: [],
    // Edit formula in worksheet test scenario inputs.
    editFormula: []
};

var adminUser1 = {
    userName: 'perf-test-admin-user',
    displayName: 'Perf Admin',
    password: 'perf-test-admin-password'
};

var nonAdminUser1  = {
    userName: 'perf-test-user-1',
    displayName: 'Perf Tester',
    password: 'perf-test-password'
};

var adminGroup1 = {
    groupName: 'perf-test-admin-group',
    displayName: 'Perf Admin Group'
};

var nonAdminGroup1 = {
    groupName: 'perf-test-user-group',
    displayName: 'Perf Tester Group'
};

var perfTestGroups = [
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

var userManagementScenarios = {
    addNonAdminUsers: [],
    deleteNonAdminUsers: [],
    addAdminUsers: [],
    deleteAdminUsers: [],
    addAdminGroups: [],
    deleteAdminGroups: [],
    addNonAdminGroups: [],
    deleteNonAdminGroups: [],
    addUserToGroups: [],
    addGroupToGroups: [],
    removeUserFromGroups: [],
    removeGroupFromGroups: []
};

module.exports = {
    name: 'schwab',
    label: 'perf-schwab',
    homePageScenarios: homePageScenarios,
    listPageScenarios: listPageScenarios,
    pinboardScenarios: pinboardScenarios,
    savedAnswerScenarios: savedAnswerScenarios,
    answerPageScenarios: answerPageScenarios,
    worksheetScenarios: worksheetScenarios,
    userManagementScenarios: userManagementScenarios
};
