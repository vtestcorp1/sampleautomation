/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Supriya Kharade (supriya.kharade@thoughtspot.com)
 *
 * @fileoverview Localizable strings
 */

import _ from 'lodash';
import {ngRequire, Provide} from 'src/base/decorators';
import {translations} from 'translations';
import {isStringLocalizationEnabled} from '../modules/callosum/service/system-config-service';
import {blinkConstants} from './blink-constants';

let $rootScope = ngRequire('$rootScope');
let safeApply = ngRequire('safeApply');
declare var System: any;
declare var blink: any;

export const strings = translations;
export const supportedLocales = _.uniq(_.values(blink.supportedLocales));
let currentLocale: string = blink.getAppLocale();

export function getCurrentLocale() {
    return currentLocale;
}

export function changeLocale(locale: string): Promise<void> {
    locale = blink.supportedLocales[locale];
    if(!isStringLocalizationEnabled()) {
        locale = 'en-US';
    }

    if(!locale || locale === currentLocale) {
        return Promise.resolve();
    }

    System.registry.delete(System.resolveSync('translations'));
    System.config({
        map:{
            'translations':`${blink.translationsPath}strings-${locale}${blink.localeSuffix}.js`
        }
    });

    return System.import('translations').then(function(newTranslations) {
        _.merge(strings, newTranslations.translations);
        _.merge(blinkConstants, strings);
        currentLocale = locale;
        // Trigger digest loop to apply changes.
        return safeApply($rootScope);
    });
}

Provide('strings')(strings);
