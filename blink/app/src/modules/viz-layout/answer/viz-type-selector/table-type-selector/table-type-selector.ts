import _ from 'lodash';
import {BaseComponent} from '../../../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../../../base/decorators';
import {strings} from '../../../../../base/strings';

let jsonConstants = ngRequire('jsonConstants');
let templatePath: string = 'src/modules/viz-layout/answer/viz-type-selector/' +
    'table-type-selector/table-type-selector.html';

@Component({
    name: 'bkTableTypeSelector',
    templateUrl: templatePath
})

export class TableTypeSelectorComponent extends BaseComponent {
    public isSelected: boolean;
    public name: string;
    public onClick: Function;
    public tooltip: string;
    public vizType: string;

    constructor(isSelected: boolean,
                onSelection: Function
    ) {
        super();
        this.isSelected = isSelected;
        this.onClick = _.isFunction(onSelection) ? onSelection : _.noop;
        this.tooltip = strings.answerPage.vizTypeSelector.TABLE_SELECTOR_TOOLTIP;
        this.name = strings.TABLE;
        this.vizType = jsonConstants.VIZ_TYPE_TABLE;
    }
}
