/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Models associated with Logical Entities in Callosum. These include:
 *               1. LogicalColumn - for encapsulating logical column
 *               2. LogicalTableModel - for encapsulating logical table
 */

'use strict';

blink.app.factory('LogicalTableModel', ['blinkConstants',
    'strings',
    'ColumnMetricsDefinition',
    'CurrencyTypeInfo',
    'dataRuleService',
    'dateUtil',
    'DocumentModel',
    'GeoConfig',
    'joinPathRegistry',
    'jsonConstants',
    'Logger',
    'SlickgridTablePropertiesModel',
    'tableUtil',
    'userDialogs',
    'util',
    function (blinkConstants,
          strings,
          ColumnMetricsDefinition,
          CurrencyTypeInfo,
          dataRuleService,
          dateUtil,
          DocumentModel,
          GeoConfig,
          joinPathRegistry,
          jsonConstants,
          Logger,
          SlickgridTablePropertiesModel,
          tableUtil,
          userDialogs,
          util) {

        var _logger = Logger.create('logical-table-model');

    //////////////////////
    //                  //
    //  LOGICAL TABLE   //
    //                  //
    //////////////////////

    /**
     * A wrapper class on the json logical table definition.
     * The class exposes convenience methods for performing basic operations on the columns and rows of data.
     * For a more complex operations, the extending model should override the methods.
     *
     * @constructor
     */
        var LogicalTableModel = function (tableJson) {
            this._tableJson = tableJson;

            if (!this._tableJson || !this._tableJson[jsonConstants.LOGICAL_TABLE_METADATA_KEY]) {
                _logger.error('Invalid Logical Table Definition', tableJson);
                throw new Error('Invalid Logical Table Definition.');
            }

        // Extend the document model
            LogicalTableModel.__super.call(this, this._tableJson[jsonConstants.LOGICAL_TABLE_METADATA_KEY][jsonConstants.HEADER_KEY]);

            var isComplete = !!tableJson[jsonConstants.LOGICAL_TABLE_METADATA_KEY][jsonConstants.COMPLETE];
            if (!isComplete) {
                this._isCorrupted = true;
                var incompletionDetails = tableJson[jsonConstants.LOGICAL_TABLE_METADATA_KEY][jsonConstants.INCOMPLETE_DETAIL];
                if (!!incompletionDetails && !!incompletionDetails.length) {
                    this._incompletionDetails = incompletionDetails;
                }
            }

        /**
         * This flags tells if the table has any data
         * @type {boolean}
         * @private
         */
            this._hasNoData = false;

        /**
         * The logical columns
         * @type {Array}
         * @private
         */
            this._columns = [];

        /**
         * The logical relationships
         * @type {Array}
         * @private
         */
            this._relationships = [];

        /**
         * Rows of data
         * @type {Array}
         * @private
         */
            this._dataRows = null;

            this._parseTableJson();
        };

    // Extend the document prototypes
        util.inherits(LogicalTableModel, DocumentModel);

        LogicalTableModel.prototype._parseTableJson = function () {
            this._metadataJson = this._tableJson[jsonConstants.LOGICAL_TABLE_METADATA_KEY];

            this._parseColumns();
            this._parseRelationships();
            this._parseData();
        };

    /**
     * Parses the columns json and forms an array of logical columns
     * @private
     */
        LogicalTableModel.prototype._parseColumns = function () {
            if (!this._metadataJson[jsonConstants.ALL_COLUMNS_KEY] || !this._metadataJson[jsonConstants.ALL_COLUMNS_KEY].length) {
                this._hasNoData = true;
            }

            var self = this;
            this._metadataJson[jsonConstants.ALL_COLUMNS_KEY].forEach(function (colJson, index) {
                var col = LogicalTableModel.createLogicalColumn(colJson, index);
                if (!col.getOwnerName()) {
                    col.setOwnerName(self.getName());
                }
                col.setGlobalContext(self);
                self._columns.push(col);
            });
        };

        LogicalTableModel.prototype._parseRelationships = function() {
            var self = this;

            var relationshipJson = this._metadataJson[jsonConstants.ALL_RELATIONSHIPS_KEY];
            if (!relationshipJson || !relationshipJson.length) {
                return;
            }

            relationshipJson.forEach(function (relationshipJson, index) {
                var relationship = LogicalTableModel.createLogicalRelationship(relationshipJson);
                self._relationships.push(relationship);
            });
        };

    /**
     * Parses the data json anf forms an array of data rows
     * @private
     */
        LogicalTableModel.prototype._parseData = function () {
            if (!this._tableJson[jsonConstants.LOGICAL_TABLE_DATA_KEY]) {
                this.setData(null);
                return;
            } else if (!this._tableJson[jsonConstants.LOGICAL_TABLE_DATA_KEY][jsonConstants.DATA_KEY] ||
            !this._tableJson[jsonConstants.LOGICAL_TABLE_DATA_KEY][jsonConstants.DATA_KEY].length) {
                this.setData([]);
                return;
            }

            var data = this._tableJson[jsonConstants.LOGICAL_TABLE_DATA_KEY][jsonConstants.DATA_KEY];
            this.setData(data);
        };

        LogicalTableModel.prototype.getGuid = function() {
            return this._tableJson.tableMetadata.header.id;
        };

        LogicalTableModel.prototype.getType = function () {
            return this._tableJson.tableMetadata.header.type;
        };

        LogicalTableModel.prototype.getJson = function () {
            return this._tableJson;
        };

    /**
     *
     * @return {Object}
     * @override
     */
        LogicalTableModel.prototype.getMetadataJson = function () {
            return this._metadataJson;
        };

        LogicalTableModel.prototype.getData = function () {
            return this._dataRows || [];
        };

        LogicalTableModel.prototype._getDataReordering = function(colIds) {
            var colPosMap = util.mapArrayToHash(
            colIds,
            angular.identity,
            function (id, index) {
                return index;
            });

            var colDataRowIdxMap = this._columns.reduce(function(idxMap, col) {
                idxMap[col.getGuid()] = col.getDataRowIndex();
                return idxMap;
            }, {});

            return util.generateTranisitiveMap(colPosMap, colDataRowIdxMap);
        };

        LogicalTableModel.prototype.setData = function (dataRows, colIds) {
            this.setDataRows(dataRows, colIds);

            var self = this;
            this._columns.each(function(col){
                var colData = self.getDataForColumn(col);
                col.setData(colData);
            });

            this._setUniques();
        };

        LogicalTableModel.prototype._setUniques = function () {
            if(!this._dataRows) {
                return;
            }

            this._uniques = {};
            this._columns.forEach(function(col) {
                var colData = this.getDataForColumn(col);
                var colIdx = col.getDataRowIndex();
                this._uniques[colIdx] = _.uniq(colData);
            }, this);
        };

        LogicalTableModel.prototype.setDataRows = function(dataRows, colIds) {
            this._hasNoData = !dataRows || dataRows.length === 0;
            this._dataRows = dataRows;

            if(!colIds || this._hasNoData) {
                return;
            }

            var reordering = this._getDataReordering(colIds);
            this._dataRows = dataRows.map(function (row) {
                return util.reorderItems(row, reordering);
            });
        };

        LogicalTableModel.prototype.hasNoData = function () {
            return this._hasNoData;
        };

        LogicalTableModel.prototype.hasNoUniques = function () {
            return !this._uniques || Object.size(this._uniques) === 0;
        };

    /**
     * Returns if the logical table model data has not been set up yet.
     * @returns {boolean}
     */
        LogicalTableModel.prototype.hasNotFetchedData = function () {
            return this._dataRows === null;
        };

    /**
     * Returns the logical columns
     * @returns {Array}
     */
        LogicalTableModel.prototype.getColumns = function () {
            return this._columns;
        };

        /**
         * Returns the logical columns
         * @returns {Array}
         */
        LogicalTableModel.prototype.getColumnNames = function () {
            return this._columns.reduce(function(map, column) {
                map.push(column.getName());
                return map;
            }, []);
        };

        /**
         * Returns the logical columns Map
         * @returns {Map}
         */
        LogicalTableModel.prototype.getColumnsMap = function () {
            return this._columns.reduce(function(map, column) {
                map[column.getGuid()] = column;
                return map;
            }, {});
        };

    /**
     * Returns the model backing the tooltip information of the table
     * @returns {NameValuePairs}
     */
        LogicalTableModel.prototype.getTooltipInformationModel = function() {
            var metadataInfo = new util.NameValuePairs();
            metadataInfo.add('NAME', this._header.name);
            metadataInfo.add('CREATED', dateUtil.epochToTimeAgoString(this._header.created));
            metadataInfo.add('UPDATED', dateUtil.epochToTimeAgoString(this._header.modified));
            if (!!this._header.databaseStripe) {
                metadataInfo.add('DATABASE', this._header.databaseStripe);
            }
            if (!!this._header.schemaStripe) {
                metadataInfo.add('SCHEMA', this._header.schemaStripe);
            }
            if (!!this._header.authorDisplayName) {
                metadataInfo.add('AUTHOR', this._header.authorDisplayName);
            }
            return metadataInfo;
        };

    /*
     * Returns the logical relationships
     * @returns {Array}
     */
        LogicalTableModel.prototype.getRelationships = function () {
            return this._relationships;
        };

        LogicalTableModel.prototype.getDataForColumn = function (col) {
            if (!col || !col.getDataRowIndex || this.hasNoData()) {
                return [];
            }

            var values = this.getData().map(function (row) {
                return row[col.getDataRowIndex()];
            });

            return values || [];
        };

        LogicalTableModel.prototype.getUniqueDataForColumn = function (col) {
            if (!col || !col.getDataRowIndex || this.hasNotFetchedData()) {
                return [];
            }

            if (this.hasNoUniques()) {
                return [];
            }

            return this._uniques[col.getDataRowIndex()] || [];
        };

        LogicalTableModel.prototype.getValidationError = function() {
            var valid = this._columns.every(function(column) {
                return column.getAggregateType() != strings.metadataExplorer.selectValueMessage &&
                column.getType() != strings.metadataExplorer.selectValueMessage;
            });
            if(!valid) {
                return strings.metadataExplorer.dataValidationErrorMessage;
            }
            return null;
        };

        LogicalTableModel.prototype.getFilters = function () {
            return this._metadataJson.tableFilters;
        };

        LogicalTableModel.prototype.setFilters = function (filters) {
            this._metadataJson.tableFilters = filters;
        };

    /**
     * Determines whether the column name is valid.
     * In this function, we are just checking if the column names (case insensitive) are duplicate.
     *
     * @param columnIndex
     * @param {boolean} isNew - if true, checks if the newName is valid. If false, checks if the already existing name is valid.
     * @param newName
     * @returns {boolean}
     */
        LogicalTableModel.prototype.isInvalidColumnName = function (columnIndex, isNew, newName) {
        // TODO (Shikhar) - for efficiency, cache this.

            if (columnIndex < 0 || columnIndex >= this._columns.length) {
                return true;
            }

            if (isNew) {
            // Check for the valid string
                if (newName === null || !newName.length) {
                    return true;
                }
            }

            var name = isNew ? newName.toLowerCase() : this._columns[columnIndex].getName().toLowerCase();
            for (var i = 0; i < this._columns.length; i++) {
                if (i == columnIndex) {
                    continue;
                }
                if (this._columns[i].getName().toLowerCase() == name) {
                    return true;
                }
            }
            return false;
        };

    // TODO (Shikhar) - Make this return error once you integrate with userdata file upload
        LogicalTableModel.prototype.getTooltipForCell = angular.noop;

    /**
     * Sets the new name to the column of the given index
     * @param name
     * @param index
     * @returns {boolean} - true if setting column name was successful.
     */
        LogicalTableModel.prototype.setColumnName = function (name, index) {
            if (index === null || !this._columns[index]) {
                return false;
            }

            if (this.isInvalidColumnName(index, true, name)) {
                _logger.log('Invalid name for column', name, index, this);
                return false;
            }

            this._columns[index].setName(name);
            return true;
        };

        LogicalTableModel.prototype.isPermittedToSave = function () {
            var seenNames = {};
            for (var i = 0; i < this._columns.length; i++) {
                var name = this._columns[i].getName().toLowerCase();
                if (seenNames.hasOwnProperty(name)) {
                    return false;
                }
                seenNames[name] = true;
            }

            return true;
        };

    /**
     * @return {string}
     * @override
     */
        LogicalTableModel.prototype.getMetadataType = function () {
            return jsonConstants.metadataType.LOGICAL_TABLE;
        };

    /**
     *
     * @return {string}
     * @override
     */
        LogicalTableModel.prototype.getMetadataSubType = function () {
            return this._metadataJson[jsonConstants.TYPE_KEY];
        };

    /**
     *
     * @param {Object} json
     * @override
     */
        LogicalTableModel.prototype.fromMetadataJson = function (json) {
            var tableJson = angular.copy(this._tableJson);
            tableJson[jsonConstants.LOGICAL_TABLE_METADATA_KEY] = json;
            return new LogicalTableModel(tableJson);
        };

    /**
     *
     * @return {string}
     */
        LogicalTableModel.prototype.getQueryJoinType = function () {
            if (!this._metadataJson || !this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY]) {
                return '';
            }

            return this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY][jsonConstants.LOGICAL_TABLE_JOIN_TYPE];
        };

    /**
     *
     * @param {string} queryType
     */
        LogicalTableModel.prototype.setQueryJoinType = function (queryType) {
            if (!this._metadataJson || !this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY]) {
                return;
            }

            this._metadataJson[jsonConstants.LOGICAL_TABLE_CONTENT_KEY][jsonConstants.LOGICAL_TABLE_JOIN_TYPE] = queryType;
            return;
        };

        LogicalTableModel.prototype.getDependents = function() {
            return this._dependents;
        };

        LogicalTableModel.prototype.setDependents = function (dependents) {
            this._dependents = dependents;
        };

        LogicalTableModel.prototype.getColumnStatistics = function() {
            return this._columnStatistics;
        };

        LogicalTableModel.prototype.setColumnStatistics = function(columnStatistics) {
            this._columnStatistics = columnStatistics;
        };


        LogicalTableModel.createLogicalColumn = function (colJson, dataRowIndex, colData) {
            return createNewLogicalColumn(colJson, dataRowIndex, colData);
        };

        LogicalTableModel.createLogicalRelationship = function(relationshipJson) {
            return new LogicalRelationship(relationshipJson);
        };


    /**
     * Converts table model to a slick grid table
     * @param {Object=} params
     * @return {SlickgridTableModel}
     */
        LogicalTableModel.prototype.toSlickgridTable = function (params) {
            if (params.viewMode === blinkConstants.DataExplorerViewModes.DATA_VIEW) {
                this._slickTableModel = new SlickgridTableModel(this, this.getColumns(), this.getData(), params);
                return this._slickTableModel;
            } else if(params.viewMode === blinkConstants.DataExplorerViewModes.PROP_VIEW){
                this._slickTablePropertiesModel = new SlickgridTablePropertiesModel(this, params);
                return this._slickTablePropertiesModel;
            } else if(params.viewMode === blinkConstants.DataExplorerViewModes.PROFILE_VIEW){
                this._slickProfileModel = new SlickgridColumnStatisticsModel(this, this._columnStatistics, params);
                return this._slickProfileModel;
            } else if(params.viewMode === blinkConstants.DataExplorerViewModes.DEPENDENTS_VIEW) {
                return new SlickgridDependentsModel(this._dependents);
            }
        };

    /**
     *
     * @param logcalTableModel
     * @private
     * @constructor
     */
        var SlickgridTableModel = function (logicalModel, params) {
            this._additionalParams = params || {};
            this._logicalTableModel = logicalModel;

            var logicalCols = logicalModel.getColumns();
            if (!logicalCols || !logicalCols.length) {
                return;
            }

            this._colDataRowIndexToColNameSlickGrid = {};
            var self = this;

            var columns = logicalCols.map(function(column, i) {
                self._colDataRowIndexToColNameSlickGrid[column.getDataRowIndex()] = column.getName().toLowerCase();
                return {
                    id: column.getGuid(),
                    logicalColumn: column,
                    name: column.getName(),
                    headerCssClass: column.isNumeric() ? 'bk-numeric-column-header' : '',
                    cssClass: column.isNumeric() ? 'bk-numeric-column' : '',
                    field: 'f' + i,
                    formatter: function (row, cell, value) {
                        return ((column.getDataFormatter()(column.convertValueFromBackend(value), {
                            noShorten: true
                        })) + '').escapeHTML();
                    },
                    toolTip: '', // If not given, toolTip = 'undefined' because slickgrid code does not check for defined
                    onUpdate: angular.bind(self, self.updateColumnNameForSlickGrid, column),
                    getTooltipForColumnHeader: angular.bind(self, self.getHeaderTooltipForSlickGrid, column),
                    getCustomHeaderClass: angular.bind(self, self.getCustomHeaderClassForSlickGrid, column),
                    onSelect: self._additionalParams.onColumnSelect || angular.noop,
                    isHidden: column.isHidden()
                };
            });

            var data = logicalModel.getData().map(function (row) {
                var rowWithField = {};
                row.forEach(function (val, i) {
                    rowWithField['f' + i] = val;
                });
                return rowWithField;
            });

            var model = {
                columns: columns,
                data: data
            };

            var permission = logicalModel.getPermission();
            var config = {
                editableColumnHeaders: permission && permission.isChangingColumnNameAllowed()
            };

            this.model = model;
            this.config = config;
        };

        var SlickgridColumnStatisticsModel = function(logicalModel, dataRows, params) {

            this._additionalParams = params || {};
            var logicalColumns = logicalModel.getColumns();
            var metricsColumn = {
                id: 'metricName',
                name: '',
                cssClass: 'pivot-column',
                field: jsonConstants.METRICS
            };
            var columns = _.map(logicalColumns, function(column) {
                return {
                    id: column.getGuid(),
                    name: column.getName(),
                    field: column.getGuid(),
                    formatter: function(row, cell, value, c, dataObject) {
                        var formatter = column.getDataProfileFormatter(dataObject.metrics, value);
                        var params = { noShorten: true };
                        return formatter(column.convertValueFromBackend(value), params).toString().escapeHTML();
                    }
                };
            });

            columns.unshift(metricsColumn);

            var data = _.map(dataRows, function(row, index) {
                row[jsonConstants.METRICS] = index;
                return row;
            });

            var model = {
                columns: columns,
                data: data
                //onUpdate: this.updateProperties
            };

            this.model = model;
        };


        var SlickgridDependentsModel = function (dependents) {

            var columns = [{
                id: 'colName',
                name: 'Column Name',
                field: 'dependencyName'
            }, {
                id: 'depName',
                name: 'Dependent name',
                field: 'name',
                formatter: tableUtil.linkFormatter(function (rowNum, row) {
                    var linkMap = {};
                    linkMap[jsonConstants.metadataType.PINBOARD_ANSWER_BOOK] = '#/pinboard/';
                    linkMap[jsonConstants.metadataType.QUESTION_ANSWER_BOOK] = '#/saved-answer/';
                    linkMap[jsonConstants.metadataType.LOGICAL_TABLE] = '#/data/explore/';

                    if (linkMap[row.type]) {
                        return linkMap[row.type] + row.id;
                    } else {
                        return null;
                    }
                })
            },{
                id: 'depType',
                name: 'Type',
                field: 'typeName'
            }];

            var model = {
                columns: columns,
                data: dependents,
                onUpdate: this.updateProperties // which is undefined ?
            };
            this.model = model;
        };


    /**
     * Updates column with the given dataRowIndex with the new name. This is used as a callback when we display worksheet
     * in an edit mode where change of column header is permitted.
     * @param slickgridColumn - slickgrid column
     * @param newName
     */
        SlickgridTableModel.prototype.updateColumnNameForSlickGrid = function (logicalCol, slickgridColumn, newName) {
            var colDataRowIndex = logicalCol.getDataRowIndex();
            this._logicalTableModel.setColumnName(newName, colDataRowIndex);
            this._colDataRowIndexToColNameSlickGrid[colDataRowIndex] = newName.toLowerCase();
        };

        SlickgridTableModel.prototype.isColumnNameRepeatedInSlickGrid = function (logicalCol) {
            var colDataRowIndex = logicalCol.getDataRowIndex(),
                colName = this._colDataRowIndexToColNameSlickGrid[colDataRowIndex];
            return Object.values(this._colDataRowIndexToColNameSlickGrid).some(function (name, index) {
                return colDataRowIndex !== index && name === colName;
            });
        };

        SlickgridTableModel.prototype.getHeaderTooltipForSlickGrid = function (logicalCol) {
            if (this._additionalParams && this._additionalParams.getTooltip) {
                return this._additionalParams.getTooltip(logicalCol);
            }

            return logicalCol.getSourcesTooltip();
        };

        SlickgridTableModel.prototype.hasAnyColumnsWithRepeatedNames = function () {
            if (!this.model || !this.model.columns) {
                return false;
            }

            var self = this;
            return this.model.columns.any(function (column) {
                return self.isColumnNameRepeatedInSlickGrid(column.logicalColumn);
            });
        };

        SlickgridTableModel.prototype.getCustomHeaderClassForSlickGrid = function (logicalCol) {
            if (!logicalCol.isColumnComplete()) {
                return 'bk-broken-column-names';
            }

            return '';
        };



    ////////////////////////////
    //                        //
    //  LOGICAL RELATIONSHIP  //
    //                        //
    ////////////////////////////

        var LogicalRelationship = LogicalTableModel.LogicalRelationship = function(relationshipJson) {
            this._id = relationshipJson.header.id;
            this._name = relationshipJson.header.name;
            this._description = relationshipJson.header.description;
            this._author = relationshipJson.header.author;

            this._sourceTableId = relationshipJson.sourceTable;
            this._destinationTableId = relationshipJson.destinationTable;

            this._metadataType = relationshipJson.type;

            this._sourceColumns = relationshipJson.sourceColumns;
            this._destinationColumns = relationshipJson.targetColumns;

        };

        LogicalRelationship.prototype.getId = function() {
            return this._id;
        };

        LogicalRelationship.prototype.getName = function() {
            return this._name;
        };

        LogicalRelationship.prototype.getDescription = function() {
            return this._description;
        };

        LogicalRelationship.prototype.getAuthor = function() {
            return this._author;
        };

        LogicalRelationship.prototype.getMetadataType = function() {
            return this._metadataType;
        };

        LogicalRelationship.prototype.getSourceTableId = function() {
            return this._sourceTableId;
        };

        LogicalRelationship.prototype.getDestinationTableId = function() {
            return this._destinationTableId;
        };

        LogicalRelationship.prototype.getSourceColumnIds = function() {
            return this._sourceColumns;
        };

        LogicalRelationship.prototype.getDestinationColumnIds = function() {
            return this._destinationColumns;
        };

    //////////////////////
    //                  //
    //  LOGICAL COLUMN  //
    //                  //
    //////////////////////

        function createNewLogicalColumn(colJson, dataRowIndex, colData) {
            if (colJson.optionalType === 'FORMULA') {
                return new FormulaColumn(colJson, dataRowIndex, colData);
            }
            return new LogicalColumn(colJson, dataRowIndex, colData);
        }

    /**
     * A wrapper class on the json logical column definition.
     * The class exposes convenience methods for getting the column name, type, data type or formatter.
     *
     * @constructor
     */
        var LogicalColumn = LogicalTableModel.LogicalColumn = function (colJson, dataRowIndex, colData) {
            this._colJson = colJson;

            if (!this._colJson || !this._colJson[jsonConstants.HEADER_KEY] ||
            !this._colJson[jsonConstants.HEADER_KEY][jsonConstants.ID_KEY] ||
            !this._colJson.dataType || !this._colJson.type) {
                throw new Error('Invalid logical column definition: ' + JSON.stringify(this._colJson));
            }

            this._dataRowIndex = dataRowIndex;
            this._header = this._colJson[jsonConstants.HEADER_KEY];



            this._metricsDefinition = null;
            if (Object.has(this._colJson, jsonConstants.METRIC_DEFINITION_KEY)) {
                var metricDefinitionJson = this._colJson[jsonConstants.METRIC_DEFINITION_KEY];
                this._metricsDefinition = new ColumnMetricsDefinition(metricDefinitionJson);
            }

            this.currencyTypeInfo = new CurrencyTypeInfo(this._colJson.currencyTypeInfo);

            if (!!this._colJson[jsonConstants.GEO_CONFIG_KEY]) {
                this.geoConfig = new GeoConfig(this._colJson[jsonConstants.GEO_CONFIG_KEY]);
            }

        /**
         * Data for this column
         * @type {Array}
         * @private
         */
            this._data = [];

        /**
         * The formatter associated with this column. Based on the formatPattern and the effectiveDataType.
         * @type {Function}
         * @private
         */
            this._baseTypeFormatter = angular.bind(this, LogicalColumn.genericFormatter);
            this._genericFormatter = angular.bind(this, LogicalColumn.genericFormatter);

            var self = this;

            var formatPattern;
            if (this.isGeoColumn())  {
            // geo values are always treated literally, no formatting is required
            // important in case of zip, lat/long which can be numeric and formatting
            // them as numbers can cause them to get shortened to business numbers
                this._baseTypeFormatter = function (dataValue){
                    return dataValue + '';
                };
            } else if (this.isEffectivelyNumeric()) {
                this._baseTypeFormatter = angular.bind(this, LogicalColumn.numericFormatter);
            } else if (this.isDateColumn()) {
                var isDateTimeColumn = this.isDateTimeColumn();
                formatPattern = self.getFormatPattern();
            // Callosum can send null formatPattern in case data was imported through the ETL.
                if (!formatPattern) {
                    if (isDateTimeColumn) {
                        formatPattern = 'MM/dd/yyyy HH:mm:ss';
                    } else {
                        formatPattern = 'MM/dd/yyyy';
                    }
                }
                this._baseTypeFormatter = function (dataValue) {
                    return dateUtil.formatDate(dataValue, formatPattern, void 0, true);
                };
            } else if (this.isTimeColumn()) {
                formatPattern = self.getFormatPattern() || 'HH:mm:ss';
                this._baseTypeFormatter = function (dataValue) {
                    return dateUtil.formatTimeOfDay(dataValue, formatPattern);
                };
            }

        // This is a query time construct i.e this should be only used in cases when a user
        // is trying to build an answer/pinboard.
        // It should return the column from the Base table, worksheet or aggregated worksheet
        // based on the source.
        // NOTE: In case of worksheet we dont want to go the underlying table but use the column
        // from worksheet.
        // NOTE: This should map to the column list that we see in the left panel.
            this.baseColumn = null;

        // This also sets the base column as it is computed in this calculation.
            this._logicalKey = this._computeLogicalKey();

            this.originInfo = {};

            this.setData(colData);
        };

        LogicalColumn.genericFormatter = function (dataValue, additionalParams) {
            return util.formatDataLabel(dataValue, {
                checkOnlySpecialFormat: true
            });
        };

        LogicalColumn.numericFormatter = function (dataValue, additionalParams) {
            if (!additionalParams) {
                additionalParams = {};
            }
            if (!Object.has(additionalParams, 'isDouble')) {
                additionalParams.isDouble = this.isDoubleColumn();
            }

            if (!Object.has(additionalParams, 'isPercent')) {
                additionalParams.isPercent = this.isEffectivelyPercent();
            }

            var currencyTypeInfo = this.getCurrencyTypeInfo();
            var isCurrency = currencyTypeInfo && !!currencyTypeInfo.getSettingType(),
                currencyCode = null;
            if (isCurrency) {
                if (currencyTypeInfo.getSettingType() === jsonConstants.currencyTypes.FROM_ISO_CODE) {
                    currencyCode = currencyTypeInfo.getIsoCode();
                } else if (currencyTypeInfo.getSettingType() === jsonConstants.currencyTypes.FROM_COLUMN) {
                    if (Array.isArray(dataValue)) {
                    // For data of table fiz, when there is a currency code associated with a cell's value we change the
                    // value into an array where first element is the value and second element is
                    // the currency code.
                        currencyCode = dataValue[1];
                        dataValue = dataValue[0];
                    } else if (this.getUniqueCurrencyCode()) {
                        currencyCode = this.getUniqueCurrencyCode();
                    } else {
                        isCurrency = false;
                    }
                }
            }

        // TODO(vibhor/sunny): Simplify the interface of formatter to take in a single shortening parameter that controls
        // whether a business number formatting is used or a precision formatting is used based on an enum of
        // ALWAYS, NEVER or AUTO.
            return util.formatDataLabel(dataValue, {
                noShorten: additionalParams.noShorten,
                formatPattern: this.getFormatPattern(),
                isDouble: additionalParams.isDouble,
                isPercent: additionalParams.isPercent,
                nDecimal: additionalParams.nDecimal,
                isCurrency: isCurrency,
                currencyCode: currencyCode
            });
        };

        LogicalColumn.floatingPointFormatter = function (dataValue, additionalParams) {
            if (!additionalParams) {
                additionalParams = {};
            }
            additionalParams.isDouble = true;
            return LogicalColumn.numericFormatter.call(
            this,
            dataValue,
            additionalParams
        );
        };

        LogicalColumn.prototype.convertValueFromBackend = function (dataValue) {
            if ((this.isDateColumn() || this.isTimeColumn()) && !isNaN(dataValue) && dataValue !== null) {
                return dataValue * 1000;
            }
            return dataValue;
        };

        LogicalColumn.prototype.convertValueToBackend = function (dataValue) {
            if ((this.isDateColumn() || this.isTimeColumn()) && !isNaN(dataValue)) {
                return dataValue / 1000;
            }
            return dataValue;
        };

        LogicalColumn.prototype.convertValueToSageValue = function (value) {
        // SCAL-11232: in case value is null and already formtted to {Null}, pass it directly to
        // sage
            if (value === strings.NULL_VALUE_PLACEHOLDER_LABEL
            || value === strings.EMPTY_VALUE_PLACEHOLDER_LABEL) {
                return value;
            }

            if (this.isDateColumn()) {
                if (this.isDateTimeColumn()) {
                    return dateUtil.formatDate(value, 'MM/dd/yyyy HH:mm:ss', true, true);
                } else {
                    return dateUtil.formatDate(value, 'MM/dd/yyyy', true, true);
                }
            }

            if (this.isTimeColumn()) {
                return dateUtil.formatTimeOfDay(value, 'HH:mm:ss', true, true);
            }

            if (this.isEffectivelyNumeric()) {
                return icu4js.numberFormat.parseFloat(value, true);
            }

            return value;
        };

        LogicalColumn.prototype.getFormatPattern = function () {
            return this._colJson.formatPattern;
        };

        LogicalColumn.prototype.getDefaultFormatPattern = function() {
            return this._colJson.defaultFormatPattern;
        };

        LogicalColumn.prototype.setFormatPattern = function (pattern) {
            this._colJson.defaultFormatPattern = pattern;
        };

    /**
     * Return true if this column refers to the same entity as the other column.
     *
     * @param otherColumn
     * @return {boolean}
     */
        LogicalColumn.prototype.matches = function (otherColumn) {
            return this.getGuid() === otherColumn.getGuid() &&
            this.getAggregateType() === otherColumn.getAggregateType() &&
            this.getType() === otherColumn.getType() &&
            this.getDataType() === otherColumn.getDataType();
        };

    /**
     * In a given data tuple (or uniques tuple), this number specifies which index corresponds to the data value for
     * this column.
     * @return {number}
     */
        LogicalColumn.prototype.getDataRowIndex = function () {
            return this._dataRowIndex;
        };

    // TODO (Shikhar) - make this like viz column
        LogicalColumn.prototype.getDataFormatter = function () {
            return this._baseTypeFormatter;
        };

        LogicalColumn.prototype.getDataProfileFormatter = function(type, value) {
            if(type === strings.dataProfile.metrics.NULL) {
                return this._genericFormatter;
            }
            if(value === undefined) {
                return function(){
                    return strings.dataProfile.NOT_AVAILABLE;
                };
            }
            return this._baseTypeFormatter;
        };

    /**
     * @return {Object}
     */
        LogicalColumn.prototype.getJson = function () {
            return this._colJson;
        };

    // TODO(vibhor/satyam): Get rid of this dependency when sage supports filter on expressions!
    // NOTE(vibhor): I don't think that this dependency is going away unless some drastic change in architecture happens!!
        LogicalColumn.prototype.getDerivationExpression = function () {
            return this._colJson[jsonConstants.DERIVATION_EXPRESSION];
        };

    /**
     * Returns whether the column is complete/
     * @return {bool}
     */
        LogicalColumn.prototype.isColumnComplete = function () {
            if (!!this.getJson()) {
                return this.getJson().complete;
            }
            return false;
        };

    /**
     * Performs a pseudo in-order traversal (skips right node traversal) to find the terminal node as determined by
     * the isTerminalNodeFn(). The method is recursive traversal of the tree rooted at expressionTree.
     *
     * @param {DerivationExpression} expressionTree A root of a derivation expression tree/sub-tree for in-order traversal.
     * @param {Function} isTerminalNodeFn A boolean predicate to test if the root of the current sub-tree is terminal node.
     * @returns {DerivationExpression|null}
     */
        function inOrder(expressionTree, isTerminalNodeFn) {
            if (isTerminalNodeFn(expressionTree)) {
                return expressionTree;
            }

            var leftNode = expressionTree.getLeftNode();
            if (!leftNode) {
                return null;
            }

        // TODO(vibhor/vijay): Figure out what to do in case of a real expression (n-ary operator) i.e. when there
        // is a right node too.
            return inOrder(leftNode, isTerminalNodeFn);
        }

        function DerivationExpression(json) {
            this._json = json;
            if (json.logicalColumn) {
                this._logicalCol = createNewLogicalColumn(json.logicalColumn);
            }
        }

        DerivationExpression.prototype.isLCR = function () {
            return this._json.exprType === blinkConstants.derivedColumnExprTypes.DERIVATION_TYPE_LCR;
        };

        DerivationExpression.prototype.getLeftNode = function () {
            if (!this._json.children || !this._json.children.length) {
                return null;
            }

            return new DerivationExpression(this._json.children[0]);
        };

        DerivationExpression.prototype.getJoinPaths = function () {
            return this._json.joinPaths;
        };

        DerivationExpression.prototype.getLogicalColumn = function () {
            return this._logicalCol;
        };

        LogicalColumn.prototype.getTokenLookupKey = function () {
            if (!this.originInfo.column) {
                this._computeOriginInfo();
            }

            var originInfoKey = this.originInfo.column.getGuid(),
                pathToRoot = this.originInfo.joinPaths;

            if (!pathToRoot || !pathToRoot.length) {
                return originInfoKey;
            }

            pathToRoot = this.originInfo.joinPaths[0].joins;

            originInfoKey += '.';

            originInfoKey += pathToRoot.map(function (pathComponent) {
                return pathComponent.header.id;
            }).join(',');

            return originInfoKey;
        };

        LogicalColumn.prototype.getOriginInfo = function () {
            if (!this.originInfo.column) {
                this._computeOriginInfo();
            }

            return this.originInfo;
        };

        LogicalColumn.prototype._computeOriginInfo = function () {
            var originColumnMatchingTerminationFunction = function (column) {
                return !column.isDerived() || column.isFormula();
            };

            var matchDetails = this.traverseColumnDerivation(originColumnMatchingTerminationFunction);

            this.originInfo.column = matchDetails.matchingColumn;
            if (!!matchDetails.matchingDerivationExpression) {
                this.originInfo.joinPaths = matchDetails.matchingDerivationExpression.getJoinPaths();
            }
        };

        LogicalColumn.prototype.traverseColumnDerivation = function (terminationFunction) {
            var currentColumn = this;
            var params = {};

            if(terminationFunction(currentColumn)){
                params.matchingColumn = currentColumn;
                params.matchingDerivationExpression = null;
            }

            while(!params.matchingColumn){
                var derivationExpressionJson = currentColumn.getDerivationExpression();
                if(!derivationExpressionJson) {
                    params.matchingColumn = currentColumn;
                    break;
                }

                var derivationExpression = new DerivationExpression(derivationExpressionJson);

                if(!derivationExpression.isLCR()){
                    derivationExpression = derivationExpression.getLeftNode();
                    if(!derivationExpression) {
                        params.matchingColumn = currentColumn;
                        break;
                    }
                }

                currentColumn = derivationExpression.getLogicalColumn();
                if(terminationFunction(currentColumn)){
                    params.matchingColumn = currentColumn;
                    params.matchingDerivationExpression = derivationExpression;
                }
            }

            return params;
        };

    // This function is to find base column.
        function logicalColumnMatchTerminationFunction (column) {
            switch(column.getOwnerType()){
                case 'ONE_TO_ONE_LOGICAL':
                case 'WORKSHEET':
                case 'AGGR_WORKSHEET':
                    return true;
                case 'PRIVATE_WORKSHEET':
                    return column.isFormula();
                default:
                    return column.isFormula() || !column.isDerived();
            }
        }

    /**
     *
     * @return {string}
     * @private
     */
        LogicalColumn.prototype._computeLogicalKey = function () {
            var matchingColumn, matchingDerivationExpression;

            var matchDetails = this.traverseColumnDerivation(logicalColumnMatchTerminationFunction);

            matchingColumn = matchDetails.matchingColumn;
            matchingDerivationExpression = matchDetails.matchingDerivationExpression;

        // NOTE: This is done to avoid infinite nesting of logical columns.
            if (this === matchingColumn) {
                this.isBaseColumn = true;
            } else {
                this.baseColumn = matchingColumn;
            }

            var logicalKey = matchingColumn.getGuid(), pathToRoot;

            if(matchingDerivationExpression){
                pathToRoot = matchingDerivationExpression.getJoinPaths();
            }

            if (!pathToRoot || !pathToRoot.length) {
                return logicalKey;
            }
            pathToRoot = pathToRoot[0].joins;

            logicalKey += '.';

            logicalKey += pathToRoot.map(function (pathComponent) {
                return pathComponent.header.id;
            }).join(',');

            return logicalKey;
        };

    /**
     *
     * @return {string}
     */
        LogicalColumn.prototype.getLogicalKey = function () {
            return this._logicalKey;
        };

        LogicalColumn.prototype.getJoinPathLabel = function () {
            return joinPathRegistry.getJoinPathLabel(this);
        };

    /**
     * @return {string}
     */
        LogicalColumn.prototype.getGuid = function () {
            return this._header.id;
        };

    /**
     * @return {string}
     */
        LogicalColumn.prototype.getOwner = function () {
            return this._header.owner;
        };

    /**
     * @return {string}
     */
        LogicalColumn.prototype.getOwnerName = function () {
            return this._colJson.ownerName;
        };

    /**
     * @return {string}
     */
        LogicalColumn.prototype.setOwnerName = function (ownerName) {
            this._colJson.ownerName = ownerName;
        };

        LogicalColumn.prototype.getOwnerType = function () {
            return this._colJson.ownerType;
        };

        LogicalColumn.prototype.getName = function () {
            return this._header.name;
        };

        LogicalColumn.prototype.setName = function (columnName) {
            return this._header.name = columnName;
        };

        LogicalColumn.prototype.getDescription = function () {
            return this._header.description;
        };

        LogicalColumn.prototype.setDescription = function (description) {
            this._header.description = description;
        };

        LogicalColumn.prototype.isHidden = function () {
            return this._header.isHidden;
        };

        LogicalColumn.prototype.setIsHidden = function (isHidden) {
            this._header.isHidden = isHidden;
        };

        LogicalColumn.prototype.isAttributionDimension = function () {
            return this._colJson.isAttributionDimension;
        };

        LogicalColumn.prototype.setIsAttributionDimension = function (isAttributionDimension) {
            this._colJson.isAttributionDimension = isAttributionDimension;
        };

        LogicalColumn.prototype.getIndexPriority = function () {
            return this._colJson.indexPriority;
        };

        LogicalColumn.prototype.setIndexPriority = function (indexPriority) {
            this._colJson.indexPriority = indexPriority;
        };

    /**
     * Note: This is defined only for logical columns whose derivation is of type LCR
     * @return {string}
     */
        LogicalColumn.prototype.getSageOutputColumnId = function () {
            return this._colJson.sageOutputColumnId;
        };

        LogicalColumn.prototype.setSageOutputColumnId = function (sageOutputColumnId) {
            this._colJson.sageOutputColumnId = sageOutputColumnId;
        };

    /**
     * Method to get the datatype
     * @returns {string}
     */
        LogicalColumn.prototype.getDataType = function () {
            return this._colJson.dataType;
        };

        LogicalColumn.prototype.setDataType = function (dataType) {
            this._colJson.dataType = dataType;
        };

        LogicalColumn.prototype.getCurrencyTypeInfo = function() {
            return this.currencyTypeInfo;
        };

        LogicalColumn.prototype.setCurrencyTypeInfo = function(currencyTypeInfo) {
            if (!currencyTypeInfo.getSettingType()) {
                this.currencyTypeInfo = null;
                delete this._colJson.currencyTypeInfo;
                return;
            }
            this.currencyTypeInfo = currencyTypeInfo;
            this._colJson.currencyTypeInfo = currencyTypeInfo.toJson();
        };

        LogicalColumn.prototype.getGeoConfig = function () {
            return this.geoConfig;
        };

        LogicalColumn.prototype.setGeoConfig = function (geoConfig) {
            if (!geoConfig) {
                this.geoConfig = null;
                delete this._colJson.geoConfig;
                return;
            }
            this.geoConfig = geoConfig;
            this._colJson.geoConfig = geoConfig.getJson();
        };

    /**
     * Method to get the type
     * @returns {string}
     */
        LogicalColumn.prototype.getType = function () {
            return this._colJson.type;
        };

        LogicalColumn.prototype.setType = function (type) {
            this._colJson.type = type;
        };

    /**
     * Method to get the default aggregate type
     * @returns {string}
     */
        LogicalColumn.prototype.getAggregateType = function () {
            return this._colJson.defaultAggrType;
        };

        LogicalColumn.prototype.setAggregateType = function (aggrType) {
            this._colJson.defaultAggrType = aggrType;
        };

    /**
     * Method to get the index type
     * @returns {string}
     */
        LogicalColumn.prototype.getIndexType = function () {
            return this._colJson.indexType;
        };

        LogicalColumn.prototype.setIndexType = function (indexType) {
            this._colJson.indexType = indexType;
        };

    /**
     * Method to get a string representation of synonyms
     * @returns {string}
     */
        LogicalColumn.prototype.getSynonyms = function () {
            var synonyms = this._colJson.synonyms || [];
            return synonyms.join(', ');
        };

        LogicalColumn.prototype.setSynonyms = function (synonyms) {
            this._colJson.synonyms = util.getCommaSeperatedArrayFromString(synonyms);
        };

    /**
     * Note - Client Side Usage Only. Assumes one has called setData() before
     * Returns the data of the column
     * @returns {Array}
     */
        LogicalColumn.prototype.getData = function () {
            return this._data || [];
        };

    /**
     * @returns {Array}
     */
        LogicalColumn.prototype.getUniqueSampleDataList = function (maxNumOfData) {
            if(!this._globalContext || this._globalContext.hasNotFetchedData()) {
                return null;
            }

            var data = this._globalContext.getUniqueDataForColumn(this);

            if (!data) {
                return null;
            }

            maxNumOfData = maxNumOfData || data.length;

        // the column might not have enough unique sample values
        // in which case, since the data for the table is a full
        // rectangular array, last few values of the data array
        // might be undefined
            data = util.firstN(data, maxNumOfData, function(value) {
                return value !== void 0;
            });

            return data.map(function(value) {
                value = this.convertValueFromBackend(value);
                value = this.getDataFormatter()(value) + '';
                value = value.truncateOnWord(50);
                return value;
            }, this);
        };

        LogicalColumn.prototype.setGlobalContext = function (context) {
            this._globalContext = context;
        };

        LogicalColumn.prototype.getGlobalContext = function () {
            return this._globalContext;
        };

    /**
     * Returns true if the column is derived from another logic column (like Yearly (Order Date)).
     * @return {boolean}
     */
        LogicalColumn.prototype.isDerived = function () {
            return !!this._colJson.isDerived || !!this._colJson[jsonConstants.DERIVATION_EXPRESSION];
        };

    /**
     * Returns true if the column is derived and of the type Logical Column Reference.
     * @return {boolean}
     */
        LogicalColumn.prototype.isDerivedOfTypeLCR = function () {
            if (!this.isDerived()) {
                return false;
            }

            return this._colJson.derivationExpr &&
            this._colJson.derivationExpr.exprType == blinkConstants.derivedColumnExprTypes.DERIVATION_TYPE_LCR;
        };

    /**
     * Returns true if the column is derived and of the type Expression.
     * @return {boolean}
     */
        LogicalColumn.prototype.isDerivedOfTypeExpression = function () {
            if (!this.isDerived()) {
                return false;
            }

            return this._colJson.derivationExpr &&
            this._colJson.derivationExpr.exprType == blinkConstants.derivedColumnExprTypes.DERIVATION_TYPE_EXPRESSION;
        };

        LogicalColumn.prototype.isFormula = function () {
            return false;
        };

    /**
     * Returns true if the type of the logical column is measure.
     * @return {boolean}
     */
        LogicalColumn.prototype.isMeasure = function () {
            return this.getType().toLowerCase() === 'measure';
        };

    /**
     * Returns true if the type of the logical column is attribute.
     * @return {boolean}
     */
        LogicalColumn.prototype.isAttribute = function () {
            return this.getType().toLowerCase() === 'attribute';
        };

    /**
     * Return true if the logical column is additive (e.g. 'age' v/s 'customer number')
     * @return {boolean}
     */
        LogicalColumn.prototype.isAdditive = function () {
        // if additive is not specified, assumed additive by default
            return typeof this._colJson.isAdditive === "undefined" || this._colJson.isAdditive === true;
        };

        LogicalColumn.prototype.setIsAdditive = function (isAdditive) {
            this._colJson.isAdditive = isAdditive;
        };

        LogicalColumn.prototype.isAdditiveNumeric = function () {
            return this.isNumeric() && this.isAdditive();
        };

        LogicalColumn.prototype.isEffectivelyNumeric = function () {
            return this.isMeasure() || this.isAdditiveNumeric();
        };

        LogicalColumn.prototype.isEffectivelyNonNumeric = function () {
            return !this.isEffectivelyNumeric();
        };

    /**
     * @return {boolean}
     */
        LogicalColumn.prototype.isDateColumn = function () {
            return this.getDataType() == 'DATE' || this.isDateTimeColumn();
        };

    /**
     * @return {boolean}
     */
        LogicalColumn.prototype.isDateTimeColumn = function () {
            return this.getDataType() == 'DATE_TIME';
        };

        LogicalColumn.prototype.isTimeColumn = function () {
            return this.getDataType() == 'TIME';
        };

        LogicalColumn.prototype.isGeoColumn = function () {
            return !!this.geoConfig;
        };

        LogicalColumn.prototype.isCurrencyColumn = function () {
            return !!(this.currencyTypeInfo && this.currencyTypeInfo.getSettingType());
        };

        LogicalColumn.prototype.getUniqueCurrencyCode = function () {
            return this._colJson._uniqueCurrencyCode;
        };

        LogicalColumn.prototype.setUniqueCurrencyCode = function (isoCode) {
        // The reason why we are setting this as a field of colJson and not as a top level field,
        // is so that when a new VizColumn/LogicalColumn is created for the same column, this value
        // reflect in the new object too.
            this._colJson._uniqueCurrencyCode = isoCode;
        };

    /**
     * @returns {boolean}
     */
        LogicalColumn.prototype.isDoubleColumn = function () {
            return this.getDataType() == 'DOUBLE';
        };

        LogicalColumn.prototype.isPercentColumn = function () {
            var formatPattern = this.getFormatPattern();
            return formatPattern && formatPattern.last() == '%';
        };

        LogicalColumn.prototype.isEffectivelyPercent = function () {
            return !!this.isPercentColumn();
        };

    /**
     * @return {boolean}
     */
        LogicalColumn.prototype.isNumeric = function () {
            var type = this.getDataType();
            return type == 'INT64' || type == 'INT32' || type == 'FLOAT' || type == 'DOUBLE';
        };

    /**
     * Sets the name of the column
     * @param name
     */
        LogicalColumn.prototype.setName = function (name) {
            if (!name || !name.length) {
                return;
            }

            this._header.name = name;
        };

    /**
     * Note - Client Side Usage Only
     * Sets the data of the column
     * @param data
     */
        LogicalColumn.prototype.setData = function (data) {
            this._data = data || [];
        };

    /**
     *
     * @return {Object}
     */
        LogicalColumn.prototype.getSources = function () {
            return this._colJson[jsonConstants.SOURCES_NODE_KEY] || [];
        };

    /**
     *
     * @param {boolean=} includeColumnName
     * @return {string}
     */
        LogicalColumn.prototype.getSourceName = function (includeColumnName) {
            includeColumnName = !!includeColumnName ;
            var sources = this.getSources(), sourcesByTable = {},
                sourceNameTpl = '{columns} ({tableName})';
            if (!sources.length) {
                return '';
            }

            sources.each(function(source) {
                var tableId = source.tableId;
                if (!sourcesByTable[tableId]) {
                    sourcesByTable[tableId] = {};
                }
            // bucket by columns if needed
                if (includeColumnName) {
                    sourcesByTable[tableId][source.columnId] = source;
                } else {
                    sourcesByTable[tableId] = source;
                }
            });

            if (includeColumnName) {
                return Object.keys(sourcesByTable).map(function(tableId) {
                    var sourcesByColumn = sourcesByTable[tableId];
                    var columnsIds = Object.keys(sourcesByColumn);
                    var result =  sourceNameTpl.assign(
                        {
                            columns : columnsIds.map(function(d) { return sourcesByColumn[d].columnName;}).join(', '),
                            tableName: sourcesByColumn[columnsIds[0]].tableName
                        }
                );
                    return result;
                }).join(', ');
            } else {
                return Object.keys(sourcesByTable).map(function(d){ return sourcesByTable[d].tableName;}).join(', ');
            }
        };

    /**
     * Returns the tooltip for this column for table
     * @returns {string}
     */
        LogicalColumn.prototype.getSourcesTooltip = function () {
            var joinLabel = this.getJoinPathLabel(),
                source = this.getSourceName(true) || this.getOwnerName();

            if (!joinLabel) {
                return source;
            }

            return source + ' (' + joinLabel + ')';
        };

    /**
     * Returns the model backing the tooltip information of the column
     * @returns {NameValuePairs}
     */
        LogicalColumn.prototype.getTooltipInformationModel = function() {
            var fullName = this.getName(),
                sourcePart = this.getSourcesTooltip(),
                recencyPart = this.getDataRecency(),
                description = this.getDescription();

            var model = new util.NameValuePairs();

            model.add('NAME', fullName);

            if (!!sourcePart) {
                model.add('SOURCE', sourcePart);
            }

            if (!!recencyPart) {
                model.add('UPDATED', recencyPart);
            }

            if(!!description) {
                model.add('DESCRIPTION', description);
            }

            return model;
        };

    /**
     *
     * @returns {string}
     */
        LogicalColumn.prototype.getDataRecency = function () {
            if (!angular.isDefined(this._colJson.dataRecency)) {
                return '';
            }

        /* global moment */
            return moment(this._colJson.dataRecency * 1000).fromNow();
        };

        LogicalColumn.prototype.isOwnedByPrivateWorksheet = function () {
            return this._colJson.ownerType === jsonConstants.metadataType.subType.PRIVATE_WORKSHEET;
        };

        LogicalColumn.prototype.getSupportedAggregationTypes = function () {
            return util.getSupportedAggregationTypes(
            this.getAggregateType(),
            this.isDateColumn(),
            this.isMeasure(),
            this.isAttribute(),
            this.isAdditiveNumeric()
        );
        };

        LogicalColumn.prototype.getBaseColumnGuid = function () {
            return this.isBaseColumn ? this.getGuid() : this.baseColumn.getGuid();
        };

        LogicalColumn.prototype.getBaseColumn = function () {
            return this.isBaseColumn ? this : this.baseColumn;
        };

        LogicalColumn.prototype.getSourceId = function () {
            var baseLogicalColumn = this.getBaseColumn();
            return baseLogicalColumn.getOwner();
        };

        LogicalColumn.prototype.getMetricsDefinition = function () {
            return this._metricsDefinition;
        };

        var FormulaColumn =  function () {
            return FormulaColumn.__super.apply(this, arguments);
        };

        util.inherits(FormulaColumn, LogicalColumn);

        FormulaColumn.prototype.getFormulaId = function () {
            return this._colJson.formulaId || null;
        };

        FormulaColumn.prototype.setFormulaId = function (formulaId) {
            this._colJson.formulaId = formulaId;
        };

        FormulaColumn.prototype.getFormulaQuery = function () {
            return this._colJson.formulaQuery || null;
        };

        FormulaColumn.prototype.setFormulaQuery = function (formulaQuery) {
            this._colJson.formulaQuery = formulaQuery;
        };

        FormulaColumn.prototype.clearFormulaQuery = function () {
            delete this._colJson.formulaQuery;
        };

        FormulaColumn.prototype.getFormulaTokens = function () {
            return this._colJson.formulaTokens;
        };

        FormulaColumn.prototype.setFormulaTokens = function (formulaTokens) {
            this._colJson.formulaTokens = formulaTokens;
        };

        FormulaColumn.prototype.clearFormulaTokens = function () {
            delete this._colJson.formulaTokens;
        };

        FormulaColumn.prototype.isFormula = function () {
            return true;
        };

    /**
     * Returns the Logical Key
     * @return {string}
     * @override
     */
        FormulaColumn.prototype.getLogicalKey = function () {
            return this.getFormulaId();
        };

    /**
     * Returns the Logical Key
     * @return {string}
     * @override
     */
        FormulaColumn.prototype.getTokenLookupKey = function () {
            return this.getFormulaId();
        };

    /**
    * Returns the Base Column Guid
    * @return {string}
    * @override
    */
        FormulaColumn.prototype.getBaseColumnGuid = function () {
            return this.getGuid();
        };

        FormulaColumn.prototype.getBaseColumn = function () {
            return this;
        };

        return LogicalTableModel;
    }]);
