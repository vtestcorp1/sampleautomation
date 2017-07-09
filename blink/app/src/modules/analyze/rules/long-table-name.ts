/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 *
 * Analyzer component to display long table name
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {AccordionItemComponent} from '../../../common/widgets/accordion/accordion-item';
import {AccordionListComponent} from '../../../common/widgets/accordion/accordion-list';
import {Violation, ViolationConstants} from '../violation';

@Component({
    name: 'bkLongTableNameAnalyzer',
    templateUrl: 'src/modules/analyze/rules/long-table-name.html'
})
export class LongTableNameAnalyzerComponent extends BaseComponent {

    public tableName: string;
    public tableNameLength: number = 0;
    public recommendedLength: number = 50;
    public status: string;

    public accordionItem: AccordionItemComponent;
    private accordionList: AccordionListComponent;

    private logicalModel: any;
    private onTableNameChange: Function;

    constructor(onTableNameChange: Function,
                logicalModel: any,
                violation: Violation,
                accordionList: AccordionListComponent) {
        super();
        this.onTableNameChange = onTableNameChange;
        this.logicalModel = logicalModel;
        this.tableName = logicalModel.getName();
        this.recommendedLength = Number(violation.violationMessage.recommendedValue);
        this.accordionList = accordionList;
        this.init();
    }

    public onChange(): void {
        this.setStatus();
        this.onTableNameChange(this.tableName);
    }

    private init(): void {
        this.setStatus();
        this.initAccordion();
    }

    private setStatus(): void {
        this.tableNameLength = this.tableName.length;
        this.status = (this.tableNameLength <= this.recommendedLength) ?
            ViolationConstants.status.Pass :
            ViolationConstants.status.Fail;
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
        return `${this.strings.analyze.longTableNameAnalyzer.title} \(1\)`;
    }
}
