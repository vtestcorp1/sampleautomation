/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to view/edit chart config items.
 * Eg. Show data labels, show Y Axis as % are togglers.
 * Geo earth projection type is a selector.
 */

import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {ChartConfigItemComponent} from './chart-config-item';

@Component({
    name: 'bkChartConfig',
    templateUrl: 'src/modules/charts/chart-editor/chart-configurator/chart-config.html'
})
export class ChartConfigComponent extends BaseComponent {
    public chartConfigItems: Array<ChartConfigItemComponent>;

    constructor(
        chartConfigItems: Array<ChartConfigItemComponent>
    ) {
        super();
        this.chartConfigItems = chartConfigItems;
    }
}
