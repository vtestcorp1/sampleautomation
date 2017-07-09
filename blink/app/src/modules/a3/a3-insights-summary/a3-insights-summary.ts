/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Jasmeet Singh Jaggi(jasmeet@thoughtspot.com)
 *
 * @fileoverview A component to view summary of A3 Request that created
 * the insights pinboard.
 */

import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {
    KeyValueViewerComponent
} from '../../../common/widgets/key-value-viewer/key-value-viewer';
import {AnswerSageClient} from '../../../modules/sage-client/answer-sage-client';
import {A3DialogPopupComponent} from '../a3-dialog-popup';
import {getA3RequestTitle, getACContext} from '../a3-utils';

let util = ngRequire('util');
let AnswerDocumentModel = ngRequire('AnswerDocumentModel');
let sageUtil = ngRequire('sageUtil');

declare var moment;

@Component({
    name: 'bkA3InsightsSummary',
    templateUrl: 'src/modules/a3/a3-insights-summary/a3-insights-summary.html'
})
export class A3InsightsSummaryComponent extends BaseComponent {
    public customizationSummaryComponent: KeyValueViewerComponent;
    public insightsTitleComponent: KeyValueViewerComponent;
    public originalQueryComponent: KeyValueViewerComponent;

    private pinboardAnswerModel;
    private rowsProcessed = '';
    private originalQuery = '';
    private analysisDuration = '';

    public constructor(
        pinboardAnswerModel
    ) {
        super();
        this.pinboardAnswerModel = pinboardAnswerModel;
        this.init();
    }

    public getInsightsHeaderDescription() : string {
        let summaryDate = this.getCreateDate();
        let summaryCount = this.getInsightsCountSummary();

        return strings.a3.SUMMARY_DESCRIPTION.assign(
            summaryCount,
            summaryDate,
            this.rowsProcessed,
            this.analysisDuration
        );
    }

    public getButtonText() : string {
        return strings.a3.EDIT_ANALYSIS;
    }

    public launchCustomizationDialog() : void {
        let a3Request = this.pinboardAnswerModel.getA3Request();
        let acContext = getACContext(a3Request);
        let sageClient = null;
        if (acContext !== null) {
            let answerDocumentModel = new AnswerDocumentModel(acContext);
            let formattedTokens = acContext.getTables()[0].getFormattedTokens();
            sageClient = new AnswerSageClient(
                answerDocumentModel,
                formattedTokens,
                _.noop, //onQueryUpdate,
                _.noop //onClientUse
            );
        }

        let a3p = new A3DialogPopupComponent(a3Request, sageClient);
        a3p.show();
    }

    public getOriginalQuery() : string {
        let a3Request = this.pinboardAnswerModel.getA3Request();
        let acContext = getACContext(a3Request);
        if (!!acContext) {
            let table = acContext.getTables()[0];
            var tokens = table.getTokens();
            return sageUtil.tokensToQuery(tokens);
        } else {
            return getA3RequestTitle(a3Request);
        }
    }

    public analysisFacts() : void {
        let analysisFacts = this.pinboardAnswerModel.getA3AnalysisFacts();
        if (!!analysisFacts) {

            if (!!analysisFacts.getRowsProcessed()
                && analysisFacts.getRowsProcessed() > 1) {
                this.rowsProcessed = strings.a3.ROWS_ANALYZED.assign(
                    util.formatBusinessNumber(analysisFacts.getRowsProcessed().toNumber())
                );

                // show time only if rows processed.
                if (!!analysisFacts.getDurationMs()
                    && analysisFacts.getDurationMs() > 1) {
                    let number = analysisFacts.getDurationMs().toNumber();
                    this.analysisDuration = strings.a3.ANALYSIS_DURATION.assign(
                        this.getHumanTime(number));
                }
            }
        }
    }

    public setOriginalQuery() : void {
        this.originalQuery = this.getOriginalQuery();
    }

    private init() : void {
        this.analysisFacts();
        this.setOriginalQuery();
    }

    private getHumanTime(durationInMs: any) : string {
        let humanReadable : string = '';
        let humanUnits = '';
        let duration = moment.duration(durationInMs);
        if (duration.days() > 0) {
            humanReadable = duration.asDays();
            humanUnits = 'days';
        } else if (duration.hours() > 0) {
            humanReadable = duration.asHours();
            humanUnits = 'hours';
        } else if (duration.minutes() > 0) {
            humanReadable = duration.asMinutes();
            humanUnits = 'minutes';
        } else {
            humanReadable = duration.asSeconds();
            humanUnits = 'seconds';
        }
        let durationNumber : number = +humanReadable;
        return  durationNumber.toFixed(2) + ' ' + humanUnits;
    }

    private getCreateDate() : string {
        return this.pinboardAnswerModel.getCreatedTime();
    }

    private getInsightsCountSummary() : number {
        return this.pinboardAnswerModel.getRegularVisualizationsCount();
    }
}
