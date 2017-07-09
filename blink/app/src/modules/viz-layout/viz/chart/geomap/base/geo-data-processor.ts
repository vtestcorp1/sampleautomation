/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Class for geo viz data processing
 */

import {ngRequire, Provide} from '../../../../../../base/decorators';
import {jsonConstants} from '../../../../answer/json-constants';
import {ChartModel} from '../../chart-model';
import {GeoUtils} from './geo-utils';
import Color = Chroma.Color;
import GeoConfig from '../../../../../document-model/table-model/geo-config';
import {GEO_AREA_OPACITY} from './geo-constants';
import {GeoFilterObject} from './geo-filter-objects';
import GeoEntityMatchingService from './metadata-services/geo-entity-matching-service';
import GeoPropField from './metadata-services/geo-prop-field';

let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let geoUtil = ngRequire('geoUtil');
let $q = ngRequire('$q');
let Logger = ngRequire('Logger');
let GeoBounds = ngRequire('GeoBounds');
let util = ngRequire('util');

let logger;

type GeoFormattedValue = {name: string, value: string};

type GeoDataPoint = any;

interface GeoSeries {
    /**
     * ID of the series.
     */
    blinkSeriesId: string;
    /**
     * Data points of this series.
     */
    data: GeoDataPoint[];
    /**
     * Whether bounds of the data points makes a valid non-zero and non-infinity range.
     */
    isRangeValid?: boolean;
    /**
     * data point corresponding to the max measure value, the one that will show the darkest value.
     */
    maxDataPoint?: GeoDataPoint;
    /**
     * data point corresponding to the min measure value, the one that will show the lightest value.
     */
    minDataPoint?: GeoDataPoint;
    /**
     * whether the serie is currently being shown in the map.
     * If the key doesn't exists, that means it is visible.
     */
    visible?: boolean;
    /**
     * Used for geo area map
     */
    scale?: string[];
    /**
     * Used for geo bubble map
     */
    color?: string;

}

export type GeoLabelFormatter =
    (xValue: any, serieIndex: number) => GeoFormattedValue;

export interface GeoMapData {
    /**
     * Geo configurations specified in modeling of the geo column.
     */
    geoConfig: GeoConfig;
    /**
     * Array of data point series to show in the map.
     */
    series: GeoSeries[];
    /**
     * List of geo objects to show on the top of the map. Like for showing circles when nearby
     * filter is applied.
     */
    geoObjects?: any[];
    /**
     * functions to format geo column attribute values.
     */
    labelFormatters: {
        [key in 'x' | 'y' | 'z']: GeoLabelFormatter;
    };
}

@Provide('GeoDataProcessor')
export class GeoDataProcessor {

    private static geoConfigTypeToBoundsExpansionAmount: any;
    private static COMPUTABLE_BOUNDS_GEO_CONFIG_TYPES = [
        jsonConstants.geoConfigType.POINT,
        jsonConstants.geoConfigType.ZIP_CODE,
        jsonConstants.geoConfigType.ADMIN_DIV_2
    ];

    private seriesXValueToFeatureId;
    private seriesYValueToFeatureId;
    private featureIdToDataPoints: {[featureId: string]: GeoDataPoint[]};
    private featureIdToGeoObjects: {[featureId: string]: GeoFilterObject[]};
    private uniqueFeatureIdToDataPoints: {[featureId: string]: GeoDataPoint[]};
    private allFeatureIdsOfSeries: string[];
    private allFeatureIdsOfGeoObjects: string[];
    private data?: GeoMapData;
    private geoBounds?: any;

    private static getFeatureIdForDataValue(
        seriesIndexToDimensionValueToFeatureId,
        dataValue,
        seriesIndex,
        dataValueFormatter: GeoLabelFormatter
    ): string {
        if (!Object.has(seriesIndexToDimensionValueToFeatureId, seriesIndex)) {
            seriesIndexToDimensionValueToFeatureId[seriesIndex] = {};
        }

        let dimensionValueToFeatureId = seriesIndexToDimensionValueToFeatureId[seriesIndex];
        if (!Object.has(dimensionValueToFeatureId, dataValue)) {
            let featureId = dataValueFormatter(dataValue, seriesIndex).value;
            featureId = (featureId + '').toLowerCase();
            dimensionValueToFeatureId[dataValue] = featureId;
        }

        return dimensionValueToFeatureId[dataValue];
    }

    private static getGeoConfigTypeToBoundsExpansionAmount() {
        if (GeoDataProcessor.geoConfigTypeToBoundsExpansionAmount === void 0) {
            GeoDataProcessor.geoConfigTypeToBoundsExpansionAmount = util.mapArrayToHash([
                [jsonConstants.geoConfigType.POINT, 1],
                [jsonConstants.geoConfigType.ZIP_CODE, 2],
                [jsonConstants.geoConfigType.ADMIN_DIV_2, 4],
                [jsonConstants.geoConfigType.ADMIN_DIV_1, 6]
            ], function (geoConfigTypeAndExpansionAmount) {
                return geoConfigTypeAndExpansionAmount[0];
            }, function (geoConfigTypeAndExpansionAmount) {
                return geoConfigTypeAndExpansionAmount[1];
            });
        }
        return GeoDataProcessor.geoConfigTypeToBoundsExpansionAmount;
    }


    constructor(private chartModel: ChartModel) {
        this.reset();
    }

    public setData(data: GeoMapData): void {
        this.data = data;
        this.processData();
    }

    public hasData(): boolean {
        return !!this.data;
    }

    public getGeoConfig(): GeoConfig {
        return this.data.geoConfig;
    }

    public isGeoConfigOfType(geoConfigType: string): boolean {
        return this.getGeoConfig().getType() === geoConfigType;
    }

    public getBounds() {
        if (this.geoBounds !== void 0) {
            return $q.when(this.geoBounds);
        }

        if (this.data.geoConfig.getType() === jsonConstants.geoConfigType.ADMIN_DIV_1) {
            this.geoBounds = GeoBounds.prototype.fromBounds.apply(
                null,
                geoUtil.Constants.GeoBounds.CONTINENTAL_US
            );
        } else if (GeoDataProcessor.COMPUTABLE_BOUNDS_GEO_CONFIG_TYPES.none(
                this.data.geoConfig.getType())) {
            this.geoBounds =
                GeoBounds.prototype.fromBounds.apply(null, geoUtil.Constants.GeoBounds.WORLD);
        }

        if (!!this.geoBounds) {
            return $q.when(this.geoBounds);
        }

        let geoConfig = this.data.geoConfig;
        let centroidsPromise: Promise<ol.Feature[]> = GeoEntityMatchingService.findMatchingFeatures(
            this.allFeatureIdsOfSeries,
            'POINT',
            geoConfig.getType(),
            geoConfig.getParent() && geoConfig.getParent().getFixedValue(),
            geoConfig.getCustomFileGuid()
        ).then((featuresList: ol.Feature[][]) => {
            return featuresList.map((features: ol.Feature[]) => {
                if (features.length === 1) {
                    return features[0];
                }
                return null;
            });
        });
        let allowCrossingDataLine = geoUtil.isProjectionGlobe(this.chartModel.getChartType());
        return centroidsPromise.then((pointFeatures) => {
            this.geoBounds = new GeoBounds();
            pointFeatures.forEach((pointFeature: ol.Feature) => {
                let centroid = (pointFeature.getGeometry() as ol.geom.Point).getCoordinates();
                if (!centroid) {
                    return;
                }

                this.geoBounds.extendToIncludePoint(
                    centroid[1],
                    centroid[0],
                    allowCrossingDataLine
                );
            });
            // For non-point geo types we only know the centroid and not the bounds of the entire
            // area. As a workaround for this we manually expand the bounds by a fixed amount based
            // on the geo type to make sure that we'll always cover the entire area for all the
            // points.
            let geoConfigTypeToBoundsExpansionAmount =
                GeoDataProcessor.getGeoConfigTypeToBoundsExpansionAmount();
            if (Object.has(geoConfigTypeToBoundsExpansionAmount, geoConfig.getType())) {
                let expansionAmount = geoConfigTypeToBoundsExpansionAmount[geoConfig.getType()];
                this.geoBounds.expand(expansionAmount, expansionAmount, allowCrossingDataLine);
            }

            return this.geoBounds;
        }, (error) => {
            logger = logger || Logger.create('geo-data-processor');
            logger.error('error in loading centroids for bounds computation');
            return error;
        });
    }

    public getFormattedXValue(dataPoint: GeoDataPoint): GeoFormattedValue {
        return this.data.labelFormatters.x(dataPoint.x, dataPoint.seriesIndex);
    }

    public getFormattedYValue(dataPoint: GeoDataPoint): GeoFormattedValue {
        return this.data.labelFormatters.y(dataPoint.y, dataPoint.seriesIndex);
    }

    public getFormattedZValue(dataPoint: GeoDataPoint): GeoFormattedValue {
        return this.data.labelFormatters.z(dataPoint.z, dataPoint.seriesIndex);
    }

    public getSeriesForDataPoint(dataPoint: GeoDataPoint): GeoSeries {
        return this.data.series[dataPoint.seriesIndex];
    }

    public getDataPointsForFeature(featureProps): GeoDataPoint[] {
        let uniqueId = featureProps[GeoPropField.GEOID.toString()];
        return this.uniqueFeatureIdToDataPoints[uniqueId] || [];
    }

    public getGeoObjectsForFeature(featureId: string): GeoFilterObject[]  {
        return this.featureIdToGeoObjects[featureId] || [];
    }

    public getAllFeatureIdsOfSeries(): string[] {
        return this.allFeatureIdsOfSeries;
    }

    public getAllFeatureIdsOfGeoObjects(): string[] {
        return this.allFeatureIdsOfGeoObjects;
    }

    public getAllSeries(): GeoSeries[] {
        return this.data && this.data.series;
    }

    public addSeries(series: GeoSeries) {
        this.data.series.push(series);
    }

    public updateSeries(series: GeoSeries, changes) {
        Object.merge(series, changes);
        this.processData();
    }

    public setSeriesVisibility(serie: GeoSeries, visible: boolean) {
        serie.visible = !!visible;
        this.processData();
    }

    public buildUniqueFeatureIdToDataPointsMap(matchedFeatures: Array<ol.Feature|null>) {
        this.uniqueFeatureIdToDataPoints = {};
        matchedFeatures.forEach((feature, index) => {
            if (feature === null) {
                return;
            }
            let uniqueFeatureId = feature.getProperties()[GeoPropField.GEOID.toString()];
            this.uniqueFeatureIdToDataPoints[uniqueFeatureId] =
                this.featureIdToDataPoints[this.allFeatureIdsOfSeries[index]];
        });
        return this.uniqueFeatureIdToDataPoints;
    }

    private reset() {
        this.seriesXValueToFeatureId = {};
        this.seriesYValueToFeatureId = {};
        this.featureIdToDataPoints = {};
        this.featureIdToGeoObjects = {};
        this.uniqueFeatureIdToDataPoints = null;
        this.allFeatureIdsOfSeries = [];
        this.allFeatureIdsOfGeoObjects = [];
    }

    private processData() {
        this.reset();
        let series = this.data.series,
            geoObjects = this.data.geoObjects,
            isYGeo = this.chartModel.getChartType()
                === chartTypeSpecificationService.chartTypes.GEO_EARTH_GRAPH,
            measurePropKey = isYGeo ? 'z' : 'y',
            featureIdSetOfSeries = {},
            featureIdSetOfGeoObjects = {};

        let addFeatureIdOfSeries = (featureId, dataPoint) => {
            if (typeof featureId === 'string') {
                featureId = featureId.trim();
            }
            if (!Object.has(featureIdSetOfSeries, featureId)) {
                featureIdSetOfSeries[featureId] = true;
                this.allFeatureIdsOfSeries.push(featureId);
            }
            if (!Object.has(this.featureIdToDataPoints, featureId)) {
                this.featureIdToDataPoints[featureId] = [];
            }
            this.featureIdToDataPoints[featureId].push(dataPoint);
        };

        let addFeatureIdOfGeoObject = (featureId, geoObject) => {
            if (!Object.has(featureIdSetOfGeoObjects, featureId)) {
                featureIdSetOfGeoObjects[featureId] = true;
                this.allFeatureIdsOfGeoObjects.push(featureId);
            }
            if (!Object.has(this.featureIdToGeoObjects, featureId)) {
                this.featureIdToGeoObjects[featureId] = [];
            }
            this.featureIdToGeoObjects[featureId].push(geoObject);
        };

        let geoObjectIndex = -1;
        geoObjects.forEach((geoObject) => {
            geoObjectIndex++;
            addFeatureIdOfGeoObject(geoObject.id + geoObjectIndex, geoObject);
        });

        let seriesDataFractions = [];
        series.forEach((serie) => {
            let maxMeasure = Number.NEGATIVE_INFINITY,
                minMeasure = Number.POSITIVE_INFINITY,
                maxDataPoint,
                minDataPoint,
                serieDataFractions = [];
            serie.data.each((dataPoint) => {
                if (dataPoint[measurePropKey] > maxMeasure) {
                    maxMeasure = dataPoint[measurePropKey];
                    maxDataPoint = dataPoint;
                }
                if (dataPoint[measurePropKey] < minMeasure) {
                    minMeasure = dataPoint[measurePropKey];
                    minDataPoint = dataPoint;
                }
            });
            let measureRange = maxMeasure - minMeasure,
                isRangeValid = isFinite(measureRange) && measureRange !== 0;
            if (isRangeValid) {
                serieDataFractions = serie.data.map(function (dataPoint) {
                    return (dataPoint[measurePropKey] - minMeasure) / measureRange;
                });
            }
            seriesDataFractions.push(serieDataFractions);
            serie.maxDataPoint = maxDataPoint;
            serie.minDataPoint = minDataPoint;
            serie.isRangeValid = isRangeValid;
        });

        GeoUtils.assignSeriesColors(this.chartModel, series);

        let dataPointIndex = -1;
        let isGeoArea = this.chartModel.getChartType()
                === chartTypeSpecificationService.chartTypes.GEO_AREA,
            isGeoEarthArea = this.chartModel.getChartType() ===
                chartTypeSpecificationService.chartTypes.GEO_EARTH_AREA;

        series.forEach((serie, serieIndex) => {
            let isRangeValid = serie.isRangeValid,
                serieDataFractions = seriesDataFractions[serieIndex];

            if (Object.has(serie, 'visible') && !serie.visible) {
                return;
            }

            let scale = chroma.scale(serie.scale)
                .mode('lab')
                .correctLightness(false);
            let bestScalingFunc;
            if (isRangeValid) {
                bestScalingFunc = GeoUtils.computeBestColorScalingFunction(serieDataFractions);
            }

            serie.data.each((dataPoint, index) => {
                dataPointIndex++;

                dataPoint.seriesIndex = serieIndex;
                dataPoint.dataPointIndex = dataPointIndex;

                let xFeatureId = this.getFeatureIdForXValue(dataPoint.x, serieIndex);
                addFeatureIdOfSeries(xFeatureId, dataPoint);
                dataPoint.featureIds = {
                    x: xFeatureId
                };

                if (isYGeo) {
                    let yFeatureId = this.getFeatureIdForYValue(dataPoint.y, serieIndex);
                    if (yFeatureId !== xFeatureId) {
                        addFeatureIdOfSeries(yFeatureId, dataPoint);
                    }
                    dataPoint.featureIds.y = yFeatureId;
                }

                let fraction: number
                    = isRangeValid ? bestScalingFunc(serieDataFractions[index]) : 0.5;
                dataPoint.measureRangeFraction = fraction;
                let pointHasColor = Object.has(dataPoint, 'color');
                if (!pointHasColor) {
                    if (isGeoArea || isGeoEarthArea) {
                        dataPoint.mapColor =
                            (scale(fraction) as Color).alpha(GEO_AREA_OPACITY).css();
                    } else {
                        dataPoint.mapColor = serie.color;
                    }
                }
            });
        });
    }

    private getFeatureIdForXValue(xValue: any, seriesIndex: number): string {
        return GeoDataProcessor.getFeatureIdForDataValue(
            this.seriesXValueToFeatureId,
            xValue,
            seriesIndex,
            this.data.labelFormatters.x
        );
    }

    private getFeatureIdForYValue(yValue: any, seriesIndex: number): string {
        return GeoDataProcessor.getFeatureIdForDataValue(
            this.seriesYValueToFeatureId,
            yValue,
            seriesIndex,
            this.data.labelFormatters.y
        );
    }
}
