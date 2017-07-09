/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This class provides end user workflow management in the app.
 *
 * The goal here to to capture active user workflow and track all the activity
 * in the app for the workflow.
 */

import {ngRequire} from '../../base/decorators';
import {BlinkNetworkTrace} from './blink-network-trace';
import {BlinkTrace} from './blink-trace';
import {putTrace} from './trace-vault-service';
import IPromise = angular.IPromise;

let jsUtil = ngRequire('jsUtil');
let Logger = ngRequire('Logger');

export enum UserWorkflowStates {
    IDLE,
    ACTIVE
}

export class WorkflowManager {
    private userWorkflowState: UserWorkflowStates;
    private activeTrace: BlinkTrace;
    private logger;

    constructor() {
        this.logger = Logger.create('worflow-manager');
        this.userWorkflowState = UserWorkflowStates.IDLE;
        this.activeTrace = null;
    }

    public startSyncWorkflow(action: number) {
        if (this.userWorkflowState === UserWorkflowStates.ACTIVE) {
            this.activeTrace.setUserTerminated();
        }
        this.activeTrace = new BlinkTrace(
            jsUtil.generateUUID(),
            action
        );
        this.userWorkflowState = UserWorkflowStates.ACTIVE;
    }

    public endSyncWorkflow(action: number) : BlinkTrace {
        let workflowTrace = this.activeTrace;
        if (this.activeTrace && action !== this.activeTrace.getUserAction()) {
            this.logger.error(
                'User action mismatch',
                action,
                this.activeTrace.getUserAction()
            );
        }

        this.activeTrace = null;
        this.userWorkflowState = UserWorkflowStates.IDLE;
        return workflowTrace;
    }

    public terminateWorkflow() {
        if (!!this.activeTrace) {
            this.activeTrace.setUserTerminated();
        }
    }

    public getNewNetworkTrace() : BlinkNetworkTrace {
        let networkTrace = new BlinkNetworkTrace();
        if (!this.activeTrace) {
            this.logger.info('Unimplemented user workflow');
            return networkTrace;
        }

        this.activeTrace.addNetworkTrace(networkTrace);
        return networkTrace;
    }

    public getWorkflowId(): string {
        return !!this.activeTrace ? this.activeTrace.getTraceId() : null;
    }

    public flushWorkflow() : IPromise<any> {
        return putTrace(this.activeTrace.getPutTraceRequest());
    }
}
