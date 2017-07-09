/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is the page for showing user the A3 dashboard.
 * - User can view the jobs created for their analysis.
 * - User can view recent runs for their jobs.
 */

import {Component, ngRequire} from 'src/base/decorators';
import {CanvasComponent} from '../../../base/app-canvas/canvas-component';
import {BaseComponent} from '../../../base/base-types/base-component';
import {getRouteParameter} from '../../../base/route-service';
import {A3JobsViewerComponent} from '../a3-jobs-viewer/a3-jobs-viewer';
import {A3ResultsViewerComponent} from '../a3-results-viewer/a3-results-viewer';

let navService = ngRequire('navService');

@Component({
    name: 'bkA3Dashboard',
    templateUrl: 'src/modules/a3/a3-dashboard/a3-dashboard.html'
})
export class A3DashboardComponent
extends BaseComponent
implements CanvasComponent {
    public a3JobsViewerComponent: A3JobsViewerComponent;
    public a3ResultsViewerComponent: A3ResultsViewerComponent;
    public defaultTabId : string = '';
    private routeParameter : string = 'tabId';

    constructor () {
        super();
        this.a3JobsViewerComponent = new A3JobsViewerComponent();
        this.a3ResultsViewerComponent = new A3ResultsViewerComponent();
        this.init();
    }

    public onCanvasStateChange() {
        // NOOP;
    }

    public onTabActivated(activeTab) {
        navService.goToInsights(activeTab.tabId);
        if (activeTab.tabId === 'analyses') {
            this.a3JobsViewerComponent.refresh();
        }
        if (activeTab.tabId === 'results') {
            this.a3ResultsViewerComponent.refresh();
        }
    }

    private init() : void {
        // Get route parameter. Example from below link tabId=results
        // http://localhost:8000/#/insights/:tabId
        // http://localhost:8000/#/insights/results
        let routeParam = getRouteParameter(this.routeParameter);
        if (!!routeParam) {
            this.defaultTabId = routeParam;
        } else {
            this.defaultTabId = '';
        }
    }
}
