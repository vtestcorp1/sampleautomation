/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com), Stephane Kiss (stephane@thoughtspot.com), Shikhar Agarwal (shikhar@thoughtspot.com)
 *
 * @fileoverview Controller for Table Viz
 * This defines functions to set row span, configure all the Slick Grid properties and configure scope handlers.
 */

'use strict';

/* global addBooleanFlag */
addBooleanFlag('enableTableColumnHeaderMenu', 'If true, user should see a table column header button which can be ' +
    'clicked to show a menu containing filters or other column level operations',
    false);

/* eslint max-params: 1 */
blink.app.controller('TableController', ['$q',
    '$rootScope',
    '$route',
    '$scope',
    '$timeout',
    'alertService',
    'blinkConstants',
    'columnMenuUtil',
    'vizContextMenuLauncher',
    'dataService',
    'dateUtil',
    'vizContextMenuUtil',
    'env',
    'events',
    'jsonConstants',
    'Logger',
    'perfMeter',
    'routeService',
    'safeApply',
    'sessionService',
    'slackService',
    'strings',
    'tableUtil',
    'UserAction',
    'util',
    'vizColTransformationService',
    'tableContextMenuUtil',
    function ($q,
              $rootScope,
              $route,
              $scope,
              $timeout,
              alertService,
              blinkConstants,
              columnMenuUtil,
              vizContextMenuLauncher,
              dataService,
              dateUtil,
              vizContextMenuUtil,
              env,
              events,
              jsonConstants,
              Logger,
              perfMeter,
              routeService,
              safeApply,
              sessionService,
              slackService,
              strings,
              tableUtil,
              UserAction,
              util,
              vizColTransformationService,
              tableContextMenuUtil) {
        var CELL_TEMPLATE = '<div class="slick-cell-content">{1}</div>',
            COLORED_CELL_TEMPLATE = '<div class="slick-cell-content" style="background-color:{1};"><span>{2}</span></div>';
        var CHOSEN_ELEMENT = 'select[extract-chosen-dropdown]';

        // TODO (sunny): Get rid of the global dependency, pass an explicit flag
        // to the directive
        var isPrintPage = routeService.getCurrentPage() === blink.app.pages.PRINT;

        var _logger = Logger.create('table-controller'),

            // max width of column in px
            COL_STARTER_WIDTH_MAX = 250,
            // Min width of column in px. This is a random value. We actually calculate the width from the data
            COL_STARTER_WIDTH_MIN = 20,
            COL_WIDTH_OVERHEAD = 45,
            TABLE_HEADER_BUTTON_WIDTH_OVERHEAD = 36,
            viewportChangeTimer = null,
            oldViewport = {},
            _isDownloading = false;

        // Configuration options for Slick Grid
        var slickGridOptions = {
            enableCellNavigation: true,
            enableColumnReorder: true,
            enableTextSelectionOnCells: true,
            multiColumnSort: true,
            syncColumnCellResize: true,
            fullWidthRows: true,
            forceFitColumns: false, // disabling to allow more flexibility of column resizing
            rowHeight: isPrintPage ? 19 : 38,
            enableAsyncPostRender: true
        };

        if (isPrintPage) {
            slickGridOptions.autoHeight = true;
        }

        var columnMenuPlugin, chosenColumnHeaderPlugin, tooltipPlugin;
        // Total calculated table width at render.
        $scope.tableWidth = -1;
        // set a flag when user clicks on any column header to sort
        $scope.userHasSorted = false;
        // hash of field id to data item length in chars, to calculate pixel width
        $scope.maxDataLengthForField = {};
        $scope.windowResizeTimer = null;

        // keep track of the order of sorted columns
        $scope.orderedSortedColumns = [];

        /**
         * This function is used to compare 2 rows of data given the columns to consider while sorting.
         * Note(Shikhar):
         * 1. Handle null/undefined manually, else this can give inconsistent result.
         * 2. Here null and undefined are treated as equal. Comparison is case insensitive
         * 3. This is stable sort - SCAL-2585
         */
        function compareRows(sortCols, dataRow1, dataRow2) {
            if (!sortCols || !sortCols.length) {
                return 0;
            }
            if (dataRow1.isNonDataRow && dataRow2.isNonDataRow) {
                return 0;
            }
            if (dataRow1.isNonDataRow && !dataRow2.isNonDataRow) {
                return 1;
            }
            if (!dataRow1.isNonDataRow && dataRow2.isNonDataRow) {
                return -1;
            }

            for (var i = 0, l = sortCols.length; i < l; i++) {
                var col = sortCols[i];
                var field = col.sortCol.field;
                var sign = col.sortAsc ? 1 : -1;
                var value1 = dataRow1[field], value2 = dataRow2[field];
                var order = util.comparator(value1, value2) * sign;
                // If order = 0, we iterate to the next comparable column
                if (!!order) {
                    return order;
                }
            }
            // This is for making the sort stable. For stability, it does not matter whether the sort is descending or ascending
            return (dataRow1.indexForStableSort < dataRow2.indexForStableSort) ? -1 : 1;
        }

        /**
         * Maximum number of rows of data that we will use to guess the maximum width of a column. This is needed to
         * avoid performance issues in formatting all table data values
         * @type {number}
         */
        var MAX_COL_MAX_WIDTH_CALC_ROWS = 500;

        /**
         * Processes a row in the table. Also updates the max width of each column if rowIndex is available
         * @param {Array} item array of values
         * @param {=Number} rowIndex index of this item in the list of all table data rows
         */
        function processRow(item, rowIndex) {
            var rowObj = {};
            var vizColumns = $scope.viz.getModel().getVizColumns();
            for (var i = 0; i < vizColumns.length; i++) {
                // No need to include data for hidden columns as they won't be included in the table.
                if (!vizColumns[i].isVisible()) {
                    continue;
                }
                var fid = 'f' + i;
                var value = item[i];
                // Note (Shikhar) - We cannot store formatted values in rowObj as functions like sorting, etc in Slickgrid
                // would break. We are converting to formatted value here to determine the width of the column.
                rowObj[fid] = value;

                if (rowIndex !== undefined && rowIndex < MAX_COL_MAX_WIDTH_CALC_ROWS) {
                    var formattedVal = tableUtil.getFormattedValue(vizColumns[i], value);
                    var itemLen = ('' + formattedVal).length;

                    $scope.maxDataLengthForField[fid] = $scope.maxDataLengthForField[fid] || 0;
                    $scope.maxDataLengthForField[fid] = Math.max($scope.maxDataLengthForField[fid], itemLen);
                }
            }
            return rowObj;
        }

        /**
         * data formatter that is used by Slick Grid column
         * @param row
         * @param cell
         * @param value
         * @param columnDef
         * @param dataContext
         * @returns {*}
         */
        function dataFormatter(row, cell, value, columnDef, dataContext) {
            if (angular.isDefined(dataContext.rowTemplate)) {
                // This will happen when in the slick grid data, we have injected some empty rows for special purposes.
                util.executeInNextEventLoop(function () {
                    $scope.recompileTable();
                });
                return '<div ng-include="\'{1}\'"></div>'.assign(dataContext.rowTemplate);
            }

            var dataColumn = $scope.viz.getModel().getColumn(columnDef.id);
            if (!dataColumn) {
                return null;
            }

            var finalValue = tableUtil.getFormattedValue(dataColumn, value);

            var metricsDefinition = dataColumn.getMetricsDefinition();
            if (metricsDefinition) {
                var color = metricsDefinition.getColorForValue(value);
                if (!!color) {
                    // TODO (sunny): cache the color conversion
                    var rgb = chroma(color).rgb();
                    var cssRGBA = 'rgba({1}, {2}, {3}, 0.5)'.assign(rgb[0], rgb[1], rgb[2]);
                    return COLORED_CELL_TEMPLATE.assign(cssRGBA, finalValue);
                }
            }
            return CELL_TEMPLATE.assign(finalValue);
        }

        function styleCellValuePostRender(cellNode, row, dataContext, colDef) {
            tableUtil.formatHyperlink(cellNode);
        }

        /**
         * Processes the table data, returns the array of rows we are going to render
         * inside slick grid.
         */
        $scope.getSlickGridDataRows = function () {
            var data = $scope.viz.getModel().getData() || [];
            data = data.map(angular.bind(null, processRow));
            if ($scope.viz.getModel().hasMoreData()) {
                data.push({
                    isNonDataRow: true,
                    rowTemplate: 'src/modules/viz-layout/viz/table/more-items-download-footer.html'
                });
            }
            return data;
        };

        /**
         * Prepares the table data in the format understood by Slick Grid
         */
        $scope.getSlickGridData = function(dataRows) {
            var slickData = {
                getItems: function () {
                    return dataRows;
                },
                setItems: function (items) {
                    dataRows = items;
                },
                getLength: function () {
                    return dataRows.length;
                },
                getItem: function (index) {
                    return dataRows[index];
                },
                getItemMetadata: function (index) {
                    return {};
                }
            };
            if (dataRows.length > 0 && dataRows[dataRows.length - 1].isNonDataRow) {
                slickData.getItemMetadata = function (index) {
                    if (index === this.getLength() - 1) {
                        return {
                            selectable: false,
                            "columns": {
                                0: {
                                    "colspan": "*"
                                }
                            },
                            cssClasses: 'full-colspan'

                        };
                    } else {
                        return {};
                    }
                };
            }
            return slickData;
        };


        $scope.updatePaginationInfo = function () {
            var vizModel = $scope.viz.getModel();
            $scope.viz.paginationInfo = tableUtil.getPaginationInfo(
                $scope.grid.getViewport(),
                vizModel.getData().length,
                !vizModel.getVizData().isLastBatch
            );
        };

        $scope.getTooltipForHeader = function (fid) {
            if (!fidToVizColumnMap.hasOwnProperty(fid)) {
                return '';
            }
            var col = fidToVizColumnMap[fid];

            return col.getTooltipInformationModel().getTemplate();
        };

        function updateColumnOrderWithSavedOrder(gridCols) {
            var userOrderedColumnIds = $scope.viz.getModel().getColumnOrder();
            if (!userOrderedColumnIds) {
                return;
            }

            var vizColumnIdToUserDefinedSortIndex = {};
            userOrderedColumnIds.each(function(colId, index){
                vizColumnIdToUserDefinedSortIndex[colId] = index;
            });

            gridCols.sort(function(col1, col2){
                var colSortIndex1 = Object.has(vizColumnIdToUserDefinedSortIndex, col1.id) ? vizColumnIdToUserDefinedSortIndex[col1.id] : Number.POSITIVE_INFINITY,
                    colSortIndex2 = Object.has(vizColumnIdToUserDefinedSortIndex, col2.id) ? vizColumnIdToUserDefinedSortIndex[col2.id] : Number.POSITIVE_INFINITY;

                return colSortIndex1 - colSortIndex2;
            });
            $scope.viz.getModel().updateColumnOrder(gridCols.map('id'));
        }

        var fidToVizColumnMap = {};
        /**
         * Prepares the columns in the format understood by Slick Grid
         */
        $scope.getColumnsForSlickGrid = function() {
            var vizColumns = $scope.viz.getModel().getVizColumns();
            var tableModel = $scope.viz.getModel();
            var sortable = $scope.viz.getModel().isSortable();

            var isTableColumnHeaderMenuEnabled = $scope.isTableColumnHeaderMenuEnabled();
            var columns = vizColumns.map(function (vizCol, i) {
                // Hidden columns shouldn't be shown in UI.
                if (!vizCol.isVisible()) {
                    return null;
                }
                var fid = 'f' + i,
                    effectiveColId = vizCol.getSageOutputColumnId(),
                    colTitle = vizCol.getName().escapeHTML(),
                    calcWidth = Math.max(util.getPixelWidthOfString(colTitle, 'bk-viz-table-header-string-width-calc'), COL_STARTER_WIDTH_MIN),
                    optimumWidth = tableModel.getUserSpecifiedColumnWidth(effectiveColId);

                if ((vizCol.supportsAggregationChange() && !vizCol.isGrowth())
                    || vizCol.supportsDateBucketizationChange()) {
                    colTitle = vizCol.getUnderlyingColumnName();
                }

                if (isPrintPage) {
                    var longestString = util.getStringOfLength(
                        Math.max($scope.maxDataLengthForField[fid], colTitle.length)
                    );
                    optimumWidth = util.getPixelWidthOfStringUsingCanvas(
                            longestString,
                            "7px Regular"
                        ) + 15;
                    optimumWidth = Math.max(60, optimumWidth);
                } else if(optimumWidth === void 0) {
                    // Note(joy): It is very slow to calculate pixel width of each item in the table cells. An alternative
                    // is to find the max string length
                    // and calculate the pixel width using the fattest character, say 'D'.
                    calcWidth = Math.max(calcWidth, util.getPixelWidthOfString(util.getStringOfLength(
                        $scope.maxDataLengthForField[fid]), 'bk-viz-table-cell-string-width-calc'));
                    optimumWidth = Math.min(COL_STARTER_WIDTH_MAX, COL_WIDTH_OVERHEAD + calcWidth);

                    if (isTableColumnHeaderMenuEnabled) {
                        optimumWidth += TABLE_HEADER_BUTTON_WIDTH_OVERHEAD;
                    }
                }


                fidToVizColumnMap[fid] = vizCol;

                _logger.log('table header title, calcWidth, optimumWidth:', colTitle, calcWidth, optimumWidth);

                var chosenPluginParams;
                if (vizCol.supportsDateBucketizationChange()) {
                    chosenPluginParams = {
                        optionsMap : Object.clone(
                            dateUtil.getSupportedTimeBuckets(vizCol.getEffectiveDataType())
                        ),
                        selectedValue : vizCol.getTimeBucket(),
                        width : '100px',
                        onSelectionChange: function (selection) {
                            var bucketizationChangeTransform = vizColTransformationService.getDateBucketingTransform(vizCol, selection);
                            $scope.sageClient.transformTable(bucketizationChangeTransform);
                        }
                    };
                } else if (vizCol.supportsAggregationChange()) {
                    var optionsMap = Object.clone(util.aggregateTypeLabelsToType);
                    delete optionsMap.NONE;
                    chosenPluginParams = {
                        optionsMap : optionsMap,
                        selectedValue : vizCol.getEffectiveAggregateType(),
                        width : '110px',
                        onSelectionChange: function (selection) {
                            var aggregationChangeTransform = vizColTransformationService.getAggregationTransform(vizCol, selection);
                            $scope.sageClient.transformTable(aggregationChangeTransform);
                        }
                    };
                }

                var menuPluginParams;
                // We don't support filters on growth column yet.
                if (!vizCol.isGrowth()) {
                    // In case filter editing is not allowed, we hide the column menu button,
                    // unless a filter or a column metric already exists, in which case we show
                    // the dropdown to open the filter/metric in read only mode.
                    var permission = $scope.viz.getModel().getContainingAnswerModel().getPermission();
                    if (!permission || permission.isChangingFiltersAllowed()
                        || columnMenuUtil.isOptionsAvailable($scope.viz.getModel(), vizCol)) {
                        menuPluginParams = {
                            getMenuBtnDom: function () {
                                return columnMenuUtil.getNewFilterMenuButtonNode(
                                    $scope,
                                    $scope.sageClient,
                                    vizCol,
                                    $scope.viz.getModel()
                                );
                            },
                            getMenuDom: function () {
                                return columnMenuUtil.getNewFilterMenuNode(
                                    $scope.$new(true),
                                    $scope.sageClient,
                                    vizCol,
                                    $scope.viz.getModel(),
                                    $scope.viz.getModel().getContainingAnswerModel().getPermission().isChangingFiltersAllowed(),
                                    function onTableReflowRequired() {
                                        $scope.viz.onLayoutReflowDone();
                                    }
                                );
                            }
                        }
                    }
                }

                var headerTooltip = $scope.getTooltipForHeader(fid);
                var minWidth = isPrintPage ? 0 : env.minTableColumnWidth;
                var columnConfig = {
                    id: effectiveColId,
                    name: colTitle,
                    headerCssClass: vizCol.isNumeric() ? 'bk-numeric-column' : '',
                    cssClass: vizCol.isNumeric() ? 'bk-numeric-column' : '',
                    field: fid,
                    defaultSortAsc: !vizCol.isNumeric(),  // Numeric: default sort descending, Non-numeric: sort asc
                    formatter: dataFormatter,
                    asyncPostRender: styleCellValuePostRender,
                    minWidth: minWidth,
                    sortable: sortable,
                    // Although Slick-grid will auto increase width if it is less than minimum, but
                    // we should set the initial value correct because we use this config to
                    // calculate how many columns we can put on one page.
                    width: Math.max(minWidth, optimumWidth),
                    editor: Slick.Editors.Text,
                    columnModel: vizCol,
                    toolTip: headerTooltip,// && headerTooltip.escapeHTML(),
                    chosenPluginParams: chosenPluginParams,
                    menuPluginParams: menuPluginParams
                };

                return columnConfig;
            });

            columns = columns.filter(function (col) {
                return col !== null;
            });

            return columns;
        };

        function onSlickGridColumnReorder(e, args) {
            var orderedColumnIDs = $scope.grid.getColumns().map('id');
            var tableModel = $scope.viz.getModel();
            tableModel.updateColumnOrder(orderedColumnIDs);
            tableModel.setIsConfigurationLocked(true);
            if (tableModel.getContainingAnswerModel()) {
                tableModel.getContainingAnswerModel().setHasUserTriggeredChanges(true);
            }
        }

        function onSlickGridColumnResized(event, slickGrid) {
            var slickColumns = slickGrid.grid.getColumns();
            var tableModel = $scope.viz.getModel();
            slickColumns.forEach(function(column){
                var width = column.width - TABLE_HEADER_BUTTON_WIDTH_OVERHEAD;
                tableModel.setUserSpecifiedColumnWidth(column.id, width);
            });
        }

        function sortGlobally(sortCols) {
            $scope.viz.getModel().clearColumnSorting();
            var logicalColumnsToSort = sortCols.map(function(col) {
                return {
                    id: col.sortCol.columnModel.getSageOutputColumnId(),
                    isAscending: col.sortAsc
                };
            });
            var sortingTransform = vizColTransformationService.getSortingTransform($scope.viz.getModel(), logicalColumnsToSort);
            $scope.sageClient.transformTable(sortingTransform);
        }

        function resortGrid() {
            if (!$scope.grid || $scope.orderedSortedColumns.length === 0) {
                return;
            }

            var gridColIdToGridCol = {};
            $scope.grid.getColumns().each(function(gridCol){
                gridColIdToGridCol[gridCol.id] = gridCol;
            });

            var sortCols = $scope.orderedSortedColumns
                .filter(function (sortColInfo) {
                    return gridColIdToGridCol.hasOwnProperty(sortColInfo.columnId);
                })
                .map(function(sortColInfo) {
                    return {
                        sortCol: gridColIdToGridCol[sortColInfo.columnId],
                        sortAsc: sortColInfo.sortAsc
                    };
                });
            //resorting is called only when we have saved sorting info, that in turn happens only for in the case of
            //local sorting (in case of global sorting the sage query contains all the sorting info)
            sortLocally(sortCols);
        }

        function sortLocally(sortCols, nonPersisted) {
            if (!isLocalSortingAllowed()) {
                return;
            }

            //in case of pinboards we don't want to change the model on local sorting, it will cause
            //an unsaved changes alert
            if (!nonPersisted) {
                $scope.viz.getModel().updateColumnSorting($scope.orderedSortedColumns);
            }

            var tableData = $scope.grid.getData().getItems();

            $scope.orderedSortedColumns = [];

            // actual sorting of data.
            // Appending an index field that would be helpful for stable sorting.
            tableData.forEach(function(row, index) {
                row.indexForStableSort = index;
            });

            tableData.sort(angular.bind(null, compareRows, sortCols));

            $scope.grid.getData().setItems(tableData);

            $scope.grid.scrollRowToTop(0);

            $scope.grid.invalidate();
        }

        function shouldOnlySortLocally(sortCols) {
            // Otherwise, if sage bar is not editable, then only allow local sorting.
            var answerModel = $scope.viz.getModel().getContainingAnswerModel();
            return !answerModel.getPermission().isSageAllowed();
        }

        function isLocalSortingAllowed() {
            return $scope.viz.getModel().getContainingAnswerModel().getPermission().isTableLocalSortingAllowed();
        }

        function sortGrid(sortCols) {
            if (shouldOnlySortLocally(sortCols)) {
                sortLocally(sortCols, true);
                return;
            }

            $scope.orderedSortedColumns = [];
            sortCols.each(function(col) {
                $scope.orderedSortedColumns.push({ columnId: col.sortCol.id, sortAsc: col.sortAsc });
            });

            $scope.userHasSorted = true;

            sortGlobally(sortCols);
        }

        /**
         * Sort handler for Slick Grid.
         * How multi-column sorting works:
         * 1. click on a column header -> only sort that column.
         * 2. shift + click on a column when another column is sorted and multicolumn sort is enabled -> sort that column as secondary sorting.
         * 3. meta + click on a sorted column -> makes it unsorted. if there was a secondary sorted column, it becomes primary sort column.
         */
        function onSortSlickGrid(e, args) {
            sortGrid(args.sortCols);
        }

        /**
         * Viewport change handler for Slick Grid.
         * It uses timeout to take care of scrolling - during scrolling, viewport changes. If the viewport changes
         * very quickly, we cancel the previous timeout call and make a new one. In this way, we don't re-render
         * during a fast scroll.
         * @param e
         * @param args
         */
        function onViewportChangedSlickGrid(e, args) {
            var viewport = args.grid.getViewport();

            // This mechanism avoids wasting time when at the end of an inertial scroll the viewport change event fires
            // many times with same viewport
            if (oldViewport.top === viewport.top && oldViewport.bottom === viewport.bottom) {
                return;
            } else {
                oldViewport = viewport;
            }

            if (viewportChangeTimer) {
                $timeout.cancel(viewportChangeTimer);
            }

            // use just enough delay so we don't handle during scrolling.
            // $timeout takes care of using $apply when the scroll is done.
            viewportChangeTimer = $timeout(function () {
                $scope.updatePaginationInfo();
            }, 100);
        }

        /**
         * In print mode, the pdf page size has a limited height a width so we can't simply
         * put the entire slickGrid table on one page as it will overflow. In order to solve this
         * we segment rows and columns based on how many maximum rows and columns we can put on each
         * page. Then for each segment we create one slickGrid and put it on one page, then finally
         * append these pages in the DOM in ROW MAJOR order. Like for example:
         * If we have 6 column and 40 rows, and if first page can only have 4 columns and 25 rows then:
         * (All indexes are zero-based)
         * page1 will have rows 0..24 and columns 0..3
         * page2 will have rows 0..24 and columns 4..5
         * page3 will have rows 24..39 and columns 0..3
         * page4 will have rows 24..39 and columns 4..5
         * @param $table
         * @param dataRows
         * @param columns
         * @param slickGridOptions
         */
        function initSlickGridForPrintView($table, dataRows, columns, slickGridOptions) {
            var colGroups = $scope.splitColumnsForPrintView(columns),
                rowGroups = $scope.splitRowsForPrintView(dataRows, slickGridOptions.rowHeight);

            rowGroups.forEach(function (dataRowBucket) {
                colGroups.forEach(function (cols) {
                    var $subTableContainer = $('<div>');
                    $subTableContainer.addClass('bk-sub-table-container');
                    $table.append($subTableContainer);

                    var slickData = $scope.getSlickGridData(dataRowBucket);
                    var slickGrid =
                        new Slick.Grid($subTableContainer, slickData, cols, slickGridOptions);
                    // Show aggregation type in column header.
                    // Note that we don't need to add any change handler here, because print view is
                    // completely non-interactive.
                    slickGrid.isUneditableAnswer = true;
                    slickGrid.registerPlugin(new Slick.Custom.ChosenColumnHeaderPlugin());
                    // update the sort indicator on headers
                    if ($scope.orderedSortedColumns.length) {
                        slickGrid.setSortColumns($scope.orderedSortedColumns);
                    }
                });
            });
        }

        function initSlickGrid($table, dataRows, columns, slickGridOptions, localSortingNeeded) {
            var tableData = $scope.getSlickGridData(dataRows);
            // create the new grid
            $scope.grid = new Slick.Grid($table, tableData, columns, slickGridOptions);

            // Set Slick Grid properties
            $scope.setSlickGridProperties();

            $scope.updatePaginationInfo();

            if (localSortingNeeded) {
                resortGrid();
            }
        }

        $scope.splitColumnsForPrintView = function (columns) {
            var pageWidth = blinkConstants.printing.PRINT_PAGE_WIDTH
                - 2 * blinkConstants.printing.VIZ_CONTENT_MARGIN
                - 2; // (for border);
            // a user can potentially make a column very wide
            // we can't have a column wider than the printed page
            columns.forEach(function(col){
                col.width = Math.min(
                    pageWidth,
                    col.width
                );
            });

            var filledWidth = 0,
                currentColGroup = [],
                colGroups = [];
            // splitting of columns into groups such that each group will fit on 1 page's width.
            columns.forEach(function (col) {
                if (filledWidth + col.width <= pageWidth) {
                    filledWidth += col.width;
                    currentColGroup.push(col);
                } else {
                    colGroups.push(currentColGroup);
                    currentColGroup = [col];
                    filledWidth = col.width;
                }
            });
            if (currentColGroup.length > 0) {
                colGroups.push(currentColGroup);
            }
            return colGroups;
        };

        $scope.splitRowsForPrintView = function (rows, rowHeight) {
            var sizeConstants = blinkConstants.printing,
                filledHeight = sizeConstants.VIZ_TITLE_HEIGHT +
                    2 * sizeConstants.VIZ_CONTENT_MARGIN +
                    sizeConstants.TABLE_HEADER_HEIGHT,
                totalAvailableHeight = sizeConstants.PRINT_PAGE_HEIGHT,
                currentRowGroup = [],
                rowGroups = [];
            // splitting of rows into groups such that each group will fit on one page's height.
            rows.forEach(function (row) {
                if (filledHeight + rowHeight <= totalAvailableHeight) {
                    currentRowGroup.push(row);
                    filledHeight += rowHeight;
                } else {
                    rowGroups.push(currentRowGroup);
                    // start a new slickgrid on a new page
                    currentRowGroup = [row];
                    filledHeight = sizeConstants.TABLE_HEADER_HEIGHT +
                        2 * sizeConstants.VIZ_CONTENT_MARGIN + rowHeight;
                }
            });
            if (currentRowGroup.length > 0) {
                rowGroups.push(currentRowGroup);
            }
            return rowGroups;
        };

        function resetTableUI() {
            if ($scope.grid) {
                $scope.grid.invalidateAllRows();
            }
            $scope.grid = null;
        }

        /**
         *  Set calculated table width.
         */
        function setTableWidthFromColumns(columns) {
            $scope.tableWidth = columns.reduce(function(totalWidth, col) {
                return totalWidth + col.width;
            }, 0);
        }

        /**
         * Initializes and configures Slick Grid. Also setup various scope data structures that are used by Slick Grid
         * @param $table - jQuery table object
         */
        $scope.configureSlickGrid = function ($table) {
            var tableModel = $scope.viz.getModel();

            if (!tableModel) {
                _logger.error('Configuring Slick Grid with undefined tableModel', tableModel);
                return;
            }

            // Note: instead of making this array of row objects, we can also pass a data model
            // https://github.com/mleibman/SlickGrid/wiki/API-Reference
            $scope.maxDataLengthForField = {};

            $scope.orderedSortedColumns = [];

            var localSortingNeeded = false;

            $scope.orderedSortedColumns = tableModel.getColumnSorting();
            if (!$scope.orderedSortedColumns) {
                // find out the sorted columns before preparing the columns data, in case it is needed
                $scope.orderedSortedColumns = tableModel.getVizColumns().filter(function (vizCol) {
                    return vizCol.isSorted();
                }).map(function (vizCol) {
                    return { columnId: vizCol.getSageOutputColumnId(), sortAsc: vizCol.isAscendingSort() };
                });
            } else {
                localSortingNeeded = true;
            }

            var dataRows = $scope.getSlickGridDataRows();
            var columns = $scope.getColumnsForSlickGrid();
            setTableWidthFromColumns(columns);
            updateColumnOrderWithSavedOrder(columns);
            slickGridOptions.enableColumnReorder = !isPrintPage && tableModel.isColumnReorderingAllowed();

            if (isPrintPage) {
                initSlickGridForPrintView(
                    $table,
                    dataRows,
                    columns,
                    slickGridOptions
                );
            } else {
                initSlickGrid(
                    $table,
                    dataRows,
                    columns,
                    slickGridOptions,
                    localSortingNeeded
                );
            }
        };

        $scope.$on(events.CLEAR_AND_HIDE_POPUP_MENU, function(){
            if (!!columnMenuPlugin) {
                columnMenuPlugin.closeMenu();
            }
        });

        function chosenSelectionChangeHandler(id, selection) {
        }

        /**
         * Sets the Slick Grid properties and event handlers.
         */
        $scope.setSlickGridProperties = function () {
            if (!$scope.grid) {
                _logger.error('Scope.grid is null or undefined', $scope.grid);
                return;
            }

            viewportChangeTimer = null;
            oldViewport = {};

            var permission = $scope.viz.getModel().getContainingAnswerModel().getPermission();
            $scope.grid.isUneditableAnswer = !!permission ? permission.isMissingUnderlyingAccess() : false;
            $scope.grid.isUneditableFilter = !!permission ? !permission.isChangingFiltersAllowed() : true;

            tableUtil.configureSelectionOnSlickGrid($scope.grid);
            tableUtil.configureKeyboardDataCopyOnSlickGrid($scope.grid, onCellDataCopy);

            // See https://github.com/mleibman/SlickGrid/blob/master/plugins/slick.autotooltips.js
            tooltipPlugin = new Slick.AutoTooltips({enableForHeaderCells: false});
            $scope.grid.registerPlugin(tooltipPlugin);

            if ($scope.isTableColumnHeaderMenuEnabled()) {
                var answerModel = $scope.viz.getModel().getContainingAnswerModel();
                $scope.filterPermissionMode = answerModel.getPermission().isChangingFiltersAllowed() ? 'editable' : 'readonly';

                columnMenuPlugin = new Slick.Custom.ColumnMenuPlugin();
                $scope.grid.registerPlugin(columnMenuPlugin);

                chosenColumnHeaderPlugin = new Slick.Custom.ChosenColumnHeaderPlugin();
                $scope.grid.registerPlugin(chosenColumnHeaderPlugin);
            }

            // update the sort indicator on table headers
            if ($scope.orderedSortedColumns.length) {
                $scope.grid.setSortColumns($scope.orderedSortedColumns);
                $scope.grid.invalidate();
            }

            // Set up event handlers
            $scope.grid.onSort.subscribe(onSortSlickGrid);
            $scope.grid.onColumnsReordered.subscribe(onSlickGridColumnReorder);
            $scope.grid.onColumnsResized.subscribe(onSlickGridColumnResized);
            $scope.grid.onViewportChanged.subscribe(onViewportChangedSlickGrid);
            $scope.grid.onClick.subscribe(onCellLeftClick);
            $scope.grid.onContextMenu.subscribe(onCellRightClick);

            $scope.grid.onHeaderCellRendered.subscribe(function (e, args) {
                $scope.installHeaderTooltip($(args.node));
                getChosenElement()
                    .on('chosen:showing_dropdown', handleDropDownShowing)
                    .on('chosen:hiding_dropdown', handleDropDownHiding);
            });

            // deactivate tooltip as it causes console error
            var sortablePlugin = getSortableElement();
            sortablePlugin.on('sortactivate.tooltipPlugin', function() {
                $scope.grid.unregisterPlugin(tooltipPlugin);
            });
            sortablePlugin.on('sortdeactivate.tooltipPlugin', function() {
                $scope.grid.registerPlugin(tooltipPlugin);
            });
            $scope.grid.onBeforeDestroy.subscribe(onBeforeDestroy);
            $(window).on('resize', onWindowResize);
        };

        function onCellLeftClick(evt) {
            // re-trigger the event as slickgrid eats up the original event.
            // no re-triggering would have effects like overlays not closing
            // on click on table cell.
            var clickEvt = $.Event('mousedown');
            $(evt.target).trigger(clickEvt);
        }

        function onCellDataCopy() {
            $scope.onCellDataCopy();
        }

        function onBeforeDestroy() {
            // should unregister all plugin and do cleanups
            if ($scope.isTableColumnHeaderMenuEnabled()) {
                $scope.grid.unregisterPlugin(columnMenuPlugin);
                $scope.grid.unregisterPlugin(chosenColumnHeaderPlugin);
            }
            $scope.grid.unregisterPlugin(tooltipPlugin);
            $(window).off('resize', onWindowResize);
        }

        function onWindowResize() {
            handleSizeChange();
        }

        function onCellRightClick(evt, args) {
            // Slick grid consumes the click event, and therefore, we explicitly raise an event. This is used for eg to
            // close sage dropdown

            var clickEvt = $.Event('click');
            clickEvt.target = evt.target;
            $(window).trigger(clickEvt);

            evt.preventDefault();

            if (!$scope.grid) {
                _logger.error('A slick grid cell detected without a valid grid object!');
                return;
            }

            var vizModel = $scope.viz.getModel();
            var tableContextMenuInput = tableContextMenuUtil.getInputForTableContextMenu(
                $scope.viz.getModel(),
                $scope.grid.getCellFromEvent(evt),
                $scope.grid,
                fidToVizColumnMap,
                vizModel.getQuestion().getIsChasmTrapQuery()
            );

            var contextMenuConfig = {
                ignoreOverlayClickSelectors: ['#global-zeroclipboard-flash-bridge'],
                clickedPosition: {
                    left: evt.pageX,
                    top: evt.pageY
                },
                onClose: function (contextMenuOptionType) {
                    if (contextMenuOptionType === vizContextMenuUtil.VizContextMenuOptionType.COPY_TO_CLIPBOARD) {
                        onCellDataCopy();
                    }
                },
                subMenuItems: tableContextMenuInput.menuItems
            };

            vizContextMenuLauncher.launch({
                config: contextMenuConfig,
                data: {
                    grid: $scope.grid,
                    // An array of objects for each column that is filtered.
                    // Each object has a column field pointing to the column
                    // instance and value field with the value of column
                    // in the row the user clicked on.
                    columnValuePairs: tableContextMenuInput.clickedPoint.filteredValues,
                    // An array of objects for each column that is not filtered.
                    // Each object has a column field pointing to the column
                    // instance and value field with the value of column
                    // in the row the user clicked on.
                    unfilteredColumns: tableContextMenuInput.clickedPoint.unfilteredValues,
                    // For pinboard viz, we want the ansModel of this viz, not of pinboard.
                    // and we don't have that as of now. So we pass null.
                    documentModel: vizModel.isPinboardViz()
                        ? null
                        : $scope.viz.getModel().getContainingAnswerModel(),
                    sageClient: $scope.sageClient,
                    vizModel: $scope.viz.getModel()
                }
            });
        }

        /**
         * Event handler for maximizing/unmaximizing the table
         * @param $event
         */
        function onMaximizedOrUnmaximized(isMaximizedEvent) {
            handleSizeChange();
        }

        function handleSizeChange() {
            if (!$scope.grid) {
                return;
            }

            $scope.grid.resizeCanvas();


            $scope.updatePaginationInfo();
            // Auto size seems to be very dumb: it divides the available space equally between columns.
            /*
             if (isMaximizedEvent) {
             $scope.grid.autosizeColumns();
             }
             */
            // do the invalidate at the last to make sure all visible rows get rendered. otherwise sometimes the
            // last column cells may not get rendered due to autosize after a resize events, when the grid
            // gets unmaximized.
            $scope.grid.invalidate();
        }

        $scope.isTableColumnHeaderMenuEnabled = function () {
            /* global flags */
            var flagValue = flags.getValue('enableTableColumnHeaderMenu');

            if (!flagValue || !$scope.viz.getModel()) {
                return false;
            }

            return true;
        };

        /**
         * Configures various scope handlers. This function should only be called after content is loaded
         */
        $scope.configureScopeHandlers = function () {
            $scope.viz.onMaximizeStateChanged = function(maximized) {
                onMaximizedOrUnmaximized(maximized);
            };

            $scope.viz.onLayoutReflowDone = function () {
                // TODO(vibhor/joy): This is a temporary hack (and potentially costly in performance) until we refactor the
                // table code to inject data into an existing slick grid object.
                // Note(joy): If invalidate is called before resizeCanvas then the bug SCAL-1502 occurs.

                if (!$scope.grid) {
                    return;
                }

                $scope.grid.resizeCanvas();
                $scope.grid.invalidate();
            };
        };

        function getOnDownloadButtonClickHandler(isDownloadMore) {
            if (!$scope.viz.isDataDownloadAllowed()) {
                return function ($event) {
                    $event.stopPropagation();
                };
            }

            var ignoreOverlaySelectors = isDownloadMore ?
                ['.bk-more-download-footer .bk-link'] :
                ['.bk-viz[type=table] .bk-style-icon-download'];

            return function(event){
                if($scope.viz.isDownloading()){
                    return;
                }

                var TableFormatType = {
                    CSV: 'CSV',
                    XLSX: 'XLSX',
                    PDF: 'PDF'
                };

                var FormatSubMenuUrls = {
                    CSV: 'src/modules/viz-layout/viz/table/templates/download-as.html',
                    XLSX: 'src/modules/viz-layout/viz/table/templates/download-as.html',
                    PDF: 'src/modules/viz-layout/viz/table/templates/download-as.html'
                };

                if ($scope.showDownloadFormatMenu) {
                    // This close would trigger closeCB that we pass to context menu config.
                    vizContextMenuLauncher.close();
                    return;
                }

                $scope.showVizLevelContextMenu = true;
                $scope.$emit(events.VIZ_MENU_TOGGLE, true);

                var candidateSubMenuIds = [
                        TableFormatType.CSV,
                        TableFormatType.XLSX,
                        TableFormatType.PDF
                    ],
                    enabledSubMenuIds = candidateSubMenuIds;

                var getContextMenuItems = function (menuIdList) {
                    return menuIdList.map(function (menuId) {
                        return {
                            id: menuId,
                            url: FormatSubMenuUrls[menuId],
                            onClick: $scope.viz.downloadTable,
                            enabled: true
                        };
                    });
                };

                var contextMenuConfig = {
                    ignoreOverlayClickSelectors: ignoreOverlaySelectors,
                    clickedPosition: {
                        left: event.clientX,
                        top: event.clientY
                    },
                    subMenuItems: getContextMenuItems(enabledSubMenuIds),
                    onCloseCB: function () {
                        $scope.showDownloadFormatMenu = false;
                        $scope.$emit(events.VIZ_MENU_TOGGLE, false);
                    }
                };

                vizContextMenuLauncher.launch({
                    config: contextMenuConfig,
                    data: {
                        type: "vizLevel",
                        columnValuePairs: [],
                        documentModel: $scope.viz.getModel(),
                        sageClient: $scope.sageClient
                    }
                });
            };
        }

        /**
         * Initialized the table. Sets the title and then calls render.
         */
        $scope.initTable = function () {
            $scope.viz.isDownloading = function () {
                return _isDownloading;
            };

            $scope.viz.showDownloadHelp = function () {
                return !isPrintPage && !flags.getValue('screenshotMode');
            };

            $scope.viz.isDataDownloadAllowed = function () {
                return sessionService.hasDataDownloadPrivileges();
            };

            $scope.viz.onVizDownloadBtnClick = getOnDownloadButtonClickHandler(false);
            $scope.viz.onDownloadMoreBtnClick = getOnDownloadButtonClickHandler(true);

            $scope.viz.downloadTable = function(formatType) {
                $scope.downloadTable(formatType);
            };

            $scope.viz.shareOnSlack = function(channel) {
                var model = $scope.viz.getModel();
                var vizId = $scope.viz._getVizId();
                var fileId = model.getUserData('file_id');

                if (!!fileId) {
                    return slackService.shareFileOnChannel(fileId, channel.id);
                } else {
                    var userAction = new UserAction(UserAction.FETCH_EXCEL_DATA);
                    return dataService.downloadTableData(
                        model.getContainingAnswerModel(),
                        vizId
                    ).then(function(response) {
                        var data = response.data;
                        var fileName = 'file.csv';
                        var title = fileName;
                        /* global File */
                        return slackService.uploadBlobAsFile(
                            new File([data],fileName, {type: 'text/csv'}),
                            channel.id,
                            title,
                            title
                        ).then(function(fileInfo) {
                            model.setUserData('file_id', fileInfo.file.id);
                        });
                    }, function(response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        return $q.reject(response.data);
                    });
                }
            };

            if (!$scope.viz.init()) {
                resetTableUI();
                return;
            }

            if (!$scope.render) {
                _logger.warn('initTable called before $scope.render was available');
                return;
            }
            $scope.render();
        };

        function getTableWrapper() {
            var viewPort =  $($scope.grid.getCanvasNode()).parent();
            return viewPort.parent();
        }

        function getChosenElement() {
            return  getTableWrapper().find(CHOSEN_ELEMENT);
        }
        function getSortableElement() {
            return getTableWrapper().find(':ui-sortable');
        }

        function handleDropDownShowing() {
            getSortableElement().sortable('disable');
        }
        function handleDropDownHiding(){
            getSortableElement().sortable('enable');
        }

        function canDoIncrementalUpdatesToSlickGrid(oldTableModel, newTableModel) {
            // Can't do incremental rendering if there is no slick grid instance.
            if (!$scope.grid) {
                return false;
            }

            // If either model is null (including both), there is no case for incremental rendering.
            if (!oldTableModel || !newTableModel) {
                return false;
            }

            var oldTableColumns = oldTableModel.getVizColumns(),
                newTableColumns = newTableModel.getVizColumns();

            if (oldTableColumns.length !== newTableColumns.length) {
                return false;
            }

            // Only if all columns are identical, do we allow incremental update to slick grid.
            return newTableColumns.every(function (newTableCol, i) {
                var oldTableCol = oldTableColumns[i];
                return Object.equal(oldTableCol.getJson(), newTableCol.getJson());
            });
        }

        function updateSlickGrid(newTableModel) {
            if (!$scope.grid) {
                _logger.error('Request for incremental table rendering without a slick grid instance.');
                return;
            }

            var newTableData = $scope.getSlickGridData($scope.getSlickGridDataRows());
            $scope.grid.setData(newTableData);
            $scope.updatePaginationInfo();

            $scope.grid.render();
        }

        $scope.$watch(function() {
            return $scope.viz.getModel();
        }, function (newTableModel, oldTableModel) {
            if (columnMenuPlugin) {
                // Since column menu plugin can need an update even if the table model doesn't change (applied a filter
                // that doesn't change the table metadata and data), we need to update the column menu plugin with the
                // updated answer model.
                columnMenuPlugin.update(newTableModel.getContainingAnswerModel());
            }

            if (!!oldTableModel && !!newTableModel && newTableModel.equals(oldTableModel)) {
                return;
            }

            if (canDoIncrementalUpdatesToSlickGrid(oldTableModel, newTableModel)) {
                updateSlickGrid(newTableModel);
                return;
            }

            // TODO(vibhor): Instead of recreating a slick grid object on a model change, use slick grid's add/remove rows
            // columns api.
            $scope.initTable();
        });

        $scope.containsHeaderDropdown = function () {
            var columns = $scope.viz.getModel().getVizColumns();

            return columns.any(function (column) {
                return column.supportsDateBucketizationChange() || column.supportsAggregationChange();
            });
        };

        $scope.downloadTable = function(formatType) {
            if($scope.viz.isDownloading()){
                return;
            }

            _isDownloading = true;
            $scope.showLoadingIndicator();

            // The original table model.
            var vizModel = $scope.viz.getModel();
            // Note that this ReportBook is PinboardAnswerModel for non-transformed pinboard vizs.
            // Otherwise this model is the QuestionAnswerModel containing the visualization.
            // Clone the containing ReportBook so that changes do not affect the original model.
            var containingReportBook = _.cloneDeep(vizModel.getContainingAnswerModel());

            var isPinboardViz = !!vizModel.getReferencingViz();
            var isTransformed = !!isPinboardViz && vizModel.getReferencingViz().isTransformed();

            // NOTE (Rahul): For a download request, we need a "ReportBook", and a "VizId" from that
            // reportBook to download the table for. Additionally, there is a "TableModel" whose
            // json needs to have columns reordered so that downloaded data maintains that order.
            //
            // There are scenarios for calculation of these 3 variables.
            // 1. TABLE DOWNLOAD FROM QUESTION ANSWER - fairly simple, "VizId" is the vizModel's id
            //    and "ReportBook" is the containing answer model (Question Answer Model).
            // 2. TABLE DOWNLOAD FROM PINBOARD ANSWER - "VizId" is the pinboardViz's id (calculated
            //    from $scope.viz._getVizId()) "ReportBook" is the containing answer model
            //    (in this case, its Pinboard Answer Model).
            //    Also, for this case, pinboardViz's json need to have the Effective Question
            //    with Override Question to account for unsaved pinboard filters.
            // 3. TABLE DOWNLOAD FROM TRANSFORMED PINBOARD ANSWER - In this case, the containing
            //    answer model is Question Answer Model, it makes this case similar to the Case 1.
            //    "VizId" is the vizModel's id and "ReportBook" is the containing answer model
            //    (Question Answer Model).
            //
            // In all the above mentioned 3 cases, "TableModel" (which is the vizModel) is
            // recomputed from the ReportBook, so that reordering changes made in the vizJson
            // are reflected in the ReportBook JSON.

            var vizId;
            var reportBookModel;
            var tableModel;

            if (!isPinboardViz) {
                vizId = vizModel.getId();
                tableModel = containingReportBook.getVizById(vizId);
                reportBookModel = containingReportBook;
            } else {
                if (isTransformed) {
                    vizId = vizModel.getId();
                    tableModel = containingReportBook.getVizById(vizId);
                    reportBookModel = containingReportBook;
                } else {
                    vizId = vizModel.getId();
                    if (vizModel.getReferencingViz()) {
                        vizId = vizModel.getReferencingViz().getId();
                    }
                    var pbVizModel = containingReportBook.getVizById(vizId);
                    reportBookModel = containingReportBook;
                    tableModel = pbVizModel.getReferencedVisualization();
                    var pbVizModelJson = pbVizModel.getJson();
                    // In case of pinboards, override question represents the current state of the viz,
                    // We copy it to effectiveQuestion so that callosum is able to produce correct download.
                    if(pbVizModel.getOverrideQuestion && pbVizModel.getOverrideQuestion()) {
                        var overrideQuestion = pbVizModel.getOverrideQuestion();
                        pbVizModelJson[jsonConstants.EFFECTIVE_QUESTION_KEY]
                            = overrideQuestion.getQuestionJson();
                    }
                }
            }

            var userDefinedColumnOrder = tableModel.getColumnOrder();

            if (!!userDefinedColumnOrder) {
                var tableModelJson = tableModel.getJson();
                var vizColumns = tableModel.getVizColumns();
                var colIdToUserOrderedColumnIndex = {};

                userDefinedColumnOrder.each(function(colId, colIndex){
                    colIdToUserOrderedColumnIndex[colId] = colIndex;
                });

                vizColumns.sort(function(vizColA, vizColB){
                    var colIndexA = colIdToUserOrderedColumnIndex[vizColA.getSageOutputColumnId()],
                        colIndexB = colIdToUserOrderedColumnIndex[vizColB.getSageOutputColumnId()];

                    return colIndexA - colIndexB;
                });

                tableModelJson[jsonConstants.ALL_COLUMNS_KEY] = vizColumns.map('getJson');
            }

            var userAction = new UserAction(UserAction.FETCH_EXCEL_DATA);
            return dataService.downloadExcelFile(reportBookModel, vizId, formatType)
                .then(_.noop, function (response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                }).finally(function () {
                    _isDownloading = false;
                    $scope.hideLoadingIndicator();
                });
        };

        $scope.$on('$destroy', function () {
            if ($scope.grid) {
                $scope.grid.destroy();
                // This is just a small fix, the problem is that the scope is never GCed
                // so the grid is never released; by nulling these variables, we allow the grid to be GC
                // but sth else is still retaining the scope
                // TODO(chab) figure why the scope is still in memory

                $scope.grid = null;

                tooltipPlugin = null;
                columnMenuPlugin = null;
                chosenColumnHeaderPlugin = null;
            }
        });
    }]);
