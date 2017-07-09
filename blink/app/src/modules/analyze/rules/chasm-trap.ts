/**
 * Copyright: ThoughtSpot Inc. 2017
 *
 * Analyzer Component to display chasm issue.
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {AccordionItemComponent} from '../../../common/widgets/accordion/accordion-item';
import {AccordionListComponent} from '../../../common/widgets/accordion/accordion-list';

@Component({
    name: 'bkChasmTrapAnalyzer',
    templateUrl: 'src/modules/analyze/rules/chasm-trap.html'
})
export class ChasmTrapAnalyzerComponent extends BaseComponent {

    public accordionItem: AccordionItemComponent;
    private accordionList: AccordionListComponent;

    /**
     * Empty constructor. Just initializing this class will display the chasm query help in the
     * Analyzer view.
     */
    constructor(accordionList: AccordionListComponent) {
        super();
        this.accordionList = accordionList;
        this.init();
    }

    private init() {
        this.initAccordion();
    }

    private initAccordion() {
        this.accordionItem = new AccordionItemComponent(
            this.accordionList,
            this.getHeader(),
            null,
            null,
            true
        );
    }

    private getHeader(): string {
        // using template literals. back-tick.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
        return `${this.strings.analyze.chasmTrapAnalyzer.title} \(1\)`;
    }
}
