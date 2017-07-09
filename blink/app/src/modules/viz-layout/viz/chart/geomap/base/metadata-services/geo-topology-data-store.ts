/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview This file serves as a one stop shop for fetching and caching of topology
 * data for polygons and centroids for given country and given admin level. It ensures that
 * nothing is fetched or parsed twice.
 *
 * This class offers following 2 convenient functions for retrieving data.
 * 1. Async: GeoTopologyDataStore.getFeatures()
 * 2. Sync: GeoTopologyDataStore.getFeaturesFromCache()
 */

import {ngRequire, Provide} from 'src/base/decorators';
import {jsonConstants} from '../../../../../answer/json-constants';
import {DATA_PROJECTION, VIEW_PROJECTION} from '../geo-constants';
import {GeoUtils} from '../geo-utils';
import GeoPropField from './geo-prop-field';
import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

let $http = ngRequire('$http');

export type GeometryType = 'POLYGON' | 'POINT';

@Provide('GeoTopologyDataStore')
export default class GeoTopologyDataStore {

    private static readonly validLevels = [
        jsonConstants.geoConfigType.ADMIN_DIV_0,
        jsonConstants.geoConfigType.ADMIN_DIV_1,
        jsonConstants.geoConfigType.ADMIN_DIV_2,
        jsonConstants.geoConfigType.ZIP_CODE,
        jsonConstants.geoConfigType.CUSTOM_REGION
    ];
    private static levelsWithParentCountry = [
        jsonConstants.geoConfigType.ADMIN_DIV_1,
        jsonConstants.geoConfigType.ADMIN_DIV_2,
        jsonConstants.geoConfigType.ZIP_CODE
    ];
    private static readonly DATA_FORMAT = new ol.format.TopoJSON();

    private static pendingPromises: {[geomType: string]: {[key: string]: Promise<ol.Feature[]>}} = {
        POLYGON: {},
        POINT: {}
    };
    private static featuresCache: {
        [geomType: string]: {[key: string]: ol.Feature[]}
    } = {
        POLYGON: {},
        POINT: {}
    };

    /**
     * Async function to fetch geo features for a given configuration, takes care of caching so that
     * no file is fetched of parsed twice.
     * @param geometryType geometry flavor, either 'POLYGON' or 'POINT'.
     * @param level  Admin level.
     * @param country Country to fetch data for, no need to specify if level is admin level 0.
     * @param customFileGuid
     * @returns {IPromise<ol.Feature[]>}
     */
    public static getFeatures(
        geometryType: GeometryType,
        level: string,
        country: string|undefined,
        customFileGuid: string|undefined
    ): Promise<ol.Feature[]> {
        GeoTopologyDataStore.assertValidParams(geometryType, level, country, customFileGuid);
        let cacheKey =
            GeoTopologyDataStore.getDataJsonKey(level, geometryType, country, customFileGuid);

        if (GeoTopologyDataStore.featuresCache[geometryType][cacheKey]) {
            return Promise.resolve(GeoTopologyDataStore.featuresCache[geometryType][cacheKey]);
        }

        // If polygons features are already present for the same configuration, we can get the
        // point features by getting the interior point of each feature.
        let polygonCacheKey =
            GeoTopologyDataStore.getDataJsonKey(level, 'POLYGON', country, customFileGuid);
        if (geometryType === 'POINT' &&
            !!GeoTopologyDataStore.featuresCache['POLYGON'][polygonCacheKey]) {
            let polygonFeatures = GeoTopologyDataStore.featuresCache['POLYGON'][polygonCacheKey];
            let pointsFeatures = polygonFeatures.map((feature) => {
                let props: any = $.extend({}, feature.getProperties());
                props.geometry = GeoUtils.getInteriorPoint(feature);
                let pointFeature = new ol.Feature(props);
                pointFeature.setId(props.GEOID);
                return pointFeature;
            });
            GeoTopologyDataStore.featuresCache[geometryType][cacheKey] = pointsFeatures;
            return Promise.resolve(pointsFeatures);
        }

        let pendingCallExists =
            Object.has(GeoTopologyDataStore.pendingPromises[geometryType], cacheKey);
        if (pendingCallExists) {
            return GeoTopologyDataStore.pendingPromises[geometryType][cacheKey];
        }

        return new Promise<ol.Feature[]>((resolve, reject) => {
            let url = GeoTopologyDataStore.getDataJsonURL(
                level, geometryType, country, customFileGuid
            );
            $http.get(url).then(
                (response) => GeoTopologyDataStore.httpSuccessCallback(
                    response, geometryType, cacheKey, level, resolve
                ),
                (response) => GeoTopologyDataStore.httpErrorCallback(
                    response, reject
                )
            );
        });
    }

    /**
     * Same as getFeatures() except that it only checks the cache. Won't make a network call, hence
     * synchronous.
     * @param geometryType
     * @param level
     * @param isoCode
     * @param customFileGuid
     * @returns {ol.Feature[]}
     */
    public static getFeaturesFromCache(
        geometryType: GeometryType,
        level: string,
        isoCode: string|undefined,
        customFileGuid: string|undefined
    ): ol.Feature[] {
        GeoTopologyDataStore.assertValidParams(geometryType, level, isoCode, customFileGuid);
        let cacheKey =
            GeoTopologyDataStore.getDataJsonKey(level, geometryType, isoCode, customFileGuid);
        if (!GeoTopologyDataStore.featuresCache[geometryType][cacheKey]) {
            throw new Error(
                'Features not found in cache for: ' + geometryType + ', ' + level + ', ' + isoCode
            );
        }
        return GeoTopologyDataStore.featuresCache[geometryType][cacheKey];
    }

    public static assertValidParams(
        geometryType: GeometryType,
        level: string,
        country: string|undefined,
        customFileGuid: string|undefined
    ): void {
        if (GeoTopologyDataStore.validLevels.indexOf(level) === -1) {
            throw new Error('Invalid level passed');
        }
        if (level === jsonConstants.geoConfigType.ZIP_CODE && geometryType !== 'POINT') {
            throw new Error('Only point geometry is supported for zip codes');
        }
        if (GeoTopologyDataStore.levelsWithParentCountry.indexOf(level) !== -1 && !country) {
            throw new Error('country code must be passed for ' + level);
        }
        if (level === jsonConstants.geoConfigType.CUSTOM_REGION && !customFileGuid) {
            throw new Error('region def key must be passed for custom region');
        }
    }

    private static httpSuccessCallback(
        response: IHttpPromiseCallbackArg<any>,
        geometryType: GeometryType,
        cacheKey: string,
        level: string,
        promiseResolver: any
    ) {
        let features: ol.Feature[];
        if (level === jsonConstants.geoConfigType.CUSTOM_REGION) {
            features =
                GeoTopologyDataStore.buildFeaturesForCustomRegion(geometryType, response.data);
        } else if (level === jsonConstants.geoConfigType.ZIP_CODE) {
            features = GeoTopologyDataStore.buildPointFeaturesForZipCode(response.data);
        } else {
            // Note: config object that defines 'featureProjection' is undocumented
            // (and missing in typings too) that's why we have to make it untyped first
            // before calling.
            features = (GeoTopologyDataStore.DATA_FORMAT.readFeatures as any)(
                response.data,
                {featureProjection: VIEW_PROJECTION}
            );
        }
        features.forEach((feature) => {
            let id = feature.getProperties()[GeoPropField.GEOID.toString()];
            feature.setId(id);
        });
        GeoTopologyDataStore.featuresCache[geometryType][cacheKey] = features;
        promiseResolver(features);
    }

    private static httpErrorCallback(response: IHttpPromiseCallbackArg<any>, promiseRejector: any) {
        promiseRejector(response.status);
    }

    private static getDataJsonKey(
        level: string,
        geometryType: GeometryType,
        isoCode: string|null,
        customFileGuid: string|undefined
    ) {
        switch (level) {
            case jsonConstants.geoConfigType.ADMIN_DIV_0:
                return `${level}-${geometryType}.topo.json`;
            case jsonConstants.geoConfigType.ZIP_CODE:
                return `${level}-${isoCode}.json`;
            case jsonConstants.geoConfigType.CUSTOM_REGION:
                return customFileGuid;
            default:
                return `${level}-${isoCode}-${geometryType}.topo.json`;
        }
    }

    private static getDataJsonURL(
        level: string,
        geometryType: GeometryType,
        isoCode: string|undefined,
        customFileGuid: string|undefined
    ): string {
        let fileName =
            GeoTopologyDataStore.getDataJsonKey(level, geometryType, isoCode, customFileGuid);
        if (level === jsonConstants.geoConfigType.CUSTOM_REGION) {
            return `/callosum/v1/file/getfile/${fileName}`;
        }
        return `/resources/geo/topojson/${fileName}`;
    }

    private static buildPointFeaturesForZipCode(
        zipCodeDataArray: [string, number, number][]
    ): ol.Feature[] {
        // Array of zip-code, lat, long
        return zipCodeDataArray.map((zipCodeData) => {
            let zipCode = zipCodeData[0], lat = zipCodeData[1], long = zipCodeData[2];
            // See note in GeoMapComponent class about projections.
            let coords = ol.proj.transform([long, lat], DATA_PROJECTION, VIEW_PROJECTION);
            let props: any = {
                GEOID: zipCode,
                geometry: new ol.geom.Point(coords)
            };
            return new ol.Feature(props);
        });
    }

    private static buildFeaturesForCustomRegion(geometryType: GeometryType, customData: any) {
        var regionIDToCoords = {};
        customData.trim().split('\n').slice(1).forEach((line) => {
           let vals = line.trim().split(',').map(function (str) {
               return str.trim();
           });
            let regionID = vals[0];
            vals = vals.slice(1).map((val) => +val);
            regionIDToCoords[regionID] = regionIDToCoords[regionID] || [];
            regionIDToCoords[regionID].push(vals);
        });
        let features = [];
        for (let regionID in regionIDToCoords) {
            let coords = regionIDToCoords[regionID];
            // If order ID is also present in the file, then sort the points in the given order.
            if (coords.every((vals) => {
                return vals.length === 3;
            })) {
                coords.sort(function (vals1, vals2) {
                    return vals1[2] < vals2[2];
                });
            }
            coords = coords.map((coord) => {
                let lat = coord[0], long = coord[1];
                return ol.proj.transform([long, lat], DATA_PROJECTION, VIEW_PROJECTION);
            });
            let feature = new ol.Feature({
                GEOID: regionID,
                geometry: new ol.geom.Polygon([coords])
            });
            if (geometryType === 'POINT') {
                feature.setGeometry(GeoUtils.getInteriorPoint(feature));
            }
            features.push(feature);
        }
        return features;
    }
}
