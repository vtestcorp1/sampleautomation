/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 *
 * Analyzer component to display columns that have common prefix.
 * Common prefixes hard to disambiguate during search.
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {debounce} from '../../../base/utils/ts-utils';
import {AccordionItemComponent} from '../../../common/widgets/accordion/accordion-item';
import {AccordionListComponent} from '../../../common/widgets/accordion/accordion-list';
import {AnalyzerComponent} from '../analyzer';
import {Violation, ViolationConstants} from '../violation';

@Component({
    name: 'bkCommonPrefixAnalyzer',
    templateUrl: 'src/modules/analyze/rules/common-prefix.html'
})
export class CommonPrefixAnalyzerComponent extends BaseComponent {

    public recommendedLength: number = 20;
    public isSaveDisabled: boolean = true;
    public commonPrefixGroups: Array<any>;
    public accordionItem: AccordionItemComponent;
    private accordionList: AccordionListComponent;
    private logicalModel: any;
    private violations: Array<Violation>;

    /**
     * Finds the common prefix of a array of column names.
     * In order to protect from cpu burn we only analyze max of 10 columns.
     *
     * we sort the column names by their length, since the shortest column name is the max
     * prefix that can occur. We loop through the characters of the shortest column and find the
     * character match in each of the other columns. This way we can find the common prefix.
     *
     * @param columnNames
     * @return the common prefix.
     */
    public static commonPrefix(columnNames: string[]): string {

        if (!columnNames || columnNames.length > 10) {
            return '';
        }

        if (columnNames.length === 1) {
            return columnNames[0];
        }

        // to find a new common prefix of the column name group,
        // compare characters of the smallest string in other characters until we encounter the
        // first unmatched char.
        let sortedColumnsByLength = columnNames.sort(function (a, b) {
            // ASC  -> a.length - b.length
            return a.length - b.length;
        });

        let prefix : string = '';
        let index : number ;
        let colIndex : number;

        let shortestColumnName : string = sortedColumnsByLength[0];

        // loop through the characters of the shortest column
        for (index = 0; index < shortestColumnName.length; index++) {

            let toMatch = shortestColumnName[index];
            let isMatch = true;

            // compare with rest 1..n-1 columns
            for (colIndex = 1; colIndex < columnNames.length; colIndex++) {
                if (columnNames[colIndex][index] !== toMatch) {
                    // if there is a mismatch then we are done with finding prefix.
                    isMatch = false;
                    break;
                }
            }
            // if the character was found in all columns, add it to the prefix.
            if (isMatch === true) {
                prefix += toMatch;
            } else {
                break;
            }
        }
        return prefix;
    }

    /**
     * Initialize a component
     * @param logicalModel this is used to get the table / columns metadata
     * @param violations contains the violations of common prefix.
     */
    constructor(logicalModel: any,
                violations: Array<Violation>,
                accordionList: AccordionListComponent) {
        super();
        this.logicalModel = logicalModel;
        this.violations = violations;
        this.accordionList = accordionList;
        this.init();
    }

    // Debouncing enforces that a function not be called again until a certain amount of
    // time has passed without it being called.
    @debounce(200)
    public onColumnGroupChange(columnGroup): void {
        AnalyzerComponent.isSaveDisabled = false;
        this.saveColumnNames(columnGroup);
        columnGroup.status = this.getStatus(columnGroup);
    }

    public onChange(columnGroup) {
        this.onColumnGroupChange(columnGroup);
        columnGroup.isSaveDisabled = false;
    }

    public saveColumnNames(columnGroup): void {
        columnGroup.columns.forEach(column => {
            this.saveColumnName(column);
        });
    }

    private saveColumnName(changedColumn) : void {
        if (changedColumn.newName.length > 0) {
            changedColumn.origColumn.setName(changedColumn.newName);
        } else {
            // if user leaves the column name empty, reset with original name.
            changedColumn.origColumn.setName(changedColumn.originalName);
        }
    }

    private init(): void {
        let columnsMap = this.logicalModel.getColumnsMap();

        this.commonPrefixGroups = this.violations.map(violation => {
            this.recommendedLength = Number(violation.violationMessage.recommendedValue);
            return {
                commonPrefix: violation.violationMessage.commonPrefix,
                columns: violation.violationMessage.ids.map(columnId => {
                    let column = columnsMap[columnId];
                    return {
                        originalName: column.getName(),
                        newName: column.getName(),
                        origColumn: column
                    };
                }),
                isSaveDisabled: true,
                status: ViolationConstants.status.Fail,
            };
        });

        this.initAccordion();
    }

    private getStatus(columnGroup): string {
        // Find the new common prefix. Only check if the number of columns is less than 10.
        // If more than 10 columns in each set group, then we don't compute the new prefix on the
        // fly. This is protect against lots of cpu burn.
        if (columnGroup.columns.length <= 10) {
            let columns  = Object.values(columnGroup.columns); // columns here is a map
            let columnNames = columns.map(c => c.newName);
            let prefix = CommonPrefixAnalyzerComponent.commonPrefix(columnNames);
            columnGroup.commonPrefix = prefix;
            if (prefix.length <= this.recommendedLength) {
                return ViolationConstants.status.Pass;
            }
        }
        return ViolationConstants.status.Fail;
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
        return `${this.strings.analyze.commonPrefix.title} \(${this.violations.length}\)`;
    }
}

