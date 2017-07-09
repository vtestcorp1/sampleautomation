/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is the component used to display chart type selector.
 */

import {BaseComponent} from '../../../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../../../base/decorators';
import {ChartModel} from '../../../viz/chart/chart-model';

let chartTypeSpecificationService = ngRequire('chartTypeSpecificationService');
let util = ngRequire('util');

let templatePath = 'src/modules/viz-layout/answer/viz-type-selector/' +
    'chart-type-selector-v2/chart-type-selector-v2.html';

@Component({
    name: 'bkChartTypeSelectorV2',
    templateUrl: templatePath
})

export class ChartTypeSelectorV2Component extends BaseComponent {
    private chartModel: ChartModel;
    private onSelection: Function;
    private isChartSelected: boolean;

    constructor(chartModel: ChartModel,
                onSelection: Function,
                isChartSelected: boolean) {
        super();
        this.chartModel = chartModel;
        this.onSelection = onSelection;
        this.isChartSelected = isChartSelected;
    }

    public isCurrentType(chartType: string) {
        let modelChartType = this.chartModel && this.chartModel.getChartType();

        return this.isChartSelected && modelChartType === chartType;
    }

    public isVizTypeSupported (chartType: string) {
        return this.chartModel ? this.chartModel.isChartTypeSupported(chartType) : false;
    }

    public getChartTypes () {
        return chartTypeSpecificationService.chartTypesInDisplayOrder;
    }

    public getTooltip (chartType: string) {
        if (this.isVizTypeSupported(chartType)) {
            return;
        } else {
            return chartTypeSpecificationService.getDisabledChartTooltip(chartType);
        }
    }

    public onVizTypeSelection (chartType: string) {
        if (!this.chartModel || !this.chartModel.isChartTypeSupported(chartType)
            || (this.isChartSelected && this.chartModel.getChartType() === chartType)) {
            return;
        }

        this.onSelection(chartType);
    }

    public getDisplayName (chartType: string) {
        var displayName = util.replaceAll(chartType, '_', ' ');
        return displayName.capitalize(true);
    }

    public getChartImagePath (chartType: string) : string {
        let path = '/resources/img/viz-selector-icons/chart-icons/{1}_icon_24.svg';
        return path.assign(chartType.toLowerCase());
    }
}
