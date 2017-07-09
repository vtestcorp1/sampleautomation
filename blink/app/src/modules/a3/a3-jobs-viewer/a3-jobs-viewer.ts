/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to view a3 jobs.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {blinkConstants} from '../../../base/blink-constants';
import {Component, ngRequire} from '../../../base/decorators';
import {A3Job} from '../../jobs-scheduling/a3-job';
import {A3JobDetailPopupComponent} from '../a3-job-detail-popup/a3-job-detail-popup';

let A3JobsListController = ngRequire('A3JobsListController');

@Component({
    name: 'bkA3JobsViewer',
    templateUrl: 'src/modules/a3/a3-jobs-viewer/a3-jobs-viewer.html'
})
export class A3JobsViewerComponent
extends BaseComponent {
    public listPageController;

    constructor () {
        super();
        this.listPageController = new A3JobsListController(this.onRowClick);
    }

    /**
     * Start the periodic refresh of job status. This is done by setting the
     * lastRefreshStopped = false in MetadataListController.lastRefreshStopped
     */
    public refresh() {
        this.listPageController.lastRefreshStopped = false;
        this.listPageController.onRefreshTimeout(
            blinkConstants.metadataListPage.autoRefresh.A3_JOB_REFRESH_MS);
    }

    public onRowClick(a3Job: A3Job, $event) {
        if ($event.target.classList.contains('bk-a3-results-link')) {
            return;
        }
        let a3JobDetailPopupComponent = new A3JobDetailPopupComponent(a3Job);
        a3JobDetailPopupComponent.show();
    }

    /**
     * When we navigate away from Analyses page, the periodic job refresh is stopped by
     * setting lastRefreshStopped = true in MetadataListController.lastRefreshStopped
     */
    onDestroy() {
        if (!!this.listPageController) {
            this.listPageController.destroy();
        }
    }
}
