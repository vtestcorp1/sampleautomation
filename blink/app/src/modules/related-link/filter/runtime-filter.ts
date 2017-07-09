/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';

/**
 * Runtime filter component displays runtime filter panel in a related link page.
 * this helps customers see what all filters have been applied to a destination.
 */
@Component({
    name: 'bkRuntimeFilter',
    templateUrl: 'src/modules/related-link/filter/runtime-filter.html'
})
export class RuntimeFilterComponent extends BaseComponent {

    public runtimeFilterList : Array<any> = [];
    public isReadOnly = true;
    public filterRow : any;

    constructor (filterRow?) {
        super();
        this.init(filterRow);
    }

    public init(filterRow?) {
        this.filterRow = filterRow;
        if (!!filterRow) {
            this.runtimeFilterList = filterRow.panel;
        } else {
            this.runtimeFilterList = [];
        }
    }
}

