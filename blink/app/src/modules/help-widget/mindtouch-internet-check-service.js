/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Service to check for internet connection
 *
 */

'use strict';

blink.app.factory('mindtouchInternetCheckService', ['$q',
    function ($q) {

        function checkNetworkConnectivity() {
            var deferred = $q.defer();

            var blankImage = new Image(),
                networkConnected,
                networkReachable = false,
                networkCallFinished = false;
            blankImage.onload = function () {
                if (networkConnected) {
                    clearTimeout(networkConnected);
                }
                networkCallFinished = true;
                networkReachable = true;
                deferred.resolve(networkReachable);
            };
            blankImage.onerror = function () {
                if (networkConnected) {
                    clearTimeout(networkConnected);
                }
                networkCallFinished = true;
                networkReachable = false;
                deferred.resolve(networkReachable);
            };
            networkConnected = setTimeout(function () {
                if (networkCallFinished) {
                    return;
                }
                networkReachable = false;
                deferred.resolve(networkReachable);
            }, 5000);

        // randomNum is used for cache busting
            var randomNum = Math.round(Math.random() * 10000);

            blankImage.src = "//help.thoughtspot.com/@api/deki/files/1201/blanknetworkconnect.png" + "?rand=" + randomNum;

            return deferred.promise;
        }

        return {
            checkNetworkConnectivity: checkNetworkConnectivity
        };
    }]);
