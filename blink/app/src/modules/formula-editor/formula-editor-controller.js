/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Controller for formula editor
 */

'use strict';

blink.app.controller('FormulaEditorController', ['$scope',
    '$q',
    'alertService',
    'blinkConstants',
    'strings',
    'FormulaEditorModel',
    'formulaEditorPopupService',
    'formulaExamplesData',
    'formulaService',
    'Logger',
    'jsUtil',
    'safeApply',
    'sageCallosumTranslator',
    'UserAction',
    'util',
    function ($scope,
          $q,
          alertService,
          blinkConstants,
          strings,
          FormulaEditorModel,
          formulaEditorPopupService,
          formulaExamplesData,
          formulaService,
          Logger,
          jsUtil,
          safeApply,
          sageCallsoumTranslator,
          UserAction,
          util) {
        var logger = Logger.create('formula-editor-controller');

    // TODO(sunny): move all of these scope variables to
    // inside formula model

    // data types that can be treated as measures
        var MEASURE_DATA_TYPES = [
            util.dataTypes.DATE_NUM,
            util.dataTypes.INT32,
            util.dataTypes.INT64,
            util.dataTypes.FLOAT,
            util.dataTypes.DOUBLE];

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

        $scope.examplesTreeData = formulaExamplesData;
        $scope.isFormulaAssistantOpen = false;

        $scope.typeOptions = {
            dataType: util.displayNameToDataType,
            type: ['MEASURE', 'ATTRIBUTE'],
            aggrType: util.invertObject(util.aggregateTypeLabels)
        };

        $scope.types = {
            dataType: Object.values($scope.typeOptions.dataType)[0],
            type: $scope.typeOptions.type[0],
            aggrType: Object.values($scope.typeOptions.aggrType)[0]
        };

        $scope.disabledTypeOptions = {
            dataType: [],
            type: [],
            aggrType: []
        };

        $scope.addingFormulaToDocument = false;
        $scope.lastSaveError = null;
        $scope.isRemoteCallPending = false;

        $scope.currentLogicalColumn = null;
        $scope.formulaEditorModel = null;

        function updateDisabledOptions() {
        // depending on the type of the column some or all of the aggregation types
        // might need to be disabled
            if ($scope.currentLogicalColumn) {
                var validAggrTypes = $scope.currentLogicalColumn.getSupportedAggregationTypes();
                $scope.disabledTypeOptions.aggrType = Object.keys($scope.typeOptions.aggrType).subtract(validAggrTypes);
            }
        // if the data type can't be treated as measure, disable measure option
            var isMeasureDataType = MEASURE_DATA_TYPES.some(function(dataType) {
                return dataType === $scope.types.dataType
            });

            $scope.disabledTypeOptions.type =  isMeasureDataType ? [] : ['MEASURE'];
        }


        function initializeModel() {
            $scope.formulaEditorModel = (!!$scope.sageFormula)
            ? getModelFromSageFormula()
            : new FormulaEditorModel(
                $scope.dataScope,
                $scope.sageContext,
                // Using empty formulaId as we are creating a new formula instead of editing an existing one.
                '');
        }

        function getModelFromSageFormula() {

            var formulaTokens = $scope.sageFormula.getTokens(),
                formulaName = $scope.sageFormula.getName(),
                formulaId = $scope.sageFormula.getId(),
                type = sageCallsoumTranslator.getCallosumColumnTypeForSageColumnType($scope.sageFormula.getColumnType()),
                dataType = sageCallsoumTranslator.getCallosumDataTypeForSageDataType($scope.sageFormula.getDataType()),
                aggrType = sageCallsoumTranslator.getCallosumAggrTypeForSageAggrType($scope.sageFormula.getAggregationType());

            $scope.types.type = type;
            $scope.types.dataType = dataType;
            $scope.types.aggrType = aggrType;

            updateDisabledOptions();

            return FormulaEditorModel.createModelFromExistingState(formulaName,
                formulaTokens,
                $scope.dataScope,
                $scope.sageContext,
                formulaId,
                type,
                dataType,
                aggrType);
        }

        $scope.syncModelWithCallosum = function(expressionEditorModel) {

            var formulaId = null;
            $scope.isCurrentFormulaValid = true;

            if ($scope.sageFormula) {
                formulaId = $scope.sageFormula.getId();
            } else {
                formulaId = jsUtil.generateUUID();
            }

            var userAction = new UserAction(UserAction.UPDATE_FORMULA);
            var promise = formulaService.getFormula(
                {
                // TODO(sunny): remove the first two items once callosum api has been updated
                    formulaExpression: expressionEditorModel.getFormulaExpression(),
                    sageContext: expressionEditorModel.getSageContext(),
                    formulaName: $scope.formulaEditorModel.getFormulaName()
                }
        )
            .then(function(response) {
                return response.data;
            }, function(response) {
                var substitutions = [$scope.formulaEditorModel.getFormulaName()];
                alertService.showUserActionFailureAlert(
                    userAction,
                    response,
                    {substitutions: substitutions}
                );
                return $q.reject(response.data);
            });

            return promise.then(function(formulaColumn){
            // TODO(sunny): set the data types
                formulaColumn.setFormulaId(formulaId);
                formulaColumn.setFormulaTokens(expressionEditorModel.getNewTokens());
                formulaColumn.setName($scope.formulaEditorModel.getFormulaName());
                formulaColumn.setFormulaQuery(expressionEditorModel.getFormulaExpression());

                var overriddenDataType = $scope.formulaEditorModel.getOverriddenDataType();
                if (!overriddenDataType || formulaColumn.getDataType() !== overriddenDataType) {
                // the data type has changed, we'll reset the overrides in the model
                    $scope.formulaEditorModel.resetOverridesToMatchFormulaColumn(formulaColumn);
                } else {
                // the data type is the same as the last known value, the formula column
                // now needs to be updated to be the same as the last known values of
                // the other types
                    formulaColumn.setType($scope.formulaEditorModel.getOverriddenType());
                    formulaColumn.setAggregateType($scope.formulaEditorModel.getOverriddenAggrType());
                }

                $scope.types.dataType = formulaColumn.getDataType();
                $scope.types.type = formulaColumn.getType();

                var validAggregationTypes = formulaColumn.getSupportedAggregationTypes(),
                    overriddenAggrType = $scope.formulaEditorModel.getOverriddenAggrType();
            // this should never happen, keeping as a fail-safe
                if (!!overriddenAggrType && validAggregationTypes.indexOf(overriddenAggrType) < 0) {
                    $scope.formulaEditorModel.clearAggrTypeOverride();
                }

                $scope.types.aggrType = formulaColumn.getAggregateType();

                $scope.currentLogicalColumn = formulaColumn;
                updateDisabledOptions();

            });
        };

        $scope.updateFormulaName = function () {
            $scope.lastSaveError = null;
            if ($scope.currentLogicalColumn) {
                $scope.currentLogicalColumn.setName($scope.formulaEditorModel.getFormulaName());
            }
        };

        $scope.cancelFormulaEditing = function () {
            $scope.callbacks.onCancel($scope.currentLogicalColumn);
        };

        $scope.addFormulaToDocument = function () {
            if (!$scope.isCurrentFormulaValid) {
                return;
            }

            if (!$scope.callbacks.validateName($scope.currentLogicalColumn)) {
                $scope.lastSaveError = "Formula <b>{1}</b> already exists. Please choose a different name."
                .assign($scope.currentLogicalColumn.getName());
                return;
            }

            if (!!$scope.addingFormulaToDocument) {
                logger.debug('user clicked on "save formula" while a save was pending, ignored');
                return;
            }

            $scope.callbacks.onAddFormula($scope.currentLogicalColumn)
            .then(function(){
                formulaEditorPopupService.hide();
            }, function(error){
                // TODO(rahul/sunny): show error
                if (error !== strings.IGNORED_API_CALL_ERROR) {
                    logger.error('error in adding formula', error);
                }
            });
        };

        $scope.setCurrentFormulaInvalid = function() {
            $scope.isCurrentFormulaValid = false;
        };

        $scope.isAggregationEditingAllowed = function () {
            return $scope.types.type === 'MEASURE';
        };

        $scope.onTypeOptionChange = function () {
            $scope.formulaEditorModel.setOverriddenDataType($scope.types.dataType);
            $scope.formulaEditorModel.setOverriddenType($scope.types.type);
            $scope.formulaEditorModel.setOverriddenAggrType($scope.types.aggrType);

            if ($scope.currentLogicalColumn) {
                $scope.currentLogicalColumn.setDataType($scope.types.dataType);
                $scope.currentLogicalColumn.setType($scope.types.type);
                $scope.currentLogicalColumn.setAggregateType($scope.types.aggrType);
            }
        };

        $scope.openFormulaAssistant = function () {
            $scope.isFormulaAssistantOpen = true;
        };

        $scope.closeFormulaAssistant = function () {
            $scope.isFormulaAssistantOpen = false;
        };

        initializeModel();
    }]);
