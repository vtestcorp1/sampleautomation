/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component for range definition in chart config items.
 */

import _ from 'lodash';
import {Component} from '../../../../base/decorators';
import {ChartConfigItemComponent} from './chart-config-item';

let templatePath = 'src/modules/charts/chart-editor/chart-configurator/' +
    'chart-config-range-item.html';

@Component({
    name: 'bkChartConfigRangeItem',
    templateUrl: templatePath
})
export class ChartConfigRangeItemComponent extends ChartConfigItemComponent {
    public title: string;
    public onValueChange: Function;
    public start: number;
    public end: number;

    constructor(
        title: string,
        onValueChange: Function,
        start: number,
        end: number,
        cssClass: string
    ) {
        super(ChartConfigItemComponent.TYPES.RANGE, cssClass);

        this.title = title;
        this.onValueChange = onValueChange;
        this.start = start;
        this.end = end;
    }

    public onChange() {
        let start = parseInt(this.start ? this.start.toString() : null);
        let end = parseInt(this.end ? this.end.toString() : null);
        if (start >= end) {
            return;
        }
        if (_.isNaN(start)) {
            start = null;
        }
        if (_.isNaN(end)) {
            end = null;
        }

        this.onValueChange(start, end);
    }
}
