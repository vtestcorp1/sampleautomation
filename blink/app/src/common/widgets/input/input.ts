/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Input field UI component.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';

export interface InputConfig {
    initialValue?: string;
    onChange?: (newText: string) => void;
    placeholder?: string;
    icon?: string;
}

@Component({
    name: 'bkInput',
    templateUrl: 'src/common/widgets/input/input.html'
})
export class InputComponent extends BaseComponent {

    private _value: string;
    private placeholder: string;
    private onChange?: (newText: string) => void;
    private icon?: string;

    public static __getExamples() {
        return [
            {
                ctrl: new InputComponent({
                    placeholder: 'Type something...',
                })
            },
            {
                ctrl: new InputComponent({
                    placeholder: 'Search...',
                    icon: '/resources/img/search_16.svg'
                })
            }
        ];
    }

    constructor(config?: InputConfig) {
        super();
        if (!config) {
            config = {};
        }
        this._value = config.initialValue || '';
        this.placeholder = config.placeholder || '';
        this.icon = config.icon || null;
        this.onChange = config.onChange;
    }

    public get value(): string {
        return this._value;
    }

    public set value(value: string) {
        if (value !== this._value) {
            this._value = value;
            if (this.onChange !== void 0) {
                this.onChange(this._value);
            }
        }
    }
}
