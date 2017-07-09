/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview A service used to encapsulate all sage related calls to build a worksheet without a sage bar.
 */

'use strict';

/* eslint max-params: 1 */
blink.app.factory('worksheetBuilder', ['$q',
    '$rootScope',
    'alertConstants',
    'alertService',
    'autoCompleteObjectUtil',
    'autoCompleteService',
    'blinkAutoCompleteService',
    'blinkConstants',
    'strings',
    'dependencyDialogService',
    'dependencyService',
    'dialog',
    'events',
    'joinWorkflowLauncher',
    'joinPathRegistry',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'messageService',
    'safeApply',
    'UserAction',
    'util',
    'worksheetService',
    function ($q,
              $rootScope,
              alertConstants,
              alertService,
              autoCompleteObjectUtil,
              autoCompleteService,
              blinkAutoCompleteService,
              blinkConstants,
              strings,
              dependencyDialogService,
              dependencyService,
              dialog,
              events,
              joinWorkflowLauncher,
              joinPathRegistry,
              jsonConstants,
              loadingIndicator,
              Logger,
              messageService,
              safeApply,
              UserAction,
              util,
              worksheetService) {
        var _logger = Logger.create('worksheet-builder');

        var outputGuidToNameMap = {},
    // this map of formulaIds to their names
    // is different from `outputGuidToNameMap` which
    // is a map of UI overrides of column names. this is used
    // to restore names of formula columns between before and
    // and after callosum call, same goes for the columnTypesMap
            formulaIdToName = {},
            formulaIdToColumnTypesMap = {};

        var userActionTypes = {
            ADD_COLUMNS: 0,
            EDIT_JOIN_PATH: 1,
            DELETE_COLUMNS: 2,
            ADD_PREFIX: 3,
            DELETE_ALL_BROKEN_COLUMNS: 4,
            UPDATE_WORKSHEET: 5,
            REMOVE_FORMULA: 6
        };

        function getUserActionTypeText(userActionType) {
            switch (userActionType) {
                case userActionTypes.ADD_COLUMNS:
                    return strings.alert.worksheetBuilderFailedUserActions.userActions.addColumn;
                case userActionTypes.EDIT_JOIN_PATH:
                    return strings.alert.worksheetBuilderFailedUserActions.userActions.editJoinPath;
                case userActionTypes.DELETE_COLUMNS:
                    return strings.alert.worksheetBuilderFailedUserActions.userActions.deleteColumn;
                case userActionTypes.ADD_PREFIX:
                    return strings.alert.worksheetBuilderFailedUserActions.userActions.addPrefix;
            }

            return '';
        }

        function getJoinWorkflowType(userActionType) {
            switch (userActionType) {
                case userActionTypes.ADD_COLUMNS:
                    return blinkConstants.joinWorkflow.types.DEFINE_MAPPING;
                case userActionTypes.EDIT_JOIN_PATH:
                case userActionTypes.DELETE_ALL_BROKEN_COLUMNS:
                    return blinkConstants.joinWorkflow.types.EDIT_MAPPING;
                default:
                    return blinkConstants.joinWorkflow.types.DEFINE_MAPPING;
            }
        }

        function matchColumnsToTokensByGuid(columns, tokens, callback) {
            var tokenIdToToken = util.mapArrayToHash(tokens, function(token){
                return token.getGuid();
            });

            columns.each(function(column, index){
                var colId = column.getGuid(),
                    token = tokenIdToToken[colId] || null;
                callback(column, token, index);
            });
        }

        function updateClientStateFromCallosumResponse(worksheetModel) {
            if (!worksheetModel) {
                return;
            }
            var columns = worksheetModel.getColumns() || [];
            columns.each(function (col) {
                var outputGuid = col.getSageOutputColumnId();

                if (col.isFormula()) {
                    var columnTypes = formulaIdToColumnTypesMap[col.getFormulaId()];
                    if (!!columnTypes) {
                        col.setType(columnTypes.type);
                        col.setDataType(columnTypes.dataType);
                        col.setAggregateType(columnTypes.aggrType);
                    }
                }

                var columnName = outputGuidToNameMap[col.getSageOutputColumnId()];

            // UI overridden names take precedence over names derived from
            // corresponding sage tokens (if any)
                if (!!columnName) {
                    col.setName(columnName);
                } else {
                    if (col.isFormula()) {
                        var formulaId = col.getFormulaId();
                        if (formulaIdToName[formulaId]) {
                            col.setName(formulaIdToName[formulaId]);
                        }
                    }

                    outputGuidToNameMap[outputGuid] = col.getName();
                }
            });
        }

        function maybeLaunchAddPrefixDialog(oldModel, newModel) {
            if (!oldModel || !newModel) {
                return $q.reject();
            }

        // If there are no columns in new model with the same names, return.
        // Else show a popup to add a prefix to the newly added columns.
        // Compute a diff of columns between oldModel and newModel (call the set diffCols). Tag those columns in the
        // diffCols that had name conflict.
        //
        // If the user cancels the prefix addition, do nothing
        // Else, take the prefix and apply to diffCols. Optionally, user may choose to only apply the prefix only to
        // tagged columns in the set.
            var oldModelCols = oldModel.getColumns(),
                newModelCols = newModel.getColumns(),
                oldModelColNameMap = {},
                oldModelColIdsMap = {};

            if (newModelCols.length <= oldModelCols.length) {
                return $q.reject();
            }

            oldModelCols.each(function (col) {
                var colName = col.getName().trim().toLowerCase();
                var colUniqueIdentifier = col.getSageOutputColumnId();
                oldModelColNameMap[colName] = true;
                oldModelColIdsMap[colUniqueIdentifier] = true;
            });

            var diffCols = [],
                hasNameConflict = false;

            newModelCols.each(function (col, idx) {
                var colName = col.getName().trim().toLowerCase();
                var colUniqueIdentifier = col.getSageOutputColumnId();
                var isNewColumn = !oldModelColIdsMap[colUniqueIdentifier];
                var colHasNameConflict = isNewColumn && !!oldModelColNameMap[colName];
                if (colHasNameConflict) {
                    hasNameConflict = true;
                }

                if (isNewColumn) {
                    diffCols.push({
                        column: col,
                        nameConflict: colHasNameConflict
                    });
                }
            });


            if (!diffCols.length || !hasNameConflict) {
                return $q.reject();
            }

            var deferred = $q.defer();

            launchBulkPrefix(deferred, {
                customData: {
                    shouldPrefixOnlyConflictColumns: true,
                    diffCols: diffCols
                }
            });
            return deferred.promise;
        }

        function updateModel(newWorksheetModel, oldWorksheetModel) {
        // if the previous model had forceSave set to true this model (which is
        // an unsaved transform of the previous one) also needs to have a force
        // save
            if (!!oldWorksheetModel) {
                newWorksheetModel.setShouldForceSave(oldWorksheetModel.shouldForceSave());
            }

        //TODO(Rahul): De-duplicate tokens here ??
            updateClientStateFromCallosumResponse(newWorksheetModel);
        }

        function updateDocument(documentConfig, worksheetModel) {
            documentConfig.updateFromModel(worksheetModel);
        }

        function applyPrefix(customData) {
            customData.prefixLabel = customData.prefixLabel.trim() || '';
            if (!customData.prefixLabel || !customData.diffCols || !customData.diffCols.length) {
                _logger.warn('Expected non empty prefix label and non empty diff column set');
            }
            customData.diffCols.each(function (diffCol) {
                if (!diffCol.nameConflict && customData.shouldPrefixOnlyConflictColumns) {
                    return;
                }

            // NOTE(vibhor/shikhar): We are always inserting a space between prefix and name instead of letting
            // user specify a delimiter. This may not be desirable in 100% of cases.
                var column = diffCol.column,
                    newName = customData.prefixLabel + ' ' + column.getName();

                column.setName(newName);
                updateColumnName(column, newName);
            });
        }

        function handleCallosumResponse(documentConfig, userActionType, newWorksheetModel) {
            var existingModel = documentConfig.model;
            return maybeLaunchAddPrefixDialog(existingModel, newWorksheetModel)
            .then(function(customData) {
                applyPrefix(customData);
                updateDocument(documentConfig, newWorksheetModel);
            }, function() {
                updateDocument(documentConfig, newWorksheetModel);
            });
        }

        function fetchUpdatedWorksheetModel(documentConfig, userActionType, worksheetResponse) {
            var existingModel = documentConfig.model;

            var context = worksheetResponse.getContext();
            var table = context.getTables()[0];
            var query = table.getQuery();

            if (!(query && sage.serialize(query).length)) {
                clearState();
                documentConfig.updateFromModel(null);

                return null;
            }

            var questionParams = {};
            questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = context;

            var userAction = new UserAction(UserAction.FETCH_WORKSHEET);
            return worksheetService.getWorksheet(
            questionParams,
                {
                    model: existingModel
                }
        ).then(function(response) {
            var worksheetModel = response.data;

            updateModel(worksheetModel, existingModel);

            return worksheetModel;
        }, function(response) {
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });
        }

        function handleJoinPathAmbiguity(documentConfig, userActionType, tableResponse) {
            if (tableResponse.hasMultipleJoinPathChoices()) {
            // Launch join workflow here.
                joinWorkflowLauncher.launch(
                tableResponse.getJoinPathAmbiguities(),
                tableResponse.getNewTokens(),
                documentConfig.model && documentConfig.model.getRecognizedTokens(),
                getJoinWorkflowType(userActionType)
            ).then(function (resolvedTokens) {
                var context = documentConfig.sageClient.getContext();
                return updateWorksheet(context, resolvedTokens, documentConfig, userActionType);
            });
            }
        }

        function processSageResponseErrors(documentConfig, userActionType, worksheetResponse) {
            var tableResponse = worksheetResponse.getResponse();
            if (tableResponse.needsJoinDisambiguation()) {
                handleJoinPathAmbiguity(documentConfig, userActionType, tableResponse);
            } else if (worksheetResponse.getTableError(0).getErrorCode() === sage.ErrorCode.NO_MATCH ||
                    worksheetResponse.getTableError(0).getErrorCode() === sage.ErrorCode.NOT_FOUND) {
                alertService.showFailureAlert(messageService.blinkGeneratedErrors.SAGE_INDEXING);
            } else {
            // TODO (Rahul): Need to be externalized.
                var userActionFailedMessage = strings.alert.worksheetBuilderFailedUserActions
                .transformationFailed.assign({
                    userAction: getUserActionTypeText(userActionType)
                });
                alertService.showAlert({
                    message: userActionFailedMessage,
                    type: alertConstants.type.ERROR,
                    details: {
                        data: worksheetResponse.getTableError(0).getErrorMessage() ||
                    'Sage transformation failed with error code {1}'.assign(
                        worksheetResponse.getTableError(0).getErrorCode()),
                        incidentId: worksheetResponse.getInfo().getIncidentId()
                    }
                });
            }

            return $q.reject();
        }

        function handleSageResponse(documentConfig, userActionType, sageResponse) {
            var worksheetResponse = sageResponse.answerResponse;
            if (worksheetResponse.getTableError(0).getErrorCode() === sage.ErrorCode.SUCCESS) {
                documentConfig.sageClient.setContext(worksheetResponse.getContext());
                return worksheetResponse;
            } else {
                return processSageResponseErrors(documentConfig, userActionType, worksheetResponse);
            }
        }

        function updateFormulaColumnName(documentConfig, formulaId, formulaName) {
            var worksheetModel = documentConfig.model;
            var formulaColumn = worksheetModel.getColumns().find(function(column) {
                return column.isFormula() && column.getFormulaId() === formulaId;
            });
            if (!formulaColumn) {
                _logger.info('Currently edited formula is not part of the worksheet table');
                return;
            }
            formulaColumn.setName(formulaName);
            formulaIdToName[formulaId] = formulaName;
            updateColumnName(formulaColumn, formulaName);
        }

        function addFormula(formula, documentConfig, userActionType) {
            var context = documentConfig.sageClient.getContext();

            var initialFormulae = context.getFormulae();

            var onSaveFormula = function(sageResponse) {
                var answerResponse = sageResponse.answerResponse;
                var newContext = answerResponse.getContext();

                var formulaId = formula.getId();
                var initialFormulaIndex = initialFormulae.findIndex(function(formula) {
                    return formula.getId() == formulaId;
                });

                documentConfig.sageClient.setContext(newContext);

                if (initialFormulaIndex === -1) {
                    var addFormulaTransform = sage.QueryTransform.createAddColumnTransformation({
                        columnGuid: formulaId
                    });
                    return transformWorksheet(newContext, [addFormulaTransform], documentConfig, userActionType);
                } else {
                    updateFormulaColumnName(documentConfig, formulaId, formula.getName());
                    var table = newContext.getTables()[0];
                    return updateWorksheet(newContext, table.getTokens(), documentConfig, userActionType);
                }
            };

            return blinkAutoCompleteService.saveFormula(context, formula)
            .then(onSaveFormula);

        }

        function setWorksheetForceSaveForFixedBrokenWorksheet(documentConfig, userActionType) {
            if (userActionType === userActionTypes.DELETE_ALL_BROKEN_COLUMNS) {
            // For worksheets that were broken and have been fixed now, we need to make sure then
            // when they are saved, they should be force saved even if dependecies on them are
            // breaking. This flag ensures that.
                documentConfig.model.setShouldForceSave(true);
            }
        }

        function transformWorksheet(context, queryTransformations, documentConfig, userActionType) {
            loadingIndicator.show({loadingText: strings.worksheets.updating});

            var sagePromise = null;
            switch (userActionType) {
                case userActionTypes.DELETE_ALL_BROKEN_COLUMNS:
                    sagePromise = autoCompleteService
                    .removeAllBrokenColumnsFromWorksheet(context);
                    break;
                default:
                    sagePromise = autoCompleteService.transformWorksheet(
                context,
                queryTransformations
            );
            }

            return sagePromise
            .then(handleSageResponse.bind(undefined, documentConfig, userActionType))
            .then(fetchUpdatedWorksheetModel.bind(undefined, documentConfig, userActionType))
            .then(handleCallosumResponse.bind(undefined, documentConfig, userActionType))
            .then(setWorksheetForceSaveForFixedBrokenWorksheet.bind(undefined, documentConfig, userActionType))
            .finally(loadingIndicator.hide);
        }

        function updateWorksheet(context, newTokens, documentConfig, userActionType) {
            newTokens = newTokens || [];

            var worksheetRequest = autoCompleteObjectUtil.getNewACTableRequest();
            worksheetRequest.setInputTokens(newTokens);
            worksheetRequest.setCurrentlyEditedToken(0);

            loadingIndicator.show({loadingText: strings.worksheets.updating});

            return autoCompleteService.updateWorksheet(context, worksheetRequest)
            .then(handleSageResponse.bind(undefined, documentConfig, userActionType))
            .then(fetchUpdatedWorksheetModel.bind(undefined, documentConfig, userActionType))
            .then(handleCallosumResponse.bind(undefined, documentConfig, userActionType))
            .finally(loadingIndicator.hide);
        }

        function addNewColumns(context, newColumns, documentConfig) {
            var queryTransforms = [];
            newColumns.each(function (col) {
                var addColumnTransformation = sage.QueryTransform.createAddColumnTransformation({
                    columnGuid: col.getGuid()
                });
                queryTransforms.push(addColumnTransformation);
            });

            var action = userActionTypes.ADD_COLUMNS;
            return transformWorksheet(context, queryTransforms, documentConfig, action);
        }

        function updateFormulaIdToNameMap(worksheetModel, transformedColumns) {
            formulaIdToName = {};

            var transformedFormulaIds = {};
            transformedColumns.each(function(col){
                if (!col.isFormula()) {
                    return;
                }

                var formulaId = col.getFormulaId();
                formulaIdToName[formulaId] = col.getName();
                transformedFormulaIds[formulaId] = true;
            });


            if (worksheetModel) {
                worksheetModel.getColumns().each(function(col){
                    if (!col.isFormula()) {
                        return;
                    }
                    var formulaId = col.getFormulaId();
                // ensure that in case we are editing a formula we don't
                // use the name from the older version of the formula
                // SCAL-6054
                    if (!Object.has(transformedFormulaIds, formulaId)) {
                        formulaIdToName[formulaId] = col.getName();
                    }
                });
            }
        }

    // 1. See if there are any columns that are already present in the model.
    // 2. If no existing columns match the given list of columns, do an add transformation.
    // 3. If any existing columns found, try duplicating and request additional join paths.
    //    3.1 If no ambiguity results, then ignore existing columns and add the new columns
    //        using #2.
    //    3.2 If ambiguity is present, then launch join workflow.
    // 4. For any sage response, if there are no errors, use the sagequery and request callosum
    //    for an updated worksheet.
    // 5. For sage response with an MJP error, launch join workflow.
        function duplicateExistingColumnsAndAddNewColumns(columns, documentConfig) {
            var context = documentConfig.sageClient.getContext();
            var contextClone = _.cloneDeep(context);
            var table = contextClone.getTables()[0],
                existingTokens = table.getTokens();

            var newColumns = [];

            var explicitJoinPathEditSet = false;
            matchColumnsToTokensByGuid(columns, existingTokens, function(column, token){
                if (!!token) {
                    var copyToken = new sage.RecognizedToken(token);
                    copyToken.clearJoinPath();
                    if (!explicitJoinPathEditSet) {
                        copyToken.setExplicitJoinPathEdit(true);
                        explicitJoinPathEditSet = true;
                    }
                    existingTokens.push(copyToken);
                } else {
                    newColumns.push(column);
                }
            });

            return addNewColumns(contextClone, newColumns, documentConfig);
        }

    /**
     *
     * @param {Array.<LogicalTableModel.LogicalColumn>} columns
     * @param {Object} documentConfig
     * @param {DocumentModel} documentConfig.model
     * @param {WorksheetSageClient} documentConfig.sageClient
     */
        function addColumns(columns, documentConfig) {
            if (!columns || !columns.length) {
                var warning = 'Attempt to add columns to invalid worksheet';
                _logger.warn(warning);
                return $q.reject(new Error(warning));
            }

            return duplicateExistingColumnsAndAddNewColumns(columns, documentConfig);
        }

        function hasADifferentFormulaWithSameName(formulaColumn, worksheetModel) {

            if (!worksheetModel || !formulaColumn) {
                return false;
            }

            var columns = worksheetModel.getColumns(),
                currentFormulaId = formulaColumn.getFormulaId(),
                currentFormulaName = formulaColumn.getName().toLowerCase();

            return columns.any(function(col){
                return col.isFormula() && col.getFormulaId() !== currentFormulaId &&
                col.getName().toLowerCase() === currentFormulaName;
            });
        }

        function addFormulaColumn(sageFormula, documentConfig) {
            return addFormula(sageFormula, documentConfig, userActionTypes.ADD_COLUMNS);
        }

        function clearFormulaState(formulaColumn, documentConfig) {
            var worksheetModel = documentConfig.model;

        // Remove temp state from the document config model.
            if (worksheetModel) {
                var columns = worksheetModel.getColumns(),
                    currentFormulaId = !!formulaColumn ? formulaColumn.getFormulaId() : null;

                if (!currentFormulaId) {
                    return;
                }

                var matchingColumn = columns.find(function(column){
                    return column.isFormula() && column.getFormulaId() === currentFormulaId;
                });

                if (!!matchingColumn) {
                    matchingColumn.clearFormulaQuery();
                    matchingColumn.clearFormulaTokens();
                }
            }
        }

        function doColumnsHaveDependents(columns) {
            var columnIds = columns.map('getGuid');

            loadingIndicator.show({
                loadingText: strings.worksheets.verifying
            });

            var userAction = new UserAction(UserAction.FETCH_COLUMN_DEPENDENTS);
            return dependencyService.getUniqueNonDeletedColumnDependents(columnIds)
            .then(function(response){
                return response.data;
            }, function(response){
                alertService.showUserActionFailureAlert(userAction, response);
                return $q.reject(response.data);
            }).finally(loadingIndicator.hide);
        }

        function notifyOfDependentsOnDelete(columns, dependents) {
            var title = strings.alert.dataDeletionAlertMessages.cannotDelete,
                singular = columns.length == 1,
                messages = strings.alert.dataDeletionAlertMessages.withDependents,
                message = singular ? messages.singular.assign({itemName: columns[0].getName()})
                : messages.plural.assign({itemType: strings.COLUMN});

            dependencyDialogService.showDependencyDialog(title, message, dependents);
        }

        function removeColumns(columns, documentConfig) {
            if (!columns || !columns.length) {
                return;
            }

            doColumnsHaveDependents(columns)
            .then(function(dependents){
                if (dependents.length > 0) {
                    notifyOfDependentsOnDelete(columns, dependents);
                    return;
                }

                var queryTransformations = columns.map(function (col) {
                    return sage.QueryTransform.createRemoveColumnTransformation({
                        tokenOutputGuid: col.getSageOutputColumnId()
                    });
                });

                var context = documentConfig.sageClient.getContext();

                var action = userActionTypes.DELETE_COLUMNS;
                transformWorksheet(context, queryTransformations, documentConfig, action);
            });
        }

        function removeFormula(sageFormula, documentConfig) {
            loadingIndicator.show({loadingText: strings.worksheets.updating});
            var userActionType = userActionTypes.REMOVE_FORMULA;
            var sagePromise = blinkAutoCompleteService.removeFormula(
                documentConfig.sageClient.getContext(),
                sageFormula
            );

            return sagePromise
                .then(handleSageResponse.bind(undefined, documentConfig, userActionType))
                .then(fetchUpdatedWorksheetModel.bind(undefined, documentConfig, userActionType))
                .then(handleCallosumResponse.bind(undefined, documentConfig, userActionType))
                .then(setWorksheetForceSaveForFixedBrokenWorksheet.bind(undefined, documentConfig, userActionType))
                .finally(loadingIndicator.hide);
        }

        function addFormulaToWorksheet(sageFormula, documentConfig) {
            var addColumnTransformation = sage.QueryTransform.createAddColumnTransformation({
                columnGuid: sageFormula.getId()
            });

            var action = userActionTypes.ADD_COLUMNS;
            return transformWorksheet(
                documentConfig.sageClient.getContext(),
                [addColumnTransformation],
                documentConfig,
                action
            );
        }

    // For broken worksheets that have skipped the formula upgrade,
    // there may still be unrecognized type tokens. For these, we
    // apply tokenType by reading the value from the corresponding
    // worksheet column.
        function fixUnrecognizedTypeTokens(documentConfig) {
            var columns = documentConfig.model.getColumns();
            var context = documentConfig.sageClient.getContext();
            var tokens = context.getTable()[0].getTokens();

            var formulaIdToColumnMap = {};
            columns.forEach(function(column) {
                if (column.isFormula()) {
                    formulaIdToColumnMap[column.getFormulaId()] = column;
                }
            });

            tokens.forEach(function (token) {
                if (token.getTypeEnum() === sage.TokenType.UNRECOGNIZED) {
                    var column = formulaIdToColumnMap[token.getFormulaId()];

                    if (!!column) {
                        if (column.isAttribute()) {
                            token.setTypeEnum(sage.TokenType.ATTRIBUTE);
                        } else {
                            token.setTypeEnum(sage.TokenType.MEASURE);
                        }
                    }
                    token.setFormulaId(null);
                }
            });
        }

        function removeAllBrokenColumns(documentConfig) {
            var deferred = $q.defer();

            dialog.show({
                title: strings.worksheets.brokenColumnDeleteDialog.title,
                message: strings.worksheets.brokenColumnDeleteDialog.message,
                onConfirm: function () {
                    var context = documentConfig.sageClient.getContext();

                    fixUnrecognizedTypeTokens(documentConfig);

                    var action = userActionTypes.DELETE_ALL_BROKEN_COLUMNS;
                    transformWorksheet(context, [], documentConfig, action);
                    deferred.resolve();
                    return true;
                },
                onCancel: function () {
                    deferred.reject();
                }});

            return deferred.promise;
        }

        function updateWorksheetModel(documentConfig) {
            var tokens = documentConfig.model.getRecognizedTokens();

            updateFormulaIdToNameMap(documentConfig.model, []);

            var context = documentConfig.sageClient.getContext();

            updateWorksheet(context, tokens, documentConfig, userActionTypes.UPDATE_WORKSHEET);
        }

        function editJoinPathForColumn(column, documentConfig) {
            var tokens = documentConfig.model.getRecognizedTokens();

            var token = tokens.find(function(token) {
                return token.getOutputGuid() == column.getSageOutputColumnId();
            });

            token.setExplicitJoinPathEdit(true);

            var context = documentConfig.sageClient.getContext();

            updateWorksheet(context, tokens, documentConfig, userActionTypes.EDIT_JOIN_PATH);
        }

        function launchBulkPrefix(deferred, options) {
            options = options || {};
            dialog.show(angular.extend({
                title: 'Add prefix',
                confirmBtnLabel: 'Add',
                cancelBtnLabel: 'Skip',
                cancelCbOnClose: true,
                customData: {},
                customBodyUrl: 'src/common/widgets/dialogs/templates/add-prefix-dialog.html',
                onConfirm: function (customData) {
                    var prefixLabel = customData.prefixLabel.trim();
                    if (!prefixLabel) {
                    // Don't kill the dialog until user enters a non-empty label or cancels.
                        return false;
                    }
                    deferred.resolve(customData);
                    safeApply($rootScope);
                    return true;
                },
                onCancel: function () {
                    deferred.reject();
                    safeApply($rootScope);
                }
            }, options));
        }

        function handleBulkPrefix(columns, onNameChange) {
            var bulkPrefixDialogDeferred = $q.defer();
            launchBulkPrefix(bulkPrefixDialogDeferred, {
                customData: {
                    isPrefixForExistingColumns: true
                }
            });
            bulkPrefixDialogDeferred.promise.then(function (customData) {
                customData.prefixLabel = customData.prefixLabel.trim() || '';

                columns.each(function (column) {
                    var newName = customData.prefixLabel + ' ' + column.getName();
                    column.setName(newName);
                    updateColumnName(column, newName);
                });

                if (onNameChange) {
                    onNameChange();
                }
            });
        }

    /**
     * Updates column names locally, once we move to ACContext,
     * these name updates will need to be done there.
     *
     * @param column
     * @param newName
     */
        function updateColumnName(column, newName) {
            var outputGuid = column.getSageOutputColumnId();
            outputGuidToNameMap[outputGuid] = newName;
        }

        function clearState() {
            outputGuidToNameMap = {};
            formulaIdToName = {};
            formulaIdToColumnTypesMap = {};
        }

        return {
            addColumns: addColumns,
            hasADifferentFormulaWithSameName: hasADifferentFormulaWithSameName,
            addFormulaColumn: addFormulaColumn,
            clearFormulaState: clearFormulaState,
            removeColumns: removeColumns,
            removeAllBrokenColumns: removeAllBrokenColumns,
            updateWorksheetModel: updateWorksheetModel,
            editJoinPathForColumn: editJoinPathForColumn,
            handleBulkPrefix: handleBulkPrefix,
            updateColumnName: updateColumnName,
            clearState: clearState,
            removeFormula: removeFormula,
            addFormulaToWorksheet: addFormulaToWorksheet
        };
    }]);
