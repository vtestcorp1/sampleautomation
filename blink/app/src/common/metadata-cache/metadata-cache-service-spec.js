/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Unit tests for metadata cache
 */

'use strict';

/* eslint camelcase: 1, no-undef: 0 */
describe('Metadata-cache', function() {
    var cache;
    var metadataService = {};
    var $rootScope;
    var $q;
    var _$httpBackend;

    var metadataCallUserDeferred;
    var metadataCallGroupDeferred;
    var usersToReturn;
    var groupsToReturn;

    var TYPE_GROUP = 'USER_GROUP';
    var TYPE_USER = 'USER';

    var JSON_LOCAL_GROUP = 'LOCAL_GROUP';
    var JSON_LOCAL_USER = 'LOCAL_USER';


    var MetadataCacheService;
    var moduleName = 'src/common/metadata-cache/metadata-cache-service';

    var groupOne = {
        type: JSON_LOCAL_GROUP,
        id: '1',
        name:'1'
    };

    var userA = {
        type: JSON_LOCAL_USER,
        id : 'A',
        name: 'a'
    };


    var shouldRejectPromise = false;
    function resetDefer() {
        metadataCallUserDeferred = $q.defer();
        metadataCallGroupDeferred = $q.defer();
    }
    metadataService.getMetadataList = function(type, params) {
        if (shouldRejectPromise) {
            return $q.reject();
        }

        var groups = groupsToReturn;
        var users = usersToReturn;

        switch (type) {
            case TYPE_GROUP:
                metadataCallGroupDeferred.resolve(groups);
                return metadataCallGroupDeferred.promise;
            case TYPE_USER:
                metadataCallUserDeferred.resolve(users);
                return metadataCallUserDeferred.promise;
            default:
        }
    };

    describe('cache', function () {

        beforeEach(function () {
            module('blink.app');
        });
        beforeEach(function (done) {
            System.import(
                moduleName).then(function(module){
                    inject(function (_$q_, _$rootScope_, $httpBackend, _metadataService_) {
                        $q = _$q_;
                        _$httpBackend = $httpBackend;
                        $rootScope = _$rootScope_;
                        MetadataCacheService = new module.MetadataCache();
                        resetDefer();
                        MetadataCacheService.reset();
                        metadataService = _metadataService_;
                        spyOn(metadataService, 'getMetadataList').and.callThrough();

                        var targetUrl = '/callosum/v1/metadata/list';
                    // whenGET takes into account query string, so we need some regExp magic to make it work
                        var pattern = new RegExp("^" + targetUrl);

                        _$httpBackend.whenGET(pattern).respond(function(httpMethod, url){
                            var queryString = URI(url).search(true);

                            if (shouldRejectPromise) {
                                return [500, '[TEST FAILURE]'];
                            }

                            switch (queryString.type) {
                                case TYPE_GROUP:
                                    return [200, groupsToReturn];

                                case TYPE_USER:
                                    return [200, usersToReturn];
                                default:
                            }
                        });
                    });
                    done();
                });
        });

        afterEach(function(done){
            System.delete(
                System.normalizeSync(moduleName));
            //Hack(Ashish): Does not work on Chrome 52 without this, some issue
            //with Chrome/systemJS, https://github.com/systemjs/systemjs/issues/1372.
            setTimeout(done, 0);
        });

        it('should trigger a request if the entity is not cached', function(){

            groupsToReturn = {
                headers : [groupOne]
            };
            usersToReturn = {
                headers : [userA]
            };

            MetadataCacheService.getObjects(['A', '1', 'C']);
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(3);
            _$httpBackend.flush();
            $rootScope.$digest();
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(0);
        });

        it('should return correct group and user', function(done){

            groupsToReturn = {
                headers : [groupOne]
            };
            usersToReturn = {
                headers : [userA]
            };

            MetadataCacheService.getObjects(['A', '1', 'f']).then(function(response){
                expect(response.users.length).toBe(1);
                expect(response.groups.length).toBe(1);
                expect(response.users[0].getId()).toBe('A');
                expect(response.groups[0].getId()).toBe('1');
                done();
            });
            _$httpBackend.flush();
            $rootScope.$digest();
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
        });

        it('should not trigger a request if the entity is cached', function(){

            groupsToReturn = {
                headers : [groupOne]
            };
            usersToReturn = {
                headers : [userA]
            };

            MetadataCacheService.getObjects(['A', '1']);
            $rootScope.$digest();
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
            resetDefer();
            MetadataCacheService.getObjects(['A', '1']);
            $rootScope.$digest();
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
        });

        it('should trigger new request for new entities', function(){
            groupsToReturn = {
                headers : [groupOne]
            };
            usersToReturn = {
                headers : [userA]
            };
            resetDefer();
            MetadataCacheService.getObjects(['A', '1']).then(function(){
            });
            $rootScope.$digest();
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
            resetDefer();
            MetadataCacheService.getObjects(['C', 'D']);
            $rootScope.$digest();
            expect(metadataService.getMetadataList.calls.count()).toBe(4);

        });

        it('should re-use pending request, if a request of this entity pending', function(done){

            groupsToReturn = {
                headers : [groupOne]
            };
            usersToReturn = {
                headers : [userA]
            };
            resetDefer();
            var firstRequest = MetadataCacheService.getObjects(['A', '1']);
            var secondRequest = MetadataCacheService.getObjects(['A', '1']);
            expect(metadataService.getMetadataList.calls.count()).toBe(2);

            firstRequest.then(function(response){
                expect(response.users.length).toBe(1);
                expect(response.groups.length).toBe(1);
                expect(response.users[0].getId()).toBe('A');
                expect(response.groups[0].getId()).toBe('1');

                secondRequest.then(function(response) {
                    console.log(response);
                    expect(response.users.length).toBe(1);
                    expect(response.groups.length).toBe(1);
                    expect(response.users[0].getId()).toBe('A');
                    expect(response.groups[0].getId()).toBe('1');
                    done();
                });
            });
            $rootScope.$digest();
            _$httpBackend.flush();
        });

        // Note(Chab) in this test, we check the state of the cached pending request
        it('should re-use pending request, if a request of this entity pending/2', function(){

            groupsToReturn = {
                headers: [groupOne]
            };

            usersToReturn = {
                headers: [userA]
            };

            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(0);
            resetDefer();
            MetadataCacheService.getObjects(['A', '1']);
            resetDefer();
            MetadataCacheService.getObjects(['A', '1']);
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(2);
            _$httpBackend.flush();
            $rootScope.$digest();
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(0);
        });

        it('shoud re-use pending request, with non-accessible user/1', function(done){
            groupsToReturn = {
                headers: []
            };
            usersToReturn = {
                headers: []
            };
            resetDefer();
            var firstRequest = MetadataCacheService.getObjects(['A', '1']);
            var secondRequest = MetadataCacheService.getObjects(['A', '1']);
            expect(metadataService.getMetadataList.calls.count()).toBe(2);

            firstRequest.then(function(response){
                expect(response.users.length).toBe(0);
                expect(response.groups.length).toBe(0);
                secondRequest.then(function(response) {
                    expect(response.users.length).toBe(0);
                    expect(response.groups.length).toBe(0);
                    done();
                });
            });
            $rootScope.$digest();
            _$httpBackend.flush();
        });

        it('shoud re-use pending request, with non-accessible user/2', function() {

            resetDefer();
            groupsToReturn = {
                headers: []
            };

            usersToReturn = {
                headers : []
            };

            MetadataCacheService.getObjects(['A', '1']);
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(2);
            MetadataCacheService.getObjects(['A', '1']);
            _$httpBackend.flush();
            $rootScope.$digest();
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(0);
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
        });

        it('shoud re-use existing entity, with non-accessible user/1', function() {
            resetDefer();

            groupsToReturn = {
                headers : []
            };

            usersToReturn = {
                headers : []
            };

            MetadataCacheService.getObjects(['A', '1']);
            _$httpBackend.flush();
            $rootScope.$digest();
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(0);
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
            MetadataCacheService.getObjects(['A', '1']);
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(0);
            $rootScope.$digest();
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(0);

        });

        it('it should reset the cache', function(){

            groupsToReturn = {
                headers: [groupOne]
            };

            usersToReturn = {
                headers: [userA]
            };

            resetDefer();
            MetadataCacheService.getObjects(['A', '1']);
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
            _$httpBackend.flush();
            $rootScope.$digest();

            MetadataCacheService.reset();
            resetDefer();
            MetadataCacheService.getObjects(['A', '1']);
            expect(metadataService.getMetadataList.calls.count()).toBe(4);
            resetDefer();
            MetadataCacheService.getObjects(['A', '1']);
            expect(metadataService.getMetadataList.calls.count()).toBe(4);
            _$httpBackend.flush();
            $rootScope.$digest();
            MetadataCacheService.reset();
            resetDefer();

            MetadataCacheService.getObjects(['A', '1']);
            expect(metadataService.getMetadataList.calls.count()).toBe(6);
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(2);
            _$httpBackend.flush();
            $rootScope.$digest();
            // check that the pending requests are resolved
            expect(MetadataCacheService.getPendingRequestKeys().count()).toBe(0);
        });

        it('should trigger only one request, if we pass the type of the object', function(){

            groupsToReturn = {
                headers: [groupOne]
            };

            usersToReturn = {
                headers: [userA]
            };

            resetDefer();
            MetadataCacheService.getObjects(['A', '1'], 0);
            expect(metadataService.getMetadataList.calls.count()).toBe(1);
            _$httpBackend.flush();
            $rootScope.$digest();

            MetadataCacheService.reset();
            resetDefer();
            MetadataCacheService.getObjects(['A', '1'], 1);
            expect(metadataService.getMetadataList.calls.count()).toBe(2);
            _$httpBackend.flush();
            $rootScope.$digest();

            MetadataCacheService.reset();
            resetDefer();
            MetadataCacheService.getObjects(['A', '1']);
            expect(metadataService.getMetadataList.calls.count()).toBe(4);
            _$httpBackend.flush();
            $rootScope.$digest();
        });
    });
});
