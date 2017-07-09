/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 */

import {blinkConstants} from 'src/base/blink-constants';
import {ngRequire, Provide} from 'src/base/decorators';
import {ChartAxisConfigValidationErrors}
    from '../../../charts/chart-editor/chart-axis-configurator/chart-axis-config-validation-errors';
import {ChartAxisConfig} from './chart-axis-config';

let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let currencyUtil = ngRequire('currencyUtil');

Provide('axisColumnValidationService')({
    validateAxisColumns
});

/**
 * Validates the tuple of axes against system constraint on what combinations are allowed.
 * @param {ChartAxisConfig} axisConfig
 * @param chartType
 * @param isYAxisShared
 * @returns {{xAxis: String, yAxis: String, legend: String, radial: String}}.
 * Error message per axis if the columns for the axis are invalid.
 * If the axis has valid configuration the error message is null
 */
export function validateAxisColumns(
    axisConfig: ChartAxisConfig,
    chartType: string,
    isYAxisShared: boolean,
    isRadialEnabled: boolean
) {
    axisConfig.xAxisColumns = axisConfig.xAxisColumns || [];
    axisConfig.yAxisColumns = axisConfig.yAxisColumns || [];
    axisConfig.legendColumns = axisConfig.legendColumns || [];

    let validity = new ChartAxisConfigValidationErrors(null, null, null, null, null);
    let allColumns = [
            ...axisConfig.xAxisColumns,
            ...axisConfig.yAxisColumns,
            ...axisConfig.legendColumns
        ],
        columnIds = new Set([]);

    if (axisConfig.xAxisColumns.length === 0) {
        validity.xAxis = blinkConstants.chartEditorErrorExplanation.ATLEAST_ONE_X_COLUMN;
    }
    if (axisConfig.yAxisColumns.length === 0) {
        validity.yAxis = blinkConstants.chartEditorErrorExplanation.ATLEAST_ONE_Y_COLUMN;
    }
    if (isRadialEnabled && !axisConfig.radialColumn) {
        validity.radial = blinkConstants.chartEditorErrorExplanation.SIZE_REQUIRED;
    }
    if (axisConfig.yAxisColumns.length > 1) {
        var invalid = axisConfig.yAxisColumns.some((column) => {
            return !column.isEffectivelyNumeric();
        });
        if (invalid) {
            validity.yAxis = blinkConstants.chartEditorErrorExplanation.MULTIPLE_NON_NUMERIC_ON_Y;
        }
    }

    if (isYAxisShared) {
        let areAllYAxisColumnsNumeric = axisConfig.yAxisColumns.every((column) => {
            return column.isEffectivelyNumeric();
        });
        if (!areAllYAxisColumnsNumeric) {
            validity.yAxis = blinkConstants.chartEditorErrorExplanation.NON_NUMERIC_Y_AXIS_LINKING;
        }
    }

    axisConfig.legendColumns.forEach(function(column, index){
        if (!column.isAttribute()) {
            validity.legend = blinkConstants.chartEditorErrorExplanation.ONLY_ATTRIBUTES_ON_LEGEND;
            return false;
        }
    });

    if (!!axisConfig.radialColumn) {
        if(axisConfig.radialColumn.isEffectivelyNonNumeric()) {
            // TODO(sunny): 'numeric' might confuse user if the column is numeric attribute
            validity.radial = blinkConstants.chartEditorErrorExplanation.NUMERIC_SIZE_COLUMN;
        }
        allColumns.push(axisConfig.radialColumn);
    }

    for (let column of allColumns) {
        let columnId = column.getSageOutputColumnId() || column.getId();
        if(columnIds.has(columnId)) {
            validity.other = blinkConstants.chartEditorErrorExplanation.COLUMN_ALREADY_USED.assign(
                column.getName()
            );
            break;
        }
        columnIds.add(columnId);
    }

    if(!!chartType) {
        let configOptions = chartTypeSpecificationService.configOptions(chartType);
        if(!configOptions.allowLegendWithMultipleY
            && axisConfig.yAxisColumns.length > 1
            && axisConfig.legendColumns.length > 0) {
            validity.legend = blinkConstants
                .chartEditorErrorExplanation
                .UNSUPPORTED_LEGEND_WITH_MULTIPLE_Y;
        }
    }

    if (isYAxisShared && axisConfig.yAxisColumns.length > 1 && !validity.yAxis) {
        // Y Axis can only be shared if all the columns on y-axis has same currency info.
        if (!currencyUtil.haveIdenticalCurrencyTypeInfo(axisConfig.yAxisColumns)) {
            validity.yAxis = blinkConstants.chartEditorErrorExplanation.INVALID_AXIS_SHARING;
        }
    }

    return validity;
}
