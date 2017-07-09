/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Model for encapsulating table visualization details.
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('enableQoQ', 'This flag enables query on query', false);

blink.app.factory('TableModel', ['blinkConstants',
    'strings',
    'jsonConstants',
    'Logger',
    'VisualizationModel',
    'tableUtil',
    'util',
    function (blinkConstants,
          strings,
          jsonConstants,
          Logger,
          VisualizationModel,
          tableUtil,
          util) {

        var _logger = Logger.create('table-model');

    /**
     * @constructor
     */
        var TableModel = function (params) {
            TableModel.__super.call(this, params);
        // Flag used to track data processing errors
            this._hasError = false;

        // A mapping of column id to column objects
            this._vizColumnsMap = {};

            this._vizColumnsMap = util.mapArrayToHash(this.getVizColumns(), function(col){
                return col.getSageOutputColumnId();
            });

            this._parseData(this.getJson());
        };

        util.inherits(TableModel, VisualizationModel);

        TableModel.prototype.updateData = function (newVizData) {
            TableModel.__super.prototype.updateData.call(this, newVizData);
            this._parseData(this.getJson());
        };

    /**
     * @param {Object} vizContent
     * @param {Object} vizData
     *
     * Validate vizJson and vizData and populate the model
     */
        TableModel.prototype._parseData = function (vizContent) {
            var processingProfileMsg = Logger.ProfileMessages.TABLE_VIZ_PROCESSING_PREAMBLE + ' \'' + this.getName() + '\'';
            _logger.time(processingProfileMsg);

            var vizData = this._vizData;

            if (!vizData) {
                this._hasError = true;
                return;
            }

            if (!vizContent || !vizContent.columns) {
                this._hasError = true;
                return;
            }

            this._hasError = false;
            var self = this;
            this._vizColumns.each(function(vizCol){
                var dataRowIndex = vizCol.getDataRowIndex();
                var colData = self.getColumnData(dataRowIndex);
                vizCol.setData(colData);
            });

            _logger.timeEnd(processingProfileMsg);
        };

    /**
     * @return {boolean}
     *
     * Whether there has been any errors during data processing
     */
        TableModel.prototype.hasError = function () {
            return this._hasError;
        };

    /**
     * @param {string} effectiveColId
     * @return {VisualizationColumnModel}
     */
        TableModel.prototype.getColumn = function (effectiveColId) {
            return this._vizColumnsMap[effectiveColId];
        };

        TableModel.prototype.getData = function () {
            if (!this._vizData || !this._vizData.data) {
                return null;
            }

            return this._vizData.data;
        };

        TableModel.prototype.hasNoData = function () {
            var data = this.getData();
            return !data || data.length === 0;
        };

    /**
     * Set the table title to a given value.
     *
     * @type {string} title     The new table title
     */
        TableModel.prototype.setVizTitle = function (title) {
            this.setTitle(title);
        };

        function getSlickGridModel(columns, data) {
            return {
                columns: columns.map(function (vizCol, i) {
                    var fid = 'f' + i,
                        effectiveColId = vizCol.getSageOutputColumnId(),
                        colTitle = vizCol.getName();

                    return {
                        id: effectiveColId,
                        name: colTitle,
                        headerCssClass: vizCol.isNumeric() ? 'bk-numeric-column' : '',
                        cssClass: vizCol.isNumeric() ? 'bk-numeric-column' : '',
                        formatter: function (row, cell, value) {
                            return ((vizCol.getDataFormatter()(vizCol.convertValueFromBackend(value), {
                                noShorten: true
                            })) + '').escapeHTML();
                        },
                        field: fid
                    };
                }),
                data: data.map(function (dataRow) {
                    var dataObject = {};
                    dataRow.each(function (dataCell, i) {
                        dataObject['f' + i] = dataCell;
                    });
                    return dataObject;
                })
            };
        }

        TableModel.prototype.splitIntoSlickGridModelForDisambiguation = function () {
            var tableColumns = this.getVizColumns(),
                totalColumns = tableColumns.length;

            var firstTableColIndexes = {};
            var secondTableColIndexes = {};
            var firstTableColumns = tableColumns.filter(function (tableCol, idx) {
                if (!tableCol.isMarkedForDisambiguation()) {
                    firstTableColIndexes[idx] = true;
                    return true;
                }
                secondTableColIndexes[idx] = true;
                return false;
            });

            var secondTableColumns = tableColumns.subtract(firstTableColumns);

            var firstTableData = [], secondTableData = [];
            this._vizData.data.each(function (dataRow) {
                var firstTableRow = dataRow.filter(function (row, idx) {
                    return firstTableColIndexes.hasOwnProperty(idx);
                });
                if (firstTableRow.length > 0) {
                    firstTableData.push(firstTableRow);
                }

                var secondTableRow = dataRow.subtract(firstTableRow);
                if (secondTableRow.length > 0) {
                    secondTableData.push(secondTableRow);
                }
            });

            return [getSlickGridModel(firstTableColumns, firstTableData),
                getSlickGridModel(secondTableColumns, secondTableData)];
        };

        TableModel.prototype.allowsFormulaAddition = function () {
            return !this.isPinboardViz();
        };

        TableModel.prototype.isSortable = function () {
            var answerModel = this.getContainingAnswerModel(),
                permission = answerModel.getPermission();
            return permission && (permission.isTableSortingAllowed() || permission.isTableLocalSortingAllowed());
        };

        TableModel.prototype.isColumnReorderingAllowed = function () {
            return !this.isPinboardViz();
        };

        var UserDataKeys = {
            ORDERED_COLUMN_IDS: 'ordered_column_ids',
            COLUMN_SORTING_STATE: 'column_sorting_state',
            COLUMN_UI_STATE: 'column_ui_state'
        };

        TableModel.prototype.updateColumnOrder = function(orderedColumnIds){
            this.setUserData(UserDataKeys.ORDERED_COLUMN_IDS, orderedColumnIds);
        };

        TableModel.prototype.setUserSpecifiedColumnWidth = function(colID, colWidth) {
            this.setUserData([UserDataKeys.COLUMN_UI_STATE, colID, strings.WIDTH], colWidth);
        };

        TableModel.prototype.getColumnOrder = function(){
            return this.getUserData(UserDataKeys.ORDERED_COLUMN_IDS);
        };

        TableModel.prototype.getUserSpecifiedColumnWidth = function(columnId) {
            return this.getUserData([UserDataKeys.COLUMN_UI_STATE, columnId, strings.WIDTH]);
        };

        TableModel.prototype.updateColumnSorting = function (columnIdToSortState) {
            this.setUserData(UserDataKeys.COLUMN_SORTING_STATE, columnIdToSortState);
        };

        TableModel.prototype.clearColumnSorting = function (columnIdToSortState) {
            this.clearUserData(UserDataKeys.COLUMN_SORTING_STATE);
        };

        TableModel.prototype.getColumnSorting = function () {
            return this.getUserData(UserDataKeys.COLUMN_SORTING_STATE);
        };

        TableModel.prototype.toSlickgridTableInfo = function () {
            if (!this._slickTableModel) {
                this._slickTableModel = new SlickgridTableModel(this);
            }

            return this._slickTableModel;
        };

        TableModel.prototype.getAutoTitle = function () {
            var columns = this.getVizColumns();
            var groupingColumns = [];
            var valueColumns = [];
            columns.forEach(function(column){
                if (column.isGroupingColumn()) {
                    groupingColumns.push(column);
                } else {
                    valueColumns.push(column);
                }
            });

            var valueColumnNames = valueColumns.map(function(column){ return column.getName();})
            .join(', ');
            var groupingColumnNames = groupingColumns.map(function(column){ return column.getName();})
            .join(', ');
            if (valueColumnNames && groupingColumnNames) {
                return valueColumnNames + ' ' + strings.BY + ' ' + groupingColumnNames;
            } else if (valueColumnNames) {
                return valueColumnNames;
            } else if (groupingColumnNames) {
                return groupingColumnNames;
            } else {
                return '';
            }
        };

    /**
     * Converts tableModel to basic slick grid model and configuration
     * @param tableModel
     * @private
     * @constructor
     */
        var SlickgridTableModel = function (tableModel) {
            if (!tableModel) {
                _logger.error('Constructing slickgrid table model without underlying model');
                return;
            }

            this._parentTableModel = tableModel;

            var self = this,
                parentColumns = tableModel.getVizColumns();

            var dataFormatter = angular.bind(self, self.dataFormatter),
                getTooltipForColumnHeader = angular.bind(self, self.getTooltipForColumnHeader);

            var columns = parentColumns.map(function (vizCol, i) {
                return {
                    id: vizCol.getSageOutputColumnId(),
                    name: vizCol.getName(),
                    headerCssClass: vizCol.isNumeric() ? 'bk-numeric-column-header' : '',
                    cssClass: vizCol.isNumeric() ? 'bk-numeric-column' : '',
                    field: 'f' + i,
                    formatter: dataFormatter,
                    toolTip: '',
                    getTooltipForColumnHeader: getTooltipForColumnHeader
                };
            });

            var data = tableModel.getData().map(function (row) {
                var rowWithField = {};
                row.forEach(function (val, i) {
                    rowWithField['f' + i] = val;
                });
                return rowWithField;
            });

            this.model = {
                columns: columns,
                data: data
            };

            this.config = {};
        };

        SlickgridTableModel.prototype.dataFormatter = function (row, cell, value, columnDef) {
            var column = this._parentTableModel.getColumn(columnDef.id);
            if (!column) {
                return null;
            }

            return tableUtil.getFormattedValue(column, value);
        };

        SlickgridTableModel.prototype.getTooltipForColumnHeader = function (columnDef) {
            var column = this._parentTableModel.getColumn(columnDef.id);
            if (!column) {
                return '';
            }

            return column.getSourcesTooltip();
        };

        return TableModel;

    }]);

