/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This class represents the top level user worfklow trace.
 */

import {blinkConstants} from '../../base/blink-constants';
import {UserWorkflowActionNames} from '../../base/proto/blink-types';
import {BlinkNetworkTrace} from './blink-network-trace';

declare let tsProto;

export class BlinkTrace {
    private traceId: string;
    private userAction: number;
    private userTerminated: boolean = false;
    private networkTraces: BlinkNetworkTrace[];
    private startTime: number;

    constructor(id: string, userAction: number) {
        this.traceId = id;
        this.userAction = userAction;
        this.networkTraces = [];
        this.startTime = (new Date).getTime() * 1000;
    }

    public addNetworkTrace(networkTrace: BlinkNetworkTrace) {
        this.networkTraces.push(networkTrace);
    }

    public getUserAction() : number {
        return this.userAction;
    }

    public getTraceId() : string {
        return this.traceId;
    }

    public setUserTerminated() {
        this.userTerminated = true;
    }

    public getPutTraceRequest() {
        let putTraceRequest = new tsProto.net.PutTraceRequest();
        putTraceRequest.setId(this.traceId);

        let trace = new tsProto.net.TraceEvent();
        trace.setStartUs(this.startTime);
        trace.setName(UserWorkflowActionNames[this.userAction]);
        // TODO(Jasmeet): Add end semantics decoupled from this function.
        let duration = (new Date).getTime() * 1000 - this.startTime;
        trace.setDurationUs(duration);
        trace.setChronoType(tsProto.net.TraceEvent.ChronoType.CHRONO_CONCURRENT);

        let blinkWorkflowDebugInfo = new tsProto.blink.workflow.WorkflowDebugInfo();
        blinkWorkflowDebugInfo.setAction(this.getUserAction());
        blinkWorkflowDebugInfo.setUserTerminated(this.userTerminated);
        trace.set('.blink.workflow.WorkflowDebugInfo.workflow_debug_info', blinkWorkflowDebugInfo);

        let networkTraceEvents = this.networkTraces.map(nT => nT.getProtoTraceEvent());
        trace.setChild(networkTraceEvents);

        putTraceRequest.setTrace(trace);
        putTraceRequest.setCollector(blinkConstants.TRACE_COLLECTOR_NAME);
        return putTraceRequest;
    }
}
