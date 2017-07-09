/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Base timely job
 *
 * Report job generates a report based on a pinboard
 *
 */

import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire} from 'src/base/decorators';
import {MetadataCache} from 'src/common/metadata-cache/metadata-cache-service';
import {JobCronBasedSchedule} from './cron-timely-job';
import {TimelyJob} from './timely-job';

import ScheduledJobProto = Proto2TypeScript.scheduler.ScheduledJobProto;
import ScheduledJobProtoType =  Proto2TypeScript.scheduler.ScheduledJobProto.Type;
import ScheduledJobProtoJobHandlerType =  Proto2TypeScript.scheduler.JobHandler.Handler;
import KeyValueStr = Proto2TypeScript.common.KeyValueStr;
import JobHandlerProto = Proto2TypeScript.scheduler.JobHandler;

let jsonConstants = ngRequire('jsonConstants');
let Logger = ngRequire('Logger');
let util = ngRequire('util');

declare var tsProto;
declare var later;

const EASY_ADDRESS = '/ea/*/*/tomcat/tomcat/timely_rpc_service/*';

const JOB_PROTO_KEYS = blinkConstants.jobProtoKeys;

export enum JobFormatType {
    CSV = 0,
    PDF = 1,
    XLS = 2
}

const stateJobFormatTypeEnumToString: any = {};
stateJobFormatTypeEnumToString[JobFormatType.CSV] = blinkConstants.FILE_TYPE.CSV;
stateJobFormatTypeEnumToString[JobFormatType.PDF] = blinkConstants.FILE_TYPE.PDF;
stateJobFormatTypeEnumToString[JobFormatType.XLS] = blinkConstants.FILE_TYPE.XLS;

/**
 * This class encapsulates a job generating a report
 * A report has a single pinboard as a source, a set of principals , and
 * can be of different type (csv, xls, pdf)
 */
export class ReportTimelyJob extends TimelyJob {

    public jobSchedule: JobCronBasedSchedule;

    private resolvedGroups: any[] = [];
    private resolvedUsers: any[] = [];
    private cache: MetadataCache = new MetadataCache();

    private usersKeyValuePair: KeyValueStr;
    private groupsKeyValuePair: KeyValueStr;
    private emailsKeyValuePair: KeyValueStr;
    private authorKeyValuePair: KeyValueStr;
    private pinboardKeyValuePair: KeyValueStr;
    private formatKeyValuePair: KeyValueStr;
    private descriptionKeyValuePair: KeyValueStr;
    private nameKeyValuePair: KeyValueStr;

    private format: JobFormatType = 0;

    public constructor(
        backingProto: ScheduledJobProto
            = new tsProto.scheduler.ScheduledJobProto(),
        private author: string = '',
        private pinboardToVizMap: { [id:string] : string[]} = {},
        private groups: string[] = [],
        private users: string[] = [],
        private emails: string[] = []

    ) {
        super(backingProto);

        this.logger = Logger.create('report-timely-job');
        this.cache = new MetadataCache();

        if (!this.backingProto.getId()) {
            this.initProto();
        } else {
            this.assignProperties();
        }
    }

    public getEmails(): string[] {
        return this.emails;
    }
    public setEmails(emails: string[]) {
        this.emails = emails;
        this.emailsKeyValuePair.value = JSON.stringify(emails);
    }

    public getGroups(): string[] {
        return this.groups;
    }
    public setGroups(groups: string[]) {
        this.groups = groups;
        this.groupsKeyValuePair.value = JSON.stringify(groups);
    }

    public getUsers(): string[] {
        return this.users;
    }
    public setUsers(users: string[]) {
        this.users = users;
        this.usersKeyValuePair.value = JSON.stringify(users);
    }

    public getAuthor(): string {
        return this.author;
    }
    public setAuthor(author: string) {
        this.authorKeyValuePair.value = author;
        this.backingProto.last_modification_author = author;
        this.author = author;
    }

    public getFormatType(): JobFormatType {
        return this.format;
    }

    public setFormatType(formatType: JobFormatType) {
        this.format = formatType;
        this.formatKeyValuePair.value = this.getFormatString();
    }

    /**
     *
     * @param map - keys are guids of pinboards, values are guids of tracked vizs
     *
     * Note that if value is an empty Array, then we track all vizs of a given pinboard
     *
     */
    public setPinboardIdToVizIdsMap(map: {[key:string]: string[]}) {
        this.pinboardKeyValuePair.value = JSON.stringify(map);
        this.pinboardToVizMap = map;
        let tag = jsonConstants.scheduledJob.PINBOARD_ID + ':' + Object.keys(map)[0];
        this.backingProto.setTags([tag]);
    }

    public getNumberOfRecipients(): number {
        return [...this.groups, ...this.emails, ...this.users].length;
    }

    public getScheduleString() {
        return this.jobSchedule.toString();
    }

    public getRecipientTooltip() {
        return [
            ...(this.resolvedGroups.map(group => group.getName().escapeHTML())),
            ...(this.resolvedUsers.map(user => user.getName().escapeHTML())),
            ...this.emails
        ].join('<br/>');
    }
    public setName(name: string):void {
        super.setName(name);
        this.nameKeyValuePair.setValue(name);
    }
    public setDescription(description: string): void {
        super.setDescription(description);
        this.descriptionKeyValuePair.setValue(description);
    }

    public getLinkToEditPage(): string {
        return '#/schedule/{1}/{2}'.assign(this.getPinboardId(), this.getId());
    }

    public getPinboardId(): string {
        return Object.keys(this.pinboardToVizMap)[0];
    }

    private getFormatTypeFromString(formatType: string): JobFormatType {
        let invertedMap = util.invertObject(stateJobFormatTypeEnumToString);
        let type: JobFormatType = parseInt(invertedMap[formatType], 10);
        return type;
    }

    private getFormatString() {
        let format = stateJobFormatTypeEnumToString[this.format];
        if (!format) {
            this.logger.error('Unhandled job format', this.format);
        }
        return format;
    }

    private initProto() {
        this.jobSchedule = new JobCronBasedSchedule(null);
        this.backingProto.setSchedule(this.jobSchedule.getBackingProto());

        let rpcJobProto = new tsProto.scheduler.ScheduledRpcJobProto();
        rpcJobProto.setEasyAddress(EASY_ADDRESS);
        let authorKVP = new tsProto.common.KeyValueStr();
        authorKVP.setKey(JOB_PROTO_KEYS.AUTHOR);
        authorKVP.setValue(this.author);
        this.authorKeyValuePair = authorKVP;
        let formatKVP = new tsProto.common.KeyValueStr();
        formatKVP.setKey(JOB_PROTO_KEYS.FORMAT);
        formatKVP.setValue(this.getFormatString());
        this.formatKeyValuePair = formatKVP;
        let groupsKVP = new tsProto.common.KeyValueStr();
        groupsKVP.setKey(JOB_PROTO_KEYS.GROUPS);
        groupsKVP.setValue(JSON.stringify(this.groups));
        this.groupsKeyValuePair = groupsKVP;
        let usersKVP = new tsProto.common.KeyValueStr();
        usersKVP.setKey(JOB_PROTO_KEYS.USERS);
        usersKVP.setValue(JSON.stringify(this.users));
        this.usersKeyValuePair = usersKVP;
        let emailsKVP = new tsProto.common.KeyValueStr();
        emailsKVP.setKey(JOB_PROTO_KEYS.EMAILS);
        this.emailsKeyValuePair = emailsKVP;
        emailsKVP.setValue(JSON.stringify(this.emails));
        let pinboardsKVP = new tsProto.common.KeyValueStr();
        pinboardsKVP.setKey(JOB_PROTO_KEYS.PINBOARDS);
        pinboardsKVP.setValue(JSON.stringify(this.pinboardToVizMap));
        this.pinboardKeyValuePair = pinboardsKVP;
        let nameKVP = new tsProto.common.KeyValueStr();
        nameKVP.setKey(JOB_PROTO_KEYS.NAME);
        nameKVP.setValue(this.getName());
        this.nameKeyValuePair = nameKVP;
        let descriptionKVP = new tsProto.common.KeyValueStr();
        descriptionKVP.setKey(JOB_PROTO_KEYS.DESCRIPTION);
        descriptionKVP.setValue(this.getName());
        this.descriptionKeyValuePair = descriptionKVP;
        let keyValuePairsArray = [
            authorKVP,
            formatKVP,
            groupsKVP,
            usersKVP,
            emailsKVP,
            pinboardsKVP,
            descriptionKVP,
            nameKVP
        ];
        rpcJobProto.setKeyValuePairs(keyValuePairsArray);
        this.backingProto.setType(ScheduledJobProtoType.RPC);
        this.backingProto.setRpcJob(rpcJobProto);
        this.backingProto.setCreationAuthor(this.author);
        this.backingProto.setLastModificationAuthor(this.author);
        let jobHandlerProto: JobHandlerProto = new tsProto.scheduler.JobHandler(null);
        jobHandlerProto.setHandler(ScheduledJobProtoJobHandlerType.SCHEDULED_REPORT);
        this.backingProto.setJobHandler(jobHandlerProto);
    }
    private assignProperties() {
        let rpcJobProto =  this.backingProto.getRpcJob();
        let keyValuesPairs = rpcJobProto.getKeyValuePairs();
        keyValuesPairs.forEach((keyValuesPair: KeyValueStr)  => {
            switch (keyValuesPair.key) {

                case JOB_PROTO_KEYS.DESCRIPTION: {
                    this.descriptionKeyValuePair = keyValuesPair;
                    break;
                }
                case JOB_PROTO_KEYS.NAME: {
                    this.nameKeyValuePair = keyValuesPair;
                    break;
                }
                case JOB_PROTO_KEYS.USERS:
                {
                    this.users = JSON.parse(keyValuesPair.value);
                    this.usersKeyValuePair = keyValuesPair;
                    break;
                }
                case JOB_PROTO_KEYS.FORMAT:
                {
                    this.format = this.getFormatTypeFromString(keyValuesPair.value);
                    this.formatKeyValuePair = keyValuesPair;
                    break;
                }
                case JOB_PROTO_KEYS.GROUPS:
                {
                    this.groups = JSON.parse(keyValuesPair.value);
                    this.groupsKeyValuePair = keyValuesPair;
                    break;
                }
                case JOB_PROTO_KEYS.EMAILS:
                {
                    this.emails = JSON.parse(keyValuesPair.value);
                    this.emailsKeyValuePair = keyValuesPair;
                    break;
                }
                case JOB_PROTO_KEYS.AUTHOR:
                {
                    this.author = keyValuesPair.value;
                    this.authorKeyValuePair = keyValuesPair;
                    break;
                }
                case JOB_PROTO_KEYS.PINBOARDS:
                {
                    this.pinboardToVizMap = JSON.parse(keyValuesPair.value);
                    this.pinboardKeyValuePair = keyValuesPair;
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
            var self = this;

            this.cache.getObjects([...this.groups, ...this.users]).then(function(response){
                self.resolvedGroups = response.groups;
                self.resolvedUsers = response.users;
            });
        });
    }
}
