/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to view A3 job detail. This component allows user to
 * view the job runs and also set schedule for the job.
 */

import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../base/decorators';
import {A3Job} from '../../jobs-scheduling/a3-job';
import {AnswerSageClient} from '../../sage-client/answer-sage-client';
import {SharePrincipal} from '../../share/share-principal/share-principal';
import {A3AnalysisCustomizerComponent} from '../a3-analysis-customizer/a3-analysis-customizer';
import {A3JobScheduleConfiguratorComponent}
    from '../a3-job-schedule-configurator/a3-job-schedule-configurator';
import {A3RunsViewerComponent} from '../a3-runs-viewer/a3-runs-viewer';
import {getACContext, isTableAnalysis} from '../a3-utils';
import {A3TableAnalysisCustomizerComponent} from
    '../table/analysis-customizer/a3-table-analysis-customizer';
let AnswerDocumentModel = ngRequire('AnswerDocumentModel');

@Component({
    name: 'bkA3JobDetail',
    templateUrl: 'src/modules/a3/a3-job-detail/a3-job-detail.html'
})
export class A3JobsDetailComponent
extends BaseComponent {
    public a3RunsViewerComponent: A3RunsViewerComponent;
    public a3JobScheduleConfiguratorComponent: A3JobScheduleConfiguratorComponent;
    public a3AnalysisCustomizerComponent: A3AnalysisCustomizerComponent;
    public a3TableAnalysisCustomizerComponent: A3TableAnalysisCustomizerComponent;

    constructor (
        a3Job: A3Job,
        beforeNavigationCallback: Function,
        cancelCallback: () => void,
        onSchedule: (scheduleConfig: any, recipients: SharePrincipal[]) => void
    ) {
        super();
        this.a3RunsViewerComponent = new A3RunsViewerComponent(
            a3Job.getRuns(),
            beforeNavigationCallback
        );
        this.a3JobScheduleConfiguratorComponent = new A3JobScheduleConfiguratorComponent(
            a3Job,
            cancelCallback,
            onSchedule
        );
        this.initA3AnalysisCustomizer(a3Job, beforeNavigationCallback);
    }

    private initA3AnalysisCustomizer(a3Job: A3Job, beforeNavigationCallback) {
        let a3Request = a3Job.getA3Request();
        if (isTableAnalysis(a3Request)) {
            this.a3TableAnalysisCustomizerComponent = new A3TableAnalysisCustomizerComponent(
                a3Request,
                null,
                beforeNavigationCallback
            );
        } else {
            let acContext = getACContext(a3Request);
            let answerDocumentModel = new AnswerDocumentModel(acContext);
            let formattedTokens = acContext.getTables()[0].getFormattedTokens();
            let sageClient = new AnswerSageClient(
                answerDocumentModel,
                formattedTokens,
                _.noop, //onQueryUpdate,
                _.noop //onClientUse
            );

            this.a3AnalysisCustomizerComponent = new A3AnalysisCustomizerComponent(
                a3Request,
                sageClient,
                beforeNavigationCallback
            );
        }
    }
}
