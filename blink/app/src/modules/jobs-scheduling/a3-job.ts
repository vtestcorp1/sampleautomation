/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Jasmeet Singh Jaggi(jasmeet@thoughtspot.com)
 *
 * @fileoverview Class to represent A3 jobs.
 */

import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire} from 'src/base/decorators';
import {JobCronBasedSchedule} from './cron-timely-job';
import {TimelyJob} from './timely-job';

import ScheduledJobProto = Proto2TypeScript.scheduler.ScheduledJobProto;
import TimeSchedule = Proto2TypeScript.scheduler.TimeSchedule;
import KeyValueStr = Proto2TypeScript.common.KeyValueStr;
import {A3JobRun} from './a3-job-run';
import Periodicity = Proto2TypeScript.scheduler.TimeSchedule.Periodicity;
import JobRunState = Proto2TypeScript.scheduler.JobRunStateProto.State;

let schedulerService = ngRequire('schedulerService');
let strings = ngRequire('strings');
let Logger = ngRequire('Logger');

declare var tsProto;
declare var later;
declare var sage;
declare var moment;

const JOB_PROTO_KEYS = blinkConstants.jobProtoKeys;

/**
 * This class encapsulates a job generating a analysis.
 * TODO(Jasmeet): Move common scheduled job and a3job code in a base class.
 */
export class A3Job extends TimelyJob {
    public jobSchedule: JobCronBasedSchedule;
    private a3Request: any;
    private name: string;
    private author: string;
    private runs: A3JobRun[];
    private timeSchedule: TimeSchedule;
    private groups: string[] = [];
    private users: string[] = [];
    private emails: string[] = [];

    private usersKeyValuePair: KeyValueStr;
    private groupsKeyValuePair: KeyValueStr;
    private emailsKeyValuePair: KeyValueStr;

    public constructor(
        backingProto: ScheduledJobProto = new tsProto.scheduler.ScheduledJobProto()
    ) {
        super(backingProto);

        this.logger = Logger.create('a3-job');

        if (!this.backingProto.getId()) {
            this.logger.error('A3 job should never be initialized on blink');
        } else {
            this.assignProperties();
        }
        this.runs = [];
    }

    public setRuns(runs: A3JobRun[]) {
        this.runs = runs;
    }

    public getName() : string {
        return this.name;
    }

    public getScheduleString() {
        return this.jobSchedule.toString();
    }

    public getLastFailureMessage() : string {
        if (this.runs.length === 0) {
            return '';
        }
        let lastRun = this.runs.last();
        if (lastRun.getRunState() === JobRunState.FAILED) {
            return lastRun.getMessage();
        }
        return '';
    }

    public getResultSummary() : string {
        if (this.runs.length === 0) {
            return strings.No_runs;
        }

        let lastRun = this.runs.last();
        let lastRunTime = moment(lastRun.getEndTime() * 1000).fromNow();
        let lastStartTime = moment(lastRun.getStartTime() * 1000).fromNow();
        let lastRunResultPinboard = lastRun.getPinboardId();

        let template = ``;
        if (!lastRunResultPinboard) {
            if (lastRun.getRunState() === JobRunState.SUCCESS) {
                template = `${ strings.a3.LAST_RUN } ${lastRun.getRunStateDisplayString()} `
                    + `${ lastRunTime }. ${strings.NO_INSIGHTS}`;
            } else if (lastRun.getRunState() === JobRunState.RUNNING) {
                template = `${ strings.a3.LAST_RUN } ${lastRun.getRunStateDisplayString()} `
                    + `since ${ lastStartTime }.`;
            } else {
                template = `${ strings.a3.LAST_RUN } ${lastRun.getRunStateDisplayString()} `
                    + `${ lastRunTime }. ${lastRun.getMessage()}`;
            }
        } else {
            template = `${ strings.a3.LAST_RUN } ${lastRun.getRunStateDisplayString()} `
                + `${ lastRunTime }. <a class="bk-a3-results-link" `
                + `href=/#/insight/${ lastRunResultPinboard }/>${ strings.VIEW_RESULTS }</a>`;
        }
        return template;
    }

    public getRuns() : A3JobRun[] {
        return this.runs;
    }

    public getScheduleConfig() {
        let cronSchedule = new JobCronBasedSchedule(this.timeSchedule);
        let scheduleConfig = schedulerService.convertCronPatternToSchedule(
            cronSchedule.getBackingCronProto(),
            this.timeSchedule.getPeriodicity() === Periodicity.PERIODIC
        );
        scheduleConfig.enabled = true;
        scheduleConfig.scheduleJob = true;
        return scheduleConfig;
    }

    public isScheduled() : boolean {
        return this.timeSchedule.getPeriodicity() === Periodicity.ONE_TIME;
    }

    public getEmails(): string[] {
        return this.emails;
    }

    public setEmails(emails: string[]) {
        if (!this.emailsKeyValuePair) {
            this.emailsKeyValuePair = new tsProto.common.KeyValueStr();
            this.emailsKeyValuePair.setKey(JOB_PROTO_KEYS.EMAILS);
            let rpcJobProto =  this.backingProto.getRpcJob();
            let keyValuesPairs = rpcJobProto.getKeyValuePairs();
            keyValuesPairs.push(this.emailsKeyValuePair);
        }
        this.emails = emails;
        this.emailsKeyValuePair.value = JSON.stringify(emails);
    }

    public getGroups(): string[] {
        return this.groups;
    }

    public setGroups(groups: string[]) {
        if (!this.groupsKeyValuePair) {
            this.groupsKeyValuePair = new tsProto.common.KeyValueStr();
            this.groupsKeyValuePair.setKey(JOB_PROTO_KEYS.GROUPS);
            let rpcJobProto =  this.backingProto.getRpcJob();
            let keyValuesPairs = rpcJobProto.getKeyValuePairs();
            keyValuesPairs.push(this.groupsKeyValuePair);
        }
        this.groups = groups;
        this.groupsKeyValuePair.value = JSON.stringify(groups);
    }

    public getUsers(): string[] {
        return this.users;
    }

    public setUsers(users: string[]) {
        this.users = users;
        if (!this.usersKeyValuePair) {
            this.usersKeyValuePair = new tsProto.common.KeyValueStr();
            this.usersKeyValuePair.setKey(JOB_PROTO_KEYS.USERS);
            let rpcJobProto =  this.backingProto.getRpcJob();
            let keyValuesPairs = rpcJobProto.getKeyValuePairs();
            keyValuesPairs.push(this.usersKeyValuePair);
        }
        this.usersKeyValuePair.value = JSON.stringify(users);
    }

    public getAuthor(): string {
        return this.author;
    }

    public getA3Request() {
        return this.a3Request;
    }

    private assignProperties() {
        let rpcJobProto =  this.backingProto.getRpcJob();
        this.timeSchedule = this.backingProto.getSchedule();
        let keyValuesPairs = rpcJobProto.getKeyValuePairs();
        keyValuesPairs.forEach((keyValuesPair: KeyValueStr)  => {
            switch (keyValuesPair.key) {
                case JOB_PROTO_KEYS.A3_REQUEST: {
                    let a3Request = tsProto.sage.A3Request.decode64(keyValuesPair.value);
                    this.a3Request = a3Request;
                    break;
                }
                case JOB_PROTO_KEYS.NAME:
                {
                    this.name = keyValuesPair.value;
                    break;
                }
                case JOB_PROTO_KEYS.AUTHOR:
                {
                    this.author = keyValuesPair.value;
                    break;
                }
                case JOB_PROTO_KEYS.USERS:
                {
                    this.usersKeyValuePair = keyValuesPair;
                    this.users = JSON.parse(keyValuesPair.value);
                    break;
                }
                case JOB_PROTO_KEYS.GROUPS:
                {
                    this.groupsKeyValuePair = keyValuesPair;
                    this.groups = JSON.parse(keyValuesPair.value);
                    break;
                }
                case JOB_PROTO_KEYS.EMAILS:
                {
                    this.emailsKeyValuePair = keyValuesPair;
                    this.emails = JSON.parse(keyValuesPair.value);
                    break;
                }
                default:
                {
                    this.logger.warn(
                        'Non handled key while converting proto to scheduled job',
                        keyValuesPair
                    );
                }
            }
            this.jobSchedule = new JobCronBasedSchedule(this.backingProto.getSchedule());
        });
    }
}
