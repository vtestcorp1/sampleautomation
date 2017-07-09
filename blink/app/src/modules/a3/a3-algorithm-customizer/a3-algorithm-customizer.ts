/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Gunjan Jha (gunjan.jha@thoughtspot.com)
 *
 * @fileoverview This component customizes the algorithm for
 * a3 analysis.
 *
 */

'use strict';

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {A3AnalysisCustomizerComponent} from '../a3-analysis-customizer/a3-analysis-customizer';
import {isDiffAnalysis, isVizAnalysis} from '../a3-utils';

/**
 * Algorithm customizer component
 */
@Component({
    name: 'bkA3AlgorithmCustomizer',
    templateUrl: 'src/modules/a3/a3-algorithm-customizer/a3-algorithm-customizer.html'
})
export class A3AlgorithmCustomizerComponent extends BaseComponent {

    public isA3Viz: boolean;
    public isA3Diff: boolean;
    public isInputInvalid: boolean;
    public invalidInputMessageString: string;

    private a3AnalysisRequest: any;
    private minRows: number;
    private multiplier: string;
    private maxDiffElements: number;
    private maxFraction: number;
    private minAbsChangeRatio: number;
    private minChangeRatio: number;
    private a3AnalysisCustomizerComponent: A3AnalysisCustomizerComponent;

    public constructor(a3AnalysisRequest,
                       a3AnalysisCustomizerComponent: A3AnalysisCustomizerComponent) {
        super();
        this.a3AnalysisRequest = a3AnalysisRequest;
        this.a3AnalysisCustomizerComponent = a3AnalysisCustomizerComponent;

        this.isA3Viz = isVizAnalysis(this.a3AnalysisRequest);
        this.isA3Diff = isDiffAnalysis(this.a3AnalysisRequest);
        this.initializeDefaults();
        this.populateValuesFromA3Request();

        this.isInputInvalid = false;
        this.invalidInputMessageString = '';
    }

    public trigger() {
        this.a3AnalysisCustomizerComponent.trigger();
    }

    public updateA3Request() : boolean {

        let analysisParam = new tsProto.sage.AnalysisParam();
        let analysisDescriptor = new tsProto.sage.AnalysisDescriptor();
        let analysisAlgorithm = new tsProto.sage.AnalysisAlgorithm();

        if (this.isA3Viz) {
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

            if (this.a3AnalysisRequest.getType() === tsProto.sage.A3AnalysisType.E.VISUALIZATION) {
                let visualizationAnalysis = this.a3AnalysisRequest.getVisualizationAnalysis();
                visualizationAnalysis.setParam(analysisParam);
                this.a3AnalysisRequest.setVisualizationAnalysis(visualizationAnalysis);
            } else if (this.a3AnalysisRequest.getType() === tsProto.sage.A3AnalysisType.E.DATA) {
                let dataAnalysis = this.a3AnalysisRequest.getDataAnalysis();
                dataAnalysis.setParam(analysisParam);
                this.a3AnalysisRequest.setDataAnalysis(dataAnalysis);
            }
        } else if (this.isA3Diff) {
            if (false === this.verifyMaxDiffElements() ||
                false === this.verifyMaxFraction() ||
                false === this.verifyMinAbsChangeRatio() ||
                false === this.verifyMinChangeRatio()) {
                return false;
            }
            let analysisClass =
                tsProto.sage.AnalysisDescriptor.AnalysisClass.DIFF_EXPLANATION;
            analysisDescriptor.setAnalysisClass(analysisClass);

            let diffExplanation = new tsProto.sage.AnalysisDescriptor.DiffExplanation();
            let absDiffMajority = new tsProto.sage.AnalysisAlgorithm.AbsDiffMajority();
            absDiffMajority.setMaxDiffElements(Math.floor(this.maxDiffElements));
            absDiffMajority.setMaxFraction(this.maxFraction);
            absDiffMajority.setMinAbsChangeRatio(this.minAbsChangeRatio);
            absDiffMajority.setMinChangeRatio(this.minChangeRatio);

            analysisAlgorithm.setAbsDiffMajority(absDiffMajority);
            analysisAlgorithm.setType(tsProto.sage.AnalysisAlgorithm.Type.ABS_DIFF_MAJORITY);
            diffExplanation.setAlgorithm(analysisAlgorithm);
            analysisDescriptor.setDiffExplanation(diffExplanation);
            analysisParam.setAnalysisDescriptor(analysisDescriptor);

            let dataAnalysis = this.a3AnalysisRequest.getDataAnalysis();
            dataAnalysis.setParam(analysisParam);
            this.a3AnalysisRequest.setDataAnalysis(dataAnalysis);
        }

        return true;
    }

    public verifyMaxDiffElements() : boolean {
        return this.verifyNumber(strings.a3.Max_Diff_Elements, this.maxDiffElements);
    }

    public verifyMaxFraction() : boolean {
        return this.verifyNumber(strings.a3.Max_Fraction, this.maxFraction);
    }

    public verifyMinRows() : boolean {
        return this.verifyNumber(strings.a3.Min_Rows, this.minRows);
    }

    public verifyMinAbsChangeRatio() : boolean {
        return this.verifyNumber(strings.a3.Min_Abs_Change_Ratio, this.minAbsChangeRatio);
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

    public verifyMinChangeRatio() : boolean {
        return this.verifyNumber(strings.a3.Min_Change_Ratio, this.minChangeRatio);
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
        this.maxDiffElements = 10;
        this.maxFraction = 0.5;
        this.minAbsChangeRatio = 0.1;
        this.minChangeRatio = 0.1;
    }

    private populateValuesFromA3Request() {

        let analysisParam = new tsProto.sage.AnalysisParam();

        if (this.isA3Viz) {
            if (this.a3AnalysisRequest.getType() === tsProto.sage.A3AnalysisType.E.VISUALIZATION) {
                let visualizationAnalysis = this.a3AnalysisRequest.getVisualizationAnalysis();
                analysisParam = visualizationAnalysis.getParam();
            } else if (this.a3AnalysisRequest.getType() === tsProto.sage.A3AnalysisType.E.DATA) {
                let dataAnalysis = this.a3AnalysisRequest.getDataAnalysis();
                analysisParam = dataAnalysis.getParam();
            }

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
        } else if (this.isA3Diff) {

            let dataAnalysis = this.a3AnalysisRequest.getDataAnalysis();
            analysisParam = dataAnalysis.getParam();

            if (analysisParam === null) {
                return;
            }

            let analysisDescriptor = analysisParam.getAnalysisDescriptor();
            let diffExplanation = analysisDescriptor.getDiffExplanation();
            let analysisAlgorithm = diffExplanation.getAlgorithm();
            let absDiffMajority = analysisAlgorithm.getAbsDiffMajority();

            if (absDiffMajority === null ||
                analysisAlgorithm.getType() !==
                    tsProto.sage.AnalysisAlgorithm.Type.ABS_DIFF_MAJORITY ||
                analysisDescriptor.getAnalysisClass() !==
                    tsProto.sage.AnalysisDescriptor.AnalysisClass.DIFF_EXPLANATION
                ) {
                return;
            }

            this.maxDiffElements = Math.floor(absDiffMajority.getMaxDiffElements());
            this.maxFraction = absDiffMajority.getMaxFraction();
            this.minAbsChangeRatio = absDiffMajority.getMinAbsChangeRatio();
            this.minChangeRatio = absDiffMajority.getMinChangeRatio();
        }
    }
}
