/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Exports a class for VisualizationPinnerController.
 */
import {strings} from 'src/base/strings';
import {BaseComponent} from '../../../../../../base/base-types/base-component';
import {Component, ngRequire} from '../../../../../../base/decorators';
import {VisualizationModel} from '../../../visualization-model';

let jsonConstants: any = ngRequire('jsonConstants');
let userDialogs = ngRequire('userDialogs');

@Component({
    name: 'bkVisualizationPinnerLauncher',
    templateUrl: 'src/modules/viz-layout/viz/common/pinboard-drop-down/' +
                 'visualization-pinner/visualization-pinner.html'
})

export class VisualizationPinnerLauncherComponent extends BaseComponent {
    public strings: any;
    private isHeadlineVizType: any;

    constructor(private vizModel: VisualizationModel) {
        super();
        this.strings = strings.visualizationPinner.trigger;
        this.vizModel = vizModel;
        this.isHeadlineVizType = this.vizModel.getVizType() === jsonConstants.vizType.HEADLINE;
    }

    public launchPinningWorkflow() {
        userDialogs.showVisualizationPinnerDialog(this.vizModel);
    }
}
