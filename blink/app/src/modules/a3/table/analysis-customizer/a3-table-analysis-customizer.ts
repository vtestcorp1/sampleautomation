/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Gunjan Jha(gunjan.jha@thoughtspot.com)
 *
 * @fileoverview A component to view and customize A3 Table Analysis Request.
 */

import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {customizeA3Request} from '../../a3-request-generator';
import {getExcludedTokens, getSelectedTokens} from '../../a3-utils';
import {triggerA3Analyis} from '../../auto-analyzer-service';
import {TableAlgorithmCustomizerComponent} from
    '../algorithm-customizer/table-algorithm-customizer';
import {A3TableColumnExcluderComponent} from '../column-excluder/a3-table-column-excluder';
import {A3TableColumnSelectorComponent} from '../column-selector/a3-table-column-selector';

@Component({
    name: 'bkA3TableAnalysisCustomizer',
    templateUrl: 'src/modules/a3/table/analysis-customizer/a3-table-analysis-customizer.html'
})
export class A3TableAnalysisCustomizerComponent extends BaseComponent {
    public a3TableColumnSelectorComponent: A3TableColumnSelectorComponent;
    public a3TableColumnExcluderComponent: A3TableColumnExcluderComponent;
    public tableAlgorithmCustomizerComponent: TableAlgorithmCustomizerComponent;
    private a3AnalysisRequest: any;
    private onCommit: Function;
    private columns: any[];
    private tableId: string = null;

    public constructor(a3AnalysisRequest: any, columns: any[], onCommit: Function) {
        super();
        this.a3AnalysisRequest = a3AnalysisRequest;
        this.columns = columns;
        this.onCommit = onCommit;
        if (a3AnalysisRequest.getTableAnalysis()) {
            this.tableId = a3AnalysisRequest.getTableAnalysis().getTableGuid();
        }

        this.initTableColumnSelectorComponent();
        this.initAlgorithmCustomizerComponent();
        this.initTableColumnExcluderComponent();

    }

    public trigger() {
        let selectedTokens = this.a3TableColumnSelectorComponent.getSelectedColumns();
        let excludedTokens = this.a3TableColumnExcluderComponent.getSelectedColumns();
        customizeA3Request(this.a3AnalysisRequest, selectedTokens, excludedTokens);
        if (false === this.tableAlgorithmCustomizerComponent.updateA3Request()) {
            return;
        }
        triggerA3Analyis(this.a3AnalysisRequest);
        if (!!this.onCommit) {
            this.onCommit();
        }
    }

    private initTableColumnSelectorComponent() {
        let selectedTokens = getSelectedTokens(this.a3AnalysisRequest);
        this.a3TableColumnSelectorComponent = new A3TableColumnSelectorComponent(
            this.tableId,
            this.columns,
            selectedTokens,
            this
        );
    }

    private initTableColumnExcluderComponent() {
        let excludedTokens = getExcludedTokens(this.a3AnalysisRequest);
        this.a3TableColumnExcluderComponent = new A3TableColumnExcluderComponent(
            this.tableId,
            this.columns,
            excludedTokens,
            this
        );
    }

    private initAlgorithmCustomizerComponent() {
        this.tableAlgorithmCustomizerComponent = new TableAlgorithmCustomizerComponent(
            this.a3AnalysisRequest,
            this);
    }
}
