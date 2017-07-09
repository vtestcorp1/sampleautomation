/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  Component for the share dialog
 */

import {BaseComponent} from 'src/base/base-types/base-component';
import {Component, ngRequire} from 'src/base/decorators';
import {strings} from 'src/base/strings';
import {jsonConstants} from 'src/modules/viz-layout/answer/json-constants';
import {AddPrincipalComponent} from  '../add-principal/add-principal-component';
import {PermissionsListComponent} from './share-permissions/permissions-list';
import {PrincipalViewerComponent} from  './share-principal/principal-viewer-component';
import {SharePrincipal} from './share-principal/share-principal';

import IPromise = angular.IPromise;

let $q = ngRequire('$q');
let alertService = ngRequire('alertService');
let loadingIndicator = ngRequire('loadingIndicator');
let UserAction = ngRequire('UserAction');
let Logger = ngRequire('Logger');
let metadataPermissionService = ngRequire('metadataPermissionService');
let shareService = ngRequire('shareService');

 const objectTypes: any = {
        answer: jsonConstants.metadataType.QUESTION_ANSWER_BOOK,
        pinboard: jsonConstants.metadataType.PINBOARD_ANSWER_BOOK,
        table: jsonConstants.metadataType.LOGICAL_TABLE,
        column: jsonConstants.metadataType.LOGICAL_COLUMN
 };
const sharingModes = {
        entireTable: 'share-table',
        specificColumns: 'share-columns'
    };
const WORKSHEET_LABEL = 'worksheet';

@Component({
    name: 'bkShareDialog',
    templateUrl: 'src/modules/share/share-dialog.html'
})
export class ShareDialogComponent extends BaseComponent {

    public panelStrings = strings.sharePanel;
    public readOnlyMode: boolean = false;
    public showColumnPermissions: boolean;
    public tableSharingMode: string = sharingModes.entireTable;

    private addPrincipalComponent: AddPrincipalComponent;
    private addUserSectionExpanded: boolean = false;
    private author: any;
    private bulkMode: boolean;
    private columns: any[];
    private isLoading: boolean = false;
    private logger = Logger.create('share-dialog-component');
    private sharedObject;
    private onClear: any;
    private objects: any[];
    private permissionsListComponent: PermissionsListComponent;
    private table: any;

    private type: string;
    private unsavedChanges: boolean = false;
    private userPermissions: SharePrincipal[];


    //TODO(chab) type what remains untyped
    public constructor(config: any, onClear: any) {
        super();
        this.onClear = onClear;
        this.initShareDialog(config);
    }


    /**
     * Expand / Colla[se the add user section and open the chosen drop down
     */
    public expandAddUserSection() {
        this.addUserSectionExpanded = true;
    }
    public collapseAddUserSection() {
        this.addUserSectionExpanded = false;
    }

    /**
     * Discard any unsaved changes and reload permissions from the server
     */
    public discardUnsavedChanges = function(): void {
        this.updatePermissionView(this.objects, this.type);
        this.unsavedChanges = false;
    };

    /**
     * User clicked the delete row button, delete permissions for the corresponding user / group
     *
     * @param permission  The permission object for the row, with an id
     * property containing the user / group id
     */
    public deleteRow = (permission) => {
        this.removeAccessForEntity(this.userPermissions, permission.id);
        this.userChangedPermissions();
    }

    /**
     * Clear the dialog
     */
    public clear = () => {
        if (!!this.onClear) {
            this.onClear();
        }
    }
    /**
     * Clear the dialog if there are no unsaved changes
     */
    public onEscape() {
        if (!this.unsavedChanges) {
            this.clear();
        }
    }

    /**
     * Called when user toggles between "entire table" and "specific columns" when sharing a table
     */
    public onTableOptionRadioClick =  () => {
        let tableSharingMode = this.tableSharingMode;
        if (tableSharingMode === sharingModes.entireTable) {
            this.updatePermissionView([this.table],
                jsonConstants.metadataType.LOGICAL_TABLE);
        } else if (tableSharingMode === sharingModes.specificColumns) {
            this.selectTableColumn(this.columns[0]);
        }
    }

    /**
     * Delete permissions from the local userPermissions array for a given user or group id.
     * This will not result in permissions beeing removed on the server since we are calling
     * the API in non-overwrite mode.
     * To delete permissions on the server, the permission type for the entity has to be set
     * to NO_ACCESS.
     *
     * @param userPermissions  The userPermissions array
     * @param entityId         The user or group id for which to delete the permissions
     */
    private clearLocalPermissionsForEntity(userPermissions: SharePrincipal[],
                                           entityId: string): void {
        userPermissions.remove(function (item) {
            return (item.id === entityId);
        });
    }

    /**
     * Change permission type to NO_ACCESS in the passed in userPermission
     * object for a given user or group id.
     * This will cause callosum to delete permissions for that entity when
     * the changes are saved.
     *
     * @param userPermissions  The userPermissions array
     * @param entityId         The user/group id for which to set the permission to NO_ACCESS
     */
    private removeAccessForEntity(userPermissions: SharePrincipal[],
                                  entityId: string) {
        for (let i = 0, l = userPermissions.length; i < l; i++) {
            if (userPermissions[i].id === entityId) {
                userPermissions[i].permissionType = jsonConstants.permission.NO_ACCESS;
                break;
            }
        }
    }

    /**
     * Returns whether a certain user or group is present in the userPermissions array
     *
     * @param  userPermissions  The userPermissions array
     * @param  id               The user or group id to look for
     * @return True if the given user or group id has been found in the userPermissions array
     */
    private entityHasPermissions(userPermissions, id:string): boolean {
        for (let i = 0; i < userPermissions.length; i++) {
            if (userPermissions[i].id === id &&
                userPermissions[i].permissionType !== jsonConstants.permission.NO_ACCESS) {
                return true;
            }
        }
        return false;
    }

    /**
     * Add extra user or groups in the userPermissions object
     *
     * @param newUsersOrGroups
     */
    private addNewUsersOrGroups(newUsersOrGroups: SharePrincipal[]): void {
        let userPermissions = this.userPermissions,
            readOnlyMode = this.readOnlyMode;

        newUsersOrGroups.forEach((userOrGroup) => {
            if (readOnlyMode && this.entityHasPermissions(userPermissions, userOrGroup.id)) {
                return;
            }
            this.clearLocalPermissionsForEntity(userPermissions, userOrGroup.id);
            userPermissions.push(userOrGroup);
        });
    }

    /**
     * Transforms the userPermissions object (that contains user / group names) into a
     * permissions object of the format that callosum expects:
     * {
         *    <user/group id>: { shareMode: <permission type> }
         *    <user/group id>: { shareMode: <permission type> }
         *    ...
         *  }
     *
     * @param  userPermissions  The userPermissions array
     * @return {object}                 The permissions object
     */
    private generatePermissionJson(userPermissions: SharePrincipal[]) {
        var permissions = {};
        userPermissions.forEach((userPermission) => {
            var entityId = userPermission.id;
            if (!entityId || userPermission.permissionType === jsonConstants.permission.VARIES) {
                return;
            }
            permissions[entityId] = {
                shareMode: userPermission.permissionType
            };
        });
        return permissions;
    }
    /**
     * Get name and profile pic for the author, given the author id
     *
     * @param authorId  The author id
     */
    private fetchAuthorInfo(authorId) {
        return shareService.getUser(authorId)
            .then((author) => {
                return {
                    name: author.getName(),
                    displayName: author.getDisplayName(),
                    id: authorId
                };
            });
    }

    /**
     * Save the permissions to the server
     */
    private savePermissions = ():IPromise<void> => {

        loadingIndicator.show();
        let permissions = this.generatePermissionJson(this.userPermissions),
            objectIds = this.objects.map((object) => object.id);
        let userAction = new UserAction(UserAction.SHARE_OBJECT);
        return metadataPermissionService
            .savePermissions(objectIds, this.type, permissions)
            .then((response) => {
                alertService.showUserActionSuccessAlert(
                    userAction, response
                );
                this.unsavedChanges = false;
            }).catch((response) => {
                alertService.showUserActionFailureAlert(
                  userAction, response);
                return $q.reject();
            }).finally(loadingIndicator.hide);
    }

    private addPermissions = (newUsersOrGroups: any[]) => {
        if (newUsersOrGroups.length) {
            this.addNewUsersOrGroups(newUsersOrGroups);
            this.savePermissions()
                .then(() => {this.updatePermissionsController();
            });

        }
        this.collapseAddUserSection();
    }

    /**
     * User selected a table column in the column browser
     *
     * @param {Object} column  The selected column
     */

    private selectTableColumn(column) {
        if (this.unsavedChanges || !column || !column.header.id) {
            return;
        }
        this.columns.forEach((column) => {
            column._selected = false;
        });
        column._selected = true;
        let objects = [{
            id: column.header.id,
            name: column.header.name,
            authorId: column.header.author
        }];
        this.updatePermissionView(objects, jsonConstants.metadataType.LOGICAL_COLUMN);
    }

    /**
     * Update the unsavedChanges flag when user makes any change to the permissions
     */
    private userChangedPermissions = () => {
        this.unsavedChanges = true;
        this.updatePermissionsController();
    }

    /**
     * Given a type and subtype (e.g. "QUESTION_ANSWER_SHEET" or "LOGICAL_TABLE"),
     * returns a corresponding user readable string (e.g. "answer" or "table")
     *
     * @param   type    A type
     * @param   subtype    A subtype
     * @return  The user readable type label
     */
    private getObjectTypeLabel(type: string, subtype: string): string {
        let keys = Object.keys(objectTypes);
        if (subtype === jsonConstants.metadataType.subType.WORKSHEET) {
            return WORKSHEET_LABEL;
        }
        for (let i = 0, l = keys.length; i < l; i++) {
            let key = keys[i];
            if (objectTypes[key] === type) {
                return key;
            }
        }
        this.logger.warn('Could not generate object type label');
    }

    private updatePermissionsController() {
        this.permissionsListComponent = new PermissionsListComponent(
            this.userPermissions,
            this.readOnlyMode,
            this.deleteRow,                           // delete handler
            this.userChangedPermissions               // change handler
        );

    }

    /**
     * Fetch permissions for the given objects and initialize the permission
     * list with the current permissions
     *
     * @param objects  An array of shared objects
     * @param type     The type of the shared objects
     */
    private updatePermissionView(objects: any[], type: string) {
        shareService.getShareDialogData(objects, type).then((shareDialogData) => {
            this.initPermissionView(objects,
                type,
                shareDialogData.userPermissions,
                shareDialogData.readOnlyMode);
        });
    }

    /**
     * Validate the dialog config
     *
     * @param  config  The dialog's config object
     * @return True if the config is valid
     */
    private validateConfig(config: any): boolean {
        var objects = config.objects;
        if (!objects || !objects.length) {
            return false;
        }
        // Each object needs to have at least an id property
        for (let i = 0, l = objects.length; i < l; i++) {
            if (!objects[i].id) {
                return false;
            }
        }
        // For single object sharing, expect name and authorId properties
        if (objects.length === 1 && (!objects[0].name || !objects[0].authorId)) {
            return false;
        }
        return true;
    }

    private hideDialogMenuIndicator(): void {
        this.isLoading = false;
    }

    /**
     * Fetch user permissions to populate the permission list and users/groups
     * for the autocomplete
     *
     * @param config  The dialog's config object
     */
    private initShareDialog = (config) => {
        if (!this.validateConfig(config)) {
            this.logger.error('Invalid share dialog config');
            return;
        }

        // Both system and user defined tables can have their column shared.
        let isColumnSharable = config.objects.some(function (object) {
            return (object.subtype === jsonConstants.metadataType.subType.SYSTEM_TABLE
                || object.subtype === jsonConstants.metadataType.subType.IMPORTED_DATA);
        }, this);

        // We show column permissions for tables that are shared in non-bulk mode
        this.showColumnPermissions = (isColumnSharable && config.objects.length === 1);
        this.bulkMode = config.objects.length > 1;
        this.isLoading = true;
        shareService.getShareDialogData(config.objects, config.type, true, true)
            .then(this.initShareData.bind(this, config))
            .finally(this.hideDialogMenuIndicator.bind(this));
    }

    private initShareData(config, shareDialogData) {
        if (this.showColumnPermissions) {
            this.columns = shareDialogData.tableColumns;
            this.table = config.objects[0];
        }
        return this.initPermissionView(config.objects,
            config.type,
            shareDialogData.userPermissions,
            shareDialogData.readOnlyMode);
    }

    /**
     * Initialize the permission list view given an object to be shared and its current permissions
     *
     * @param objects          An array of shared objects
     * @param type             The type of the shared objects
     * @param userPermissions  The user permissions object listing all the current permissions
     * @param readOnlyMode     Whether to set the the permission view in read only mode
     */
    private initPermissionView (
        objects: any[],
        type: string,
        userPermissions: SharePrincipal[],
        readOnlyMode:boolean): IPromise<any> {

        this.objects = objects;
        this.type = type;
        this.readOnlyMode = readOnlyMode;
        // When readOnlyMode is true, user connot edit or delete existing permissions,
        // or give out edit permissions.
        // He can only view existing permissions and give out view permissions.
        // The userPermissions object contains the list of all permissions for
        // the current object, as well as the user or group names and profile pic urls.

        this.userPermissions = userPermissions;
        this.updatePermissionsController();
        this.addPrincipalComponent = new AddPrincipalComponent(
            '',
            this.readOnlyMode,
            '',
            true,
            this.addPermissions,
            this.collapseAddUserSection.bind(this),
            userPermissions.map((p) => p.id)
        );
        if (!this.bulkMode) {
            let sharedObject = objects[0];
            this.sharedObject = {
                name: sharedObject.name,
                typeLabel: this.getObjectTypeLabel(type, sharedObject.subtype)
            };
            return this.fetchAuthorInfo(sharedObject.authorId).then((author) => {
                this.author = new PrincipalViewerComponent(author.id,
                    author.name,
                    author.displayName);
            });
        } else {
            return $q.when();
        }
    }
}
