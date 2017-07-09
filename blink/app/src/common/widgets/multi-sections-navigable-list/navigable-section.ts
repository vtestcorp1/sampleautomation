
import {BaseComponent} from '../../../base/base-types/base-component';
import {Component}   from '../../../base/decorators';

import _ from 'lodash';

export interface Item {
    title: string;
    subTitle: string;
}

@Component({
    name: 'bkNavigableSection',
    templateUrl: 'src/common/widgets/multi-sections-navigable-list/navigable-section.html'
})
export class NavigableSectionComponent extends BaseComponent {

    public highlightedItemIndex: number = -1;

    constructor (
        // contents
        protected items: any[],
        private headerTitle: string,
        // callback
        private itemClickedHandler = _.noop,
        private itemTemplateUrl =
            'src/common/widgets/multi-sections-navigable-list/base-item-template.html'
    ) {
        super();
    }

    public getNumberOfVisibleItems() {
        return this.items.length;
    }

    public onItemClicked(index: number) {
        this.itemClickedHandler(index);
    }

    public isItemHighlighted(idx: number):boolean  {
        return this.highlightedItemIndex === idx;
    }
}
