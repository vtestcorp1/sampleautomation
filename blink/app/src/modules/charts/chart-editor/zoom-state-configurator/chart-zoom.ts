/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This component allows to view/edit zoom state for chart.
 */

import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {ChartModel} from '../../../viz-layout/viz/chart/chart-model';

@Component({
    name: 'bkChartZoom',
    templateUrl: 'src/modules/charts/chart-editor/zoom-state-configurator/chart-zoom.html'
})
export class ChartZoomComponent extends BaseComponent {
    public disableTooltip: string;
    private chart: any;
    private chartModel: ChartModel;
    private disabled: boolean;

    constructor(
        chart: any,
        chartModel: ChartModel,
        disabled: boolean,
        disableTooltip: string
    ) {
        super();
        this.chart = chart;
        this.chartModel = chartModel;
        this.disabled = disabled;
        this.disableTooltip = disableTooltip;
    }

    public switchMode () {
        if (this.disabled) {
            return;
        }
        if (this.isInPanMode()) {
            this.chart.switchToZoomMode();
        }  else {
            this.chart.switchToPanMode();
        }

        this.chart.resetPointer();
    }

    public isInPanMode () : boolean {
        return this.chart && this.chart.isInPanMode();
    }

    public isZoomedIn () : boolean {
        return this.chartModel.isZoomedIn();
    }

    public zoomOut () {
        if (this.disabled) {
            return;
        }
        this.chart.zoomOut();
    }

    public isDisabled () : boolean {
        return this.disabled;
    }

    public setDisabled (state: boolean) {
        this.disabled = state;
    }

    public getTooltip() : string {
        return this.disabled ? this.disableTooltip : '';
    }
}
