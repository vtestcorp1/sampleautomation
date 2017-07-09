(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "Custom": {
                "ColumnMenuPlugin": ColumnMenuPlugin
            }
        }
    });


    function ColumnMenuPlugin(options) {
        var _grid;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _columnMenu = new ColumnMenu();
        var _defaults = {
            buttonCssClass: "bk-table-header-menu-btn"
        };

        function forceGridHeaderRerender() {
            // Force the grid to re-render the header now that the events are hooked up.
            _grid.setColumns(_grid.getColumns());
        }

        function closeMenu(e) {
            if (_columnMenu.domNode().data('columnId') !== null) {
                notifyAndHide(e);
                forceGridHeaderRerender();
            }
        }

        function init(grid) {
            options = $.extend(true, {}, _defaults, options);
            _grid = grid;
            _columnMenu.updateGridCanvas(_grid && $(_grid.getCanvasNode()) || null);
            _handler
                .subscribe(_grid.onHeaderCellRendered, handleHeaderCellRendered)
                .subscribe(_grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy);

            $(window).on('mousedown.slick.columnMenuPlugin', handleWindowMouseDown);
            $(window).resize(closeMenu);
            forceGridHeaderRerender();
        }

        function update() {
            forceGridHeaderRerender();
        }

        function destroy() {
            $(window).off('mousedown.slick.columnMenuPlugin', handleWindowMouseDown);
            $(window).off('resize');
            _handler.unsubscribeAll();
        }

        function handleWindowMouseDown(e) {
            var $el = _columnMenu.domNode();
            if (!$el.is(':visible')) {
                // If the element is not in the view, we ignore the click
                return;
            }
            var $target = $(e.target);
            if ($target[0] == $el[0] || $el.has($target).length) {
                // Click is inside $el
                return;
            }

            var ignoredSelectors = ['.datepicker.datepicker-dropdown', '.' + options.buttonCssClass];

            var isTargetMatchingAnyIgnoredElement = ignoredSelectors.any(function (ignoredSelector) {
                var $ignoreDoms = $(ignoredSelector);
                // Return true if the click came from within any of the ignored doms.
                return Array.prototype.any.call($ignoreDoms, function ($ignore) {
                    return $target[0] == $ignore || $($ignore).has($target).length;
                });
            });

            if (isTargetMatchingAnyIgnoredElement) {
                return;
            }

            notifyAndHide(e);
            forceGridHeaderRerender();
        }

        function notifyAndHide(e) {
            _columnMenu.hide();
        }

        function handleHeaderCellRendered(e, args) {
            var column = args.column;

            if (!column.menuPluginParams) {
                return;
            }

            var $btnMenu = column.menuPluginParams.getMenuBtnDom();

            var btn = $("<div></div>")
                .addClass(options.buttonCssClass)
                .data("column", column)
                .append($btnMenu);

            var inUse = column.id === _columnMenu.domNode().data('columnId');
            btn.toggleClass('bk-in-use', inUse)
                .bind("click", handleButtonClick)
                .appendTo(args.node);

            $(args.node).addClass('with-menu');
        }

        function handleBeforeHeaderCellDestroy(e, args) {
            // Removing buttons via jQuery will also clean up any event handlers and data.
            // NOTE: If you attach event handlers directly or using a different framework,
            //       you must also clean them up here to avoid memory leaks.
            $(args.node).find("." + _defaults.buttonCssClass).remove();
        }

        function handleButtonClick(e) {
            var $thisBtn = $(this);
            var columnDef = $thisBtn.data("column"),
                isMenuAlreadyOpen = columnDef.id === _columnMenu.domNode().data('columnId');
            if (!isMenuAlreadyOpen) {
                _columnMenu.showAt($thisBtn);
                var $menuNode = columnDef.menuPluginParams.getMenuDom();
                _columnMenu.domNode().empty().append($menuNode);
            } else {
                notifyAndHide(e);
            }

            // Update column header because either showing or hiding the menu can have impact on button styling.
            _grid.updateColumnHeader(columnDef.id);

            // Stop propagation so that it doesn't register as a header click event.
            e.preventDefault();
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,
            "update": update,
            "closeMenu": closeMenu
        });
    }

    function ColumnMenu() {
        var MENU_BODY_SELECTOR = '.bk-table-header-menu-body',
            $body = $('body'),
            $gridCanvas;
        // This menu creation method should only be called once in lifecycle of a table rendering (as opposed to per
        // column).
        //
        // The menu dom is shared across the various columns (and repositioned as needed).
        function createHeaderMenu() {
            // Remove any previous instances of the menu (since the menu needs to be recompiled with this table scope
            // anyways).
            $('.bk-table-header-menu-body').remove();
            var $tableHeaderMenuBody = $(
                '<div class="bk-table-header-menu-body"></div>'
            );
            $tableHeaderMenuBody.hide();
            $body.append($tableHeaderMenuBody);
        }

        var DROPDOWN_MENU_VERTICAL_OFFSET = 5;
        var DROPDOWN_MENU_HORIZONTAL_OFFSET = 12;
        var MAX_MENU_WIDTH = 300;
        var COLUMN_MENU_LEFT_OF_ANCHOR = 'bk-column-menu-left-of-anchor';
        function getMenuPositionAt(anchorDisplayProperties, showDropdownLeftOfAnchor) {
            var top = anchorDisplayProperties.top + anchorDisplayProperties.height + DROPDOWN_MENU_VERTICAL_OFFSET;
            var right = showDropdownLeftOfAnchor
                ? ($body.width() - (anchorDisplayProperties.left + anchorDisplayProperties.width) - DROPDOWN_MENU_HORIZONTAL_OFFSET)
                : 'auto';
            var left = showDropdownLeftOfAnchor
                ? 'auto'
                : (anchorDisplayProperties.left - DROPDOWN_MENU_HORIZONTAL_OFFSET);

            return {
                top: top,
                right: right,
                left: left
            };
        }

        function showMenuOnLeft(anchorDisplayProperties) {
            var showMenuOnLeft = (anchorDisplayProperties.left + anchorDisplayProperties.width/2)
                > MAX_MENU_WIDTH;
            return showMenuOnLeft;
        }

        function getAnchorDisplayProperties($anchor) {
            var anchorOffset = $anchor.offset();
            var height = $anchor.height();
            var width = $anchor.width();
            return {
                top: anchorOffset.top,
                left: anchorOffset.left,
                height: height,
                width: width
            }
        }

        function showAt($anchor) {
            var $tableHeaderMenuBody = domNode();
            $tableHeaderMenuBody.data("columnId", $anchor.data('column') && $anchor.data('column').id);
            var anchorDisplayProps = getAnchorDisplayProperties($anchor);
            var showMenuOnLeftOfAnchor = showMenuOnLeft(anchorDisplayProps);
            $tableHeaderMenuBody.removeClass(COLUMN_MENU_LEFT_OF_ANCHOR);
            if (showMenuOnLeftOfAnchor) {
                $tableHeaderMenuBody.addClass(COLUMN_MENU_LEFT_OF_ANCHOR);
            }
            $tableHeaderMenuBody.css(getMenuPositionAt(anchorDisplayProps, showMenuOnLeftOfAnchor));
            $tableHeaderMenuBody.show();
            // SCAL-5442: Disable scroll on table grid when the column menu is being shown.
            if ($gridCanvas) {
                $gridCanvas.parent().css('overflow', 'hidden');
            }
        }

        function hide() {
            var $tableHeaderMenuBody = domNode();
            $tableHeaderMenuBody.hide();
            $tableHeaderMenuBody.data("columnId", null);
            // SCAL-5442: Restore scroll that was disabled by showAt().
            if ($gridCanvas) {
                $gridCanvas.parent().css('overflow', 'auto');
            }
        }

        function domNode() {
            return $(MENU_BODY_SELECTOR);
        }

        function updateGridCanvas($gc) {
            $gridCanvas = $gc;
        }

        $.extend(this, {
            "showAt": showAt,
            "hide": hide,
            "domNode": domNode,
            "updateGridCanvas": updateGridCanvas
        });

        createHeaderMenu();
    }
})(jQuery);
