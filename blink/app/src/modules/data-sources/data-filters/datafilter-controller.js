/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Ashish Shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview controller for data-filter management
 */

'use strict';


blink.app.controller("BlinkDataFilterController", ['$scope',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'ListModel',
    'listUtils',
    'userDialogs',
    'util',
    function($scope,
         blinkConstants,
         strings,
         jsonConstants,
         ListModel,
         listUtils,
         userDialogs,
         util) {

    //region  GLOBALS
        $scope.dataFilterConstantTexts = strings.dataFilter;
        var FILTER_TYPES_KEYS = _.keys(blinkConstants.dataFilter.FILTER_TYPES);
        var FILTER_TYPES = blinkConstants.dataFilter.FILTER_TYPES;

        var datePickerDataTypes = [
            'DATE'
        ];

        var tableNames = $scope.tables.map(function(table) {
            return table.name;
        });

    //endregion

    //region UI Methods

        $scope.isFilterNotDefined = function() {
            return $scope.filters.length === 0;
        };

        $scope.showDataFilterPopup =function (row) {
            var config = getAddFilterConfig();
            if(!!row && row.config) {
                $.extend(config, row.config);
                setColumnsForTable(config.name, config.columns);
            }
            userDialogs.showDataFilterDialog(
            config,
            upsertDataFilter.bind(null, row)
        );
        };
    //endregion

    //region Helping methods

        $scope.filters.forEach(function(filter) {
            filter.onClick = $scope.showDataFilterPopup;
        });

        function upsertDataFilter(row, config) {
            if(!row) {
                row = {};
                $scope.filters.push(row);
            }
            $.extend(row, {
                values: {
                    name: config.config.name,
                    column: config.config.column,
                    option: config.config.option,
                    text: config.config.text
                },
                config: config.config,
                onClick: $scope.showDataFilterPopup
            });
        }


        function deleteDataFilters(rows) {
            rows.forEach(function (row) {
                deleteFilter(row);
            });
        }

        function deleteFilter(row) {
            $scope.filters.remove(function (filter) {
                return filter === row;
            });
        }

        function setColumnsForTable(table, columns) {
            if(columns[table]) {
                return;
            }
            $scope.getTableColumns(table).
            then(function (fields) {
                columns[table] = fields;
            });
        }

        function getAddFilterConfig () {
            return {
                options : FILTER_TYPES_KEYS,
                tables : tableNames,
            // selectedTable : tableNames[0],
                columns : {},
                onChange: setColumnsForTable,
                isValidFilter: function (values) {
                    var isValidText = !this.isTextRequired(values.option) || !!values.text;
                    return !!values.column && !!values.option && isValidText;
                },
                isTextRequired: function (selectedOption) {
                    return !!selectedOption
                    && !FILTER_TYPES[selectedOption].noText;
                },
                isDateType: function (column) {
                    return datePickerDataTypes.any(column.dataType);
                },
                getPlaceholderValue: function (column) {
                    if(Object.has(strings.filterInputDataType, column.dataType)) {
                        return strings.filterInputDataType[column.dataType];
                    }
                    return strings.filterInputDataType.DEFAULT_PLACE_HOLDER;
                }
            };
        }
    //endregion

    //region UI configurations
        var columns = [
            listUtils.columns.dataFilterTableCol,
            listUtils.columns.dataFilterFieldCol,
            listUtils.columns.dataFilterOptionCol,
            listUtils.columns.dataFilterTextCol
        ];
        var filterFunction = function(row, filterText) {
            if (!filterText || !filterText.length) {
                return true;
            }

            var regex = new RegExp(filterText.escapeRegExp(), 'gi');
            return !!row.values.name.match(regex);
        };

        $scope.listModel = new ListModel(columns, $scope.filters, filterFunction, void 0, true);

        $scope.onRowClick = $scope.showDataFilterPopup;

        var deletionActionButton = {
            icon: blinkConstants.metadataListPage.actions.delete.icon,
            text: strings.metadataListPage.actions.delete.text,
            onClick: deleteDataFilters,
            isEnabled: function(rows) {
                return rows.length > 0;
            }
        };

        $scope.actionItems = [deletionActionButton];
    //endregion
    }]);
