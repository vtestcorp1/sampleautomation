/**
 * Copyright: ThoughtSpot Inc. 2017
 *
 * Analyzer component to display and fix long column names
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {AccordionItemComponent} from '../../../common/widgets/accordion/accordion-item';
import {AccordionListComponent} from '../../../common/widgets/accordion/accordion-list';
import {AnalyzerComponent} from '../analyzer';
import {Violation, ViolationConstants} from '../violation';

@Component({
    name: 'bkLongColumnNamesAnalyzer',
    templateUrl: 'src/modules/analyze/rules/long-column-names.html'
})
export class LongColumnNamesAnalyzerComponent extends BaseComponent {

    public recommendedLength: number = 30;
    public longColumns: Array<any>;

    public accordionItem: AccordionItemComponent;
    private accordionList: AccordionListComponent;

    private logicalModel: any;
    private violations: Violation[] = [];

    constructor(logicalModel: any,
                violations: Violation[],
                accordionList: AccordionListComponent) {
        super();
        this.logicalModel = logicalModel;
        this.violations = violations;
        this.accordionList = accordionList;
        this.init();
    }

    public onChange = (changedColumn) => {
        changedColumn.status = this.getStatus(changedColumn.newName);
        if (changedColumn.newName.length > 0) {
            changedColumn.origColumn.setName(changedColumn.newName);
            AnalyzerComponent.isSaveDisabled = false;
        } else {
            // if user leaves the column name empty, reset with original name.
            changedColumn.origColumn.setName(changedColumn.originalName);
        }
    }

    private init() {

        let columnsMap = this.logicalModel.getColumnsMap();
        this.longColumns = this.violations.map(violation => {
            let column = columnsMap[violation.violationMessage.id];
            this.recommendedLength = Number(violation.violationMessage.recommendedValue);
            return {
                id: column.getGuid(),
                originalName: column.getName(),
                newName: column.getName(),
                status: this.getStatus(column.getName()),
                origColumn: column
            };
        });

        this.initAccordion();
    }

    private getStatus(columnName): string {
        return (columnName.length <= this.recommendedLength) ?
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
        return `${this.strings.analyze.longColumnNamesAnalyzer.title}
                      \(${this.violations.length}\)`;
    }
}
