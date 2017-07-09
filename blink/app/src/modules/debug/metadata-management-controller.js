/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Maxim Leonovich
 *
 * @fileoverview Controller for debug page
 */

'use strict';

blink.app.controller('MetadataManagementController', ['$scope',
    '$q',
    'adminService',
    'alertService',
    'blinkConstants',
    'strings',
    'dependencyService',
    'jsonConstants',
    'metadataService',
    'ListModel',
    'UserAction',
    function ($scope,
          $q,
          adminService,
          alertService,
          blinkConstants,
          strings,
          dependencyService,
          jsonConstants,
          metadataService,
          ListModel,
          UserAction) {

        var metadataType = jsonConstants.metadataType;
        var DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

        var filterByField = function (field, staticFilterText) {
            return function (item, filterText) {
                if ((!filterText || !filterText.length) &&
                (!staticFilterText || !staticFilterText.length)) {
                    return true;
                }
                var regex = new RegExp((staticFilterText || filterText).escapeRegExp(), 'gi');
                return !!item[field].match(regex);
            };
        };

        $scope.refreshSearchResults = function () {
            $scope.isLoading = true;
            var userAction = new UserAction(UserAction.FETCH_METADATA_LIST);
            metadataService.getMetadataList(
            $scope.currentSearch.objectType, {
                showHidden: $scope.currentSearch.showHidden,
                // Default limit is 10000. We will show up to 20000 items
                batchSize: 20000
            }).then(function (response) {
                var data = response.data;
                $scope.unfilteredResults = data.headers.map(function (header) {
                    // Annotate all objects with object type, it's not there by default
                    header.type = $scope.currentSearch.objectType;
                    return header;
                });
                $scope.applyClientFilters();
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }).finally(function (data) {
                $scope.isLoading = false;
            });
        };

        $scope.applyClientFilters = function () {
            var headers = $scope.unfilteredResults;
            if ($scope.currentSearch.id) {
                headers = headers.filter(filterByField('id', $scope.currentSearch.id));
            }
        // There's no backend filter for incomplete objects
        // but there's a way to retrieve a list of all incomplete objects
        // and perform filtering on a client side
            if ($scope.currentSearch.incompleteOnly) {
            // Make sure list of incomplete objects is loaded
            // and then update search results
                $scope.isLoading = true;
                $scope.incompletePromise.then(function () {
                    headers = headers.filter(function (header) {
                        return !!$scope.incompleteObjects[$scope.currentSearch.objectType][header.id];
                    });
                    $scope.searchResultsModel.setData(headers);
                }, $scope.onError).finally(function () {
                    $scope.isLoading = false;
                });
                return;
            }
            $scope.filteredResults = headers;
            $scope.searchResultsModel.setData(headers);
        };

    // Store all search terms for current search
        $scope.currentSearch = {
            objectTypes: [
                metadataType.REPORT_BOOK,
                metadataType.QUESTION_ANSWER_BOOK,
                metadataType.PINBOARD_ANSWER_BOOK,
                metadataType.LOGICAL_COLUMN,
                metadataType.LOGICAL_TABLE,
                metadataType.LOGICAL_RELATIONSHIP,
                metadataType.TAG,
                metadataType.DATA_SOURCE
            ],
            objectType: metadataType.REPORT_BOOK,
            id: null,
            showHidden: true,
            incompleteOnly: false,
        };

    // Retrieve list of all incomplete object for further filtering
        $scope.incompleteObjects = {};
        $scope.currentSearch.objectTypes.forEach(function (objectType) {
        // !!incompleteObjects[type][id] should tell us whether object with
        // given id and type is complete or not
            $scope.incompleteObjects[objectType] = {};
        });

        var userAction = new UserAction(UserAction.FETCH_INCOMPLETE_LIST);
        $scope.incompletePromise = dependencyService.getIncompleteList()
        .then(function (response) {
            var incomplete = response.data;
            // /dependency/listincomplete endpoint doesn't give us the exact object type
            // we have to perform mapping on the client side
            // TODO(Maxim): Add sheet support when callosum refactoring of logical
            // models is done.
            incomplete.worksheets.forEach(function (sheet) {
                $scope.incompleteObjects.LOGICAL_TABLE[sheet.worksheet.id] = true;
            });
            incomplete.tables.forEach(function (sheet) {
                $scope.incompleteObjects.LOGICAL_TABLE[sheet.table.id] = true;
            });
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });

        var supportDependenciesFor = [
            metadataType.LOGICAL_TABLE,
            metadataType.LOGICAL_COLUMN
        ];

        $scope.listActions = [
            {
                id: 'dependencies',
                tooltip: 'Show dependencies',
                css: 'bk-style-icon-download',
                isEnabled: function (selectedItems) {
                    return false;
                },
                onClick: function (selectedItems) {
                }
            },
            {
                id: 'reverse-dependencies',
                tooltip: 'Show dependents',
                css: 'bk-style-icon-upload',
                isEnabled: function (selectedItems) {
                    return selectedItems.length >= 1 &&
                    supportDependenciesFor.indexOf($scope.currentSearch.objectType) != -1 &&
                    !$scope.showingDependencies;
                },
                onClick: function (selectedItems) {
                    $scope.browseDependents(selectedItems);
                }
            },
            {
                id: 'details',
                tooltip: 'Show details',
                css: 'bk-style-icon-zoom-zone',
                isEnabled: function (selectedItems) {
                    return selectedItems.length >= 1;
                },
                onClick: function (selectedItems) {
                    $scope.showDetails(selectedItems.map(function (item) {
                        return [item.id, item.type];
                    }));
                }
            }
        ];

        $scope.showingDependencies = false;

        $scope.browseDependents = function (objects) {
            $scope.showingDependencies = true;
            $scope.showingDependenciesFor = objects;
            $scope.isLoading = true;
        // Modify the list header
            metadataColumns.createdCol.hidden = true;
            metadataColumns.modifiedCol.hidden = true;
            metadataColumns.typeCol.hidden = false;
            $scope.searchResultsModel.groupByColumn = 'dependency';
            var ids = objects.map(function (object) {
                return object.id;
            });

            var userAction = new UserAction(UserAction.FETCH_TABLE_DEPENDENTS);
            dependencyService.getDependents(ids, $scope.currentSearch.objectType).then(function (response) {
                var data = response.data;
                var results = [];
                Object.keys(data).forEach(function (key) {
                    data[key].forEach(function (object) {
                        object.type = key;
                        results.add(object);
                    });
                });
                $scope.searchResultsModel.setData(results);
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
            }).finally(function () {
                $scope.isLoading = false;
            });
        };

        $scope.clearDependencies = function () {
            $scope.showingDependenciesFor = [];
            $scope.showingDependencies = false;
        // Revert back the list header
            metadataColumns.createdCol.hidden = false;
            metadataColumns.modifiedCol.hidden = false;
            metadataColumns.typeCol.hidden = true;
            $scope.searchResultsModel.groupByColumn = undefined;
            if ($scope.filteredResults) {
                $scope.searchResultsModel.setData($scope.filteredResults);
            }
        };

    // Converts timestamp to momentjs object
        var toMoment = function (ts) {
            var dt = moment(parseInt(ts, 10));
            return dt;
        };

        var getOwnerType = function (row) {
        // Get owner type for currently displayed type
            switch (row.type) {
                case metadataType.LOGICAL_TABLE:
                    return (row.type === metadataType.subType.PRIVATE_WORKSHEET) ?
                metadataType.ANSWER : metadataType.LOGICAL_TABLE;
                case metadataType.QUESTION_ANSWER_BOOK:
                case metadataType.PINBOARD_ANSWER_BOOK:
                    return metadataType.REPORT_BOOK;
                case metadataType.LOGICAL_COLUMN:
                    return metadataType.LOGICAL_TABLE;
                case metadataType.LOGICAL_RELATIONSHIP:
                    return metadataType.LOGICAL_TABLE;
                case metadataType.VISUALIZATION:
                    return metadataType.ANSWER;
                default:
                    return row.type;
            }
        };

        var metadataColumns = {
            idCol: {
                label: 'ID',
                class: 'bk-id',
                colId: 'idCol',
                templateFile: 'src/modules/debug/columns/id.html',
                format: function (row) {
                    return row.id;
                },
                onClick: function (row) {
                    $scope.showDetails([[row.id, row.type]]);
                }
            },
            authorCol: {
                label: 'AUTHOR',
                class: 'bk-profile-pic-container bk-author',
                colId: 'author',
                templateFile: 'src/modules/debug/columns/author.html',
                getAuthorId: function (row) {
                    return row.author;
                },
                getAuthorDisplayName: function (row) {
                    return row.authorDisplayName;
                }
            },
            nameCol: {
                label: 'NAME',
                class: 'bk-name',
                colId: 'nameCol',
                templateFile: 'src/modules/debug/columns/name.html',
                onClick: function (row) {
                    $scope.showDetails([[row.id, row.type]]);
                }
            },
            typeCol: {
                label: 'TYPE',
                class: 'bk-type',
                colId: 'typeCol',
                templateFile: 'src/modules/debug/columns/type.html',
                hidden: true,
            },
            createdCol: {
                label: 'CREATED',
                class: 'bk-created',
                colId: 'createdCol',
                formatTimestamp: function (row) {
                    return toMoment(row.created).format(DATETIME_FORMAT);
                },
                fromNow: function (row) {
                    return toMoment(row.created).fromNow();
                },
                templateFile: 'src/modules/debug/columns/datetime.html',
            },
            modifiedCol: {
                label: 'UPDATED',
                class: 'bk-modified',
                colId: 'modifiedCol',
                formatTimestamp: function (row) {
                    return toMoment(row.modified).format(DATETIME_FORMAT);
                },
                fromNow: function (row) {
                    return toMoment(row.modified).fromNow();
                },
                templateFile: 'src/modules/debug/columns/datetime.html',
            },
            ownerCol: {
                label: 'OWNER',
                class: 'bk-owner',
                colId: 'ownerCol',
                format: function (row) {
                    return row.owner;
                },
                constants: strings.debug,
                onClick: function (row) {
                    $scope.showDetails([[row.owner, getOwnerType(row)]]);
                },
                templateFile: 'src/modules/debug/columns/owner.html',
            },
            hiddenCol: {
                label: 'HIDDEN',
                class: 'bk-hidden',
                colId: 'hiddenCol',
                templateFile: 'src/modules/debug/columns/hidden.html',
            },
            deletedCol: {
                label: 'DELETED',
                class: 'bk-deleted',
                colId: 'deletedCol',
                templateFile: 'src/modules/debug/columns/deleted.html',
            }
        };

        $scope.searchResultsModel = new ListModel(
        metadataColumns,
        [],
        filterByField('name'),
        function (data) {
            return data.length + ' Objects';
        },
        true,
        true,
        undefined,
        'src/modules/debug/columns/dependency-group-marker.html'
    );

        $scope.searchResultsModel.getDependencyName = function (guid) {
            var dependency = $scope.showingDependenciesFor.find(function (item) {
                return item.id === guid;
            });
            return (!!dependency) ? dependency.name : "";
        };

        $scope.showingDetails = false;
        $scope.showingDependenciesFor = [];
        $scope.detailsData = [];

        $scope.closeDetails = function () {
            $scope.detailsData = [];
            $scope.showingDetails = false;
        };

        $scope.showDetails = function (items) {
        // showDetails takes a list of (guid, type) pairs like
        // [ [guid, type], [guid, type], .... ] as input
        // then it groups guids by type, for every type executes
        // a details query and when all queries are finished, it
        // switches template into 'showingDetails' state.
            $scope.showingDetails = true;
            $scope.isLoading = true;
            $scope.detailsData = [];
            var groupedItems = items.reduce(function (previous, current) {
                if (current[1] in previous) {
                    previous[current[1]].push(current[0]);
                } else {
                    previous[current[1]] = [current[0]];
                }
                return previous;
            }, {});
            var promises = Object.keys(groupedItems).map(function (key) {
                var userAction = new UserAction(UserAction.FETCH_METADATA_DETAILS);
                return metadataService.getMetadataDetails(
                key,
                groupedItems[key],
                true
            ).then(function (response) {
                var data = response.data;
                $scope.detailsData = $scope.detailsData.concat(data.storables.map(function (item) {
                    item.type = key;
                    return item;
                }));
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
            });
            $q.all(promises).finally(function () {
                $scope.isLoading = false;
            });
        };

        $scope.schemaVersion = null;
        userAction = new UserAction(UserAction.GET_DEBUG_INFO);
        adminService.getDebugInfo().then(function (response) {
            var info = response.data;
            $scope.schemaVersion = info.schemaVersion;
            return info;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });

        $scope.refreshSearchResults();
    }]);

