/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import {Component} from '../../../base/decorators';
import {A3Job} from '../../jobs-scheduling/a3-job';
import {BaseScheduledJobComponent} from '../../jobs-scheduling/base-scheduled-job-component';
import {SharePrincipal} from '../../share/share-principal/share-principal';

@Component({
    name: 'bkA3JobScheduleConfigurator',
    templateUrl: 'src/modules/a3/a3-job-schedule-configurator/a3-job-schedule-configurator.html'
})
export class A3JobScheduleConfiguratorComponent
extends BaseScheduledJobComponent {
    public scheduleConfig;
    private onCancel: () => void;
    private onScheduleCallback: (scheduleConfig: any, recipients: SharePrincipal[]) => void;

    constructor (
        a3Job: A3Job,
        onCancel: () => void,
        onSchedule: (scheduleConfig: any, recipients: SharePrincipal[]) => void
    ) {
        super();
        this.scheduleConfig = a3Job.getScheduleConfig();
        this.onCancel = onCancel;
        this.onScheduleCallback = onSchedule;
        this.initPropertiesFromJob(a3Job);
    }

    public onSchedule() {
        this.onScheduleCallback(this.scheduleConfig, this.recipients);
    }
}
