/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service to communicate to trace vault.
 *
 */

import {ngRequire} from '../../base/decorators';
import IPromise = angular.IPromise;

let $http = ngRequire('$http');

const BASE_PATH = '/tracevault/';
const PUT_TRACE = 'puttrace';
const PUT_TRACES = 'puttraces';

export function putTrace(putTraceRequest) : IPromise<any> {
    let data = putTraceRequest.encode64();
    return $http({
        method: 'POST',
        url: BASE_PATH + PUT_TRACE,
        data: data
    });
}

export function putTraces(putTracesRequest) : IPromise<any> {
    let data = putTracesRequest.encode64();
    return $http({
        method: 'POST',
        url: BASE_PATH + PUT_TRACES,
        data: data
    });
}
