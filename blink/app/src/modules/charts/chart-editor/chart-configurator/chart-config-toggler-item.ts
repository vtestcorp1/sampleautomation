/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component for toggler in chart config items.
 */

import {Component} from '../../../../base/decorators';
import CheckboxComponent from '../../../../common/widgets/checkbox/checkbox';
import {ChartConfigItemComponent} from './chart-config-item';

@Component({
    name: 'bkChartConfigTogglerItem',
    templateUrl: 'src/modules/charts/chart-editor/chart-configurator/chart-config-toggler-item.html'
})
export class ChartConfigTogglerItemComponent extends ChartConfigItemComponent {
    public chartTogglerCBCtrl: any;
    private state: boolean;
    constructor(
        title: string,
        initState: boolean,
        onToggleCallback: (boolean) => void,
        cssClass: string
    ) {
        super(ChartConfigItemComponent.TYPES.TOGGLER, cssClass);
        this.state = initState;
        this.chartTogglerCBCtrl = new CheckboxComponent(title, () => this.state)
            .setOnClick(($event) => {
                this.state = !this.state;
                onToggleCallback(this.state);
            });
    }
}
