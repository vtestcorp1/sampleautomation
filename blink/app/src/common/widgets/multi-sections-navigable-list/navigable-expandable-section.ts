
import {Component}   from '../../../base/decorators';

import _ from 'lodash';
import {Item, NavigableSectionComponent} from './navigable-section';
import IPromise = angular.IPromise;

@Component({
    name: 'bkMultiExpandableSection',
    templateUrl: 'src/common/widgets/multi-sections-navigable-list/navigable-section.html'
})
export default class MultiExpandableSectionComponent extends NavigableSectionComponent {

    private isFetching = false;
    private limitTo;

    constructor (
        // contents
        items: Item[],
        headerTitle: string,
        // callback
        itemClickedHandler = _.noop,
        itemTemplateUrl =
            'src/common/widgets/multi-sections-navigable-list/base-item-template.html',

        // paging
        // callback needs to update the items
        private getMoreCompletions: () => IPromise<any> = null,
        private isFullyExpanded = false,
        private allowExpansion = true,
        private pageSize: number = 5
    ) {
        super(items, headerTitle, itemClickedHandler, itemTemplateUrl);
        this.limitTo = pageSize;
    }

    public getNumberOfVisibleItems() {
        return this.isFullyExpanded
            ?  this.items.length
            : (this.items.length > this.pageSize) ?
                this.pageSize : this.items.length;
    }

    public viewAllClicked = () => {
        this.isFetching = true;
        return this.getMoreCompletions().then(this.expandView).finally(() => {
            this.isFetching = false;
        });
    }

    public resetState() {
        this.isFullyExpanded = false;
        this.limitTo = this.pageSize;
    }

    public getHiddenItemsCount() {
        return Math.max(0, this.items.length - this.pageSize);
    }

    public showExpansionButton() {
        return this.isFetching || (this.allowExpansion && this.getHiddenItemsCount() > 0);
    }

    protected updateItems(items: any[]) {
        this.items = items;
    }

    private expandView = (items: any[]) => {
        this.isFullyExpanded = true;
        this.limitTo = this.items.length;
        this.updateItems(items);
    }
}
