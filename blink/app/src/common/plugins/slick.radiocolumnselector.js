/**
 * Copyright: Thoughtspot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A slickgrid plugin that adds a radio button to table column header.
 *               This is based on https://github.com/mleibman/SlickGrid/blob/master/plugins/slick.headermenu.js
 */

(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "Custom": {
                "RadioColumnSelector": RadioColumnSelector
            }
        }
    });

    function RadioColumnSelector(options) {
        var grid,
            self = this,
            handler = new Slick.EventHandler(),
            defaults = {},
            selectableColumnPredicate = options.selectableColumnPredicate || function(){return false;};

        function init(slickGrid) {
            options = $.extend(true, {}, defaults, options);
            grid = slickGrid;
            handler
                .subscribe(grid.onHeaderCellRendered, handleHeaderCellRendered)
                .subscribe(grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy);

            // Force the grid to re-render the header now that the events are hooked up.
            grid.setColumns(grid.getColumns());
        }

        function destroy() {
            handler.unsubscribeAll();
        }

        function handleHeaderCellRendered(e, args) {
            var column = args.column;
            if (!selectableColumnPredicate(column)) {
                return;
            }

            var $radio = $('<input type="radio" name="table-header-selected-column class="bk-slick-radio-col-selector"/>');
            $(args.node).addClass('bk-table-column-selectable').prepend($radio);
            $radio.on('click.slick-radio-col-selector', function($evt){
                $evt.stopPropagation();
                self.onColumnSelectionChange.notify({
                    grid: grid,
                    column: column
                });
            });
        }


        function handleBeforeHeaderCellDestroy(e, args) {
            $(args.node).find(".bk-slick-radio-col-selector").remove();
        }

        $.extend(this, {
            "init": init,
            "destroy": destroy,
            "onColumnSelectionChange": new Slick.Event()
        });
    }
})(jQuery);
