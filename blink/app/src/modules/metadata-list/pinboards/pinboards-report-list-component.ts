/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtpsot.ch)
 *
 */

import {blinkConstants} from 'src/base/blink-constants';
import {Component, ngRequire} from 'src/base/decorators';
import {getRouteParameter} from 'src/base/route-service';
import {strings} from 'src/base/strings';
import {JobStatusViewerComponent} from 'src/modules/jobs-scheduling/job-status-viewer-component';
import {CanvasComponent} from '../../../base/app-canvas/canvas-component';
import {BaseComponent} from '../../../base/base-types/base-component';

let navService = ngRequire('navService');
let ScheduledJobListController = ngRequire('ScheduledJobListController');
let DocumentLoader = ngRequire('DocumentLoader');
let jsonConstants = ngRequire('jsonConstants');

@Component({
    name: 'bkPinboardReportsList',
    templateUrl: 'src/modules/metadata-list/pinboards/pinboard-report-list-component.html'
})
export class PinboardReportsListComponent extends BaseComponent implements CanvasComponent {

    private static routeParameter = 'pinboardId';

    public constants = blinkConstants.metadataListPage.jobs;
    public jobListCtrl: any;
    public shouldShowStatusViewer: boolean = false;
    private jobStatusViewerCtrl: JobStatusViewerComponent;
    private documentLoader: any;

    constructor () {
        super();
        let pinboardId = getRouteParameter(PinboardReportsListComponent.routeParameter);
        let onRowClick = (row) => {
            if (this.jobListCtrl.canExecuteAction([row])) {
                navService.goToScheduleReport(pinboardId + '/' + row.getId());
            }
        };

        this.jobStatusViewerCtrl = new JobStatusViewerComponent(this.onJobRunStatusHide.bind(this));

        this.jobListCtrl = new ScheduledJobListController(
            onRowClick,
            null,
            this.onJobRunStatusShow.bind(this),
            pinboardId
        );
        this.documentLoader = new DocumentLoader();
        this.jobListCtrl.button = {
            text: strings.metadataListPage.jobs.button.title,
            icon: this.constants.button.icon,
            class: this.constants.button.class,
            onClick: function() {
                navService.goToScheduleReport(pinboardId);
            }
        };
        this.fetchPinboard(pinboardId);
    }

    public onCanvasStateChange = (params) => {
        var pinboardId = params[PinboardReportsListComponent.routeParameter];
        if (!!pinboardId) {
            this.jobListCtrl.pinboardId = pinboardId;
            this.jobListCtrl.refreshList();
        }
    }

    public onJobRunStatusHide()  {
        this.shouldShowStatusViewer = false;
    }

    public onJobRunStatusShow(jobId) {
        this.shouldShowStatusViewer = true;
        this.jobStatusViewerCtrl.setJob(jobId);

    }

    private fetchPinboard(pinboardId) {
        return this.documentLoader.loadDocument(
            pinboardId,
            jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
            true
        ).then(
            (document) => {
                this.jobListCtrl.headerTitle =
                    strings.metadataListPage.headerTitle.SCHEDULE.assign(document.getName());
            }
        );
    }
}
