import {BaseComponent} from '../../../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../../../base/decorators';
import {ChartTypeSelectorV2Component} from './../chart-type-selector-v2/chart-type-selector';

let util = ngRequire('util');

@Component({
    name: 'bkChartTypeSelectorPanel',
    templateUrl: 'src/modules/viz-layout/answer/viz-type-selector/chart-type-selector-panel/' +
                 'chart-type-selector-panel.html'
})

export class ChartTypeSelectorPanelComponent extends BaseComponent {
    public chartTypeSelectorComponent: ChartTypeSelectorV2Component;
    public onClose: Function;

    private answerModel: any;
    private answerDisplayMode: any;
    private onVizTypeSelection: Function;

    constructor(answerModel: any,
                answerDisplayMode: any,
                onVizTypeSelection: Function,
                onClose: Function
    ) {
        super();
        this.answerModel = answerModel;
        this.answerDisplayMode = answerDisplayMode;
        this.onVizTypeSelection = onVizTypeSelection;

        let chartModel = this.answerModel.getCurrentAnswerSheet().getChartVisualizations()[0];
        this.chartTypeSelectorComponent = new ChartTypeSelectorV2Component(
            chartModel,
            this.onVizTypeChangeCallback,
            this.answerDisplayMode !== util.answerDisplayModes.TABLE
        );
        this.onClose = onClose;
    }

    private onVizTypeChangeCallback = (vizType) => {
        this.onVizTypeSelection(vizType);
    }
}
