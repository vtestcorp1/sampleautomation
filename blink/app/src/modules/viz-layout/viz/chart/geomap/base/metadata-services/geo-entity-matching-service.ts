/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 */

import {Provide} from '../../../../../../../base/decorators';
import {jsonConstants} from '../../../../../answer/json-constants';
import {DEFAULT_GEO_DATA_NORMALIZER} from '../geo-constants';
import GeoCountryConfig from '../geo-country-config';
import {GeoUtils} from '../geo-utils';
import GeoPropField from './geo-prop-field';
import GeoTopologyDataStore from './geo-topology-data-store';
import {GeometryType} from './geo-topology-data-store';
import {USA_STATES} from './usa-states';

type StringToStringArray = {[key: string]: string[]};
type StringToFeature = {[key: string]: ol.Feature};

@Provide('GeoEntityMatchingService')
export default class GeoEntityMatchingService {

    private static propValueToGeoIDIndex: {
        [cacheKey: string]: StringToStringArray
    } = {};
    private static geoIDToFeatureIndex: {
        [geomType: string]: {[cacheKey: string]: StringToFeature}
    } = {
        POLYGON: {},
        POINT: {}
    };

    public static findMatchingFeatures(
        values: string[],
        geometryType: GeometryType,
        level: string,
        country: string|undefined,
        customFileGuid: string|undefined
    ): Promise<ol.Feature[][]> {
        GeoTopologyDataStore.assertValidParams(geometryType, level, country, customFileGuid);
        let cacheKey = GeoEntityMatchingService.getCacheKey(level, country, customFileGuid);

        if (!!GeoEntityMatchingService.geoIDToFeatureIndex[geometryType][cacheKey]) {
            let matchedFeatures = GeoEntityMatchingService.matchFeaturesFromCache(
                values,
                geometryType,
                level,
                country,
                customFileGuid
            );
            return Promise.resolve(matchedFeatures);
        }

        return GeoTopologyDataStore.getFeatures(geometryType, level, country, customFileGuid).then(
            (features) => {
                if (!GeoEntityMatchingService.propValueToGeoIDIndex[cacheKey]) {
                    GeoEntityMatchingService.propValueToGeoIDIndex[cacheKey] =
                        GeoEntityMatchingService.buildPropValueToGeoIDIndex(
                            features, level, country
                        );
                }
                GeoEntityMatchingService.geoIDToFeatureIndex[geometryType][cacheKey] =
                    GeoEntityMatchingService.buildGeoIDToFeatureIndex(features);
                return GeoEntityMatchingService.matchFeaturesFromCache(
                    values,
                    geometryType,
                    level,
                    country,
                    customFileGuid
                );
            });
    }

    public static matchFeaturesFromCache(
        values: string[],
        geometryType: GeometryType,
        level: string,
        country: string|undefined,
        customFileGuid: string|undefined
    ): Array<Array<ol.Feature>> {
        // matcher function will match a given token to a set (mostly 1) of geoIDs.
        // Like it will match California to ['CA'].
        let matcher: (value: string) => string[];
        let cacheKey = GeoEntityMatchingService.getCacheKey(level, country, customFileGuid);
        if (level === jsonConstants.geoConfigType.ADMIN_DIV_2 && country === 'US') {
            // Before 4.0 release we supported US County maps and since county names are not unique
            // so we supported a format that you can append state name separated by comma and it
            // will be mapped to the right state.
            // So for US counties we support this special format. Going forward we will allow
            // admin div 1 to come from a column to resolve the ambiguity.
            matcher = (value) => GeoEntityMatchingService.findMatchingUSCounties(
                value,
                GeoEntityMatchingService.propValueToGeoIDIndex[cacheKey],
            );
        } else {
            matcher = (value) => {
                let normalizer = DEFAULT_GEO_DATA_NORMALIZER;
                if (!!country) {
                    normalizer = GeoCountryConfig.get(country).getNormalizer(level);
                }
                return GeoEntityMatchingService.propValueToGeoIDIndex[cacheKey][normalizer(value)]
                    || [];
            };
        }
        let matchedGeoIDsArray: string[][] = values.map(matcher);
        // Now that we have matched geoIDs for each geoColumnValue we can map each geoID to feature.
        return matchedGeoIDsArray.map((geoIDs) => {
            return geoIDs.map((geoID) => {
                return GeoEntityMatchingService.geoIDToFeatureIndex[geometryType][cacheKey][geoID];
            });
        });
    }

    private static getCacheKey(
        level: string,
        country: string|undefined,
        customFileGuid: string|undefined
    ): string {
        switch (level) {
            case jsonConstants.geoConfigType.ADMIN_DIV_0:
                return level;
            case jsonConstants.geoConfigType.CUSTOM_REGION:
                return level + '-' + customFileGuid;
            default:
                if (!country) {
                    throw new Error(
                        'country iso code must be present for ' + level
                    );
                }
                return level + '-' + country;
        }
    }

    // geoColumnValues may be comprised of multiple tokens (like county, state) concatenated by
    // comma to avoid the redundancy in names. Like for example pike county is in many states,
    // so we might have tokens like "pike county, ohio" and "pike county, georgia".
    // In these cases we first find the matching features based of the first token value, i.e.
    // "pike county" and then if there are multiple matches, we use the second token to resolve
    // the ambiguity i.e. "ohio" and "georgia".
    private static findMatchingUSCounties(
        geoColumnValue: string,
        index: StringToStringArray
    ): string[] {
        let geoColumnValueParts = geoColumnValue.split(',').map(function(s) {
            return s.trim();
        }).filter(function(s) {
            return s !== '';
        });

        let firstPart = GeoCountryConfig.get('US').getDiv2Normalizer()(
            geoColumnValueParts[0] || ''
        ), secondPart = GeoCountryConfig.get('US').getDiv1Normalizer()(
            geoColumnValueParts[1] || ''
        );
        if (!firstPart || !index[firstPart]) {
            return [];
        }
        let countyIDs = index[firstPart];
        if (countyIDs.length === 1) {
            return countyIDs;
        }
        if (!secondPart) {
            // We don't have second token part to resolve ambiguity.
            return countyIDs;
        }
        let matchedCountyID = countyIDs.find((countyID) => {
            var stateFIPS = countyID.slice(0, 2);
            return secondPart === stateFIPS ||
                USA_STATES[stateFIPS].indexOf(secondPart) !== -1;
        });
        return (matchedCountyID && [matchedCountyID]) || [];
    }

    private static buildPropValueToGeoIDIndex(
        features: ol.Feature[],
        level: string,
        country: string|undefined
    ): {[key: string]: Array<string>} {
        let index = {};
        let fields = GeoUtils.getPropKeysForMatching(level, country);
        features.forEach((feature) => {
            let props = feature.getProperties(),
                propValuesSet = {};
            fields.forEach((propField) => {
                var propValue = props[propField.toString()];
                if (!propValue) {
                    return;
                }
                propValue = (propValue + '').toLowerCase();
                if (!!propValuesSet[propValue]) {
                    // If subsequent paths produces the same propValue, we can ignore
                    // them.
                    return;
                }
                if (!index[propValue]) {
                    index[propValue] = [];
                }
                // We use array here because same prop value might be present in multiple geo
                // entities, for example, US county names are not unique.
                index[propValue].push(props[GeoPropField.GEOID.toString()]);
                propValuesSet[propValue] = 1;
            });
        });
        return index;
    }

    private static buildGeoIDToFeatureIndex(features: ol.Feature[]) {
        let ret = {};
        features.forEach((feature) => {
            let featureUniqueId = feature.getProperties()[GeoPropField.GEOID.toString()];
           ret[featureUniqueId] = feature;
        });
        return ret;
    }
}
