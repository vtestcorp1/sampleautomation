/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Dropdown listing permissions
 */

import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';
import {strings} from 'src/base/strings';
import {jsonConstants} from 'src/modules/viz-layout/answer/json-constants';

declare let angular;

const permissionTypeLabels = {
    READ_ONLY: strings.sharePanel.READ_ONLY,
    MODIFY: strings.sharePanel.MODIFY,
    VARIES: strings.sharePanel.VARIES
};

@Component({
    name: 'bkPermissionDropdown',
    templateUrl: 'src/modules/share/share-permissions/permission-dropdown.html'
})
export class PermissionDropdownComponent extends BaseComponent {

    public static __getExamples() {
        return [
            {
                ctrl: new PermissionDropdownComponent()
            }
        ];
    }
    public constructor(
        private permissionType : string = jsonConstants.permission.READ_ONLY,
        private readOnly: boolean = false,
        private changeHandler?: (permissionType: string) => void) {
        super();
    }

    protected getPermissionType(): string {
        return this.permissionType;
    }

    public onChange(): void {
        if (!!this.changeHandler) {
            this.changeHandler(this.permissionType);
        }
    }
    /**
     * Return the permission type label (Can View, Can Edit, Varies) given a permission type
     *
     * @param  type  The permission type
     * @return       The permission label
     */
    protected getPermissionTypeLabel(type: string): string  {
        return permissionTypeLabels[type];
    }
    /**
     * Returns the permission options that should be displayed in the drop down
     * menus through which the user can choose a permission type to assign.
     * By default the drop down displays "Can View" and "Can Edit" options,
     * but if "Varies" needs to be shown, then we add it as a third option.
     *
     * @param  type  The permission type
     * @return       An array of strings
     */
    protected getPermissionTypes (type: string):any[] {
        let permissionTypes = Object.keys(permissionTypeLabels);
        if (type !== jsonConstants.permission.VARIES) {
            permissionTypes = permissionTypes.exclude(jsonConstants.permission.VARIES);
        }
        return permissionTypes;
    }
}
