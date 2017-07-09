/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */

'use strict';
import {BaseComponent} from '../../base/base-types/base-component';
import {Component} from '../../base/decorators';
import {AddEmailComponent} from '../add-email/add-email-component';
import {AddPrincipalComponent} from '../add-principal/add-principal-component';
import {getWhiteListedEmailDomainsForReport} from '../callosum/service/session-service';
import {PermissionsListComponent} from '../share/share-permissions/permissions-list';
import {PrincipalType, SharePrincipal} from '../share/share-principal/share-principal';

@Component({
    name: 'bkPrincipalsSelector',
    templateUrl: 'src/modules/principal-selector/principal-selector.html'
})
export default class PrincipalsSelectorComponent extends BaseComponent {
    public addEmailComponent: AddEmailComponent;
    public addPrincipalSectionExpanded: boolean = false;
    public addPrincipalComponent: AddPrincipalComponent;
    public permissionsListComponent: PermissionsListComponent;

    private onSelectionChange: (principals: SharePrincipal[]) => void;
    private selectedPrincipals: SharePrincipal[];

    constructor(
        selectedPrincipals: SharePrincipal[],
        onSelectionChange: (principals: SharePrincipal[]) => void
    ) {
        super();

        this.onSelectionChange = onSelectionChange;
        this.selectedPrincipals = selectedPrincipals;
        this.initPermissionListComponent();
        this.initAddEmailComponent();
        this.initAddPrincipalComponent();
    }

    public toggleAddPrincipalSection() {
        this.addPrincipalSectionExpanded = !this.addPrincipalSectionExpanded;
    }

    private initPermissionListComponent() {
        this.permissionsListComponent = new PermissionsListComponent(
            this.selectedPrincipals,
            false,
            this.deletePrincipal,
            null,
            false
        );
    }

    private initAddEmailComponent() {
        this.addEmailComponent = new AddEmailComponent(
            this.addPrincipals,
            getWhiteListedEmailDomainsForReport()
        );
    }

    private initAddPrincipalComponent() {
        this.addPrincipalComponent = new AddPrincipalComponent(
            this.strings.Users_or,                      /* name */
            false,                                 /* readOnlyPermission */
            'bk-dialog-field',                     /* cssClass */
            false,                                 /* displayPermission */
            this.addPrincipals,                    /* permissionAddedHandler */
            null,                                  /* cancelHandler */
            [],                                    /* idsToSkip */
            false                                  /* filterCurrentUser*/
        );
        let nonEmailPrincipals = this.selectedPrincipals
            .filter((principal) => {return principal.sharingType !== PrincipalType.EMAIL;})
            .map(principal => principal.id);
        this.addPrincipalComponent.addIdsToSkip(nonEmailPrincipals);
    }

    private addPrincipals = (principals: SharePrincipal[]): void => {
        this.selectedPrincipals = this.selectedPrincipals.concat(principals);
        this.permissionsListComponent.setPrincipals(this.selectedPrincipals);
        let nonEmailPrincipals = principals
            .filter((principal) => {return principal.sharingType !== PrincipalType.EMAIL;})
            .map(principal => principal.id);
        this.addPrincipalComponent.addIdsToSkip(nonEmailPrincipals);
        this.onSelectionChange(this.selectedPrincipals);
    }

    private deletePrincipal = (principal: SharePrincipal): void => {
        this.selectedPrincipals.remove(principal);
        this.permissionsListComponent.setPrincipals(this.selectedPrincipals);
        this.addPrincipalComponent.removeIdsToSkip([principal.id]);
        this.onSelectionChange(this.selectedPrincipals);
    }
}
