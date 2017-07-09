/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview E2E scenarios for jobs on pinboards
 */

'use strict';

/* eslint camelcase: 1 */
var common = require('../common.js');
var util = common.util;
var nav = common.navigation;
var pinboards = require('../pinboards/pinboards.js');
var actionButtons = require ('../actions-button.js');
var pinboardJobs = require('./pinboards-job.js');
var scheduler = require('../share/scheduler-ui.js');
var share = require('../share/share-ui.js');
var admin = require('../admin-ui/admin-ui.js');
var blinkList = require('../list/blink-list.js');

var pinboardToOpen = {
    name: 'Basic Pinboard 1',
    id: '7752fa9e-db22-415e-bf34-e082c4bc41c3'
};

var pinboardSchedulePath = '/schedules';
var pinboardScheduleEditPath = '/schedule';

var userToAdd = {
    name: '[user test1]'
};

var groupToAdd = {
    name: '[group test1]',
    privileges: [admin.privileges[5]],
    users: [userToAdd.name]
};

var schedules = {
    EVERY10MINUTES: {
        repeats: scheduler.repeats.MINUTES,
        frequency: '10',
        days: [
            scheduler.checkedDays.MONDAY,
            scheduler.checkedDays.FRIDAY
        ]
    },
    DAILYAT9H45: {
        repeats: scheduler.repeats.WEEKLY,
        at: {
            hour: '09',
            minute: '45'
        }
    }
};

var jobToAdd = {
    name: '[test job1]'
};

var job2ToAdd = {
    name: '[test job2]'
};

var job3ToAdd = {
    name: '[test job3]'
};

var selectors = {
    PAUSED_JOB : '.bk-style-icon-pause',
    RUNNING_JOB: '.bk-style-icon-play'
};

var listItems = blinkList.selectors.METADATA_LIST_ITEMS_CONTENT;

describe('Access to jobs page for a given pinboard', function() {

    beforeEach(function(){
        admin.loginAsAdmin();
    });

    it('should be accessible for admin user', function(){
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.checkIfButtonIsEnabled(actionButtons.actionLabels.VIEW_SCHEDULES);
    });

    it('[SMOKE][IE] should be accessible for user with Scheduling privileges', function() {
        nav.goToAdminSection();
        admin.addNewUser(userToAdd.name, userToAdd.name, userToAdd.name, true);
        admin.addNewGroup(groupToAdd.name, groupToAdd.name, groupToAdd.privileges, groupToAdd.users);
        nav.goToPinboardsSection();
        pinboards.sharePinboard(pinboardToOpen.name, [userToAdd.name], true);
        util.reLogin(userToAdd.name, userToAdd.name);
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.checkIfButtonIsEnabled(actionButtons.actionLabels.VIEW_SCHEDULES);
        admin.loginAsAdmin();
        admin.goToUserManagement();
        admin.deleteListItem(userToAdd.name);
        admin.goToGroupManagement();
        admin.deleteListItem(groupToAdd.name);
    });

    it('should not be accessible in other case', function(){
        nav.goToAdminSection();
        admin.addNewUser(userToAdd.name, userToAdd.name, userToAdd.name, true);
        nav.goToPinboardsSection();
        pinboards.sharePinboard(pinboardToOpen.name, [userToAdd.name], true);
        util.reLogin(userToAdd.name, userToAdd.name);
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.checkIfButtonIsDisabled(actionButtons.actionLabels.VIEW_SCHEDULES);
        admin.loginAsAdmin();
        admin.goToUserManagement();
        admin.deleteListItem(userToAdd.name);
    });

    it('should go on correct route', function(){
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        var path = pinboardSchedulePath + '/' + pinboardToOpen.id;
        util.checkForPath(path);
        pinboardJobs.clickOnNewJob();
        var path = pinboardScheduleEditPath + '/' + pinboardToOpen.id;
        util.checkForPath(path);

    });

    it('[SMOKE][IE] it should be able to create and delete a job', function(){
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(jobToAdd, schedules.EVERY10MINUTES, ['test1@gmail.com'], null);
        expect(element.all(by.css(listItems)).count()).toBe(1);
        pinboardJobs.deleteJob(jobToAdd.name);
        expect(element.all(by.css(listItems)).count()).toBe(0);
    });

    it('should be able to pause/resume a job', function(){
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(jobToAdd, schedules.EVERY10MINUTES, ['test1@gmail.com'], null);
        // job should be scheduled
        var containingList = element(by.css(blinkList.selectors.LIST_CONTAINER));
        expect(containingList.all(by.css(selectors.RUNNING_JOB)).count()).toBe(1);
        pinboardJobs.pauseJob(jobToAdd.name);
        expect(containingList.all(by.css(selectors.PAUSED_JOB)).count()).toBe(1);
        expect(containingList.all(by.css(selectors.RUNNING_JOB)).count()).toBe(0);
        pinboardJobs.resumeJob(jobToAdd.name);
        expect(containingList.all(by.css(selectors.RUNNING_JOB)).count()).toBe(1);
        pinboardJobs.deleteJob(jobToAdd.name);
        // we dont show the list if there are no elements
        util.waitForElementCountToBe(pinboardJobs.selectors.JOB_TITLE, 0);
    });


    it("if user is not admin, can only see his job, or job he is part of", function() {
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(jobToAdd, schedules.EVERY10MINUTES, ['test1@gmail.com'], null);
        nav.goToAdminSection();
        admin.addNewUser(userToAdd.name, userToAdd.name, userToAdd.name, true);
        admin.addNewGroup(groupToAdd.name, groupToAdd.name, groupToAdd.privileges, groupToAdd.users);
        nav.goToPinboardsSection();
        pinboards.sharePinboard(pinboardToOpen.name, [userToAdd.name], true);
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(job3ToAdd, schedules.EVERY10MINUTES, null, [userToAdd.name]);
        util.reLogin(userToAdd.name, userToAdd.name);
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(job2ToAdd, schedules.EVERY10MINUTES, ['test1@gmail.com'], null);

        // we should not see the job created by the administrator
        blinkList.checkIfItemExist('', jobToAdd.name, 0);
        pinboardJobs.selectJob(job2ToAdd.name);
        blinkList.checkIfActionButtonIsEnabled(pinboardJobs.selectors.PAUSE_BTN);
        pinboardJobs.selectJob(job3ToAdd.name);
        blinkList.checkIfActionButtonIsDisabled(pinboardJobs.selectors.PAUSE_BTN);
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, job3ToAdd.name);
        //check that row is not clickable, by checking that we dont navigate away
        var path = pinboardSchedulePath + '/' + pinboardToOpen.id;
        util.checkForPath(path);
        admin.loginAsAdmin();
        admin.goToUserManagement();
        admin.deleteListItem(userToAdd.name);
        admin.goToGroupManagement();
        admin.deleteListItem(groupToAdd.name);
        admin.goToJobManagement();
        admin.deleteListItem(jobToAdd.name);
        admin.deleteListItem(job2ToAdd.name);
        admin.deleteListItem(job3ToAdd.name);
    });
    it('emails can be entered as a comma separated list', function(){
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(jobToAdd, schedules.EVERY10MINUTES, ['test1@gmail.com, test2@gmail.com'], null);
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, jobToAdd.name);
        expect(share.permissionWithPrincipal('test1@gmail.com').count()).toBe(1);
        expect(share.permissionWithPrincipal('test2@gmail.com').count()).toBe(1);
        nav.goToAdminSection();
        admin.goToJobManagement();
        admin.deleteListItem(jobToAdd.name);
    });

    it('information about a given job should be correct', function(){
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(jobToAdd, schedules.EVERY10MINUTES, ['test1@gmail.com'], null);
        blinkList.selectItemByName(blinkList.selectors.ACTIONABLE_LIST_CONTENT, jobToAdd.name);
        expect(share.permissionWithPrincipal('test1@gmail.com').count()).toBe(1);
        pinboardJobs.checkJobName(jobToAdd.name);
        pinboardJobs.checkJobDescription(jobToAdd.name);
        pinboardJobs.checkJobHeader(jobToAdd.name, pinboardToOpen.name);
        scheduler.checkFrequency(schedules.EVERY10MINUTES.frequency);
        scheduler.checkRepeat(schedules.EVERY10MINUTES.repeats);
        scheduler.checkDays(schedules.EVERY10MINUTES.days);
        nav.goToAdminSection();
        admin.goToJobManagement();
        admin.deleteListItem(jobToAdd.name);
    });

    it('SCAL-18053 should be able to add itself to the recipient list', function(){
        var adminName = 'tsadmin';
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(job3ToAdd, schedules.EVERY10MINUTES, null, [adminName], true);
        util.waitForElementCountToBe(share.permissionWithPrincipal(adminName), 1);
    });

    //Note(chab) this check that skipped ids work properly
    it('[SMOKE][IE] It should be able to add emails, principals, in multiple pass', function() {
        var adminName = 'Guest 3';
        nav.goToPinboardsSection();
        pinboards.openPinboard(pinboardToOpen.name);
        actionButtons.selectActionButtonAction(actionButtons.actionLabels.VIEW_SCHEDULES);
        pinboardJobs.createJobForPinboard(job3ToAdd, schedules.EVERY10MINUTES, null, [adminName], true);
        pinboardJobs.addEmailPrincipal(['test@gmail.com']);
        pinboardJobs.addPrincipal(['Guest 4']);
        pinboardJobs.addEmailPrincipal(['test2@gmail.com']);
        share.removePrincipal('Guest 4');
        pinboardJobs.addPrincipal(['Guest 4']);
        util.waitForElementCountToBe(share.selectors.PERMISSION_ITEM, 4);
    });
});
