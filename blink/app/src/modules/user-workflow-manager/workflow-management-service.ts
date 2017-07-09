/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service exposing workflow management APIs.
 */

import {Provide} from '../../base/decorators';
import {BlinkNetworkTrace} from './blink-network-trace';
import {WorkflowManager} from './workflow-manager';
import IPromise = angular.IPromise;
import {addTrace} from './workflow-flushing-service';

let workflowManager: WorkflowManager = null;

export function initWorkflowService() : void {
    workflowManager = new WorkflowManager();
}

export function getNewNetworkTrace() : BlinkNetworkTrace {
    return workflowManager.getNewNetworkTrace();
}

export function startWorkflow(action: number) {
    workflowManager.startSyncWorkflow(action);
}

export function endWorkflow(action: number) {
    let workflowTrace = workflowManager.endSyncWorkflow(action);
    if (!!workflowTrace) {
        addTrace(workflowTrace);
    }
}

export function terminateWorkflow() {
    workflowManager.terminateWorkflow();
}

export function getCurrentWorkflowId() : string {
    return workflowManager.getWorkflowId();
}

export function flushCurrentTraceToServer() : IPromise<any> {
    return workflowManager.flushWorkflow();
}

Provide('workflowManagementService')({
    getNewNetworkTrace,
    startWorkflow,
    endWorkflow,
    getCurrentWorkflowId,
    terminateWorkflow,
    flushCurrentTraceToServer
});
