/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This component is used to view an answer page visualizations.
 * Based on display mode vizs to display are decided. This component also takes
 * care of loading data for vizs.
 */
import {Component, ngRequire} from '../../../../base/decorators';
import {VisualizationModel} from '../../viz/visualization-model';
import IPromise = angular.IPromise;
import IQService = angular.IQService;
import _ from 'lodash';
import {ScopedComponent} from '../../../../base/base-types/scoped-component';
import {ChartVizComponent} from '../../../chart-viz/chart-viz';
import {DataVizComponent} from '../../../data-viz/data-viz';
import {HeadlineVizComponent} from '../../../headline-viz/headline-viz';
import {TableVizComponent} from '../../../table-viz/table-viz';

let $q : IQService = ngRequire('$q');
let alertService = ngRequire('alertService');
let cancelableQueryContextService = ngRequire('cancelableQueryContextService');
let dataService = ngRequire('dataService');
let jsonConstants = ngRequire('jsonConstants');
let Logger = ngRequire('Logger');
let util = ngRequire('util');
let UserAction = ngRequire('UserAction');
let events = ngRequire('events');

let templatePath = 'src/modules/viz-layout/answer/answer-visualization-viewer/' +
    'answer-visualization-viewer.html';


@Component({
    name: 'bkAnswerVisualizationViewer',
    templateUrl: templatePath
})

export class AnswerVisualizationViewerComponent extends ScopedComponent {
    public answerDisplayMode: string;
    public loadingData: boolean;
    public sageClient: any;
    public tableModel: any;
    public chartModel: any;
    public chartVizComponent: ChartVizComponent;
    public tableVizComponent: TableVizComponent;
    public headlineModels: Array<any>;
    public headlineVizComponents: Array<HeadlineVizComponent>;
    public vizIdToDataVizComponent: {[id: string]: DataVizComponent};
    // This is used to orchestrate rerender on a chart. When we write chart as
    // a component we can remove this. Other option is to use event which was
    // avoided here.
    public showChart: boolean;

    private answerModel: any;
    private logger: any;
    private onRenderingComplete: (vizModel: VisualizationModel) => void;
    private renderPendingVizIds: {[vizId: string]: VisualizationModel};
    private tableModeDataCallCancelId: string;
    private chartModeDataCallCancelId: string;

    private static getVisualizationsToDisplay(
        answerModel,
        answerDisplayMode,
        logger
    ) : Array<VisualizationModel> {
        let displayedVizs: Array<VisualizationModel> = [];
        let answerSheet = answerModel.getCurrentAnswerSheet();
        if (answerDisplayMode === util.answerDisplayModes.TABLE) {
            let tableModels = answerSheet.getTableVisualizations();
            displayedVizs.push(...tableModels);
            let headlineModels = answerSheet.getHeadlineVisualizations();
            displayedVizs.push(...headlineModels);
        } else if (answerDisplayMode === util.answerDisplayModes.CHART) {
            let chartModels = answerSheet.getChartVisualizations();
            displayedVizs.push(...chartModels);
        } else {
            logger.error('Unsupported answer display mode');
        }

        return displayedVizs.filter((viz) => {
            return !viz.shouldIgnoreRendering();
        });
    }

    private static processData(
        vizDataMap: any,
        vizs: VisualizationModel[],
        answervisualizationViewerComponent: AnswerVisualizationViewerComponent
    ) {
        vizs.forEach((vizModel) => {
            let vizType = vizModel.getVizType();
            let vizId = vizModel.getId();
            let vizData = vizDataMap[vizId];

            if (vizModel.getVizType().toLowerCase() === jsonConstants.VIZ_TYPE_HEADLINE
                && (!vizData || Object.isEmpty(vizData))) {
                _.remove(answervisualizationViewerComponent.headlineModels, (headlineModel) => {
                    return headlineModel.getId() === vizModel.getId();
                });
                _.remove(
                    answervisualizationViewerComponent.headlineVizComponents,
                    (headlineVizComponent) => {
                        return headlineVizComponent ===
                            answervisualizationViewerComponent.vizIdToDataVizComponent
                                [vizModel.getId()];
                });
                vizModel.setIgnoreRendering();
                delete answervisualizationViewerComponent.renderPendingVizIds[vizModel.getId()];
                return;
            }

            // Update the answer Json
            vizModel.getContainingAnswerModel().getCurrentAnswerSheet().setDataForViz(
                vizId,
                vizType,
                vizData
            );
            // Update data is called in the case where the vizModel would want to parse the
            // data and setup state.
            vizModel.updateData(vizData);
            vizModel.setRenderReady(true);
            answervisualizationViewerComponent.vizIdToDataVizComponent[vizModel.getId()].loadViz();
        });
    }

    constructor(answerModel: any,
                answerDisplayMode: string,
                sageClient: any,
                onRenderingComplete: (vizModel: VisualizationModel) => void = _.noop
    ) {
        super();
        this.logger = Logger.create('answer-visualization-viewer');

        this.loadingData = false;
        this.answerModel = answerModel;
        this.answerDisplayMode = answerDisplayMode;
        this.sageClient = sageClient;
        this.onRenderingComplete = onRenderingComplete;
        this.showChart = true;
        this.vizIdToDataVizComponent = {};

        this.setRenderPendingVisualizations();
        this.loadDataForDisplayedVizs();
        this.setVisualizationModels();
    }

    public onDestroy() {
        let cancelIds = [];
        if (!!this.tableModeDataCallCancelId) {
            cancelIds.push(this.tableModeDataCallCancelId);
        }
        if (!!this.chartModeDataCallCancelId) {
            cancelIds.push(this.chartModeDataCallCancelId);
        }
        if (cancelIds.length > 0) {
            cancelableQueryContextService.cancelQueries(cancelIds);
        }
    }

    public setDisplayMode(displayMode) {
        this.answerDisplayMode = displayMode;
        this.setRenderPendingVisualizations();
        this.loadDataForDisplayedVizs();
    }

    public onVizRenderedCallback = (vizModel: VisualizationModel, partial: boolean) => {
        let id: string = vizModel.getId();
        delete this.renderPendingVizIds[id];
        if (partial) {
            vizModel.setSecondaryRenderReady(true);
        }
        if (_.isEmpty(this.renderPendingVizIds)) {
            this.emit(events.ANSWER_UI_RENDERED_U);
            this.onRenderingComplete(vizModel);
        }
    }

    public isTableMode() {
        return this.answerDisplayMode === util.answerDisplayModes.TABLE;
    }

    private setRenderPendingVisualizations () {
        let vizsToDisplay = AnswerVisualizationViewerComponent.getVisualizationsToDisplay(
            this.answerModel,
            this.answerDisplayMode,
            this.logger
        );
        this.renderPendingVizIds = _.keyBy(vizsToDisplay, (vizModel) => {
            return vizModel.getId();
        });
    }

    private setVisualizationModels() {
        let answerSheet = this.answerModel.getCurrentAnswerSheet();
        let tableModels = answerSheet.getTableVisualizations();
        this.tableModel = tableModels[0];
        if (!!this.tableModel) {
            this.tableVizComponent = new TableVizComponent(
                this.tableModel,
                this.sageClient,
                false,
                $q.when,
                this.onRenderingComplete
            );
            this.vizIdToDataVizComponent[this.tableModel.getId()] = this.tableVizComponent;
        }
        let chartModels = answerSheet.getChartVisualizations();
        this.chartModel = chartModels[0];
        if (!!this.chartModel) {
            this.chartVizComponent = new ChartVizComponent(
                this.chartModel,
                this.sageClient,
                false,
                $q.when,
                this.onRenderingComplete
            );
            this.vizIdToDataVizComponent[this.chartModel.getId()] = this.chartVizComponent;
        }
        this.headlineModels = answerSheet.getHeadlineVisualizations();
        this.headlineVizComponents = [];
        this.headlineModels.forEach((headlineModel) => {
            let headlineVizComponent = new HeadlineVizComponent(
                headlineModel,
                this.onRenderingComplete,
                true,
                $q.when
            );
            this.headlineVizComponents.push(headlineVizComponent);
            this.vizIdToDataVizComponent[headlineModel.getId()] = headlineVizComponent;
        });
    }

    private loadDataForDisplayedVizs() {
        this.loadingData = true;
        let displayedVisualizations = AnswerVisualizationViewerComponent.getVisualizationsToDisplay(
            this.answerModel,
            this.answerDisplayMode,
            this.logger
        );
        let visualizationsPendingDataLoad = displayedVisualizations.filter((vizModel) => {
            return vizModel.isPendingDataLoad();
        });

        let userAction = new UserAction(UserAction.FETCH_VIZS_DATA);
        let dataLoadPromise: IPromise<any>;
        if (visualizationsPendingDataLoad.length === 0) {
            dataLoadPromise = $q.when({ data: {} });
        } else {
            let dataRequest = dataService.getDataForVizs(
                this.answerModel,
                visualizationsPendingDataLoad,
                {}, // params
                true // sendReportbookJson
            );
            dataLoadPromise = dataRequest.dataPromise;
            if (this.isTableMode()) {
                this.tableModeDataCallCancelId = dataRequest.cancelId;
            } else {
                this.chartModeDataCallCancelId = dataRequest.cancelId;
            }
        }

        dataLoadPromise.then((response) => {
            let vizDataMap = response.data;
            AnswerVisualizationViewerComponent.processData(
                vizDataMap,
                visualizationsPendingDataLoad,
                this
            );
        }, (response) => {
            this.logger.error('Data load failed for answer', response);
            alertService.showUserActionFailureAlert(userAction, response);
        }).finally(() => {
            this.loadingData = false;
        });
    }
}
