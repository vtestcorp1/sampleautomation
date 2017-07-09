/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Base timely job
 *
 * The timely server schedule timely jobs. These jobs
 * can either be one-shot or cron-pattern based scheduled jobs.
 *
 */

import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire} from 'src/base/decorators';
import ScheduledJobProto = Proto2TypeScript.scheduler.ScheduledJobProto;
import JobState = Proto2TypeScript.scheduler.JobStateProto.State;
import Handler = Proto2TypeScript.scheduler.JobHandler.Handler;
import JobStateProto = Proto2TypeScript.scheduler.JobStateProto;
import TimeSchedule = Proto2TypeScript.scheduler.TimeSchedule;

const jobStateString = blinkConstants.report.jobStateString;

const jobStateEnumToString :{[id: number]: string} = {};
jobStateEnumToString[JobState.SCHEDULED] = jobStateString.SCHEDULED;
jobStateEnumToString[JobState.PAUSED] = jobStateString.PAUSED;
jobStateEnumToString[JobState.STOPPED] = jobStateString.STOPPED;


let Logger = ngRequire('Logger');

declare var tsProto;

export class TimelyJob {

    protected logger:any;

    public constructor(protected backingProto: ScheduledJobProto) {
        this.logger = Logger.create('scheduled-job');
    }

    public getName(): string {
        return this.backingProto.getName();
    }
    public setName(name: string): void {
        return this.backingProto.setName(name);
    }


    public getDescription(): string {
        return this.backingProto.getDescription();
    }
    public setDescription(description: string): void {
        return this.backingProto.setDescription(description);
    }

    public getCreationTime(): number {
        return this.backingProto.getCreationTime();
    }

    public getLastModificationTime(): number {
        return this.backingProto.getLastModificationTime();
    }
    public setLastModificationTime(lastModificationTime: number): void {
        return this.backingProto.setLastModificationTime(lastModificationTime);
    }

    public getId(): string {
        return this.backingProto.getId();
    }

    public isPausable(): boolean {
        return this.getState() === JobState.SCHEDULED;
    }

    public isSchedulable(): boolean {
        return this.getState() === JobState.PAUSED;
    }

    // Base class does not know its schedule
    public getScheduleString(): string {
        return 'N/A';
    }

    public getStateString(): string {
        let state: string = jobStateEnumToString[this.getState()];
        if (!state) {
            this.logger.warn('Unknown state', this.getState());
        }
        return state;
    }

    public setState(state: JobState): void {
        let stateProto = this.backingProto.getCurrentState();
        if (stateProto === null) {
            stateProto = new tsProto.scheduler.JobRunStateProto();
        }
        stateProto.setState(state);
        this.backingProto.setCurrentState(stateProto);
    }

    public setScheduledState(): void {
        this.setState(JobStateProto.State.SCHEDULED);
        this.backingProto.getSchedule().setPeriodicity(TimeSchedule.Periodicity.PERIODIC);
    }

    public getLinkToEditPage(): string {
        return '';
    }

    public getBackingProto(): ScheduledJobProto {
        return this.backingProto;
    }

    public getHandler(): Handler {
        return this.backingProto.getJobHandler().getHandler();
    }

    private getState(): JobState {
        return this.backingProto.getCurrentState().getState();
    }
}
