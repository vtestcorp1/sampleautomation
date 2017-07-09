/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 */

/*jslint node: true */
'use strict';

// This file contains various artificats from Dogfood's dataset that the perf
// tests should run against.

var execPipelineDashboardPinboard = {
    id: 'f3908145-bb44-42ec-a8c2-fc6b21e31e98',
    name: 'EXEC Pipeline Dashboard',
};

var salesPipelineChangesPinboard = {
    id: 'd845a3d9-016e-4947-a5b9-9eaec089fa0f',
    name: 'SALES - Pipeline Changes',
};
var salesPOCVelocityAndSuccessRatePinboard = {
    id: 'cccd3c15-41f0-40ce-9aca-8f402cf7610c',
    name: 'SALES: POC velocity and success rate',
};
var salesMQLDashboardPinboard = {
    id: 'c30bbe6d-fd7c-4715-be50-e87a74a6a25a',
    name: 'SALES - MQL Dashboard',
};
var marketingWebsitePinboard = {
    id: '771152bb-1dea-42e3-8b9c-84bcae42da68',
    name: 'MARKETING - Website',
};
var engMetricsPinboard = {
    id: '63eab879-c545-4870-b7b8-170b23759812',
    name: 'EngMetrics',
};
var pinboardFiltersOnSalesCurrentPipelinePinboard = {
    id: '7761e6ae-72d7-4298-ace1-d0ec28ffd72c',
    name: 'Pinboard Filters on Sales Current Pipeline',
};

// Artifacts for tests in home-page-scenarios.js.
var homePageScenarios = {
    loadHomePage: [
        {
            pinboard: pinboardFiltersOnSalesCurrentPipelinePinboard
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
    loadPinboard: [
        {
            pinboard: execPipelineDashboardPinboard
        },
        {
            pinboard: salesPipelineChangesPinboard
        },
        {
            pinboard: salesPOCVelocityAndSuccessRatePinboard
        },
        {
            pinboard: salesMQLDashboardPinboard
        },
        {
            pinboard: marketingWebsitePinboard
        },
        {
            pinboard: engMetricsPinboard
        },
        {
            pinboard: pinboardFiltersOnSalesCurrentPipelinePinboard
        }
    ],
    openViz: [
        {
            pinboard: execPipelineDashboardPinboard,
            viz: 'MQLs, Last 90 Days'
        },
        {
            pinboard: salesPipelineChangesPinboard,
            viz: 'All Time Close Date Changes, L90'
        },
        {
            pinboard: salesPOCVelocityAndSuccessRatePinboard,
            viz: 'POC Wins vs. Losses'
        },
        {
            pinboard: salesMQLDashboardPinboard,
            viz: 'Chart 1'
        },
        {
            pinboard: marketingWebsitePinboard,
            viz: 'Website Visits Weekly'
        },
        {
            pinboard: engMetricsPinboard,
            viz: 'Top blink test failures last 10 runs. table'
        },
        {
            pinboard: pinboardFiltersOnSalesCurrentPipelinePinboard,
            viz: '#2 All Time Pipeline Total by Close Quarter'
        }
    ],
    editViz: [
        {
            pinboard: execPipelineDashboardPinboard,
            viz: 'MQLs, Last 90 Days'
        },
        {
            pinboard: salesPipelineChangesPinboard,
            viz: 'All Time Close Date Changes, L90'
        },
        {
            pinboard: salesPOCVelocityAndSuccessRatePinboard,
            viz: 'POC Wins vs. Losses'
        },
        {
            pinboard: salesMQLDashboardPinboard,
            viz: 'Chart 1'
        },
        {
            pinboard: marketingWebsitePinboard,
            viz: 'Website Visits Weekly'
        },
        {
            pinboard: engMetricsPinboard,
            viz: 'Top blink test failures last 10 runs. table'
        },
        {
            pinboard: pinboardFiltersOnSalesCurrentPipelinePinboard,
            viz: '#2 All Time Pipeline Total by Close Quarter'
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
            'accounts', 'assets', 'calls', 'campaign_members',
            'ENGINEERING: Jira Official', 'leads', 'MARKETING: Campaigns',
            'MARKETING: Leads', 'opportunities', 'SALES: Master',
            'SALES: Pipeline Trends', 'users'
        ]
    },
    selectAllSources: {
    },
    // Queries made to measure time to execute adhoc queries from Search bar.
    adhocQueries: [
        {
            sources: ['SALES: Master'],
            text: 'open pipeline ($) stage stage != stage 8 - booked stage != went away stage != stage 2 - prospecting stage != stage 1 - suspect/interest stage != lost stage != disqualified '
        },
        {
            sources: ['Jira Issue', 'organizations', 'satisfaction_ratings', 'ticket_metrics', 'tickets', 'users'],
            text: 'first_resolution_time_in_minutes status [production alert] critical hightail a00025 - task sage_worker.index_server terminated 1 times in last 0s '
        },
        {
            sources: ['MARKETING: Leads'],
            text: 'number of mqls region mql date '
        },
        {
            sources: ['MARKETING: Opportunities'],
            text: 'disqualified associated lead most recent mql touch id stage 1 opportunities created '
        }
    ],
    // Input for test to measure runtime for choosing sources from left panel.
    chooseSources: [
    ]
};

// Artifacts for tests in saved-answer-scenarios.js.
var mqlS3FunnelMonthlyAnswer = {
    id: 'eb79d255-9d5a-4663-9123-6bee8c2d4b64',
    name: 'MQL > S3 Funnel, Monthly'
};
var eventOpputunityAttributionAnswer = {
    id: '0701c820-53dd-4439-b07a-02b1c96d71f6',
    name: 'Event Opportunity Attribution'
};
var stage2AgeAnalysisAnswer = {
    id: '703fe839-2e19-4b37-9c9a-24d01e46e952',
    name: 'Stage 2 Age Analysis'
};
var walmartDBInfoAnswer = {
    id: '6f12de30-dc65-4d79-874e-b4feed041061',
    name: 'Walmart DB Info'
};
var allTimeS3AccountEventAttendenceAnswer = {
    id: 'e94660ed-44ec-4eaa-8785-d9e3c15225a9',
    name: 'All-Time S3s - Account Event Attendance'
};
var savedAnswerScenarios = {
    // Sample answers that used to measure load time for saved answers.
    // NOTE: @id field in @loadAnswers aren't currently used.
    loadAnswers: [
        {
            answer: mqlS3FunnelMonthlyAnswer
        },
        {
            answer: eventOpputunityAttributionAnswer
        },
        {
            answer: stage2AgeAnalysisAnswer
        },
        {
            answer: walmartDBInfoAnswer
        },
        {
            answer: allTimeS3AccountEventAttendenceAnswer
        }
    ],
    // Sample answers that used to measure time to edit tokens in an saved
    // answers.
    editAnswers: [
        {
            answer: mqlS3FunnelMonthlyAnswer
        },
        {
            answer: eventOpputunityAttributionAnswer
        },
        {
            answer: stage2AgeAnalysisAnswer
        },
        {
            answer: walmartDBInfoAnswer
        },
        {
            answer: allTimeS3AccountEventAttendenceAnswer
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

var salesPipelineTrendsWorksheet = {
    id: '351f5beb-fb95-4ff5-9f53-a1339e12e864',
    name: 'SALES: Pipeline Trends'
};

var salesMasterWorksheet = {
    id: '77fe3aa3-56a4-4b35-8c91-cf87efea8530',
    name: 'SALES: Master'
};

var enginnedJiraOfficialWorksheet = {
    id: 'afc83687-ece9-4485-ac08-71395869200d',
    name: 'ENGINEERING: Jira Official'
};

var worksheetScenarios = {
    // Create worksheet test scenario inputs.
    createWorksheet: [],
    // Open worksheet test scenario inputs.
    openWorksheet: [
        {
            worksheet: salesPipelineTrendsWorksheet
        },
        {
            worksheet: salesMasterWorksheet
        },
        {
            worksheet: enginnedJiraOfficialWorksheet
        }
    ],
    // Edit worksheet test scenario inputs.
    editWorksheet: [],
    // Copy worksheet test scenario inputs.
    copyWorksheet: [
        {
            worksheet: salesPipelineTrendsWorksheet
        },
        {
            worksheet: salesMasterWorksheet
        },
        {
            worksheet: enginnedJiraOfficialWorksheet
        }
    ],
    // Delete worksheet test scenario inputs.
    deleteWorksheet: [
        {
            worksheet: salesPipelineTrendsWorksheet
        },
        {
            worksheet: salesMasterWorksheet
        },
        {
            worksheet: enginnedJiraOfficialWorksheet
        }
    ],
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
    name: 'dogfood',
    label: 'perf-dogfood',
    homePageScenarios: homePageScenarios,
    listPageScenarios: listPageScenarios,
    pinboardScenarios: pinboardScenarios,
    savedAnswerScenarios: savedAnswerScenarios,
    answerPageScenarios: answerPageScenarios,
    worksheetScenarios: worksheetScenarios,
    userManagementScenarios: userManagementScenarios
};
