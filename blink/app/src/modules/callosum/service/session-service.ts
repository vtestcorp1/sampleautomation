/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Service used to establish user sessions and access all
 * user-session related information such as privileges, preferences etc.
 */

import _ from 'lodash';
import Subject from 'rxjs/Subject';
import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire, Provide} from '../../../base/decorators';
import * as session from '../../../base/user/session';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import IPromise = angular.IPromise;

let $q = ngRequire('$q');
let Command = ngRequire('Command');
let navService = ngRequire('navService');
let util = ngRequire('util');

declare var addBooleanFlag: Function;
declare var addStringFlag: Function;
declare var flags: any;
declare var window: any;
declare var blink: any;
/*global addBooleanFlag */
addBooleanFlag('enableAnswers', 'This flag enables saved answers behaviour', false);
addStringFlag('locale', 'This flag overrides any preferred locales', '');
addBooleanFlag('restrictSearchHelp', 'Test flag to set/unset this cluster state', false);

var
    // Just to fallback to something in case server doesn't sent it.
    TABLE_PRINT_DEFAULT_BATCH_SIZE: number = 100,

    // Key for privileges node in _info
    PRIVILEGES_KEY: string = 'privileges',

    // Key for preferences node in _info
    PREFERENCES_KEY: string = 'preferences',

    // Keys for specific preferences within the PREFERENCES node
    // User preference identifiers start with PREFERENCE_KEY_
    PREFERENCE_KEY_SHOW_APP_TOUR_ON_STARTUP: string = 'showAppTourOnStartup',
    PREFERENCE_KEY_SAGE_DATA_SOURCE: string = 'sageDataSource',
    PREFERENCE_KEY_HOME_PINBOARD_ID: string = 'homePinboardId',

    // Keys for exposed user preferences within the jsonConstants.EXPOSED_USER_PREFERENCES_KEY node
    // of sessionInfo
    // Exposed User preference identifiers start with EXPOSED_PREFERENCE_KEY_
    EXPOSED_PREFERENCE_KEY_NOTIFY_ON_SHARE: string = 'notifyOnShare',

    // we debounce the calls to persist preferences on the server
    // side as a last catch for any bug that could trigger this in
    // a loop (SCAL-6047)
    SAVE_CLIENT_STATE_DEBOUNCE_DELAY: number = 500;

export let sessionGuids = [];

export let onUserLoggedIn: Subject.Subject<void> = new Subject.Subject<void>();
export let onUserLoggedOut: Subject.Subject<void> = new Subject.Subject<void>();

/**
 * Load session info in global session object
 * @return {Object} Promise
 */
export let getSessionInfo = function () : PromiseLike<any> {
    var command = new Command()
        .setPath('/session/info');

    return command.execute();
};

/**
 * Whether the user is logged in
 * @return {boolean}
 */
export let isLoggedIn = function () : boolean {
    if (!session.getInfo()) {
        return false;
    }
    return !!session.getInfo().userGUID;
};

/**
 * User has successfully authenticated, update the session and fire the USER_AUTHENTICATED_D event.
 * @param {Object} sessionInfo          The session object with which the user has just
 *                                      successfully authenticated
 * @param {boolean} isExplicitLogin     True if the user has just authenticated through the login
 *                                      screen (i.e. user was not already logged in)
 */
function userAuthenticated(sessionInfo: Object, isExplicitLogin?: boolean): void {
    session.setInfo(sessionInfo);
    if (isExplicitLogin) {
        onUserLoggedIn.next();
    }
}

/**
 * User has logged out. User session no longer valid.
 */
function userLoggedOut() {
    session.clear();
    onUserLoggedOut.next();
}

/**
 * Checks if the session is valid
 * @param {Object} sessionInfo  The session object to validate
 * @param {boolean}             Whether the session is valid
 */
function isValidSession(sessionInfo) : boolean {
    if (!sessionInfo || !sessionInfo.userGUID || !util.isValidGuid(sessionInfo.userGUID)) {
        return false;
    }
    return true;
}

/**
 * Attempt to authenticate the user by making a session info call to callosum
 * @return {Object}    A promise that will resolve if user is authenticated, and be rejected
 * otherwise.
 */
export let authenticate = function () : IPromise<void> {
    var deferred = $q.defer();
    getSessionInfo()
        .then(function (response) {
            var sessionInfo = response.data;
            session.setInitialized();
            if (isValidSession(sessionInfo)) {
                userAuthenticated(sessionInfo);
                deferred.resolve();
            } else {
                session.setInfo(sessionInfo);
                deferred.reject();
            }
        }, function (error) {
            if (navService.isEmbedded()) {
                // If trying to authenticate the user within the embedded app and it failed,
                // notify the parent about the failure and let the user be routed to the
                // login page as always.
                window.thoughtspot.notifyOnAuthExpiration();
            }
            session.setInitialized();
            if (error.status === blinkConstants.HTTP_STATUS_NOT_LOGGED_IN) {
                session.setInfo(error.data);
            }
            deferred.reject(error);
        });
    return deferred.promise;
};

/**
 * Helper function that takes the response of login call and set the session.
 * @param response
 * @returns {*}
 */
function handleLoginResponse(response) : PromiseLike<any> {
    var sessionInfo = response.data;
    if (isValidSession(sessionInfo)) {
        var last401Path = session.getLast401Path();
        session.setLast401Path('');
        userAuthenticated(sessionInfo, true);
        response.data = last401Path;
        return $q.resolve(response);
    } else {
        return $q.reject(response);
    }
}

/**
 * Make a login request
 * @param {string} username     The username the user typed
 * @param {string} password     The password the user typed
 * @param {boolean} rememberme  Whether to keep the session active
 * @return {Object} Promise     A promise that will resolve on successful login
 */
export let doLogin = function (username, password, rememberme): PromiseLike<any> {
    var command = new Command()
        .setPath('/session/login')
        .setPostMethod()
        .setPostParams({
            username: username,
            password: password,
            rememberme: !!rememberme
        });

    return command.execute().then(handleLoginResponse);
};

/**
 * Make a login request using user id and the auth token instead of password. We use this
 * mechanism to authenticate a user when loading a pinboard for the purpose of taking
 * screenshot for scheduled reporting.
 * @param {string} userId       The guid of the user we want to login.
 * @param {string} authToken    Authentication token
 * @return {Object} Promise     A promise that will resolve on successful login
 */
export let doShortLivedLogin = function (userId: string, authToken: string): PromiseLike<any> {
    var command = new Command()
        .setPath('/session/shortlivedlogin')
        .setPostMethod()
        .setPostParams({
            id: userId,
            shortlivedauthenticationtoken: authToken
        });

    return command.execute().then(handleLoginResponse);
};

/**
 * @return {Object} Promise
 */
export let doLogout = function (): PromiseLike<any> {
    var command = new Command()
        .setPath('/session/logout')
        .setPostMethod();

    return command.execute()
        .then(function (response) {
            userLoggedOut();
            return response;
        });
};

/**
 * Returns whether the current user has a certain privilege
 *
 * @return {string}  privilege  A privilege key
 * @return {boolean}            True if current user has the privilege
 */
export let hasPrivilege = function (privilege: string): boolean {
    var sessionInfo = session.getInfo();
    if (!sessionInfo || !sessionInfo[PRIVILEGES_KEY]) {
        return false;
    }
    return sessionInfo[PRIVILEGES_KEY].some(privilege);
};

/**
 * Checks if currently logged-in user has admin privileges
 *
 * @return {boolean}        True if current user has admin privileges; false else.
 */
export let hasAdminPrivileges = function (): boolean {
    return hasPrivilege(jsonConstants.privilegeType.ADMINISTRATION);
};

/**
 * Checks if currently logged-in user has data upload privileges.
 *
 * @return {boolean}        True if current user has data upload privileges
 */
export let hasUserDataUploadPrivileges = function (): boolean {
    return hasPrivilege(jsonConstants.privilegeType.USERDATAUPLOADING);
};

/**
 *
 * @returns {boolean}
 */
export let hasDataDownloadPrivileges = function () : boolean {
    return hasPrivilege(jsonConstants.privilegeType.DATADOWNLOADING);
};

/**
 *
 * @returns {boolean}
 */
export let hasDataManagementPrivileges = function (): boolean {
    return hasPrivilege(jsonConstants.privilegeType.DATAMANAGEMENT);
};

/**
 *
 * @returns {boolean}
 */
export let hasJobSchedulingPrivileges = function (): boolean {
    return hasPrivilege(jsonConstants.privilegeType.JOBSCHEDULING);
};

/**
 *
 * @returns {boolean}
 */
export let hasA3AnalysisPrivileges = function () : boolean {
    return hasPrivilege(jsonConstants.privilegeType.A3ANALYSIS);
};

/**
 *
 * @returns {boolean}
 */
export let canUserManageData = function (): boolean {
    return hasDataManagementPrivileges()
        || hasAdminPrivileges();
};

export let canShareWithAll = function (): boolean {
    return hasPrivilege(jsonConstants.privilegeType.SHAREWITHALL);
};

/**
 * Client state is a collection of key-value pairs that Blink uses to store state about any
 * persistable state of objects. Callosum saves an object's client state as provided by Blink and
 * treats it as a black box.
 * For user objects we use client state to store user preferences.
 *
 * @return {Object}      CLIENT_STATE_KEY node in session info.
 */
export let getClientState = function (): Object {
    var sessionInfo = session.getInfo();
    if (!sessionInfo || !sessionInfo[jsonConstants.CLIENT_STATE_KEY]) {
        return null;
    }
    return sessionInfo[jsonConstants.CLIENT_STATE_KEY];
};

/**
 * @param clientState client state object to set in session info
 * @return {boolean}    true if state was successfully set
 */
export let setClientState = function (clientState) : boolean {
    var sessionInfo = session.getInfo();
    if (!sessionInfo) {
        return false;
    }
    sessionInfo[jsonConstants.CLIENT_STATE_KEY] = clientState;
    return true;
};

function getConfigInfo(key): any {
    var sessionInfo = session.getInfo();
    if (!sessionInfo) {
        return null;
    }
    var configInfo = sessionInfo[jsonConstants.CONFIG_INFO_KEY];
    if (!configInfo) {
        return null;
    }
    if (!Object.has(configInfo, key)) {
        return null;
    }
    return configInfo[key];
}

export let isSageUserFeedbackEnabled = function (): boolean {
    return getConfigInfo(jsonConstants.ENABLE_SAGE_USER_FEEBBACK);
};

export let isRoleEnabled = function(): boolean {
    return getConfigInfo(jsonConstants.ENABLE_ROLE_SYSTEM_VARIABLE);
};

export let isWorksheetViewerEnabled = function(): boolean {
    return getConfigInfo(jsonConstants.ENABLE_WKS_VIEWER);
};

export let isWorksheetSampleValuesDisabled = function (): boolean {
    return getConfigInfo(jsonConstants.DISABLE_WORKSHEET_SAMPLE_VALUES);
};

export let isWorksheetOverAggregatedWorksheetEnabled = function (): boolean {
    var isWorksheetOverAggregatedWorksheetEnabled
            = getConfigInfo(jsonConstants.ENABLE_WORKSHEET_OVER_AGGR_WKS);
    return !!isWorksheetOverAggregatedWorksheetEnabled;
};

export let isAggregatedWorksheetTableJoinEnabled = function (): boolean {
    var isAggregatedWorksheetTableJoinEnabled
            = getConfigInfo(jsonConstants.ENABLE_AGGR_WKS_TABLE_JOIN);
    return !!isAggregatedWorksheetTableJoinEnabled;
};


export let isAnswerDisabled = function (): boolean {
    /* global flags */
    var isAnswerEnabled = flags.getValue('enableAnswers');
    if (isAnswerEnabled === true) {
        return !isAnswerEnabled;
    }
    return getConfigInfo(jsonConstants.DISABLE_ANSWER);
};

export let isAnswerDisplayModePreferenceDisabled = function (): boolean {
    return getConfigInfo(jsonConstants.DISABLE_ANSWER_DISPLAY_MODE_PREFERENCE);
};
export let getInstalledSchemaVersion = function (): string {
    return getConfigInfo(jsonConstants.INSTALLED_SCHEMA_VERSION);
};

export let getCustomerAdminEmail = function (): string {
    return getConfigInfo(jsonConstants.CUSTOMER_ADMIN_EMAIL);
};

export let getCustomerAdminPhoneNumber = function (): string {
    return getConfigInfo(jsonConstants.CUSTOMER_ADMIN_PHONE_NUMBER);
};

export let isStyleCustomizationEnabled = function (): boolean {
    return getConfigInfo(jsonConstants.ENABLE_STYLE_CUSTOMIZATION);
};

export let isFontStyleCustomizationEnabled = function (): boolean {
    return getConfigInfo(jsonConstants.ENABLE_FONT_STYLE_CUSTOMIZATION);
};

export let isFoolscapPdfDownloadEnabled = function (): boolean {
    return getConfigInfo(jsonConstants.ENABLE_FOOLSCAP_PDF_DOWNLOAD);
};

export let isMetadataMigrationEnabled = function () {
    return getConfigInfo(jsonConstants.ENABLE_METADATA_MIGRATION);
};

export let isSchedulingJobEnabled = function() {
    var schedulerConfig = getConfigInfo(jsonConstants.SCHEDULER_CONFIG);
    return schedulerConfig[jsonConstants.SCHEDULE_REPORTING_ENABLED];
};

export let isA3Enabled = function() {
    var a3Config = getConfigInfo(jsonConstants.A3_CONFIG);
    return a3Config !== null
        && a3Config[jsonConstants.A3_ENABLED]
        && hasA3AnalysisPrivileges();
};

export let isA3EnabledInConfig = function() {
    var a3Config = getConfigInfo(jsonConstants.A3_CONFIG);
    return a3Config !== null
        && a3Config[jsonConstants.A3_ENABLED];
};

export let getA3PinboardExpiryTime = function() : number {
    var a3Config = getConfigInfo(jsonConstants.A3_CONFIG);
    return !!a3Config
        ? a3Config[jsonConstants.A3_PINBOARD_EXPIRY_IN_SECONDS] * 1000
        : 0;
};

export let getWhiteListedEmailDomainsForReport = function() {
    var schedulerConfig = getConfigInfo(jsonConstants.SCHEDULER_CONFIG);
    var domains = schedulerConfig[jsonConstants.EMAIL_DOMAINS_WHITELIST];
    if (!domains) {
        domains = [];
    }
    return domains;
};

export let getListSearchDebouncingInMS = function() {
    return getConfigInfo(jsonConstants.LIST_SEARCH_DEBOUNCING_IN_MS);
};

export let isLightweightETLEnabled = function () {
    var infaConfig = getConfigInfo(jsonConstants.INFORMATICA_CONFIG);
    return !!infaConfig && !!infaConfig.enabled;
};

export let getETLExpressionAssistantUrl = function () {
    var infaConfig = getConfigInfo(jsonConstants.INFORMATICA_CONFIG);
    return infaConfig[jsonConstants.INFORMATICA_EXPRESSION_ASSISTANT] || '';
};

export let isDataConnectUsingTimely = function () {
    var infaConfig = getConfigInfo(jsonConstants.INFORMATICA_CONFIG);
    return !infaConfig || infaConfig[jsonConstants.USE_TIMELY_SCHEDULING];
};

export let areMapTilesEnabled = function () {
    return getConfigInfo(jsonConstants.ENABLE_MAP_TILES_CONFIG_KEY);
};

export let getGeoDataBatchSize = function() {
    var geoConfig = getConfigInfo(jsonConstants.GEO_MAP_CONFIG_KEY);
    return geoConfig && geoConfig[jsonConstants.DATA_BATCH_SIZE_KEY];
};

export let getTablePrintDataBatchSize = function () {
    var srConfig = getConfigInfo(jsonConstants.SCHEDULE_REPORTING_CONFIG);
    if (!srConfig || !srConfig[jsonConstants.TABLE_PRINT_DATA_BATCH_SIZE]) {
        return TABLE_PRINT_DEFAULT_BATCH_SIZE;
    }
    return Number(srConfig[jsonConstants.TABLE_PRINT_DATA_BATCH_SIZE]);
};

export let getTablePrintDataBatchSizeForSlack = function () {
    var srConfig = getConfigInfo(jsonConstants.SLACK_BOT_CONFIG);
    if (!srConfig || !srConfig[jsonConstants.TABLE_PRINT_DATA_BATCH_SIZE]) {
        return TABLE_PRINT_DEFAULT_BATCH_SIZE;
    }
    return srConfig[jsonConstants.TABLE_PRINT_DATA_BATCH_SIZE];
};


export let isPrimaryNavEnabledForFullEmbed = function () {
    var fullEmbedConfig = getConfigInfo(jsonConstants.FULL_EMBED_CONFIG);
    return fullEmbedConfig[jsonConstants.PRIMARY_NAV_HIDDEN];
};

export let isAlertBarHiddenForFullEmbed = function () {
    var fullEmbedConfig = getConfigInfo(jsonConstants.FULL_EMBED_CONFIG);
    return !!fullEmbedConfig && !!fullEmbedConfig[jsonConstants.ALERT_BAR_HIDDEN];
};

export let isPoweredFooterHiddenForFullEmbed = function () {
    var fullEmbedConfig = getConfigInfo(jsonConstants.FULL_EMBED_CONFIG);
    return !!fullEmbedConfig[jsonConstants.POWERED_FOOTER_HIDDEN];
};

export let isNPSEnabled = function () {
    var isNpsEnabled = getConfigInfo(jsonConstants.ENABLE_NPS_METRICS);
    return !!isNpsEnabled;
};

/**
 * Returns whether or not current cluster/session is the trial version of ThoughtSpot.
 * Context - this trial would be a promotion available on thoughtspot.com
 *
 * @return {boolean}    true if trial version is enabled
 */
export let isTrialVersionEnabled = function () {
    var trialVersionConfig = getConfigInfo(jsonConstants.TRIAL_VERSION_CONFIG_KEY);

    if (!trialVersionConfig) {
        return false;
    }

    return !!trialVersionConfig[jsonConstants.TRIAL_ENABLED_KEY];
};

function getCalendarsConfig() {
    return getConfigInfo(jsonConstants.CALENDARS_KEY);
}

function isSearchHelpRestricted() : boolean {
    return !!flags.getValue('restrictSearchHelp')
        ||getConfigInfo(jsonConstants.RESTRICT_SEARCH_HELP);
}

export let getDefaultCalendar = function () {
    var calendars = getCalendarsConfig();
    if (!calendars) {
        return null;
    }
    if (!Object.has(calendars, jsonConstants.DEFAULT_CALENDAR_KEY)) {
        return null;
    }
    return calendars[jsonConstants.DEFAULT_CALENDAR_KEY];
};

export let getAcceptLanguage = function () {
    var sessionInfo = session.getInfo();
    if (!sessionInfo) {
        return null;
    }
    return sessionInfo[jsonConstants.ACCEPT_LANGUAGE_CONFIG_KEY];
};

export let getCanChangePassword = function () {
    var sessionInfo = session.getInfo();
    if (!sessionInfo) {
        return false;
    }
    return sessionInfo[jsonConstants.CAN_CHANGE_PASSWORD];
};

/**
 * @return {string}
 */
export let getUserGuid = function () {
    var sessionInfo = session.getInfo();
    return sessionInfo ? sessionInfo.userGUID : '';
};

var deBouncedSaveClientState = _.debounce(saveClientState, SAVE_CLIENT_STATE_DEBOUNCE_DELAY);

/**
 * User preferences are key-value pairs stored in the the PREFERENCES_KEY child node of
 * the CLIENT_STATE_KEY node in session info.
 *
 * @return {Object}
 */
export let getUserPreferences = function () {
    var clientState = getClientState();
    if (!clientState) {
        return {};
    }
    return clientState[PREFERENCES_KEY] || {};
};

export let removeUserPreferences = function(key) {
    var clientState = getClientState() || {};
    var clientPreferences = clientState[PREFERENCES_KEY];
    delete clientPreferences[key];
    setClientState(clientState);
    deBouncedSaveClientState(clientState);
};

/**
 * @param key           user preference key to set value for
 * @param value         user preference value to set for key
 */
export let setPreference = function (key, value) {
    // We are not rolling back the change in case
    // the network save fails. That will require a
    // few cases to be handled:
    // 1. Revert back to old state if the call fails
    // 2. Ensure the change for call 2 does not get
    //    lost if response for call 1 arrives after
    //    the one for call 2
    // 3. Ensure that revert is backward transient
    //    i.e if call 3 and 2 both fails for key K
    //    it should reset to the value after call 1
    // 4. other possible consistency issues...
    var clientState = getClientState() || {};
    var prefs = clientState[PREFERENCES_KEY] || {};
    // if the saved value is the same as we are
    // going to set now avoid triggering a network
    // call
    if (_.isEqual(prefs[key], value)) {
        return;
    }
    prefs[key] = value;
    clientState[PREFERENCES_KEY] = prefs;
    setClientState(clientState);
    deBouncedSaveClientState(clientState);
};

/**
 * @param key preference key
 * @return {object} preference value
 */
export let getPreference = function (key) {
    var clientState = getClientState();
    if (!clientState) {
        return null;
    }
    var prefs = clientState[PREFERENCES_KEY];
    if (!prefs) {
        return null;
    }
    return prefs[key];
};
/**
 * Exposed user preferences are key-value pairs stored in the the EXPOSED_USER_PREFERENCES_KEY
 * child node of session info. These preferences are exposed to the user who can modify them
 * unlike the preferences in client state that are not exposed to the user.
 *
 * @return {Object} preferences map
 */
export let getExposedUserPreferences = function () {
    var sessionInfo = session.getInfo();
    if (!sessionInfo || !sessionInfo[jsonConstants.EXPOSED_USER_PREFERENCES_KEY]) {
        return {};
    }
    return sessionInfo[jsonConstants.EXPOSED_USER_PREFERENCES_KEY];
};

/**
 * Get exposed user preference by key.
 *
 * @param key of desired preference
 * @return {Object} preference mapping for given key
 */
export let getExposedUserPreference = function (key) {
    var sessionInfo = session.getInfo();
    if (!sessionInfo || !sessionInfo[jsonConstants.EXPOSED_USER_PREFERENCES_KEY]) {
        return null;
    }
    return sessionInfo[jsonConstants.EXPOSED_USER_PREFERENCES_KEY][key];
};

/**
 * Set exposed user preference.
 *
 * @param key of preference being set
 * @param value of preference being set
 */
export let setExposedUserPreference = function (key, value) {
    var sessionInfo = session.getInfo();
    if (!sessionInfo || !sessionInfo[jsonConstants.EXPOSED_USER_PREFERENCES_KEY]) {
        return;
    }
    sessionInfo[jsonConstants.EXPOSED_USER_PREFERENCES_KEY][key] = value;
};

/**
 * Get user preference proto base64 string.
 *
 * @param key of desired preference
 * @return {Object} preference mapping for given key
 */
export let getUserPreferenceProto = function () {
    var sessionInfo = session.getInfo();
    if (!sessionInfo || !sessionInfo[jsonConstants.USER_PREFERENCES_PROTO_KEY]) {
        return null;
    }
    return sessionInfo[jsonConstants.USER_PREFERENCES_PROTO_KEY];
};

/**
 * Set user preference proto base64 string.
 *
 * @param key of desired preference
 * @return {Object} preference mapping for given key
 */
export let setUserPreferenceProto = function (base64Encoded: string) {
    var sessionInfo = session.getInfo();
    if (!!sessionInfo) {
        sessionInfo[jsonConstants.USER_PREFERENCES_PROTO_KEY] = base64Encoded;
    }
};

/**
 * @return {Boolean} true if user has preference to notify him by e-mail on share of a
 * pinboard/answer.
 */
export let shouldNotifyOnShare = function () {
    var notifyOnSharePref = getExposedUserPreference(EXPOSED_PREFERENCE_KEY_NOTIFY_ON_SHARE);
    // if this pref is not defined, want to notify on share
    if (notifyOnSharePref === null || notifyOnSharePref === undefined) {
        return true;
    }
    return notifyOnSharePref === true;
};

/**
 * Set notify on share exposed user preference.
 *
 * @param notifyOnShare value of preference being set
 */
export let setNotifyOnShare = function (notifyOnShare) {
    setExposedUserPreference(EXPOSED_PREFERENCE_KEY_NOTIFY_ON_SHARE, notifyOnShare);
};

export let setPreferredLocale = function (notifyOnShare) {
    setExposedUserPreference(jsonConstants.PREFERRED_LOCALE_KEY, notifyOnShare);
};

export let getPreferredLocale = function() {
    if(!!flags.getValue('locale')) {
        return flags.getValue('locale');
    }

    var preferredLocale = getExposedUserPreference(jsonConstants.PREFERRED_LOCALE_KEY);
    // if this pref is not defined, want to get browser locale
    if (preferredLocale === null || preferredLocale === undefined) {
        return blink.getAppLocale();
    }
    return preferredLocale;
};

/**
 * @return {Boolean} true if user has preference to see app tour on login
 */
export let shouldShowAppTourOnStartup = function () {
    var appTourPref = getPreference(PREFERENCE_KEY_SHOW_APP_TOUR_ON_STARTUP);
    // if this pref is not defined, want to show app tour
    if (appTourPref === null || appTourPref === undefined) {
        return true;
    }
    return appTourPref === true;
};

/**
 * Called to indicate App tour has been shown. Write preference to backend to not show again.
 */
export let appTourShown = function () {
    setPreference(PREFERENCE_KEY_SHOW_APP_TOUR_ON_STARTUP, false);
};

export let getUserSlackId = function () {
    var sessionInfo = session.getInfo();
    if (!sessionInfo || !sessionInfo[jsonConstants.USER_SLACK_ID]) {
        return null;
    }
    return sessionInfo[jsonConstants.USER_SLACK_ID];
};


/**
 * @param clientState client state JSON string to save to back-end for current logged-in user
 * @return {promise}
 */
function saveClientState(clientState) {
    var clientStateJSON = clientState ? JSON.stringify(clientState) : '{}';
    var command = new Command()
        .setPath('/session/user/saveclientstate')
        .setPostMethod()
        .setPostParams({
            userid: getUserGuid(),
            clientstate: clientStateJSON
        });

    return command.execute();
}

/***
 * @return {bool}
 */
export let isSystemUser = function() {
    var sessionInfo = session.getInfo();
    return sessionInfo ? sessionInfo.isSystemUser : false;
};

/**
 * @return {string}
 */
export let getUserName = function () {
    var sessionInfo = session.getInfo();
    return sessionInfo ? sessionInfo.userName : '';
};

export let getUserCreateTime = function () {
    var sessionInfo = session.getInfo();
    return sessionInfo ? sessionInfo.userCreatedTime : 0;
};

/**
 * @return {string}
 */
export let getUserDisplayName = function (): string {
    var sessionInfo = session.getInfo();
    return sessionInfo ? sessionInfo.userDisplayName : '';
};

var privileges = {
    UNKNOWN: 1,
    ADMINISTRATION: 2,
    AUTHORING: 4,
    USERDATAUPLOADING: 8,
    DATADOWNLOADING: 16,
    USERMANAGEMENT: 32,
    SECURITYMANAGEMENT: 64,
    LOGICALMODELING: 128,
    DATAMANAGEMENT: 256,
    TAGMANAGEMENT: 512,
    SHAREWITHALL: 1024,
    SYSTEMMANAGEMENT: 2048,
    JOBSCHEDULING: 4096,
    A3ANALYSIS: 8192
};
/**
 *
 * @return {Array}
 */
export let getUserPrivileges = function () {
    var sessionInfo = session.getInfo();
    return sessionInfo ? sessionInfo[PRIVILEGES_KEY] || [] : [];
};

export let getUserPrivilegesBitMap = function () {
    return getUserPrivileges().reduce(function(bitMap, privilege){
        /* eslint no-bitwise: 1 */
        return bitMap | privileges[privilege];
    }, 0);
};

/**
 * @return {number}
 */
export let getUserGroupMask = function () {
    var sessionInfo = session.getInfo();
    return sessionInfo ? (sessionInfo.userGroupMask || 0) : 0;
};

export let getSageDataSource = function () {
    return getPreference(PREFERENCE_KEY_SAGE_DATA_SOURCE) || [];
};

export let setSageDataSource = function (dataScope) {
    setPreference(PREFERENCE_KEY_SAGE_DATA_SOURCE, dataScope);
};

export let getHomePinboardId = function () {
    return getPreference(PREFERENCE_KEY_HOME_PINBOARD_ID);
};

export let setHomePinboardId = function (pinboardId) {
    setPreference(PREFERENCE_KEY_HOME_PINBOARD_ID, pinboardId);
};

export let getPanelExpandedState = function () {
    return getPreference(blinkConstants.preferenceKeys.PANEL_STATE);
};

/**
 * @param {boolean} isExpanded
 */
export let setPanelStateInPreference = function (state: boolean) {
    setPreference(blinkConstants.preferenceKeys.PANEL_STATE, state);
};

export let setAnswerTabAlertPreference = function (state) {
    setPreference(blinkConstants.preferenceKeys.ANSWER_PAGE_ALERT, state);
};

export let getAnswerTabAlertPreference = function () {
    return getPreference(blinkConstants.preferenceKeys.ANSWER_PAGE_ALERT);
};

export let getClusterName = function (): string {
    return getConfigInfo('selfClusterName');
};

Provide('sessionService')({
    sessionGuids,
    getSessionInfo,
    isLoggedIn,
    authenticate,
    doLogin,
    doShortLivedLogin,
    doLogout,
    hasPrivilege,
    hasAdminPrivileges,
    hasUserDataUploadPrivileges,
    hasDataDownloadPrivileges,
    hasDataManagementPrivileges,
    hasJobSchedulingPrivileges,
    hasA3AnalysisPrivileges,
    canUserManageData,
    canShareWithAll,
    getClientState,
    setClientState,
    isSageUserFeedbackEnabled,
    isRoleEnabled,
    isWorksheetViewerEnabled,
    isWorksheetSampleValuesDisabled,
    isWorksheetOverAggregatedWorksheetEnabled,
    isAggregatedWorksheetTableJoinEnabled,
    isAnswerDisabled,
    isAnswerDisplayModePreferenceDisabled,
    getInstalledSchemaVersion,
    getCustomerAdminEmail,
    getCustomerAdminPhoneNumber,
    isStyleCustomizationEnabled,
    isFontStyleCustomizationEnabled,
    isFoolscapPdfDownloadEnabled,
    isMetadataMigrationEnabled,
    isSchedulingJobEnabled,
    isA3Enabled,
    isA3EnabledInConfig,
    getA3PinboardExpiryTime,
    getWhiteListedEmailDomainsForReport,
    getListSearchDebouncingInMS,
    isLightweightETLEnabled,
    getETLExpressionAssistantUrl,
    isDataConnectUsingTimely,
    areMapTilesEnabled,
    getGeoDataBatchSize,
    getTablePrintDataBatchSize,
    getTablePrintDataBatchSizeForSlack,
    isPrimaryNavEnabledForFullEmbed,
    isAlertBarHiddenForFullEmbed,
    isPoweredFooterHiddenForFullEmbed,
    isNPSEnabled,
    isTrialVersionEnabled,
    getDefaultCalendar,
    getAcceptLanguage,
    getCanChangePassword,
    getUserPreferences,
    removeUserPreferences,
    getExposedUserPreferences,
    getExposedUserPreference,
    setExposedUserPreference,
    shouldNotifyOnShare,
    setNotifyOnShare,
    setPreferredLocale,
    getPreferredLocale,
    shouldShowAppTourOnStartup,
    appTourShown,
    setPreference,
    getPreference,
    isSystemUser,
    getUserName,
    getUserCreateTime,
    getUserDisplayName,
    getUserGuid,
    getUserPrivileges,
    getUserPrivilegesBitMap,
    getUserGroupMask,
    getSageDataSource,
    setSageDataSource,
    getHomePinboardId,
    setHomePinboardId,
    getPanelExpandedState,
    setPanelStateInPreference,
    setAnswerTabAlertPreference,
    getAnswerTabAlertPreference,
    getClusterName,
    isSearchHelpRestricted,
    setUserPreferenceProto,
    getUserPreferenceProto
});
