
/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Utility functions used in geo code.
 */
import {ngRequire, Provide} from '../../../../../../base/decorators';
import {CustomStylingConfig} from '../../../../../custom-styling/custom-style-config';
import GeoConfig from '../../../../../document-model/table-model/geo-config';
import {jsonConstants} from '../../../../answer/json-constants';
import {ChartModel} from '../../chart-model';
import GeoMapComponent from '../2d/blink-geo-map';
import GeoCountryConfig from './geo-country-config';
import GeoPropField from './metadata-services/geo-prop-field';

let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let util = ngRequire('util');

@Provide('GeoUtils')
export class GeoUtils {
    /**
     * For the given normalized data values, this function computes the scaling function that will
     * produce most distributed colors.
     * It uses simple heuristic to reduce number of functions we end up evaluating.
     */
    public static computeBestColorScalingFunction(
        dataFractions: Array<number>
    ): ((number: number) => number) {
        // make a copy of original array so we don't modify the original one.
        dataFractions = dataFractions.slice(0);

        let identityFunc = (number: number) => number,
            squareFunc = (number: number) => number * number,
            cubeFunc = (number: number) => number * number * number;

        // Set identity function's coefficient as benchmark.
        let maxCoefficient =
                GeoUtils.computeDistributionCoefficient(identityFunc, dataFractions),
            bestScalingFunc = identityFunc;

        let coefficient = GeoUtils.computeDistributionCoefficient(squareFunc, dataFractions);
        if (coefficient > maxCoefficient) {
            maxCoefficient = coefficient;
            bestScalingFunc = squareFunc;
            // if square function performs better, check if cube performs even better
            coefficient = GeoUtils.computeDistributionCoefficient(cubeFunc, dataFractions);
            if (coefficient > maxCoefficient) {
                maxCoefficient = coefficient;
                bestScalingFunc = cubeFunc;
            }
        } else {
            coefficient = GeoUtils.computeDistributionCoefficient(Math.sqrt, dataFractions);
            if (coefficient > maxCoefficient) {
                maxCoefficient = coefficient;
                bestScalingFunc = Math.sqrt;
                // if squar root function performs better, check if cube root performs even better
                coefficient = GeoUtils.computeDistributionCoefficient(Math.cbrt, dataFractions);
                if (coefficient > maxCoefficient) {
                    maxCoefficient = coefficient;
                    bestScalingFunc = Math.cbrt;
                }
            }
        }
        return bestScalingFunc;
    }

    /**
     * Returns an interior point of a given polygon/multi-polygon or point. Interior point is
     * not centroid but close to it. We use this interior point for showing bubbles, data labels
     * etc. inside a geo region.
     * @param feature
     * @returns {ol.geom.Point}
     */
    public static getInteriorPoint(
        feature: ol.Feature
    ): ol.geom.Point {
        if (feature.getGeometry().getType() === 'MultiPolygon') {
            return GeoUtils.getLargestPolygon(
                (feature.getGeometry() as ol.geom.MultiPolygon).getPolygons()
            ).getInteriorPoint();
        } else if (feature.getGeometry().getType() === 'Polygon') {
            return (feature.getGeometry() as ol.geom.Polygon).getInteriorPoint();
        } else if (feature.getGeometry().getType() === 'Point') {
            return feature.getGeometry() as ol.geom.Point;
        } else {
            throw new Error('Unhandled geometry type' + feature.getGeometry().getType());
        }
    }

    /**
     * Returns the largest polygon by area.
     * @param polygons
     * @returns {ol.geom.Polygon|any}
     */
    public static getLargestPolygon(polygons: ol.geom.Polygon[]): ol.geom.Polygon {
        let polyObj = [];
        //now need to find which one is the greater and so label only this
        for (let i = 0; i < polygons.length; i++) {
            polyObj.push({polygon: polygons[i], area: polygons[i].getArea()});
        }
        polyObj.sort(function (a, b) {
            return a.area - b.area;
        });

        return polyObj[polyObj.length - 1].polygon;
    }

    /**
     * Assign colors and color ranges to the geo series. Checks if chart model has it, if not
     * picks random colors from the color pool defined for geo in CustomStylingConfig.
     * @param chartModel
     * @param series
     */
    public static assignSeriesColors(chartModel: ChartModel, series: any[]): void {
        switch (chartModel.getChartType()) {
            case chartTypeSpecificationService.chartTypes.GEO_AREA:
                GeoUtils.assignGeoAreaSeriesColors(chartModel, series);
                break;
            case chartTypeSpecificationService.chartTypes.GEO_BUBBLE:
                GeoUtils.assignGeoBubbleSeriesColors(chartModel, series);
                break;
            case chartTypeSpecificationService.chartTypes.GEO_HEATMAP:
                break;
            default:
                throw new Error('Unhandled geo chart type');
        }
    }

    /**
     * Sets the currently used series colors in chart model so that they can be persisted
     * with chart model.
     * @param chartModel
     * @param blinkGeoMap
     */
    public static updateRenderedGeoMapColorsInModel(
        chartModel: ChartModel,
        blinkGeoMap: GeoMapComponent
    ): void {
        switch(chartModel.getChartType()) {
            case chartTypeSpecificationService.chartTypes.GEO_AREA:
                blinkGeoMap.getSeries().forEach(function(serie) {
                    chartModel.setMultiColorSeriesColors(
                        serie.blinkSeriesId,
                        chartModel.getXAxisColumnsHash(),
                        serie.scale
                    );
                });
                break;
            case chartTypeSpecificationService.chartTypes.GEO_BUBBLE:
                blinkGeoMap.getSeries().forEach(function(serie) {
                    chartModel.setSeriesColor(serie.blinkSeriesId, serie.color);
                });
                break;
            case chartTypeSpecificationService.chartTypes.GEO_HEATMAP:
                break;
            default:
                throw new Error('Unhandled geo chart type');
        }
    }

    public static isGeoConfigWithPartialDrawing(geoConfig: GeoConfig): boolean {
        if (!geoConfig.getParent()) {
            return false;
        }
        return geoConfig.getType() === jsonConstants.geoConfigType.ZIP_CODE ||
            geoConfig.getType() === jsonConstants.geoConfigType.ADMIN_DIV_2;
    }

    public static getPropKeysForMatching(
        configType: string,
        country: string|undefined
    ): Array<GeoPropField> {
        let props: Array<GeoPropField>;
        switch (configType) {
            case jsonConstants.geoConfigType.ADMIN_DIV_0:
                props = [GeoPropField.NAME, GeoPropField.NAME_LONG, GeoPropField.NAME_SORT,
                    GeoPropField.ADMIN, GeoPropField.FORMAL_EN, GeoPropField.GEOID,
                    GeoPropField.ISO_A3];
                break;
            case jsonConstants.geoConfigType.ADMIN_DIV_1:
            case jsonConstants.geoConfigType.ADMIN_DIV_2:
                props = GeoCountryConfig.get(country).getExtraFieldsToMatch(configType)
                    .map((fieldName: string) => {
                        return new GeoPropField(fieldName);
                    })
                    .concat([GeoPropField.GEOID, GeoPropField.NAME]);
                break;
            case jsonConstants.geoConfigType.ZIP_CODE:
            case jsonConstants.geoConfigType.CUSTOM_REGION:
                props = [GeoPropField.GEOID];
                break;
            case jsonConstants.geoConfigType.POINT:
                props = [GeoPropField.LATLONG];
                break;
            default:
                throw new Error('Unhandled geo config type');
        }

        return props;
    }

    public static getTopoGlURLForGeoType(geoType: string): string|null {
        let fileName;
        switch (geoType) {
            case jsonConstants.geoConfigType.ZIP_CODE:
                fileName = 'us_zip';
                break;
            case jsonConstants.geoConfigType.ADMIN_DIV_1:
                fileName = 'us_state';
                break;
            case jsonConstants.geoConfigType.ADMIN_DIV_0:
                fileName = 'world';
                break;
            default :
                fileName = null;
        }
        if (fileName === null) {
            return null;
        }
        return '/resources/geo/topogl/' + fileName + '.topogl.bin';
    }

    private static assignGeoAreaSeriesColors(chartModel: ChartModel, series: any[]): void {
        let savedAreaColors = chartModel.getMultiColorSeriesColors(),
            allAreaColors = CustomStylingConfig.getGeoAreaColors();

        let randomOffset = util.getRandomInteger(0, allAreaColors.length - 1);
        series.forEach((serie, index) => {
            let columnHash = chartModel.getXAxisColumnsHash();
            if (!!savedAreaColors && !!savedAreaColors[serie.blinkSeriesId] &&
                !!savedAreaColors[serie.blinkSeriesId][columnHash]) {
                serie.scale = savedAreaColors[serie.blinkSeriesId][columnHash];
                serie.color = serie.scale[Math.floor(serie.scale.length / 2)];
            } else {
                let randomIndex = (randomOffset + index) % allAreaColors.length;
                serie.scale = allAreaColors[randomIndex];
                // Even though serie.color is used for only bubble map, but in the legend picker
                // even for area map we are showing a single color dot, which renders using
                // serie.color. So for that we need to set serie.color as well.
                // Once we start showing a color range instead of dot for area map, we will no
                // longer need to set serie.color.
                serie.color = serie.scale[Math.floor(serie.scale.length / 2)];
            }
        });
    }

    private static assignGeoBubbleSeriesColors(chartModel: ChartModel, series: any[]): void {
        let savedBubbleColors = chartModel.getSeriesColors(),
            allBubbleColors = CustomStylingConfig.getGeoBubbleColors();

        let randomOffset = util.getRandomInteger(0, allBubbleColors.length - 1);
        series.forEach((serie, index) => {
            if (!!savedBubbleColors && !!savedBubbleColors[serie.blinkSeriesId]) {
                serie.color = savedBubbleColors[serie.blinkSeriesId];
            } else {
                let randomIndex = (randomOffset + index) % allBubbleColors.length;
                serie.color = allBubbleColors[randomIndex];
            }
        });
    }

    /**
     * This function computes a numeric coefficient for a given set of values b/w 0.0 to 1.0 which
     * tells how uniformly these values are distributed, higher the coefficient is more
     * distributed the given values are. For example, values [0, 0.2, 0.4, 0.6, 0.9] are relatively
     * more uniformly distributed than values [0, 0.1, 0.12, 0.8, 0.85], so the coefficient for
     * the former array will be higher.
     */
    private static computeDistributionCoefficient(
        scalingFunction: (number) => number,
        fractions: Array<number>
    ): number {
        fractions = fractions.sort().map(function (f) {
            return scalingFunction(f);
        });
        let sum = 0;
        for (let i = 1; i < fractions.length; i++) {
            let diff = fractions[i] - fractions[i-1];
            sum += diff * diff;
        }
        let coefficient = 1 / sum;
        return coefficient;
    }
}
