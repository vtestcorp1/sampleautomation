/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Testing for metadata-permission-service
 */

'use strict';

/* eslint camelcase: 1 , no-undef: 0 */

describe('Metadata-permission-service ', function () {

    var _mockSessionServiceState,
        $q,
        commandMockService,
        commandData,
        jsonConstants,
        metadataPermissionService,
        mockSessionService,
        scope,
        universe;

    var tableType, pinboardType, answerType, systemTableSubtype;

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('Command', commandMockService);
        });
        inject(function (_$q_,
                         _metadataPermissionService_,
                         _$rootScope_,
                         _jsonConstants_,
                         _sessionService_
                        ) {

            $q = _$q_;
            jsonConstants = _jsonConstants_;
            metadataPermissionService = _metadataPermissionService_;
            scope = _$rootScope_;
            mockSessionService = _sessionService_;
            _mockSessionServiceState = {
                hasUserDataUploadPrivileges: false,
                userGUID: 'a',
                hasAdminPrivileges: false

            };
            commandData = blink.app.fakeData['/callosum/v1/security'];
            commandMockService = function Command() {
                this.execute = function () {
                    return $q.when(commandData);
                };
                this.setPostMethod = this.setPath = this.setPostParams =  function() { return this; };

                return this;
            };

            // TODO(chab) find a way to restore the original service after mocking it
            spyOn(mockSessionService, 'hasUserDataUploadPrivileges').and.callFake(
                function() {
                    return _mockSessionServiceState.hasUserDataUploadPrivileges;
                }
            );
            spyOn(mockSessionService, 'hasAdminPrivileges').and.callFake(
                function() {
                    return _mockSessionServiceState.hasAdminPrivileges;
                }
            );
            spyOn(mockSessionService, 'getUserGuid').and.callFake(
                function() {
                    return  _mockSessionServiceState.userGUID;
                }
            );

            universe =  [
                { values : { id : 'a', author: 'a'}},
                { values : { id : 'b', author: 'b'}},
                { values : { id : 'c', author: 'a'}},
                { values : { id : 'd', author: 'b'}}
            ];

            tableType = jsonConstants.metadataType.LOGICAL_TABLE;
            answerType = jsonConstants.metadataType.ANSWER;
            pinboardType = jsonConstants.metadataType.PINBOARD;
            systemTableSubtype = jsonConstants.metadataType.subType.SYSTEM_TABLE;

        });
    });

    // TODO(chab) switch to sessionService when ready, write specs for case when user is author of object

    it('fetch items permission should fail if no type is passed', function(done) {
        var promise = metadataPermissionService.fetchItemPermissions(null, 'a');
        promise.then(function() {
            done(new Error('Promise should not be resolved'));
        }, function() {
            done();
        });
        scope.$digest();
    });

    it('fetch items permission should fail if no objects are passed', function(done) {
        var promise = metadataPermissionService.fetchItemPermissions(['foo'], null);
        promise.then(function() {
            done(new Error('Promise should not be resolved'));
        }, function() {
            done();
        });
        scope.$digest();
    });

    it('should return an instance of bulkPermissionModel', function(done) {
        var promise = metadataPermissionService.fetchItemPermissions(universe, tableType);
        promise.then(function(bulkPermissionModel) {
            expect(bulkPermissionModel).toBeDefined();
            done();
        }, function(err) {
            done(new Error('Promise should not be resolved'));
        });
        scope.$digest();
    });

    it('for every user, PINBOARD object should be shareable', function(done) {
        _mockSessionServiceState.hasAdminPrivileges = false;
        var promise = metadataPermissionService.fetchItemPermissions(universe, pinboardType);
        promise.then(function() {
            expect(metadataPermissionService.isShareable(universe, pinboardType)).toBe(true);
            done();
        }, function(){
            done(new Error('Promise should not be rejected'));
        });
        scope.$digest();
    });

    it('for every user, ANSWER object should be shareable', function(done) {
        _mockSessionServiceState.hasAdminPrivileges = false;
        var promise = metadataPermissionService.fetchItemPermissions(universe, answerType);
        promise.then(function() {
            expect(metadataPermissionService.isShareable(universe, answerType)).toBe(true);
            done();
        }, function() {
            done(new Error('Promise should not be rejected'));
        });
        scope.$digest();
    });

    it('for an admin user, LOGICAL_TABLE objects should be shareable', function(done) {
        _mockSessionServiceState.hasAdminPrivileges = true;
        var promise = metadataPermissionService.fetchItemPermissions(universe, tableType);
        promise.then(function() {
            universe.map(function(object) {
                return [{id:object.values.id}];
            }).forEach(
                function(object) {
                    expect(metadataPermissionService.isShareable(object, tableType)).toBe(true);
                }
            );
            expect(mockSessionService.hasAdminPrivileges.calls.count()).toEqual(universe.length);
            done();
        }, function() {
            done(new Error('Promise should not be rejected'));
        });
        scope.$digest();
    });

    it('for an admin user, LOGICAL_TABLE objects should be deletable', function(done) {
        _mockSessionServiceState.hasAdminPrivileges = true;
        var promise = metadataPermissionService.fetchItemPermissions(universe, tableType);
        promise.then(function(bulkPermissionModel) {
            universe.map(function(object) { return [{id:object.values.id}];}).forEach(
                function(object) {
                    expect(metadataPermissionService.isShareable(object, tableType, bulkPermissionModel)).toBe(true);
                }
            );
            expect(mockSessionService.hasAdminPrivileges.calls.count()).toEqual(universe.length);
            done();
        }, function() {
            done(new Error('Promise should not be rejected'));
        });
        scope.$digest();
    });

    it('for a non-admin user, LOGICAL_TABLE object should be shareable only if user is owner', function(done) {
        _mockSessionServiceState.hasAdminPrivileges = false;
        var promise = metadataPermissionService.fetchItemPermissions(universe, tableType);
        promise.then(function(bulkPermissionModel) {
            universe.map(function(object) {
                return [{id:object.values.id}];
            }).forEach(
                function(object) {
                    var isOwner = (object.author == mockSessionService.getUserGuid());
                    expect(metadataPermissionService.isShareable(object, tableType, bulkPermissionModel))
                        .toBe(isOwner);
                }
            );
            expect(mockSessionService.hasAdminPrivileges.calls.count()).toEqual(universe.length);
            done();
        }, function() {
            done(new Error('Promise should not be rejected'));
        });
        scope.$digest();
    });

    //SCAL-11142
    xit('for a non-admin user, LOGICAL_TABLE objects should be editable only if shared with write permissions and' +
        'with access to the underlying tables', function(done) {
        _mockSessionServiceState.hasAdminPrivileges = false;
        var promise = metadataPermissionService.fetchItemPermissions(universe, tableType);
        _mockSessionServiceState.userGuid = 'z';
        promise.then(function(bulkPermissionModel) {
            // wks with access to underlying tables
            expect(metadataPermissionService.isEditable([{id:'a'}], tableType, systemTableSubtype, bulkPermissionModel))
                .toEqual(true);
            // read-only share
            expect(metadataPermissionService.isEditable([{id:'b'}], tableType, systemTableSubtype, bulkPermissionModel))
                .toEqual(false);
            // write share
            expect(metadataPermissionService.isEditable([{id:'c'}], tableType, systemTableSubtype, bulkPermissionModel))
                .toEqual(true);
            // wks with no access to underlying tables
            expect(metadataPermissionService.isEditable([{id:'d'}], tableType, systemTableSubtype, bulkPermissionModel))
                .toEqual(false);
            expect(metadataPermissionService.isEditable(universe, tableType, systemTableSubtype, bulkPermissionModel))
                .toEqual(false);
            done();
        });
        scope.$digest();
    });

    //SCAL-4632
    xit("object should not be editable if user does not have data uploading permission", function(done) {
        _mockSessionServiceState.hasAdminPrivileges = false;
        var type = jsonConstants.metadataType.LOGICAL_TABLE,
            subtype = jsonConstants.metadataType.subType.IMPORTED_DATA,
            promise = metadataPermissionService.fetchItemPermissions(universe, tableType);
        _mockSessionServiceState.userGuid = 'z';
        promise.then(function(bulkPermissionModel) {
            expect(metadataPermissionService.isEditable([{id:'a'}], type, subtype, bulkPermissionModel))
                .toEqual(false);
            done();
        });
        scope.$digest();
    });

    xit("object should not be editable if user does have data uploading permission", function(done) {
        _mockSessionServiceState.hasAdminPrivileges = false;
        _mockSessionServiceState.hasUserDataUploadPrivileges = true;
        var type = jsonConstants.metadataType.LOGICAL_TABLE,
            subtype = jsonConstants.metadataType.subType.IMPORTED_DATA,
            promise = metadataPermissionService.fetchItemPermissions(universe, tableType);
        _mockSessionServiceState.userGuid = 'z';
        promise.then(function(bulkPermissionModel) {
            expect(metadataPermissionService.isEditable([{id:'a'}], type, subtype, bulkPermissionModel))
                .toEqual(true);
            done();
        });
        scope.$digest();
    });

    describe('for a non-admin user, a shared object', function() {
        xit("could be edited if share is write and user access to underlying table", function(done){
            _mockSessionServiceState.hasAdminPrivileges = false;
            var promise = metadataPermissionService.fetchItemPermissions(universe, tableType);
            _mockSessionServiceState.userGuid = 'a';
            promise.then(function(bulkPermissionModel) {
                var withWriteAccess = metadataPermissionService.isEditableWithUnderlyingAccess('d', bulkPermissionModel);
                expect(withWriteAccess).toBe(true);
                var withReadAccess = metadataPermissionService.isEditableWithUnderlyingAccess('e', bulkPermissionModel);
                expect(withReadAccess).toBe(false);
                var withNoDependents = metadataPermissionService.isEditableWithUnderlyingAccess('b', bulkPermissionModel);
                expect(withNoDependents).toBe(false);
                var withNonExistentObject =  metadataPermissionService.isEditableWithUnderlyingAccess('foo', bulkPermissionModel);
                expect(withNonExistentObject).toBe(false);
                done();
            });
            scope.$digest();
        });
    });
});
