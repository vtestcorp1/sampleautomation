/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This component allows to view A3 job runs.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../base/decorators';
import {A3JobRun} from '../../jobs-scheduling/a3-job-run';

let ListModel = ngRequire('ListModel');
let listUtils = ngRequire('listUtils');

@Component({
    name: 'bkA3RunsViewer',
    templateUrl: 'src/modules/a3/a3-runs-viewer/a3-runs-viewer.html'
})
export class A3RunsViewerComponent
extends BaseComponent {
    public listModel;
    public onRowClick;

    constructor (a3Runs: A3JobRun[], onRowClick: Function) {
        super();
        var columns = [
            listUtils.jobRunCols.startTimeCol,
            listUtils.jobRunCols.endTimeCol,
            listUtils.jobRunCols.stateCol,
            listUtils.a3JobRunCols.resultCol
        ];
        var filterFunction = function(row, filterText) {
            return true;
        };

        this.listModel = new ListModel(
            columns,
            null,
            filterFunction,
            void 0
        );
        this.listModel.setData(a3Runs);
        this.onRowClick = onRowClick;
    }
}
