/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Controller select component.
 */

'use strict';

import _ from 'lodash';
import {Component, ngRequire} from 'src/base/decorators';
import {UIComponent} from '../../../base/base-types/ui-component';
import {strings} from '../../../base/strings';

let util = ngRequire('util');

export interface SelectOption {
    id: string;
    caption: string;
    isDisabled?: boolean;
    showSeparator?: boolean;
}

export interface SelectConfig {
    /**
     * Placeholder to show when no value is selected.
     */
    placeholder?: string;
    /**
     * List of options to show in the dropdown.
     */
    options: SelectOption[];

    /**
     * ID of the initially selected item.
     */
    selectedID?: string;

    onSelectionChanged?: (newOption: SelectOption) => void;

    onDropdownToggled?: (newState: boolean) => void;

    appendToBody?: boolean;

    customCssClass?: string;

    isDisabled?: boolean;
}

@Component({
    name: 'bkSelect',
    templateUrl: 'src/common/widgets/select/select.html'
})
export default class SelectComponent extends UIComponent {

    private placeholder: string;
    private optionsMap: { [optionID: string]: SelectOption };
    private showDropdown = false;
    private selectedID: string | null = null;
    private onSelectionChanged?: (newOption: SelectOption) => void;
    private $head: JQuery;
    private $body: JQuery;
    private appendToBody: boolean = true;
    private onDropdownToggled: (newState: boolean) => void;
    private customCssClass: string;
    private isDisabled: boolean = false;

    public static __getExamples() {
        return [
            {
                ctrl: new SelectComponent({
                    options: [
                        {id: '1', caption: '1'},
                        {id: '2', caption: '2'},
                        {id: 'baz', caption: 'I am disabled!', isDisabled: true},
                        {id: 'hello', caption: 'Hello world!', showSeparator: true},
                        {id: 'hi', caption: 'This is our new Selector'},
                        {id: 'it', caption: 'It should be used in new code!'}
                    ],
                    customCssClass: 'bk-example-selector1'
                })
            },
            {
                ctrl: new SelectComponent({
                    options: [
                        {id: '1', caption: 'Read Only'},
                        {id: '2', caption: 'Editable'}
                    ],
                    appendToBody: false,
                    onSelectionChanged: (newOption: SelectOption) => {
                        alert('New selection: ' + newOption.caption);
                    },
                    selectedID: '2'
                })
            },
            {
                ctrl: new SelectComponent({
                    placeholder: 'Disabled Selector',
                    options: [],
                    isDisabled: true,
                    customCssClass: 'bk-example-selector3'
                })
            }
        ];
    }

    constructor(
        config: SelectConfig
    ) {
        super();
        this.buildOptionsMap(config.options);
        this.selectedID = config.selectedID || null;
        this.placeholder = config.placeholder || strings.default_select_placeholder;
        this.onSelectionChanged = config.onSelectionChanged;
        if (config.appendToBody !== void 0) {
            this.appendToBody = config.appendToBody;
        }
        if (config.isDisabled !== void 0) {
            this.isDisabled = config.isDisabled;
        }
        this.onDropdownToggled = config.onDropdownToggled;
        this.customCssClass = config.customCssClass
            || ('bk-select-' + util.getRandomAlphaNumericString(8));
    }

    public postLink($el: JQuery) {
        this.$body = $el.find('.bk-select-body');
        this.$head = $el.find('.bk-select-head');
        if (this.appendToBody) {
            this.$body.appendTo('body');
        }
        this.showDropdown = false;
    }

    public isDropdownOpen(): boolean {
        return this.showDropdown;
    }

    public closeDropdown(): this {
        if (this.showDropdown) {
            this.toggleDropdown();
        }
        return this;
    }

    public toggleDropdown(): this {
        this.showDropdown = !this.showDropdown;
        if (this.onDropdownToggled !== void 0) {
            this.onDropdownToggled(this.showDropdown);
        }
        return this;
    }

    public getSelectedID(): string {
        return this.selectedID;
    }

    public getSelectedText(): string {
        return !!this.selectedID
            ? this.optionsMap[this.selectedID].caption
            : this.placeholder;
    }

    public isOptionSelected(option: SelectOption): boolean {
        return this.selectedID === option.id;
    }

    public getIsDisabled(): boolean {
        return this.isDisabled;
    }

    public setIsDisabled(isDisabled: boolean): this {
        this.isDisabled = isDisabled;
        this.closeDropdown();
        return this;
    }

    // Following functions are to be called from HTML only.

    public onHeadClick($event): void {
        if (this.isDisabled) {
            return;
        }
        this.toggleDropdown();
        if (this.showDropdown && this.appendToBody) {
            let offset = this.$head.offset();
            // NOTE: This should be 2rem, not sure how to convert 2rem to pixels.
            // Currently in our app 1rem = 10px.
            this.$body.css({'left': offset.left, 'top': offset.top + 20});
        }
    }

    public onOptionClick(option: SelectOption, $event): void {
        if (!this.showDropdown || option.isDisabled || this.selectedID === option.id) {
            return;
        }
        this.selectedID = option.id;
        this.closeDropdown();
        if (this.onSelectionChanged !== void 0) {
            this.onSelectionChanged(option);
        }
    }

    public getDropdownArrowIcon(): string {
        let arrowIconPath = this.isDisabled
            ? 'dropdownarrow_disabled_14.svg'
            : 'dropdownarrow_14.svg';
        return `/resources/img/${arrowIconPath}`;
    }

    public onDestroy($el: JQuery) {
        if (this.appendToBody) {
            this.$body.remove();
        }
    }

    private buildOptionsMap(options: SelectOption[]): void {
        this.optionsMap = _.reduce(options, (obj, option) => {
            obj[option.id] = option;
            return obj;
        }, {});
    }
}
