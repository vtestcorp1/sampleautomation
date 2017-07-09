/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A component for items in multi-section-list-component
*/

import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';
import {MultiSectionListComponent} from '../multi-section-list-component';

export interface IMultiSectionListItemComponent {
    getItemName(): string;
    getItemSubtext(): string;
    getActionLabel(): string;
    handleAction(): void;
}

@Component({
    name: 'bkMultiSectionListItem',
    templateUrl: 'src/common/widgets/multi-section-list/' +
                 'multi-section-list-item/multi-section-list-item.html',
    require: '^bkMultiSectionList',
    transclude: true,
    directives: [MultiSectionListComponent]
})
export class MultiSectionListItemComponent extends BaseComponent {
}
