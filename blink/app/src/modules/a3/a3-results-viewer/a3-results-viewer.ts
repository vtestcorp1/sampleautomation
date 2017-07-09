/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {blinkConstants} from '../../../base/blink-constants';
import {Component, ngRequire} from '../../../base/decorators';
import {UserWorkflowActionTypes} from '../../../base/proto/blink-types';
import {startWorkflow} from '../../user-workflow-manager/workflow-management-service';

let A3ResultsListController = ngRequire('A3ResultsListController');
let navService = ngRequire('navService');

@Component({
    name: 'bkA3ResultsViewer',
    templateUrl: 'src/modules/a3/a3-results-viewer/a3-results-viewer.html'
})
export class A3ResultsViewerComponent
extends BaseComponent {
    public listPageController;

    constructor () {
        super();
        this.listPageController = new A3ResultsListController(this.onRowClickCallback);
    }

    /**
     * Start the periodic refresh of insights page. This is done by setting the
     * lastRefreshStopped = false in MetadataListController.lastRefreshStopped
     */
    public refresh() {
        this.listPageController.lastRefreshStopped = false;
        this.listPageController.onRefreshTimeout(
            blinkConstants.metadataListPage.autoRefresh.A3_JOB_REFRESH_MS);
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

    private onRowClickCallback = (row) => {
        startWorkflow(
            UserWorkflowActionTypes.PINBOARD_LOAD
        );
        navService.goToInsight(row.owner);
    }
}
