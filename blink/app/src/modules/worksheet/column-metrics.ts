/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Classes for metrics defined on Logical/Visualization columns.
 * Used to specify visual representation and actions based on KPI.
 */

import {ngRequire, Provide} from 'src/base/decorators';

let jsonConstants = ngRequire('jsonConstants');

class ColumnMetricRange {
    public min: number;
    public max: number;

    constructor (rangeJson) {
        this.min = rangeJson.min !== void 0 ? rangeJson.min : Number.NEGATIVE_INFINITY;
        this.max = rangeJson.max !== void 0 ? rangeJson.max : Number.POSITIVE_INFINITY;
    }

    public toJson() {
        var json = {};

        var min: any = this.getMin();
        if (isFinite(min)) {
            json.min = min;
        }

        var max: any = this.getMax();
        if (isFinite(max)) {
            json.max = max;
        }

        return json;
    }

    public getMin(): number {
        return this.min;
    }

    public getMax(): number {
        return this.max;
    }
}

class ColumnMetric {
    public range: ColumnMetricRange;
    public color;
    public iconPath;
    public action;
    /**
     * A class representing a metric on a logical/visualization column.
     * A column metric represents the definition of system behavior
     * based on the values for data in the column including the color
     * representation for specific ranges of data value.
     *
     * @param metricJson {Object} A json object with fields representing the range,
     * color, iconPath and action properties associated with the metric.
     * Range specifies the min/max values this metric applies to. Color & iconPath
     * specify the visual properties of the values that fall within the range of
     * the metric. Action is not yet defined.
     *
     * @constructor
     */
    constructor (metricJson) {
        this.range = new ColumnMetricRange(metricJson.range);
        this.color = metricJson.color;
        this.iconPath = metricJson.iconPath || '';
        this.action = metricJson.action || jsonConstants.metrics.actionType.NONE;
    }

    public toJson() {
        return {
            range: this.getRange().toJson(),
            color: this.getColor(),
            iconPath: this.getIconPath(),
            action: this.getAction()
        };
    }

    public getRange(): ColumnMetricRange {
        return this.range;
    }

    public getColor() {
        return this.color;
    }

    public getIconPath() {
        return this.iconPath;
    }

    public getAction() {
        return this.action;
    }

    public isValueInRange(value) {
        // range is [min, max)
        return value >= this.range.min && value < this.range.max;
    }
}

@Provide('ColumnMetricsDefinition')
export class ColumnMetricsDefinition {
    public name: string;
    public metrics: Array<ColumnMetric>;

    /**
     * A class representing column metrics definition for a logical/visualization
     * column. A column metrics definition is a essentially a named collection
     * of column metrics.
     *
     * @param metricDefinitionJson
     * @constructor
     */
    constructor (metricDefinitionJson) {
        this.name = metricDefinitionJson.name;
        // NOTE: SCAL-11221 In case an empty metric is defined client used to set
        // empty definition, in that case callosum returns empty row map.
        metricDefinitionJson.row = metricDefinitionJson.row || [];
        this.metrics = metricDefinitionJson.row.map(function  (metricJson) {
            return new ColumnMetric(metricJson);
        });
    }

    public toJson() {
        return {
            name: this.getName() || '',
            row: this.getMetrics().map(function  (metric) {
                return metric.toJson();
            })
        };
    }

    public getName(): string {
        return this.name;
    }

    public getMetrics(): Array<ColumnMetric> {
        return this.metrics;
    }

    public getMetricAtIndex(index): ColumnMetric {
        if (index < 0 || index >= this.metrics.length) {
            return null;
        }
        return this.metrics[index];
    }

    public getColorForValue(value): string {
        var metric = this.metrics.find(function  (metric) {
            return metric.isValueInRange(value);
        });
        return !!metric ? metric.getColor() : null;
    }
}
