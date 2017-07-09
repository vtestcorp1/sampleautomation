/**
 *  Copyright: ThoughtSpot Inc. 2013
 *  Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 *  @fileoverview Controller for user data upload feature.
 */

'use strict';
/* eslint max-params: 1 */
blink.app.controller('ImportWizardController', ['$scope',
    '$q',
    '$route',
    '$timeout',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'strings',
    'dialog',
    'events',
    'jsonConstants',
    'Logger',
    'metadataService',
    'navAlertService',
    'navService',
    'safeApply',
    'sessionService',
    'UserAction',
    'userDataService',
    'UserSchema',
    'util',
    'Wizard',
    function ($scope,
          $q,
          $route,
          $timeout,
          alertConstants,
          alertService,
          blinkConstants,
          strings,
          dialog,
          events,
          jsonConstants,
          Logger,
          metadataService,
          navAlertService,
          navService,
          safeApply,
          sessionService,
          UserAction,
          userDataService,
          UserSchema,
          util,
          Wizard) {

        var _logger = Logger.create('import-wizard-controller');

    // List of error messages:
        var errorMessages = strings.alert.importWizardAlertMessages;
        var serverErrorCodeToMessage = strings.alert.importWizardAlertMessages.serverErrorCodeToMessage;

    /**
     * Given the error code from the server, maps it to user facing error messages
     * @param error
     * @returns {String} - the mapped client side error message
     */
        function getMessageForServerError(error) {
            var code = error && ((error.data && error.data.code) || error.errorCode);
            if (!code) {
                return errorMessages.IRRECOVERABLE_ERROR;
            }

            if (serverErrorCodeToMessage.hasOwnProperty(code)) {
                return serverErrorCodeToMessage[code];
            }

            return errorMessages.IRRECOVERABLE_ERROR;
        }

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;

        $scope.getColumns = function () {
            if (!$scope.userSchema) {
                return null;
            }

            return $scope.userSchema.getColumns();
        };

        $scope.getDataRows = function () {
            if (!$scope.userData || !$scope.userSchema) {
                return null;
            }

            return $scope.userData;
        };

        $scope.shouldShowDataTypeRow = function () {
            return $scope.userDataWizard.isCompletedStep(1) || $scope.existingDataId;
        };

        $scope.shouldOverwriteExistingData = function () {
            return $scope.uploadStep.dropExistingData === 'overwrite';
        };

    // Import wizard controller logic:
    // - create per step controller
    // - create a wizard

    /**
     *
     * This step allows user to upload a file, tell us if the uploaded file has header defined and send the file to
     * server to make the readColumns and getDataRows api calls.
     *
     * @return {Object} Configuration of the upload step.
     */
        function uploadStepController() {
        // configure scope properties needed by the step view.
            var uploadStep = $scope.uploadStep = {
                headerDefined: null,
                dropExistingData: null,
                separator: null
            };
            var _file;
            var csvSeparators = {
                COMMA: ',',
                SEMICOLON: ';',
                PIPE: '|',
                SPACE: ' ',
                TAB: '\t'
            };

        /**
         * @return {boolean}
         */
            function isFileUploaded() {
                return !!_file;
            }

            function onFileLoad(evt, file) {
                registerNavigationAlert();
                $scope.isWizardCancellable = true;
                _file = file;
            }

        /**
         * Callback on client side validation of file. We perform various checks on the client side like validating the
         * supported extension, etc.
         * @param {boolean} isSuccess
         * @param {Object} error - object with field 'message' which has the error message
         */
            var onFileUploadClientValidation = function (isSuccess, error) {
                if (isSuccess) {
                    $scope.errorRowMsg = '';
                } else {
                    $scope.errorRowMsg = error.message;
                }
            };

            uploadStep.getUploadWidgetConfig = function () {
                return {
                    onFileLoad: onFileLoad,
                    getExistingFileName: function () {
                        if (!!_file) {
                            return _file.name;
                        }
                    },
                    validFileExtensions: ['csv', 'xls', 'xlsx'],
                    onFileUploadClientValidation: onFileUploadClientValidation
                };
            };

            function initUploadStepState() {
                $scope.errorRowMsg = '';
                $scope.headerQuesNotAns = false;
                $scope.dropAppendQuesNotAns = false;
            }

        /**
         * @return {boolean}
         */
            function isHeaderQuestionAnswered() {
                return uploadStep.headerDefined === 'yes' || uploadStep.headerDefined === 'no';
            }

        /**
         *
         * @returns {boolean}
         */
            function isAppendDropQuestionAnswered() {
                return !$scope.existingDataId || uploadStep.dropExistingData === 'append' || uploadStep.dropExistingData === 'overwrite';
            }

        /**
         *
         * @return {boolean}
         */
            function hasHeaderRow() {
                if (uploadStep.headerDefined === 'yes') {
                    return true;
                }

                return false;
            }

        /**
         *
         * @return {string}
         */
            function getSeparator() {
                return csvSeparators[uploadStep.separator];
            }

            function readColumnsAndDataRows() {
                var deferred = $q.defer();

                initUploadStepState();

                if (!isFileUploaded()) {
                    $scope.errorRowMsg = errorMessages.NO_FILE_UPLOAD_ERROR;
                    deferred.reject();
                    return deferred.promise;
                }

                if (!isHeaderQuestionAnswered()) {
                    $scope.errorRowMsg = errorMessages.NO_HEADER_QUES_ANSWERED_ERROR;
                    $scope.headerQuesNotAns = true;
                }

                if (!isAppendDropQuestionAnswered()) {
                    $scope.errorRowMsg = errorMessages.NO_HEADER_QUES_ANSWERED_ERROR;
                    $scope.dropAppendQuesNotAns = true;
                }

                if ($scope.headerQuesNotAns || $scope.dropAppendQuesNotAns) {
                    deferred.reject();
                    return deferred.promise;
                }

                function onReadColumnsSuccess(data) {
                // Make the new schema visible on this scope.
                    $scope.userSchema = new UserSchema(data);
                // Now get the sampled data rows from the uploaded file based on the schema fetched in previous call to
                // readColumns.
                    var userAction = new UserAction(UserAction.FETCH_DATA_ROWS);
                    userDataService.getDataRows($scope.cacheGuid).then(function (response) {
                        var dataRows = response.data;
                        if (!dataRows.length) {
                            deferred.reject('No data rows found');
                            return;
                        }
                    // Make the data rows visible on this scope.
                        $scope.userData = dataRows;
                        $scope.errorRowMsg = '';
                        deferred.resolve();
                    }, function (response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        deferred.reject(response.data);
                    });
                }

            /**
             * the format of the schema returned by callosum for an existing user data table is different from
             * the one it returns for a new csv that is being cached for upload. we translate the existing data schema
             * json to make it compatible
             * @param cacheToken {string} cacheGuid for the data being uploaded
             * @param data {Object} schema json for an existing user data table
             */
                function getNewDataSchemaJSONFromExistingDataSchemaJSON(cacheToken, data) {
                    var columns = data.columns.map(function(column){
                        return {
                            logicalName: column.header.name,
                            dataType: column.dataType
                        };
                    });
                    return {
                        status: true,
                        schema: {
                            cacheToken: cacheToken,
                            columns: columns
                        },
                        errors: []
                    };
                }

                function onDataCacheSuccess(cacheGuid) {
                    $scope.cacheGuid = cacheGuid;

                //in case of append/overwrite the schema we show to the user is of the existing data and not the
                //one being uploaded
                    var userAction;
                    if ($scope.existingDataId) {
                        userAction = new UserAction(UserAction.FETCH_SCHEMA);
                        metadataService.getMetadataObjectDetails(
                        jsonConstants.metadataType.LOGICAL_TABLE,
                        $scope.existingDataId
                    ).then(function(response) {
                        var data = response.data;
                        var userSchemaJSON = getNewDataSchemaJSONFromExistingDataSchemaJSON(cacheGuid, data);
                        onReadColumnsSuccess(userSchemaJSON);
                    }, function(response) {
                        $scope.errorRowMsg = getMessageForServerError(response);
                        deferred.reject(response.data);
                    });
                    } else {
                        userAction = new UserAction(UserAction.READ_COLUMNS);
                        userDataService.readColumns(cacheGuid)
                        .then(function(response) {
                            onReadColumnsSuccess(response.data);
                            return response.data;
                        }, function(response) {
                            $scope.errorRowMsg = getMessageForServerError(response);
                            deferred.reject(response.data);
                        });
                    }
                }

                function loadFile() {
                // First read columns from the uploaded file.
                    var userAction = new UserAction(UserAction.CACHE_DATA);
                    userDataService.cacheData(_file, hasHeaderRow(), getSeparator())
                    .then(function(response) {
                        return response.data;
                    }, function(response) {
                        $scope.errorRowMsg = getMessageForServerError(response);
                        deferred.reject(response.data);
                    })
                    .then(onDataCacheSuccess);
                    return true;
                }

                if ($scope.shouldOverwriteExistingData()) {
                    dialog.show({
                        title: 'Attention!',
                        message: 'You have chosen to overwrite your existing data. This cannot be undone. Are you sure?',
                        onConfirm: function () {
                            loadFile();
                            return true;
                        },
                        cancelCbOnClose: true,
                        onCancel: function () {
                            deferred.reject();
                        }
                    });
                } else {
                //file load can take a lot of CPU if the file is big, causing the preceding UI changes (like showing
                //"loading" overlay) to block, we add a small delay to allow all those actions to finish
                    $timeout(function(){
                        loadFile();
                    }, 500);

                }

                return deferred.promise;
            }

        // return the step config for wizard.
            return {
                title: 'Upload your file',
                contentUrl: 'src/modules/user-data/import-wizard/import-wizard-step-1.html',
                footerUrl: 'src/modules/user-data/import-wizard/import-wizard-footer-step-1.html',

            // Proceed instructions aren't used anymore in user data flow. This needs to be removed eventually by vibhor or shikhar.
                getProceedInstructions: function () {
                    if (!isFileUploaded()) {
                        return 'To proceed, please upload a .csv file containing your data.';
                    } else if (!isHeaderQuestionAnswered()) {
                        return 'Success! Now indicate whether the uploaded file contains column names.';
                    }

                    return '';
                },

                getNextStepPromise: readColumnsAndDataRows,
                onBack: function() {
                    initUploadStepState();
                },
                onRevisitFromNextStep: function() {
                    initUploadStepState();
                }
            };
        }

    /**
     *
     * This step requires users to provide unique names to each column in the uploaded table.
     *
     * @return {Object} Configuration of the column name step.
     */
        function nameStepController() {
            var nameStep = $scope.nameStep = {},
        // For columns with non-unique or empty names, it stores name: true mapping
                invalidColName = {},
        // This indicates whether the user has clicked the Next button
                isNextClicked = false,
        // Key for invalid entry if the name is empty or null
                __NULL_OR_EMPTY_COL_NAME__ = '__NULL_OR_EMPTY_COL_NAME__';

        /**
         * True if the column name is non-unique or undefined in the table
         */
            $scope.isInvalidColName = function (name) {
                if (!name) {
                    return isNextClicked && invalidColName[__NULL_OR_EMPTY_COL_NAME__];
                }

                return !!invalidColName[name.toLowerCase().trim()];
            };

            nameStep.getColumns = function () {
                if (!$scope.userSchema) {
                    return null;
                }

                return $scope.userSchema.getColumns();
            };

            nameStep.getDataRows = function () {
                if (!$scope.userData || !$scope.userSchema) {
                    return null;
                }

                return $scope.userData;
            };

            function initNameStepState() {
                $scope.errorRowMsg = '';
                invalidColName = {};
            }

        /**
         * Resolves if all the column names are valid, else shows an error.
         */
            function nameStepPromise() {
                var deferred = $q.defer();
                isNextClicked = true;

                initNameStepState();

                if (!hasUniqueColumnNames()) {
                    if (!!Object.keys(invalidColName).length) {
                        $scope.errorRowMsg = errorMessages.INVALID_COL_NAMES_ERROR;
                    }
                    deferred.reject();
                } else {
                    deferred.resolve();
                }

                return deferred.promise;
            }


        /**
         * Tests if the table has all the column names unique.
         * This is case-insensitive because of sage drop-down.
         *
         * @returns {boolean}
         */
            function hasUniqueColumnNames() {
                if (!$scope.userSchema || !$scope.userSchema.getColumns() || !$scope.userSchema.getColumns().length) {
                    return false;
                }

                var uniqueNamesSeen = {},
                    hasFullySpecifiedUniqueNames = true;

                $scope.userSchema.getColumns().forEach(function (col, index) {
                // Flag the test variable to false if this column's name matches up with one we have seen before.
                    hasFullySpecifiedUniqueNames = hasFullySpecifiedUniqueNames && !!col.logicalName &&
                    col.logicalName.trim() && !uniqueNamesSeen.hasOwnProperty(col.logicalName.toLowerCase().trim());
                // Also record this column's name in a seen name hash.
                    if (!!col.logicalName) {
                        var nameLwrCase = col.logicalName.toLowerCase().trim();
                        if (uniqueNamesSeen.hasOwnProperty(nameLwrCase)) {
                            invalidColName[nameLwrCase] = true;
                        }

                        uniqueNamesSeen[nameLwrCase] = true;
                    } else {
                    // Null or empty string is also invalid
                        invalidColName[__NULL_OR_EMPTY_COL_NAME__] = true;
                    }
                });

                return hasFullySpecifiedUniqueNames;
            }

        // Proceed instructions aren't used anymore in user data flow. This needs to be removed eventually by vibhor or shikhar.
            return {
                title: 'Set column names',
                contentUrl: 'src/modules/user-data/import-wizard/import-wizard-step-2.html',
                proceedInstructions: 'Name the columns in the uploaded file. Remember, the column names must be unique.',
                getNextStepPromise: nameStepPromise,
                onBack: function () {
                    initNameStepState();
                    isNextClicked = false;
                },
                onRevisitFromNextStep: function() {
                    initNameStepState();
                    isNextClicked = false;
                }
            };
        }


        function updateDataStepController() {
            var updateDataStep = $scope.updateDataStep = {},
                numAttempts = 0;
            $scope.isInvalidColName = function (name) {
                return false;
            };

            function initUpdateDataStepState() {
                $scope.errorRowMsg = '';
                numAttempts = 0;
            }

            function onLoadDataSuccess(data, deferred) {
                var oldUserSchema = $scope.userSchema,
                    userSchema = $scope.userSchema = new UserSchema(data);
            // If there were no errors during the read keys phase, we can proceed with the workflow.
                if (userSchema.status) {
                    deferred.resolve();
                    $scope.confirmationScreen = true;
                    return;
                }

                if (userSchema.hasIrrecoverableErrors()) {
                    $scope.errorRowMsg = userSchema.getIrrecoverableErrors()[0];
                    deferred.reject();
                    return;
                }

            // Check if there is any column level error. We do not let the user to proceed if there is any column
            // level error.
                if (userSchema.getNumErrorColumns() > 0) {
                    $scope.errorRowMsg = errorMessages.INVALID_COL_TYPES_ERROR;
                    deferred.reject();
                    return;
                }

                $scope.errorRowMsg = errorMessages.INVALID_COL_DATA_ERROR;

            //in case of invalid file loadData call does not return any rows as error rows. we use the older row
            //data we have show that the user can figure out why the file is invalid (e.g. one column is missing)
            //$scope.userData = userData;

                numAttempts++;

            //there were errors even after forceLoad
                if (numAttempts > 2) {
                    deferred.reject();
                    $scope.errorScreen = true;
                    return;
                }

                if (numAttempts <= 1) {
                    deferred.reject();
                    return;
                }

            // If we have already warned them, show a confirmation dialog before proceeding.
                dialog.show({
                    title: 'Attention!',
                    message: 'You have chosen to ignore data validation errors. This can not be undone. Are you sure you want to proceed anyway?',
                    onConfirm: function () {
                        loadData(deferred, true);
                        return true;
                    },
                    cancelCbOnClose: true,
                    onCancel: function () {
                        deferred.reject();
                    }
                });

            }

            function loadData(deferred, forceLoad) {
                var dropExistingData = $scope.shouldOverwriteExistingData();

                var userAction = new UserAction(UserAction.LOAD_DATA);
                userDataService.loadData(
                $scope.existingDataId,
                $scope.cacheGuid,
                forceLoad,
                dropExistingData
            ).then(function(response) {
                var data = response.data;
                onLoadDataSuccess(data, deferred);
            }, function(response){
                alertService.showUserActionFailureAlert(userAction, response);
                deferred.reject(response.data);
            });
            }

        /**
         * Resolves if all the column names are valid, else shows an error.
         */
            function updateDataStepPromise() {
                var deferred = $q.defer();
                loadData(deferred, false);
                return deferred.promise;
            }

        // Proceed instructions aren't used anymore in user data flow. This needs to be removed eventually by vibhor or shikhar.
            return {
                title: 'Preview & import data',
                contentUrl: 'src/modules/user-data/import-wizard/import-wizard-step-2.html',
                proceedInstructions: 'Add the new data to the existing data',
                getNextStepPromise: updateDataStepPromise,
                onBack: function () {
                    initUpdateDataStepState();
                },
                onRevisitFromNextStep: function() {
                    initUpdateDataStepState();
                }
            };
        }

        var COLUMN_TYPES = {
            UNKNOWN: 'Select type',
            BOOL: 'TRUE/FALSE',
            INT32: 'INTEGER',
            INT64: 'LARGE INTEGER',
            DOUBLE: 'DECIMAL',
            VARCHAR: 'TEXT',
            DATE: 'DATE',
            DATE_TIME: 'DATE_TIME',
            TIME: 'TIME'
        };
        var EXAMPLE_OF_COLUMN_TYPES = {
            UNKNOWN: '',
            BOOL: 'True',
            INT32: '50',
            INT64: '2147483648',
            DOUBLE: '9.5',
            VARCHAR: '"John Doe"',
            DATE: '12/31/1999',
            TIME: '01:32:33'
        };

        $scope.getLabelForColumnDataType = function (columnDataType) {
            return COLUMN_TYPES[columnDataType];
        };

        function typeStepController() {
            var columnTypes = [];
            angular.forEach(COLUMN_TYPES, function(value, key) {
                this.push({id: key, name: value});
            }, columnTypes);
            var typeStep = $scope.typeStep = {
                columnTypes: columnTypes
            };
        // This stores the column index whose type in not specified
            var unknownColumnTypes = {};

        /**
         * Given an index which is the column index in the userSchema, tells if its type is valid.
         * @param index
         * @returns {boolean}
         */
            $scope.isInvalidColType = function (index) {
                if (!$scope.userSchema) {
                    return !!unknownColumnTypes[index];
                }

                return !!unknownColumnTypes[index] || $scope.userSchema.getErrorColumns()[index];
            };

        // HACK(vibhor): Since we currently use the html select element to show the data type selections and we want
        // to show different text based on whether the select dropdown is open or not.
        // In order to achieve this, we bind to mouseup/down event on select (different browser bind to different events).
        // We also bind to document mousedown/up to detect if the select is closed.
        // This is NOT a foolproof solution (tab-key navigation won't work).
            typeStep.selectOpened = function (column) {
                typeStep._columnWithSelectOpen = column.logicalName;
            };

            typeStep.selectClosed = function () {
                typeStep._columnWithSelectOpen = null;
            };

            function resetColumnWithSelectOpen() {
                typeStep.selectClosed();
                safeApply($scope);
            }
            $(document).mouseup(resetColumnWithSelectOpen)
            .mousedown(resetColumnWithSelectOpen);

            $scope.$on('$destroy', function () {
                $(document).unbind('mouseup', resetColumnWithSelectOpen);
                $(document).unbind('mousedown', resetColumnWithSelectOpen);
            });
            typeStep.getTypeLabel = function (type, column) {
                if (typeStep._columnWithSelectOpen !== column.logicalName || type === 'UNKNOWN') {
                    return $scope.getLabelForColumnDataType(type);
                }

                return $scope.getLabelForColumnDataType(type) + ', e.g. ' + EXAMPLE_OF_COLUMN_TYPES[type];
            };

            function initTypeStepState() {
                $scope.errorRowMsg = '';
                unknownColumnTypes = {};
                if ($scope.userSchema) {
                    $scope.userSchema._errorRows = [];
                    $scope.userSchema._errorColumns = {};
                }
            }

        /**
         * Client side checking of column types. This basically checks if all the column types are defined.
         * @return {boolean}
         */
            function hasAllColumnTypesSpecified() {
                if (!$scope.userSchema || !$scope.userSchema.getColumns() || !$scope.userSchema.getColumns().length) {
                    return false;
                }

                var hasAllTypesSpecified = true;
                $scope.userSchema.getColumns().forEach(function (col, index) {
                    hasAllTypesSpecified = hasAllTypesSpecified &&
                    !!col.dataType && col.dataType !== 'UNKNOWN';
                    if (!col.dataType || col.dataType === 'UNKNOWN') {
                        unknownColumnTypes[index] = true;
                    }
                });

                return hasAllTypesSpecified;
            }

            function createTable(deferred) {
                var userAction = new UserAction(UserAction.CREATE_TABLE);
                userDataService.createTable($scope.userSchema.getSchemaJson(), true)
                .then(function (response) {
                    var data = response.data;
                    var userSchema = $scope.userSchema = new UserSchema(data);
                    if (!userSchema.status) {
                        $scope.errorScreen = true;
                        deferred.reject();
                        return;
                    }
                    $scope.confirmationScreen = true;
                    deferred.resolve();
                }, function (response) {
                    $scope.errorScreen = true;
                    $scope.systemError = response.data;
                    alertService.showUserActionFailureAlert(userAction, response);
                    deferred.reject(response.data);
                });

                return deferred.promise;
            }


            var nextStepAttempt = 0,
                proceedInstructions = '';
            function readKeysAndCreateTable() {
                var deferred = $q.defer();

                initTypeStepState();

                if (!hasAllColumnTypesSpecified()) {
                    nextStepAttempt = 0;
                    if (!!Object.keys(unknownColumnTypes).length) {
                        $scope.errorRowMsg = errorMessages.EMPTY_COL_TYPES_ERROR;
                    }
                    deferred.reject();
                    return deferred.promise;
                }

                nextStepAttempt++;

                var userAction = new UserAction(UserAction.READ_KEYS);
                userDataService.readKeys($scope.userSchema.getSchemaJson()).then(function (response) {
                    var data = response.data;
                    var userSchema = $scope.userSchema = new UserSchema(data);
                // If there were no errors during the read keys phase, we can proceed with the workflow.
                    if (userSchema.status && !userSchema.hasErrors()) {
                        createTable(deferred);
                        return;
                    }

                    if (userSchema.hasIrrecoverableErrors()) {
                        $scope.errorRowMsg = 'Irrecoverable errors found. Please start again.';
                    // Format $scope.userSchema._irrecoverableErrorMsgs
                        deferred.reject();
                        return;
                    }

                // Proceed instructions aren't used anymore in user data flow. This needs to be removed eventually by vibhor or shikhar.
                // Check if there is any column level error. We do not let the user to proceed if there is any column
                // level error.
                    if (userSchema.getNumErrorColumns() > 0) {
                        $scope.errorRowMsg = errorMessages.INVALID_COL_TYPES_ERROR;
                        proceedInstructions = 'Please address the errors before proceeding';
                        nextStepAttempt--;
                        deferred.reject();
                        return;
                    }

                    $scope.errorRowMsg = errorMessages.INVALID_COL_DATA_ERROR;
                    $scope.userData = userSchema.getErrorRows();
                    util.executeInNextEventLoop(function(){
                        $scope.scrollToFirstErrorCell();
                    });

                // If there were data validation errors detected at this step and user has not been warned, warn them.
                    if (nextStepAttempt <= 1) {
                        deferred.reject();
                        return;
                    } else {
                    // If we have already warned them, show a confirmation dialog before proceeding.
                        dialog.show({
                            title: 'Attention!',
                            message: 'You have chosen to ignore data validation errors and proceed further. This can ' +
                            'not be undone. Are you sure?',
                            cancelCbOnClose: true,
                            onConfirm: function () {
                                createTable(deferred);
                                return true;
                            },
                            onCancel: function () {
                                deferred.reject();
                            }
                        });
                    }
                }, function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                });

                return deferred.promise;
            }

        // Proceed instructions aren't used anymore in user data flow. This needs to be removed eventually by vibhor or shikhar.
            return {
                title: 'Set column types',
                contentUrl: 'src/modules/user-data/import-wizard/import-wizard-step-2.html',
                getProceedInstructions: function () {
                    return proceedInstructions || 'Determine how each column value should be interpreted.';
                },
                getNextStepPromise: readKeysAndCreateTable,
                onBack: function () {
                    nextStepAttempt = 0;
                    initTypeStepState();
                },
                onRevisitFromNextStep: function() {
                    nextStepAttempt = 0;
                    initTypeStepState();
                }
            };
        }

        $scope.confirmationScreen = false;
        $scope.errorScreen = false;
        $scope.errorRowMsg = '';
        $scope.systemError = '';
        $scope.nextBtnLabel = 'Next';

        $scope.getUserColumnName = function (col) {
            col = col.length ? col[0] : col;
            return col && col.logicalName;
        };

    //in case of updating an existing user data object, the id of the existing data object is passed as the "id" url
    //parameter
        $scope.existingDataId = ($route.current && $route.current.pathParams.existingDataId) || null;
        $scope.cacheGuid = null;

        $scope.isWizardCancellable = false;
        var steps;
        if ($scope.existingDataId) {
            steps = [uploadStepController(), updateDataStepController()];
        } else {
            steps = [uploadStepController(), nameStepController(), typeStepController()];
        }
        $scope.userDataWizard = new Wizard(steps);

        $scope.getLogicalColumnName = function (logicalCol) {
            if (!logicalCol || !logicalCol.header) {
                return '';
            }

            return logicalCol.header.name;
        };

        var confirmationDialogMessages = {
            title: 'Abort data import',
            message: 'Are you sure you want to abort data import?',
            cancelBtnLabel: 'Stay here',
            confirmBtnLabel: 'Yes, abort'
        };

        var confirmedAborting = false;

        function generateAbortDialogConfig(onConfirmationActionCb) {
            return angular.extend({}, confirmationDialogMessages, {
                onConfirm: function () {
                    if (!!$scope.userSchema) {
                        var userAction = new UserAction(UserAction.ABORT_CREATE_TABLE);
                        userDataService.abortCreateTable($scope.cacheGuid).then(
                        angular.noop,
                        function(response) {
                            alertService.showUserActionFailureAlert(userAction, response);
                            return $q.reject(response.data);
                        }
                    );
                        $scope.resetWizard();
                    }
                    confirmedAborting = true;
                    onConfirmationActionCb();
                    return true;
                }
            });
        }

        $scope.onCancel = function () {
            var abortDialogConfig = generateAbortDialogConfig(function () {
                navService.goToImportedData();
            });
            dialog.show(abortDialogConfig);
        };

        $scope.selectSourceAndGoToAnswer = function() {
            sessionService.setSageDataSource([$scope.userSchema.getId()]);
            navService.goToAnswer();
        };

        $scope.goToLinkingView = function () {
            navService.goToDataLinking($scope.userSchema.getId());
        };

        function shouldWarnOnNavigation() {
            if (confirmedAborting) {
                return null;
            }

            if (angular.isDefined($scope.confirmationScreen) && $scope.confirmationScreen) {
                return null;
            }

            if (angular.isDefined($scope.errorScreen) && $scope.errorScreen) {
                return null;
            }

            var abortDialogConfig = generateAbortDialogConfig(angular.noop);
            return abortDialogConfig;

        }

        function registerNavigationAlert() {
            var navAlertDeregisterer = navAlertService.registerListener(shouldWarnOnNavigation);
            $scope.$on('$destroy', function () {
                navAlertDeregisterer();
            });
        }

        $scope.resetWizard = function () {
            $scope.userDataWizard.reset();
            $scope.confirmationScreen = false;
            $scope.errorScreen = false;
            $scope.errorRowMsg = '';
            $scope.systemError = '';
            $scope.nextBtnLabel = 'Next';
        };
        $scope.$on(events.USERDATA_IMPORT_BTN_CLICKED_D, $scope.resetWizard);
    }]);
