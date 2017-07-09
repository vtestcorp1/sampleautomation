/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Controller for data explorer directive.
 *
 * The controller fetches a list of all the tables on initialization.
 * It keeps track of the selected table index in the list and reacts to any change to the index (that can happen when
 * user clicks on another table name in the list).
 * On selecting a table, the visualization model corresponding to the table is fetched from the backend.
 *
 */

'use strict';
addBooleanFlag('enableAnalyzeMode', 'Whether to show analyze mode for objects like worksheet.', true);

/* eslint max-params: 1 */
blink.app.controller('DataExplorerController', ['$scope',
    '$q',
    '$rootScope',
    'alertService',
    'AnalyzerComponent',
    'A3TableAnalysisComponent',
    'blinkConstants',
    'strings',
    'CancelablePromise',
    'columnStatisticsService',
    'dateUtil',
    'dependencyService',
    'documentService',
    'events',
    'jsonConstants',
    'Logger',
    'metadataPermissionService',
    'metadataService',
    'metadataUtil',
    'messageService',
    'navService',
    'perfMeter',
    'RowLevelSecurityController',
    'safeApply',
    'sageDataSourceService',
    'session',
    'sessionService',
    'tableUtil',
    'UserAction',
    'util',
    'worksheetUtil',
    function ($scope,
          $q,
          $rootScope,
          alertService,
          AnalyzerComponent,
          A3TableAnalysisComponent,
          blinkConstants,
          strings,
          CancelablePromise,
          columnStatisticsService,
          dateUtil,
          dependencyService,
          documentService,
          events,
          jsonConstants,
          Logger,
          metadataPermissionService,
          metadataService,
          metadataUtil,
          messageService,
          navService,
          perfMeter,
          RowLevelSecurityController,
          safeApply,
          sageDataSourceService,
          session,
          sessionService,
          tableUtil,
          UserAction,
          util,
          worksheetUtil) {

        var _logger = Logger.create('data-explorer-controller'),
            DATA_EXPLORER_MAX_ROWS = 1000;

        var logicalModel;


        var config = session.getBackendConfig(),
            queryOnQueryEnabled = !!(config && config.enableDbView);

        var viewModes = blinkConstants.DataExplorerViewModes;

        var viewMode = viewModes.PROP_VIEW;
        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;
        $scope.isEditable = false;
        $scope.saveInactive = true;
        $scope.permissionsWithDependents = null;

    /* global flags */
        $scope.enableTableLinking = queryOnQueryEnabled;
        $scope.showAnalyzeMode = flags.getValue('enableAnalyzeMode');
        $scope.showA3Mode = sessionService.isA3Enabled();

    // True if the data is being loaded.
        var isSaving = false;
        var reloadData = false;
        var areHeadersChanged = false;
        var areColumnsChanged = false;

        function enableSave() {
            $scope.saveInactive = false;
        }

        function onColumnsEdit() {
            areColumnsChanged = true;
            enableSave();
            tableUtil.updateProperties.apply(null, arguments);
        }

        function onColumnNamesEdit() {
            areColumnsChanged = true;
            enableSave();
        }

        function onHeadersEdit(name, description) {
            $scope.tableName = name;
            $scope.tableDescription = description;
            areHeadersChanged = true;
            enableSave();
        }

        function doesSupportProfile() {
            if(logicalModel.getMetadataSubType() === jsonConstants.metadataType.subType.SYSTEM_TABLE ||
                logicalModel.getMetadataSubType() === jsonConstants.metadataType.subType.USER_DEFINED ||
            logicalModel.getMetadataSubType() === jsonConstants.metadataType.subType.IMPORTED_DATA) {
                return true;
            }
        }

        $scope.onHeadersEdit = onHeadersEdit;
        $scope.onColumnNamesEdit = onColumnNamesEdit;

        $scope.tableModel = null;
        $scope.tableConfig = {
            editableColumnHeaders: false,
            onEditCell: enableSave,
            slickGridOptions: {
                enableColumnReorder: false,
                fullWidthRows: true,
                editable: true,
                autoEdit: true,
                frozenColumn: 0,
                editCommandHandler: onColumnsEdit
            },
            maxRows: DATA_EXPLORER_MAX_ROWS,
            showHiddenColumns: false
        };


        $scope.explorer = {};

        $scope.noTableToShow = function() {
            if($scope.isInProfileMode() && !doesSupportProfile()) {
                return true;
            }
        };

        $scope.getNoTableReason = function() {
            if($scope.isInProfileMode() && !doesSupportProfile()) {
                return strings.metadataExplorer.profileDisabledWS;
            }
        };

        $scope.isInDataMode = function () {
            return viewMode === viewModes.DATA_VIEW;
        };
        $scope.isInPropMode = function () {
            return viewMode === viewModes.PROP_VIEW;
        };
        $scope.isInRelationshipMode = function() {
            return viewMode === viewModes.RELATIONSHIP_VIEW;
        };
        $scope.isInDependentsMode = function() {
            return viewMode === viewModes.DEPENDENTS_VIEW;
        };
        $scope.isInSecurityMode = function() {
            return viewMode === viewModes.SECURITY_VIEW;
        };
        $scope.isInProfileMode = function () {
            return viewMode === viewModes.PROFILE_VIEW;
        };
        $scope.isInAnalyzeMode = function () {
            return viewMode === viewModes.ANALYZE_VIEW;
        };
        $scope.isInA3Mode = function () {
            return viewMode === viewModes.A3_VIEW;
        };
        $scope.areHeaderBtnsInvisible = function () {
            return $scope.isInRelationshipMode()
                || $scope.isInSecurityMode()
                || $scope.isInAnalyzeMode();
        };
        $scope.setViewMode = function(newViewMode) {
            viewMode = newViewMode;
            updateView();
        };
        $scope.isSaveButtonEnabled = function () {
            return !$scope.areHeaderBtnsInvisible() && $scope.isEditable;
        };

        $scope.setPropMode = $scope.setViewMode.bind(this, viewModes.PROP_VIEW);
        $scope.setDataMode = $scope.setViewMode.bind(this, viewModes.DATA_VIEW);
        $scope.setProfileMode = $scope.setViewMode.bind(this, viewModes.PROFILE_VIEW);
        $scope.setRelationshipMode = $scope.setViewMode.bind(this, viewModes.RELATIONSHIP_VIEW);
        $scope.setDependentsMode = $scope.setViewMode.bind(this, viewModes.DEPENDENTS_VIEW);
        $scope.setSecurityMode = $scope.setViewMode.bind(this, viewModes.SECURITY_VIEW);
        $scope.needsUnderlyingAccessMessage = strings.metadataExplorer.needsUnderlyingAccess;
        if(!!$scope.showAnalyzeMode) {
            $scope.setAnalyzeMode = $scope.setViewMode.bind(this, viewModes.ANALYZE_VIEW);
        }
        $scope.setA3Mode = $scope.setViewMode.bind(this, viewModes.A3_VIEW);

        function updateView() {
        // Setting the editable state according to viewMode and permissions.
            setIsEditable();

            // Even though, we may not be in analyze mode, fetch suggestions once per table
            if(!!$scope.showAnalyzeMode && !!logicalModel) {
                // Create a new instance of analyzer control if the table name has changed to
                // show its corresponding suggestions count.
                if (!$scope.analyzeCtrl || $scope.analyzeCtrl.id !== logicalModel.getId()) {
                    $scope.analyzeCtrl = new AnalyzerComponent(
                        $scope.onSaveFromAnalyzer,
                        logicalModel
                    );
                    $scope.analyzeCtrl.fetchRemarks();
                }
            }

            // If we are in analyze mode, remove the table UI
            if($scope.isInAnalyzeMode()) {
                $scope.removeTableUI();
                return;
            }

            if(!!$scope.showA3Mode && !!$scope.selectedTableId && !!logicalModel) {
                // Create a new instance of A3 Table Analysis control.
                $scope.a3Ctrl = new A3TableAnalysisComponent(
                    $scope.selectedTableId,
                    $scope.tableName,
                    isWorksheetType(logicalModel.getMetadataSubType()),
                    logicalModel.getColumns()
                );
            }

            if ($scope.isInA3Mode()) {
                $scope.removeTableUI();
                return;
            }

            if ($scope.isInRelationshipMode()) {
                $scope.removeTableUI();
                return;
            }

            if($scope.isInSecurityMode()) {
                $scope.removeTableUI();
                $scope.rlsCtrl = new RowLevelSecurityController(
                logicalModel.getId(),
                logicalModel.getFilters(),
                logicalModel.setFilters.bind(logicalModel)
            );
                return;
            }

            if(!logicalModel) {
                updateSlickGrid();
                return;
            }

            var fetchPromise;

            if($scope.isInDataMode() && (logicalModel.getData().length === 0 || reloadData)) {
                fetchPromise = fetchSampleDataForLogicalModel(logicalModel).
                then(updateSlickGrid, updateSlickGrid);
            } else if($scope.isInProfileMode()) {
                if(doesSupportProfile()) {
                    fetchPromise = fetchColumnStatisticsModel(logicalModel).
                    then(updateSlickGrid, updateSlickGrid);
                } else {
                    $scope.removeTableUI();
                    return;
                }
            } else if ($scope.isInDependentsMode()) {
                fetchPromise = fetchDependentsForLogicalModel(logicalModel).
                then(updateSlickGrid, updateSlickGrid);
            } else {
                updateSlickGrid();
            }

            if (fetchPromise) {
                $scope.isFetchingData = true;
                fetchPromise.finally(function() {
                    $scope.isFetchingData = false;
                })
            }

        }

        function updateSlickGrid() {
            updateTableModel();
            $scope.addTableUI();
        }

        function fetchMetadata() {
            var userAction = new UserAction(UserAction.FETCH_TABLE_DETAILS);
            return worksheetUtil.getLogicalTableModel(
            $scope.selectedTableId,
                {
                    showHidden:true
                }).
            then(function(response) {
                var model = response.data;
                if(model.isCorrupted()) {
                    var customData = {
                        incompleteDetails: model.getCorruptionDetails(),
                        getDisplayNameForMetadataTypeName: metadataUtil.getDisplayNameForMetadataTypeName
                    };
                    var customUrl = 'src/common/alert/templates/missing-document-alert-template.html';
                    alertService.showUserActionFailureAlert(userAction, response, {
                        substitutions: [model.getName()],
                        customData: customData,
                        customUrl: customUrl,
                        code: messageService.blinkGeneratedErrors.INCOMPLETE_DOCUMENT
                    });
                }
                return model;
            });
        }

        function getDependentTypeName(type, subtype) {
            var dependentViewNames = strings.DataExplorerVisibleDependents;
            if(!subtype) {
                return dependentViewNames[type];
            } else {
                return dependentViewNames[type] && dependentViewNames[type][subtype];
            }
        }

        function fetchDependentsForLogicalModel(logicalModel) {
        // Fetch dependents for current table
            var userAction = new UserAction(UserAction.FETCH_COLUMN_DEPENDENTS);
            return dependencyService.getColumnDependents(logicalModel.getColumns().map(function (col) {
                return col.getGuid();
            })).then(function (response) {
                var data = response.data;
            // Convert obtained result from map of { metadata_type -> header } to
            // list of headers
                var dependents = Object.keys(data).reduce(function (results, type) {
                    data[type].forEach(function (dependent) {
                        if (dependent.isHidden || dependent.isDeleted) {
                            return;
                        }
                    // If a dependent has type, its actually a subtype of the type it
                    // resides as the value of.
                        dependent.subtype = dependent.type;
                        dependent.type = type;
                        dependent.typeName = getDependentTypeName(dependent.type, dependent.subtype);
                        if(!dependent.typeName) {
                            return;
                        }
                        dependent.dependencyName = logicalModel.getColumns().find(function (col) {
                            return col.getGuid() === dependent.dependency;
                        }).getName();
                        results.push(dependent);
                    });
                    return results;
                }, []);
                logicalModel.setDependents(dependents);
                return logicalModel;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

        function fetchSampleDataForLogicalModel(logicalModel) {
            reloadData = false;
            return worksheetUtil.updateLogicalTableData(logicalModel, {
                showHidden: true
            });
        }

        function fetchColumnStatisticsModel(logicalModel) {
            var userAction = new UserAction(UserAction.FETCH_COLUMN_STATISTICS);
            var columnIds = _.map(logicalModel.getColumns(), function(column) {
                return column.getGuid();
            });

            return columnStatisticsService.getColumnStatistics(columnIds)
            .then(function(response){
                var dataRows = response.data;
                logicalModel.setColumnStatistics(dataRows);
                return logicalModel;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });
        }

    /**
     * Fetches the table details for the selected table, according to viewMode
     * @private
     */
        function fetchSelectedTableDetails() {
            if (!$scope.selectedTableId) {
                _logger.warn('Tried to fetch table data with invalid selected table');
                return;
            }

            var userAction = new UserAction(UserAction.FETCH_TABLE_PERMISSIONS);
            var permissionsPromise = metadataPermissionService.getEffectivePermissions(
                [{id: $scope.selectedTableId}],
                jsonConstants.metadataType.LOGICAL_TABLE,
                true
            ).then(function(response) {
                $scope.permissionsWithDependents = response.data;
            }, function(response) {
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            });

            var detailsPromise = fetchMetadata().
            then(function( model) {
                logicalModel = model;
            }, function (error) {
                if (error !== strings.IGNORED_API_CALL_ERROR) {
                    logicalModel = null;
                }
            });
            return new CancelablePromise(
            util.getAggregatedPromise([
                permissionsPromise,
                detailsPromise
            ])
        );
        }

        function updateTableModel() {
            if(!!logicalModel) {
                var slickGridParam = logicalModel.toSlickgridTable({
                    getTooltip: function (logicalCol) {
                        return 'Column type: ' + tableUtil.getDisplayColumnDataType(logicalCol.getDataType());
                    },
                    onColumnSelect: $scope.onColumnSelect,
                    viewMode: viewMode,
                    isReadOnly: !$scope.isEditable
                });
                $scope.tableModel = slickGridParam.model;
            } else {
                $scope.tableModel = null;
            }

            // in data view-mode, we do not freeze any columns
            // in props mode, we freeze description and name
            // in other modes, we freeze the first column
            if (viewMode === blinkConstants.DataExplorerViewModes.DATA_VIEW) {
                $scope.tableConfig.slickGridOptions.frozenColumn = null;
            } else if(viewMode === blinkConstants.DataExplorerViewModes.PROP_VIEW){
                $scope.tableConfig.slickGridOptions.frozenColumn = 0;
            } else {
                $scope.tableConfig.slickGridOptions.frozenColumn = 0;
            }
            $scope.tableConfig.slickGridOptions.rowTooltips = true;

        }

        function setIsEditable() {
            $scope.buttonTooltip = '';
            if($scope.isInDataMode()
                || $scope.isInDependentsMode()
                || $scope.isInProfileMode()
                || $scope.isInAnalyzeMode()
            ) {
                $scope.isEditable = false;
            } else {
                if (!!$scope.permissionsWithDependents) {
                    $scope.isEditable = metadataPermissionService.isEditable(
                    [{id: logicalModel.getId()}],
                    jsonConstants.metadataType.LOGICAL_TABLE,
                    logicalModel.getMetadataSubType(),
                    $scope.permissionsWithDependents
                );
                    $scope.needsUnderlyingAccess =
                    metadataPermissionService.isEditableWithUnderlyingAccess(
                        logicalModel.getId(),
                        $scope.permissionsWithDependents
                    );
                    $scope.underlyingLabelClose = false;

                    var hasAccessToSourcesButNeedsDataManagementPrivileges =
                        !$scope.needsUnderlyingAccess && !sessionService.hasDataManagementPrivileges();

                    if (hasAccessToSourcesButNeedsDataManagementPrivileges) {
                        $scope.buttonTooltip = strings.metadataExplorer.needsDataManagementPrivileges;
                    }

                } else {
                    $scope.isEditable = false;
                }
            }
            $scope.tableConfig.slickGridOptions.editable = $scope.isEditable;
        }

    /**
     *
     * On click handler for the table in the list.
     * @param {tableId} table ID representing the clicked table
     */
        $scope.onTableNameClick = function (tableId) {
            $scope.selectedTableId = tableId;
        };

        function setSelectedTableProperties() {
            $scope.tableName = logicalModel.getName();
            $scope.tableDescription = logicalModel.getDescription();
            $scope.tableDisplayType = strings.metadataExplorer.types[logicalModel.getMetadataSubType()];
        }

    // holds the previous update promise for cancellation
        var previousUpdatePromise;
    //  watch to trigger on selected-table being changed from outside.
        $scope.$watch('selectedTableId', function(newVal, oldVal) {
            if(!!previousUpdatePromise) {
            // cancelling previous update as its now stale.
                previousUpdatePromise.cancel();
            }
            if(!newVal) {
                return;
            }
            perfMeter.markGenericMetricReady('worksheetView');
            previousUpdatePromise = fetchSelectedTableDetails()
            .then(setSelectedTableProperties)
            .then(updateView, updateView).then(function () {
                perfMeter.reportGenericMetricFinished('worksheetView');
            });
        });

        $scope.isSystemTable = function () {
            return !!logicalModel &&
            logicalModel.getMetadataSubType() === jsonConstants.metadataType.subType.SYSTEM_TABLE;
        };

        $scope.isOfLoadableType = function() {
            return !!logicalModel && (
            logicalModel.getMetadataSubType() === jsonConstants.metadataType.subType.IMPORTED_DATA ||
            logicalModel.getMetadataSubType() === jsonConstants.metadataType.subType.SYSTEM_TABLE);
        };

        $scope.onEditClick = function () {
            perfMeter.markGenericMetricReady('worksheetEdit');
            var metadataSubType = logicalModel.getMetadataSubType();
            var id = logicalModel.getId();
            switch(metadataSubType) {
                case jsonConstants.metadataType.subType.WORKSHEET:
                    navService.goToWorksheet(id);
                    break;
                case jsonConstants.metadataType.subType.IMPORTED_DATA:
                case jsonConstants.metadataType.subType.SYSTEM_TABLE:
                    navService.goToImportData(id);
                    break;
                case jsonConstants.metadataType.subType.AGGR_WORKSHEET:
                    navService.goToAggregatedWS(id);
                    break;
                default:
                    _logger.warn("Editing not supported for this type ", metadataSubType);
            }

            if(angular.isFunction($scope.onNavigateAway)) {
                $scope.onNavigateAway();
            }
        };

        function isWorksheetType(type) {
            return type === jsonConstants.metadataType.subType.WORKSHEET ||
                type === jsonConstants.metadataType.subType.AGGR_WORKSHEET;
        }

        $scope.isRelationshipEditingUnrestricted =  function () {
            var isMyTable = !!logicalModel
            && logicalModel.getAuthorId() === sessionService.getUserGuid();
            return sessionService.canUserManageData()
            || isMyTable;
        };

        $scope.canEditRowSecurity = function () {
            return sessionService.hasAdminPrivileges()
            && !isWorksheetType(logicalModel.getMetadataSubType());
        };

        $scope.getRLSDisabledReason = function () {
            if(!sessionService.hasAdminPrivileges()) {
                return strings.metadataExplorer.rlsNeedsAdmin;
            }

            if(isWorksheetType(logicalModel.getMetadataSubType())) {
                return strings.metadataExplorer.rlsDisabledWS;
            }
        };

        $scope.isSaving = function() {
            return isSaving;
        };

        function updateColumns() {
            var err = logicalModel.getValidationError();
            if(!!err) {
                return $q.reject({errorMessage: err});
            }

            if (!areColumnsChanged) {
                return $q.resolve({});
            }

            return metadataService.bulkUpdate(
            jsonConstants.metadataType.LOGICAL_COLUMN,
            logicalModel.getMetadataJson().columns
        );
        }

        function updateHeaders() {
            if (!areHeadersChanged) {
                return $q.resolve({});
            }
            var err = logicalModel.getValidationError();
            if(!!err) {
                return $q.reject({errorMessage: err});
            }
            logicalModel.setName($scope.tableName);
            logicalModel.setDescription($scope.tableDescription);
            var contents = [logicalModel.getHeaderJson()];
            return metadataService.updateHeaders(
            logicalModel.getMetadataType(),
            contents
        );
        }

        function updateModelCache() {
        // Update the sage cache with the changed model.
            sageDataSourceService.updateModelCache(logicalModel);
            reloadData = true;
        }

        function refreshAnalyzer() {
            if (!!$scope.analyzeCtrl) {
                $scope.analyzeCtrl.isSaving = false;
                $scope.analyzeCtrl.fetchRemarks();
            }
        }

        function onSaveFinished() {
            updateModelCache();
            refreshAnalyzer();
            $scope.onSave({
                name: logicalModel.getName(),
                description: logicalModel.getDescription()
            });
            isSaving = false;
        }

        function showSuccessAlert(response) {
            var substitutions = [logicalModel.getName()];
            $scope.saveInactive = true;
            var userAction = new UserAction(UserAction.SAVE_TABLE_MODEL);
            alertService.showUserActionSuccessAlert(userAction, response, {substitutions: substitutions});
        }

        function showFailureAlert(response) {
        //TODO(Ashish): Messaging framework ?
            if(response.errorMessage) {
                alertService.showAlert({
                    message: response.errorMessage,
                    type: alertService.alertConstants.type.ERROR
                });
                return;
            }
            var substitutions = [logicalModel.getName()];
            var userAction = new UserAction(UserAction.SAVE_TABLE_MODEL);
            alertService.showUserActionFailureAlert(userAction, response, {substitutions: substitutions});
            return $q.reject(response.data);
        }

        $scope.onSaveFromAnalyzer = function (tableName) {
            if (tableName.length !== 0) {
                $scope.tableName = tableName;
                areHeadersChanged = true;
            }
            areColumnsChanged = true;
            enableSave();
            $scope.onSaveClick();
        };

        $scope.onSaveClick = function () {
            isSaving = true;
            return util
            .getAggregatedPromise([updateHeaders(), updateColumns()])
            .then(showSuccessAlert, showFailureAlert)
            .finally(onSaveFinished);
        };

        $scope.getTooltip = function (table) {
            var item = table.values;
            var tooltipData = new util.NameValuePairs();

            tooltipData.add('NAME', item.name);
            tooltipData.add('AUTHOR', item.authorDisplayName);
            tooltipData.add('CREATED', dateUtil.epochToTimeAgoString(item.created));
            tooltipData.add('UPDATED', dateUtil.epochToTimeAgoString(item.modified));

            if (!!item.databaseStripe) {
                tooltipData.add('DATABASE', item.databaseStripe);
            }
            if (!!item.schemaStripe) {
                tooltipData.add('SCHEMA', item.schemaStripe);
            }

            return tooltipData.getTemplate();
        };

    /**
     *
     * Returns true if the table data/model fetch corresponding to the idx-th table in the list is in progress.
     *
     * @param {number} table
     * @return {boolean}
     */
        $scope.isLoading = function (table) {
            if (!!$scope.isFetchingData) {
                return true;
            }

            var isLoading = !!logicalModel
            && (!logicalModel || logicalModel.getId() !== $scope.selectedTableId);

            if (!table) {
                return isLoading;
            }
            return isLoading && table.values.id === $scope.selectedTableId;
        };

    /**
     * On init, fetch the list of tables to show
     */
        $scope.init =  function () {
            if(!!$scope.mode) {
                if(Object.has(viewModes, $scope.mode) && !!$scope.selectedTableId) {
                    fetchSelectedTableDetails().
                    then($scope.setViewMode.bind(null, $scope.mode)).
                    then(function() {
                        $scope.$watch('mode', $scope.setViewMode);
                    });

                } else {
                    _logger.warn('Unsupported view mode falling back to default');
                }
            }
        };
    }]);
