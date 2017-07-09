/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Timely Services talk to the /timely callosum endpoit
 *
 * It manages creation/update/deletion of scheduled jobs
 *
 */

import {ngRequire, Provide} from 'src/base/decorators';
import {ReportTimelyJob} from './report-timely-job';
import IPromise = angular.IPromise;
import JobRunProto =  Proto2TypeScript.scheduler.JobRunProto;
import JobHandlerProto = Proto2TypeScript.scheduler.JobHandler;
import _ from 'lodash';
import {A3Job} from './a3-job';
import {A3JobRun} from './a3-job-run';
import {TimelyJob} from './timely-job';

let CancelableRequest = ngRequire('CancelablePromise');
let Command = ngRequire('Command');
let jsonConstants = ngRequire('jsonConstants');
const BATCH_LIMIT = 20;

declare const tsProto;


const BASE_PATH = '/timely/';
const DELETE = 'delete';
const ADD = 'add';
const LIST = 'get';
const UPDATE = 'update';
const JOBSTATUS = 'getjobrun';
const JOB_WITH_RUNS = 'getJobsWithRuns';

Provide('timelyServices')
({
    scheduleJob,
    deleteJob,
    getCancelableJobRuns,
    getListOfJobsForPinboard,
    getJob,
    pauseJob,
    resumeJob,
    getJobRuns,
    getA3Jobs,
    getA3JobsWithRuns,
    getJobsWithRuns
});

export function scheduleJob(job: ReportTimelyJob): IPromise<any> {

    let jobProto = job.getBackingProto();
    let addJobRequest =  new tsProto.scheduler.AddJobRequest();
    addJobRequest.setJob(jobProto);
    let jsonString = addJobRequest.encode64();

    let command = new Command();
    command.setPath(BASE_PATH + ADD)
        .setPostMethod()
        .setPostParams({
            addJobRequest: jsonString
        });
    return command.execute()
        .then((response) => {
            let addJobResponse = tsProto.scheduler.AddJobResponse.decode64(response.data);
            return addJobResponse;
    });
}

export function updateJob(job: TimelyJob): IPromise<TimelyJob> {
    let jobProto = job.getBackingProto();
    let updateJobRequest =  new tsProto.scheduler.UpdateJobRequest();
    updateJobRequest.job_id = job.getId();
    updateJobRequest.setJob(jobProto);
    let jsonString = updateJobRequest.encode64();

    let command = new Command();
    command.setPath(BASE_PATH + UPDATE)
        .setPostMethod()
        .setPostParams({
            updateJobRequest: jsonString
        });

    return command.execute().then((response) => {
        let updateJobResponse = tsProto.scheduler.UpdateJobResponse.decode64(response.data);
        return updateJobResponse;
    });
}

export function deleteJob(jobIds: string[]): IPromise<any> {
    let path = BASE_PATH + DELETE;
    let addJobRequest =  new tsProto.scheduler.DeleteJobRequest();
    addJobRequest.setJobIds(jobIds);
    let jsonString = addJobRequest.encode64();
    let command = new Command();
    command.setPath(path)
        .setDeleteMethod()
        .setPostParams({
            deleteJobRequest: jsonString
        });

    return command.execute().then((response) => {
        let deleteJobResponse = tsProto.scheduler.DeleteJobResponse.decode64(response.data);
        return deleteJobResponse;
    });
}
export function pauseJob(jobIds: string[]): IPromise<ReportTimelyJob> {
    let pauseJobRequest = new tsProto.scheduler.PauseJobRequest();
    pauseJobRequest.setJobIds(jobIds);

    let jsonString = pauseJobRequest.encode64();
    let command = new Command();
    command.setPath(BASE_PATH + 'pause')
        .setPostMethod()
        .setPostParams({
            pauseJobRequest: jsonString
        }
    );

    return command.execute().then((response) => {
        let pauseJobResponse = tsProto.scheduler.PauseJobResponse.decode64(response.data);
        return pauseJobResponse;
    });
}

export function resumeJob(jobIds: string[]): IPromise<ReportTimelyJob> {

    let pauseJobRequest = new tsProto.scheduler.ResumeJobRequest();
    pauseJobRequest.setJobIds(jobIds);
    let jsonString = pauseJobRequest.encode64();
    let command = new Command();
    command.setPath(BASE_PATH + 'resume')
        .setPostMethod()
        .setPostParams({
            resumeJobRequest: jsonString
        }
    );

    return command.execute().then(function(response){
        let resumeJobResponse = tsProto.scheduler.ResumeJobResponse.decode64(response.data);
        return resumeJobResponse;
    });
}

export function getListOfJobsForPinboard(
    pinboardId: string,
    offset?: number,
    pageSize?: number
): IPromise<ReportTimelyJob []> {
    let protobufJobRequest = new tsProto.scheduler.GetJobRequest();
    let jobHandlerProto: JobHandlerProto = new tsProto.scheduler.JobHandler();
    jobHandlerProto.setHandler(JobHandlerProto.Handler.SCHEDULED_REPORT);
    protobufJobRequest.job_handler = jobHandlerProto;
    if (pinboardId) {
        protobufJobRequest.setTags(jsonConstants.scheduledJob.PINBOARD_ID + ':' + pinboardId);
    }
    if (!_.isNil(offset)) {
        protobufJobRequest.setOffset(offset);
    }
    if (!_.isNil(pageSize)) {
        protobufJobRequest.setLimit(pageSize);
    }

    let command = new Command();
    command
        .setPath(BASE_PATH + LIST)
        .setPostMethod()
        .setPostParams({
            getJobRequest: protobufJobRequest.encode64()
        });

    return command.execute().then((response) => {
        let protos = tsProto.scheduler.GetJobResponse.decode64(response.data);
        return (protos.job.map((proto: any) => new ReportTimelyJob(proto)));
    });

}

export function getJob(jobId: string): IPromise<ReportTimelyJob> {

    let getJobRequest = new tsProto.scheduler.GetJobRequest();
    let jobHandlerProto: JobHandlerProto = new tsProto.scheduler.JobHandler();
    jobHandlerProto.handler = JobHandlerProto.Handler.SCHEDULED_REPORT;
    getJobRequest.job_id = jobId;
    getJobRequest.job_handler = jobHandlerProto;

    let command = new Command();
    command
        .setPath(BASE_PATH + LIST)
        .setPostMethod()
        .setPostParams({
            getJobRequest:  getJobRequest.encode64()
        });

    return command.execute().then((response) => {
       if (!response.data.length) {
           return null;
       }
       let proto = tsProto.scheduler.GetJobResponse.decode64(response.data);
       let job = new ReportTimelyJob(proto.job[0]);
       return job;
   });
}

export function getJobRuns(jobId: string, limit?: number): IPromise<JobRunProto[]> {

    let getJobRunRequest = new tsProto.scheduler.GetJobRunRequest();
    getJobRunRequest.setLimit(limit ? limit : BATCH_LIMIT);
    getJobRunRequest.setJobId(jobId);

    let command = new Command();
    command
        .setPath(BASE_PATH + JOBSTATUS)
        .setPostMethod()
        .setGetParams({
            getJobRunRequest:  getJobRunRequest.encode64()
        });

    return  command.execute().then((response) => {
        let proto = tsProto.scheduler.GetJobRunResponse.decode64(response.data);
        if (!!proto.job_run) {
            return proto.job_run;
        } else {
            return [];
        }
    }, (err) => {
        return err;
    });
}

export function getCancelableJobRuns(jobId: string): IPromise<any[]> {
    return new CancelableRequest(getJobRuns(jobId));
}

export function getA3Jobs(): IPromise<A3Job []> {
    let protobufJobRequest = new tsProto.scheduler.GetJobRequest();
    let jobHandlerProto:JobHandlerProto = new tsProto.scheduler.JobHandler();
    jobHandlerProto.setHandler(JobHandlerProto.Handler.A3_Analysis);
    protobufJobRequest.job_handler = jobHandlerProto;

    let command = new Command();
    command
        .setPath(BASE_PATH + LIST)
        .setPostMethod()
        .setPostParams({
            getJobRequest: protobufJobRequest.encode64()
        });

    return command.execute().then((response) => {
        let protos = tsProto.scheduler.GetJobResponse.decode64(response.data);
        return (protos.job.map((proto:any) => new A3Job(proto)));
    });
}

interface A3JobsResponse {
    a3Jobs: A3Job[];
    isLastPage: boolean;
    new(a3Jobs: A3Job[], isLastPage: boolean): A3JobsResponse;
}

export function getA3JobsWithRuns(
    offset: number,
    pageSize: number,
    pattern: string = null,
    orderBy: string = null,
    sortAscending: boolean = false,
    runCount: number = 1
) : IPromise<A3JobsResponse> {
    let protobufJobWithRunsRequest = new tsProto.scheduler.GetJobsWithRunsRequest();
    let protobufJobRequest = new tsProto.scheduler.GetJobRequest();
    let jobHandlerProto:JobHandlerProto = new tsProto.scheduler.JobHandler();
    jobHandlerProto.setHandler(JobHandlerProto.Handler.A3_Analysis);
    protobufJobRequest.job_handler = jobHandlerProto;
    protobufJobRequest.setOffset(offset);
    protobufJobRequest.setLimit(pageSize);
    protobufJobWithRunsRequest.setGetJobRequest(protobufJobRequest);
    protobufJobWithRunsRequest.setMaxJobRuns(runCount);
    protobufJobWithRunsRequest.setJobRunsOffset(0);

    if (pattern && pattern.length > 0) {
        protobufJobRequest.setJobNameFilter(pattern);
    }
    if (orderBy && orderBy.length > 0) {
        let sortColumn: string = '';
        if (orderBy.toUpperCase() === jsonConstants.metadataTypeSort.NAME) {
            sortColumn = jsonConstants.timelyJob.NAME;
        } else if (orderBy.toUpperCase() === jsonConstants.metadataTypeSort.MODIFIED) {
            sortColumn = jsonConstants.timelyJob.LAST_MODIFICATION_TIME;
        }

        if (sortColumn.length > 0) {
            protobufJobRequest.setSortColumn(sortColumn);
        }
    }
    if (sortAscending) {
        protobufJobRequest.setSortAscending(true);
    }

    let command = new Command();
    command
        .setPath(BASE_PATH + JOB_WITH_RUNS)
        .setPostMethod()
        .setPostParams({
            getJobsWithRunsRequest: protobufJobWithRunsRequest.encode64()
        });

    return command.execute().then((response) => {
        let getJobWithRunsResponse = tsProto.scheduler.GetJobsWithRunsResponse.decode64(
            response.data
        );
        let a3Jobs = getJobsWithRuns(getJobWithRunsResponse);
        let isLastPage = getJobWithRunsResponse.getLastPage();
        let a3JobsResponse = {a3Jobs, isLastPage};
        return a3JobsResponse;
    });
}

function getJobsWithRuns(
    getJobWithRunsResponse: any
) : A3Job [] {
    let a3Jobs = getJobWithRunsResponse.getJobsWithRuns().map((jobWithRun) => {
        let a3Job = new A3Job(jobWithRun.getJob());
        let jobRuns = jobWithRun.getJobRun().map((jobRunProto) => new A3JobRun(jobRunProto));
        a3Job.setRuns(jobRuns);
        return a3Job;
    });
    return a3Jobs;
}
