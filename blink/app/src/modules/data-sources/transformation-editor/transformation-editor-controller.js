/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview controller for Transformation Editor
 */

'use strict';

blink.app.controller('TransformationEditorController', ['$q',
    '$scope',
    'alertService',
    'blinkConstants',
    'strings',
    'dataManagementService',
    'loadingIndicator',
    'sessionService',
    'UserAction',
    'util',
    function($q,
         $scope,
         alertService,
         blinkConstants,
         strings,
         dataManagementService,
         loadingIndicator,
         sessionService,
         UserAction,
         util) {

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;
        $scope.props = {};
        var currentCompletions = [];
        var getOldExpressionType;
        var oldModel;

        var newColumn = {
            placeholder: strings.transformationEditor.ADD_NEW_COLUMN,
            name: '',
            shouldCreateNewColumn: true
        };

        $scope.onEditorLoaded = function (editor) {
        //Added to suppress ace editor console warnings.
            editor.$blockScrolling = Infinity;
        // Done to prevent duplication of stale completers
            editor.completers = editor.completers.slice();
            editor.completers.push({
                getCompletions: function(editor, session, pos, prefix, callback) {
                    callback(null, currentCompletions);
                }
            });
        };

        $scope.updateColumnNames = function () {
            if(!$scope.transformationModel.table) {
                return;
            }
            if(!!$scope.transformationModel.table.subItems
                && $scope.transformationModel.table.subItems.length > 0) {
                // If subItems are already present, which would be the case if columns are
                // un-selected.
                return updateTargetOptions({});
            }

            $scope.props.selectedColumnName = void 0;
            loadingIndicator.show();
            $scope.getTableColumns($scope.transformationModel.table.name)
                .then(function(columns) {
                    currentCompletions = columns.map(function (column) {
                        return {name: column.name, value: column.name, meta: 'column'};
                    });
                    return columns;
                })
                .then(updateTargetOptions)
                .finally(loadingIndicator.hide);
        };

        function updateTargetOptions(columns) {
            var table = $scope.tables.find(function (table) {
                return table.name === $scope.transformationModel.table.name;
            });
            if(table.subItems.length > 0) {
                // we wish to show only selected columns as suggestions.
                $scope.columns = table.subItems.filter(function(column) {
                    return column.isChecked;
                });
            } else {
                $scope.columns = columns;
            }
            $scope.columns.unshift(newColumn);
        }

        $scope.showNameEditor = function () {
            return $scope.transformationModel.shouldCreateNewColumn
            || $scope.transformationModel.isExisting;
        };

        $scope.getValidator = function() {
            // Following restrictions apply to the column names that
            // Informatica can process.
            // 1. Should be <= 65 chars long.
            // 2. No spaces allowed.
            // 3. Cannot start with numbers.
            // 4. Only alphanumeric characters and underscrore allowed.
            return "^[a-zA-Z_][a-zA-Z_0-9]{0,64}$";
        };

        $scope.getColumnDropdownValue = function (item) {
            if(!item) {
                return;
            }
            return item.name || item.placeholder;
        };

        $scope.updateTargetName = function (column) {
            $scope.transformationModel.shouldCreateNewColumn = column.shouldCreateNewColumn;
            $scope.transformationModel.name = column.name;
        };

        $scope.cancelTransformationEditing = function () {
            $scope.onDone();
        };

        $scope.canAddTransformationToDocument = function () {
            return isCurrentTransformationValid();
        };

        $scope.getSaveBtnTooltip = function () {
            if($scope.canAddTransformationToDocument()) {
                return '';
            }
            return $scope.strings.transformationEditor.CANNOT_SAVE;
        };

        $scope.onTransformationAdded = function () {
            if(!$scope.canAddTransformationToDocument()) {
                return;
            }

            checkTransformationTypes().
            then(addTransformationToDocument, showError);
        };

        $scope.onValidateTransformation = function () {
            if(!$scope.canAddTransformationToDocument()) {
                return;
            }
            $scope.error = undefined;
            $scope.footerMessage = undefined;
        // Call validate to validate the user-entered expression.
        // In case the expression is invalid, we show error near the footer
        // of the dialog, indicating the error.
            var responseData = validateExpression(
            $scope.transformationModel.table,
            $scope.transformationModel.expression
        ).then(
            function(response) {
                $scope.footerMessage = response ;
            },
            function(response) {
                var userAction = new UserAction(UserAction.EXPRESSION_VALIDATION);
                var errorData = alertService.getUserActionFailureAlertContent(userAction,
                    response);
                $scope.error = errorData;
            }
        );
        };

        $scope.getTransformationAssistantLink = function () {
            return sessionService.getETLExpressionAssistantUrl();
        };

        function checkTransformationTypes() {
            return util.getAggregatedPromise([
                getOldExpressionType,
                getExpressionType(
                $scope.transformationModel.table,
                $scope.transformationModel.expression
            )
            ]).then(function(response) {
                var oldType = response[0];
                var newType = response[1];
                if(!!oldType && oldType !== newType) {
                    return $q.reject({
                        oldType: oldType,
                        newType: newType
                    });
                }
            });
        }

        function addTransformationToDocument() {
            $scope.error = '';

            $scope.onUpsertTransform(
            _.extend(oldModel, $scope.transformationModel)
        );
            $scope.onDone();
        }

        function showError(types) {
            $scope.error = {
                message: strings.transformationEditor.TYPE_MISMATCH
                .assign(types.oldType, types.newType)
            };
        }

        // Checks if the expression name is valid.
        function isExpressionNameValid(name) {
            // Ensure that the expression name is as per INFA expectations.
            return new RegExp($scope.getValidator()).test(name);
        }

        function isCurrentTransformationValid() {
            if(!$scope.transformationModel.name ||
           !isExpressionNameValid($scope.transformationModel.name) ||
           !$scope.transformationModel.table ||
           !$scope.transformationModel.expression) {
                return false;
            }
            return true;
        }

        function getExpressionType(table, expression) {
            return dataManagementService.getFormattedExpression(
            $scope.dsMetadata.connectionType,
            $scope.dsMetadata.selectedConnection,
            table.name,
            expression
        ).
            then(function (response) {
                return response.data.expressionDataType;
            });
        }

        function validateExpression(table, expression) {
            return dataManagementService.validateTransformationExpression(
            $scope.dsMetadata.connectionType,
            $scope.dsMetadata.selectedConnection,
            table.name,
            expression
        );
        }

        $scope.init = function() {
            oldModel = $scope.transformation || {};
            $scope.transformationModel = _.cloneDeep(oldModel);

            $scope.updateColumnNames();
            $scope.props.selectedColumnName = ($scope.transformationModel.shouldCreateNewColumn)
            ? void 0
            : $scope.transformationModel.name;

            getOldExpressionType = ($scope.transformationModel.isExisting)
            ? getExpressionType(
                $scope.transformationModel.table,
                $scope.transformationModel.expression)
            : $q.when();
        };

        $scope.init();
    }]);
