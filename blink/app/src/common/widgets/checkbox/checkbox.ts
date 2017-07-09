/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Controller for checkbox component.
 */

'use strict';

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component, Provide} from '../../../base/decorators';

export enum CheckboxState {
    UNCHECKED,
    PARTIAL,
    CHECKED
}

Provide('checkbox')({
    CheckboxState
});

@Component({
    name: 'bkCheckbox',
    templateUrl: 'src/common/widgets/checkbox/checkbox.html'
})
export default class CheckboxComponent extends BaseComponent {

    private isReadOnly: boolean = false;
    private id?: string;
    private onClickCallback?: (($event: JQueryEventObject, id?: string) => void);
    private isTriStateMode = false;
    private shouldTruncate = false;

    public static __getExamples() {
        let enabled1 = true,
            enabled2 = false,
            triState = CheckboxState.PARTIAL;
        return [
            {
                ctrl: new CheckboxComponent('Enabled and Checked', () => enabled1)
                    .setOnClick(($event) => enabled1 = !enabled1),
            },
            {
                ctrl: new CheckboxComponent('Enabled and Unchecked', () => enabled2)
                    .setOnClick(($event) => enabled2 = !enabled2),
            },
            {
                ctrl: (new CheckboxComponent('Disabled and Checked', () => true))
                    .setReadOnly(true)
            },
            {
                ctrl: (new CheckboxComponent('Disabled and unchecked', () => false))
                    .setReadOnly(true)
            },
            {
                ctrl: (new CheckboxComponent('Tri State Checkbox', () => triState))
                    .setTriStateMode(true)
                    .setOnClick(($event) => {
                        triState = (triState + 1) % 3;
                    })
            },
            {
                ctrl: (new CheckboxComponent('Tri State Disabled', () => CheckboxState.PARTIAL))
                    .setTriStateMode(true)
                    .setReadOnly(true)
            }
        ];
    }

    constructor(
        private label: string,
        private stateGetter: (() => boolean)|(() => CheckboxState)) {
        super();
    }

    public setOnClick(
        onClickCallback: ($event: JQueryEventObject, id?: string) => void
    ): CheckboxComponent {
        this.onClickCallback = onClickCallback;
        return this;
    }

    public setLabel(label: string): this {
        this.label = label;
        return this;
    }

    public setReadOnly(isReadOnly: boolean): CheckboxComponent {
        this.isReadOnly = isReadOnly;
        return this;
    }

    public setID(id: string): CheckboxComponent {
        this.id = id;
        return this;
    }

    public setTriStateMode(isTriState: boolean): this {
        this.isTriStateMode = isTriState;
        return this;
    }

    public setShouldTruncate(shouldTruncate: boolean): this {
        this.shouldTruncate = shouldTruncate;
        return this;
    }

    public getLabel(): string {
        return this.label;
    }

    public getID(): string {
        return this.id;
    }

    /**
     * Meant to be called from template file only.
     */
    public onClick($event: JQueryEventObject) {
        if (this.isReadOnly) {
            return;
        }
        if  (this.onClickCallback !== void 0) {
            this.onClickCallback($event, this.id);
        }
    }

    /**
     * Meant to be called from template file only.
     */
    public isPartialState(): boolean {
        return this.isTriStateMode && this.stateGetter() === CheckboxState.PARTIAL;
    }
}
