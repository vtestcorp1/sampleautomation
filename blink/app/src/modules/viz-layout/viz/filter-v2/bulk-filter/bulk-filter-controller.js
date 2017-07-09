/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Controller for UI for adding filter values in bulk.
 */

'use strict';

blink.app.factory('BulkFilterControllerV2', ['$q',
    'alertService',
    'blinkConstants',
    'strings',
    'CheckboxCollectionController',
    'csvParserService',
    'filterUtil',
    'Logger',
    'UserAction',
    'util',
    function ($q,
          alertService,
          blinkConstants,
          strings,
          CheckboxCollectionController,
          csvParserService,
          filterUtil,
          Logger,
          UserAction,
          util) {

        var _logger = Logger.create('bulk-filter-controller');

        var ONE_TIME_ADDITION_LIMIT = 500;
        var MAX_FILTER_VALUES = 1000;

        var CheckBoxItem = function(title, isChecked){
            this.title = title;
            this.isChecked = isChecked;
        };

        function parseEditorText(text){
            if (!text) {
                return {
                    values: []
                };
            }

            var parsedInfo = csvParserService.parse(text);
            if(!!parsedInfo.errors.length) {
                return {
                    errors: parsedInfo.errors
                };
            }
            else {
                var parsedValues;
                var parsedAsRows;
            // In the case we actually find line breaks we join the values by delimiter.
                if (parsedInfo.data.length > 1) {
                    parsedAsRows = true;
                    parsedValues = parsedInfo.data.map(function(valArray){
                        return valArray.join(parsedInfo.meta.delimiter);
                    });
                } else if (parsedInfo.data.length === 1){
                    parsedAsRows = false;
                    parsedValues = parsedInfo.data[0];
                } else {
                    _logger.error("Parsed values data empty.");
                    return {};
                }

                parsedValues = parsedValues.map(function(value){
                    return value.toLowerCase().trim();
                }).filter(function(value){
                    return !!value;
                });

                return {
                    values: parsedValues,
                    delimiter: parsedInfo.meta.delimiter,
                    linebreak: parsedInfo.meta.linebreak,
                    parsedAsRows: parsedAsRows
                };
            }
        }

        function matchValues(filterModel, values){
            return filterUtil.filterValuesMatchingFilterColumnValues(filterModel, values).
            then(function(validValues){
                validValues = validValues.map(function(value){
                    return value.toString();
                });
                var unmatchedValues = values.subtract(validValues);
                return {
                    matchedValues: validValues,
                    unmatchedValues: unmatchedValues
                };
            });
        }

        function createSelectedCheckboxArray(values){
            return values.map(function(value){
                return new CheckBoxItem(value, true);
            });
        }

        function EditorText(editorText){
            this.editorText = editorText;
        }

        EditorText.prototype.getEditorText = function(){
            return this.editorText;
        };

        function LimitErrors(oneTimeAdditionExceeded, filterValuesExceeded){
            this.oneTimeAdditionExceeded = oneTimeAdditionExceeded;
            this.filterValuesExceeded = filterValuesExceeded;
        }

        function CheckboxCollectionControllerWrapper (ctrl) {
            this.ctrl = ctrl;
        }

        function BulkFilterController(filterModel) {
            this.filterModel = filterModel;

            this.editorText = new EditorText('');
            this.validatedCheckboxValues = [];
            this.checkboxCollectionCtrl = new CheckboxCollectionControllerWrapper(null);
            this.unmatchedValues = [];
            this.invalidValueErrors = [];
            this.parsingErrors = [];
            this.loading = false;
            this.limitErrors = new LimitErrors(false, false);
        }

        BulkFilterController.prototype.evaluateLimitErrors = function() {
            var selectedCheckboxValues = this.validatedCheckboxValues.
            filter(function(checkboxItem){
                return checkboxItem.isChecked;
            });

            if (selectedCheckboxValues.length > ONE_TIME_ADDITION_LIMIT) {
                this.limitErrors.oneTimeAdditionExceeded = true;
            }
            var filterValuesMap = this.filterModel.getSelectedFilterItems();
            var filterValues = Object.keys(filterValuesMap);

            var uniqueValuesAfterFilterApplication =
            selectedCheckboxValues.map(function(checkboxItem){
                return checkboxItem.title;
            }).concat(filterValues).unique();

            if(uniqueValuesAfterFilterApplication.length > MAX_FILTER_VALUES) {
                this.limitErrors.filterValuesExceeded = true;
            }
        };

        BulkFilterController.prototype.onCheckboxItemToggle = function(title, isChecked, index) {
            this.validatedCheckboxValues[index].isChecked = isChecked;
            this.evaluateLimitErrors();
        };

        BulkFilterController.prototype.resetStateOnEditorTextProcessing = function() {
            this.parsingErrors.splice(0, this.parsingErrors.length);
            this.unmatchedValues.splice(0, this.unmatchedValues.length);
            this.invalidValueErrors.splice(0, this.invalidValueErrors.length);
            this.limitErrors.oneTimeAdditionExceeded = false;
            this.limitErrors.filterValuesExceeded = false;
        };

        BulkFilterController.prototype.processEditorText = function(clearValidValues){
            this.resetStateOnEditorTextProcessing();
            var parsedInfo = parseEditorText(this.editorText.editorText);
            if(!!parsedInfo.errors){
                this.parsingErrors = parsedInfo.errors;
                return;
            }
            var parsedAsRows = parsedInfo.parsedAsRows;
            var delimiter = parsedInfo.delimiter;
            var linebreak = parsedInfo.linebreak;
            var joinChar = parsedAsRows ? linebreak : delimiter;
            var values = parsedInfo.values;
            this.loading = true;
            var self = this;
            return matchValues(this.filterModel, values).
            then(function(matchedAndUnmatchedValues){
                if(clearValidValues){
                    self.validatedCheckboxValues =
                        createSelectedCheckboxArray(matchedAndUnmatchedValues.matchedValues);
                } else {
                    var validatedCheckboxValueNamesMap = util.mapArrayToBooleanHash(
                        self.validatedCheckboxValues,
                        function(checkboxItem){
                            return checkboxItem.title;
                        }
                    );

                    matchedAndUnmatchedValues.matchedValues.forEach(function(value){
                        if(!validatedCheckboxValueNamesMap.hasOwnProperty(value)){
                            var checkboxItem = new CheckBoxItem(value, true);
                            self.validatedCheckboxValues.push(checkboxItem);
                        }
                    });
                }

                var onChange = self.onCheckboxItemToggle.bind(self);
                self.checkboxCollectionCtrl.ctrl = new CheckboxCollectionController(
                    self.validatedCheckboxValues,
                    onChange
                );

                self.evaluateLimitErrors();

                Array.prototype.push.apply(
                    self.unmatchedValues,
                    matchedAndUnmatchedValues.unmatchedValues
                );
                self.editorText.editorText =
                    matchedAndUnmatchedValues.unmatchedValues.join(joinChar);
            }, function (response) {
                if (response.data.parameter) {
                    var invalidValues = response.data.parameter.join(joinChar);
                    var params = {
                        substitutions: {values: invalidValues}
                    };
                    var errorContent = alertService.getUserActionFailureAlertContent(
                        new UserAction(UserAction.FETCH_FILTER_DATA),
                        response,
                        params
                    );
                    self.invalidValueErrors.push(errorContent.message);
                }
                return $q.reject(response.data);
            }).
            finally(function(){
                self.loading = false;
            });
        };

        BulkFilterController.prototype.getTextAreaPlaceholderText = function() {
            return strings.bulkFilters.TEXT_AREA_PLACEHOLDER;
        };

        BulkFilterController.prototype.getErrorString = function() {
            return strings.bulkFilters.MATCH_ERROR.assign(this.unmatchedValues.length);
        };

        BulkFilterController.prototype.getInvalidValueError = function() {
            return this.invalidValueErrors[0];
        };

        BulkFilterController.prototype.getParsingErrorString = function() {
            return this.parsingErrors.join();
        };

        BulkFilterController.prototype.getOneTimeAdditionExceededLimitError = function () {
            return strings.bulkFilters.EXCEEDED_ONE_TIME_ADDITION.
            assign(ONE_TIME_ADDITION_LIMIT);
        };

        BulkFilterController.prototype.getFilterValuesExceededLimitError = function () {
            return strings.bulkFilters.EXCEEDED_OVERALL_FILTER_VALUES.
            assign(MAX_FILTER_VALUES);
        };

        BulkFilterController.prototype.getSelectedItems = function(){
            var selectedItems = {};
            this.validatedCheckboxValues.forEach(function(checkboxItem){
                if(checkboxItem.isChecked) {
                    selectedItems[checkboxItem.title] = true;
                }
            });

            var currentSelectedItems = this.filterModel.getSelectedFilterItems();
            $.extend(selectedItems, currentSelectedItems);
            return selectedItems;
        };

        BulkFilterController.prototype.containsErrors = function() {
            return this.limitErrors.oneTimeAdditionExceeded
            || this.limitErrors.filterValuesExceeded
            || this.unmatchedValues.length
            || this.parsingErrors.length
            || this.invalidValueErrors.length;
        };

        return BulkFilterController;
    }]);
