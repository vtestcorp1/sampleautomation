/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  Component for viewing a list of permissions
 */
import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';
import {jsonConstants} from 'src/modules/viz-layout/answer/json-constants';
import {SharePrincipal} from '../share-principal/share-principal';
import {SharingRowComponent} from './share-permission';

@Component({
    name: 'bkPermissionsList',
    templateUrl: 'src/modules/share/share-permissions/permissions-list.html'
})
export class PermissionsListComponent extends BaseComponent {
    private principalViewers: SharingRowComponent[];

    public constructor(sharePrincipals: SharePrincipal[],
        private readOnly: boolean = false,
        private deleteHandler: (SharePrincipal) => void,
        private changeHandler: (SharePrincipal) => void,
        private showPermissionsPlugin: boolean = true) {
        super();
        this.readOnly = readOnly;
        this.principalViewers = sharePrincipals.map((principal) => new SharingRowComponent(
            principal,
            readOnly,
            this.onDelete,
            this.onChange,
            this.showPermissionsPlugin
        ), this);
    }

    public setPrincipals(sharePrincipals) {
        this.principalViewers = sharePrincipals.map((principal) => new SharingRowComponent(
            principal,
            this.readOnly,
            this.onDelete,
            this.onChange,
            this.showPermissionsPlugin
        ), this);
    }

    /**
     * Function used as a filter to filter out people with NO_ACCESS
     * permissions from the permission list in the UI.
     *
     * @param  permission  The permission object
     * @return True if user has read or modify permissions
     */

    public hasPermissions(viewer: SharingRowComponent) {
        var permission = viewer.getPermission();
        return (permission !== jsonConstants.permission.NO_ACCESS);
    }

    private onDelete = (principal: SharePrincipal): void => {
        this.deleteHandler(principal);
    }

    private onChange = (sharePrincipal): void  => {
        this.changeHandler(sharePrincipal);
    }
}
