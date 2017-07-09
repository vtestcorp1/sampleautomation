/**
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 * Copyright: ThoughtSpot Inc. 2017
 *
 * @fileoverview UI component that renders a list of action items, each action item can have a
 * a label and define an onClick handler etc.
 */

import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';

export interface ActionMenuItem {
    id: string;
    label?: string;
    icon?: string;
    class?: string;
    showWhen?: () => boolean;
    // TODO(mahesh): Rename these item names by stripping the 'dropdownItem' prefix.
    // Currently keeping these names to avoid renaming of calling sites to keep the scope of commit
    // small.
    dropdownItemDisabled?: boolean|(() => boolean);
    dropdownItemTooltip?: string;
    customContent?: string;
    customData?: any;
    onClick?: ($event: Event) => void;
}

@Component({
    name: 'bkActionMenu',
    templateUrl: 'src/common/widgets/action-menu/action-menu.html'
})
export class ActionMenuComponent extends BaseComponent {

    public static __getExamples() {
        return [
            {
                ctrl: new ActionMenuComponent([
                    {
                        id: 'a',
                        label: 'Simple Item'
                    },
                    {
                        id: 'b',
                        label: 'With click handler (Click Me)',
                        onClick: () => alert('I was clicked!')
                    },
                    {
                        id: 'c',
                        label: 'Disabled Item',
                        dropdownItemDisabled: true,
                        dropdownItemTooltip: 'Not supported yet'
                    },
                    // example using customContent, customData will be available using
                    // action.customData
                    {
                        id: 'd',
                        customContent: '<input placeholder="{{action.customData.placeholder}}">',
                        customData: {
                            placeholder: 'Custom HTML'
                        }
                    },
                ])
            }
        ];
    }

    constructor(public menuItems: ActionMenuItem[]) {
        super();
    }

    public isItemDisabled(item: ActionMenuItem): boolean {
        if (_.isFunction(item.dropdownItemDisabled)) {
            return item.dropdownItemDisabled();
        }
        return item.dropdownItemDisabled;
    }

    public shouldShowItem(item: ActionMenuItem): boolean {
        if (!item.showWhen) {
            return true;
        }
        return item.showWhen();
    }

    public getDisabledTooltip(item: ActionMenuItem): string {
        if (this.isItemDisabled(item)) {
            return item.dropdownItemTooltip;
        }
        return '';
    }

    public onMenuItemClick(item: ActionMenuItem, $event: Event): void {
        if (this.isItemDisabled(item) || !!item.customContent) {
            return;
        }
        item.onClick($event);
    }
}
