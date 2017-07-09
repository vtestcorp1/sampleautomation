/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  Component for adding a principal
 */

import {BaseComponent} from '../../base/base-types/base-component';
import {Component} from '../../base/decorators';
import {PrincipalSelectorComponent} from '../metadata-item-selector/principal-item-selector';
import {PermissionDropdownComponent} from '../share/share-permissions/permission-dropdown';
import {getSharePrincipal} from '../share/share-principal/share-principal';

const defaultPermissionType = 'READ_ONLY';

@Component({
    name: 'bkAddPrincipal',
    templateUrl: 'src/modules/add-principal/add-principal.html'
})
export class AddPrincipalComponent extends BaseComponent {
    private principalSelectorComponent: PrincipalSelectorComponent;
    private newPermissionTypeDropDown: PermissionDropdownComponent;
    private newPermissionType: string = defaultPermissionType;

    public constructor(
        public name: string,
        private readOnlyPermission: boolean,
        private cssName: string,
        private displayPermissionPlugin: boolean,
        private permissionAddedHandler: any,
        private cancelHandler: any,
        idsToSkip: string[],
        filterCurrentUser: boolean = true
    ) {
        super();

        this.newPermissionTypeDropDown = new PermissionDropdownComponent(this.newPermissionType,
            this.readOnlyPermission, this.permissionChanged);
        this.principalSelectorComponent = new PrincipalSelectorComponent(filterCurrentUser);
        this.principalSelectorComponent.allowMultiSelect(true);
        this.principalSelectorComponent.setSelectedGuids(idsToSkip);

    }
    public addPermissions() {
        let newUsersOrGroups = this.getSelectedEntities();
        newUsersOrGroups.forEach((entity) => {
            entity.permissionType = this.newPermissionType;
        });
        //TODO(chab) enforce the handler to return IPromise and handle errors
        this.permissionAddedHandler(newUsersOrGroups);
        //if success, clear items, and add ID to the set of excluded IDS
        this.principalSelectorComponent.clearSelectedItems();
        this.principalSelectorComponent.addIdsToSkip(newUsersOrGroups.map((u) => u.id ));
    }

    public cancel() {
        this.cancelHandler();
    }

    public setIdsToSkip(idsToSkip: string[]) {
        this.principalSelectorComponent.setSelectedGuids(idsToSkip);
    }
    public addIdsToSkip(idsToSkip: string[]) {
        this.principalSelectorComponent.addIdsToSkip(idsToSkip);
    }
    public removeIdsToSkip(idsToSkip: string[]) {
        this.principalSelectorComponent.removeIdsToSkip(idsToSkip);
    }

    private getSelectedEntities() {
        let selectedEntities: any[] = <any[]> this.principalSelectorComponent.getSelectedItems();
        return selectedEntities.map((item) => getSharePrincipal(
            item.id,
            item.name,
            item.displayName,
            (item.type && item.type === 'LOCAL_GROUP')
        ));
    }

    private permissionChanged = (permissionType) => {
        this.newPermissionType = permissionType;
    }
}
