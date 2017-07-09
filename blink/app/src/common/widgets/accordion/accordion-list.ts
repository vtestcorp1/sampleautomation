/**
 * Copyright: ThoughtSpot Inc. 2017
 *
 * Accordion List Component to display list of collapsible sections.
 *
 * [
 * Accordion term is derived from a musical instrument which is played by compressing or
 * expanding the bellows while pressing buttons or keys, causing pallets to open, which allow
 * air to flow across strips of brass or steel, called reeds.  *
 * https://www.youtube.com/watch?v=ifHRDBx-ctw
 * ]
 *
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {AccordionItemComponent} from './accordion-item';

@Component({
    name: 'bkAccordionList',
    templateUrl: 'src/common/widgets/accordion/accordion-list.html',
    // In computer science, transclusion is the inclusion of a document or part of a document
    // into another document by reference. So in the context of Angular, transclusion would be
    // the embedding of an end user template into the directive template.
    transclude: true
})
export class AccordionListComponent extends BaseComponent {

    private expandMultipleItems: boolean = true;
    private items: AccordionItemComponent[] = [];

    /**
     * Contructor.
     * @param expandMultipleItems whether to allow expand all groups together or one at a time only.
     *  if true, we allow to expand each item independently. if false one item can be opened at
     *  a time.
     */
    constructor(expandMultipleItems: boolean) {
        super();
        this.expandMultipleItems = expandMultipleItems;
    }

    /**
     * Add a accordion item.
     * @param accordionItem
     */
    public addItem(accordionItem: AccordionItemComponent) {
        this.items.push(accordionItem);
    }

    /**
     * Collapse all accordion items.
     */
    public collapseAll() {
        for (let item of this.items) {
            item.collapse();
        }
    }

    /**
     * Setting to know whether to allow expanding more than one items at a time.
     * @return {boolean}
     */
    public canExpandMultipleItems(): boolean {
        return this.expandMultipleItems;
    }
}

