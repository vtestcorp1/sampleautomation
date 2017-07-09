/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is a component used to view a single Page in an answer document.
 * This component contains the following components and facilitates communication between
 * them.
 * - Answer Filter Panel
 * - Answer Title Bar
 * - Answer Sage Bar
 * - Answer Visualization Viewer
 */

import {ScopedComponent} from '../../../base/base-types/scoped-component';
import {blinkConstants} from '../../../base/blink-constants';
import {Component, ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {ChartEditorComponent} from '../../charts/chart-editor/chart-editor';
import {EmptyPagePlaceholderComponent} from '../../empty-page-placeholder/empty-page-placeholder';
import {InfoCardIconComponent} from '../../natural-query/info-card-icon/info-card-icon';
import {ColumnPanelComponentConfig} from
    '../../sage/data-panel/sage-data-columns/column-panel-component-config';
import {
    getActiveSourceName,
    subscribeToSourcesChanged
} from '../../sage/data-scope/sage-data-scope-service';
import {DataSourcePreviewComponent} from '../../sage/data-source-preview/data-source-preview';
import {SageBarComponent} from '../../sage/sage-bar/sage-bar';
import {
    decideAnswerDisplayMode,
    getCurrentChartImagePath, getCurrentChartType
} from '../../search-pages/search-pages-utils';
import {AnswerVisualizationViewerComponent} from
    '../../viz-layout/answer/answer-visualization-viewer/answer-visualization-viewer';
import {ChartTypeSelectorPanelComponent} from
    '../../viz-layout/answer/viz-type-selector/chart-type-selector-panel/chart-type-selector-panel';
import {TableTypeSelectorComponent} from
    '../../viz-layout/answer/viz-type-selector/table-type-selector/table-type-selector';
import {ChartModel} from '../../viz-layout/viz/chart/chart-model';
// tslint:disable-next-line:max-line-length
import {VisualizationPinnerLauncherComponent} from
    '../../viz-layout/viz/common/pinboard-drop-down/visualization-pinner/visualization-pinner-launcher-component';
import {VisualizationModel} from '../../viz-layout/viz/visualization-model';
import {autoTitleAnswer} from './answer-auto-title-service';
import {AnswerPageActionsConfig, getAnswerPageActions} from './answer-page-actions-util';
import {AnswerPageFilterPanel} from './answer-page-filter-panel';
import {AnswerPageTitle} from './answer-page-title';

let env = ngRequire('env');
let events = ngRequire('events');
let Logger = ngRequire('Logger');
let jsonConstants = ngRequire('jsonConstants');
let sessionService = ngRequire('sessionService');
let util = ngRequire('util');
let eventTracker = ngRequire('eventTracker');
let perfEvents = ngRequire('perfEvents');

declare var sage:any;

enum AnswerViewerStates {
    EMPTY_PAGE,
    SEARCH_DOCTOR,
    DEFAULT_STATE
}

@Component({
    name: 'bkAnswerPage',
    templateUrl: 'src/modules/answer-panel/answer-page/answer-page.html'
})

export class AnswerPageComponent extends ScopedComponent {
    public addFormulaRequestHandler: Function;
    public answerModel: any;
    public sageClient: any;
    public viewerState: AnswerViewerStates;

    // Left Panel
    public columnPanelComponentConfig: ColumnPanelComponentConfig;
    public dataPanelConfig: any;
    // Search Panel
    public dataSourcePreviewComponent: DataSourcePreviewComponent;
    public infoCardIconComponent: InfoCardIconComponent;
    public sageBarComponent: SageBarComponent;
    public showDataSourcePreview: boolean;
    // Title Panel
    public actionMenu: any;
    public answerPageTitle: AnswerPageTitle;
    public visualizationPinnerComponent: VisualizationPinnerLauncherComponent;
    public chartTypeSelectorPanelComponent: ChartTypeSelectorPanelComponent;
    public tableTypeSelectorComponent: TableTypeSelectorComponent;
    // Filter Panel
    public answerPageFilterPanel: AnswerPageFilterPanel;
    // Visualization Viewer
    public emptyPagePlaceholderComponent: EmptyPagePlaceholderComponent;
    public answerVisualizationViewerComponent: AnswerVisualizationViewerComponent;
    public searchDoctorModel: any;
    public showChartSelector: boolean;
    public showChartEditor: boolean;
    public displayChartConfigEditorIcon: boolean;
    public chartEditorComponent: ChartEditorComponent;

    private actionsConfig: AnswerPageActionsConfig;
    private answerDisplayMode: string;
    private logger: any;
    private disableAutoTitle: boolean;
    private isMissingUnderlyingAccess: boolean;
    private sageSearchOnInit: boolean;
    private tracker = null;
    private chart = null;
    private sourcesListenerDeregister: () => void = null;

    constructor(answerModel:any,
                sageClient: any,
                addFormulaRequestHandler: Function,
                disableAutoTitle: boolean,
                sageSearchOnInit: boolean,
                actionsConfig: AnswerPageActionsConfig
    ) {
        super();
        this.answerModel = answerModel;
        this.sageClient = sageClient;
        this.addFormulaRequestHandler = addFormulaRequestHandler;
        this.disableAutoTitle = disableAutoTitle;
        this.sageSearchOnInit = sageSearchOnInit;
        this.actionsConfig = actionsConfig;

        this.logger = Logger.create('answer-page-controller');

        this.showDataSourcePreview = (sessionService.getPanelExpandedState()
            !== blinkConstants.preferenceValues.panelState.EXPANDED)
            && !env.e2eTest;

        this.viewerState = !!this.answerModel
            ? AnswerViewerStates.DEFAULT_STATE
            : AnswerViewerStates.EMPTY_PAGE;
        this.showChartSelector = false;
        this.showChartEditor = false;
        this.displayChartConfigEditorIcon = false;
        this.setIsMissingUnderlyingAccessFromModel();
        this.initDisplayMode();

        this.initDataSourcePreviewComponent();
        this.initSageBar();
        this.initInfoCard();
        this.initDataPanel();
        this.initTitle();
        this.initFilterPanel();
        this.initEmptyPagePlaceholder();
        this.initVisualizationViewer();
        this.initTableVizSelector();
        this.initChartVizSelector();
        this.initActionMenu();
        this.setupWatch();

        this.sourcesListenerDeregister = subscribeToSourcesChanged(
            (sourceIds) => {
            if (sourceIds) {
                this.dataSourcePreviewComponent.updateSources(
                    getActiveSourceName());
            }
        });
    }

    public setAnswerModel(answerModel) {
        this.answerModel = answerModel;
        if (!this.answerModel) {
            this.showChartEditor = false;
            this.showChartSelector = false;
        }

        this.viewerState = !!this.answerModel
            ? AnswerViewerStates.DEFAULT_STATE
            : AnswerViewerStates.EMPTY_PAGE;

        this.setIsMissingUnderlyingAccessFromModel();
        this.initDisplayMode();

        this.initSageBar();
        this.infoCardIconComponent.updateAnswerModel(answerModel);
        // NOTE: Left panel currently doesnt support changing the config object. This should be
        // changed in the componentization of left panel.
        // For now we want to update the answer model inside of the object.
        this.dataPanelConfig.model = this.answerModel;
        this.initTitle();
        this.initFilterPanel();
        this.initVisualizationViewer();
        this.initTableVizSelector();
        this.initChartVizSelector();
        this.initActionMenu();
    }

    public panelHeaderClickCallback = () => {
        this.showDataSourcePreview = true;
        this.dataSourcePreviewComponent.setHide(false);
        sessionService.setPanelStateInPreference(null);
        this.reflowContent();
    }

    public onDataPanelResizeCallback = () => {
        this.reflowContent();
    }

    public onSearchCorrectedCallback = () => {
        this.viewerState = !!this.answerModel
            ? AnswerViewerStates.DEFAULT_STATE
            : AnswerViewerStates.EMPTY_PAGE;
        this.searchDoctorModel = null;
    }

    public downloadChart() {
        this.broadcast(events.DOWNLOAD_CHART);
    }

    public downloadTable(format) {
        this.broadcast(events.DOWNLOAD_TABLE, format);
    }

    public toggleChartSelectorDisplay = () => {
        let answerModel = this.answerModel;
        let chartType = getCurrentChartType(answerModel);

        if (this.answerDisplayMode === util.answerDisplayModes.TABLE &&
            !this.showChartSelector &&
            chartType) {
            this.onVizTypeSelectionChangeCallback(chartType);
        } else {
            this.showChartSelector = !this.showChartSelector;
        }
        if (this.showChartSelector) {
            this.showChartEditor = false;
        }
        this.reflowContent();
    }

    public getChartSelectorIconPath() : string {
        return getCurrentChartImagePath(this.answerModel);
    }

    public toggleChartEditorDisplay() {
        if(!this.displayChartConfigEditorIcon) {
            return;
        }
        this.showChartEditor = !this.showChartEditor;
        if (this.showChartEditor) {
            this.showChartSelector = false;
        }
        this.reflowContent();
    }

    public onDestroy() {
        this.sourcesListenerDeregister();
    }

    private setupWatch() {
        this.on(events.CHART_CREATED, (evt, chart) => {
            this.chart = chart;
        });
    }

    private reflowContent() {
        this.broadcast(events.LAYOUT_REFLOW_REQUIRED_U);
    }

    private openFilterCallback = (logicalColumn) => {
        let aggr:number = sage.AggregationType.NONE;

        return this.answerPageFilterPanel.openOrAddFilter(logicalColumn, aggr)
            .then(() => {
                this.viewerState = AnswerViewerStates.DEFAULT_STATE;
            });
    }

    private addVisualizationPinner = (answerModel) => {
        // Visualization pinner handling
        let answerSheet = !!answerModel ? answerModel.getCurrentAnswerSheet() : void 0;
        let vizModel: VisualizationModel = !!answerSheet
            ? answerSheet.getPrimaryDisplayedViz()
            : void 0;
        this.visualizationPinnerComponent = !!vizModel
            ? new VisualizationPinnerLauncherComponent(vizModel)
            : void 0;
    }

    private onVizRenderingCompleteCallback = () => {
        if (this.tracker) {
            this.tracker.finish();
        }
        let answerModel = this.answerModel;
        if (!this.disableAutoTitle) {
            autoTitleAnswer(answerModel);
        }
        this.addVisualizationPinner(answerModel);
        this.displayChartConfigEditorIcon =
            this.answerDisplayMode === util.answerDisplayModes.CHART;
        if (this.displayChartConfigEditorIcon) {
            this.initChartEditor();
        }
    }

    private onDataSourcePreviewClickCallback = () => {
        this.dataSourcePreviewComponent.setHide(true);
        this.showDataSourcePreview = false;
        sessionService.setPanelStateInPreference(
            blinkConstants.preferenceValues.panelState.EXPANDED
        );
        this.reflowContent();
    }

    private initDisplayMode() {
        this.answerDisplayMode = decideAnswerDisplayMode(this.answerModel);
        if (!this.answerModel) {
            return;
        }
        let answerSheet = this.answerModel.getCurrentAnswerSheet();
        answerSheet.setVizSelectionAnswerMode(this.answerDisplayMode);
    }

    private initDataSourcePreviewComponent() {

        this.dataSourcePreviewComponent = new DataSourcePreviewComponent(
            getActiveSourceName(),
            this.onDataSourcePreviewClickCallback
        );
        this.dataSourcePreviewComponent.setHide(
            !this.showDataSourcePreview
        );
    }

    private onForceInvalidSearchCallback = (sageModel) => {
        this.viewerState = AnswerViewerStates.SEARCH_DOCTOR;
        this.searchDoctorModel = sageModel;
    }

    private onSageEdit() {
        if (this.tracker && !this.tracker.isFinished()) {
            this.tracker.cancel();
        }
        this.tracker = eventTracker.trackEvent(perfEvents.ADHOC_ANSWER);
    }

    private initSageBar() {
        let permission = !!this.answerModel ? this.answerModel.getPermission() : void 0;
        let canEdit = !!permission ? permission.isSageAllowed() : true;
        let readOnlyQueryText = canEdit ? '' : this.answerModel.getQueryTextFromTokens();
        this.sageBarComponent = new SageBarComponent(
            this.sageClient,
            this.sageSearchOnInit,
            canEdit,
            readOnlyQueryText,
            this.onForceInvalidSearchCallback,
            this.onSearchCorrectedCallback,
            this.onSageEdit.bind(this)
        );
    }

    private initInfoCard() {
        this.infoCardIconComponent = new InfoCardIconComponent(this.answerModel);
    }

    private initDataPanel() {
        this.columnPanelComponentConfig = new ColumnPanelComponentConfig(
            true, // displayAnswerFormula
            true, // showCheckMarks
            false, // disallowColumnAddition
            false, // disallowColumnSelection,
            void 0, // noSourcesPlaceholderString
            this.openFilterCallback, // openFilterHandler
            void 0, // onColumnDblClick
            this.addFormulaRequestHandler // formulaHandler
        );

        this.dataPanelConfig = {
            type: blinkConstants.documentType.ANSWER,
            sageClient: this.sageClient,
            model: this.answerModel
        };
    }

    private initVisualizationViewer() {
        if (!this.answerModel) {
            this.answerVisualizationViewerComponent = null;
            return;
        }

        this.answerVisualizationViewerComponent = new AnswerVisualizationViewerComponent(
            this.answerModel,
            this.answerDisplayMode,
            this.sageClient,
            this.onVizRenderingCompleteCallback
        );
    }

    private setIsMissingUnderlyingAccessFromModel() {
        var permission = !!this.answerModel
            ? this.answerModel.getPermission()
            : void 0;
        this.isMissingUnderlyingAccess = !!permission
            ? permission.isMissingUnderlyingAccess()
            : false;
    }

    private initFilterPanel () {
        let filterModels = !!this.answerModel
            ? this.answerModel.getCurrentAnswerSheet().getFilterVisualizations()
            : [];

        this.answerPageFilterPanel = new AnswerPageFilterPanel(
            filterModels,
            this.sageClient,
            this.isMissingUnderlyingAccess
        );
    }

    private initEmptyPagePlaceholder () {
        this.emptyPagePlaceholderComponent = new EmptyPagePlaceholderComponent(
            strings.SEARCH_YOUR_DATA
        );
    }

    private initTitle () {
        this.answerPageTitle = this.answerModel
            ? new AnswerPageTitle(this.answerModel)
            : null;
    }

    private onVizTypeSelectionChangeCallback = (vizType) => {
        if (vizType === jsonConstants.VIZ_TYPE_TABLE) {
            if (this.answerDisplayMode !== util.answerDisplayModes.TABLE) {
                if (this.showChartEditor) {
                    this.showChartEditor = false;
                }
                this.answerDisplayMode = util.answerDisplayModes.TABLE;
                let answerSheet = this.answerModel.getCurrentAnswerSheet();
                answerSheet.setVizSelectionAnswerMode(this.answerDisplayMode);
                this.answerVisualizationViewerComponent.setDisplayMode(this.answerDisplayMode);
                this.initActionMenu();
                this.setDisplayModePreference(vizType);
            }
        } else {
            // NOTE: There are 3 cases here:
            // Case 1: Table is being displayed.
            // Case 1a: A chart has already been displayed.
            // In this case we have a valid chart component with some state. So we communicate
            // to chart of chart type change and switch the display mode.
            // Case 1b: No chart displayed yet.
            // We set chart type in chart model then change display mode.
            // Case 2: A chart is being displayed.
            // In this case we just notify chart controller of chart type change.
            if (this.answerDisplayMode === util.answerDisplayModes.TABLE) {
                // This works for both 1a and 1b as in case of 1b this event will be a noop.
                this.broadcast(events.CHART_TYPE_CHANGED_U, vizType);

                this.answerDisplayMode = util.answerDisplayModes.CHART;
                let answerSheet = this.answerModel.getCurrentAnswerSheet();
                answerSheet.setVizSelectionAnswerMode(this.answerDisplayMode);
                let chartModel = answerSheet.getChartVisualizations()[0];
                if (!chartModel) {
                    this.logger.error('At least one chart model expected.' +
                        'Selector should be disabled otherwise'
                    );
                }
                // In case of 1a this set becomes a noop.
                chartModel.setChartType(vizType);
            } else {
                this.broadcast(events.CHART_TYPE_CHANGED_U, vizType);
            }
            this.answerVisualizationViewerComponent.setDisplayMode(this.answerDisplayMode);
            this.initActionMenu();
            this.setDisplayModePreference(vizType);
        }
    }

    private initTableVizSelector() {
        this.tableTypeSelectorComponent = this.answerModel
            ? new TableTypeSelectorComponent(
                this.answerDisplayMode === util.answerDisplayModes.TABLE,
                this.onVizTypeSelectionChangeCallback
            )
            : null;
    }

    private initChartVizSelector() {
        this.chartTypeSelectorPanelComponent = this.answerModel
            ? new ChartTypeSelectorPanelComponent(
                this.answerModel,
                this.answerDisplayMode,
                this.onVizTypeSelectionChangeCallback,
                () => {
                    this.toggleChartSelectorDisplay();
                }
            )
            : null;
    }

    private initActionMenu () {
        if (!this.answerModel) {
            this.actionMenu = null;
            return;
        }

        this.actionMenu = {};
        let permission = this.answerModel.getPermission();
        let actions = getAnswerPageActions(this, permission);
        Array.prototype.push.apply(actions, this.actionsConfig.containerActions);
        let idToActionsMap = actions.reduce((idToActionsmap, action) => {
            idToActionsmap[action.id] = action;
            return idToActionsmap;
        }, {});
        let orderedActions = this.actionsConfig.actionsOrder.reduce((orderedActions, actionId) => {
            let action = idToActionsMap[actionId];
            if (!!action) {
                orderedActions.push(action);
            }
            return orderedActions;
        }, []);
        this.actionMenu.actions = orderedActions;
    }

    private setDisplayModePreference(vizType) {
        let displayMode = vizType === jsonConstants.VIZ_TYPE_TABLE
            ? util.answerDisplayModes.TABLE
            : util.answerDisplayModes.CHART;
            sessionService.setPreference(
            blinkConstants.ANSWER_DISPLAY_MODE_PREFERENCE_KEY,
            displayMode
        );
    }

    private initChartEditor () {
        let answerSheet = this.answerModel.getCurrentAnswerSheet();
        let primaryViz: ChartModel = answerSheet && answerSheet.getPrimaryDisplayedViz();
        this.chartEditorComponent = new ChartEditorComponent(
            this.chart,
            primaryViz,
            () => {
                this.broadcast(events.CHART_NEEDS_RELOAD);
            }, // ChartRefresh loads data etc
            () => {
                this.toggleChartEditorDisplay();
            },
            () => {
                this.broadcast(events.CHART_NEEDS_REDRAW_U);
            } // chartRedraw rebuilds chart config and draws.
        );
    }
}
