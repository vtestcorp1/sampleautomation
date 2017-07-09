/**
 * Copyright: ThoughtSpot Inc. 2017
 *
 * Analyzer component to display high number of indexed columns
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {AccordionItemComponent} from '../../../common/widgets/accordion/accordion-item';
import {AccordionListComponent} from '../../../common/widgets/accordion/accordion-list';
import {Violation, ViolationConstants} from '../violation';

@Component({
    name: 'bkHighIndexedColumnNumbersAnalyzer',
    templateUrl: 'src/modules/analyze/rules/high-indexed-column-numbers.html'
})
export class HighIndexedColumnNumbersAnalyzerComponent extends BaseComponent {

    public recommendedColumnsNumber: number = 100;
    public columnsNumber: number = 0;
    public columnStatus: string;
    public accordionItem: AccordionItemComponent;
    private accordionList: AccordionListComponent;
    private violation: Violation;

    constructor(violation: Violation,
                accordionList: AccordionListComponent) {
        super();
        this.violation = violation;
        this.accordionList = accordionList;
        this.init();
    }

    private init(): void {
        this.columnsNumber = Number(this.violation.violationMessage.actualValue);
        this.recommendedColumnsNumber = Number(this.violation.violationMessage.recommendedValue);
        this.setStatus();
        this.initAccordion();
    }

    private setStatus(): void {
        this.columnStatus =
            (this.columnsNumber <= this.recommendedColumnsNumber) ?
                ViolationConstants.status.Pass : ViolationConstants.status.Fail;
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
        return `${this.strings.analyze.highColumnNumbersAnalyzer.indexedColumnsTitle} \(1\)`;
    }
}
