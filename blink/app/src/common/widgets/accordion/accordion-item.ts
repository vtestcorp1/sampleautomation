/**
 * Copyright: ThoughtSpot Inc. 2017
 *
 * Accordion Item Component represents a collapsible section.
 *
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {AccordionListComponent} from './accordion-list';

@Component({
    name: 'bkAccordionItem',
    templateUrl: 'src/common/widgets/accordion/accordion-item.html',
    transclude: true
})
export class AccordionItemComponent extends BaseComponent {

    private header: string;
    private description: string;
    private contentTemplate: string;
    private expanded: boolean = true;
    private accordionListComponent: AccordionListComponent;

    constructor(accordionListComponent: AccordionListComponent,
                header: string,
                description: string,
                contentTemplate: string,
                expanded: boolean) {
        super();
        this.accordionListComponent = accordionListComponent;
        this.header = header;
        this.description = description;
        this.contentTemplate = contentTemplate;
        this.expanded = expanded;
        this.accordionListComponent.addItem(this);
    }

    public isExpanded(): boolean {
        return this.expanded;
    }

    public click() {
        if (!this.accordionListComponent.canExpandMultipleItems()
            && this.expanded === false) {
            this.accordionListComponent.collapseAll();
        }
        this.expanded = !this.expanded;
    }

    public collapse() {
        this.expanded = false;
    }
}

