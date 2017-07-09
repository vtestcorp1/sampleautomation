/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Component to view and edit the chart axis configuration.
 */

import _ from 'lodash';
import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../../base/decorators';
import {VisualizationColumnModel} from '../../../callosum/model/visualization-column';
import {validateAxisColumns} from '../../../viz-layout/viz/chart/axis-column-validation-service';
import {ChartAxisConfig} from '../../../viz-layout/viz/chart/chart-axis-config';
import {ChartModel} from '../../../viz-layout/viz/chart/chart-model';
import {ChartAxisLockerComponent} from '../chart-axis-locker/chart-axis-locker';
import {ChartAxisConfigValidationErrors} from './chart-axis-config-validation-errors';

var Logger = ngRequire('Logger');
var chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');

let templateUrl = 'src/modules/charts/chart-editor/chart-axis-configurator/' +
    'chart-axis-configurator.html';

@Component({
    name: 'bkChartAxisConfigurator',
    templateUrl: templateUrl
})
export class ChartAxisConfiguratorComponent extends BaseComponent {
    public selectedAxisConfig: ChartAxisConfig;
    public validationErrors: ChartAxisConfigValidationErrors;
    public isConfigValidForChartType = true;
    public xAxisColumnChoices: Array<VisualizationColumnModel> = [];
    public yAxisColumnChoices: Array<VisualizationColumnModel> = [];
    public legendColumnChoices: Array<VisualizationColumnModel> = [];
    public radialColumnChoices: Array<VisualizationColumnModel> = [];
    public columnIdToDisambiguatedName: {[columnId:string] : string} = {};
    public isYAxisShared = false;
    public axisLockerComponent: ChartAxisLockerComponent;

    private chartModel: ChartModel;
    private logger: any;
    private myStrings: any;
    private onDoneCallback: Function;

    constructor(chartModel: ChartModel, onDoneCallback: Function) {
        super();
        this.logger = Logger.create('chart-controller-editor');
        this.myStrings = this.strings.chart.chartEditor.chartAxisConfigurator;

        this.chartModel = chartModel;
        this.onDoneCallback = onDoneCallback;

        this.selectedAxisConfig = new ChartAxisConfig(
            this.chartModel.getXAxisColumns(),
            this.chartModel.getYAxisColumns(),
            this.chartModel.getLegendColumns(),
            this.isRadialSelectorEnabled() ? this.chartModel.getRadialColumn() : null
        );
        this.updateAxisColumnChoices();
        this.columnIdToDisambiguatedName = getColumnIdToDisambiguatedName(
            this.chartModel.getColumns()
        );
        this.isYAxisShared = this.chartModel.isYAxisShared();
        this.axisLockerComponent = new ChartAxisLockerComponent(this.chartModel);
    }

    public getAxesAlias() {
        let options = chartTypeSpecificationService.configOptions(
            this.chartModel.getChartType(),
            this.chartModel
        );
        return _.assignIn(
            {
                xAxis: this.myStrings.X_AXIS,
                yAxis: this.myStrings.Y_AXIS,
                legend: this.myStrings.LEGEND,
                radial: this.myStrings.RADIAL
            },
            options.axesAlias
        );
    }

    public onAxisColumnChange() {
        this.validateAndTryUpdatingConfig();
    }

    public filterByInput(input: string) : Function {
        return (column: VisualizationColumnModel) => {
            let displayName = this.columnIdToDisambiguatedName[column.getSageOutputColumnId()];
            let lowerCaseName = displayName.toLowerCase();
            let index = lowerCaseName.indexOf(input);
            return index >= 0;
        };
    }

    public isLegendSelectorDisabled() : boolean {
        let options = chartTypeSpecificationService.configOptions(
            this.chartModel.getChartType(),
            this.chartModel
        );
        return !this.legendColumnChoices
            || this.legendColumnChoices.length === 0
            || !!options.legendDisabled;
    }

    public toggleYAxisSharing() {
        this.isYAxisShared = !this.isYAxisShared;
        this.validateAndTryUpdatingConfig();
    }

    public tryUpdatingConfig () {
        if (!this.hasValidationErrors() && this.isConfigValidForChartType) {
            this.updateModel();
            this.chartModel.setIsConfigurationLocked(true);
            this.onDoneCallback();
        }
    }

    public showYAxisSharingButton () : boolean {
        return this.selectedAxisConfig.yAxisColumns.length > 1;
    }

    private hasValidationErrors() {
        return _.findIndex(Object.values(this.validationErrors), err => !!err) !== -1;
    }

    private updateModel() {
        this.chartModel.updateAxisConfigAndSetBackendConfig(this.selectedAxisConfig);
        this.chartModel.setIsYAxisShared(this.isYAxisShared);
    }

    private isRadialSelectorEnabled() : boolean {
        let options = chartTypeSpecificationService.configOptions(
            this.chartModel.getChartType(),
            this.chartModel
        );
        return !!options.radialEnabled;
    }

    private validateAndTryUpdatingConfig() {
        this.validateCurrentColumnConfiguration();
        this.tryUpdatingConfig();
    }

    private validateCurrentColumnConfiguration() {
        this.validationErrors = new ChartAxisConfigValidationErrors(null, null, null, null, null);
        _.assignIn(
            this.validationErrors,
            validateAxisColumns(
                this.selectedAxisConfig,
                this.chartModel.getChartType(),
                this.isYAxisShared,
                this.isRadialSelectorEnabled()
            )
        );
        this.isConfigValidForChartType = chartTypeSpecificationService.validateAxisConfig(
            this.chartModel.getChartType(),
            this.selectedAxisConfig
        );
    }

    private updateAxisColumnChoices() {
        let options = chartTypeSpecificationService.configOptions(
            this.chartModel.getChartType(),
            this.chartModel
        );
        let newColumns = getSortedColumns(this.chartModel.getColumns());

        this.xAxisColumnChoices = newColumns.clone();
        this.yAxisColumnChoices = newColumns.filter(function (column) {
            if (options.attributesOnYAxis && column.isEffectivelyNonNumeric()) {
                return true;
            }
            if (!options.noMeasuresOnYAxis && (column.isEffectivelyNumeric())) {
                return true;
            }
            return false;
        });
        this.legendColumnChoices = newColumns.filter(function (column) {
            return column.isAttribute();
        });
        this.radialColumnChoices = newColumns.filter(function (column) {
            return column.isEffectivelyNumeric();
        });
    }
}

function getSortedColumns(columns: Array<VisualizationColumnModel>) {
    columns.sort(function (a, b) {
        var aName = a.getName(),
            bName = b.getName();
        if (aName > bName) {
            return 1;
        } else if (aName < bName) {
            return -1;
        }
        return 0;
    });
    return columns;
}

function getColumnIdToDisambiguatedName(
    columns: Array<VisualizationColumnModel>
) : {[columnId: string] : string} {
    let columnNameToColumnIndices: {[columnName: string] : Array<number>} = {};
    columns.forEach((column, index) => {
        let thisColumnName = column.getName();
        if (!Object.has(columnNameToColumnIndices, thisColumnName)) {
            columnNameToColumnIndices[thisColumnName] = [];
        }
        columnNameToColumnIndices[thisColumnName].push(index);
    });

    let columnIdToDisambiguatedName: {[columnId: string] : string} = {};
    let ambigousNameTemplate = '{1} - <span class="bk-axis-column-source">in {2}</span>';
    _.forIn(columnNameToColumnIndices, (columnIndices, columnName) => {
        if (columnIndices.length === 1) {
            let column = columns[columnIndices[0]];
            columnIdToDisambiguatedName[column.getSageOutputColumnId()] = columnName;
        } else {
            columnIndices.forEach((columnIndex) => {
                let column = columns[columnIndex];
                let disambiguatedName = ambigousNameTemplate.assign(
                    columnName,
                    column.getSourceName()
                );
                columnIdToDisambiguatedName[column.getSageOutputColumnId()] = disambiguatedName;
            });
        }
    });

    return columnIdToDisambiguatedName;
}
