/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Directive for implementing the columns panel component of sage data panel.
 */

'use strict';

blink.app.controller('BulkSageDataColumnsController', ['$scope',
    '$timeout',
    'events',
    'Logger',
    'strings',
    'util',
    'sageDataSourceService',
    function ($scope,
          $timeout,
          events,
          Logger,
          strings,
          util,
          sageDataSourceService) {
        var _logger = Logger.create('sage-data-columns-controller');

    // TODO(vibhor): Simplify the code in this controller to get rid of various redundant lists for all/selected columns.
        var allColumns = [],
            selectedColumns = [],
            allColumnsMap = {},
            accessibleTablesMap = null;

    // We maintain a source id presence map for efficient deletion in the event of sources being removed from scope.
    // It is a hashmap from string to boolean.
        var selectedSourceIds = {};

    // A sorted list of sources that are selected in scope. The list needs to be resorted everytime sources are added
    // or deleted.
        $scope.selectedSources = [];

        function sortSelectedSources() {
            $scope.selectedSources.sort(function (aSource, bSource) {
                return util.comparator(aSource.sourceName, bSource.sourceName);
            });
        }

        function columnSortComparatorFn(aCol, bCol) {
            return util.comparator(aCol.getName(), bCol.getName());
        }

        function cleanupSelectedSources() {
            $scope.selectedSources = $scope.selectedSources.unique(function (source) {
                return source.sourceId;
            }).filter(function (source) {
                return !!selectedSourceIds[source.sourceId];
            });
            sortSelectedSources();
        }

        function updateColumns(columns) {
            allColumns = columns;
            allColumns.sort(function (column1, column2) {
                var name1 = column1.getName(),
                    name2 = column2.getName();
                return (name1 === name2 ? 0 : (name1 > name2 ? 1 : -1));
            });

            allColumnsMap = {};
            allColumns.each(function (col) {
                allColumnsMap[col.getGuid()] = col;
            });

            updateSelectedColumns();
        }

        var _isLoadingColumns = false,
            updateSourceModelsCallId = 0;

        var updateSourceModels = function (newSourceIds) {
            var isSourceChanged = false;

            if (!newSourceIds || !newSourceIds.length) {
                newSourceIds = [];
            }

        //Map new source ids to a hash
            var newSourceIdsMap = {};
            newSourceIds.forEach(function (id) {
                newSourceIdsMap[id] = true;
            });

        // Remove the tables that are not in the selected sources
            Object.keys(selectedSourceIds).forEach(function(id) {
                if (!newSourceIdsMap[id]) {
                    isSourceChanged = true;
                    delete selectedSourceIds[id];
                }
            });

            if (!isSourceChanged) {
                isSourceChanged = Object.keys(newSourceIdsMap).any(function (newId) {
                    return !selectedSourceIds[newId];
                });
            }

        // toggle the flag in the next event loop to avoid
        // short flashing animation in case we hit cache
            util.executeInNextEventLoop(function(){
                _isLoadingColumns = true;
            });

            var callId = ++updateSourceModelsCallId;

            sageDataSourceService.getSourcesModels(newSourceIds).then(function(sourceIdToModel){
                if (callId < updateSourceModelsCallId) {
                    _logger.info('source model update call with id', callId,
                    'ignored because it is older than current call id', updateSourceModelsCallId);
                    return;
                }
                util.executeInNextEventLoop(function(){
                    _isLoadingColumns = false;
                });
                newSourceIds.each(function(newSourceId){
                    if (!sourceIdToModel[newSourceId]) {
                        _logger.warn('Metadata unavailable for source', newSourceId);
                        return;
                    }

                    var model = sourceIdToModel[newSourceId],
                        columns = model.getColumns() || [],
                        sourceName = model.getName();

                    columns = columns.filter(function(column){
                        return !column.isHidden();
                    });
                    columns.sort(columnSortComparatorFn);

                    columns.forEach(function (col) {
                        var data = model.getDataForColumn(col);
                        col.setData(data);
                    });
                    selectedSourceIds[model.getId()] = true;
                    $scope.selectedSources.push({
                        sourceId: model.getId(),
                        sourceName: sourceName,
                        columns: columns,
                        tooltip: model.getTooltipInformationModel().getTemplate()
                    });
                });

                if (newSourceIds.length > 0) {
                    util.registerOneShotEventListener($scope, events.LIST_RENDERED_U, function(event) {
                        _logger.log('Received LIST_RENDERED event for sage-data-columns-controller.');
                        event.stopPropagation();
                        $scope.$emit(events.LEFT_PANEL_COMPONENT_RENDERED_U);
                    });
                } else {
                    _logger.log('Faking LIST_RENDERED event for left panel.');
                    util.executeInNextEventLoop(function() {
                        $scope.$emit(events.LEFT_PANEL_COMPONENT_RENDERED_U);
                    });
                }


                cleanupSelectedSources();

            // Even if promises array is empty, util.getAggregatedPromise resolves. So we are sure to call updateColumns
            // for whatever reason isSourceChanged is true
                if (isSourceChanged) {
                    var columns = [];
                    $scope.selectedSources.each(function (sourceObject) {
                        if (sourceObject && sourceObject.columns) {
                            columns = columns.concat(sourceObject.columns);
                        }
                    });
                    updateColumns(columns);
                    filterListItems($scope.colItemFilter);
                }

            }, function(error){
                _logger.error('Error in getting sources metadata', error);
                util.executeInNextEventLoop(function(){
                    _isLoadingColumns = false;
                });
            });

        };

        $scope.isLoadingColumns = function () {
            return _isLoadingColumns;
        };

        function updateSelectedColumns() {
            selectedColumns.each(function (col) {
                col._selected = false;
            });

            selectedColumns = [];
            var documentModel = $scope.panelComponent.getDocumentConfig().model;
            if (!documentModel || !allColumns.length) {
                return;
            }

            var tokens = documentModel.getRecognizedTokens() || [],
                newSelectedColumnsMap = {};
            tokens.each(function (token) {
                if (token.isDataToken()) {
                    var guid = token.getGuid();
                    if (allColumnsMap.hasOwnProperty(guid)) {
                        allColumnsMap[guid]._selected = true;
                        newSelectedColumnsMap[guid] = allColumnsMap[guid];
                    } else {
                        _logger.warn('The saved token is referring to a guid that was not returned by source columns', guid);
                    }
                }
            });

            selectedColumns = Object.values(newSelectedColumnsMap);
        }

        $scope.isSourceAccessible = function (sourceId) {
            if (!accessibleTablesMap) {
            // this means all are accessible.
                return true;
            }
            return !!accessibleTablesMap[sourceId];
        };

        function updateSelectedColumnsReadOnlyMode() {
            var model = $scope.panelComponent.getDocumentConfig().model;

            if (!model) {
                _logger.warn('Data sources opened in read only mode with no model');
                return;
            }

            var recognizedTokens = model.getRecognizedTokens();

            if (!recognizedTokens || !recognizedTokens.length) {
                _logger.warn('Data sources opened in read only mode with model with no recognized tokens');
                return;
            }

            var seenColIds = {};
            selectedColumns = [];

            var sourceIdToCols = {};
            recognizedTokens.filter(function (rt) {
                return rt.isDataToken();
            }).forEach(function (rt) {
                var colId = rt.getGuid();
                if (!seenColIds[colId]) {
                    seenColIds[colId] = true;
                    var col = {
                        getName: function () { return rt.getColumnName(); },
                        getOwnerName: function () { return rt.getTableName(); },
                        getOwner: function () {
                            return rt.getTableGuid();
                        },
                        _selected: true
                    };
                    selectedColumns.push(col);

                    var sourceId = col.getOwner();
                    if (!sourceIdToCols[sourceId]) {
                        sourceIdToCols[sourceId] = [];
                    }
                    sourceIdToCols[sourceId].push(col);
                }
            });

            $scope.selectedSources = [];
            for (var sourceId in sourceIdToCols) {
                if (sourceIdToCols[sourceId]) {
                    var cols = sourceIdToCols[sourceId];
                    if (!cols.length) {
                        continue;
                    }

                    selectedSourceIds[sourceId] = true;
                    $scope.selectedSources.push({
                        sourceId: sourceId,
                        sourceName: cols[0].getOwnerName(),
                        filteredColumns: cols.sort(columnSortComparatorFn)
                    });
                }
            }
            sortSelectedSources();
        }

        var _sourceIdWatchTriggeredOnce = false;
        $scope.$watch(function () {
            return $scope.panelComponent.getDataSources();
        }, function (newSourceIds, oldSourceIds) {
            newSourceIds = newSourceIds || [];
            oldSourceIds = oldSourceIds || [];
            if ((util.areArraysSameSet(newSourceIds, oldSourceIds) && _sourceIdWatchTriggeredOnce) || $scope.panelComponent.isReadOnly()) {
                return;
            }

            _sourceIdWatchTriggeredOnce = true;
            updateSourceModels(newSourceIds || []);
        });

        var _documentModelWatchTriggeredOnce = false;
        $scope.$watch(function () {
            return $scope.panelComponent.getDocumentConfig().model;
        }, function (newModel, oldModel) {
            if (newModel === oldModel && _documentModelWatchTriggeredOnce) {
                return;
            }

            _documentModelWatchTriggeredOnce = true;
            if ($scope.panelComponent.isReadOnly()) {
                updateSelectedColumnsReadOnlyMode();
            } else {
                updateSelectedColumns();
            }
        });

        $scope.$watch(function(){
            var docConfig = $scope.panelComponent.getDocumentConfig();
            return docConfig && docConfig.sageModel && docConfig.sageModel.getAccessibleTables();
        }, function(accessibleTables) {
            if (!accessibleTables || accessibleTables.length === 0) {
                accessibleTablesMap = null;
            } else {
                accessibleTablesMap = util.mapArrayToBooleanHash(accessibleTables);
            }
        }, true);

        $scope.filterListItems = function(item) {
            if (!$scope.colItemFilter) {
                return true;
            }

            var regex = new RegExp($scope.colItemFilter.escapeRegExp(), 'gi');
            return !!item.getName().match(regex);
        };

        $scope.onFocusOut = function () {
            $scope.$broadcast('focus-out-sage-columns');
        };

        $scope.shouldShowAddBulkColumnsBtn = function () {
            return !!allColumns.length && !$scope.panelComponent.isReadOnly();
        };

        function filterListItems(filter) {
            filter = filter || '';
            var regex = new RegExp(filter.escapeRegExp(), 'gi');
            $scope.selectedSources.each(function (colObj) {
                colObj.columns = colObj.columns || [];
                colObj.filteredColumns = colObj.columns.filter(function (col) {
                    return !!col.getName().match(regex);
                });
            });
        }

        var filterTimeout;
        $scope.$watch('colItemFilter', function columnFilterWatchAction(newFilter, oldFilter) {
            if (newFilter === oldFilter) {
                return;
            }

            if (!!filterTimeout) {
                $timeout.cancel(filterTimeout);
            }

            filterTimeout = $timeout(function () {
                filterListItems(newFilter);
                filterTimeout = null;
            }, 300);
        });
    }]);
