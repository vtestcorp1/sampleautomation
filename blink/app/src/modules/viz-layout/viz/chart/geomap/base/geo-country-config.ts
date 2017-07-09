/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Class to represent country-specific configurations for a geo map chart.
 */

import {ngRequire, Provide} from '../../../../../../base/decorators';
import {Countries, Country} from '../../../../../../base/geo/countries';
import {jsonConstants} from '../../../../answer/json-constants';
import {
    GeoCountryConfigMap, GeoValueNormalizer, IGeoCountryConfig
} from './geo-country-config-data';
import {GeoDefaultCountryConfig} from './geo-country-default-config';
let geoConfigTypes = jsonConstants.geoConfigType;

let Logger = ngRequire('Logger');

@Provide('GeoCountryConfig')
export default class GeoCountryConfig {

    public static readonly supportedCountries: Country[] =
        Object.keys(GeoCountryConfigMap).map((isoCode) => {
            return Countries[isoCode];
        });
    private static readonly configByCountry: {[isoCode: string]: GeoCountryConfig} = {};
    private logger: any = Logger.create('GeoCountryConfig');
    private config: IGeoCountryConfig;

    public static get(countryCode: string): GeoCountryConfig {
        if (!GeoCountryConfig.configByCountry[countryCode]) {
            GeoCountryConfig.configByCountry[countryCode] = new GeoCountryConfig(countryCode);
        }
        return GeoCountryConfig.configByCountry[countryCode];
    }

    public getCountryCode(): string {
        return this.countryCode;
    }

    public isZipSupported(): boolean {
        return this.config.SUPPORT.ZIP || GeoDefaultCountryConfig.SUPPORT.ZIP;
    }

    public isDiv1Supported(): boolean {
        return this.config.SUPPORT.DIV_1 || GeoDefaultCountryConfig.SUPPORT.DIV_1;
    }

    public isDiv2Supported(): boolean {
        return this.config.SUPPORT.DIV_2 || GeoDefaultCountryConfig.SUPPORT.DIV_2;
    }

    public isLevelSupported(geoConfigType: string): boolean {
        switch (geoConfigType) {
            case geoConfigTypes.ADMIN_DIV_1:
                return this.isDiv1Supported();
            case geoConfigTypes.ADMIN_DIV_2:
                return this.isDiv2Supported();
            case geoConfigTypes.ZIP_CODE:
                return this.isZipSupported();
            default:
                this.logger.error('Invalid level passed', geoConfigType);
                return false;
        }
    }

    public getZipNormalizer(): GeoValueNormalizer {
        return (this.config.NORMALIZER && this.config.NORMALIZER.ZIP)
            || GeoDefaultCountryConfig.NORMALIZER.ZIP;
    }

    public getDiv1Normalizer(): GeoValueNormalizer {
        return (this.config.NORMALIZER && this.config.NORMALIZER.DIV_1)
            || GeoDefaultCountryConfig.NORMALIZER.DIV_1;
    }

    public getDiv2Normalizer(): GeoValueNormalizer {
        return (this.config.NORMALIZER && this.config.NORMALIZER.DIV_2)
            || GeoDefaultCountryConfig.NORMALIZER.DIV_2;
    }

    public getNormalizer(geoConfigType: string): GeoValueNormalizer {
        switch (geoConfigType) {
            case geoConfigTypes.ADMIN_DIV_1:
                return this.getDiv1Normalizer();
            case geoConfigTypes.ADMIN_DIV_2:
                return this.getDiv2Normalizer();
            case geoConfigTypes.ZIP_CODE:
                return this.getZipNormalizer();
            default:
                this.logger.error('Invalid level passed', geoConfigType);
        }
    }

    public getZipLabel(): string {
        return (this.config.LABEL && this.config.LABEL.ZIP)
            || GeoDefaultCountryConfig.LABEL.ZIP;
    }

    public getDiv1Label(): string {
        return (this.config.LABEL && this.config.LABEL.DIV_1)
            || GeoDefaultCountryConfig.LABEL.DIV_1;
    }

    public getDiv2Label(): string {
        return (this.config.LABEL && this.config.LABEL.DIV_2)
            || GeoDefaultCountryConfig.LABEL.DIV_2;
    }

    public getLabel(geoConfigType: string): string {
        switch (geoConfigType) {
            case geoConfigTypes.ADMIN_DIV_1:
                return this.getDiv1Label();
            case geoConfigTypes.ADMIN_DIV_2:
                return this.getDiv2Label();
            case geoConfigTypes.ZIP_CODE:
                return this.getZipLabel();
            default:
                this.logger.error('Invalid level passed', geoConfigType);
        }
    }

    public getExtraFieldsToMatch(geoConfigType: string): string[] {
        switch (geoConfigType) {
            case geoConfigTypes.ADMIN_DIV_1:
                return (this.config.EXTRA_FIELDS && this.config.EXTRA_FIELDS.DIV_1)
                    || GeoDefaultCountryConfig.EXTRA_FIELDS.DIV_1;
            case geoConfigTypes.ADMIN_DIV_2:
                return (this.config.EXTRA_FIELDS && this.config.EXTRA_FIELDS.DIV_2)
                    || GeoDefaultCountryConfig.EXTRA_FIELDS.DIV_2;
            default:
                throw new Error('Invalid geoConfigType passed: ' + geoConfigType);
        }

    }

    private constructor(private countryCode: string) {
        if (!GeoCountryConfigMap[countryCode]) {
            this.logger.info('No specific configuration exists for ', countryCode);
            this.config = {SUPPORT: {}};
        } else {
            this.config = GeoCountryConfigMap[countryCode];
        }
    }
}
