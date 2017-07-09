/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Exports a config class for Full embed app.
 */
import {ngRequire, Provide} from '../../../base/decorators';

let sessionService = ngRequire('sessionService');

Provide('FullEmbedConfig')({
    isPrimaryNavHidden,
    isAlertBarHidden,
    isPoweredFooterHidden
});

export function isPrimaryNavHidden() {
    return sessionService.isPrimaryNavEnabledForFullEmbed();
}

export function isAlertBarHidden() {
    return sessionService.isAlertBarHiddenForFullEmbed();
}

export function isPoweredFooterHidden() {
    return sessionService.isPoweredFooterHiddenForFullEmbed();
}
