/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to toggle locking of chart axis configuration.
 */

import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {ChartModel} from '../../../viz-layout/viz/chart/chart-model';

@Component({
    name: 'bkChartAxisLocker',
    templateUrl: 'src/modules/charts/chart-editor/chart-axis-locker/chart-axis-locker.html'
})
export class ChartAxisLockerComponent extends BaseComponent {
    private chartModel: ChartModel;

    constructor(
        chartModel: ChartModel
    ) {
        super();
        this.chartModel = chartModel;
    }

    public toggleConfigurationLock() {
        this.chartModel.toggleConfigurationLock();
    }

    public getIconPath() {
        return this.isConfigurationLocked()
            ? '/resources/img/viz-selector-icons/chart-icons/lock_closed_icon_24.svg'
            : '/resources/img/viz-selector-icons/chart-icons/lock_open_icon_24.svg';
    }

    private isConfigurationLocked(): boolean {
        return this.chartModel.isConfigurationLocked();
    }
}
