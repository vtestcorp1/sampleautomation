/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Service user to get release version name
 *
 */

'use strict';

blink.app.factory('supportService', ['$http',
    '$q',
    'Command',
    'util',
    function ($http,
          $q,
          Command,
          util) {

    // randomNum is used for cache busting
        var randomNum = Math.round(Math.random() * 10000);

    /**
     * @return {Object} Promise
     */
        var getReleaseVersion = function () {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: '/release' + '?rand=' + randomNum,
                headers: {},
                timeout: 10000
            })
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(status);
            });
            return deferred.promise;
        };

        var getHelpPortalAuthToken = function () {
            var deferred = $q.defer();
            var command = new Command()
            .setPath('/session/mindtouchtoken');

            util.executeDeferredOnPromise(command.execute(), deferred);
            return deferred.promise;
        };

        return {
            getReleaseVersion: getReleaseVersion,
            getHelpPortalAuthToken: getHelpPortalAuthToken
        };
    }]);
