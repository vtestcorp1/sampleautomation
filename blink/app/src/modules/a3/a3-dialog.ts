/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Manoj Ghosh (manoj.ghosh@thoughtspot.com),
 *
 * @fileoverview This component displays the sage columns for customer to select for
 * a3 analysis.
 *
 */

'use strict';

import {BaseComponent} from '../../base/base-types/base-component';
import {Component} from '../../base/decorators';
import {A3AnalysisCustomizerComponent} from './a3-analysis-customizer/a3-analysis-customizer';
import {isTableAnalysis} from './a3-utils';
import {A3TableAnalysisCustomizerComponent} from
    './table/analysis-customizer/a3-table-analysis-customizer';

/**
 * A3 Dialog component shows A3 related information for customers to select options from.
 */
@Component({
    name: 'bkA3Dialog',
    templateUrl: 'src/modules/a3/a3-dialog.html'
})
export class A3DialogComponent extends BaseComponent {
    public a3AnalysisCustomizerComponent: A3AnalysisCustomizerComponent;
    public a3TableAnalysisCustomizerComponent: A3TableAnalysisCustomizerComponent;
    public isTableAnalysis: boolean;

    public constructor(a3Request, sageClient, onCommit, allColumns: any[]) {
        super();
        this.a3AnalysisCustomizerComponent = new A3AnalysisCustomizerComponent(
            a3Request,
            sageClient,
            onCommit
        );
        this.isTableAnalysis = isTableAnalysis(a3Request);

        this.a3TableAnalysisCustomizerComponent = new A3TableAnalysisCustomizerComponent(
            a3Request,
            allColumns,
            onCommit
        );
    }
}
