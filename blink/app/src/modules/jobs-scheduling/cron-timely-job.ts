/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Base timely job
 *
 * Cron-based timely jobs have a cron pattern that defines their schedule
 *
 */

import CronSchedule = Proto2TypeScript.scheduler.CronSchedule;
import PeriodicScheduleType = Proto2TypeScript.scheduler.PeriodicSchedule.Type;
import TimeSchedule = Proto2TypeScript.scheduler.TimeSchedule;

declare var tsProto;
declare var later;

class JobTimeSchedule {
    public constructor(protected backingProto:TimeSchedule) {
        if (!backingProto) {
            this.backingProto = new tsProto.scheduler.TimeSchedule();
            this.backingProto.setPeriodicity(TimeSchedule.Periodicity.PERIODIC);
        }
    }
}

class JobPeriodicSchedule extends JobTimeSchedule {
    public constructor(backingProto: TimeSchedule) {
        super(backingProto);
        if (!this.backingProto.getPeriodicSchedule()) {
            this.backingProto.setPeriodicSchedule(
                new tsProto.scheduler.PeriodicSchedule()
            );
        }
    }
}

export class JobCronBasedSchedule extends JobPeriodicSchedule {

    private cronScheduleProto: CronSchedule;

    public constructor(backingProto:TimeSchedule) {
        super(backingProto);
        let periodicSchedule = this.backingProto.getPeriodicSchedule();
        let inputCronSchedule = periodicSchedule.getCronSchedule();
        if (!inputCronSchedule || inputCronSchedule.isEmpty()) {
            periodicSchedule.setType(PeriodicScheduleType.CRON);
            let cronSchedule = new tsProto.scheduler.CronSchedule();
            cronSchedule.setSecond('');
            cronSchedule.setMinute('');
            cronSchedule.setHour('');
            cronSchedule.setMonth('');
            cronSchedule.setDayOfMonth('');
            cronSchedule.setDayOfWeek('');
            periodicSchedule.setCronSchedule(cronSchedule);
        }

        this.cronScheduleProto = periodicSchedule.getCronSchedule();
    }

    public getSecond(): string {
        return this.cronScheduleProto.getSecond();
    }

    public setSecond(second: string):void {
        this.cronScheduleProto.setSecond(second);
    }

    public getMinute(): string[] {
        return this.cronScheduleProto.getMinute().split(',');
    }
    public setMinute(minute: string[]):void {
        this.cronScheduleProto.setMinute(minute.join(','));
    }

    public getHour(): string[] {
        return this.cronScheduleProto.getHour().split(',');
    }
    public setHour(hour: string[]):void {
        return this.cronScheduleProto.setHour(hour.join(','));
    }

    public getMonth():string[] {
        return this.cronScheduleProto.getMonth().split(',');
    }
    public setMonth(month: string[]): void {
        return this.cronScheduleProto.setMonth(month.join(','));
    }

    public getDayOfMonth():string[] {
        return this.cronScheduleProto.getDayOfMonth().split(',');

    }
    public setDayOfMonth(dayOfMonth: string[]): void {
        return this.cronScheduleProto.setDayOfMonth(dayOfMonth.join(','));
    }
    public getDayOfWeek(): string[] {
        return this.cronScheduleProto.getDayOfWeek().split(',');
    }
    public setDayOfWeek(dayOfWeek: string[]): void {
        return this.cronScheduleProto.setDayOfWeek(dayOfWeek.join(','));
    }
    public getBackingProto() {
        return this.backingProto;
    }
    public getBackingCronProto() {
        return this.cronScheduleProto;
    }

    public setCronSchedule(seconds: string,
                                   minute: string,
                                   hour: string,
                                   dayOfMonth: string,
                                   month: string,
                                   dayOfWeek: string) {
        let backingCronProto: CronSchedule = this.cronScheduleProto;
        backingCronProto.setSecond(seconds);
        backingCronProto.setMinute(minute);
        backingCronProto.setHour(hour);
        backingCronProto.setDayOfMonth(dayOfMonth);
        backingCronProto.setDayOfWeek(dayOfWeek);
        backingCronProto.setMonth(month);
    }

    public toString(): string {
        let minute = this.getMinute(),
            hour = this.getHour(),
            month = this.getMonth(),
            dayOfMonth = this.getDayOfMonth(),
            dayOfWeek = this.getDayOfWeek();

        let cronPattern =
            `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
        return cronPattern;
    }

    public getNextOccurences(numberOfOccurences): Date[] {
        let schedule = later.parse.cron(this.toString());
        let compiledSchedule = later.schedule(schedule);
        return compiledSchedule.next(numberOfOccurences);
    }
}
