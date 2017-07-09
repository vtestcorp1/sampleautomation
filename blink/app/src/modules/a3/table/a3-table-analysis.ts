/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Gunjan Jha(gunjan.jha@thoughtspot.com)
 *
 * @fileoverview A component to view, customize and trigger A3 Table Analysis Request.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {A3DialogPopupComponent} from '../a3-dialog-popup';
import {getA3TableAnalysisRequest} from '../a3-request-generator';
import {triggerA3Analyis} from '../auto-analyzer-service';

@Component({
    name: 'bkA3TableAnalysis',
    templateUrl: 'src/modules/a3/table/a3-table-analysis.html'
})
export class A3TableAnalysisComponent extends BaseComponent {
    public analysisTitle:  string;
    public customAnalysisTitle:  string;

    private a3AnalysisRequest: any;
    private columns: any[];

    public constructor(tableGuid: string,
                       tableName: string,
                       isWorksheet: boolean,
                       columns: any[]) {
        super();
        this.a3AnalysisRequest = getA3TableAnalysisRequest(
            tableGuid, tableName, isWorksheet, null);
        let theType = isWorksheet ? 'worksheet' :  'table';
        this.analysisTitle = strings.a3.tableAnalysis.assign(theType, tableName);
        this.customAnalysisTitle = strings.a3.customTableAnalysisTitle.assign(
            theType, tableName);

        this.columns = columns;
    }

    public trigger() {
        triggerA3Analyis(this.a3AnalysisRequest);
    }

    public customize() {
        let a3p = new A3DialogPopupComponent(this.a3AnalysisRequest, null, this.columns);
        a3p.show();
    }
}
