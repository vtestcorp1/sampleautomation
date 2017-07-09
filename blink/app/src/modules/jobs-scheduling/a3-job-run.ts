/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class to represent A3 Job run.
 */

import JobRunProto = Proto2TypeScript.scheduler.JobRunProto;
import KeyValueStr = Proto2TypeScript.common.KeyValueStr;
import {ngRequire, Provide} from '../../base/decorators';

import JobRunState = Proto2TypeScript.scheduler.JobRunStateProto.State;
import {blinkConstants} from '../../base/blink-constants';

let Logger = ngRequire('Logger');
let strings = ngRequire('strings');

declare let tsProto;
declare let moment;

let PINBOARD_ID_KEY = 'PinboardId';

const jobRunStatusEnumToString: { [id:number] : string} = {};
jobRunStatusEnumToString[JobRunState.RUNNING] = blinkConstants.report.jobRunStateString.RUNNING;
jobRunStatusEnumToString[JobRunState.DEADLINE] = blinkConstants.report.jobRunStateString.DEADLINE;
jobRunStatusEnumToString[JobRunState.SUCCESS] = blinkConstants.report.jobRunStateString.SUCCESS;
jobRunStatusEnumToString[JobRunState.FAILED] = blinkConstants.report.jobRunStateString.FAILED;

const jobRunStatusEnumToDisplayString: { [id:number] : string} = {};
jobRunStatusEnumToDisplayString[JobRunState.RUNNING]
    = blinkConstants.report.jobRunStateDisplayString.RUNNING;
jobRunStatusEnumToDisplayString[JobRunState.DEADLINE]
    = blinkConstants.report.jobRunStateDisplayString.DEADLINE;
jobRunStatusEnumToDisplayString[JobRunState.SUCCESS]
    = blinkConstants.report.jobRunStateDisplayString.SUCCESS;
jobRunStatusEnumToDisplayString[JobRunState.FAILED]
    = blinkConstants.report.jobRunStateDisplayString.FAILED;

@Provide('A3JobRun')
export class A3JobRun {
    private logger;
    private backingProto: JobRunProto;
    private pinboardId: string;
    private resultSummary: string;

    public constructor(
        backingProto: JobRunProto
    ) {
        this.logger = Logger.create('a3-job-run');
        this.backingProto = backingProto;
        this.initProperties();
    }

    public getStartTime(): number {
        return this.backingProto.getStartTime();
    }

    public getEndTime(): number {
        return this.backingProto.getEndTime();
    }

    public getPinboardId(): string {
        return this.pinboardId;
    }

    public didRunSucceed(): boolean {
        return !!this.getPinboardId();
    }

    public getFailureMessage() : string {
        if (this.getRunState() === JobRunState.FAILED) {
            return this.getMessage();
        }
        return '';
    }

    public getResultSummary() : string {
        return this.resultSummary;
    }

    public getRunState() : number {
        if (!!this.backingProto.getRunState()) {
            return this.backingProto
                .getRunState()
                .getState();
        }
        return null;
    }

    public getRunStateString() : string {
        let state: string = jobRunStatusEnumToString[this.getRunState()];
        if (!state) {
            this.logger.warn('Unknown state', this.getRunState());
        }
        return state;
    }

    public getRunStateDisplayString() : string {
        let state: string = jobRunStatusEnumToDisplayString[this.getRunState()];
        if (!state) {
            this.logger.warn('Unknown state', this.getRunState());
        }
        return state;
    }

    public getMessage(): string {
        return this.backingProto.getExitStatus().getDetail();
    }

    private initProperties() {
        let keyValuesPairs = this.backingProto.getKeyValuePairs();
        keyValuesPairs.forEach((keyValuesPair: KeyValueStr)  => {
            switch (keyValuesPair.key) {
                case PINBOARD_ID_KEY: {
                    this.pinboardId = keyValuesPair.value;
                    break;
                }
                default:
                {
                    this.logger.debug(
                        'Non handled key while converting proto to scheduled job',
                        keyValuesPair
                    );
                }
            }
        });
        if (!this.pinboardId || this.pinboardId === '') {
            if (this.getRunState() === JobRunState.SUCCESS) {
                this.resultSummary = strings.NO_INSIGHTS;
            } else if (this.getRunState() === JobRunState.RUNNING) {
                let lastStartTime = moment(this.getStartTime() * 1000).fromNow();
                this.resultSummary = `${ strings.a3.JOB } ${this.getRunStateDisplayString()} `
                    + `since ${ lastStartTime }.`;
            } else if (this.getRunState() === JobRunState.FAILED) {
                this.resultSummary = this.getMessage();
            }
        } else {
            this.resultSummary =
                `<a href=/#/insight/${ this.pinboardId }/>${ strings.VIEW_RESULTS }</a>`;
        }
    }
}
