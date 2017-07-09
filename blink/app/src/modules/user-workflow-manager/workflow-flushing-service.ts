/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service that stores completed workflows, and takes care of pushing
 * out traces to server periodically.
 */

import {BlinkTrace} from './blink-trace';
import {putTraces} from './trace-vault-service';

let TRACE_PUSH_POLLING_TIME_MS = 10 * 1000;
declare let tsProto: any;

// Tracks all the traces that are complete and ready to be pushed
// out to TraceVault.
let completedTraces: BlinkTrace[] = [];

export function addTrace(trace: BlinkTrace) {
    completedTraces.push(trace);
}

function enqueueFlush() {
    setTimeout(
        () => {
            enqueueFlush();
            if (completedTraces.length === 0) {
                return;
            }
            let putTracesRequest = new tsProto.net.PutTracesRequest();
            let putTraceRequests = completedTraces.map((blinkTrace: BlinkTrace) => {
               return blinkTrace.getPutTraceRequest();
            });
            let sentTraces = completedTraces.slice();
            completedTraces = [];
            Array.prototype.push.apply(
                putTracesRequest.getRequest(),
                putTraceRequests
            );
            putTraces(putTracesRequest).then(
                () => {
                    // Nothing to do on success.
                },
                () => {
                    Array.prototype.push.apply(
                        completedTraces,
                        sentTraces
                    );
                }
            );
        },
        TRACE_PUSH_POLLING_TIME_MS
    );
}

export function initWorkflowFlush() {
    enqueueFlush();
}
