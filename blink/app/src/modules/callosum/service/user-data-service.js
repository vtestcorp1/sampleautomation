/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Wrapper to talk to the /userdata api service from callosum.
 */

'use strict';

blink.app.factory('userDataService', ['$rootScope',
    '$q',
    'Command',
    'Logger',
    'util',
    function ($rootScope,
          $q,
          Command,
          Logger,
          util) {
        var me = {};
        var _logger = Logger.create('user-data-service');

    /**
     * @param {string} file
     * @param {boolean} hasHeaders If true, the first line of fileContent should be treated as column names.
     * @return {Object} Promise
     */
        me.cacheData = function (file, hasHeaders, separator) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/cachedatafile')
            .setIsMultipart(true)
            .setPostParams({
                content: file,
                name: file.name,
                hasheaderrow: hasHeaders,
                separator: separator
            });

            command.execute({
                disableErrorNotification: true
            })
            .then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        me.readColumns = function (cacheGuid) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/readcolumns')
            .setPostMethod()
            .setTimeout(300000)
            .setPostParams({
                cacheguid: cacheGuid
            });

            command.execute({
                disableErrorNotification: true
            })
            .then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

    /**
     * @param {Object} userSchema
     * @return {Object} Promise
     */
        me.readKeys = function (userSchema) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/readkeys')
            .setPostMethod()
            .setPostParams({
                schema: JSON.stringify(userSchema)
            });

            command.execute()
            .then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        me.loadData = function(userDataObjectId, cacheGuid, forceLoad, dropExistingData) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/loaddata')
            .setPostMethod()
            .setPostParams({
                id: userDataObjectId,
                cacheguid: cacheGuid,
                forceload: forceLoad,
                dropexistingdata: dropExistingData
            });

            command.execute()
            .then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

    /**
     * @param {Object} userSchema
     * @return {Object} Promise
     */
        me.readRelationships = function (userSchema) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/readrelationships')
            .setPostMethod()
            .setPostParams({
                schema: JSON.stringify(userSchema)
            });

            command.execute()
            .then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

    /**
     * @param {Object} userSchema
     * @param {boolean} forceLoad If true, the api will ignore data validation error and force create table.
     * @return {Object} Promise
     */
        me.createTable = function (userSchema, forceLoad) {
            forceLoad = forceLoad || false;
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/createtable')
            .setPostMethod()
            .setPostParams({
                schema: JSON.stringify(userSchema),
                forceload: forceLoad
            });

            command.execute()
            .then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

    /**
     * @param {Object} cacheGuid
     * @return {Object} promise
     */
        me.getDataRows = function (cacheGuid) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/getrows')
            .setPostMethod()
            .setPostParams({
                cacheguid: cacheGuid
            });

            command.execute()
            .then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        me.deleteFile = function (id) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/delete/' + id);

            command.execute()
            .then(function (data) {
                deferred.resolve(data);
            }, function (data) {
                deferred.reject(data);
            });

            return deferred.promise;
        };

        me.deleteUserDataFiles = function (ids) {
            var deferred = $q.defer();
            if (!ids) {
                deferred.resolve(null);
            }

            var promises = [];
            ids.forEach(function (id) {
                promises.push(me.deleteFile(id));
            });

            util.getAggregatedPromise(promises).then(function (response) {
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        me.abortCreateTable = function (cacheGuid) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/abortandclearcache')
            .setPostMethod()
            .setPostParams({
                cacheGuid: JSON.stringify(cacheGuid)
            });

            command.execute()
            .then(function () {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        me.getSchema = function (userDataGuid) {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/userdata/schema/' + userDataGuid);

            command.execute()
            .then(function (data) {
                deferred.resolve(data);
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        return me;

    }]);
