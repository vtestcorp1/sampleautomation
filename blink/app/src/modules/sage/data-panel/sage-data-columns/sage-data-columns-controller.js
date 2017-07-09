/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com),
 * Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Directive for implementing the columns panel component of sage data panel.
 */

'use strict';

blink.app.controller('SageDataColumnsController', ['$scope',
    '$timeout',
    'alertConstants',
    'alertService',
    'autoCompleteObjectUtil',
    'autoCompleteService',
    'blinkConstants',
    'strings',
    'dateUtil',
    'env',
    'events',
    'filterUtil',
    'Logger',
    'messageService',
    'sageCallosumTranslator',
    'sageDataScopeService',
    'sageDataSourceService',
    'sessionService',
    'relationshipPopupService',
    'util',
    function ($scope,
              $timeout,
              alertConstants,
              alertService,
              autoCompleteObjectUtil,
              autoCompleteService,
              blinkConstants,
              strings,
              dateUtil,
              env,
              events,
              filterUtil,
              Logger,
              messageService,
              sageCallosumTranslator,
              sageDataScopeService,
              sageDataSourceService,
              sessionService,
              relationshipPopupService,
              util) {
        var _logger = Logger.create('columns-panel-controller');

        var UNIQUE_SAMPLE_VALUES_TO_SHOW = 3;
        var COLUMN_SEARCH_DEBOUNCE_THRESHOLD = 300;

    // Set of source id for which sample value call has failed, for these
    // sources, we do not make the call again and not show the sample value
        var sourceIdWithFailedSampleValueCall = {};

        $scope.colPanel = this;
        var colPanel = this;

    // Model
        this.searchText = '';
        this.dataSources = null;
        this.numSelections = 0;
        this.numColumnsInUse = 0;

        $scope.noSourcesPlaceholderString = $scope
        .columnPanelComponentConfig
        .noSourcesPlaceholderString;

        $scope.getTitle = function() {
            return strings.dataPanel.COLUMNS_TITLE;
        };

        $scope.addColumnsBtnLabel = strings.ADD_COLUMNS;

        var _isLoading = false;

        this.showNoSourcePlaceholder = function () {
            return !!this.dataSources
            && this.dataSources.length === 0
            && !_isLoading
            && !!$scope.noSourcesPlaceholderString;
        };

        this.isLoading = function () {
            return _isLoading;
        };

        var _isFilterUpdating = false;

        this.isFilterUpdating = function () {
            return _isFilterUpdating;
        };

        this.setIsFilterUpdating = function (value) {
            _isFilterUpdating = value;
        };

        var accessibleTablesMap = null;

        function SourceModel(id, name, columns) {
            var filteredColumns = columns || [];
            var metadataInfo = {};
            var columnsByColumnSource = [];

            this.getFilteredColumns = function () {
                return filteredColumns;
            };

            this.getColumnsByColumnSource = function () {
                return columnsByColumnSource;
            };

            this.getAllColumns = function () {
                return columns;
            };

            this.setColumns = function (sourceColumns) {
                columns = sourceColumns;
            };

            this.addColumn = function (column) {
                if (!columns || !columns.length) {
                    columns = [];
                }

                columns.push(column);
            };

            this.updateFilteredColumns = function () {
                var regex = new RegExp(colPanel.searchText.escapeRegExp(), 'gi');
                filteredColumns = [];
                columns.each(function (col) {
                    if (!col.isHidden() && !!col.getName().match(regex)) {
                        filteredColumns.push(col);
                    } else {
                        col.markSelected(false);
                    }
                });
                updateColumnsByColumnSource();
            };

            this.resetFilteredColumns = function () {
                filteredColumns = columns;
                updateColumnsByColumnSource();
            };

            this.hasAnyFilteredColumns = function () {
                return filteredColumns.length > 0;
            };

            function updateColumnsByColumnSource() {
                columnsByColumnSource = filteredColumns.reduce(function(result, column) {
                    var source = column.isFormula() ? 'Formulas' : column.getSourceName();
                    if(!Object.has(result, source)) {
                        result[source] = [];
                        result[source].isExpanded = true; //Subsources should be expanded by default
                    }
                    result[source].push(column);
                    return result;
                }, {});
            }
            updateColumnsByColumnSource();


            this.setName = function (sourceName) {
                name = sourceName;
            };
            this.getName = function () {
                return name || '';
            };

            this.setMetadataInfo = function(info) {
                metadataInfo = info;
            };
            this.getMetadataInfo = function() {
                return metadataInfo;
            };

            this.getId = function () {
                return id;
            };

            this.hasNestedSubsources = function () {
                return false;
            // (Ashish) Turning off, until we get a better UX
            //return Object.keys(columnsByColumnSource).length > 1
            //    && Object.keys(columns).length > blinkConstants.LEFT_PANEL_GROUPING_THRESHOLD;
            };

            this.isAccessible = function () {
                if (!accessibleTablesMap) {
                    return true;
                }
                return !!accessibleTablesMap[id];
            };

            var expanded = false;
            this.expand = function () {
                expanded = true;
            };
            this.collapse = function () {
                expanded = false;
            };
            this.toggleExpansion = function () {
                if (!this.isAccessible()) {
                    return;
                }
                expanded = !expanded;
            };
            this.isExpanded = function () {
                if (!this.isAccessible()) {
                    return false;
                }
                return expanded;
            };

            this.launchRelationshipEditor = function () {
                var params = {};
                params.isAdHocRelationshipBuilder = true;
                params.sageContext = $scope.panelComponent.getDocumentConfig().sageClient.getContext();
                var dataScopeTableIds = sageDataScopeService.getSources();
                var adHocTableIds = params.sageContext.getTables().map(function(table){
                    return table.getId();
                });
                adHocTableIds = adHocTableIds.slice(0, adHocTableIds.length-1);
                params.sourceIds = dataScopeTableIds.concat(adHocTableIds);
                relationshipPopupService.show(id, params);
            };

            function bulkChangeColumnSelection(selected) {
                if (!$scope.panelComponent.documentHasUnderlyingDataAccess()) {
                    return;
                }

                filteredColumns.each(function (col) {
                    col.markSelected(selected);
                });
            }

            this.selectAllColumns = function () {
                bulkChangeColumnSelection(true);
            };
            this.deselectAllColumns = function () {
                bulkChangeColumnSelection(false);
            };
        }

        function ColumnModel(logicalColumn) {
            var _selected = false,
                _inUse = false;

            this.toggleSelectionState = function () {
                this.markSelected(!_selected);
            };

            this.markSelected = function (selectionState) {
                if (shouldPreventQueryChange($scope.panelComponent)) {
                    return;
                }

                if (_selected !== selectionState) {
                    if (selectionState) {
                        colPanel.numSelections++;
                    } else {
                        colPanel.numSelections--;
                    }
                }

                _selected = selectionState;
            };

            this.isSelected = function () {
                return _selected;
            };

            this.markInUse = function (inUse) {
                _inUse = inUse;
                this.setIsUpdating(false);
            };

            this.isInUse = function () {
                return _inUse;
            };

            this.isHidden = function () {
                return logicalColumn.isHidden();
            };

            this.getCssList = function () {
                var cssList = [];
                if (_selected) {
                    cssList.push('bk-selected');
                }

                if (_inUse) {
                    cssList.push('bk-in-use');
                }

                if (_isUpdating) {
                    cssList.push('bk-is-updating');
                }

                return cssList;
            };

            this.getId = function () {
                return logicalColumn.getGuid();
            };

            this.getName = function () {
                return logicalColumn.getName();
            };

            this.getLogicalColumn = function () {
                return logicalColumn;
            };

            this.getSourceName = function () {
                return logicalColumn.getSourceName();
            };

            this.isFormula = function () {
                return logicalColumn.isFormula();
            };

            this.filterUpdatingDoneCallback = function() {
                this.setIsFilterUpdating(false);
            };

            this.addFilter = function () {
                if (shouldPreventQueryChange($scope.panelComponent)){
                    return;
                }

                var onAdditionDone = this.filterUpdatingDoneCallback.bind(this);
                this.setIsFilterUpdating(true);
                if ($scope.columnPanelComponentConfig.openFilterHandler) {
                    $scope.columnPanelComponentConfig.openFilterHandler(logicalColumn).then(
                    onAdditionDone
                );
                } else {
                // TODO(Jasmeet): Migrate all handlers to callback model.
                    $scope.$emit(events.OPEN_FILTER_PANEL, {
                        column: logicalColumn
                    }, onAdditionDone);
                }
            };

            var _isUpdating = false;
            this.setIsUpdating = function (isUpdating) {
                _isUpdating = isUpdating;
            };
            this.isUpdating = function () {
                return _isUpdating;
            };

            var _isFilterUpdating = false;
            this.setIsFilterUpdating = function (isFilterUpdating) {
                _isFilterUpdating = isFilterUpdating;
                colPanel.setIsFilterUpdating(isFilterUpdating);
            };
            this.isFilterUpdating = function () {
                return _isFilterUpdating;
            };
        }

        this.updateSourcesFilteredColumns = function () {
            this.dataSources.each(function (ds) {
                ds.updateFilteredColumns();
            });
        };

        var hidingTimer = null;
        function showUpdatingIndicator(text) {
            if (!$scope.$root.workingIndicator) {
                $scope.$root.workingIndicator = {};
            }

            if (hidingTimer) {
                $timeout.cancel(hidingTimer);
            }

            $scope.$root.workingIndicator.enabled = true;
            $scope.$root.workingIndicator.text = text;
        }

        function hideIndicatorInstantlyInner() {
            Object.values(mapIdToColumns).each(function (column) {
                column.setIsUpdating(false);
            });
            $scope.$root.workingIndicator.enabled = false;
        }

        function hideUpdatingIndicator(instantlyHide) {
            if (!$scope.$root.workingIndicator) {
                $scope.$root.workingIndicator = {};
            }

            if (hidingTimer) {
                $timeout.cancel(hidingTimer);
            }

            if (instantlyHide) {
                hideIndicatorInstantlyInner();
            } else {
            // Usually, the QUERY_PROGRESS_ENDED event handler will hide the indicator. However, as a fallback
            // we call hideUpdatingIndicator() from other places but only hide after 1s
            // (enough to let progress bar animation to finish).
                hidingTimer = $timeout(hideIndicatorInstantlyInner, 1000);
            }
        }

        this.removeColumn = function (column) {
            if (shouldPreventQueryChange($scope.panelComponent)) {
                return;
            }

            column.setIsUpdating(true);

            showUpdatingIndicator('Removing Column');

            var removeColumnTransformRequest =
            sage.QueryTransform.createRemoveColumnTransformation({
                columnGuid: column.getId()
            });

            var defaultAggregation = sageCallosumTranslator.getSageAggrTypeForCallosumAggrType(
            column.getLogicalColumn().getAggregateType()
        );

        // SCAL-10922 Sage doesnt remove the tokens like 'sum revenue' when column id is set
        // even when sum is the default aggregation.
            var removeColumnTransformRequestWithDefaultAggregation =
            sage.QueryTransform.createRemoveColumnTransformation({
                columnGuid: column.getId(),
                aggregation: sage.AggregationType[defaultAggregation]
            });

            var transformations = [removeColumnTransformRequest, removeColumnTransformRequestWithDefaultAggregation];

            $scope.panelComponent.getSageClient().transformTable(transformations)
            .then(removeColumnCallback, removeColumnFailedCallback);
        };

        this.getColumnAdditionNotAllowedReason = function (dictionary) {
            dictionary = dictionary || strings.dataPanel;

            if (shouldPreventQueryChange($scope.panelComponent)){
                return dictionary[blinkConstants.columnAdditionNotAllowedReasonTypes.missingUnderlyingAccess];
            }
            if (this.answerHasUnsupportedTransformQuery()) {
                return dictionary[blinkConstants.columnAdditionNotAllowedReasonTypes.complexQuery];
            }

            return dictionary[blinkConstants.columnAdditionNotAllowedReasonTypes.tooManyColumns];
        };

        this.disallowColumnAddition = function () {
            var disallowColumnAddition = $scope.columnPanelComponentConfig.disallowColumnAddition;

            return disallowColumnAddition || shouldPreventQueryChange($scope.panelComponent);
        };

        this.onColumnDblClick = function(column) {
            var onColumnDblClickOverride = $scope.columnPanelComponentConfig.onColumnDblClick;

            if (!!onColumnDblClickOverride) {
                onColumnDblClickOverride(column.getLogicalColumn());
                return;
            }

            this.addColumns([column]);
            colPanel.deselectAll();
        };

        this.addColumns = function (columnList) {
            if (this.disallowColumnAddition()) {
                return;
            }

            if (!this.canAddColumns(columnList.length)) {
            // Per the UI design team, since this reason for not adding columns at this point is a system limitation,
            // we call it a band-aid and we should show a message to user about why we prevent this action.
                alertService.showAlert({
                    message: strings.alert.leftPanel.COLUMN_ADDITION_NOT_ALLOWED,
                    type: alertConstants.type.PROBLEM,
                    details: {
                        data: this.getColumnAdditionNotAllowedReason(strings.alert.leftPanel)
                    },
                    allowClose: true
                });

                return;
            }

            var applicableColumns = columnList.filter(function (col) {
                return !col.isInUse() && !col.isUpdating();
            });
            if (!!applicableColumns.length) {
                var queryTransforms = applicableColumns.map(function (column) {
                    return sage.QueryTransform.createAddColumnTransformation({
                        columnGuid: column.getId()
                    });
                });

                var colName = 'Columns';
                if (applicableColumns.length === 1) {
                    colName = 'Column';
                }
                applicableColumns.each(function (col) {
                    col.setIsUpdating(true);
                });
                showUpdatingIndicator('Adding {1}'.assign(colName));

                $scope.panelComponent.getSageClient().transformTable(queryTransforms)
                .then(addColumnCallback, addColumnFailedCallback);
            }
        };

        this.addSelectedColumns = function () {
            var selectedColumns = [];
            this.dataSources.each(function (source) {
                source.getFilteredColumns().each(function (col) {
                    if (col.isSelected()) {
                        selectedColumns.push(col);
                    }
                });
            });

            this.addColumns(selectedColumns);
        };

        this.deselectAll = function () {
            this.dataSources.each(function (ds) {
                ds.deselectAllColumns();
            });
            this.numSelections = 0;
        };

        this.deselectAllExcept = function (sourceModel) {
            this.dataSources.each(function (ds) {
                if (ds === sourceModel) {
                    return;
                }
                ds.deselectAllColumns();
            });
        };

        this.hasSelections = function () {
            return this.numSelections > 0;
        };

        this.canAddColumns = function (numColumnsToBeAdded) {
            if (this.answerHasUnsupportedTransformQuery()) {
                return false;
            }

            if (this.numColumnsInUse + numColumnsToBeAdded > env.maxColumnsAllowedInQuery) {
                return false;
            }

            return true;
        };

        function shouldPreventQueryChange(panelComponent){
            if(!panelComponent){
                return false;
            }
            var documentConfig = panelComponent.getDocumentConfig();
            var model = !!documentConfig ? documentConfig.model : null;
            if(!!model) {
                var permission = model.getPermission();
                return permission.isMissingUnderlyingAccess();
            }
            return !panelComponent.documentHasUnderlyingDataAccess();
        }

        this.canShowAddColumns = function () {
            if (shouldPreventQueryChange($scope.panelComponent)) {
                return false;
            }

            if (!this.hasSelections()) {
                return false;
            }

            return this.canAddColumns(this.numSelections);
        };

        this.onColumnClick = function (columnModel, sourceModel) {
            var disallowColumnSelection = $scope.columnPanelComponentConfig.disallowColumnSelection;

            if (disallowColumnSelection) {
                return;
            }

            this.deselectAllExcept(sourceModel);
            columnModel.toggleSelectionState();
        };

        var self = this;
        this.getColumnTooltip = function (column) {
            var logicalColumn = column.getLogicalColumn();
            var valueList = logicalColumn.getUniqueSampleDataList(UNIQUE_SAMPLE_VALUES_TO_SHOW);
            var isSampleValueDisabled = sessionService.isWorksheetSampleValuesDisabled();
            if(!valueList && !isSampleValueDisabled) {
                self.getSampleValues(logicalColumn);
            }
            var html = logicalColumn.getTooltipInformationModel().getTemplate();
            if (!!valueList && valueList.length) {
                html += '<div class="bk-separator"></div>';

                var liTpl = '<div class="bk-tooltip-value">{1}</div>',
                    htmlBody = valueList.map(function (value) {
                        return liTpl.assign(value);
                    }).join('');

                html += '<div class="bk-tooltip"><div class="bk-tooltip-key">{1}</div>{2}</div>'
                    .assign(
                        strings.dataPanel.SAMPLE_VALUES,
                        htmlBody
                    );
            }
            if (isSampleValueDisabled) {
                html += '<div class="bk-separator"></div>';

                var liTpl = '<div class="bk-tooltip-value">{1}</div>',
                    htmlBody = liTpl.assign(strings.dataPanel.SAMPLE_VALUES_UNAVAILABLE);

                html += '<div class="bk-tooltip"><div class="bk-tooltip-key">{1}</div>{2}</div>'
                    .assign(
                        strings.dataPanel.SAMPLE_VALUES,
                        htmlBody
                    );
            }
            return html;
        };

        function updateSampleValuesForTable(logicalTable) {
            sageDataSourceService.getTableSampleValues(
            logicalTable, UNIQUE_SAMPLE_VALUES_TO_SHOW
        ).then(function(data){
            // Note (sunny): setData is costly and we don't want
            // to end up calling for every column of the table
            if (logicalTable.hasNotFetchedData()) {
                logicalTable.setData(data.tableData.data, data.columnIds);
            }
        }, function() {
            sourceIdWithFailedSampleValueCall[logicalTable.getId()] = true;
        });
        }

        this.getSampleValues = function (logicalColumn) {
            if (!$scope.panelComponent.documentHasUnderlyingDataAccess()) {
                return;
            }

            var logicalTable = logicalColumn.getGlobalContext();
        //hasNotFetchedData is important as otherwise there might be no
        //difference in empty data and notFetched data. And we might run
        //into an infinite digest loop. SCAL-14825
            if (logicalTable.hasNotFetchedData()
            && !sourceIdWithFailedSampleValueCall[logicalTable.getId()]) {
                updateSampleValuesForTable(logicalTable);
            }
        };

        var _answerHasUnsupportedTransformQuery = false;
        this.setAnswerHasUnsupportedTransformQuery = function (answerHasUnsupportedTransformQuery) {
            _answerHasUnsupportedTransformQuery = answerHasUnsupportedTransformQuery;
        };
        this.answerHasUnsupportedTransformQuery = function () {
            return _answerHasUnsupportedTransformQuery;
        };

        var debouncedUpdateSourcesFilteredColumns = util.debounce(
            colPanel.updateSourcesFilteredColumns.bind(colPanel),
            COLUMN_SEARCH_DEBOUNCE_THRESHOLD, // Timeout
            $scope, // context for timer
            true // apply changes on execution.
        );

        $scope.onColumnPanelSearchTextChange = function () {
            var text = colPanel.searchText;
            if (!text) {
                if (!colPanel.dataSources) {
                    return;
                }
                colPanel.dataSources.each(function (ds) {
                    ds.resetFilteredColumns();
                });
                return;
            }
            debouncedUpdateSourcesFilteredColumns();
        };

        var mapIdToDataSource = {};
        var mapIdToColumns = {};
        function createSourceModels(sourceIds, unCachedSourceIds) {
            var allSources = sourceIds.concat(unCachedSourceIds);
            if (allSources.length === 0) {
                return;
            }

            allSources.each(function (id) {
                mapIdToDataSource[id] = new SourceModel(id);
            });

            _isLoading = true;
            sageDataSourceService.getSourcesModels(sourceIds, unCachedSourceIds)
                .then(function(sourceIdToModel){
                    util.executeInNextEventLoop(function(){
                        _isLoading = false;
                    });

                    var hasColumns = false;
                    var sourcesIdsToSourcesNames = {};
                    sourceIds.concat(unCachedSourceIds).each(function(id){
                        if (!sourceIdToModel[id]) {
                            _logger.warn('Metadata unavailable for source', id);
                            return;
                        }

                        if (!Object.has(mapIdToDataSource, id)) {
                            //This isnt an error condition, if the model is requested and meanwhile the data sources change
                            // we can return.
                            _logger.debug('Fetched a data source id that is not tracked in the ui list',id);
                            return;
                        }

                        var model = sourceIdToModel[id],
                            columns = (model.getColumns() || []).map(function (logicalCol) {
                                var colModel = new ColumnModel(logicalCol);
                                mapIdToColumns[colModel.getId()] = colModel;
                                return colModel;
                            }),
                            metadataInfo = new util.NameValuePairs();
                        metadataInfo.add('NAME', model._header.name);
                        metadataInfo.add('CREATED', dateUtil.epochToTimeAgoString(model._header.created));
                        metadataInfo.add('UPDATED', dateUtil.epochToTimeAgoString(model._header.modified));
                        if (!!model._header.databaseStripe) {
                            metadataInfo.add('DATABASE', model._header.databaseStripe);
                        }
                        if (!!model._header.schemaStripe) {
                            metadataInfo.add('SCHEMA', model._header.schemaStripe);
                        }
                        if (!!model._header.authorDisplayName) {
                            metadataInfo.add('AUTHOR', model._header.authorDisplayName);
                        }

                        hasColumns = hasColumns || columns.length > 0;
                        columns.sort(function (aCol, bCol) {
                            return util.comparator(aCol.getName(), bCol.getName());
                        });

                        var uiSourceModel = mapIdToDataSource[id];
                        uiSourceModel.setColumns(columns);
                        uiSourceModel.updateFilteredColumns();
                        uiSourceModel.setName(model.getName());
                        uiSourceModel.setMetadataInfo(metadataInfo);
                        sourcesIdsToSourcesNames[id] = model.getName();
                    });
                    sageDataScopeService.updateSourcesName(sourcesIdsToSourcesNames);

                    // Now that names of sources are available, sort them.
                    colPanel.dataSources.sort(function (aSource, bSource) {
                        return util.comparator(aSource.getName(), bSource.getName());
                    });

                    if (hasColumns) {
                        util.registerOneShotEventListener($scope, events.LIST_RENDERED_U, function(event) {
                            _logger.log('Received LIST_RENDERED event for column-panel-controller.');
                            event.stopPropagation();
                            $scope.$emit(events.LEFT_PANEL_COMPONENT_RENDERED_U);
                        });
                    } else {
                        util.executeInNextEventLoop(function() {
                            _logger.log('Faking LIST_RENDERED event for column-panel-controller.');
                            $scope.$emit(events.LEFT_PANEL_COMPONENT_RENDERED_U);
                        });
                    }

                    highlightOutputColumns();
                }, function(error){
                    _logger.error('Error in getting sources metadata', error);
                    util.executeInNextEventLoop(function(){
                        _isLoading = false;
                    });
                });
        }

        function createSourceModelsForFakeColumnMode(outputColumnTokens) {
            var sourceIdToModelMap = {};
            var sourcesIdToSourcesName = {};
            outputColumnTokens.each(function (oToken) {
                var sourceId = oToken.getTableGuid(),
                    sourceName = oToken.getTableName();

                if (!Object.has(sourceIdToModelMap, sourceId)) {
                    sourceIdToModelMap[sourceId] = new SourceModel(sourceId);
                }

                var sourceModel = sourceIdToModelMap[sourceId];
                sourceModel.setName(sourceName);
                var fakeColumn = sage.RecognizedToken.createFakeLogicalColumn(oToken);
                sourceModel.addColumn(
                    new ColumnModel(fakeColumn)
                );
                sourcesIdToSourcesName[sourceId] = sourceName;
            });

            sageDataScopeService.updateSourcesName(sourcesIdToSourcesName);

            colPanel.getColumnTooltip = function () {
                return strings.viewPermissionColName;
            };
            colPanel.dataSources = [];
            Object.values(sourceIdToModelMap).each(function (dataSource) {
                dataSource.updateFilteredColumns();
                colPanel.dataSources.push(dataSource);
            });

            colPanel.dataSources.sort(function (aSource, bSource) {
                return util.comparator(aSource.getName(), bSource.getName());
            });
        }

        function evaluateQuerySupportForTransformations() {
            var sageModel = $scope.panelComponent.getDocumentConfig().sageClient.getSageModel();
            if (!sageModel || !sageModel.queryFragments) {
                return;
            }

            colPanel.setAnswerHasUnsupportedTransformQuery(sageModel.queryFragments.any(function (qf) {
                var phraseType = qf.getPhraseType();
                return phraseType == sage.PhraseType.TOP_BOTTOM_PHRASE ||
                phraseType == sage.PhraseType.GROWTH_PHRASE;
            }));
        }

    /**
     * This function iterates through the phrases in sage bar and discovers output columns.
     * Output columns are those columns that appear in the table viz. That usually happens for following cases:
     * - measure/attribute (by itself)
     * - a by phrase
     * - a for each phrase
     * - a sort by phrase
     * - top/bottom phrase
     * - growth phrase
     *
     * WE DO NOT WANT 'measure/attribute with aggregation' because if there is 'revenue count color', we want
     * to highlight revenue as output column and not color as output column (because 'count color' is the output
     * column).
     */
        function highlightOutputColumns() {
            colPanel.numColumnsInUse = 0;
            Object.values(mapIdToColumns).each(function (column) {
                column.markInUse(false);
            });

            var answerModel = $scope.panelComponent.getDocumentConfig().model;

            if (!answerModel) {
                return;
            }

            var tableModel = Object.values(answerModel.getCurrentAnswerSheet().getVisualizationsOfType('TABLE'));

            if (!tableModel || !tableModel.length) {
                _logger.warn('No table found in the answerModel', answerModel.getJson());
                return;
            }

            var sageModel = $scope.panelComponent.getDocumentConfig().sageClient.getSageModel();
            if (!sageModel || !sageModel.queryFragments) {
                return;
            }

            if (colPanel.answerHasUnsupportedTransformQuery()) {
                return;
            }

            var includedColumnGuids = [];
            sageModel.queryFragments.filter(function (qf) {
                return [
                    sage.PhraseType.FILTER_PHRASE,
                    sage.PhraseType.HAVING_PHRASE
                ].none(qf.getPhraseType());
            }).each(function (qf) {
                var tokens = qf.getFragmentTokens().filter(function (token) {
                    return !token.isEmpty();
                });
                includedColumnGuids = includedColumnGuids.concat(tokens.filter(function (t) {
                    return t.isDataToken();
                }).map('getGuid'));
            });

            includedColumnGuids = includedColumnGuids.unique();

            tableModel[0].getVizColumns().each(function (vizCol) {
                var isAggregatedWithDefaultAggregation =
                vizCol.getBaseAggregationType() === vizCol.getEffectiveAggregateType();
            // NOTE: isAggregation applied is used here to short circuit attributes.
                if (vizCol.isAggregationApplied() && !isAggregatedWithDefaultAggregation) {
                    return;
                }

                var baseColGuid = vizCol.getBaseLogicalColumnGuid();
                if (includedColumnGuids.none(baseColGuid)) {
                    return;
                }
                if (Object.has(mapIdToColumns, baseColGuid)) {
                    var mappedCol = mapIdToColumns[baseColGuid];
                    mappedCol.markInUse(true);
                    colPanel.numColumnsInUse++;
                }
            });
        }

        function onDataScopeChange(sourceIds) {
            if (!sourceIds || !$scope.panelComponent.documentHasUnderlyingDataAccess()) {
                return;
            }
            var adHocTableIds = [];
            /* global flags */
            var isQoQEnabled = flags.getValue('enableQoQ');
            if (isQoQEnabled) {
                var sageClient = $scope.panelComponent.getSageClient();
                var queryIndex = sageClient.getCurrentIndex();
                if (queryIndex > 0) {
                    var sageContext = sageClient.getContext();
                    var tables = sageContext.getTables();
                    var sourceTables = tables.slice(0, queryIndex);
                    adHocTableIds = sourceTables.map(function(table){
                        return table.getId();
                    });
                }
            }

            var mappedIds = Object.keys(mapIdToDataSource);

            var addedIds = sourceIds.subtract(mappedIds);
            var removedIds = mappedIds.subtract(sourceIds);

            removedIds.each(function (id) {
                delete mapIdToDataSource[id];
            });

            createSourceModels(addedIds, adHocTableIds);
            colPanel.dataSources = Object.values(mapIdToDataSource);
        }

        onDataScopeChange(sageDataScopeService.getSources());
        var dataScopeChangeWatchDeregister = sageDataScopeService.subscribeToSourcesChanged(
            onDataScopeChange
        );

        $scope.$watch(function () {
            return $scope.panelComponent.getDocumentConfig().model;
        }, function (model) {
            var updatedSources = !!model ? model.getAccessibleTables() : null;
            updateAccessibleTables(updatedSources);

            var permission = !!model ? model.getPermission() : null;
            var isMissingUnderlyingAccess = !!permission ? permission.isMissingUnderlyingAccess() : false;
            if (isMissingUnderlyingAccess || !$scope.panelComponent.documentHasUnderlyingDataAccess()) {
                if (!model) {
                    return;
                }
                var recognizedTokens = model.getRecognizedTokens();

                if (!recognizedTokens || !recognizedTokens.length) {
                    _logger.warn('Data sources opened in read only mode with model with no recognized tokens');
                    return;
                }

                createSourceModelsForFakeColumnMode(recognizedTokens.filter(function (rt) {
                    return rt.isDataToken();
                }).unique(function (rt) {
                    return rt.getGuid();
                }));
            }

            var config = $scope.panelComponent.getDocumentConfig();
            var sageClient = config.sageClient;
            var showCheckmarks = $scope.columnPanelComponentConfig.showCheckMarks;

            if (showCheckmarks) {
                var queryFragments = sageClient.getSageModel().queryFragments;
                if (!!queryFragments) {
                    evaluateQuerySupportForTransformations();
                    highlightOutputColumns();
                    hideUpdatingIndicator();
                }
            }
        });

        function updateAccessibleTables(accessibleTables) {
            if (!accessibleTables || accessibleTables.length === 0) {
                accessibleTablesMap = null;
            } else {
                accessibleTablesMap = util.mapArrayToBooleanHash(accessibleTables);
            }
        }

        function handleSageFailure(errorMessage, errorDetail) {
            alertService.showAlert({
                message: errorMessage,
                type: alertConstants.type.PROBLEM,
                details: errorDetail,
                allowClose: true
            });
            highlightOutputColumns();
            hideUpdatingIndicator();
        }

        function addColumnCallback(errorInfo) {
            var validErrorCodes = [
                sage.ErrorCode.SUCCESS,
                sage.ErrorCode.AMBIGUOUS_TOKEN,
                sage.ErrorCode.JOIN_PATH_AMBIGUITY
            ];

            if (validErrorCodes.none(errorInfo.errorCode)) {
                if (errorInfo.errorCode === sage.ErrorCode.NO_MATCH ||
                errorInfo.errorCode === sage.ErrorCode.NOT_FOUND) {
                    alertService.showFailureAlert(messageService.blinkGeneratedErrors.SAGE_INDEXING);
                } else {
                    handleSageFailure('Failed to add column.', errorInfo.errorMessage);
                }
            }

            if (sage.ErrorCode.SUCCESS == errorInfo.errorCode) {
                return;
            }
        // Should only happen for Join Path error, should hide loading indicator here.
        // Sage bar should take care of ambiguity resolution.
            highlightOutputColumns();
            hideUpdatingIndicator();
        }

        function addColumnFailedCallback() {
            handleSageFailure('Failed to add column.');
        }

        function removeColumnCallback(errorInfo) {
            var validErrorCodes = [
                sage.ErrorCode.SUCCESS,
                sage.ErrorCode.AMBIGUOUS_TOKEN,
                sage.ErrorCode.JOIN_PATH_AMBIGUITY
            ];

            if (validErrorCodes.none(errorInfo.errorCode)) {
                handleSageFailure('Failed to remove column.', errorInfo.errorMessage);
            }
        }

        function removeColumnFailedCallback() {
            handleSageFailure('Failed to remove column.');
        }

        $scope.isInQueryOnQueryMode = function () {
            var isQoQEnabled = flags.getValue('enableQoQ');
            if (isQoQEnabled) {
                var sageClient = $scope.panelComponent.getDocumentConfig().sageClient;
                var sageContext = sageClient.getContext();
                var tables = sageContext.getTables();
                if (tables.length > 1) {
                    return true;
                }
            }
            return false;
        };

        $scope.showFormulas = $scope.columnPanelComponentConfig.displayAnswerFormula;

        $scope.addColumnSuccessHandler = addColumnCallback;
        $scope.$on("$destroy", function() {
            dataScopeChangeWatchDeregister();
        });
    }]);
