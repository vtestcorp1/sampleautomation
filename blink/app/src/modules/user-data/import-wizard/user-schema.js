/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview UserSchema model class, used while importing user data.
 */

'use strict';

blink.app.factory('UserSchema', ['alertConstants',
    'jsonConstants',
    'Logger',
    'strings',
    'util',
    function(alertConstants,
         jsonConstants,
         Logger,
         strings,
         util) {

        var serverErrorCodeToMessage = strings.alert.importWizardAlertMessages.serverErrorCodeToMessage;
        var errorTypes = jsonConstants.userSchemaErrorTypes;
        var _logger = Logger.create('user-schema');

        function UserSchema(json) {
            this._json = json;
            this.status = json.status;
            this._schema = json.schema;
            this._errors = json.errors;
            this._parseErrors();
        }

        UserSchema.prototype.getColumns = function () {
            return this._schema ? this._schema.columns : null;
        };

        UserSchema.prototype.getKeys = function () {
            return this._schema ? this._schema.keys : null;
        };

        UserSchema.prototype.getSchemaJson = function () {
            return this._schema;
        };

        UserSchema.prototype.getRelationships = function () {
            return this._schema ? this._schema.relationships : null;
        };

        UserSchema.prototype.getPotentialRelationships = function () {
            return this._schema ? this.potentialRelationships : null;
        };

        UserSchema.prototype.getId = function () {
            return this._schema ? util.prop(this._schema, 'userData.header.id') : null;
        };


        UserSchema.isDataErrorType = function (error) {
            return error.type === errorTypes.validRows
            || error.type === errorTypes.invalidRows
            || error.type === errorTypes.rowError;
        };

        function getMessageForServerError(error) {
            var code = error && ((error.data && error.data.code) || error.errorCode);
            if (!code) {
                return strings.alert.importWizardAlertMessages.IRRECOVERABLE_ERROR;
            }

            if (serverErrorCodeToMessage.hasOwnProperty(code)) {
                return serverErrorCodeToMessage[code];
            }

            return strings.alert.importWizardAlertMessages.IRRECOVERABLE_ERROR;
        }

        UserSchema.prototype._parseErrors = function () {
            if (!this._errors || !this._errors.length) {
                return;
            }

            if (!this._irrecoverableErrorMsgs) {
                this._irrecoverableErrorMsgs = [];
            }

        // This function is a multi-pass iteration over the errors list.
        //
        // The assumption here is that the error codes are ordered in severity. That is, if there are irrecoverable
        // errors, they will appear before ignorable errors. If this assumption fails, then we will be incurring
        // the cost of traversing through entire list multiple times.
        // The cost can be tremendous if for example, the user data file had millions of rows with validation error.
            for (var i = 0; i < this._errors.length; ++i) {
                var error = this._errors[i];
                if (error.type === errorTypes.invalidFile) {
                    var message = getMessageForServerError(error);
                    this._irrecoverableErrorMsgs.push(message);
                }

                if (error.type === errorTypes.key || error.type === errorTypes.relationship) {
                    this._irrecoverableErrorMsgs.push(error.message);
                }

            // the structure of _errorColumns = {index : {errorCode : [messages]}}
                if (error.type === errorTypes.column) {
                    if (!this._errorColumns) {
                        this._errorColumns = {};
                    }
                    if (!this._errorColumns[error.indexOrCount]) {
                        this._errorColumns[error.indexOrCount] = {};
                    }
                    if (!angular.isDefined(this._errorColumns[error.indexOrCount][error.errorCode])) {
                        this._errorColumns[error.indexOrCount][error.errorCode] = [];
                    }
                    this._errorColumns[error.indexOrCount][error.errorCode].push(error.message);
                }

                if (error.errorCode === 'NUMBER_OF_VALID_ROWS') {
                    this._numValidRows = error.indexOrCount;
                }
                if (error.errorCode === 'NUMBER_OF_ERROR_ROWS') {
                    this._numErrorRows = error.indexOrCount;
                }

                if (error.type === errorTypes.invalidRows) {
                    if (!this._errorRows) {
                        this._errorRows = [];
                    }
                    this._errorRows.push({
                        lineNumber: error.indexOrCount,
                        errColIndexes: error.errorColumns,
                        row: error.row
                    });
                }
            }
        };

        UserSchema.prototype.hasIrrecoverableErrors = function () {
            return this._irrecoverableErrorMsgs && this._irrecoverableErrorMsgs.length > 0;
        };

        UserSchema.prototype.getIrrecoverableErrors = function () {
            return this._irrecoverableErrorMsgs;
        };

        UserSchema.prototype.getErrorRows = function () {
            if (!this._errorRows) {
                return [];
            }

            return this._errorRows.map(function (errorRow) {
                return errorRow.row;
            });
        };

        UserSchema.prototype.getErrorColumns = function () {
            return this._errorColumns || {};
        };

        UserSchema.prototype.isRowWithError = function (rowIndex) {
            if (!this._errorRows) {
                return false;
            }

            return rowIndex >= 0 && rowIndex < this._errorRows.length;
        };

        UserSchema.prototype.getLineNumber = function (rowIndex) {
            if (!this.isRowWithError(rowIndex)) {
                return -1;
            }

            return this._errorRows[rowIndex].lineNumber;
        };

        UserSchema.prototype.isCellWithError = function (rowIndex, colIndex) {
            if (!this.isRowWithError(rowIndex)) {
                return false;
            }

            var errorRow = this._errorRows[rowIndex];
            if (errorRow.errColIndexes.indexOf(colIndex) >= 0) {
                return true;
            }

        //a row can be erroneous because it has too few columns (SCAL-4031)
            return colIndex >= this._errorRows[rowIndex].row.length;
        };

        UserSchema.prototype.getCellError = function (rowIndex, colIndex) {
            if (!this.isCellWithError(rowIndex, colIndex)) {
                return '';
            }

        //a row can be erroneous because it has too few columns (SCAL-4031)
            if (colIndex >= this._errorRows[rowIndex].row.length) {
                return strings.alert.importWizardAlertMessages.MISSING_COLUMN_IN_ROW;
            }

            var dataValue = this._errorRows[rowIndex].row[colIndex];
            var schemaColumns = this.getColumns();

            if (!schemaColumns || colIndex >= schemaColumns.length) {
                _logger.error('Found value %s without column in schema definition', dataValue);
            }

            var dataType = schemaColumns[colIndex].dataType;

        // TODO(Shikhar) - Form a better error message. It would be nice to tell user what we recommend.
        // Currently can't do because type is tied to ng-model and hence COLUMN_TYPES[dataType] doesn't remain valid
            var message = '"' + dataValue + '" did not match the selected type',
                format = schemaColumns[colIndex].dateFormatStr;
            if (format) {
                message += ' ({1})'.assign(format.toLowerCase());
            }
            return message + '.';

        };

        UserSchema.prototype.isColumnWithError = function (colIndex) {
            return this._errorColumns && this._errorColumns[colIndex];
        };

    /**
     * Maps server error to user facing error message
     * @param errorCol
     * @returns {*}
     */
        function mapColumnServerError(errorCol) {
            var errorCode = Object.keys(errorCol)[0];
            if (serverErrorCodeToMessage.hasOwnProperty(errorCode)) {
                var msg = serverErrorCodeToMessage[errorCode];
                if (errorCode == 'DATE_FORMAT_AMBIGUOUS') {
                    var ambiguousFormatStr = errorCol[errorCode].map(function (format) {
                        return format;
                    }).join(', ');
                    msg += ambiguousFormatStr;
                }

                return msg;
            }
            return strings.alert.importWizardAlertMessages.IRRECOVERABLE_ERROR;
        }


        UserSchema.prototype.getColumnError = function (colIndex) {
            if (!this.isColumnWithError(colIndex)) {
                return '';
            }

            return mapColumnServerError(this._errorColumns[colIndex]);
        };

        UserSchema.prototype.getNumValidRows = function () {
            return this._numValidRows || 0;
        };

        UserSchema.prototype.getNumErrorRows = function () {
            return this._numErrorRows || 0;
        };

        UserSchema.prototype.getNumErrorColumns = function () {
            return this._errorColumns ? Object.keys(this._errorColumns).length : 0;
        };

        UserSchema.prototype.hasErrors = function () {
            return this._errors && this._errors.length > 0 && (this.getNumErrorRows() > 0 || this.getNumErrorColumns() > 0);
        };

        return UserSchema;

    }]);
