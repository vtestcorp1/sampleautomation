/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Gunjan Jha(gunjan.jha@thoughtspot.com)
 *
 * @fileoverview This component displays the sage columns for customer to exclude for
 * a3 analysis.
 *
 */

'use strict';

import {Component} from '../../../base/decorators';
import CheckboxComponent from '../../../common/widgets/checkbox/checkbox';
import {AnswerSageClient} from '../../sage-client/answer-sage-client';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {A3AnalysisCustomizerComponent} from '../a3-analysis-customizer/a3-analysis-customizer';
import {A3DrillColumnSelectorComponent} from '../a3-drill-column-selector/a3-drill-column-selector';

/**
 * Column exclusion component
 */
@Component({
    name: 'bkA3ExcludeColumnSelector',
    templateUrl: 'src/modules/a3/a3-exclude-column-selector/a3-exclude-column-selector.html'
})
export class A3ExcludeColumnSelectorComponent extends A3DrillColumnSelectorComponent {

    public checkboxComponent: any;
    public isCheckBoxEnabled: boolean = false;

    public constructor(sageClient: AnswerSageClient,
                       selectedTokens,
                       a3AnalysisCustomizerComponent: A3AnalysisCustomizerComponent) {
        super(
            sageClient,
            selectedTokens,
            a3AnalysisCustomizerComponent,
            jsonConstants.a3.SELECTION_EXCLUDE
        );
        this.init();
    }

    public rememberSettings() {
        if (!!this.isCheckBoxEnabled) {
            this.a3UserPreference.setExcludeTokens(
                this.getSelectedColumns(),
                this.getUnselectedColumns());
            this.a3UserPreference.saveUserPreferenceProto();
        }
    }

    private init(): void {
        this.checkboxComponent = new CheckboxComponent(
            this.strings.preferences.a3.rememberSettings,
            () => this.isCheckBoxEnabled)
            .setOnClick((title, id) => this.isCheckBoxEnabled = !this.isCheckBoxEnabled);

        this.checkboxComponent
            .setID('name')
            .setReadOnly(false);
    }
}

