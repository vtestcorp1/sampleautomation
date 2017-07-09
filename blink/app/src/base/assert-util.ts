/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview  A generic util to provide assert sugar to the app.
 */

import {ngRequire} from './decorators';

let Logger = ngRequire('Logger');
let logger = null;

function logError() {
    if (logger === null) {
        logger = Logger.create('assert-util');
    }
}

function assertNotNull(obj: any) : boolean {
    if (obj === null) {
        logError();
        return false;
    }
    return true;
}

function assertNotUndefined(obj: any) : boolean {
    if (obj === void 0) {
        logError();
        return false;
    }
    return true;
}

function assertNotNullOrUndefined(obj: any) : boolean {
    if (obj === null || obj === void 0) {
        logError();
        return false;
    }
    return true;
}

export {
    assertNotNull,
    assertNotNullOrUndefined,
    assertNotUndefined
};
