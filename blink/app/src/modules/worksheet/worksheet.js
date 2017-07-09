/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Controller for worksheet.
 */

// Note (Shikhar) - I implemented expand/collapse of groups using Slick.Data.GroupItemMetadataProvider but the problem
// is that this is not integrated well with rowSelectionModel and checkboxSelection. checkboxSelection maintains indices
// of rows selected and these indices change when we expand/collapse so this messes up.
// The way to implement: use Slick.Data.GroupItemMetadataProvider for grouping. Register onClick handler and handle
// checkboxes in this code on items rather than on indices as in checkboxSelection.
// Or checkout syncGridSelection(grid, preserveHidden) and syncGridCellCssStyles(grid, key)

'use strict';

blink.app.controller('WorksheetController', ['$rootScope',
    '$scope',
    '$templateCache',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'strings',
    'dataService',
    'events',
    'joinPathRegistry',
    'Logger',
    'metadataUtil',
    'safeApply',
    'sageDataSourceService',
    'sessionService',
    'tableUtil',
    'worksheetBuilder',
    'worksheetUtil',
    'UserAction',
    'util',
    function ($rootScope,
          $scope,
          $templateCache,
          alertConstants,
          alertService,
          blinkConstants,
          strings,
          dataService,
          events,
          joinPathRegistry,
          Logger,
          metadataUtil,
          safeApply,
          sageDataSourceService,
          sessionService,
          tableUtil,
          worksheetBuilder,
          worksheetUtil,
          UserAction,
          util) {

        var _logger = Logger.create('worksheet-controller');

        $scope.blinkConstants = blinkConstants;
        $scope.strings = strings;
    // Note: This has the new name and not the name from JSON. Both of these are same except in cases where we detect
    // duplicate names. In this case, the underlying JSON does not change, but the mapping in this object changes.
        var colDataRowIndexToColName = {};

        var $table;

        var dataView,
            checkboxSelector,
            slickEventHandler;

        var selectedRowsIncludingGrps = [];

        var hasAnyInvalidColumnName = false;

        var isReadOnly = false;

        var worksheetModel = null;

        var columns = null;

        var SlickGridColumnId = {
            NAME: 'colName',
            CHECKBOX: 'checkboxSelectColumn',
            JOIN_MAPPING: 'changeJoinMapping',
            SAMPLE_VALUE_1: 'Sample Value 1',
            SAMPLE_VALUE_2: 'Sample Value 2',
            SAMPLE_VALUE_3: 'Sample Value 3'
        };

        var SampleValuesState = {
            NOT_LOADED: 'NOT_LOADED',
            UNAVAILABLE: 'UNAVAILABLE',
            AVAILABLE: 'AVAILABLE'
        };
        var sampleValuesState = SampleValuesState.NOT_LOADED;

    // Column number in slick grid in edit mode
        var EDIT_JOIN_PATH_BTN_COLUMN = 2,
            COLUMN_NAME_EDIT_MODE_COLUMN = 1,
            COLUMN_NAME_READ_ONLY_MODE_COLUMN = 0;

    // Configuration options for Slick Grid
        var slickGridOptions = {
            editable: true,
            enableCellNavigation: true,
            enableColumnReorder: false,
            multiColumnSort: false,
            syncColumnCellResize: true,
            fullWidthRows: true,
            forceFitColumns: true,
            rowHeight: 38,
        // Note (Shikhar) - this flag is set to bypass code in RowSelectionModel that permits selecting multiple rows
        // through Ctrl Click, etc.
        // Selecting multiple Checkboxes operates independent of the above code.
            multiSelect: false
        };

        var TOOLTIP_CONTAINER = '.bk-worksheet';

        var tooltipOptions = {
            placement: 'auto',
            container: TOOLTIP_CONTAINER,
            delay: {
                show: 300
            }
        };

        var sampleValueFormatter = function (row, col, value, colDef, rowDef) {
            if (sampleValuesState == SampleValuesState.NOT_LOADED) {
                return blinkConstants.LOADING_SAMPLE_VALUE;
            }
            if (sampleValuesState == SampleValuesState.UNAVAILABLE) {
                return strings.UNAVAILABLE_COLUMN_SAMPLE_VALUE;
            }

            var column = rowDef.column;
            return (column.getDataFormatter()(column.convertValueFromBackend(value), {
                noShorten: true
            }) + '').escapeHTML();
        };

        function columnNameFormatter(row, cell, value) {
            if (isReadOnly) {
                return value;
            }

        // NOTE(vibhor): We directly insert the escaped html into the template here rather than using ng-bind-html.
        // The reason is that an ng-bind-html requires angular compilation cycle. Moreover, when browser constructs
        // a dom from a template string that contains escaped html sequence, it is smart enough to treat that as
        // inner html versus inner text.
        // Contrast this with the use of an escaped-html sequence inside an angular {{ }} expression. That requires
        // a compile cycle and it does an innerText() rather than innerHTML. For latter, use ng-bind-html directive.
            return '<div class="edit-wrapper">' +
            '<div class="bk-icon bk-style-icon-edit-small"></div>' +
            '<div class="bk-value">{1}</div>'.assign((value + '').escapeHTML()) +
            '</div>';
        }

        function changeJoinMappingColumnFormatter(row) {
            var rowItem = $scope.grid.getDataItem(row);
            if (!joinPathRegistry.isJoinPathEditableForColumn(rowItem.column)) {
                return '';
            }

            return '<div class="join-path-edit-wrapper">' +
            '<div class="bk-icon bk-style-icon-link"></div>' +
            '</div>';
        }

    // Note (Shikhar) - Slick grid adds the css of first column to the css of the group cell
        var DEFAULT_COLUMN_SET = [{
            id: SlickGridColumnId.NAME,
            name: 'Column Name',
            field: 'colName',
            editor: Slick.Editors.Text,
            autoEdit: true,
            cssClass: 'column-name-cell',
            formatter: columnNameFormatter
        }, {
            id: SlickGridColumnId.JOIN_MAPPING,
            name: 'changeJoinMapping',
            field: 'changeJoinMapping',
            cssClass: 'change-join-cell',
            formatter: changeJoinMappingColumnFormatter,
            focusable: false,
            maxWidth: 35
        }, {
            id: SlickGridColumnId.SAMPLE_VALUE_1,
            name: 'Sample Value 1',
            field: 's0',
            formatter: sampleValueFormatter,
            focusable: false
        }, {
            id: SlickGridColumnId.SAMPLE_VALUE_2,
            name: 'Sample Value 2',
            field: 's1',
            formatter: sampleValueFormatter,
            focusable: false
        }, {
            id: SlickGridColumnId.SAMPLE_VALUE_3,
            name: 'Sample Value 3',
            field: 's2',
            formatter: sampleValueFormatter,
            focusable: false
        }];

        function setData() {
            var worksheetCols = worksheetModel.getColumns();
            var data = worksheetCols.map(function(column, j) {
                colDataRowIndexToColName[column.getDataRowIndex()] = column.getName().toLowerCase();

                var sourceId;
                if (column.isFormula()) {
                    sourceId = 'Formulas';
                } else if (!column.getSources() || (column.getSources().length) === 0) {
                    sourceId = 'Missing';
                } else {
                    sourceId = column.getSources()[0].tableId + '_##_' + column.getSourceName();
                }

                var rowWithField = {
                    id: 'id_' + j,
                    column: column,
                    colName: column.getName(),
                    sourceId: sourceId
                };

                worksheetModel.getDataForColumn(column).each(function (val, i) {
                    rowWithField['s' + i] = val;
                });

                return rowWithField;
            });

            dataView.setItems(data);
        }

        function updateData() {
            dataView.beginUpdate();

            dataView.getItems().each(function(item){
                var column = item.column;
                worksheetModel.getDataForColumn(column).each(function (val, i) {
                    item['s' + i] = val;
                });
                dataView.updateItem(item.id, item);
            });

            dataView.endUpdate();
        }

        function loadData() {
            setData();

        // bail out only after making sure we have columns and empty value
        // markers set in the grid
            if ($scope.isCorrupt()) {
                return;
            }

        // in case of adding columns to worksheets we already
        // have the data available
            if (worksheetModel.hasNotFetchedData()) {
                if (!sessionService.isWorksheetSampleValuesDisabled()) {
                    var postParams = {
                        content: JSON.stringify(worksheetModel.getMetadataJson())
                    };

                    dataService.getTableData(postParams)
                    .then(function(response){
                        worksheetModel.setData(response.data.tableData.data);
                        sampleValuesState = SampleValuesState.AVAILABLE;
                        updateData();
                    }, function(response){
                        sampleValuesState = SampleValuesState.UNAVAILABLE;
                        updateData();
                    });
                } else {
                    sampleValuesState = SampleValuesState.UNAVAILABLE;
                }
            } else {
                sampleValuesState = SampleValuesState.AVAILABLE;
            }
        }

        function getSourceNameForGroup(g) {
        // for formulae the formatting is different from other columns
            var sourceName = g.value,
                sourceComponents = g.value.split('_##_');
            if (sourceComponents.length > 1) {
                sourceName = sourceComponents[1];
            }
            return sourceName;
        }

        function groupBySourceId() {
            dataView.setGrouping({
                getter: 'sourceId',
                formatter: function (g) {
                    var sourceName = getSourceNameForGroup(g);
                    if (isReadOnly) {
                        return sourceName;
                    }
                    return '<input type="checkbox" class="group-checkbox">' + ' ' + sourceName;
                }
            });
        }

        function emptySlickgrid() {
            if (!$scope.grid) {
                return;
            }

            slickEventHandler.unsubscribeAll();
            $scope.grid.destroy();
            $scope.grid = null;
        }

        function initSlickGridVars() {
            columns = DEFAULT_COLUMN_SET.slice(0);

            dataView = new Slick.Data.DataView({
                inlineFilters: true
            });

            if (!isReadOnly) {
                checkboxSelector = new Slick.CheckboxSelectColumn({
                    cssClass: "slick-cell-checkbox",
                    width: 54
                });
                columns.unshift(checkboxSelector.getColumnDefinition());
            } else {
                columns.remove(function(colDef){
                    return colDef.id === SlickGridColumnId.JOIN_MAPPING;
                });
            }

            setBrokenColumnCss();
        }

        function setBrokenColumnCss() {
        // Note (sunny): it seems the only way decent way to apply css to a
        // row based on its data is using override of getItemMetadata. Unfortunately
        // it looks like the getItemMetadata is set on each instance of Slick.Data.DataView
        // and not on the prototype, hence inheritance is not an option.
        // We also need to re-use the default code for getItemMetadata that handles the grouping
        // rows.
            var defaultMetadataProvider = dataView.getItemMetadata;
            dataView.getItemMetadata = function (rowIndex) {
                var row = this.getItem(rowIndex);
                var defaultMetadata = defaultMetadataProvider(rowIndex);
                if (row.column && !row.column.isColumnComplete()) {
                    if (!defaultMetadata) {
                        defaultMetadata = {};
                    }
                    if (!defaultMetadata.cssClasses) {
                        defaultMetadata.cssClasses = '';
                    }
                    defaultMetadata.cssClasses += ' bk-broken-worksheet-column';
                }
                return defaultMetadata;
            };
        }

        function checkInvalidColNames() {
            var dataLengthIncludingGrps = $scope.grid.getDataLength() || 0,
                namesToIndices = {},
                cssObj = {colName: 'bk-identical-column-names'},
                invalidRowToCssObj = {};

            for (var i = 0; i < dataLengthIncludingGrps; i++) {
                var row = $scope.grid.getDataItem(i);
                if (row instanceof Slick.Group) {
                    continue;
                }
                var colName = (row.colName || '').toLowerCase();
                if (!namesToIndices.hasOwnProperty(colName)) {
                    namesToIndices[colName] = [];
                }
                namesToIndices[colName].push(i);
            }

            hasAnyInvalidColumnName = false;

            var fillInvalidRowToCssObj = function (rowIdx) {
                invalidRowToCssObj[rowIdx] = cssObj;
            };

            for (var name in namesToIndices) {
                if (namesToIndices.hasOwnProperty(name)) {
                    if (namesToIndices[name].length > 1) {
                        hasAnyInvalidColumnName = true;
                        namesToIndices[name].each(fillInvalidRowToCssObj);
                    }
                }
            }
            $scope.modelValidationError.message = hasAnyInvalidColumnName ? new Error('Invalid column name(s)') : null;
            $scope.grid.setCellCssStyles('invalidName', invalidRowToCssObj);
        }

    // Note (Shikhar) - as we set the selectActiveRow: false in rowSelectionModel, this function is not triggered
    // unless we select the rows through checkbox.
        function onSelectedRowsChanged(evt, args) {
            selectedRowsIncludingGrps = args.rows || [];
            safeApply($scope);
        }

        function onColumnRename(e, args) {
            var colRow = args.item;
            colRow.colName = colRow.colName ? colRow.colName.trim() : '';
            var colDataRowIndex = colRow.column.getDataRowIndex(),
                newName = colRow.colName || '';
            colDataRowIndexToColName[colDataRowIndex] = newName.toLowerCase();
            worksheetBuilder.updateColumnName(colRow.column, newName);
            if (!worksheetModel.setColumnName(newName, colDataRowIndex) || hasAnyInvalidColumnName) {
                checkInvalidColNames();
            } else {
                $scope.grid.removeCellCssStyles('invalidName');
            }

            safeApply($scope);
        }

        function getTooltipTextForEditJoinPath(column) {
            return joinPathRegistry.getJoinPathLabel(column);
        }

        function getTooltipTextForColumnName($cell, column) {
            if ($cell.length === 0) {
                return '';
            }
            if (column.isFormula()) {
                var rows = column.getSources().map(function(source) {
                    return $templateCache.get('worksheet-formula-column-row')
                        .assign(strings.column_from_table)
                        .assign({
                            columnName: source.columnName.escapeHTML(),
                            tableName: source.tableName.escapeHTML()
                        });
                });
            // this formula has no sources
                if (rows.length === 0)  {
                    return '<span>{1}</span>'.assign(strings.worksheets.noSources);
                }
                return  $templateCache.get('worksheet-formula-column-table')
                .assign(strings.worksheets.sources, rows.join(''));

            } else {
                var originalColumn = column.getOriginInfo() && column.getOriginInfo().column;
                if (originalColumn) {
                    return $templateCache.get('worksheet-column-tooltip')
                        .assign(
                            strings.worksheets.source,
                            strings.column_from_table.assign({
                                columnName: originalColumn.getName().escapeHTML(),
                                tableName: originalColumn.getOwnerName().escapeHTML()
                            })
                        );
                }
            }
            return '';
        }

        function setTooltip(e, args) {
            var cell = $scope.grid.getCellFromEvent(e);
            if (cell) {
                if ((isReadOnly && cell.cell !== COLUMN_NAME_READ_ONLY_MODE_COLUMN) || (!isReadOnly &&
                cell.cell !== COLUMN_NAME_EDIT_MODE_COLUMN && cell.cell !== EDIT_JOIN_PATH_BTN_COLUMN)) {
                    return;
                }

                var $cell = $($scope.grid.getCellNode(cell.row, cell.cell)),
                    row = $scope.grid.getDataItem(cell.row);

                // Group items do not show tooltip.
                if (row instanceof Slick.Group) {
                    return;
                }

                var column =  row.column,
                    text;

                if (angular.isDefined($cell.attr('data-original-title'))) {
                // We have already calculated its tooltip before.
                    return;
                }

                if (!isReadOnly && cell.cell === EDIT_JOIN_PATH_BTN_COLUMN) {
                    text = getTooltipTextForEditJoinPath(column);
                } else {
                    text = getTooltipTextForColumnName($cell, column);
                }
                $cell.attr('data-original-title', text);
                $cell.attr('data-html', true);
                $cell.tooltip(tooltipOptions);
            // We have to do an explicit show for the first time because we have just installed a tooltip and bootstrap
            // waits for the hover event to show the tooltip.

            // remove any existing tooltips that might be showing
                var selector = '{1} > .tooltip'.assign(TOOLTIP_CONTAINER);
                $(selector).remove();
                $cell.tooltip('show');
            }
        }

        function onSlickgridClick(e, args) {
            if (isReadOnly) {
                _logger.error('onClick handler called on readonly WS', e, args);
                return;
            }

            if (args.cell !== EDIT_JOIN_PATH_BTN_COLUMN) {
                return;
            }

            var rowItem = $scope.grid.getDataItem(args.row);
            if (!joinPathRegistry.isJoinPathEditableForColumn(rowItem.column)) {
                return;
            }

            worksheetBuilder.editJoinPathForColumn(rowItem.column, $scope.documentConfig);

        // We dont do e.stopImmediatePropagation() so that slick.grid handleClick() can set the correct active cell.
        // e.stopPropagation() is sufficient to stop notifying other handlers.
            e.stopPropagation();
        }

        var onWindowClick = function ($table, $evt) {
            tableUtil.onWindowClick($scope.grid, $table, $evt);
        };

        $scope.onEscape = function () {
            tableUtil.onEscape($scope.grid);
        };

        function setSlickGridProperties() {
        // Make the grid respond to DataView change events.
            slickEventHandler.subscribe(dataView.onRowCountChanged, function (e, args) {
                $scope.grid.updateRowCount();
                $scope.grid.render();
            });

            slickEventHandler.subscribe(dataView.onRowsChanged, function (e, args) {
                $scope.grid.invalidateRows(args.rows);
                $scope.grid.render();
            });

            slickEventHandler.subscribe($scope.grid.onMouseEnter, setTooltip);

            if (isReadOnly) {
                return;
            }

            $scope.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
            $scope.grid.registerPlugin(checkboxSelector);

            slickEventHandler.subscribe($scope.grid.onSelectedRowsChanged, onSelectedRowsChanged);
            slickEventHandler.subscribe($scope.grid.onCellChange, onColumnRename);
            slickEventHandler.subscribe($scope.grid.onClick, onSlickgridClick);
        }

        var updateSlickgrid = function () {
            emptySlickgrid();
            initSlickGridVars();

            $scope.grid = new Slick.Grid($table, dataView, columns, slickGridOptions);

        // Set Slick Grid properties
            setSlickGridProperties();

        // initialize the model after all the events have been hooked up
            dataView.beginUpdate();
            loadData();
            groupBySourceId();
            dataView.endUpdate();
            $scope.grid.render();

            checkInvalidColNames();

            $scope.$on(events.LAYOUT_REFLOW_REQUIRED_U, function () {
                if($scope.grid) {
                    $scope.grid.resizeCanvas();
                }
            });
        };

        function isAnyRowSelected() {
            return !!(selectedRowsIncludingGrps && selectedRowsIncludingGrps.length);
        }
        $scope.isAnyRowSelected = isAnyRowSelected;

        function doBulkAction(actionFn) {
            if (!isAnyRowSelected() || isReadOnly || !actionFn) {
                return;
            }

            var columns = [];
            selectedRowsIncludingGrps.each(function (val) {
                var row = $scope.grid.getDataItem(val);
                if (!row || row instanceof Slick.Group) {
                    return;
                }
                columns.push(row.column);
            });

            actionFn(columns);
        }

        function deleteAllColumns() {
            worksheetBuilder.removeColumns(worksheetModel.getColumns(), $scope.documentConfig);
            selectedRowsIncludingGrps = [];
        }

        $scope.onClickBulkDelete = function () {
            doBulkAction(function (columns) {
                worksheetBuilder.removeColumns(columns, $scope.documentConfig);
                selectedRowsIncludingGrps = [];
            });
        };

        $scope.onClickBulkAddPrefix = function () {
            doBulkAction(function (columns) {
                worksheetBuilder.handleBulkPrefix(columns, function () {
                    updateSlickgrid();
                });
            });
        };

        $scope.onRemoveAllBrokenColumnsClick = function () {
            return worksheetBuilder.removeAllBrokenColumns($scope.documentConfig);
        };

        function initReadOnlyMode() {
        // make slick grid non-editable
            angular.extend(slickGridOptions, {
                editable: false
            });
        }

        $scope.isReadOnly = function () {
            return isReadOnly;
        };

        $scope.isCorrupt = function () {
            if (!$scope.documentConfig) {
                return false;
            }
            if (!$scope.documentConfig.model) {
                return false;
            }
            return $scope.documentConfig.model.isCorrupted();
        };

        $scope.init = function ($tableElem) {
            $table = $tableElem;
            slickEventHandler = new Slick.EventHandler();

            var worksheetModelWatchTriggeredOnce = false;
            $scope.$watch('documentConfig.model', function worksheetModelWatchAction(newModel, oldModel) {
                if ((newModel === oldModel) && worksheetModelWatchTriggeredOnce) {
                    return;
                }

                worksheetModelWatchTriggeredOnce = true;
                worksheetModel = newModel;

                if (!worksheetModel) {
                    $scope.noData = true;
                    return;
                }

                isReadOnly = worksheetModel.getPermission().isReadOnly() || worksheetModel.isCorrupted();
                if (isReadOnly) {
                    initReadOnlyMode();
                }

                $scope.noData = false;

            // Defer the update of slick grid to next event loop as without this if a there is a transition of
            // noData from true to false, the resultant removal of ng-hide from table-container does require one event
            // loop to kick in, and as our updateSlickGrid require the height of table-container (which is 0 if ng-hide
            // class is applied), we need to wait an extra event loop
                util.executeInNextEventLoop(function() {
                    updateSlickgrid();
                });
            });

        // We are not using blink-overlay because it ignores click on the table container, but we want to ignore click
        // only on slick rows.
            $(window).on('mousedown.worksheet', onWindowClick.bind(this, $tableElem));

        };

        $scope.$on('$destroy', function () {
            worksheetBuilder.clearState();
            $(window).off('mousedown.worksheet');
        });

        $scope.$on(events.REMOVE_ALL_WORKSHEET_COLUMNS_D, function($evt){
            deleteAllColumns();
        });

        sageDataSourceService.invalidateCache();
    }]);

blink.app.directive('blinkWorksheet', ['blinkConstants',
    'strings',
    'Logger',
    'worksheetBuilder',
    function (blinkConstants,
          strings,
          Logger,
          worksheetBuilder) {

        var _logger = Logger.create('worksheet-ui');

        var slickgridColumnNameCellClass = 'column-name-cell',
            slickgridColumnNameCellSelector = '.' + slickgridColumnNameCellClass;

        function linker(scope, $container, attrs) {
            var $table = $container.find('.bk-table-container');

            scope.isClickInsideColumnNameCell = function ($evt) {
                var $target = $($evt.target),
                    $cellElem = $(slickgridColumnNameCellSelector, $table);

                return $target.hasClass(slickgridColumnNameCellClass) || !!$cellElem.has($target).length;
            };

            scope.getCorruptWorksheetWarningMessagePrefix = function () {
                return strings.worksheets.corruptWorksheetWarning.PREFIX;
            };

            scope.getCorruptWorksheetWarningLinkActionMessage = function () {
                return strings.worksheets.corruptWorksheetWarning.LINK_ACTION;
            };

            scope.getCorruptWorksheetWarningMessageSuffix = function () {
                return strings.worksheets.corruptWorksheetWarning.SUFFIX;
            };

            scope.init($table);

            $container.on('$destroy', function () {
                worksheetBuilder.clearState();
            });
        }

        return {
            restrict: 'A',
            replace: true,
            scope: {
                documentConfig: '=',
                modelValidationError: '='
            },
            link: linker,
            templateUrl: 'src/modules/worksheet/worksheet.html',
            controller: 'WorksheetController'
        };
    }]);
