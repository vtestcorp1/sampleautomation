/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit test for ShareDialogController
 */

'use strict';

describe('Share Dialog Controller', function () {

    function getElementController(config){
        componentController = new constructor(config);
        scope.$digest();
        return componentController;
    }

    var constructor, $q, scope, metadataPermissionsService;

    var mockShareService = {
        getUser: function () {
            var deferred = $q.defer();
            deferred.resolve({});
            return deferred.promise;
        },
        getShareDialogData: function () {
            var deferred = $q.defer();
            deferred.resolve({
                allUsersAndGroups: {
                    2: {
                        id: 2,
                        name: 'First User'
                    },
                    3: {
                        id: 3,
                        name: 'First Group',
                        isGroup: true
                    }
                },
                userPermissions: [
                    {
                        id: 2,
                        name: 'First User',
                        permissionType: permissions.MODIFY
                    }
                ],
                readOnlyMode: false,
                tableColumns: _tableColumns
            });
            return deferred.promise;
        }
    };

    var alertService,
        componentController,
        _tableColumns = [
            {
                header: {
                    id: '4',
                    name: 'Column 1',
                    author: '6'
                }
            },
            {
                header: {
                    id: '5',
                    name: 'Column 2',
                    author: '7'
                }
            }
        ],
        _answerConfig = {
            objects: [{
                id: '1234',
                name: 'Object Name',
                authorId: '2'
            }],
            type: 'QUESTION_ANSWER_SHEET'
        },
        _tableConfig = {
            objects: [{
                id: '1234',
                name: 'Object Name',
                authorId: 2,
                subtype: 'ONE_TO_ONE_LOGICAL'
            }],
            type: 'LOGICAL_TABLE',
        },
        _bulkObjects = [
            { id: '1234', subtype: 'ONE_TO_ONE_LOGICAL' },
            { id: '5678' },
            { id: '9012' }
        ],
        _bulkAnswerConfig = {
            objects: _bulkObjects,
            type: 'QUESTION_ANSWER_SHEET'
        },
        _bulkTableConfig = {
            objects: _bulkObjects,
            type: 'LOGICAL_TABLE'
        },
        _columnSharedObject = {
            name: 'Column 2',
            typeLabel: 'column'
        };

    var permissions;
    var basePath = getBasePath(document.currentScript.src);

    beforeEach(function (done) {
        module('blink.app');
        freshImport(basePath, './share-dialog-component').then((module) => {
            constructor = module.ShareDialogComponent;
            inject(function ($controller,
                             _$q_,
                             _alertService_,
                             jsonConstants,
                             _PrincipalSelectorComponent_,
                             shareService,
                             _metadataPermissionService_,
                             $rootScope) {

                $q = _$q_;
                metadataPermissionsService = _metadataPermissionService_;
                permissions = jsonConstants.permission;
                scope = $rootScope.$new();
                alertService = _alertService_;
                Object.assign(shareService, mockShareService);
            });
            done();
        });
    });

    it('should correctly initialize the scope properties for a shared answer', function () {
        componentController = getElementController(_answerConfig);
        expect(componentController.showColumnPermissions).toBe(false);
        expect(componentController.readOnlyMode).toBe(false);
    });

    it('should correctly initialize the scope properties for a shared table', function () {
        componentController = getElementController(_tableConfig);
        expect(componentController.showColumnPermissions).toBe(true);
        expect(componentController.readOnlyMode).toBe(false);
        expect(componentController.columns).toEqual(_tableColumns);
    });

    it('should correctly initialize the scope properties for bulk-shared answers', function () {
        componentController = getElementController(_bulkAnswerConfig);
        expect(componentController.showColumnPermissions).toBe(false);
        expect(componentController.readOnlyMode).toBe(false);
    });

    it('should correctly initialize the scope properties for bulk-shared tables', function () {
        componentController = getElementController(_bulkTableConfig);
        expect(componentController.showColumnPermissions).toBe(false);
        expect(componentController.readOnlyMode).toBe(false);
    });

    it('should add new users to the userPermissions array when new users are added', function () {
        componentController = getElementController(_answerConfig);
        // Expect userPermissions to be correctly initialized
        expect(componentController.userPermissions.length).toBe(1);
        expect(componentController.userPermissions[0].id).toBe(2);
        expect(componentController.userPermissions[0].permissionType).toBe(permissions.MODIFY);
        // Simulate adding a new user with read only permissons
        componentController.addPermissions([{ id: 3, permissionType: 'READ_ONLY' }]);
        // Expect 2 users
        expect(componentController.userPermissions.length).toBe(2);
        // Expect the existing user with original permissions
        expect(componentController.userPermissions[0].id).toBe(2);
        expect(componentController.userPermissions[0].permissionType).toBe(permissions.MODIFY);
        // Expect the new user user with read only permissions
        expect(componentController.userPermissions[1].id).toBe(3);
        expect(componentController.userPermissions[1].permissionType).toBe(permissions.READ_ONLY);
    });

    it('should update existing permissions and not create new rows when adding users who already had permissions', function () {
        componentController = getElementController(_answerConfig);
        // Expect userPermissions to be correctly initialized
        expect(componentController.userPermissions.length).toBe(1);
        expect(componentController.userPermissions[0].id).toBe(2);
        expect(componentController.userPermissions[0].permissionType).toBe(permissions.MODIFY);
        // Simulate adding same user with different permissions
        componentController.addPermissions([{ id: 2, permissionType: 'READ_ONLY' }]);
        // Expect only user
        expect(componentController.userPermissions.length).toBe(1);
        // User should have his permissions updated to read only
        expect(componentController.userPermissions[0].id).toBe(2);
        expect(componentController.userPermissions[0].permissionType).toBe(permissions.READ_ONLY);
    });

    it('should set permissionType to NO_ACCESS when an entity is removed form the permission list', function () {
        componentController = getElementController(_answerConfig);
        // Expect userPermissions to be correctly initialized
        expect(componentController.userPermissions.length).toBe(1);
        expect(componentController.userPermissions[0].id).toBe(2);
        expect(componentController.userPermissions[0].permissionType).toBe(permissions.MODIFY);
        // Simulate removing user from permission list
        componentController.deleteRow({
            id: 2
        });
        // User should still be listed in the userPermissions table but with permission type set to NO_ACCESS
        expect(componentController.userPermissions.length).toBe(1);
        expect(componentController.userPermissions[0].id).toBe(2);
        expect(componentController.userPermissions[0].permissionType).toBe(permissions.NO_ACCESS);
    });

    it('should set the column as the shared object when a column in selected in the column browser', function () {
        componentController = getElementController(_tableConfig);
        componentController.selectTableColumn(_tableColumns[1]);
        scope.$apply();
        expect(componentController.sharedObject).toEqual(_columnSharedObject);
    });

    it('should make a save call to the share service on save', function () {
        alertService.showUserActionSuccessAlert = jasmine.createSpy();
        metadataPermissionsService.savePermissions = jasmine.createSpy().and.returnValue($q.when());
        componentController = getElementController(_answerConfig);
        componentController.savePermissions();
        scope.$apply();
        expect(metadataPermissionsService.savePermissions).toHaveBeenCalled();
        expect(alertService.showUserActionSuccessAlert).toHaveBeenCalled();
    });

    it('should call alertService in case of failure', function() {
        alertService.showUserActionFailureAlert = jasmine.createSpy();
        metadataPermissionsService.savePermissions = jasmine.createSpy().and.returnValue($q.reject());
        componentController = getElementController(_answerConfig);
        componentController.savePermissions();
        scope.$apply();
        expect(alertService.showUserActionFailureAlert).toHaveBeenCalled();
    })

});
