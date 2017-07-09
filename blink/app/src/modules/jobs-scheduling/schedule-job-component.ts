/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Controller for the scheduling wizard
 * This controller embeds a wizard for configuring scheduled reports
 *
 *
 */

import IPromise = angular.IPromise;
import IQService = angular.IQService;

import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {Component, ngRequire} from 'src/base/decorators';
import {getRouteParameter} from 'src/base/route-service';
import PrincipalsSelectorComponent from '../principal-selector/principal-selector';
import {BaseScheduledJobComponent} from './base-scheduled-job-component';
import {JobMetadataComponent} from './job-metadata-component/job-metadata-component';
import {JobFormatType, ReportTimelyJob} from './report-timely-job';
import {updateJobSchedule} from './scheduled-job-util';
import {getJob, scheduleJob, updateJob} from './timely-services';

let $q: IQService = ngRequire('$q');
let alertService = ngRequire('alertService');
let dateUtil = ngRequire('dateUtil');
let DocumentLoader = ngRequire('DocumentLoader');
let jsonConstants = ngRequire('jsonConstants');
let loadingIndicator = ngRequire('loadingIndicator');
let navService = ngRequire('navService');
let schedulerService = ngRequire('schedulerService');
let sessionService = ngRequire('sessionService');
let UserAction = ngRequire('UserAction');
let Logger = ngRequire('Logger');

@Component({
    name: 'bkScheduleReport',
    templateUrl: 'src/modules/jobs-scheduling/schedule-report-content.html'
})
export class ScheduleReportComponent extends BaseScheduledJobComponent {

    private static pinboardRouteParameter = 'pinboardId';
    private static jobRouteParameter = 'jobId';

    public jobMetadataComponent: JobMetadataComponent;
    public pinboardName: string;
    public hasError: boolean = false;
    public errorMessage = '';
    public isLoading: boolean = false;
    public strings: any = blinkConstants.report;
    public requiredString: string = blinkConstants.REQUIRED_FIELD;
    public saveButtonString: string = this.strings.schedule;
    public timeZoneString: string = dateUtil.getTimeZone();
    public principalsSelectorComponent: PrincipalsSelectorComponent;


    private vizIds: string[];

    private assignedPinboard;

    private scheduleConfig: any;
    private job: ReportTimelyJob;
    private pinboardId: string;

    private documentLoader:any = new DocumentLoader(_.noop, true);


    public constructor () {

        super();
        this.logger = Logger.create('scheduler-job-component');
        this.jobMetadataComponent = new JobMetadataComponent();

        // default options of scheduler
        this.scheduleConfig = {
            enabled: true,
            scheduleJob: true,
            monthOption: 'date',
            hour: '00',
            min: '00'
        };

        this.setupController(
            getRouteParameter(ScheduleReportComponent.jobRouteParameter),
            getRouteParameter(ScheduleReportComponent.pinboardRouteParameter)
        );
    }

    public canDisplayEditor() {
       return !this.hasError && !this.isLoading;
    }

    public startLoading() {
        loadingIndicator.show();
        this.isLoading = true;
    }

    public endLoading() {
        loadingIndicator.hide();
        this.isLoading = false;
    }

    public onCanvasStateChange = (params) => {
        let jobId = params[ScheduleReportComponent.jobRouteParameter];
        let pinboardId = params[ScheduleReportComponent.pinboardRouteParameter];
        this.setupController(jobId, pinboardId);
    }

    public isScheduleComplete(): boolean {
        return schedulerService.isCorrectlySetted(this.scheduleConfig);
    }

    public getNextOccurenceOfSchedule() {
        let schedule = schedulerService.getJobScheduleFromConfig(this.scheduleConfig);
        let cronStringSchedule = schedule.toString();
        let nextOccurence = dateUtil.getNextOccurencesOfCronPattern(cronStringSchedule, 1);

        if (!nextOccurence.length) {
            return null;
        }
        return dateUtil.formatDate(nextOccurence[0], 'MM/dd/yyyy HH:mm:ss', true, true);
    }

    public scheduleJob(): IPromise<any> {
        if (!this.job) {
            return;
        }

        this.setupJob();
        let userAction =  !this.job.getId() ?
            new UserAction(UserAction.CREATE_JOB) :
            new UserAction(UserAction.UPDATE_JOB);

        let successCallback: (any) => IPromise<any> =
            <(any) => IPromise<any>> this.onSaveSuccess.bind(this, userAction);
        let failureCallback: (any) => IPromise<any> =
            <(any) => IPromise<any>> this.onSaveFailure.bind(this, userAction);
        loadingIndicator.show();

        let action = !this.job.getId() ? scheduleJob : updateJob;
        return action(this.job).then(successCallback, failureCallback)
            .finally(loadingIndicator.hide.bind(loadingIndicator));
    }

    public isScheduleEnabled():boolean {
        let hasMetadata =  this.jobMetadataComponent.isMetadataComplete();
        let hasRecipients = this.recipients.length > 0;
        let hasSchedule = this.isScheduleComplete();
        return hasMetadata && hasRecipients && hasSchedule;
    }
    public getTitle() {

        if (!this.job.getId()) {
            return  blinkConstants.SCHEDULE_PINBOARD_CREATE;
        } else {
            return blinkConstants.SCHEDULE_PINBOARD_UPDATE.assign(this.job.getName());
        }
    }

    public getLinkTitle():string {
        return this.pinboardName;
    }

    public getLinkToPinboard():string {
        return '#/pinboard/' + this.pinboardId;
    }

    public cancel(): void {
        navService.goToPinboardScheduledReports(this.assignedPinboard);
    }

    /*TOOD(chab) implement once we get the date-utility for converting CRON to humand-readable
     public getScheduleSummary() {

     }*/
    private enableScheduler(): void {
        this.scheduleConfig.enabled = true;
    }

    private disableScheduler(): void {
        this.scheduleConfig.enabled = false;
    }

    private setupJob() {
        updateJobSchedule(this.job, this.scheduleConfig, this.recipients, this.logger);

        //TODO(chab) pull out the job from the subcomponent
        this.job.setName(this.job.getBackingProto().name);
        this.job.setDescription(this.job.getBackingProto().description);

        this.job.setFormatType(this.jobMetadataComponent.type);

        let maps: { [id: string]: string[] } = {};
        maps[this.assignedPinboard] = [];
        this.job.setPinboardIdToVizIdsMap(maps);
    }

    private setupController(jobId: string, pinboardId: string) {

        this.enableScheduler();
        this.errorMessage = '';
        var self = this;
        this.hasError = true;
        this.pinboardId = pinboardId;

        if (!pinboardId) {
            this.errorMessage = 'No pinboard'; // forget that part and use alertService instead ?
            return;
        }
        this.startLoading();
        let pinboardPromise = this.fetchPinboard(pinboardId);
        if (jobId) {
            this.saveButtonString = this.strings.save;
            let getJobPromise = getJob(jobId)
                .then(<(job:ReportTimelyJob) => void> self.initUIFromJob.bind(self));
            pinboardPromise = $q.all([pinboardPromise, getJobPromise]);
        } else {
            let author = sessionService.getUserGuid();
            let maps: { [id: string]: string[] } = {};
            // this assume that we track all the  vizs of the pinboard
            maps[this.assignedPinboard] = [];
            this.job = new ReportTimelyJob(void 0, author, maps);
            this.job.setFormatType(JobFormatType.PDF); // use PDF as default format
            this.jobMetadataComponent.setJob(this.job);
            this.hasError = false;
            this.saveButtonString = this.strings.schedule;
            this.principalsSelectorComponent = new PrincipalsSelectorComponent(
                this.recipients,
                this.onRecipientChangeCallback
            );
        }
        pinboardPromise.finally(<() => any>this.endLoading.bind(this));
    }

    private fetchPinboard(pinboardId): IPromise<any> {
        var self = this;

        return this.documentLoader.loadDocument(
            pinboardId,
            jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            true
        ).then(
            function(document) {
                self.vizIds = Object.keys(document.getVizIdUsedSourcesMap());
                self.assignedPinboard = pinboardId;
                self.pinboardName = document.getName();
                self.jobMetadataComponent.hasNoTable = document.hasNoTableVizs();
            }, function(err) {
                self.hasError = true;
                self.errorMessage = 'No pinboard found';
                // forget that part and use alertService instead ?
                return $q.reject(err);
            }
        );
    }

    private initUIFromJob(job) {
        if (!job) {
            this.hasError = true;
            this.job = null;
            this.errorMessage = 'No job found';
            return;
        }

        this.job = job;
        this.jobMetadataComponent.setJob(job);

        this.scheduleConfig = schedulerService.convertCronPatternToSchedule(
            job.jobSchedule.getBackingCronProto(),
            true /* isPeriodicSchedule */
        );
        this.scheduleConfig.enabled = true;
        this.scheduleConfig.scheduleJob = true;
        this.initPropertiesFromJob(job);

        this.hasError = false;
        return job;
    }

    private onSaveSuccess(userAction, data) {
        alertService.showUserActionSuccessAlert(userAction, data);
        navService.goToPinboardScheduledReports(this.assignedPinboard);
        return data;
    }

    private onSaveFailure(userAction, data) {
        alertService.showUserActionFailureAlert(userAction, data);
        this.disableScheduler();
        return $q.reject(data);
    }
}
