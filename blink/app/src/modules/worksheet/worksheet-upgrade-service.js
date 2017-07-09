/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Utility to facilitate worksheet upgrades between ThoughtSpot
 * versions that are not backwards compatible.
 */

'use strict';

blink.app.factory('worksheetUpgradeService', ['$q',
    '$rootScope',
    'alertService',
    'autoCompleteObjectUtil',
    'autoCompleteService',
    'blinkConstants',
    'strings',
    'env',
    'jsonConstants',
    'loadingIndicator',
    'Logger',
    'UserAction',
    'util',
    'worksheetService',
    function ($q,
          $rootScope,
          alertService,
          autoCompleteObjectUtil,
          autoCompleteService,
          blinkConstants,
          strings,
          env,
          jsonConstants,
          loadingIndicator,
          Logger,
          UserAction,
          util,
          worksheetService) {

        var logger = Logger.create('worksheet-upgrade-service');

        var worksheetUpgradeFailureMessage = strings.worksheets.upgrade.UPGRADE_FAILURE_MESSAGE;

    // SCAL-11808: Tokens/Columns saved with the worksheet might be missing
    // sage output column guid.
        function worksheetContainsTokensMissingOutputGuid(worksheetModel) {
            var contextIndex = worksheetModel.getSageContextIndex();
            var context = worksheetModel.getSageContext();
            var recognizedTokens = context.getTables()[contextIndex].getTokens();
            return recognizedTokens.any(function(recognizedToken){
                return !recognizedToken.getOutputGuid();
            });
        }

        function worksheetContainsColumnsMissingOutputGuid(worksheetModel) {
            var columns = worksheetModel.getColumns();
            return columns.any(function(column){
                return !column.getSageOutputColumnId();
            });
        }

        function containsMissingExpressionInFormulae(worksheetModel) {
            var context = worksheetModel.getSageContext();
            var worksheetFormulae = context.getFormulae();

            return worksheetFormulae.any(function (formula) {
                var expression = formula.getExpression();
                return !expression || !sage.serialize(expression).length;
            });
        }

        function getErrorFromSageResponse(error) {
            var errorCode = error.getErrorCode();
            if (errorCode !== sage.ErrorCode.SUCCESS) {
                var errorMessage = worksheetUpgradeFailureMessage.assign({
                    errorCode: errorCode
                });
                return new Error(errorMessage);
            }

            return null;
        }

        var getLogicalKey = function(item) {
            return item.getLogicalKey();
        };

        var getTokenLookupKey = function (column) {
            return column.getTokenLookupKey();
        };

        function setOutputGuidForTokens(worksheetTokens, worksheetColumns) {
            var lookupIdToTokensMap = util.mapArrayToHash(worksheetTokens, getLogicalKey);
            var lookupIdToColumnMap = util.mapArrayToHash(worksheetColumns, getTokenLookupKey);

            util.iterateObject(lookupIdToTokensMap, function (lookupId, token) {
                var matchingColumn = lookupIdToColumnMap[lookupId];
                if (!matchingColumn) {
                    logger.error('Unable to find matching column for token', token);
                    return;
                }
                var outputGuid = matchingColumn.getSageOutputColumnId();
                var columnGuid = matchingColumn.getGuid();
                var outputGuidToSet = !!outputGuid ? outputGuid : columnGuid;

                token.setOutputGuid(outputGuidToSet);
            });
        }

        function updateExpressionLessFormulae(worksheetModel) {
            var context = worksheetModel.getSageContext();
            var contextIndex = worksheetModel.getSageContextIndex();
            var worksheetTokens = context.getTables()[contextIndex].getTokens();
            var worksheetColumns = worksheetModel.getColumns();
            var formulae = context.getFormulae();

            var sageTokensMissingOutputGuid = worksheetContainsTokensMissingOutputGuid(worksheetModel) ||
            worksheetContainsColumnsMissingOutputGuid(worksheetModel);

            if (sageTokensMissingOutputGuid) {
                setOutputGuidForTokens(worksheetTokens, worksheetColumns);
            }

            var formulaIdToColumnMap = {};
            worksheetColumns.forEach(function(column) {
                if (column.isFormula()) {
                    formulaIdToColumnMap[column.getFormulaId()] = column;
                }
            });

            var hasExpressionLessFormulae = formulae.any(function (formula) {
                var expression = formula.getExpression();
                return !expression || !sage.serialize(expression).length;
            });

            if (!hasExpressionLessFormulae) {
                return $q.when();
            }

            var promises = formulae.map(function (formula, index) {
                var tableRequest = autoCompleteObjectUtil.getNewACTableRequest();
                var formulaId = formula.getId();
                var tokens = formula.getTokens();
                tableRequest.setInputTokens(tokens);

                return autoCompleteService.updateExpression(tableRequest, null, formulaId)
                .then(function (sageResponse) {
                    var formulaResponse = sageResponse.answerResponse;

                    var error = getErrorFromSageResponse(formulaResponse.getError());

                    if (!!error) {
                        return $q.reject(error);
                    }

                    var query = formulaResponse.getWorksheet().getExpression();
                    formula.setExpression(query);

                    var formulaToken = worksheetTokens.find(function(token) {
                        return (token.getGuid() === formulaId) ||
                            (token.getFormulaId() === formulaId);
                    });

                    if (!formulaToken) {
                        logger.error('No matching formulaToken found for formulaId', formulaId);
                        return $q.reject(new Error(worksheetUpgradeFailureMessage));
                    }

                    formulaToken.setSageExpression(null);
                    formulaToken.setGuid(formulaId);
                    formulaToken.setFormulaId(null);

                    var formulaColumn = formulaIdToColumnMap[formulaId];

                    if (!!formulaColumn) {
                        if (formulaColumn.isAttribute()) {
                            formulaToken.setTypeEnum(sage.TokenType.ATTRIBUTE);
                        } else {
                            formulaToken.setTypeEnum(sage.TokenType.MEASURE);
                        }
                    } else {
                        // A formula column not existing for a ACFormula is possible if
                        // 2 ACFormula with the same definition have been added,
                        // Callosum creates only 1 FormulaColumn in this scenario.
                        logger.warn('No matching formulaColumn found for formulaId', formulaId);
                    }
                });
            });

            return util.getAggregatedPromise(promises)
            .then(function () {
                context.setFormulaeMap(formulae);
                return autoCompleteService.transformWorksheet(context, []);
            }).then(function(sageResponse) {
                var worksheetSageResponse = sageResponse.answerResponse;

                var error = getErrorFromSageResponse(worksheetSageResponse.getTableError(0));
                if (!!error) {
                    return $q.reject(error);
                }

                var updatedContext = worksheetSageResponse.getContext();
                worksheetModel.setSageContext(updatedContext);
                return worksheetSageResponse;
            });
        }

        function updateWorksheetContext(worksheetModel) {
            var context = worksheetModel.getSageContext();
            var contextIndex = worksheetModel.getSageContextIndex();
            var worksheetTokens = context.getTables()[contextIndex].getTokens();
            var worksheetColumns = worksheetModel.getColumns();

            setOutputGuidForTokens(worksheetTokens, worksheetColumns);

            return autoCompleteService.transformWorksheet(context, [])
            .then(function(sageResponse) {

                var worksheetSageResponse = sageResponse.answerResponse;

                var error = getErrorFromSageResponse(worksheetSageResponse.getTableError(0));
                if (!!error) {
                    return $q.reject(error);
                }

                var updatedContext = worksheetSageResponse.getContext();
                worksheetModel.setSageContext(updatedContext);
                return worksheetSageResponse;
            });
        }

        function fixWorksheetMissingOutputGuid(worksheetModel) {
            var sageTokensMissingOutputGuid = worksheetContainsTokensMissingOutputGuid(worksheetModel) ||
            worksheetContainsColumnsMissingOutputGuid(worksheetModel);
            var missingExpressionInFormulae = containsMissingExpressionInFormulae(worksheetModel);

            var shouldUpgrade = sageTokensMissingOutputGuid || missingExpressionInFormulae;

            if (env.forceWorksheetUpgrade !== void 0 && !!env.forceWorksheetUpgrade) {
                shouldUpgrade = true;
            // the flag is one shot, if we don't set it to false we'll go into a loop
            // of endless auto upgrades
                env.forceWorksheetUpgrade = false;
            }

            if (!shouldUpgrade) {
                return $q.when(null);
            }

            var deferred = $q.defer();

        // Steps to fix:
        // 1. Sends the query to sage, sage will generate output guids to token
        //    which don't have output guids
        // 2. Delete sageOutputColumnId from one of the LogicalColumns of the
        //    worksheet and make a /worksheet call to callosum. This missing
        //    sageOutputColumnId from a column forces callosum to match incoming
        //    tokens to column and set the sageOutputColumnId in all columns to
        //    the ones set in the corresponding sage token.

        // If expressionless formulae take care of missing output guid issue too.
        // In case we need to fix expression-less formulae, we call that, else we
        // make the updateWorksheetContext to fix missing output guid.
            var upgradePromise = missingExpressionInFormulae ?
            updateExpressionLessFormulae : updateWorksheetContext;

            upgradePromise(worksheetModel).then(function() {
                var worksheetLogicalColumns = worksheetModel.getColumns();
                var formulaIdToNameMap = {};
                worksheetLogicalColumns.forEach(function(col) {
                    if (col.isFormula()) {
                        formulaIdToNameMap[col.getFormulaId()] = col.getName();
                    }
                });

                var worksheetContext = worksheetModel.getSageContext();

                $rootScope.currentQueryJoinType = worksheetModel.getQueryJoinType();
                $rootScope.currentWorksheetType = worksheetModel.getWorksheetType();

                var questionParams = {};
                questionParams.quesionText = 'Worksheet Upgrade Query';
                questionParams[jsonConstants.SAGE_CONTEXT_PROTO_KEY] = worksheetContext;
                questionParams[jsonConstants.SAGE_CONTEXT_INDEX_KEY] = 0;

                var userAction = new UserAction(UserAction.FETCH_WORKSHEET);
                var worksheetUpdatedPromise = worksheetService.getWorksheet(
                questionParams,
                    {
                        model: worksheetModel
                    }).then(
                function(response) {
                    return response.data;
                }, function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                });

                worksheetUpdatedPromise.then(function(worksheetModel) {
                    worksheetModel.getColumns().filter(function(column) {
                        if (column.isFormula()) {
                            var formulaName = formulaIdToNameMap[column.getFormulaId()];
                            column.setName(formulaName);
                        }
                    });

                    deferred.resolve(worksheetModel);
                }, function(error) {
                    deferred.reject(error);
                });

            }, function(error){
                deferred.reject(error);
            });

            return deferred.promise;
        }

        function upgradeWorksheetIfNecessary(worksheetModel) {
            return fixWorksheetMissingOutputGuid(worksheetModel);
        }

        return {
            upgradeWorksheetIfNecessary: upgradeWorksheetIfNecessary
        };
    }]);
