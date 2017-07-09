/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This service exposes information about the client state.
 */

import {ngRequire, Provide} from '../base/decorators';
import {ClientTypes} from '../base/proto/callosum-types';

declare var flags: any;
declare var addBooleanFlag: any;

addBooleanFlag('embedApp', 'This flag enables full embed app', false);

let env = ngRequire('env');
let jsUtil = ngRequire('jsUtil');

export function isAppEmbedded() : boolean {
    // If running scenarios testing, inIFrame will always return
    // true since it is run in IFrame. Thus, to allow testing, the
    // function isAppEmbedded should return false if running scenarios.
    if (env.scenarios) {
        return false;
    }
    return flags.getValue('embedApp');
}

export function isAppInIFrame() : boolean {
    return jsUtil.inIFrame();
}

export function getClientType() : number {
    return isAppEmbedded()
        ? ClientTypes.FULL_EMBED
        : ClientTypes.BLINK;
}

Provide('clientState')({
    isAppEmbedded,
    isAppInIFrame,
    getClientType
});
