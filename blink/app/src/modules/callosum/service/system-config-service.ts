/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Sandeep Kumar(sandeep@thoughtspot.com)
 **/
'use strict';

import IPromise = angular.IPromise;
import _ from 'lodash';
import {ngRequire, Provide} from '../../../base/decorators';
import {jsonConstants} from '../../viz-layout/answer/json-constants';

let Command = ngRequire('Command');
let systemConfig: any;

declare var flags: any;

let SAML_ENABLED_KEY = 'samlEnabled';
let SLACK_CONFIGURATION_KEY = 'slackConfiguration';

export function fetchSystemConfig() : IPromise<any> {
    let command = new Command().setPath('/system/config');
    return command.execute().then(
        (response) => {
            systemConfig = response.data;
            return systemConfig;
        }
    );
}

export function isSamlEnabled() {
    return _.get(systemConfig, SAML_ENABLED_KEY, false);
}

export function getSlackConfig() {
    return _.get(systemConfig, SLACK_CONFIGURATION_KEY, null);
}

export function autoRedirectToSamlLogin() : boolean {
    return _.get(systemConfig, jsonConstants.samlConfig.SAML_LOGIN_PAGE_REDIRECT, false);
}

export let isStringLocalizationEnabled = function() : boolean {
    return !!flags.getValue('locale')
        || _.get(systemConfig, jsonConstants.ENABLE_LOCALIZATION, false);
};

Provide('systemConfigService')({
    fetchSystemConfig,
    isSamlEnabled,
    getSlackConfig,
    autoRedirectToSamlLogin
});
