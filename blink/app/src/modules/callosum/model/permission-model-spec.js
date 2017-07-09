/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Unit tests for permission model classes.
 */

'use strict';

describe('EffectivePermissionModel', function () {
    beforeEach(module('blink.app'));

    var EffectivePermissionModel;
    beforeEach(inject(function (permissionFactory) {
        EffectivePermissionModel = permissionFactory.EffectivePermissionModel;
    }));

    it('should return a share mode', function () {
        var perm = new EffectivePermissionModel({
            shareMode: 'foo'
        });

        expect(perm.getShareMode()).toBe('foo');
    });

    it('should return dependents', function () {
        var perm = new EffectivePermissionModel({
            dependents: [{
                shareMode: 'dependentFoo'
            }]
        });

        expect(perm.getDependents().length).toBe(1);
        expect(perm.getDependents()[0].shareMode).toBe('dependentFoo');
    });

    it('should give underlying access', function () {
        var perm = new EffectivePermissionModel({
            dependents: []
        });

        expect(perm.hasUnderlyingAccess()).toBeTruthy();

        perm = new EffectivePermissionModel({
            dependents: [{
                shareMode: 'dependentFoo'
            }]
        });

        expect(perm.hasUnderlyingAccess()).toBeTruthy();

        perm = new EffectivePermissionModel({
            dependents: [{
                shareMode: 'dependentFoo'
            }, {
                shareMode: 'dependentBar'
            }]
        });

        expect(perm.hasUnderlyingAccess()).toBeTruthy();
    });

    it('should deny underlying access', function () {
        var perm = new EffectivePermissionModel({
            dependents: [{
                shareMode: 'NO_ACCESS'
            }]
        });

        expect(perm.hasUnderlyingAccess()).toBeFalsy();

        perm = new EffectivePermissionModel({
            dependents: [{
                shareMode: 'dependentFoo'
            }, {
                shareMode: 'NO_ACCESS'
            }]
        });

        expect(perm.hasUnderlyingAccess()).toBeFalsy();
    });
});

describe('BulkEffectivePermissionModel', function () {
    beforeEach(module('blink.app'));

    var BulkEffectivePermissionModel;
    beforeEach(inject(function (permissionFactory) {
        BulkEffectivePermissionModel = permissionFactory.BulkEffectivePermissionModel;
    }));

    it('should create EffectivePermissionModel for each object', function () {
        var perm = new BulkEffectivePermissionModel({
            'obj1': {
                permissions: {
                    'user1': {
                        shareMode: 'foo'
                    }
                }
            },
            'obj2': {
                permissions: {
                    'user1': {
                        shareMode: 'bar'
                    }
                }
            }
        });

        expect(perm.getObjectPermission('obj1')).not.toBeNull();
        expect(perm.getObjectPermission('obj1').getShareMode()).toBe('foo');
        expect(perm.getObjectPermission('obj2').getShareMode()).toBe('bar');
    });

    it('should disallow all-object-edit permission', function () {
        var perm = new BulkEffectivePermissionModel({
            'obj1': {
                permissions: {
                    'user1': {
                        shareMode: 'foo'
                    }
                }
            },
            'obj2': {
                permissions: {
                    'user1': {
                        shareMode: 'bar'
                    }
                }
            }
        });

        expect(perm.canEditObjects()).toBeFalsy();

        perm = new BulkEffectivePermissionModel({
            'obj1': {
                permissions: {
                    'user1': {
                        shareMode: 'MODIFY'
                    }
                }
            },
            'obj2': {
                permissions: {
                    'user1': {
                        shareMode: 'bar'
                    }
                }
            }
        });

        expect(perm.canEditObjects()).toBeFalsy();
    });

    it('should allow all-object-edit permission', function () {
        var perm = new BulkEffectivePermissionModel({
            'obj1': {
                permissions: {
                    'user1': {
                        shareMode: 'MODIFY'
                    }
                }
            },
            'obj2': {
                permissions: {
                    'user1': {
                        shareMode: 'MODIFY'
                    }
                }
            }
        });

        expect(perm.canEditObjects()).toBeTruthy();
    });
});
