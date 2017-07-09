/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This class represents trace object wrapping a single network
 * call made by blink.
 */

import {ngRequire} from '../../base/decorators';

declare let tsProto;

let jsUtil = ngRequire('jsUtil');

export class BlinkNetworkTrace {
    private traceId: string;
    private startTime: number;
    private endTime: number;
    private childTraceId: string;
    private url: string;

    constructor() {
        this.traceId = jsUtil.generateUUID();
        this.childTraceId = jsUtil.generateUUID();
    }

    public start() {
        this.startTime = (new Date).getTime() * 1000;
    }

    public end() {
        this.endTime = (new Date).getTime() * 1000;
    }

    public getTraceId() : string {
        return this.traceId;
    }

    public getChildTraceId() : string {
        return this.childTraceId;
    }

    public setUrl(url: string) {
        this.url = url;
    }

    public getProtoTraceEvent() : any {
        let trace = new tsProto.net.TraceEvent();
        trace.setTraceId(this.traceId);
        trace.setName(this.url);
        trace.setStartUs(this.startTime);
        let duration = this.endTime - this.startTime;
        trace.setDurationUs(duration);
        trace.setChronoType(tsProto.net.TraceEvent.ChronoType.CHRONO_SEQUENTIAL);

        let childTrace = new tsProto.net.TraceEvent();
        childTrace.setTraceId(this.childTraceId);
        let clockAlign = new tsProto.net.TraceEvent.ClockAlign();
        clockAlign.setType(tsProto.net.TraceEvent.ClockAlign.Type.REMOTE_CLOCK_UNKNOWN);
        childTrace.setClockAlign(clockAlign);

        trace.setChild([childTrace]);

        return trace;
    }
}
