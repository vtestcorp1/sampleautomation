/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Controller for radio button component.
 */

'use strict';

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';

@Component({
    name: 'bkRadioButton',
    templateUrl: 'src/common/widgets/radio-button/radio-button.html'
})
export default class RadioButtonComponent extends BaseComponent {

    public static __getExamples() {
        return [
            {
                ctrl: new RadioButtonComponent(
                    'Checked Button',
                    () => true,
                    () => void 0,
                )
            },
            {
                ctrl: new RadioButtonComponent(
                    'Unchecked Button',
                    () => false,
                    () => void 0
                )
            },
            {
                ctrl: new RadioButtonComponent(
                    'Disabled checked button',
                    () => true,
                    () => void 0,
                    () => true
                )
            },
            {
                ctrl: new RadioButtonComponent(
                    'Disabled unchecked button',
                    () => false,
                    () => void 0,
                    () => true,
                )
            }
        ];
    }

    constructor(
        private label: string,
        private isSelectedChecker: () => boolean,
        private clickHandler: () => void,
        private isDisabledChecker?: () => boolean
    ) {
        super();
    }

    public getLabel(): string {
        return this.label;
    }

    public isSelected(): boolean {
       return this.isSelectedChecker();
    }

    public isDisabled(): boolean {
        if (!this.isDisabledChecker) {
            return false;
        }
       return this.isDisabledChecker();
    }

    public handleClick() {
        if (this.isDisabled()) {
            return;
        }
        this.clickHandler();
    }
}
