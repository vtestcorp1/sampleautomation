/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  Component for viewing a sharing permission
 */
import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';
import {PrincipalViewerComponent} from '../share-principal/principal-viewer-component';
import {SharePrincipal} from '../share-principal/share-principal';
import {PermissionDropdownComponent} from './permission-dropdown';


@Component({
    name: 'bkSharingRow',
    templateUrl: 'src/modules/share/share-permissions/share-permission.html'
})
export class SharingRowComponent extends BaseComponent {

    private principalViewer: PrincipalViewerComponent;
    private permissionDropdown: PermissionDropdownComponent;

    public constructor(
        private sharePrincipal: SharePrincipal,
        private readOnly: boolean = false,
        private deleteHandler: (SharePrincipal) => void,
        private changeHandler: (SharePrincipal) => void,
        private showPermissionPlugin: boolean = true) {

        super();

        this.principalViewer = new PrincipalViewerComponent(sharePrincipal.id,
            sharePrincipal.name,
            sharePrincipal.displayName,
            sharePrincipal.sharingType);
        if (this.showPermissionPlugin) {
            this.permissionDropdown = new PermissionDropdownComponent(
                this.sharePrincipal.permissionType,
                this.readOnly,
                <(string) => void>this.onChange.bind(this)
            );
        }
    }

    public onDelete(principal: SharePrincipal): void {
        this.deleteHandler(principal);
    }

    public onChange(permissionType: string): void {
        this.sharePrincipal.permissionType = permissionType;
        this.changeHandler(this.sharePrincipal);
    }

    public getPermission(): string {
        return this.sharePrincipal.permissionType;
    }

}
