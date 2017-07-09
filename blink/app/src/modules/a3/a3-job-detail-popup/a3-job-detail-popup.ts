/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Jasmeet Singh Jaggi(jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';
import {BaseComponent} from '../../../base/base-types/base-component';
import {ComponentPopupService} from '../../../base/component-popup-service/component-popup-service';
import {Component, ngRequire} from '../../../base/decorators';
import {A3Job} from '../../jobs-scheduling/a3-job';
import {updateJobSchedule} from '../../jobs-scheduling/scheduled-job-util';
import {updateJob} from '../../jobs-scheduling/timely-services';
import {SharePrincipal} from '../../share/share-principal/share-principal';
import {A3JobsDetailComponent} from '../a3-job-detail/a3-job-detail';

let Logger = ngRequire('Logger');

/**
 * A3 select columns popup component shows the related columns suggested by sage.
 */
@Component({
    name: 'bkA3JobDetailPopup',
    templateUrl: 'src/modules/a3/a3-job-detail-popup/a3-job-detail-popup.html'
})
export class A3JobDetailPopupComponent extends BaseComponent {
    public a3JobDetailComponent: A3JobsDetailComponent;
    private job: A3Job;
    private logger;

    public constructor(a3Job: A3Job) {
        super();
        this.job = a3Job;
        this.logger = Logger.create('a3-job-detail-popup');
        this.init();
    }

    public show(): void {
        ComponentPopupService.show('bk-a3-job-detail-popup', this);
    }

    public hide(): void {
        ComponentPopupService.hide();
    }

    private init(): void {
        this.a3JobDetailComponent = new A3JobsDetailComponent(
            this.job,
            this.hide,
            this.hide,
            this.onScheduleChange
        );
    }

    private onScheduleChange = (scheduleConfig: any, recipients: SharePrincipal[]) : void => {
        updateJobSchedule(this.job, scheduleConfig, recipients, this.logger);
        updateJob(this.job).then(
            this.hide
        );
    }
}
