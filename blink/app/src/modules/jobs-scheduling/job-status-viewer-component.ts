/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Controller for the status viewer directive.
 */
'use strict';

import {BaseComponent} from 'src/base/base-types/base-component';
import {blinkConstants} from 'src/base/blink-constants';
import {Component, ngRequire} from 'src/base/decorators';
import {strings} from 'src/base/strings';
import {getCancelableJobRuns} from './timely-services';

import JobRunState = Proto2TypeScript.scheduler.JobRunStateProto.State;
import JobRunProto =  Proto2TypeScript.scheduler.JobRunProto;


let alertService = ngRequire('alertService');

let dateUtil = ngRequire('dateUtil');
let ListModel = ngRequire('ListModel');
let listUtils = ngRequire('listUtils');
let UserAction = ngRequire('UserAction');

const jobRunStatusEnumToString: { [id:number] : string} = {};
jobRunStatusEnumToString[JobRunState.RUNNING] = blinkConstants.report.jobRunStateString.RUNNING;
jobRunStatusEnumToString[JobRunState.DEADLINE] = blinkConstants.report.jobRunStateString.DEADLINE;
jobRunStatusEnumToString[JobRunState.SUCCESS] = blinkConstants.report.jobRunStateString.SUCCESS;
jobRunStatusEnumToString[JobRunState.FAILED] = blinkConstants.report.jobRunStateString.FAILED;


@Component({
    name: 'bkJobStatusViewer',
    templateUrl: 'src/modules/jobs-scheduling/job-status-viewer.html',
})
export class JobStatusViewerComponent extends BaseComponent {


    private static dateFormat: string = 'MM/dd/yyyy HH:mm:ss';

    public steps: any[];
    public exitDetail: string[];
    public titleString: string;

    private listModel: any;
    private fetchRunsPromise: any;
    private isLoading: boolean;

    constructor(private onHide: Function,
                private job?: any) {
        super();
        this.init();
        this.onRowClick = (<(row: any) => void> this.onRowClick.bind(this));
        this.listModel.noContentMessage = strings.adminSection.jobManagement.noRun;
    }

    public setJob(job: any) {
        this.job = job;
        if (job) {
            this.refreshList();
        }
    }

    public getTitle(): string {
        return this.job.getName();
    }

    private refreshList() {
        let userAction = new UserAction(UserAction.FETCH_JOB_LIST);

        if (this.fetchRunsPromise) {
            this.fetchRunsPromise.cancel();
        }

        this.listModel.setData(null);
        this.steps = [];
        this.exitDetail = null;
        this.titleString = null;

        this.isLoading = true;
        this.fetchRunsPromise = getCancelableJobRuns(this.job.getId());
        this.fetchRunsPromise.then((runs: JobRunProto[]) => {
            runs.forEach((run: any) => {
                if (run.getRunState()) {
                    run.status =
                        this.getStringForStatus(run.getRunState().getState());
                }
                // legacy proto
                if (!run.status) {
                    if (run.getExitStatus()) {
                        run.status =
                            this.getStringForStatus(run.getExitStatus().getState().state);

                    }
                }
                run.getRunStateString = function() {
                    return run.status;
                };
            });
            this.listModel.setData(runs);
        }, function(error){
            alertService.showUserActionFailureAlert(userAction, error);
        }).finally(() => {
            this.fetchRunsPromise = null;
            this.isLoading = false;
        });
    }

    private init() {
        var columns = [
            listUtils.jobRunCols.startTimeCol,
            listUtils.jobRunCols.endTimeCol,
            listUtils.jobRunCols.stateCol
        ];
        var filterFunction = function(row, filterText) {
            return true;
        };

        this.listModel = new ListModel(columns, null, filterFunction, void 0, true);

    }

    // tslint:disable-next-line
    private onRowClick(row) {
        let exitStatus = row.getExitStatus();
        if (exitStatus && exitStatus.detail) {
            this.exitDetail = exitStatus.detail.split('\n');
        } else {
            this.exitDetail = [blinkConstants.report.noDetail];
        }

        if (row.progress.step && row.progress.step.length > 0) {
            this.steps = row.progress.step;
        } else {
            this.steps = [];
        }
        if (row.getStartTime()) {
            let date = dateUtil.formatDate(new Date(row.getStartTime() * 1000),
                JobStatusViewerComponent.dateFormat);
            this.titleString = blinkConstants.report.startedAt.assign(date);
        } else {
            this.titleString = null;
        }
    }

    private getStringForStatus(status: JobRunState) {
        let statusString = jobRunStatusEnumToString[status];
        return statusString;
    }
}
