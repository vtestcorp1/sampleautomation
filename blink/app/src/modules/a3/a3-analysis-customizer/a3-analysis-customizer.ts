/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Jasmeet Singh Jaggi(jasmeet@thoughtspot.com)
 *
 * @fileoverview A component to view and customize A3 Request.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {AnswerSageClient} from '../../sage-client/answer-sage-client';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {A3AlgorithmCustomizerComponent} from '../a3-algorithm-customizer/a3-algorithm-customizer';
import {A3DrillColumnSelectorComponent} from '../a3-drill-column-selector/a3-drill-column-selector';
import {A3ExcludeColumnSelectorComponent}
from '../a3-exclude-column-selector/a3-exclude-column-selector';
import {customizeA3Request} from '../a3-request-generator';
import {getExcludedTokens, getSelectedTokens} from '../a3-utils';
import {triggerA3Analyis} from '../auto-analyzer-service';

@Component({
    name: 'bkA3AnalysisCustomizer',
    templateUrl: 'src/modules/a3/a3-analysis-customizer/a3-analysis-customizer.html'
})
export class A3AnalysisCustomizerComponent extends BaseComponent {
    public a3DrillColumnSelectorComponent: A3DrillColumnSelectorComponent;
    public a3ExcludeColumnSelectorComponent: A3ExcludeColumnSelectorComponent;
    public a3AlgorithmCustomizerComponent: A3AlgorithmCustomizerComponent;
    private a3AnalysisRequest: any;
    private onCommit: Function;
    private sageClient: AnswerSageClient;

    public constructor(a3AnalysisRequest, sageClient, onCommit: Function) {
        super();
        this.a3AnalysisRequest = a3AnalysisRequest;
        this.onCommit = onCommit;
        this.sageClient = sageClient;
        this.initDrillColumnSelectorComponent();
        this.initAlgorithmCustomizerComponent();
        this.initExcludeColumnSelectorComponent();
    }

    public trigger() {
        let selectedTokens = this.a3DrillColumnSelectorComponent.getSelectedColumns();
        let excludedTokens = this.a3ExcludeColumnSelectorComponent.getSelectedColumns();
        customizeA3Request(this.a3AnalysisRequest, selectedTokens, excludedTokens);
        if (false === this.a3AlgorithmCustomizerComponent.updateA3Request()) {
            return;
        }
        triggerA3Analyis(this.a3AnalysisRequest);
        this.a3ExcludeColumnSelectorComponent.rememberSettings();
        this.onCommit();
    }

    private initDrillColumnSelectorComponent() {
        let selectedTokens = getSelectedTokens(this.a3AnalysisRequest);
        this.a3DrillColumnSelectorComponent = new A3DrillColumnSelectorComponent(
            this.sageClient,
            selectedTokens,
            this,
            jsonConstants.a3.SELECTION_INCLUDE
        );
    }

    private initExcludeColumnSelectorComponent() {
        let excludedTokens = getExcludedTokens(this.a3AnalysisRequest);
        this.a3ExcludeColumnSelectorComponent = new A3ExcludeColumnSelectorComponent(
            this.sageClient,
            excludedTokens,
            this
        );
    }

    private initAlgorithmCustomizerComponent() {
        this.a3AlgorithmCustomizerComponent = new A3AlgorithmCustomizerComponent(
            this.a3AnalysisRequest,
            this);
    }
}
