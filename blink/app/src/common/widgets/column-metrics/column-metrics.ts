/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Directive for viewing/editing column metrics.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';

let Logger = ngRequire('Logger');
let $rootScope = ngRequire('$rootScope');
let events = ngRequire('events');
let ColumnMetricsDefinition = ngRequire('ColumnMetricsDefinition');
let util = ngRequire('util');
let $q = ngRequire('$q');

let PRE_DEFINED_COLORS: string[] = ['#ff0000', '#00ff00', '#ffff00'];

@Component({
    name: 'bkColumnMetrics',
    templateUrl: 'src/common/widgets/column-metrics/column-metrics.html'
})
export class ColumnMetricsComponent extends BaseComponent {

    private validationErrors: any = null;
    private metricsEditBuffer: any;

    constructor(
        private columnMetricsDefinition: any,
        public isEditable: boolean
    ) {
        super();
        this.metricsEditBuffer = columnMetricsDefinition
            ? columnMetricsDefinition.toJson()
            : {row: []};
    }

    public rowHasValidationErrors(rowIndex): boolean {
        if (!this.validationErrors || !this.validationErrors.rowValidity) {
            return false;
        }
        return !this.validationErrors.rowValidity[rowIndex];
    }

    public cellHasValidationErrors(rowIndex, cellIndex): boolean {
        if (!this.validationErrors || !this.validationErrors.cellValidity) {
            return false;
        }
        let metricRowErrors = this.validationErrors.cellValidity[rowIndex];
        if (!metricRowErrors) {
            // SCAL-12508: empty rows are ignored for saving and validation
            // purposes.
            return false;
        }
        return !metricRowErrors[cellIndex];
    }

    public hasNoMetrics(): boolean {
        return this.metricsEditBuffer.row.length === 0;
    }

    public getNoMetricsDefinedMessage(): string {
        return strings.NO_METRICS_DEFINED_YET_MESSAGE;
    }

    public sanitizeMetrics(metrics: any[]): any[] {
        metrics = metrics.filter((metric) => {
            // if both ends are empty we'll simply ignore this range
            return !this.isValueBlank(metric.range.min) ||
                !this.isValueBlank(metric.range.max);
        });

        metrics.forEach((metric) => {
            let numericValues = this.getRangeNumericValues(metric.range);
            metric.range.min = numericValues.min;
            metric.range.max = numericValues.max;
        });

        return metrics;
    }

    public addNewMetric(): void {
        let numMetrics = this.metricsEditBuffer.row.length;
        // for first few metrics we choose from a pre-defined set of colors.
        let color = PRE_DEFINED_COLORS[numMetrics];
        if (!color) {
            color = chroma.random().hex();
        }

        this.metricsEditBuffer.row.push({
            color: color,
            range: {
                min: '',
                max: ''
            }
        });
    }

    public removeMetric(metric): void {
        this.metricsEditBuffer.row.remove(metric);
    }

    public getValidationError() {
        // validate that all the ranges are valid numbers
        let rowCellValidity = [],
            invalidRowsPresent = false;

        let metrics = this.sanitizeMetrics(this.metricsEditBuffer.row);
        metrics.forEach((metric) => {
            let cellValidity = [true, true];
            rowCellValidity.push(cellValidity);

            if (isNaN(metric.range.min)) {
                cellValidity[0] = false;
                invalidRowsPresent = true;
            }
            if (isNaN(metric.range.max)) {
                cellValidity[1] = false;
                invalidRowsPresent = true;
            }
        });

        if (invalidRowsPresent) {
            return {
                message: strings.metricsRangeValidationErrorMessages.NON_NUMERIC_RANGE_BOUNDARY,
                cellValidity: rowCellValidity,
                rowValidity: null
            };
        }

        let rowValidity = {};
        metrics.forEach((metric, index) => {
            rowValidity[index] = true;
            if (metric.range.min >= metric.range.max) {
                rowValidity[index] = false;
                invalidRowsPresent = true;
            }
        });

        if (invalidRowsPresent) {
            return {
                message: strings.metricsRangeValidationErrorMessages.INVALID_RANGE,
                cellValidity: null,
                rowValidity: rowValidity
            };
        }

        metrics.forEach((metric, index) => {
            rowValidity[index] = true;
        });

        // SCAL-12669: Don't sort the original metric array
        let metricsWithIndices = metrics.map((metric, index) => {
            return {
                index: index,
                metric: metric
            };
        });

        metricsWithIndices.sort((metricWithRangeA, metricWithRangeB) => {
            return metricWithRangeA.metric.range.min
                - metricWithRangeB.metric.range.min;
        });

        metricsWithIndices.forEach((metricWithIndex, sortIndex) => {
            if (sortIndex >= metricsWithIndices.length - 1) {
                return;
            }

            let metric = metricWithIndex.metric;
            let metricIndex = metricWithIndex.index;

            let nextMetricWithIndex = metricsWithIndices[sortIndex + 1];
            let nextMetric = nextMetricWithIndex.metric;
            let nextMetricIndex = nextMetricWithIndex.index;

            if (metric.range.max > nextMetric.range.min) {
                rowValidity[metricIndex] = rowValidity[nextMetricIndex] = false;
                invalidRowsPresent = true;
            }
        });


        if (invalidRowsPresent) {
            return {
                message: strings.metricsRangeValidationErrorMessages.OVERLAPPING_RANGES,
                cellValidity: null,
                rowValidity: rowValidity
            };
        }

        return null;
    }

    public isColorPickerEditable(): boolean {
        return this.isEditable;
    }

    public commitChanges(): angular.IPromise<{newDefinition: any, hasChanges: boolean}> {
        this.validationErrors = this.getValidationError();
        let defer = $q.defer();

        if (this.validationErrors) {
            defer.reject();
            return defer.promise;
        }

        // ranges with both ends blank are completely ignored
        this.metricsEditBuffer.row = this.sanitizeMetrics(this.metricsEditBuffer.row);

        // NOTE: SCAL-11221 Client should not try to define column metrics when they are empty.
        let bufferHasMetricDefinition = this.sanitizeMetrics(this.metricsEditBuffer.row).length > 0;
        let hasNonZeroDefinedMetrics = !!this.columnMetricsDefinition &&
            !!this.columnMetricsDefinition.metrics &&
            this.columnMetricsDefinition.metrics.length > 0;
        let bufferNeedsApplication = bufferHasMetricDefinition || hasNonZeroDefinedMetrics;
        let hasChanges = bufferNeedsApplication;
        let newDefinition = new ColumnMetricsDefinition(this.metricsEditBuffer);
        defer.resolve({
            newDefinition: newDefinition,
            hasChanges: hasChanges
        });
        return defer.promise;
    }

    private isValueBlank(value): boolean {
        return value === void 0 || (value + '').isBlank();
    }

    private getRangeNumericValues(range): {min: number, max: number} {
        let parsedBusinessNumber = null;

        let min = range.min;
        if (this.isValueBlank(range.min)) {
            min = Number.NEGATIVE_INFINITY;
        } else if (Object.isNumber(range.min)) {
            min = parseFloat(range.min);
        } else {
            parsedBusinessNumber = util.parseBusinessNumber(range.min);
            if (!isNaN(parsedBusinessNumber)) {
                min = parsedBusinessNumber;
            }
        }

        let max = range.max;
        if (this.isValueBlank(range.max)) {
            max = Number.POSITIVE_INFINITY;
        } else if (Object.isNumber(range.max)) {
            max = parseFloat(range.max);
        } else {
            parsedBusinessNumber = util.parseBusinessNumber(range.max);
            if (!isNaN(parsedBusinessNumber)) {
                max = parsedBusinessNumber;
            }
        }

        return {min: min, max: max};
    }
}
