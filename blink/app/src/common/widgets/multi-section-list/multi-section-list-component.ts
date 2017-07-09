/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A component to render a list of components organized
 * as named sections.
 */
import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';

@Component({
    name: 'bkMultiSectionList',
    templateUrl: 'src/common/widgets/multi-section-list/multi-section-list.html',
    transclude: true
})
export class MultiSectionListComponent extends BaseComponent {
    constructor() {
        super();
    }
}

