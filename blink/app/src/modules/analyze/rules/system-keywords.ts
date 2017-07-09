/**
 * Copyright: ThoughtSpot Inc. 2017
 *
 * Analyzer component to display and fix columns having system reserved keywords
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {AccordionItemComponent} from '../../../common/widgets/accordion/accordion-item';
import {AccordionListComponent} from '../../../common/widgets/accordion/accordion-list';
import {AnalyzerComponent} from '../analyzer';
import {Violation, ViolationConstants} from '../violation';

@Component({
    name: 'bkSystemKeywordsAnalyzer',
    templateUrl: 'src/modules/analyze/rules/system-keywords.html'
})
export class SystemKeywordsAnalyzerComponent extends BaseComponent {

    public systemKeywordsColumns: Array<any>;
    public accordionItem: AccordionItemComponent;
    private accordionList: AccordionListComponent;
    private logicalModel: any;
    private violations: Array<Violation>;

    constructor(logicalModel: any,
                systemKeyWordsViolations: Array<Violation>,
                accordionList: AccordionListComponent) {
        super();
        this.logicalModel = logicalModel;
        this.violations = systemKeyWordsViolations;
        this.accordionList = accordionList;
        this.init();
    }

    public onChange = (changedColumn) => {
        if (changedColumn.newName.length > 0
            && changedColumn.newName !== changedColumn.originalName) {
            changedColumn.origColumn.setName(changedColumn.newName);
            AnalyzerComponent.isSaveDisabled = false;
        } else {
            // if user leaves the column name empty, reset with original name.
            // even if we d'ont set this, the backend code ignores empty name to be set without
            // throwing exception so we are good either way. better be safe here.
            changedColumn.origColumn.setName(changedColumn.originalName);
        }
    }

    private init() {
        let columnsMap = this.logicalModel.getColumnsMap();
        this.systemKeywordsColumns = this.violations.map(violation => {
            let column = columnsMap[violation.violationMessage.id];
            return {
                id: column.getGuid(),
                originalName: column.getName(),
                newName: column.getName(),
                status: ViolationConstants.status.Fail,
                keywords: violation.violationMessage.keywords,
                keywordsString: violation.violationMessage.keywords.join(', '),
                origColumn: column
            };
        });
        this.initAccordion();
    }

    private initAccordion() {
        this.accordionItem = new AccordionItemComponent(
            this.accordionList,
            this.getHeader(),
            null /** no description **/,
            null,
            true
        );
    }

    private getHeader(): string {
        // using template literals. back-tick.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
        return `${this.strings.analyze.systemKeywords.title} \(${this.violations.length}\)`;
    }
}
