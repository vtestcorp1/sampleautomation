/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 *
 * @fileoverview utility functions for table ui
 */

'use strict';

blink.app.factory('tableUtil', ['$rootScope',
    '$templateCache',
    'angularUtil',
    'blinkConstants',
    'strings',
    'vizContextMenuLauncher',
    'currencyUtil',
    'dataRuleService',
    'vizContextMenuUtil',
    'jsonConstants',
    'Logger',
    'util',
    'GeoCountryConfig',
    'VizContextMenuItem',
    function ($rootScope,
              $templateCache,
              angularUtil,
              blinkConstants,
              strings,
              vizContextMenuLauncher,
              currencyUtil,
              dataRuleService,
              vizContextMenuUtil,
              jsonConstants,
              Logger,
              util,
              GeoCountryConfig,
              VizContextMenuItem) {
        var _logger = Logger.create('table-util');

        var SELECTED_RANGE_BOX_CLASS = 'bk-grid-selected-ranges-decoration';

        var me = {};

    /**
     * Sets the pagination information. This involves setting up the indices of the rows visible in the viewport with
     * respect to the count. This can be used to show information like "showing rows 1-8 of 20"
     *
     * @param {Object} viewport having top and bottom properties
     * @param {number} rowCount
     * @param {boolean} hasMoreData
     */
        me.getPaginationInfo = function (viewport, rowCount, hasMoreData) {
            var topRow = viewport.top + 1,
                bottomRow = viewport.bottom + 1,
                totalRows = rowCount;
            if (bottomRow > rowCount) {
                bottomRow = rowCount;
            }
            if (hasMoreData) {
                totalRows = totalRows + '+';
            }
            return {
                topRow: topRow,
                bottomRow: bottomRow,
                totalRows: totalRows
            };
        };

        me.getDisplayColumnDataType = function (backendDataType) {
            return util.dataTypesToDisplayName[backendDataType] || 'Unknown';
        };

    /**
     * Applies the formatter defined for the dataColumn on the value
     * @param dataColumn
     * @param value
     * @param isAlreadyConvertedFromBackend
     */
        me.getFormattedValue = function (dataColumn, value, isAlreadyConvertedFromBackend) {
            if (!dataColumn) {
                return (value + '').escapeHTML();
            }
            var uiValue = value;
            if (!isAlreadyConvertedFromBackend) {
                uiValue = dataColumn.convertValueFromBackend(value);
            }
            var dataFormatter = dataColumn.getDataFormatter();
            var formattedVal = dataFormatter(uiValue, {
                noShorten: true
            });

            return (formattedVal + '').escapeHTML();
        };

    /**
     * Format a hyperlink data cell value
     * for e.g.
     * {caption}Click Me{/caption}google.com -> Click Me (hyperlinked)
     *
     * @param cellNode
     */
        me.formatHyperlink = function (cellNode) {
            var $cellNode = $(cellNode);
            var text = $cellNode.text();
            var captionMatch = text.match(blinkConstants.URL_CAPTION_REGEX);
            var urlCaption;
            if(!!captionMatch) {
                urlCaption = captionMatch[1];
                var newText = text.replace(blinkConstants.URL_CAPTION_REGEX, '');
                $cellNode.text(newText);
            }
            $cellNode.linkify({
                format: function(value, type) {
                    return !!urlCaption
                    ? urlCaption
                    : value;
                }
            });
            return $cellNode;
        };

        function getUserFacingValueForEnumValue(columnId,value) {
            var blinkConstantEnum = strings.metadataExplorer.displayValuesForColumns;
            if (blinkConstantEnum[columnId] && blinkConstantEnum[columnId][value]) {
                return  blinkConstantEnum[columnId][value];
            } else {
                return value;
            }
        }

        function getCurrentSelection(grid) {
            return grid.getSelectionModel().getSelectedRanges();
        }

        me.isAnyCellSelected = function (grid) {
            var selectedRanges = getCurrentSelection(grid);
            return selectedRanges.length > 0;
        };

    /**
     * Returns true iff exactly one row is selected in the grid.
     * If a rowIndex is provided returns true if the entire row
     * at rowIndex and that row only is selected.
     * @param {Slick.Grid} grid
     * @param {Number} [rowIndex]
     * @returns {boolean}
     */
        me.isExactlyOneRowSelected = function (grid, rowIndex) {
            var selectedRanges = getCurrentSelection(grid);
            if (selectedRanges.length != 1) {
                return false;
            }
            var range = selectedRanges[0];
            if (range.fromRow !== range.toRow) {
                return false;
            }

            if (rowIndex !== void 0 && range.fromRow !== rowIndex) {
                return false;
            }

            var numColumns = grid.getColumns().length;
            if (Math.abs(range.toCell - range.fromCell) !== numColumns - 1) {
                return false;
            }
            return true;
        };

        me.isExactlyOneCellSelected = function (grid) {
            var selectedRanges = getCurrentSelection(grid);
            if (selectedRanges.length != 1) {
                return false;
            }
            var range = selectedRanges[0];
            return range.fromRow === range.toRow && range.fromCell === range.toCell;
        };

        me.isCellSelected = function (grid, row, cell) {
            var selectedRanges = getCurrentSelection(grid);
            return selectedRanges.any(function(range){
                return range.contains(row, cell);
            });
        };

        me.getDataForCurrentSelection = function (grid) {
            var selectedRanges = getCurrentSelection(grid);
            if (selectedRanges.length === 0) {
                return;
            }
            if (selectedRanges.length > 1) {
                _logger.warn('only single range selection supported, using only the first range');
            }

        // TODO (sunny): handle multiple ranges that can lead
        // to an overall non-rectangular selection
        // Note (sunny): all the cells in the selection might
        // not be rendered yet so we can't simply get the
        // innerText from the grid nodes
            var range = selectedRanges[0],
                rows = [];
            for (var i=range.fromRow; i<=range.toRow; ++i) {
                var row = [],
                    rowData = grid.getDataItem(i);
                for (var j=range.fromCell; j<=range.toCell; ++j) {
                    var column = grid.getColumns()[j],
                        rawCellValue = rowData[column.field],
                        formattedCellValue = column.formatter ? column.formatter(i, j, rawCellValue, column, rowData).unescapeHTML() : rawCellValue;
                    row.push((formattedCellValue + '').stripTags());
                }
                rows.push(row.join('\t'));
            }
            return rows.join('\r\n');
        };

        function isClickInsideColumnCell($evt, $table) {
            var slickgridCellClass = 'slick-cell',
                slickgridEditorClass = 'slick-cell-editor',
                slickgridCellSelector = '.' + slickgridCellClass,
                slickgridEditoSelector = '.' + slickgridEditorClass;

            var $target = $($evt.target),
                $cellElem = $(slickgridCellSelector, $table);

            return $target.hasClass(slickgridCellSelector)
            || $target.parents(slickgridCellSelector).length > 0
            || $target.hasClass(slickgridEditorClass)
            || $target.parents(slickgridEditoSelector).length > 0;
        }

        me.onWindowClick = function (grid, $table, $evt) {
            if (!grid) {
                return;
            }
            var editorLock = grid.getEditorLock();
            if (!editorLock.isActive()) {
                return;
            }

        // Check that the click is not on slick grid column name cell because this would be handled by slick grid.
        // Note - Checking editorLock.isActive() is a very quick check, so we do that before.
            if (isClickInsideColumnCell($evt, $table)) {
                return;
            }

            editorLock.commitCurrentEdit();

        // This call is needed because other columns are not focusable - ie, their cells cant be active, so the previous
        // active cell remains which creates a problem in slick.grid handleClick().
        // Consider the case: I edit column X, so active cell is X, now I click on another cell, so that X is comitted.
        // But still the active cell is X. Now when I click on X to again rename it, it doesn't show it editable on
        // single click because the active cell has not changed.
        // Note: This should be reset after edits are committed.
            grid.resetActiveCell();
        };

        me.onEscape = function (grid) {
        // This is useful in this situation: I click on name to edit and hit escape. Then slick grid does not change
        // the active cell. So when next time I click this cell to edit it, nothing happens because active cell has
        // not changed and slick grid in handleClick() does not make the cell editable.
        // Also we execute in the next loop so that slick grid first do its default function.
            util.executeInNextEventLoop(function () {
                if (!grid) {
                    return;
                }
                grid.resetActiveCell();
            });
        };


        me.configureSelectionOnSlickGrid = (function(){
            function highlightSelectedRanges(grid, ranges) {
                $(grid.getCanvasNode()).find('.' + SELECTED_RANGE_BOX_CLASS).remove();
                ranges.each(function(range){
                    var $box = $("<div></div>")
                    .addClass(SELECTED_RANGE_BOX_CLASS)
                    .css("position", "absolute")
                    .appendTo(grid.getCanvasNode());

                    var from = grid.getCellNodeBox(range.fromRow, range.fromCell);
                    var to = grid.getCellNodeBox(range.toRow, range.toCell);

                    if (from) {
                        $box.css({
                            top: from.top - 1 ,
                            left: from.left - 1,
                            height: to.bottom - from.top - 2,
                            width: to.right - from.left - 2
                        });
                    }
                });
            }

            function onSelectedRangesChanged(grid, eventData, selectedRanges) {
                highlightSelectedRanges(grid, selectedRanges);
            }

            function clearSelectedRanges(grid) {
                grid.getSelectionModel().setSelectedRanges([]);
            }

            function selectRowForCellClick(grid, clickedCell) {
                grid.setSelectedRows([clickedCell.row]);
            }

            function onCellRightClick(grid, eventData) {
            // select clicked cell if not already selected
                var clickedCell = grid.getCellFromEvent(eventData);
                if (!clickedCell) {
                    return;
                }
                var clickedCellAlreadySelected = me.isCellSelected(grid, clickedCell.row, clickedCell.cell);
                if (clickedCellAlreadySelected) {
                    return;
                }

                grid.setSelectedRows([clickedCell.row]);
            }

            function onCellDoubleClick(grid, eventData, clickedCell) {
                selectRowForCellClick(grid, clickedCell);
            }

            return function (grid) {
                var selectionModel = new Slick.CellSelectionModel();
                selectionModel.onSelectedRangesChanged.subscribe(angular.bind(null, onSelectedRangesChanged, grid));
                grid.setSelectionModel(selectionModel);

                grid.onDblClick.subscribe(angular.bind(null, onCellDoubleClick, grid));
                grid.onContextMenu.subscribe(angular.bind(null, onCellRightClick, grid));

                $(window).on('click.tableDataCopy', function(event){
                    var clickedOutside = util.isClickOutside($(grid.getCanvasNode()), event);
                    if (clickedOutside) {
                        clearSelectedRanges(grid);
                        grid.resetActiveCell();
                    }
                });

                grid.onBeforeDestroy.subscribe(function(){
                    $(window).off('click.tableDataCopy');
                });
            };
        })();

        me.configureContextMenuDataCopyOnSlickGrid = (function() {
            function onCellRightClick(grid, tableModel, onCopy, event) {
                event.preventDefault();

                if (!me.isAnyCellSelected(grid)) {
                    return;
                }

                var contextMenuOptionIds = [vizContextMenuUtil.VizContextMenuOptionType.COPY_TO_CLIPBOARD];
                var contextMenuConfig = {
                    clickedPosition: {
                        left: event.pageX + 40,
                        top: event.pageY + 40
                    },
                    onClose: function (contextMenuOptionType) {
                        if (contextMenuOptionType === vizContextMenuUtil.VizContextMenuOptionType.COPY_TO_CLIPBOARD) {
                            onCopy();
                        }
                    },
                    subMenuItems: contextMenuOptionIds.map(function (optionID) {
                        return new VizContextMenuItem(optionID);
                    })
                };

                vizContextMenuLauncher.launch({
                    config: contextMenuConfig,
                    data: {
                        grid: grid,
                        clickedCell: grid.getCellFromEvent(event)
                    }
                });
            }

            function onCellLeftClick() {
                var clickEvt = $.Event('mousedown');
                $(window).trigger(clickEvt);
            }

            return function (grid, tableModel, onCopy) {
                if (!onCopy) {
                    onCopy = angular.noop;
                }
                grid.onClick.subscribe(angular.bind(null, onCellLeftClick, grid, onCopy));
                grid.onContextMenu.subscribe(angular.bind(null, onCellRightClick, grid, tableModel, onCopy));
            };
        })();

        me.configureKeyboardDataCopyOnSlickGrid = (function(){
            var keyCodeC = 67;

            function isCopyCommandEvent(e) {
                return (e.which === keyCodeC) && ((e.ctrlKey || e.metaKey) && !e.shiftKey);
            }

        // SCAL-8172, safari copy to clipobard temporarily disabled
            function isKeyboardCopySupported() {
                return !blink.app.isSafari;
            }

        // this logic is 'inspired' by https://github.com/Celebio/SlickGrid
            function keyDownHandler(grid, onCopy, event) {
                if (!isKeyboardCopySupported()) {
                    return;
                }

                if (!isCopyCommandEvent(event)) {
                    return;
                }

                var selectionData = me.getDataForCurrentSelection(grid);
                if (!selectionData) {
                    return;
                }

                var $focus = $(grid.getActiveCellNode());

                var textArea = document.createElement('textarea');
                textArea.style.position = 'absolute';
                textArea.style.left = '-1000px';
                textArea.style.top = document.body.scrollTop + 'px';
                textArea.value = selectionData;
                document.body.appendChild(textArea);
                textArea.select();
                textArea.focus();

                setTimeout(function(){
                    textArea.parentNode.removeChild(textArea);
                    if ($focus && $focus.length > 0) {
                        $focus.attr('tabIndex', '-1');
                        $focus.focus();
                        $focus.removeAttr('tabIndex');

                        if (onCopy) {
                            onCopy();
                        }
                    }
                }, 100);
            }

            return function (grid, onCopy) {
                if (!onCopy) {
                    onCopy = angular.noop;
                }
                grid.onKeyDown.subscribe(angular.bind(null, keyDownHandler, grid, onCopy));
            };

        })();

    //Some of these methods are slickgrid formatters, and other return slickgrid formatters
    //Look at the method signature to discriminate between these

        me.plainTextFormatter = function (row, cell, value) {
            if(value === strings.metadataExplorer.selectValueMessage) {
                return '<div class="invalid">' + value.escapeHTML() + '</div>';
            } else {
                return '{1}<span class="tip">{2}</span>'
                .assign(value, strings.metadataExplorer.cannotEdit);
            }
        };

    /**
     * Returns a formatter for this column.
     * @param {boolean} isReadOnly - Is this column readonly
     * @returns  {function} a slickgrid formatter function. Note that the value parameter passed
     * in the function can be undefined, thus the  test below
     */
        me.editableTextFormatter = function (isReadOnly) {
            return function (row, cell, value, column, item) {

                var isReadOnlyValue = isReadOnly
                || (!!column.isEditable && !column.isEditable(item));

                if (isReadOnlyValue) {
                    return (!!value)
                    ? $templateCache.get('read-only-text-cell').assign(value)
                    : '';
                }

                value = (!!value)
                ? value.escapeHTML()
                : $templateCache.get('text-cell-placeholder').
                    assign(strings.metadataExplorer.clickToEdit);

            //return '<div blink-content-editable ng-model="value"></div>'
            // NOTE(vibhor): We directly insert the escaped html into the template here rather than using ng-bind-html.
            // The reason is that an ng-bind-html requires angular compilation cycle. Moreover, when browser constructs
            // a dom from a template string that contains escaped html sequence, it is smart enough to treat that as
            // inner html versus inner text.
            // Contrast this with the use of an escaped-html sequence inside an angular {{ }} expression. That requires
            // a compile cycle and it does an innerText() rather than innerHTML. For latter, use ng-bind-html directive.
                return $templateCache.get('editable-text-cell').assign(value);
            };
        };

        me.linkFormatter = function (hrefCallback) {
            return function (row, cell, value, tableCtx, dataContext) {
                var href = hrefCallback(row, dataContext);
                if (!!href) {
                    return '<a href="{1}">{2}</a>'.assign(href, value);
                } else {
                    return value;
                }
            };
        };

        me.NumberFormatter = function (isReadOnly) {
            return function (row, cell, value) {
                if (isReadOnly) {
                    return value;
                }

                value = (!isNaN(value)) ? value : '<span class="placeholder">Click to edit</span>';

                return '<div class="edit-wrapper">' +
                '<div class="bk-value">{1}</div>'.assign(value) +
                '</div>';
            };
        };

        me.onOffSwitchFormatter = function (row, cell, value) {

            return '<div class="onoffswitch">' +
            '<label class="{1} onoffswitch-label">'.assign((value) ? 'checked' : '') +
            '<span class="onoffswitch-inner"></span>' +
            '<span class="onoffswitch-switch"></span>' +
            '<span class="tip">{1}</span>'.assign(strings.metadataExplorer.cannotEdit) +
            '</label>' +
            '</div>';
        };

        me.displayedValueForFieldFormatter = function (row, cell, value,column) {
            return getUserFacingValueForEnumValue(column.id,value);
        };

        me.currencyTypeInfoFormatter = function (row, cell, currencyTypeInfo, config) {
            var columns = config.tableModel.getColumns();
            if (!currencyTypeInfo ||
            !currencyTypeInfo.getSettingType() ||
            !currencyUtil.isValidCurrencyTypeInfo(currencyTypeInfo, columns)) {
                return strings.metadataExplorer.currencyEditor.NONE;
            }
            var settingType = currencyTypeInfo.getSettingType();
            if (settingType == jsonConstants.currencyTypes.FROM_USER_LOCALE) {
                return strings.metadataExplorer.currencyEditor.FROM_BROWSER;
            }
            if (settingType == jsonConstants.currencyTypes.FROM_COLUMN) {
                var currencyColumnGuid = currencyTypeInfo.getColumnGuid();
                var refColumn = columns.find(function (column) {
                    return column.getGuid() == currencyColumnGuid;
                });
                return "From column '{1}'".assign(refColumn.getName());
            }
            if (settingType == jsonConstants.currencyTypes.FROM_ISO_CODE) {
                return currencyTypeInfo.getIsoCode();
            }

            _logger.warn('Invalid currency setting type');
            return strings.metadataExplorer.currencyEditor.NONE;
        };

        me.geoConfigDisplayFormatter = function(row, cell, geoConfig, config) {
            if (!geoConfig) {
                return strings.metadataExplorer.geoConfigEditor.NONE;
            }
            switch (geoConfig.getType()) {
                case jsonConstants.geoConfigType.LATITUDE:
                    return strings.metadataExplorer.geoConfigEditor.LATITUDE;
                case jsonConstants.geoConfigType.LONGITUDE:
                    return strings.metadataExplorer.geoConfigEditor.LONGITUDE;
                case jsonConstants.geoConfigType.ADMIN_DIV_0:
                    return strings.metadataExplorer.geoConfigEditor.COUNTRY;
                case jsonConstants.geoConfigType.ZIP_CODE:
                case jsonConstants.geoConfigType.ADMIN_DIV_1:
                case jsonConstants.geoConfigType.ADMIN_DIV_2:
                    var countryCode = geoConfig.getParent().getFixedValue();
                    if (!countryCode) {
                        throw new Error('Country code missing in geo config');
                    }
                    return GeoCountryConfig.get(countryCode).getLabel(geoConfig.getType());
                case jsonConstants.geoConfigType.CUSTOM_REGION:
                    return strings.metadataExplorer.geoConfigEditor.CUSTOM_REGION;
                default:
                    throw new Error('Unhandled geo config type: ' + geoConfig.getType());
            }
        };

        me.SelectCellEditor = function(args) {
            var $element;
            var initialValue;
            var selectedValue, scope;

            this.init = function() {
                var columnId = args.column.id;
                var options = args.column.getOptions(columnId, args.item);
                selectedValue = args.item[args.column.field];
                function onEdit(newValue) {
                    selectedValue = newValue;
                    if(!!args.grid.onEditCell) {
                        args.grid.onEditCell();
                    }
                }

            //TODO(Ashish): Make a component.
                scope = $rootScope.$new();
                angular.extend(scope, {
                    selectedValue: args.item[args.column.field],
                    options: options,
                    onEdit: onEdit
                });
                $element = angularUtil.getCompiledElement($templateCache.get('select-cell'), scope);

                $element.appendTo(args.container);
            };

            this.destroy = function() {
                $element.remove();
                $element = null;
                scope.$destroy();
                scope = null;
            };

            this.focus = function() {
                $element.focus();
            };

            this.loadValue = function(item) {
                initialValue = item[args.column.field];
            };

            this.serializeValue = function() {
                return selectedValue;
            };

            this.applyValue = function(item,state) {
                item[args.column.field] = state;
            };

            this.isValueChanged = function() {
                return selectedValue != initialValue;
            };

            this.validate = function() {
                return {
                    valid: true,
                    msg: null
                };
            };

            this.init();
        };

        me.dialogEditor = function (showDialog, dialogCssClass) {
            return function (args) {
                this.args = args;
                this.changed = false;
                this.cellData = args.item[args.column.field];
                this.init = function () {
                    var dlg = showDialog(
                        this.args.item.column.getGuid(),
                        this.cellData,
                        dialogCssClass,
                        function (newCellData) {
                            this.changed = true;
                            this.cellData = newCellData;
                            this.args.grid.getEditorLock().commitCurrentEdit();
                            this.args.grid.resetActiveCell();
                        }.bind(this),
                        function () {
                            this.args.grid.resetActiveCell();
                        }.bind(this),
                        function () {
                            $('#' + dlg.id).on('mousedown', function ($evt) {
                                // Eat the mousedown event so that slick-grid cell doesn't get out of edit
                                // mode.
                                $evt.stopPropagation();
                            });
                        }
                    );
                };

                this.destroy = this.focus = this.loadValue = this.applyValue = angular.noop;

                this.serializeValue = function () {
                    return this.cellData;
                };

                this.isValueChanged = function () {
                    return this.changed;
                };

                this.validate = function () {
                    return {
                        valid: true,
                        msg: null
                    };
                };

                this.init();
            };
        };

        me.BooleanCellEditor = function(args) {
            var $select,
                $checkbox,
                defaultValue,
                constrainedOption;
            this.init = function() {
                constrainedOption = args.column.getOption(args.column.id, args.item);
                if(constrainedOption !== null) {
                    $select = $(args.column.formatter(null, null, args.item[args.column.field]));
                    $select.tooltip({
                        title: strings.metadataExplorer.cannotToggleMessage,
                        animation: true,
                        placement: 'bottom'
                    });
                } else {
                    $select = $('<div class="onoffswitch" id="editableonoffswitch">' +
                    '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="editableonoff">' +
                    '<label class="onoffswitch-label" for="editableonoff">' +
                    '<span class="onoffswitch-inner"></span>' +
                    '<span class="onoffswitch-switch"></span>' +
                    '</label>' +
                    '</div>');
                }
                $checkbox = $select.find('input');
            // Hack (Francois/Ashish): SCAL-11164, the animation breaks if the user clicks in the cell
            // but not on the checkbox switch, as slickgrid re-instantiates the editor. Setting the default
            // value here to preserve the animation.
                $checkbox.prop('checked', args.item[args.column.field]);
                $select.appendTo(args.container);
                $select.focus();
            };

            this.destroy = function() {
                $select.remove();
            };

            this.focus = function() {
                $select.focus();
            };

            this.loadValue = function(item) {
                defaultValue = item[args.column.field];
                if(constrainedOption === null) {
                    $checkbox.prop('checked', !defaultValue);
                    if(args.grid.onEditCell) {
                        args.grid.onEditCell();
                    }
                }
            };

            this.serializeValue = function() {
                if(constrainedOption !== null) {
                    return constrainedOption;
                }
                return $checkbox.prop('checked');
            };

            this.applyValue = function(item,state) {
                item[args.column.field] = state;
            };

            this.isValueChanged = function() {
                return constrainedOption !== defaultValue
                && $checkbox.prop('checked') != defaultValue;
            };

            this.validate = function() {
                return {
                    valid: true,
                    msg: null
                };
            };

            this.init();
        };

    /**
     * An extension of Slick's TextCellEditor that overrides the validator
     * to pass it the cell item along with the field value.
     * @param args
     * @constructor
     */
        function TextCellEditor(args) {
        // provide the item to the cell validator for more context
            var suppliedValidator = args.column.validator;
            if (!!suppliedValidator) {
                args.column.validator = function (value) {
                    return suppliedValidator.call(this, value, args.item);
                };
            }

            TextCellEditor.__super.apply(this, arguments);
        }
        util.inherits(TextCellEditor, Slick.Editors.Text);

        me.TextCellEditor = TextCellEditor;


        me.updateProperties = function(values, field, editCommand) {
        // Update other fields on the basis of new value.
            dataRuleService.setNewProperties(field.id, editCommand.serializedValue, values);

        //Save all the fields.
            var column = values.column;
            column.setName(values.colName);
            column.setDescription(values.colDesc);
            column.setType(values.colType);
            column.setDataType(values.dataType);
            column.setAggregateType(values.aggType);
            column.setIsHidden(values.hidden);
            column.setIsAdditive(values.isAdditive);
            column.setIndexType(values.indexType);
            column.setSynonyms(values.synonyms);
            column.setGeoConfig(values.geoConfig);
            column.setFormatPattern(values.formatPattern);
            column.setIndexPriority(values.indexPriority);
            column.setCurrencyTypeInfo(values.currencyTypeInfo);
            column.setIsAttributionDimension(values.attributionDimension);
            editCommand.execute();
        };

        return me;

    }]);
