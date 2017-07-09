/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for DocumentPermission class
 */

'use strict';

describe('DocumentPermissionFactory', function () {
    beforeEach(module('blink.app'));

    var getUserPrivilegesFn, hasAdminPrivilegesFn, getUserGuidFn, sessionService;

    function spyOnSessionService(sessionService) {
        getUserPrivilegesFn = angular.noop;
        hasAdminPrivilegesFn = angular.noop;
        getUserGuidFn = angular.noop;

        /* global spyOnSessionQuarterStartMonth */
        sessionService = spyOnSessionQuarterStartMonth(sessionService);

        sessionService.getUserPrivileges = function () {
            return getUserPrivilegesFn() || [];
        };
        sessionService.hasAdminPrivileges = function () {
            return hasAdminPrivilegesFn();
        };
        sessionService.getUserGuid = function () {
            return getUserGuidFn();
        };
    }

    beforeEach(function () {
        inject(function($injector) {
            sessionService = $injector.get('sessionService');
            spyOnSessionService(sessionService);
        });
    });


    var DocumentPermissionCtor, _jsonConstants;
    var emptyPermission,
        noAccessPermission,
        readonlyPermission,
        readonlyPermissionWithUnderlyingAccess,
        editPermissionNoUnderlyingAccess,
        editPermissionUnderlyingAccess;
    beforeEach(inject(function (DocumentPermissionFactory, jsonConstants, permissionFactory) {
        DocumentPermissionCtor = DocumentPermissionFactory.DocumentPermission;
        _jsonConstants = jsonConstants;

        emptyPermission = new permissionFactory.EffectivePermissionModel({});
        noAccessPermission = new permissionFactory.EffectivePermissionModel({
            shareMode: 'NO_ACCESS'
        });

        readonlyPermission = new permissionFactory.EffectivePermissionModel({
            shareMode: 'READ_ONLY',
            dependents: [{
                shareMode: 'NO_ACCESS'
            }]
        });

        readonlyPermissionWithUnderlyingAccess = new permissionFactory.EffectivePermissionModel({
            shareMode: 'READ_ONLY',
            dependents: [{
                shareMode: 'READ_ONLY'
            }]
        });

        editPermissionNoUnderlyingAccess = new permissionFactory.EffectivePermissionModel({
            shareMode: 'MODIFY',
            dependents: [{
                shareMode: 'NO_ACCESS'
            }]
        });

        editPermissionUnderlyingAccess = new permissionFactory.EffectivePermissionModel({
            shareMode: 'MODIFY',
            dependents: [{
                shareMode: 'READ_ONLY'
            }]
        });
    }));


    it('should not allow any document feature for empty permissions', function () {
        var docPerm = new DocumentPermissionCtor(null, 'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
        expect(docPerm.isSageAllowed()).toBeFalsy();
        expect(docPerm.isDrillAllowed()).toBeFalsy();
        expect(docPerm.isLayoutAllowed()).toBeFalsy();
        expect(docPerm.isDeletingVizFromPinboardAllowed()).toBeFalsy();
        expect(docPerm.isAddingVizToPinboardAllowed()).toBeFalsy();
        expect(docPerm.isEditingDocumentTitleAllowed()).toBeFalsy();
        expect(docPerm.isEditingVizTitleAllowed()).toBeFalsy();
        expect(docPerm.isMaximizeVizAllowed()).toBeFalsy();
        expect(docPerm.isTableSortingAllowed()).toBeFalsy();
        expect(docPerm.isHeadlineInteractionAllowed()).toBeFalsy();
        expect(docPerm.isChartZoomAllowed()).toBeFalsy();
        expect(docPerm.isChangingChartTypeAllowed()).toBeFalsy();
        expect(docPerm.isChartLegendInteractionAllowed()).toBeFalsy();
        expect(docPerm.isDownloadingDataAllowed()).toBeFalsy();
        expect(docPerm.isCopyingDocumentAllowed()).toBeFalsy();
        expect(docPerm.isSavingDocumentAllowed()).toBeFalsy();
        expect(docPerm.isSharingDocumentAllowed()).toBeFalsy();

        docPerm = new DocumentPermissionCtor(
            emptyPermission, 'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
        // If table sorting is not allowed then the user has no access
        expect(docPerm.isTableSortingAllowed()).toBeFalsy();

        docPerm = new DocumentPermissionCtor(
            noAccessPermission, 'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
        expect(docPerm.isTableSortingAllowed()).toBeFalsy();
    });

    it('should allow some document features for read permissions and answer type', function () {
        var docPerm = new DocumentPermissionCtor(readonlyPermission,
            'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
        expect(docPerm.isAddingVizToPinboardAllowed()).toBeTruthy();
        expect(docPerm.isMaximizeVizAllowed()).toBeTruthy();
        expect(docPerm.isTableSortingAllowed()).toBeFalsy();
        expect(docPerm.isHeadlineInteractionAllowed()).toBeTruthy();
        expect(docPerm.isChartZoomAllowed()).toBeTruthy();
        expect(docPerm.isChangingChartTypeAllowed()).toBeTruthy();
        expect(docPerm.isChangingFiltersAllowed()).toBeFalsy();
        expect(docPerm.isChartLegendInteractionAllowed()).toBeTruthy();
        expect(docPerm.isCopyingDocumentAllowed()).toBeTruthy();
        expect(docPerm.isSharingDocumentAllowed()).toBeTruthy();

        expect(docPerm.isSageAllowed()).toBeFalsy();
        expect(docPerm.isDrillAllowed()).toBeFalsy();
        expect(docPerm.isLayoutAllowed()).toBeFalsy();
        expect(docPerm.isDeletingVizFromPinboardAllowed()).toBeFalsy();
        expect(docPerm.isEditingDocumentTitleAllowed()).toBeFalsy();
        expect(docPerm.isEditingVizTitleAllowed()).toBeFalsy();
        expect(docPerm.isDownloadingDataAllowed()).toBeFalsy();
        expect(docPerm.isSavingDocumentAllowed()).toBeFalsy();

        expect(docPerm.isMissingUnderlyingAccess()).toBeTruthy();
    });

    it('should allow most document features for edit permissions and answer type', function () {
        var docPerm = new DocumentPermissionCtor(editPermissionUnderlyingAccess,
            'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
        expect(docPerm.isSageAllowed()).toBeTruthy();
        expect(docPerm.isDrillAllowed()).toBeTruthy();
        expect(docPerm.isLayoutAllowed()).toBeTruthy();
        expect(docPerm.isDeletingVizFromPinboardAllowed()).toBeTruthy();
        expect(docPerm.isAddingVizToPinboardAllowed()).toBeTruthy();
        expect(docPerm.isEditingDocumentTitleAllowed()).toBeTruthy();
        expect(docPerm.isEditingVizTitleAllowed()).toBeTruthy();
        expect(docPerm.isMaximizeVizAllowed()).toBeTruthy();
        expect(docPerm.isTableSortingAllowed()).toBeTruthy();
        expect(docPerm.isHeadlineInteractionAllowed()).toBeTruthy();
        expect(docPerm.isChartZoomAllowed()).toBeTruthy();
        expect(docPerm.isChangingChartTypeAllowed()).toBeTruthy();
        expect(docPerm.isChartLegendInteractionAllowed()).toBeTruthy();
        expect(docPerm.isCopyingDocumentAllowed()).toBeTruthy();
        expect(docPerm.isSavingDocumentAllowed()).toBeTruthy();
        expect(docPerm.isSharingDocumentAllowed()).toBeTruthy();

        expect(docPerm.isDownloadingDataAllowed()).toBeFalsy();

        expect(docPerm.isMissingUnderlyingAccess()).toBeFalsy();
    });

    it('should not allow edit document features for edit permissions with no underlying access', function () {
        var docPerm = new DocumentPermissionCtor(editPermissionNoUnderlyingAccess,
            'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);

        expect(docPerm.isSageAllowed()).toBeFalsy();
        expect(docPerm.isReadOnly()).toBeFalsy();

        expect(docPerm.isMissingUnderlyingAccess()).toBeTruthy();
    });

    it('should not allow privileged operations when user does not have required privileges', function () {
        var docPerm = new DocumentPermissionCtor(editPermissionUnderlyingAccess,
            'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
        expect(docPerm.isDownloadingDataAllowed()).toBeFalsy();

        getUserPrivilegesFn = function () {
            return [
                _jsonConstants.privilegeType.ADMINISTRATION,
                _jsonConstants.privilegeType.AUTHORING,
                _jsonConstants.privilegeType.USERDATAUPLOADING
            ];
        };

        expect(docPerm.isDownloadingDataAllowed()).toBeFalsy();
    });

    it('should allow privileged operations when user has required privileges', function () {
        var docPerm = new DocumentPermissionCtor(editPermissionUnderlyingAccess,
            'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
        getUserPrivilegesFn = function () {
            return [
                _jsonConstants.privilegeType.DATADOWNLOADING
            ];
        };

        expect(docPerm.isDownloadingDataAllowed()).toBeTruthy();
    });

    it('should not allow adminOrOwner only feature for a user who is not owner or admin', function () {
        // create a doc permission object for worksheet/table.
        var docPerm = new DocumentPermissionCtor(editPermissionUnderlyingAccess,
            'author', _jsonConstants.metadataType.LOGICAL_TABLE);

        getUserGuidFn = function () {
            return 'non-author-non-admin-user';
        };

        hasAdminPrivilegesFn = function () {
            return false;
        };

        expect(docPerm.isSharingDocumentAllowed()).toBeFalsy();
    });

    it('should allow adminOrOwner only feature for a user who is owner', function () {
        // create a doc permission object for worksheet/table.
        var docPerm = new DocumentPermissionCtor(editPermissionUnderlyingAccess,
            'author', _jsonConstants.metadataType.LOGICAL_TABLE);

        getUserGuidFn = function () {
            return 'author';
        };

        expect(docPerm.isSharingDocumentAllowed()).toBeTruthy();
    });

    it('should allow adminOrOwner only feature for a user who is admin', function () {
        // create a doc permission object for worksheet/table.
        var docPerm = new DocumentPermissionCtor(editPermissionUnderlyingAccess,
            'author', _jsonConstants.metadataType.LOGICAL_TABLE);

        getUserGuidFn = function () {
            return 'non-author';
        };

        hasAdminPrivilegesFn = function () {
            return true;
        };

        expect(docPerm.isSharingDocumentAllowed()).toBeTruthy();
    });

    it('should allow some operations on readOnly permission with underlying access', function() {
        var docPerm = new DocumentPermissionCtor(readonlyPermissionWithUnderlyingAccess,
            'author', _jsonConstants.metadataType.QUESTION_ANSWER_BOOK);
        expect(docPerm.isDrillAllowed()).toBeTruthy();
        expect(docPerm.isSageAllowed()).toBeTruthy();
        expect(docPerm.isChangingFiltersAllowed()).toBeTruthy();
        expect(docPerm.isChangingMetricsAllowed()).toBeTruthy();
    });
});
