/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to cache resources that are loaded separately from the main app.
 * Resources can optionally be pre-cached during the build process.
 *
 */

'use strict';

blink.app.factory('resourceCachingService', ['$http', '$q',
    function ($http, $q) {

        var resourceUrlToResourceCache = {};

        function putResource(url, shader) {
            resourceUrlToResourceCache[url] = shader;
        }

        function getResource(url) {
            var deferred = $q.defer();
            if (Object.has(resourceUrlToResourceCache, url)) {
                deferred.resolve(resourceUrlToResourceCache[url]);
                return deferred.promise;
            }

            $http.get(url)
            .then(function(response, status, headers, config){
                var shader = response.data;
                putResource(url, shader);
                deferred.resolve(shader);
            }, function(data, status, headers, config){
                deferred.reject(data);
            });

            return deferred.promise;
        }

        function getResources(urls) {
            var promises = urls.map(function(url){
                return getResource(url);
            });
            return $q.all(promises);
        }

        return {
            getResource: getResource,
            getResources: getResources,
            putResource: putResource
        };
    }]);
