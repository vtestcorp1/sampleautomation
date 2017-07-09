/**
 * Created by rahul.balakavi on 12/20/16.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';

@Component({
    name: 'bkAccordionListViewer',
    templateUrl: 'src/common/widgets/accordion-list-viewer/accordion-list-viewer.html',
    transclude: true
})
export class AccordionListViewerComponent extends BaseComponent {
    private itemList: AccordionListViewerItemComponent[] = [];
    constructor(
        private expandMultipleItems: boolean) {
        super();
    }

    public addItem(accordionItem: AccordionListViewerItemComponent) {
        this.itemList.push(accordionItem);
    }

    public collapseAll() {
        for (let item of this.itemList) {
            item.collapse();
        }
    }

    public canExpandMultipleItems(): boolean {
        return this.expandMultipleItems;
    }
}

@Component({
    name: 'bkAccordionListViewerItem',
    templateUrl: 'src/common/widgets/accordion-list-viewer/accordion-list-viewer-item.html',
    transclude: true
})
export class AccordionListViewerItemComponent extends BaseComponent {
    constructor(
        private accordionListViewer: AccordionListViewerComponent,
        private header: string,
        private description: string,
        private contentTpl: string,
        private expanded: boolean) {
        super();
        accordionListViewer.addItem(this);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public click() {
        if( !this.accordionListViewer.canExpandMultipleItems()
            && this.expanded === false) {
            this.accordionListViewer.collapseAll();
        }
        this.expanded = !this.expanded;
    }

    public collapse() {
        this.expanded = false;
    }
}
