/**
 * Copyright Thoughtspot Inc. 2016
 * Author:  Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview: The Pivot Table component.
 */

import _ from 'lodash';
import {Component, ngRequire} from 'src/base/decorators';
import {BaseChart} from '../chart/base-chart';
import {ChartModel} from '../chart/chart-model';
import Color = Chroma.Color;
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import {CustomStylingConfig} from '../../../custom-styling/custom-style-config';
import {ChartAxisConfig} from '../chart/chart-axis-config';
import {areaToAxisMap, PivotDataModel} from './pivot-data-model';

let $templateCache = ngRequire('$templateCache');
let angularUtil = ngRequire('angularUtil');

const fieldPanelSelector = '.dx-area-field-content';

@Component({
    name: 'bkPivotTable',
    templateUrl: 'src/modules/viz-layout/viz/pivot/pivot.html'
})
export class PivotTableComponent extends BaseChart {
    public options;
    private pivotDataSource;
    private pivotDataModel : PivotDataModel;
    private colIdToColumnModel : {[id:string] : VisualizationColumnModel};
    private pivotInstance;
    private cellPostProcessors = new Set<(any)>();
    private heatmapFunction : (number) => Color;

    constructor(private model : ChartModel, public sageClient, private onChanged) {
        super();
        this.onChanged = this.onChanged || _.noop;
        this.pivotDataModel = model.getDataModel();
        this.colIdToColumnModel = this.pivotDataModel.columnIdToColumn;
        this.pivotDataSource = this.pivotDataModel.getPivotDataSource();
        this.heatmapFunction = this.getHeatmapFunction();
        this.options = {
            allowSortingBySummary: false,
            allowSorting: false,
            allowFiltering: false,
            allowExpandAll: true,
            height: '100%',
            fieldChooser: {
                enabled: false
            },
            fieldPanel: {
                showColumnFields: true,
                showDataFields: true,
                showFilterFields: false,
                showRowFields: true,
                allowFieldDragging: true,
                visible: true
            },
            'export': {
                enabled: false
            },
            rowHeaderLayout: 'tree',
            scrolling: {
                mode: 'infinite',
                useNative: true
            },
            dataSource: this.pivotDataModel.getPivotDataSource(),
            onContentReady: this.onContentReady.bind(this),
            onCellPrepared: this.getOnCellPreparedCallback(),
            onInitialized: this.onInitialized.bind(this)
        };
    }

    public supportsDownload() : boolean {
        return true;
    }

    public setSize() {
        if(!this.pivotInstance) {
            return;
        }

        this.pivotInstance.updateDimensions();
    }

    public downloadChart(options: any, filename: string) : void {
        if(!this.pivotInstance) {
            return;
        }
        this.pivotInstance.option('export', {
            enabled: false,
            fileName: filename
        });

        this.pivotInstance.exportToExcel();
    }

    public supportsFullScreenMode() {
        return false;
    }

    public canOverlayHeatmap() {
        return true;
    }

    public setIsHeatmapOverlayed(isEnabled : boolean) : void {
        if(!this.pivotInstance) {
            return;
        }
        if(isEnabled) {
            this.cellPostProcessors.add(this.heatmapCellFormatter);
        } else {
            this.cellPostProcessors.delete(this.heatmapCellFormatter);
        }
        this.pivotInstance.repaint();
    }

    private getOnCellPreparedCallback() : (Object) {
        var self = this;

        // Only in the case of multiple measures will the measure header appear
        // on the columns.
        if(this.pivotDataModel.hasMultipleMeasures()) {
            self.cellPostProcessors.add(this.multimeasureHeaderFormatter);
        }

        if(this.model.isHeatmapOverlayed()) {
            self.cellPostProcessors.add(this.heatmapCellFormatter);
        }

        return function(params) {
            self.cellPostProcessors.forEach(function(processor : (any)) {
                processor.call(self, params);
            });
        };
    }

    private multimeasureHeaderFormatter(params) {
        // The target cell is the measure header, it appears only on the column area
        // And is always the last row in the headers.
        if(params.area === 'column' && !!params.cell.isLast) {
            let vizCol = this.colIdToColumnModel[params.cell.text];
            if(!!vizCol) {
                var colName = vizCol.getName();
                params.cellElement.text(colName);
            }
        }
    }

    private heatmapCellFormatter(params) {
        var cellElem = params.cellElement;
        var value = params.cell.value;
        if(_.isNumber(value)) {
            let color = this.heatmapFunction(value);
            cellElem.css('background-color', color);
        }
    }

    private getHeatmapFunction() : (number) => Color {
        var min = this.pivotDataModel.min || 1;
        var max = this.pivotDataModel.max;
        var count = this.pivotDataModel.count;

        var factor = Math.log(max*count);
        var heatmapColor = CustomStylingConfig.getPivotHeatmapColor();
        var scale = chroma.scale(['white', heatmapColor.css()]);

        return function(value : number) {
            return scale(Math.log(value / min) / factor)
                .alpha(value / max)
                .css();
        };
    }

    private onInitialized(params) : void {
        this.pivotInstance = params.component;
        var dataSource = this.pivotInstance.getDataSource();
        dataSource.state(this.model.pivotState);
    }

    private onContentReady(params) : void {
        var that = this;

        /*
            Pivot Widget lib does not allow templates in fieldPanel
            Using JQuery/Compile to insert column control.
         */
        let panelElems = params.element.find(fieldPanelSelector);
        panelElems.each((idx, panelElem) => {
            var $panelElem = $(panelElem);
            let vizCol = that.colIdToColumnModel[$panelElem.text()];
            $panelElem.empty();
            var fieldTemplate = $templateCache.get('column-menu-btn');
            var scope = that.createChildScope();
            _.assign(scope, {
                item: vizCol
            });
            var $fieldElem = angularUtil.getCompiledElement(fieldTemplate, scope);
            $fieldElem.appendTo($panelElem);
            $panelElem.css('visibility', 'visible');
        });
        this.updateState();
    }

    private updateState() {
        var dataSource = this.pivotInstance.getDataSource();
        var fields: any[] = _.sortBy(dataSource.fields(), 'areaIndex');
        var self = this;
        var axisConfig = {
            xAxisColumns: [],
            yAxisColumns: [],
            legendColumns: []
        };
        axisConfig = fields.reduce((config, field) => {
            var targetAxis = areaToAxisMap[field.area];
            axisConfig[targetAxis].push(self.colIdToColumnModel[field.dataField]);
            return config;
        }, axisConfig);

        var newChartConfig = new ChartAxisConfig(
            axisConfig.xAxisColumns,
            axisConfig.yAxisColumns,
            axisConfig.legendColumns
        );
        if(!self.model.getAxisConfig().isAxisConfigEqual(newChartConfig)) {
            self.model.updateAxisConfigAndSetBackendConfig(newChartConfig);
        }
        var state = dataSource.state();
        delete state.fields; // We do not want to save the field info in state.
        self.model.pivotState = state;
        self.onChanged();
    }
}
