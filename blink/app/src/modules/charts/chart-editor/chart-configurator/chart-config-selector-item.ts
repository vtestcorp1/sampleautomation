/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component for selector in chart config items.
 */

import {Component} from '../../../../base/decorators';
import {ChartConfigItemComponent} from './chart-config-item';

let templatePath = 'src/modules/charts/chart-editor/chart-configurator/' +
    'chart-config-selector-item.html';

@Component({
    name: 'bkChartConfigSelectorItem',
    templateUrl: templatePath
})
export class ChartConfigSelectorItemComponent extends ChartConfigItemComponent {
    public selectedOption: string;
    public isDisabled: boolean;
    public onSelectionChange: (string) => void;
    public placeholder: string;
    public selectOptions: Array<string>;

    constructor(
        selectOptions: Array<string>,
        selectedIndex: number,
        onSelectionChange: (string) => void,
        isDisabled: boolean,
        placeholder: string,
        cssClass: string
    ) {
        super(ChartConfigItemComponent.TYPES.SELECTOR, cssClass);

        this.selectOptions = selectOptions;
        this.selectedOption = selectOptions[selectedIndex];
        this.onSelectionChange = onSelectionChange;
        this.isDisabled = isDisabled;
        this.placeholder = placeholder;
    }
}
