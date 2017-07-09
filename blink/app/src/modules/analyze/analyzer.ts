/**
 * Copyright: ThoughtSpot Inc. 2017
 *
 * Analyzer component analyses LogicalTable and recommends improvements to better model the
 * logical table to improve search and thoughtspot usage experience.
 * Author: Manoj Ghosh (manoj.ghosh@thoughtpsot.com)
 */

import {BaseComponent} from '../../base/base-types/base-component';
import {Component, ngRequire} from '../../base/decorators';
import {AccordionListComponent} from '../../common/widgets/accordion/accordion-list';
import {ChasmTrapAnalyzerComponent} from './rules/chasm-trap';
import {CommonPrefixAnalyzerComponent} from './rules/common-prefix';
import {HighColumnNumbersAnalyzerComponent} from './rules/high-column-numbers';
import {HighIndexedColumnNumbersAnalyzerComponent} from './rules/high-indexed-column-numbers';
import {LongColumnNamesAnalyzerComponent} from './rules/long-column-names';
import {LongTableNameAnalyzerComponent} from './rules/long-table-name';
import {SystemKeywordsAnalyzerComponent} from './rules/system-keywords';
import {Violation, ViolationConstants} from './violation';
import {Violations} from './violations';

import IPromise = angular.IPromise;

let metadataService = ngRequire('metadataService');

@Component({
    name: 'bkAnalyzer',
    templateUrl: 'src/modules/analyze/analyzer.html'
})
export class AnalyzerComponent extends BaseComponent {

    public static isSaveDisabled: boolean = true;

    public showSaveBtn: boolean = true;
    public isReady: boolean = false;
    public isSaving: boolean = false;
    public totalViolationsCount: number = 0;
    public violations: Violations;
    public id: string;
    public fetchCount: number = 0;

    // Specific Analyzer Components which represent their display models
    public longTableNameAnalyzer: LongTableNameAnalyzerComponent;
    public longColumnNamesAnalyzer: LongColumnNamesAnalyzerComponent;
    public chasmTrapAnalyzer: ChasmTrapAnalyzerComponent;
    public highColumnNumbersAnalyzer: HighColumnNumbersAnalyzerComponent;
    public highIndexedColumnNumbersAnalyzer: HighIndexedColumnNumbersAnalyzerComponent;
    public systemKeywordsAnalyzer: SystemKeywordsAnalyzerComponent;
    public commonPrefixAnalyzer: CommonPrefixAnalyzerComponent;

    // Logical Table model and controller.
    private logicalModel: any;
    private onSaveFromAnalyzer: Function;

    private type: string;
    private subType: string;
    private accordionListComponent: AccordionListComponent;
    private tableName : string;

    constructor(onSaveFromAnalyzer: Function,
                logicalModel: any) {
        super();
        this.onSaveFromAnalyzer = onSaveFromAnalyzer;
        this.logicalModel = logicalModel;
        this.type = logicalModel.getMetadataType();
        this.subType = logicalModel.getMetadataSubType();
        this.id = logicalModel.getId();
        this.isReady = false;
        this.tableName = logicalModel.getName();
    }

    public saveTable() {
        this.isSaving = true;
        this.onSaveFromAnalyzer(this.tableName);
    }

    public isSaveDisabled() {
        return AnalyzerComponent.isSaveDisabled;
    }

    /**
     * Refresh the analysis suggestions. This fetches the suggestions from callosum
     * and then refreshes the display models.
     */
    public fetchRemarks(): IPromise<any> {
        this.fetchCount++;
        return this.getViolations()
            .then(violations => {
                this.violations = violations;
                this.initDisplayModels();
                this.isReady = true;
            });
    }

    /**
     * Initialize the display models
     */
    private initDisplayModels(): void {
        if (!!this.violations) {
            this.totalViolationsCount = this.violations.totalCount();
        }
        if (!!this.violations.violationsByType) {
            this.updateAnalyzers();
        }
        AnalyzerComponent.isSaveDisabled = true;
    }

    /**
     * Reinitialize individual suggestion group controllers.
     */
    private updateAnalyzers(): void {
        let ruleTypes = Object.keys(this.violations.violationsByType);
        this.resetAnalyzers();
        this.showSaveBtn = false;
        ruleTypes.forEach((ruleType) => {
            let ruleTypeViolations = this.violations.violationsByType[ruleType];
            switch (ruleType) {
                case ViolationConstants.ruleTypes.MaxLengthExceeded:
                    this.initMaxLengthExceededAnalyzer(ruleTypeViolations);
                    this.showSaveBtn = true;
                    break;
                case ViolationConstants.ruleTypes.ContainsPrefix:
                    this.initCommonPrefixAnalyzer(ruleTypeViolations);
                    this.showSaveBtn = true;
                    break;
                case ViolationConstants.ruleTypes.ChasmTrapQueryExists:
                    this.initChasmTrapAnalyzer();
                    break;
                case ViolationConstants.ruleTypes.ContainsSearchKeywords:
                    this.initSystemKeywordsAnalyzer(ruleTypeViolations);
                    this.showSaveBtn = true;
                    break;
                case ViolationConstants.ruleTypes.ColumnsLimitExceeded:
                    this.initHighColumnNumbersAnalyzer(ruleTypeViolations);
                    break;
                case ViolationConstants.ruleTypes.IndexedColumnsLimitExceeded:
                    this.initHighIndexedColumnNumbersAnalyzer(ruleTypeViolations);
                    break;
                default:
                // do nothing.
            }
        });
    }

    /**
     * Reset the controllers.
     */
    private resetAnalyzers(): void {
        this.accordionListComponent = new AccordionListComponent(true);
        this.longTableNameAnalyzer = null;
        this.longColumnNamesAnalyzer = null;
        this.chasmTrapAnalyzer = null;
        this.highColumnNumbersAnalyzer = null;
        this.highIndexedColumnNumbersAnalyzer = null;
        this.systemKeywordsAnalyzer = null;
        this.commonPrefixAnalyzer = null;
    }

    /**
     * Get violations from callosum
     * @return {any}
     */
    private getViolations(): IPromise<Violations> {
        return metadataService.analyze(
            this.type,
            this.subType,
            this.id)
            .then(response => {
                return new Violations(response.data);
            });
    }

    /**
     * Initialize the table, column name length exceeded analyzer.
     * @param namingViolations
     */
    private initMaxLengthExceededAnalyzer(namingViolations: Violation[]): void {

        // If table name exceeded, then initialize that analyzer.
        let tableNameViolation = namingViolations.find(
            violation => violation.violationMessage.type
            === ViolationConstants.metadataTypes.LogicalTable
        );

        if (!!tableNameViolation) {
            this.longTableNameAnalyzer = new LongTableNameAnalyzerComponent(
                this.onTableNameChange,
                this.logicalModel,
                tableNameViolation,
                this.accordionListComponent);
        } else {
            this.longTableNameAnalyzer = null;
        }

        // column names exceeded then initialize its analyzer
        let longColumnViolations = namingViolations.filter(
            violation => {
                if (violation.violationMessage.type
                    === ViolationConstants.metadataTypes.LogicalColumn) {
                    return violation;
                }
            }
        );

        if (!!longColumnViolations && longColumnViolations.length > 0) {
            this.longColumnNamesAnalyzer = new LongColumnNamesAnalyzerComponent(
                this.logicalModel,
                longColumnViolations,
                this.accordionListComponent,
            );

        } else {
            this.longColumnNamesAnalyzer = null;
        }
    }

    private initCommonPrefixAnalyzer(commonPrefixViolations: Violation[]): void {
        this.commonPrefixAnalyzer = new CommonPrefixAnalyzerComponent(
            this.logicalModel,
            commonPrefixViolations,
            this.accordionListComponent);
    }

    private initSystemKeywordsAnalyzer(systemKeyWordsViolations: Violation[]): void {
        this.systemKeywordsAnalyzer = new SystemKeywordsAnalyzerComponent(
            this.logicalModel,
            systemKeyWordsViolations,
            this.accordionListComponent
        );
    }

    private initHighColumnNumbersAnalyzer(ruleTypeViolations: Violation[]): void {
        this.highColumnNumbersAnalyzer =
            new HighColumnNumbersAnalyzerComponent(
                ruleTypeViolations.first(),
                this.accordionListComponent);
    }

    private initHighIndexedColumnNumbersAnalyzer(ruleTypeViolations: Violation[]): void {
        this.highIndexedColumnNumbersAnalyzer =
            new HighIndexedColumnNumbersAnalyzerComponent(
                ruleTypeViolations.first(),
                this.accordionListComponent);
    }

    private initChasmTrapAnalyzer(): void {
        this.chasmTrapAnalyzer = new ChasmTrapAnalyzerComponent(
            this.accordionListComponent);
    }

    private onTableNameChange = (newTableName: string) => {
        if (newTableName.length === 0) {
            this.tableName = this.logicalModel.getName();
        } else {
            this.tableName = newTableName;
        }
        AnalyzerComponent.isSaveDisabled = false;
    }
}


