/**
 * Copyright Thoughtspot Inc. 2016
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview: class to create a properties model given the logical table model
 *
 */
'use strict';

blink.app.factory('SlickgridTablePropertiesModel', ['blinkConstants',
    'strings',
    'jsonConstants',
    'SlickColumns',
    'tableUtil',
    'userDialogs',
    'util',
    function (blinkConstants,
          strings,
          jsonConstants,
          SlickColumns,
          tableUtil,
          userDialogs,
          util) {

        var GEO_CONFIG_EDITOR_DIALOG_CLASS = 'bk-geo-config-editor-dialog';

        function SlickgridTablePropertiesModel(logicalModel, params) {
            this._logicalTableModel = logicalModel;
            var isReadOnly = params.isReadOnly;

        // Due to a callosum issue, we are not allowing column type editing for worksheets for now.
            var allowColumnTypeEditing =
            (logicalModel.getMetadataSubType() != jsonConstants.metadataType.subType.WORKSHEET);

            var logicalCols = logicalModel.getColumns();
            if (!logicalCols || !logicalCols.length) {
                return;
            }

            this._colDataRowIndexToColNameSlickGrid = {};

            var columns = [
                new SlickColumns.EditableTextColumn({
                    field: 'colName',
                    name: 'Column Name',
                    getter: 'getName'
                }, isReadOnly),
                new SlickColumns.EditableTextColumn({
                    field: 'colDesc',
                    name: 'Description',
                    getter: 'getDescription'
                }, isReadOnly),
                new SlickColumns.BaseColumn({
                    field: 'dataType',
                    name: 'data type',
                    getter: 'getDataType'
                }),
                new SlickColumns.SelectEditColumn({
                    field: 'colType',
                    name: 'column type',
                    getter: 'getType'
                }, allowColumnTypeEditing),
                new SlickColumns.BooleanEditColumn({
                    field: 'isAdditive',
                    name: 'Additive',
                    getter: 'isAdditive'
                }, allowColumnTypeEditing),
                new SlickColumns.SelectEditColumn({
                    field: 'aggType',
                    name: 'aggregation',
                    getter: 'getAggregateType'
                }, allowColumnTypeEditing),
                new SlickColumns.BooleanEditColumn({
                    field: 'hidden',
                    name: 'hidden',
                    getter: 'isHidden',
                }, true),
                new SlickColumns.EditableTextColumn({
                    name: 'Synonyms',
                    field: 'synonyms',
                    getter: 'getSynonyms',
                }, isReadOnly),
                new SlickColumns.SelectEditColumn({
                    name: 'Index Type',
                    field: 'indexType',
                    getter: 'getIndexType',
                    minWidth: blinkConstants.dataColumnHeaders.indexType.MIN_WIDTH
                }, true),
                new SlickColumns.BaseColumn({
                    name: strings.metadataExplorer.geoConfigEditor.GEO_CONFIG,
                    field : 'geoConfig',
                    getter: 'getGeoConfig',
                    cssClass: 'geo-config-cell',
                    editor: tableUtil.dialogEditor(
                        userDialogs.showGeoConfigEditorDialog,
                        GEO_CONFIG_EDITOR_DIALOG_CLASS
                    ),
                    formatter: tableUtil.geoConfigDisplayFormatter,
                    minWidth: blinkConstants.dataColumnHeaders.geoConfig.MIN_WIDTH,
                    tableModel: logicalModel
                }, isReadOnly),
                new SlickColumns.NumberEditColumn({
                    name: 'Index Priority',
                    field: 'indexPriority',
                    getter: 'getIndexPriority',
                }, isReadOnly),
                new SlickColumns.EditableTextColumn({
                    name: 'Format Pattern',
                    field: 'formatPattern',
                    getter: 'getDefaultFormatPattern',
                    isEditable: function(item) {
                        return item.column.isDateColumn()
                        || item.column.isNumeric();
                    },
                    validator: function(formatPattern, item) {
                        var column = item.column;
                        var isValid = true;
                    // we currently don't have validation
                    // support for dates
                        if (column.isEffectivelyNumeric()) {
                        // TODO (sunny): present the validation message
                        // coming from icu4js to the user.
                            isValid = util.isValidNumberFormat(formatPattern);
                        }

                        return {
                            valid: isValid,
                            msg: null
                        };
                    }
                }, isReadOnly),
                new SlickColumns.BaseColumn({
                    name: strings.metadataExplorer.currencyEditor.CURRENCY_TYPE,
                    field : 'currencyTypeInfo',
                    getter: 'getCurrencyTypeInfo',
                    cssClass: 'currency-type-cell',
                    editor: tableUtil.dialogEditor(
                    userDialogs.showCurrencyTypeEditDialog.bind(null, logicalModel.getColumns()),
                    'bk-currency-editor-dialog'
                ),
                    formatter: tableUtil.currencyTypeInfoFormatter,
                    minWidth: blinkConstants.dataColumnHeaders.currencyType.MIN_WIDTH,
                    tableModel: logicalModel
                }, isReadOnly),
                new SlickColumns.BooleanEditColumn({
                    name: 'Attribution Dimension',
                    field: 'attributionDimension',
                    getter: 'isAttributionDimension',
                }, true)
            ];

            var data = logicalCols.reduce(function (result, column) {
                var row = {};
                angular.forEach(columns, function (prop) {
                    row[prop.field] = column[prop.getter]();
                    row.column = column;
                });
                result.push(row);
                return result;
            }, []);

            var model = {
                columns: columns,
                data: data,
                onUpdate: this.updateProperties
            };

            var permission = logicalModel.getPermission();
            var config = {
                editableColumnHeaders: permission && permission.isChangingColumnNameAllowed()
            };

            this.model = model;
            this.config = config;
        }

        return SlickgridTablePropertiesModel;
    }]);
