/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview A class to manage the logic around data labels placement.
 */

import {DATA_LABEL_AVG_CHAR_WIDTH, DATA_LABEL_LINE_HEIGHT} from './geo-constants';

interface GeoDataLabelManagerOptions {
    features: ol.Feature[];
    width: number;
    height: number;
    coordinateFunc: (feature: ol.Feature) => ol.Coordinate;
    labels: Map<string, string>;
    prioritize_existing?: boolean;
    existing_labeled_features?: Set<string>;
}

export default class GeoDataLabelManager {

    public static chooseFeaturesForLabeling(options: GeoDataLabelManagerOptions): Set<string> {
        let width = options.width,
            height = options.height;
        let onScreenFeatures: {[featureId: string]: ol.Coordinate} = {};
        options.features.forEach((feature) => {
            let coords = options.coordinateFunc(feature);
            if (coords[0] < 0 || coords[1] < 0 ||
                coords[0] > width || coords[1] > height) {
                return;
            }
            onScreenFeatures[feature.getId()] = coords;
        });

        let chosenFeatures: {[featureId: string]: ol.Coordinate} = {};
        if (options.prioritize_existing) {
            // First prioritise to those which had labels in the last pass.
            if (options.existing_labeled_features === void 0) {
                throw new Error(
                    'existing labeled features must be provided if prioritize_existing' +
                    ' is passed true'
                );
            }
            options.existing_labeled_features.forEach((featureId) => {
                if (Object.has(onScreenFeatures, featureId)) {
                    chosenFeatures[featureId] = onScreenFeatures[featureId];
                }
            });
        }
        let labelWidths = new Map<string, number>();
        options.labels.forEach((label, featureId) => {
            let lines = label.split('\n');
            let maxLineLength = Math.max(...lines.map((line) => line.length));
            labelWidths.set(featureId, maxLineLength * DATA_LABEL_AVG_CHAR_WIDTH);
        });

        for (let featureId in onScreenFeatures) {
            if (chosenFeatures[featureId]) {
                continue;
            }
            let clash = false;
            let coords = onScreenFeatures[featureId];
            let maxAllowedYDiff = 2 * DATA_LABEL_LINE_HEIGHT;
            for (let key in chosenFeatures) {
                let labeledPoint = chosenFeatures[key];
                let maxAllowedXDiff = (labelWidths.get(featureId) + labelWidths.get(key)) / 2;
                if (Math.abs(labeledPoint[0] - coords[0]) < maxAllowedXDiff &&
                    Math.abs(labeledPoint[1] - coords[1]) < maxAllowedYDiff) {
                    clash = true;
                    break;
                }
            }
            if (!clash) {
                chosenFeatures[featureId] = coords;
            }
        }
        return new Set<string>(Object.keys(chosenFeatures));
    }
}
