/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Unit test for ShareDialogController
 */

'use strict';

describe('Share Service', function () {

    var _shareService,
        _$httpBackend,
        _$rootScope,
        _users = [
            {

                "id": "1",
                getId: function() { return this.id;},
                "name": "firstuser",
                "displayName": "First User",
                "type": 'LOCAL_USER'
            },
            {

                "id": "2",
                getId: function() { return this.id;},
                "name": "seconduser",
                "displayName": "Second User",
                "type": 'LOCAL_USER'
            },
            {
                "id": "3",
                getId: function() { return this.id;},
                "name": "thirduser",
                "displayName": "Third User",
                "type": 'LOCAL_USER'
            },
            {
                "id": "4",
                getId: function() { return this.id;},
                "name": "fourthuser",
                "displayName": "Fourth User",
                "type": 'LOCAL_USER'
            }
        ],
        _groups = [
            {
                "header": {
                    "id": "5",
                    "name": "group",
                    "type": 'LOCAL_GROUP'
                }
            }
        ],

        _expectedUsersAndGroups = {
            '1': {
                id : '1',
                name : 'firstuser',
                displayName: 'First User',
                isGroup: false,
                sharingType: 2
            },
            '2': {
                id : '2',
                name : 'seconduser',
                displayName: 'Second User',
                isGroup: false,
                sharingType: 2
            },
            '3': {
                id : '3',
                name : 'thirduser',
                displayName: 'Third User',
                isGroup: false,
                sharingType: 2
            },
            '4': {
                id : '4',
                name : 'fourthuser',
                displayName: 'Fourth User',
                isGroup: false,
                sharingType: 2
            }
        },
        _bulkObjects = [
            { id: '1234' },
            { id: '5678' },
            { id: '9012' }
        ],
        _bulkPermissions = {
            '1234': {
                permissions: {
                    '1': { shareMode: 'MODIFY'    },
                    '2': { shareMode: 'MODIFY'    },
                    '3': { shareMode: 'READ_ONLY' }
                }
            },
            '5678': {
                permissions: {
                    '1': { shareMode: 'MODIFY'    },
                    '2': { shareMode: 'MODIFY'    },
                    '3': { shareMode: 'READ_ONLY' }
                }
            },
            '9012': {
                permissions: {
                    '1': { shareMode: 'MODIFY'    },
                    '2': { shareMode: 'READ_ONLY' },
                    '4': { shareMode: 'READ_ONLY' }
                }
            }
        },
        _expectedUserPermissions = [
            {
                id : '1',
                name : _users[0].name,
                displayName: _users[0].displayName,
                isGroup: false,
                sharingType: 2,
                permissionType : 'MODIFY'
            },
            {
                id : '2',
                name : _users[1].name,
                displayName: _users[1].displayName,
                isGroup: false,
                sharingType: 2,
                permissionType : 'VARIES'
            },
            {
                id : '3',
                name : _users[2].name,
                displayName: _users[2].displayName,
                isGroup: false,
                sharingType: 2,
                permissionType : 'VARIES'
            },
            {
                id : '4',
                name : _users[3].name,
                displayName: _users[3].displayName,
                isGroup: false,
                sharingType: 2,
                permissionType : 'VARIES'
            }
        ],
        _unmatchedObject = Math.random();

    _users = _users.map(function(user){
        user.getName = function() {
            return this.name;
        };
        user.getDisplayName = function() {
            return this.displayName;
        };
        user.isGroup = function() {
            return false;
        };
        return user;
    });

    function metadataCache()  {
        return {
            getObjects: function () {
                return {users: _users, groups: []};
            }
        };
    }

    beforeEach(function () {
        module('blink.app');
        module(function ($provide) {
            $provide.value('MetadataCacheService', metadataCache);
        });
        inject(function ($injector, $httpBackend, shareService, $rootScope) {
            _$httpBackend = $httpBackend;
            _shareService = shareService;
            _$rootScope = $rootScope;
        });
    });

    it('should provide a flattened and resolved user permissions object, the list of all users and groups, and a read only flag', function (done) {

        _$httpBackend.whenPOST('/callosum/v1/security/definedpermission').respond(_bulkPermissions);
        _$httpBackend.whenPOST('/callosum/v1/security/effectivepermission').respond({});

        _shareService.getShareDialogData(_bulkObjects, 'QUESTION_ANSWER_BOOK').then(function (dialogData) {
            expect(dialogData.usersAndGroups).toEqual(_expectedUsersAndGroups);
            expect(dialogData.readOnlyMode).toEqual(false);
            expect(dialogData.userPermissions).toEqual(_expectedUserPermissions);
            done();
        }, function (error) {
            // Ensure the test fails if the call errors out
            expect(error).toBe(_unmatchedObject);
            done();
        });
        _$httpBackend.flush();
    });
});
