/**
 * Copyright: ThoughtSpot Inc.
 * Author: Marco Alban
 *
 * @fileoverview This class defines logic of a layer that draws general geoObjects in the geo map.
 * Responsible for showing the geo objects of correct size/color in the layer
 */

import {ngRequire, Provide} from '../../../../../../../base/decorators';
import {
    BOUNDARY_THICKNESS,
    DATA_PROJECTION, GEO_NEARBY_OBJECTS_LAYER_BOUNDARY_COLOR
} from '../../base/geo-constants';
import {GeoFilterCircle, GeoFilterObject} from '../../base/geo-filter-objects';
import BaseImageLayer from './base-image-layer';

let Logger = ngRequire('Logger');

@Provide('GeoObjectLayer')
export default class GeoObjectLayer extends BaseImageLayer {
    private logger;

    private static createFeatures(
        featureIds: Array<string>,
        featureGeoObjectGetter: (featureId: string) => GeoFilterObject[],
        metersToMapUnit: (coordinate: [number, number], lengthInMeters: number) => number,
        projectionCode: string,
        logger: any
    ) {
        let features = [];
        featureIds.forEach(featureId => {
            let geoObjects = featureGeoObjectGetter(featureId);
            geoObjects.forEach(function (geoObject) {
                switch (geoObject.type) {
                    case 'CIRCLE':
                        let circleObject = geoObject as GeoFilterCircle;
                        let center: [number, number] = [circleObject.longitude,
                            circleObject.latitude];
                        center = ol.proj.transform(
                            center,
                            DATA_PROJECTION,
                            projectionCode
                        );
                        let radius = metersToMapUnit(center, circleObject.radius);
                        let circle = new ol.geom.Circle(center, radius);
                        let feature = new ol.Feature(circle);
                        feature.setId(featureId);
                        feature.setStyle(
                            new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: GEO_NEARBY_OBJECTS_LAYER_BOUNDARY_COLOR,
                                    width: BOUNDARY_THICKNESS
                                }),
                                fill: new ol.style.Fill({
                                    color: 'transparent'
                                })
                            })
                        );
                        features.push(feature);
                        break;
                    default:
                        logger.warn('Unrecognized type of geoObject, skipping.');
                }
            });
        });
        return features;
    }

    /**
     * @featureIds - An array of feature ids identifying the features
     * to draw.
     * @featureGeoObjectGetter - function that accepts a feature id and
     * returns an array of GeoObjects mapping to that id.
     * @metersToMapUnit - a function that accepts a coordinate and a
     * scalar in meters and returns the desired scaling to open layer map units.
     * @projectionCode - a codified string denoting the current view projection.
     */
    constructor(
        featureIds: Array<string>,
        featureGeoObjectGetter: (featureId: string) => any,
        metersToMapUnit: (c: [number, number], r: number) => number,
        projectionCode: string
    ) {
        let logger = Logger.create('geofilter-layer');
        let features = GeoObjectLayer.createFeatures(
            featureIds,
            featureGeoObjectGetter,
            metersToMapUnit,
            projectionCode,
            logger
        );
        super({
            features: features
        });
        this.logger = logger;
    }

    getStylesForFeature(
        feature: ol.Feature,
        resolution: number
    ): ol.style.Style|ol.style.Style[] {
        return feature.getStyleFunction()(resolution);
    }
}
