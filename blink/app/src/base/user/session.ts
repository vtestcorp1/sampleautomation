/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview Object encapsulating session info from Callosum.
 */
import _ from 'lodash';
import {Provide} from '../decorators';

var
    // will be set after calling /session/info
    _info: any = null,

    initialized: boolean = false,

    // keep track of last route in which some api call gave 401 unauth,
    // so that after successful login we can reload that route
    _last401Path : string = '',

    _locale: string = 'en-US',
    _localeHash: Object = {},

    // Incident id from api calls for either success or error
    _incidentId: string = '';

/**
 * @param {string} last401Path
 */
export let setLast401Path = function (last401Path) {
    _last401Path = last401Path;
};

/**
 * @return {string}
 */
export let getLast401Path = function () {
    return _last401Path;
};

/**
 * @param {Object|null} info from /session/info api call
 */
export let setInfo = function (info) {
    initialized = true;
    _info = info;
};

/**
 * @return {Object|null} info from /session/info api call
 */
export let getInfo = function () {
    return _info;
};

export let getBackendConfig = function () {
    if (!_info || !_info.configInfo) {
        return null;
    }
    return _info.configInfo;
};

/**
 * Return true if session status has been fetched at least once.
 * This is used to show a "loading" state on the initial page
 * load when we don't yet know whether to show the login page
 * or the one pointed to by the url (SCAL-6122)
 */
export let isInitialized = function () {
    return initialized;
};

export let setInitialized = function () {
    initialized = true;
};

/**
 * @return {string}
 */
export let getLocale = function () {
    return _locale;
};

export let setLocale = function (locale) {
    _locale = locale;
};

export let getTraceId = function () {
    return _incidentId;
};

export let setTraceId = function (incidentId) {
    _incidentId = incidentId;
};

export let clearTraceId = function (incidentId) {
    _incidentId = null;
};

/**
 * @return {Object}
 */
export let getLocaleHash = function () {
    return _localeHash[_locale] || {};
};

var _lastLogoutTime;
/**
 * Clear session info.
 */
export let clear = function() {
    _info = null;
    _last401Path = '';
    _lastLogoutTime = (new Date()).getTime();
};

var _automaticallyLoggedOut = false;
export let markAutomaticallyLoggedOut = function () {
    _automaticallyLoggedOut = true;
};

export let wasAutomaticallyLoggedOut = function () {
    return _automaticallyLoggedOut;
};

var LOGOUT_TOO_OLD_THRESHOLD = 7 * 24 * 3600 * 1000;  // A week is too old.
export let isLastLogoutTooOld = function () {
    if (_.isUndefined(_lastLogoutTime)) {
        return false;
    }
    return (new Date()).getTime() - _lastLogoutTime >= LOGOUT_TOO_OLD_THRESHOLD;
};

var _manuallyLoggedOut = false;

export let markManualLoggedOut = function() {
    _manuallyLoggedOut = true;
};

export let wasManuallyLoggedOut = function () {
    return _manuallyLoggedOut;
};

Provide('session')({
    setLast401Path,
    getLast401Path,
    setInfo,
    getInfo,
    getBackendConfig,
    isInitialized,
    setInitialized,
    getLocale,
    setLocale,
    getTraceId,
    setTraceId,
    clearTraceId,
    getLocaleHash,
    clear,
    markAutomaticallyLoggedOut,
    wasAutomaticallyLoggedOut,
    isLastLogoutTooOld,
    markManualLoggedOut,
    wasManuallyLoggedOut
});
