/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Rules regarding data modelling.
 */

'use strict';

blink.app.factory('dataRuleService', ['dataRulesJson',
    'blinkConstants',
    'strings',
    'util',
    function (dataRulesJson,
              blinkConstants,
              strings,
              util) {

        /**
         *  Get options for the select box of a particular property dependant
         *  on other selected values according to the rule json
         *  @param {string} property: property we need options for
         *  @param {Array} columnValues: Array containing all row values
        */
        function getEnumOptions(property, columnValues) {
            var rules = dataRulesJson.table.columns[property];
            if(!rules || rules.type != 'enum') {
                return null;
            }
            var options = rules.allValues;
            // Here we try to find an intersection of allValues with the
            // valid values given all satisfying conditions.
            if(rules.filterValues) {
                rules.filterValues.forEach(function (filter) {
                    // using Array.prototype.some to short circuit on the first matched target value.
                    filter.values.some(function (value) {
                        var currentValue = columnValues[filter.dependsOn];

                        if (util.contains(value.dependeeValue, currentValue)){
                            // DependeeValue matched, take intersection and return true to short circuit.
                            options = options.intersect(value.validValues);
                            return true;
                        }
                    });
                });
            }
            return options;
        }

        /**
         *  Get options for the boolean of a particular property dependant
         *  on other selected values according to the rule json
         *  @param {string} property: property we need options for
         *  @param {Array} columnValues: Array containing all row values
         */
        function getBoolOption(property, columnValues) {
            var rules = dataRulesJson.table.columns[property];
            if(!rules || rules.type != 'boolean') {
                return null;
            }
            var option = null;
            // Instead of an intersection here, we just need to return a true/false
            // value based on the dependee Target.
            if(rules.filterValues) {
                rules.filterValues.forEach(function (filter) {
                    filter.values.some(function (value) {
                        var currentValue = columnValues[filter.dependsOn];

                        if (util.contains(value.dependeeValue, currentValue)) {
                            option = value.validValues[0];
                            return true;
                        }
                    });
                });
            }
            return option;
        }

        function setValidValue(value) {
            if(value.validValues.length === 1) {
                // In case there is only one valid value just set that.
                return value.validValues[0];
            } else {
                // in case of multiple valid values, ask the user to give a choice.
                return strings.metadataExplorer.selectValueMessage;
            }
        }

        /**
         * When a field value is set using the UI, we might need to change the
         * values of other fields depending on the new value, this function does
         * exactly that
         *
         * We directly modify the row object passed here, slickgrid takes care
         * of updating itself.
         *
         * @param property: the property changed
         * @param newVal: the new value of the property
         * @param row : the row object in the context.
         */
        function setNewProperties(property, newVal, row) {
            // For each item in the row, check which might need updating
            // according to the rules defined.
            Object.keys(row).forEach(function(column) {
                var field = dataRulesJson.table.columns[column];
                var filters = field && field.filterValues;
                if(!filters) {
                    // If filters are not defined, means this field is not dependant
                    // on anything. we should be good.
                    return;
                }
                // as there is only one entry per dependsOn target field, we can short
                // circuit once we have matched.
                filters.some(function(filter) {
                    if(filter.dependsOn === property) {
                        // Now try to match a target value.
                        filter.values.some(function(value) {
                            // This condition says that a target value is matched to the newValue,
                            // Also, the currentValue in that field is not one of the valid values for this new target.

                            if(util.contains(value.dependeeValue, newVal) && value.validValues.none(row[column])) {
                                // Set the new Valid value
                                row[column] = setValidValue(value);
                                // Recursively calling this again to take into affect this setting of a new value.
                                setNewProperties(column, row[column], row);
                                return true;
                            }
                        });
                        return true;
                    }
                });
            });
            row[property] = newVal;
        }

        return {
            getEnumOptions: getEnumOptions,
            getBoolOption: getBoolOption,
            setNewProperties: setNewProperties
        };
    }

]);
