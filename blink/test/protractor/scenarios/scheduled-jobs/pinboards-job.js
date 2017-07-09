/**
* Copyright: ThoughtSpot Inc. 2016
* Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
*/

'use strict';

var common = require('../common.js');
var blinkListFunctions = require('../list/blink-list.js');
var scheduler = require('../share/scheduler-ui.js');
var share = require('../share/share-ui.js');
var dialog = require('../dialog.js');
var util = common.util;

var selectors = {
    NEW_SCHEDULE: '.bk-create-new-job',
    JOB_NAME: '.bk-job-name',
    JOB_DESCRIPTION: '.bk-job-description',
    PAUSE_BTN: '.bk-pause-job-btn',
    RESUME_BTN: '.bk-resume-job-btn',
    DELETE_BTN: '.bk-style-icon-delete',
    JOBS_LIST: '.bk-report-list',
    PRIMARY_BUTTON: '.bk-btn-schedule',
    SECONDARY_BUTTON: '.bk-btn-back',
    JOB_TITLE: '.bk-job-schedule .bk-header',
    JOB_TITLE_PINBOARD_LINK: '.bk-page-title a',
    PRINCIPAL_SELECT_CONTAINER: '.bk-principals-selector-container'
};

function clickOnNewJob() {
    $(selectors.NEW_SCHEDULE).click();
}

function createJobForPinboard(job, schedule, emails, principals, dontSaveSchedule) {
    clickOnNewJob();
    fillMetadata(job.name, job.name);
    fillSchedule(schedule.repeats, schedule.frequency, null, schedule.days);

    if (emails) {
        addEmailPrincipal(emails);
    }

    if (principals) {
        addPrincipals(principals);
    }

    if (!dontSaveSchedule) {
        confirmSchedulingOfJob();
    }

}


function deleteJob(jobName) {
    blinkListFunctions.deleteItemsByName('',  [jobName]);
}

function pauseJob(jobName) {
    selectJob(jobName);
    $(selectors.PAUSE_BTN).click();
}

function selectJob(jobName) {
    blinkListFunctions.checkItems(blinkListFunctions.selectors.DATA_UI_LIST, [jobName]);
}

function resumeJob(jobName) {
    selectJob(jobName);
    $(selectors.RESUME_BTN).click();
}

function fillMetadata(name, description, type) {
    $(selectors.JOB_NAME).sendKeys(name);
    $(selectors.JOB_DESCRIPTION).sendKeys(description);
}

function checkJobName(name) {
    expect($(selectors.JOB_NAME).getAttribute('value')).toBe(name);
}

function checkJobDescription(description) {
    expect($(selectors.JOB_DESCRIPTION).getAttribute('value')).toBe(description);
}

function checkJobHeader(jobName, pinboardName) {
    expect($(selectors.JOB_TITLE).getText()).toContain(jobName);
    expect($(selectors.JOB_TITLE_PINBOARD_LINK).getText()).toContain(pinboardName);
}

function addEmailPrincipal(emails) {
    emails.forEach(function(email) {
        util.scrollElementIntoViewPort(element(by.css('.bk-add-email')));
        element(by.css('.bk-add-email input')).sendKeys(email);
        element(by.css('.bk-add-email .bk-add-users-buttons')).click();
    });
}

function addPrincipals(principals) {
    principals.forEach(function(principal){
        common.metadataItemSelector.selectOption(selectors.PRINCIPAL_SELECT_CONTAINER, principal);
    });
    $$('.bk-add-users-buttons').first().click();
}

function fillSchedule(repeats, frequency, atTime, checkedDays) {
    scheduler.fillSchedule(repeats, frequency, atTime, checkedDays);
}

function confirmSchedulingOfJob() {
    var button = element(by.css(selectors.PRIMARY_BUTTON));
    common.util.waitForAndClick(button);
    return common.util.waitForElement(selectors.JOBS_LIST);
}

function cancelSchedulingOfJob() {
    element(by.css(selectors.SECONDARY_BUTTON)).click();
}


module.exports =  {
    addEmailPrincipal: addEmailPrincipal,
    addPrincipal: addPrincipals,
    clickOnNewJob: clickOnNewJob,
    checkJobHeader: checkJobHeader,
    checkJobName: checkJobName,
    checkJobDescription: checkJobDescription,
    createJobForPinboard: createJobForPinboard,
    deleteJob: deleteJob,
    fillMetadata: fillMetadata,
    fillSchedule: fillSchedule,
    pauseJob: pauseJob,
    resumeJob: resumeJob,
    selectJob: selectJob,
    selectors: selectors,
    cancelSchedulingOfJob: cancelSchedulingOfJob,
    confirmSchedulingOfJob: confirmSchedulingOfJob

};
