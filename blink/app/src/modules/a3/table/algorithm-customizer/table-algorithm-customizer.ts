/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Gunjan Jha (gunjan.jha@thoughtspot.com)
 *
 * @fileoverview This component customizes the algorithm for
 * a3 table analysis.
 * Currently only Viz Analysis algorithm parameters are customized.
 * Min rows and multiplier (sigma).
 */

'use strict';

import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {strings} from '../../../../base/strings';
import {A3TableAnalysisCustomizerComponent}
    from '../analysis-customizer/a3-table-analysis-customizer';

/**
 * Table Algorithm customizer component
 */
@Component({
    name: 'bkTableAlgorithmCustomizer',
    templateUrl: 'src/modules/a3/table/algorithm-customizer/table-algorithm-customizer.html'
})
export class TableAlgorithmCustomizerComponent extends BaseComponent {

    public isInputInvalid: boolean;
    public invalidInputMessageString: string;

    private a3AnalysisRequest: any;
    private minRows: number;
    private multiplier: string;
    private a3TableAnalysisCustomizerComponent: A3TableAnalysisCustomizerComponent;

    public constructor(a3AnalysisRequest,
                       a3TableAnalysisCustomizerComponent: A3TableAnalysisCustomizerComponent) {
        super();
        this.a3AnalysisRequest = a3AnalysisRequest;
        this.a3TableAnalysisCustomizerComponent = a3TableAnalysisCustomizerComponent;

        this.initializeDefaults();
        this.populateValuesFromA3Request();

        this.isInputInvalid = false;
        this.invalidInputMessageString = '';
    }

    public trigger() {
        this.a3TableAnalysisCustomizerComponent.trigger();
    }

    public updateA3Request() : boolean {

        let analysisParam = new tsProto.sage.AnalysisParam();
        let analysisDescriptor = new tsProto.sage.AnalysisDescriptor();
        let analysisAlgorithm = new tsProto.sage.AnalysisAlgorithm();

        let theMultiplier = this.getMultiplier();

        if (false === this.verifyMultiplier()) {
            return false;
        }
        if (false === this.verifyMinRows()) {
            return false;
        }

        let analysisClass =
            tsProto.sage.AnalysisDescriptor.AnalysisClass.OUTLIER_DETECTION;
        analysisDescriptor.setAnalysisClass(analysisClass);

        let outlierDetection = new tsProto.sage.AnalysisDescriptor.OutlierDetection();

        analysisAlgorithm.setType(tsProto.sage.AnalysisAlgorithm.Type.STDEV_MEAN);
        let stdevMean = new tsProto.sage.AnalysisAlgorithm.StdevMean();
        stdevMean.setMinRows(Math.floor(this.minRows));
        stdevMean.setMultiplier(theMultiplier);
        analysisAlgorithm.setStdevMean(stdevMean);
        outlierDetection.setAlgorithm(analysisAlgorithm);
        analysisDescriptor.setOutlierDetection(outlierDetection);
        analysisParam.setAnalysisDescriptor(analysisDescriptor);

        let tableAnalysis = this.a3AnalysisRequest.getTableAnalysis();
        tableAnalysis.setParam(analysisParam);
        this.a3AnalysisRequest.setTableAnalysis(tableAnalysis);

        return true;
    }

    public verifyMinRows() : boolean {
        return this.verifyNumber(strings.a3.Min_Rows, this.minRows);
    }

    public verifyMultiplier() : boolean {
        let theNumber = this.getMultiplier();
        if (theNumber === -1) {
            return true;
        }

        return this.verifyNumber(strings.a3.Multiplier, theNumber);
    }

    public getMultiplier() : number {
        if (this.multiplier === '' || this.multiplier === 'undefined') {
            return -1;
        }
        return parseFloat(this.multiplier);
    }

    private verifyNumber(name: string, value: number) : boolean {
        if (typeof value === 'undefined' || value === null || isNaN(value)
            || value < 0) {
            this.invalidInputMessageString = strings.a3.Invalid_Number_Input.assign(name);
            this.isInputInvalid = true;
        } else {
            this.invalidInputMessageString = '';
            this.isInputInvalid = false;
        }
        return false === this.isInputInvalid;
    }

    private initializeDefaults() {
        this.minRows = 5;
        this.multiplier = '';
    }

    private populateValuesFromA3Request() {
        let tableAnalysis = this.a3AnalysisRequest.getTableAnalysis();
        if (tableAnalysis === null) {
            return;
        }
        let analysisParam = tableAnalysis.getParam();

        if (analysisParam === null) {
            return;
        }

        let analysisDescriptor = analysisParam.getAnalysisDescriptor();
        let outlierDetection = analysisDescriptor.getOutlierDetection();
        let analysisAlgorithm = outlierDetection.getAlgorithm();

        if (analysisAlgorithm.getType() !== tsProto.sage.AnalysisAlgorithm.Type.STDEV_MEAN ||
            analysisDescriptor.getAnalysisClass() !==
            tsProto.sage.AnalysisDescriptor.AnalysisClass.OUTLIER_DETECTION) {
            return;
        }

        let stdevMean = analysisAlgorithm.getStdevMean();
        this.minRows = Math.floor(stdevMean.getMinRows());
        let theMultiplier = stdevMean.getMultiplier();
        if (theMultiplier < 0) {
            this.multiplier = '';
        } else {
            this.multiplier = theMultiplier.toLocaleString();
        }
    }
}
