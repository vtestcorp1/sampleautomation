/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Slick grid drop down plugin
 * This plugin allows slick grid to provide a drop down configuration and receive a selection change event.
 */

(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "Custom": {
                "ChosenColumnHeaderPlugin": ChosenColumnHeaderPlugin
            }
        }
    });

    function ChosenColumnHeaderPlugin(options) {
        var _grid;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _defaults = {
            dropDownCssClass: "bk-table-header-chosen-menu"
        };

        function init(grid) {
            options = $.extend(true, {}, _defaults, options);
            _grid = grid;
            _handler
                .subscribe(_grid.onHeaderCellRendered, handleHeaderCellRendered)
                .subscribe(_grid.onBeforeHeaderCellDestroy, handleBeforeHeaderCellDestroy);

            forceGridHeaderRerender();
        }

        function update() {
            forceGridHeaderRerender();
        }

        function destroy() {
            _handler.unsubscribeAll();
        }

        function handleHeaderCellRendered(e, args) {
            var column = args.column;
            var grid = args.grid;

            if (!column.chosenPluginParams || !column.id) {
                return;
            }

            var chosenPluginParams = column.chosenPluginParams;
            var optionsMap = chosenPluginParams.optionsMap;
            var selectedValue = chosenPluginParams.selectedValue;

            if (grid.isUneditableAnswer) {
                var value = Object.keys(optionsMap).
                    find(function(key){
                        return optionsMap[key] === selectedValue;
                    });

                var readOnlyDiv= '<div style="line-height: 2px">{1}</div>'.
                    assign(value);

                var readOnlyButton = $(readOnlyDiv);
                readOnlyButton.appendTo(args.node);
                return;
            }

            var width = chosenPluginParams.width,
                id = column.id,
                selectHtml = "<select extract-chosen-dropdown>";

            for (var option in optionsMap) {
                if (optionsMap.hasOwnProperty(option)) {
                    selectHtml += "<option value=\'{1}\'>{2}</option>".assign(optionsMap[option],option);
                }
            }
            selectHtml += "</select>";
            var btn = $(selectHtml);

            btn.val(selectedValue);
            btn.data("id", id);

            btn.addClass(options.dropDownCssClass)
                .on('change', function (evt, params) {
                    column.chosenPluginParams.onSelectionChange(params.selected);
                });

            btn.appendTo(args.node);

            btn.chosen({disable_search: true, width: width});
        }

        function handleBeforeHeaderCellDestroy(e, args) {
            // Removing buttons via jQuery will also clean up any event handlers and data.
            // NOTE: If you attach event handlers directly or using a different framework,
            //       you must also clean them up here to avoid memory leaks.
            $(args.node).find("." + options.buttonCssClass).remove();
        }

        function forceGridHeaderRerender() {
            // Force the grid to re-render the header now that the events are hooked up.
            _grid.setColumns(_grid.getColumns());
        }


        $.extend(this, {
            "init": init,
            "destroy": destroy,
            "update": update
        });
    }
})(jQuery);
