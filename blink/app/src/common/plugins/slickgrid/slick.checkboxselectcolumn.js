/**
 * Note(Shikhar) - this has been modified from the original examples.
 * Features added:
 * 1. It handles selection on the groups if grouping is enabled. Selecting a group selects all the rows within it.
 *
 * Requirements:
 * 1. For group selection: while calling the constructor, a css class selector can be provided by the parameter
 *    name groupCheckboxClass. The default is 'group-checkbox'
 */

(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "CheckboxSelectColumn": CheckboxSelectColumn
        }
    });


    function CheckboxSelectColumn(options) {
        var _grid;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _selectedRowsLookup = {};
        var _selectedGroupsLookup = {};
        // This acts as a lock to modify the checkboxes only when selection change happens through checkbox clicks
        var areRowsSelectedDueToMe = false;
        var _defaults = {
            columnId: "_checkbox_selector",
            cssClass: null,
            toolTip: "Select/Deselect All",
            width: 30,
            groupCheckboxClass: 'group-checkbox'
        };

        var _options = $.extend(true, {}, _defaults, options);

        function init(grid) {
            _grid = grid;
            _handler
                .subscribe(_grid.onSelectedRowsChanged, handleSelectedRowsChanged)
                .subscribe(_grid.onClick, handleClick)
                .subscribe(_grid.onHeaderClick, handleHeaderClick)
                .subscribe(_grid.onKeyDown, handleKeyDown);
        }

        function destroy() {
            _handler.unsubscribeAll();
        }

        function handleSelectedRowsChanged(e, args) {
            if (!areRowsSelectedDueToMe) {
                return;
            }
            var selectedRows = _grid.getSelectedRows();
            var lookup = {}, row, i;
            for (i = 0; i < selectedRows.length; i++) {
                row = selectedRows[i];
                lookup[row] = true;
                if (lookup[row] !== _selectedRowsLookup[row]) {
                    _grid.invalidateRow(row);
                    delete _selectedRowsLookup[row];
                }
            }
            for (i in _selectedRowsLookup) {
                _grid.invalidateRow(i);
            }
            _selectedRowsLookup = lookup;
            _grid.render();

            if (selectedRows.length && selectedRows.length == _grid.getDataLength()) {
                _grid.updateColumnHeader(_options.columnId, "<input type='checkbox' checked='checked'>", _options.toolTip);
            } else {
                _grid.updateColumnHeader(_options.columnId, "<input type='checkbox'>", _options.toolTip);
            }

            // Checking the group checkboxes
            Object.keys(_selectedGroupsLookup).each(function (grpIndex) {
                var $el = $(_grid.getCellNode(grpIndex, 0)).find('.' + _options.groupCheckboxClass);
                if (!$el || !$el.length) {
                    return;
                }
                $el.prop('checked', true);
            });
        }

        function handleKeyDown(e, args) {
            if (e.which == 32) {
                if (_grid.getColumns()[args.cell].id === _options.columnId) {
                    // if editing, try to commit
                    if (!_grid.getEditorLock().isActive() || _grid.getEditorLock().commitCurrentEdit()) {
                        areRowsSelectedDueToMe = true;
                        toggleRowSelection(args.row);
                        areRowsSelectedDueToMe = false;
                    }
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        }

        function handleClick(e, args) {
            // clicking on a row select checkbox
            var $el = $(e.target);
            if ((_grid.getColumns()[args.cell].id === _options.columnId && $el.is(":checkbox")) ||
                $el.hasClass(_options.groupCheckboxClass)) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }

                areRowsSelectedDueToMe = true;

                if ($el.hasClass(_options.groupCheckboxClass)) {
                    toggleGroupSelection(args.row);
                } else {
                    toggleRowSelection(args.row);
                }

                areRowsSelectedDueToMe = false;

                e.stopPropagation();
                // We do not stop immediate propagation so that the slick.grid.handleClick() can set the right
                // active cell.
                // e.stopImmediatePropagation();
            }
        }

        function toggleRowSelection(row) {
            if (_selectedRowsLookup[row]) {
                _grid.setSelectedRows($.grep(_grid.getSelectedRows(), function (n) {
                    return n != row
                }));
            } else {
                _grid.setSelectedRows(_grid.getSelectedRows().concat(row));
            }
        }

        function toggleGroupSelection(row) {
            // Determining the row indices in the group. We are using the fact that rows including the group row are
            // continuous.
            // TODO (Shikhar) - check what happens in case of filters.
            var rows = {};
            rows[row] = true;
            for (var i = row + 1; i <= row + _grid.getDataItem(row).count; i++) {
                rows[i] = true;
            }
            var selectedRowsWithoutGroup = $.grep(_grid.getSelectedRows(), function (n) {
                return !rows[n];
            }) || [];
            if (_selectedRowsLookup[row]) {
                delete _selectedGroupsLookup[row];
                _grid.setSelectedRows(selectedRowsWithoutGroup);
            } else {
                _selectedGroupsLookup[row] = true;
                _grid.setSelectedRows(selectedRowsWithoutGroup.concat(Object.keys(rows)));
            }
        }

        function handleHeaderClick(e, args) {
            if (args.column.id == _options.columnId && $(e.target).is(":checkbox")) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }

                areRowsSelectedDueToMe = true;

                if ($(e.target).is(":checked")) {
                    var rows = [];
                    for (var i = 0; i < _grid.getDataLength(); i++) {
                        rows.push(i);
                    }
                    _grid.setSelectedRows(rows);
                } else {
                    _grid.setSelectedRows([]);
                }

                areRowsSelectedDueToMe = false;

                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }

        function getColumnDefinition() {
            return {
                id: _options.columnId,
                name: "<input type='checkbox'>",
                toolTip: _options.toolTip,
                field: "sel",
                width: _options.width,
                resizable: false,
                sortable: false,
                cssClass: _options.cssClass,
                formatter: checkboxSelectionFormatter,
                // This is added so that when we press TAB, etc, the control does not come to checkbox column
                focusable: false
            };
        }

        function checkboxSelectionFormatter(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
                return _selectedRowsLookup[row]
                    ? "<input type='checkbox' checked='checked'>"
                    : "<input type='checkbox'>";
            }
            return null;
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,

            "getColumnDefinition": getColumnDefinition
        });
    }
})(jQuery);
