/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to view the chart editor.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {BlinkRange} from '../../../base/base-types/base-types';
import {blinkConstants} from '../../../base/blink-constants';
import {Component, ngRequire} from '../../../base/decorators';
import {getCurrentChartImagePath} from '../../search-pages/search-pages-utils';
import {ChartModel} from '../../viz-layout/viz/chart/chart-model';
import {AllowedChartConfigurationsConfig} from './chart-allowed-configurations-config';
import {ChartAxisConfiguratorComponent} from './chart-axis-configurator/chart-axis-configurator';
import {ChartConfigComponent} from './chart-configurator/chart-config';
import {ChartConfigItemComponent} from './chart-configurator/chart-config-item';
import {ChartConfigRangeItemComponent} from './chart-configurator/chart-config-range-item';
import {ChartConfigSelectorItemComponent} from './chart-configurator/chart-config-selector-item';
import {ChartConfigTogglerItemComponent} from './chart-configurator/chart-config-toggler-item';
import {ChartZoomComponent} from './zoom-state-configurator/chart-zoom';

let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let util = ngRequire('util');

@Component({
    name: 'bkChartEditor',
    templateUrl: 'src/modules/charts/chart-editor/chart-editor.html'
})
export class ChartEditorComponent extends BaseComponent {
    public chartAxisConfiguratorComponent: ChartAxisConfiguratorComponent;
    public chartConfiguratorComponent: ChartConfigComponent;
    public chartZoomComponent: ChartZoomComponent;
    public onClose: Function;

    private chart:any;
    private chartModel: ChartModel;
    private refreshChart: Function;

    constructor(
        chart: any,
        chartModel: ChartModel,
        chartRefresh: Function,
        onClose: Function,
        chartRedraw: Function
    ) {
        super();
        this.chart = chart;
        this.chartModel = chartModel;
        this.refreshChart = chartRefresh;

        this.chartAxisConfiguratorComponent = new ChartAxisConfiguratorComponent(
            this.chartModel,
            this.refreshChart
        );

        let configOptions = chartTypeSpecificationService
            .configOptions(chartModel.getChartType(), chartModel);
        let allowedConfigurations: AllowedChartConfigurationsConfig =
            configOptions.allowedConfigurations;

        let isChartZoomDisabled = chartModel.hasUserDefinedYAxisRange();
        if (allowedConfigurations.zoomPanStateToggle) {
            this.chartZoomComponent = new ChartZoomComponent(
                this.chart,
                this.chartModel,
                isChartZoomDisabled,
                this.strings.charts.chartEditor.ZOOM_DISABLED
            );
        }

        this.chartConfiguratorComponent = getChartConfigComponent(
            this.chartModel,
            this.chart,
            this.strings,
            this.chartZoomComponent,
            chartRedraw
        );

        this.onClose = onClose;
    }

    public getTitleIconPath() : string {
        return getCurrentChartImagePath(this.chartModel.getContainingAnswerModel());
    }

    public getTitleText() : string {
        let chartType = this.chartModel.getChartType();
        let displayName = util.replaceAll(chartType, '_', ' ');
        return displayName.capitalize(true) + ' Chart';
    }
}

function getChartConfigComponent(
    chartModel: ChartModel,
    chart: any,
    strings: any,
    chartZoomComponent: ChartZoomComponent,
    triggerChartRedraw: Function
) : ChartConfigComponent {
    let chartConfigItems: Array<ChartConfigItemComponent> = [];

    let configOptions = chartTypeSpecificationService
            .configOptions(chartModel.getChartType(), chartModel);
    let allowedConfigurations: AllowedChartConfigurationsConfig =
        configOptions.allowedConfigurations;

    if (allowedConfigurations.showDataLabels) {
        let isDataLabelsEnabled = chartModel.isDataLabelsEnabledSetByUser()
            ? chartModel.isDataLabelsEnabled()
            : !!configOptions.dataLabelsEnabledByDefault;
        let dataLabelsEnabledToggler = new ChartConfigTogglerItemComponent(
            strings.charts.chartEditor.SHOW_DATA_LABELS,
            isDataLabelsEnabled,
            () => {
                let enabled = !chart.isDataLabelsEnabled();
                chartModel.setDataLabelsEnabled(enabled);
                chart.setDataLabelVisibility(enabled);
            },
            'bk-show-data-label');
        chartConfigItems.push(dataLabelsEnabledToggler);
    }

    if (allowedConfigurations.showYAxisAsPercent) {
        let showYAsPercentToggler = new ChartConfigTogglerItemComponent(
            strings.charts.chartEditor.SHOW_Y_AXIS_AS_PERCENT,
            chartModel.isYAxisStackedAsPercent(),
            () => {
                chartModel.toggleShowYAxisAsPercent();
                triggerChartRedraw();
            },
            'bk-show-yaxis-as-percent'
        );
        chartConfigItems.push(showYAsPercentToggler);
    }

    if (allowedConfigurations.overlayHeatMap) {
        let overlayHeatmapToggler = new ChartConfigTogglerItemComponent(
            strings.charts.chartEditor.OVERLAY_HEATMAP,
            chartModel.isHeatmapOverlayed(),
            () => {
                let enabled = !chartModel.isHeatmapOverlayed();
                chartModel.setIsHeatmapOverlayed(enabled);
                chart.setIsHeatmapOverlayed(enabled);
            },
            'bk-overlay-heatmap'
        );
        chartConfigItems.push(overlayHeatmapToggler);
    }

    if (allowedConfigurations.yAxisRange) {
        let yAxisColumns = chartModel.getYAxisColumns();
        let areAllYNumeric = yAxisColumns.every((col) => {
           return col.isEffectivelyNumeric();
        });
        if (areAllYNumeric) {
            let initialYRange = chartModel.getYAxisRange() || new BlinkRange(null, null);
            let yAxisRangeItem = new ChartConfigRangeItemComponent(
                strings.charts.chartEditor.Y_AXIS_RANGE,
                util.debounce(
                    (start: number, end: number) => {
                        if (chartZoomComponent !== void 0) {
                            chartZoomComponent.zoomOut();
                        }
                        let yAxisRange = new BlinkRange(start, end);
                        chartModel.setYAxisRange(yAxisRange);
                        chart.setYAxisRange(yAxisRange, chartModel);
                        if (chartZoomComponent !== void 0) {
                            chartZoomComponent.setDisabled(chartModel.hasUserDefinedYAxisRange());
                        }
                    },
                    200
                ),
                initialYRange.min,
                initialYRange.max,
                'bk-y-axis-range'
            );
            chartConfigItems.push(yAxisRangeItem);
        }
    }

    if (allowedConfigurations.geoProjectionType) {
        let chartProjectionType: string = chart.getProjectionType();
        let chartProjectionTypes: Array<string> = [
            blinkConstants.geo3dProjectionTypes.GLOBE,
            blinkConstants.geo3dProjectionTypes.MAP,
            blinkConstants.geo3dProjectionTypes.PERSPECTIVE_PLANE
        ];
        let addGeoEarchSelector = new ChartConfigSelectorItemComponent(
            chartProjectionTypes,
            chartProjectionTypes.indexOf(chartProjectionType),
            () => {
                util.executeInNextEventLoop(function(){
                    chart.setProjectionType(chartProjectionType);
                });
            },
            false,
            '',
            'bk-chart-projection-selector'
        );
        chartConfigItems.push(addGeoEarchSelector);
    }

    return new ChartConfigComponent(chartConfigItems);
}
