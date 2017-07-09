/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich
 *
 * @fileoverview Controller for memcache page
 */

'use strict';


blink.app.controller('MemcacheManagementController', ['$scope',
    '$q',
    '$rootScope',
    '$interval',
    'adminService',
    'alertConstants',
    'alertService',
    'jsonConstants',
    'metadataService',
    'strings',
    'UserAction',
    'userService',
    'util',
    function ($scope,
          $q,
          $rootScope,
          $interval,
          adminService,
          alertConstants,
          alertService,
          jsonConstants,
          metadataService,
          strings,
          UserAction,
          userService,
          util) {

        function fetchUsers() {
            var promise = metadataService.getMetadataList(jsonConstants.metadataType.USER);
            return promise.then(function (userList) {
                var users = userList.sort(function (userA, userB) {
                    return util.comparator(userA.getDisplayName(), userB.getDisplayName());
                });
                $scope.memcacheSearch.user = users[0];
                $scope.refreshChoices();
                return users;
            });
        }

    // Fetches memcache stats using adminService.getMemcacheStats and
    // does some data rearrangement (converting data from dict to list
    // on the top level)
        var fetchMemcacheStats = function () {
            var userAction = new UserAction(UserAction.FETCH_MEM_CACHE_STATS);
            return adminService.getMemcacheStats()
            .then(function (response) {
                var stats = response.data;
                var result = [];
                var keys = Object.keys(stats);
                for (var i = 0; i < keys.length; i++) {
                    var instance = stats[keys[i]];
                    // Cut off leading '/'
                    instance.addr = keys[i].substr(1);
                    result.push(instance);
                }
                return result;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        };

        $scope.isLoading = true;

        fetchUsers().then(function (users) {
            $scope.users = users;
        }).finally(function () {
            $scope.isLoading = false;
        });

        $scope.stats = [];
        $scope.currentInstance = null;

    // This function will refresh stats data from server
    // and update all scope variables to properly reflect
    // the changes.
        var refreshMemcacheStats = function () {
            fetchMemcacheStats().then(function (stats) {
                $scope.stats = stats;
                if (stats.length > 0 && !$scope.currentInstance) {
                    $scope.currentInstance = stats[0];
                } else if (stats.length > 0 && !!$scope.currentInstance) {
                    var updatedInstance = stats.find(function (instance) {
                        return instance.addr === $scope.currentInstance.addr;
                    });
                    if (!!updatedInstance) {
                        $scope.currentInstance = updatedInstance;
                    }
                }
                refreshChartsData();
            });
        };

        refreshMemcacheStats();

        if (!$scope.memcacheUpdateInterval) {
            $scope.memcacheUpdateInterval = $interval(refreshMemcacheStats, 5000);
        }

        $scope.$on("$destroy", function(){
            if ($scope.memcacheUpdateInterval) {
                $interval.cancel($scope.memcacheUpdateInterval);
            }
        });

        $scope.selectInstance = function (instance) {
            $scope.currentInstance = instance;
            refreshChartsData();
        };

        $scope.statsExpanded = false;

        $scope.toggleStats = function () {
            $scope.statsExpanded = !$scope.statsExpanded;
        };

        $scope.memoryChartData = {
            name: 'Memory',
            colorByPoint: true,
            data: []
        };

        $scope.efficiencyChartData = {
            name: 'Queries',
            colorByPoint: true,
            data: []
        };

        var refreshChartsData = function () {
            if (!!$scope.currentInstance) {
                $scope.memoryChartData.data = [{
                    name: 'Usage',
                    y: parseInt($scope.currentInstance.bytes, 10)
                }, {
                    name: 'Limit',
                /* eslint camelcase: 1 */
                    y: parseInt($scope.currentInstance.limit_maxbytes, 10)
                }];
                $scope.efficiencyChartData.data = [{
                    name: 'Hits',
                    y: parseInt($scope.currentInstance.get_hits, 10)
                }, {
                    name: 'Misses',
                    y: parseInt($scope.currentInstance.get_misses, 10)
                /* eslint camelcase: 2 */
                }];
            }
        };

        $scope.onMemcacheClearClick = function () {
            var userAction = new UserAction(UserAction.CLEAR_MEM_CACHE);
            adminService.clearMemcache()
            .then(function (response) {
                alertService.showUserActionSuccessAlert(userAction, response);
                $scope.refreshSearchResults();
                return response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        };

        $scope.refreshSearchResults = function () {
            var userAction = new UserAction(UserAction.SEARCH_MEM_CACHE);

            adminService.searchMemcache({
                objecttype: $scope.memcacheSearch.objectType,
                userid: $scope.memcacheSearch.user.getId(),
                id: JSON.stringify([
                    $scope.memcacheSearch.currentObject.id
                ]),
                showhidden: $scope.memcacheSearch.showHidden,
                useunsecured: $scope.memcacheSearch.useUnsecured
            }).then(function (response) {
                var results = response.data;
                $scope.memcacheSearchResults = (!!Object.keys(results).length) ? results : null;
                return results;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        };

        $scope.refreshChoices = function () {
            if (!$scope.memcacheSearch.objectType || !$scope.memcacheSearch.user) {
                $scope.memcacheSearch.objectChoices = null;
                return;
            }
            var userAction = new UserAction(UserAction.FETCH_METADATA_LIST);
            metadataService.getMetadataList(
            $scope.memcacheSearch.objectType,
                {
                    showHidden: $scope.memcacheSearch.showHidden
                }
        ).then(function (response) {
            var metadata = response.data;
            $scope.memcacheSearch.objectChoices = metadata.headers.map(function (object) {
                return {
                    id: object.id,
                    author: object.author,
                    name: object.name,
                    getTitle: function () {
                        return this.id + ' [' + this.name + ']';
                    }
                };
            });
            if ($scope.memcacheSearch.objectChoices.length > 0) {
                $scope.memcacheSearch.currentObject = $scope.memcacheSearch.objectChoices[0];
                $scope.refreshSearchResults();
            }
            return metadata;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
        };

        $scope.memcacheSearch = {
            objectType: 'REPORT_BOOK',
            objectTypes: [
                'REPORT_BOOK',
                'LOGICAL_TABLE',
                'LOGICAL_COLUMN',
                'LOGICAL_RELATIONSHIP',
                'DEFINED_PERMISSIONS_OBJECT',
                'EFFECTIVE_PERMISSIONS_OBJECT'
            ],
            objectChoices: [],
            user: null,
            currentObject: null,
            showHidden: true,
            useUnsecured: false
        };



        $scope.memcacheSearchResults = null;
    }]);

