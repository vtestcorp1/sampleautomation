/**
 * Copyright: ThoughtSpot Inc. 2015-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides a service to invoke the yseop server.
 */

'use strict';

import {ngRequire, Provide} from 'src/base/decorators';
import IPromise = angular.IPromise;

let $http = ngRequire('$http');

let authToken = 'eyJraWQiOiJwcm9kXzAiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJTYXZ2eSIsImF1ZCI6InNhbmRib3' +
    'giLCJleHAiOjE1MDY1NDQxODMsImp0aSI6IlBkajNCaVVYWDNQQVlfYUhhSnEzc2ciLCJpYXQiOjE0NzUwMDgxODMsI' +
    'nN1YiI6IkphZ2dpIEphc21lZXQgU2luZ2giLCJ0b29scyI6WyJhcGkiXSwiZW1haWwiOiJqYXNtZWV0QHRob3VnaHRz' +
    'cG90LmNvbSJ9.w_kGCwJjUSfwBDzEdgGDHycPADgmn_FVbXHYTMi9mFZTpzNkLAc2PSQKdRmFXyhbCWytCnG2Nu9nPn' +
    'ieJhUpbw:';

Provide('yseopService')({
    getTextTemplate,
    getTemplateCacheKey
});

export function getTextTemplate(config: any) : IPromise<any> {
    return $http({
        method: 'POST',
        url: 'https://savvy-us-api.yseop-cloud.com/sandbox/api/v1/describe-chart',
        headers: {
            'Authorization': 'Basic ' + btoa(authToken),
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'text/html'
        },
        data: JSON.stringify(config)
    }).then(function(response) {
        return response.data;
    });
}

export function getTemplateCacheKey(vizId: string) : string {
    return vizId + '_text.html';
}
