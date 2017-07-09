/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview
 * A blink wrapper on top of slick grid table implementation. Table is the most widely used widget in the application:
 * it appears in answer/pinboard as a master result set of query. It appears in data explorer and worksheet as the
 * sample view of a logical table. It also appears in join path disambiguation and new link creation workflow.
 *
 * Each of the above use cases put varying configuration requirements, yet we want to present a similar look and feel
 * table with consistent access points to same features.
 *
 * In this implementation, we allow users to pass a tableModel of following form (understood by slickgrid):
 * columns: [ { ... column definition ... } ]
 * data: [ { ... row values ... } ]
 *
 * A column definition in its simplest form is:
 * {
 *    id: 'unique-column-id' (could be guid of a logical column or an effective id of a viz column)
 *    name: 'column name that goes on header'
 *    field: 'a-lookup-key for data values'.
 * }
 * More slick grid options can be added. See https://github.com/mleibman/SlickGrid/wiki/Column-Options
 *
 * In addition, this component also allows following extensions to column definition:
 * {
 *   onUpdate: a callback invoked when a column header name is changed
 *             Only applicable when editableColumnHeaders option is set to true. See below.
 * }
 *
 * A single data row in its simplest form is:
 * {
 *   f1: value1,
 *   f2: value2,
 *   ......
 *   .....
 *   fn: valuen
 * }
 * Here, f1, f2 ... fn are the field identifier of a column (see definition above).
 *
 * There are standard adapters available in util service to go from a viz TableModel to above model, but you can also
 * write your own.
 *
 * In addition, the directive also takes a config object of following form:
 * {
 *   editableColumnHeaders: set to true to have the column name become content-editable div.
 *   autoUpdateColumnWidth: set to true to have the column width to be adjusted automatically when column names are changed.
 *   slickGridOptions: { ... see https://github.com/mleibman/SlickGrid/wiki/Grid-Options ... }
 * }
 *
 * If you set editableColumnHeaders to true, you may want to provide an 'onUpdate' callback for each column object above.
 *
 * This component is content size aware and so it will update the column width if the title is changed. In addition,
 * if the caller of this component passes 'on-table-update' attribute, it will be invoked with the new table width value
 * after it is rerendered.
 * One benefit of this is that the caller doesn't have to guess the container size and provide some non-zero dimension
 * initially. The controller of this code will compute the minimum requirements (based on some thresholds) and notify
 * the caller through 'on-table-update' mechanism.
 *
 * Sample usage:
 *
 * <blink-slick-grid-table table-model="tableModel" config="config" on-table-update="increaseMyWidthTo($minTableWidth)"></blink-slick-grid-table>
 *
 */

'use strict';

blink.app.controller('SlickGridTableController', ['$scope',
    '$timeout',
    'angularUtil',
    'Logger',
    'util',
    'safeApply',
    'tableUtil',
    function ($scope,
              $timeout,
              angularUtil,
              Logger,
              util,
              safeApply,
              tableUtil
    ) {
        var _logger = Logger.create('slickgrid-table-controller');

        var MAX_COL_WIDTH = 300,
            MIN_COL_WIDTH = 80,
            windowResizeTimer = null;


        // Initialize scope properties.
        $scope.grid = null;
        $scope.columnModels = {};
        $scope.tooltipPlugin = null;

        /**
         * This function is used to compare 2 rows of data given the columns to consider while sorting.
         * Note(Shikhar):
         * 1. Handle null/undefined manually, else this can give inconsistent result.
         * 2. Here null and undefined are treated as equal. Comparison is case insensitive
         * 3. This is stable sort - SCAL-2585
         */
        function compareRows(row1, row2) {
            if (!row1.keys || !row2.keys || row1.keys.length != row2.keys.length) {
                return 0;
            }

            for (var i = 0, l = row1.keys.length; i < l; i++) {
                var key1 = row1.keys[i],
                    key2 = row2.keys[i];
                var sign = key1.sortAsc ? 1 : -1;
                var order = util.comparator(key1.data, key2.data) * sign;
                // If order = 0, we iterate to the next comparable column
                if (!!order) {
                    return order;
                }
            }
            // This is for making the sort stable. For stability, it does not matter whether the sort is descending or ascending
            return (row1.position < row2.position) ? -1 : 1;
        }

        function generateModel(column) {
            $scope.columnModels[column.id] = {
                name: column.name.escapeHTML()
            };

            return 'columnModels[\'' + column.id + '\'].name.escapeHTML()';
        }

        function getColumnModel(columnId) {
            if (!$scope.columnModels.hasOwnProperty(columnId)) {
                return '';
            }

            return $scope.columnModels[columnId].name;
        }

        function updateEditableColumnWidth(headerElement) {
            var $headerCol = $(headerElement),
                colWidth = $headerCol.width();
            $headerCol.addClass('slick-editable-header-column');
            $headerCol.find('.slick-column-name').width(colWidth - 20);
            $headerCol.find('.slick-column-name .slick-editable-title-container').width(colWidth - 30);
        }

        /**
         *
         * @param {Object} grid
         * @param {boolean} areColumnHeadersEditable
         * @returns {number} Returns the new total width of the table.
         */
        function updateColumnsWidth(grid, areColumnHeadersEditable) {
            var $headerColumns = grid.getHeaderColumns();
            var totalColumnWidth = 0;
            $headerColumns.each(function (i, el) {
                var $headerCol = $(el),
                    colWidth = $headerCol.width();
                totalColumnWidth += colWidth;
                if (areColumnHeadersEditable) {
                    updateEditableColumnWidth(el);
                }
            });

            return totalColumnWidth;
        }

        function extendGridObject(grid, config, $table) {
            angular.extend(grid, {
                sortTable: function (e, args) {
                    var cols = args.sortCols,
                        tableData = this.getData();

                    var mappedList = tableData.map(function (tableRow, i) {
                        // Appending an index field that would be helpful for stable sorting.
                        return angular.extend({
                            position: i,
                            keys: cols.map(function (col) {
                                return {
                                    sortAsc: col.sortAsc,
                                    data: tableRow[col.sortCol.field]
                                };
                            })
                        }, tableRow);
                    });
                    // actual sorting of data.
                    mappedList.sort(compareRows);
                    this.setData(mappedList.map(function (item) {
                        delete item.position;
                        delete item.keys;
                        return item;
                    }));

                    // very important to scroll to top, because rendering logic is only applied to little more than the visible rows.
                    // unless scrolled to top, the rowspan logic can pick a middle value to be shown and rest faded away.
                    this.scrollRowToTop(0);

                    this.invalidate();
                    this.render();
                },
                /**
                 * Make this column sortable or unsortable.
                 *
                 * @param {string} colId
                 * @param {boolean} sortable
                 */
                setSortIndication: function (colId, sortable) {
                    var $headerColumns = this.getHeaderColumns(),
                        colIndex = this.getColumnIndex(colId);

                    var def = null;
                    if (colIndex >=0 && colIndex < $headerColumns.length) {
                        var $headerCol = $($headerColumns[colIndex]);
                        def = $headerCol.data('column');
                    }

                    if (def) {
                        def.sortable = sortable;
                    }
                },
                enableSort: function (colId) {
                    if (colId) {
                        this.setSortIndication(colId, true);
                    }
                    this.onSort.subscribe(this.sortTable);
                },
                disableSort: function (colId) {
                    if (colId) {
                        this.setSortIndication(colId, false);
                    }
                    this.onSort.unsubscribe(this.sortTable);
                },
                getColumn: function (colId) {
                    var cols = this.getColumns(),
                        colIndex = this.getColumnIndex(colId);

                    if (colIndex < 0 || colIndex >= cols.length) {
                        return null;
                    }
                    return cols[colIndex];
                },
                updateColumn: function (colId) {
                    var newColumnName = getColumnModel(colId),
                        columnDefintion = this.getColumn(colId);

                    if (!newColumnName.trim() && $scope.columnModels.hasOwnProperty(colId) && columnDefintion.originalName) {
                        $scope.columnModels[colId].name = columnDefintion.originalName;
                        return;
                    }

                    columnDefintion.originalName = newColumnName;
                    if (columnDefintion.onUpdate) {
                        columnDefintion.onUpdate(columnDefintion, newColumnName);
                    }

                    if (!config.autoUpdateColumnWidth) {
                        return;
                    }
                    if (!columnDefintion || !newColumnName) {
                        // If user makes column name empty, this should be flagged as error and last known name should be restored.
                        return;
                    }

                    this.setSortIndication(colId, true);
                    var existingWidth = columnDefintion.width,
                        newMinWidth = computeRequiredWidth(newColumnName);
                    if (newMinWidth > existingWidth || newMinWidth < 0.75 * existingWidth) {
                        this.setColumns(this.getColumns().map(function (col) {
                            if (col.id === colId) {
                                col.width = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, newMinWidth));
                            }

                            return col;
                        }));
                        // Recompile is needed here because slickgrid will reconstruct the table dom when setColumns() is
                        // called.
                        this.recompileTableHeaders();
                        this.updateColumnWidth(colId);
                    }
                },
                getTooltipForColumnHeader: function (colId) {
                    var columnDefinition = this.getColumn(colId);

                    if (columnDefinition.getTooltipForColumnHeader) {
                        return columnDefinition.getTooltipForColumnHeader(columnDefinition);
                    }
                    return '';
                },
                getCustomHeaderClass: function (colId) {
                    var columnDefinition = this.getColumn(colId);

                    if (columnDefinition.getCustomHeaderClass) {
                        return columnDefinition.getCustomHeaderClass(columnDefinition);
                    }
                    return '';
                },
                $headerColumns: null,
                /**
                 * Returns a list of column header elements in the slick grid table.
                 * @returns {Array.<jQuery>}
                 */
                getHeaderColumns: function () {
                    // we don't cache this as any plug
                    return $table.find('.slick-header-columns .slick-header-column');
                },
                updateColumnWidth: function (colId) {
                    if (!config.editableColumnHeaders) {
                        return;
                    }
                    var colIndex = this.getColumnIndex(colId);
                    if (colIndex < 0 || colIndex >= this.getHeaderColumns().length) {
                        return;
                    }
                    updateEditableColumnWidth(this.getHeaderColumns()[colIndex]);
                },
                /**
                 * Recompiles any angular elements inside the table header and updates any column width as a result.
                 * May trigger the on-table-update="" callback if provided with the new table width.
                 */
                recompileTableHeaders: function () {
                    this.$headerColumns = null;
                    angularUtil.getCompiledElement($table.find('.slick-header-columns'), $scope);
                }
            });
        }

        function addColumnResizeHandlers(grid) {
            grid.getHeaderColumns().each(function (i, headerCol) {
                var $headerResizeHandle = $(headerCol).find('.slick-resizable-handle');
                $headerResizeHandle.bind('drag', function () {
                    updateColumnsWidth(grid, true);
                });
            });
        }

        function onColumnSelectionChange($evt, args) {
            safeApply($scope, function () {
                args.column.onSelect(args.column.logicalColumn.getJson());
            });
        }

        function configureTableExtensions(grid, config) {
            grid.getHeaderColumns().each(function (i, headerCol) {
                var $headerCol = $(headerCol),
                    headerColData = $headerCol.data('column');

                $headerCol.find('.slick-column-name').attr('blink-tooltip',
                    '{{ grid.getTooltipForColumnHeader(\'{colId}\') }}'.assign({
                        colId: headerColData.id
                    }));
            });
        }

        function configureWindowEventHandlers(grid, $table) {
            $(window).on('resize.tableReRender', function() {
                $timeout.cancel(windowResizeTimer);
                windowResizeTimer = $timeout(function() {
                    grid.resizeCanvas();
                }, 500, false);
            });

            // We are not using blink-overlay because it ignores click on the table container, but we want to ignore click
            // only on slick rows.
            $(window).on('mousedown.tableEdit', tableUtil.onWindowClick.bind(null, grid, $table));
        }


        function unregisterPlugins() {
            if ($scope.tooltipPlugin) {
                $scope.grid.unregisterPlugin($scope.tooltipPlugin);
            }
            $scope.grid.unregisterPlugin($scope.columnSelectorPlugin);
        }

        function removeWindowEventHandlers () {
            $timeout.cancel(windowResizeTimer);
            $(window).off('resize.tableReRender');
            $(window).off('mousedown.tableEdit');
        }

        function onColumnsReorder() {
            if (!$scope.grid) {
                return;
            }
            $scope.grid.recompileTableHeaders();
            safeApply($scope);
        }

        $scope.paginationInfo = {};
        function onViewportChanged(maxRows) {
            if (!$scope.grid || !$scope.grid.getData()) {
                return;
            }

            var totalRows = $scope.grid.getData().length;
            var hasMoreRows = !maxRows ? false : totalRows >= maxRows;
            $scope.paginationInfo = tableUtil.getPaginationInfo($scope.grid.getViewport(), totalRows, hasMoreRows);
            if (hasMoreRows) {
                $scope.paginationInfo.maxRows = maxRows;
            }
            safeApply($scope);
        }

        function styleCellValuePostRender(cellNode, row, dataContext, colDef) {
            tableUtil.formatHyperlink(cellNode);
        }

        function initColumns(config, tableModel) {
            var editableTitleTemplate =
                '<div class="slick-editable-title-container bk-editable-title bk-viz-title-section">' +
                '<div blink-content-editable fullspan ' +
                'on-mouse-enter="grid.disableSort(\'{colId}\')" ' +
                'on-mouse-leave="grid.enableSort(\'{colId}\')" ng-model="{colModel}" ' +
                'on-change="grid.updateColumn(\'{colId}\')">' +
                '</div></div>';
            // Minimum required column width is to allow enough space to show a truncated string.
            var minRequiredColWidth = computeRequiredWidth('a...');
            var showHidden = config.showHiddenColumns;
            // If showHidden is disabled, do not show the hidden columns
            var filteredColumns = tableModel.columns.filter(function(col) {
                return (showHidden || !col.isHidden);
            });
            tableModel.slickGridColumns = filteredColumns.map(function (col) {
                col.sortable = true;
                col.minWidth = col.minWidth || minRequiredColWidth;
                col.maxWidth = col.maxWidth || MAX_COL_WIDTH;
                col.width = computeRequiredWidth(col.name);
                col.headerCssClass = (col.headerCssClass || '') + ' {{grid.getCustomHeaderClass(\'' + col.id + '\')}}';
                col.asyncPostRender = styleCellValuePostRender;

                if (config.editableColumnHeaders) {
                    col.originalName = col.name;
                    col.name = editableTitleTemplate.assign({
                        colId: col.id,
                        colModel: generateModel(col)
                    });
                }

                return col;
            });

            if (!!config.selectableColumnPredicate) {
                tableModel.columns.each(function(slickColumn){
                    if (!config.selectableColumnPredicate(slickColumn.logicalColumn)) {
                        slickColumn.cssClass = (slickColumn.cssClass || '') + ' bk-disabled-slick-column';
                        slickColumn.headerCssClass = (slickColumn.headerCssClass || '') + ' bk-disabled-slick-column';
                    }
                });
            }

        }

        var DEFAULT_SLICKGRID_OPTIONS = {
            enableCellNavigation: true,
            enableColumnReorder: true,
            multiColumnSort: true,
            syncColumnCellResize: true,
            fullWidthRows: true,
            forceFitColumns: false,
            rowHeight: 38,
            enableAsyncPostRender: true
        };

        $scope.init = function (config, tableModel, $table) {
            if (!tableModel) {
                $scope.noData = true;
                return;
            }
            initColumns(config, tableModel);
            var slickOptions = DEFAULT_SLICKGRID_OPTIONS;
            angular.extend(slickOptions, config.slickGridOptions);

            var grid = new Slick.Grid(
                $table,
                tableModel.data,
                tableModel.slickGridColumns,
                slickOptions);

            tableUtil.configureKeyboardDataCopyOnSlickGrid(grid, $scope.onDataCopied);

            if(!slickOptions.editable) {
                tableUtil.configureContextMenuDataCopyOnSlickGrid(grid, tableModel, $scope.onDataCopied);
                tableUtil.configureSelectionOnSlickGrid(grid);
            }


            extendGridObject(grid, config, $table);
            $scope.grid = grid;

            grid.enableSort();
            if (config.editableColumnHeaders) {
                addColumnResizeHandlers(grid);
            }

            var columnSelectorPlugin = new Slick.Custom.RadioColumnSelector({
                selectableColumnPredicate: function (slickColumn){
                    if (!config.selectableColumnPredicate) {
                        return false;
                    }
                    return config.selectableColumnPredicate(slickColumn.logicalColumn);
                }
            });
            columnSelectorPlugin.onColumnSelectionChange.subscribe(onColumnSelectionChange);
            $scope.grid.registerPlugin(columnSelectorPlugin);
            $scope.columnSelectorPlugin = columnSelectorPlugin;

            if(!!slickOptions.rowTooltips) {
                $scope.tooltipPlugin = new Slick.AutoTooltips({enableForHeaderCells: false});
                $scope.grid.registerPlugin($scope.tooltipPlugin);
            }
            configureTableExtensions(grid, config);

            // Add window resize/mousedown handler
            configureWindowEventHandlers(grid, $table);

            //onEscape Handler
            $scope.onEscape = tableUtil.onEscape.bind(this, grid);

            //Custom onEditCell handler
            if(!!config.onEditCell) {
                grid.onEditCell = config.onEditCell;
            }

            grid.onBeforeEditCell.subscribe(function(e,args) {
                if(!!args.column.isEditable) {
                    return args.column.isEditable(args.item);
                }
                return true;
            });

            // We need to recompile here to bind the correct model to the reordered column fields.
            grid.onColumnsReordered.subscribe(onColumnsReorder);

            grid.onViewportChanged.subscribe(angular.bind(null, onViewportChanged, config.maxRows));
            onViewportChanged(config.maxRows);

            grid.optimumTableWidth = updateColumnsWidth(grid, config.editableColumnHeaders) + MIN_COL_WIDTH;
            // Initial compile to ensure that any content-editable is active.
            grid.recompileTableHeaders();
        };

        function computeRequiredWidth(colName) {
            var pixelWidthOfText = util.getPixelWidthOfString(colName, 'bk-viz-table-header-string-width-calc');
            return Math.min(MAX_COL_WIDTH, MIN_COL_WIDTH + pixelWidthOfText);
        }

        $scope.$on('$destroy', function () {
            removeWindowEventHandlers();
            unregisterPlugins();

            if ($scope.grid) {
                $scope.grid.destroy();
                $scope.grid = null;
            }
        });
    }]);

blink.app.directive('blinkSlickGridTable', ['$parse', 'util', 'safeApply', function ($parse, util, safeApply) {

    function linker(scope, $container, attrs) {
        var config = scope.$parent.$eval(attrs.config) || {};
        var tableModel = scope.$parent.$eval(attrs.tableModel);

        var $table = $container.find('.bk-table-container');

        scope.showCopyConfirmation = false;
        scope.onDataCopied = function () {
            scope.showCopyConfirmation = true;
            safeApply(scope);
        };

        scope.init(config, tableModel, $table);

        if (attrs.onTableReady) {
            util.executeInNextEventLoop(function () {
                $parse(attrs.onTableReady)(scope.$parent, {
                    $minTableWidth: scope.grid.optimumTableWidth
                });
            });
        }

        // SCAL-14329: The container could take an event loop to change its size
        // in response to the data that was just fetched.
        util.executeInNextEventLoop(function(){
            if (!scope.grid) {
                return;
            }
            // No need to call the recompile now because this is just an update to css/style.
            scope.grid.resizeCanvas();
            scope.grid.invalidate();
        });


        $container.on('$destroy', function () {
            // Angular should guarantee that DOM events are triggered before angular events. But not confirmed yet, so
            // putting a check on scope.
            if (scope) {
                scope.$destroy();
            }
        });
    }

    return {
        restrict: 'E',
        templateUrl: 'src/common/widgets/slickgrid/slickgrid-table.html',
        scope: {},
        link: linker,
        controller: 'SlickGridTableController'
    };
}]);
