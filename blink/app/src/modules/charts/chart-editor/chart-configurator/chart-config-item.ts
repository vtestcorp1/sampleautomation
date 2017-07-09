/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Base component to switch between chart config items.
 */

import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';

@Component({
    name: 'bkChartConfigItem',
    templateUrl: 'src/modules/charts/chart-editor/chart-configurator/chart-config-item.html'
})
export class ChartConfigItemComponent extends BaseComponent {
    public static TYPES = {
        TOGGLER: 'toggler',
        SELECTOR: 'selector',
        RANGE: 'range'
    };
    public type: string;
    public cssClass: string;

    constructor(
        type: string,
        cssClass: string
    ) {
        super();
        this.type = type;
        this.cssClass = cssClass;
    }
}
