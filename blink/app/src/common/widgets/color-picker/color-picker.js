/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview A blink angular wrapper over bootstrap color-picker
 */

'use strict';
blink.app.directive('colorPicker', ['safeApply', 'Logger', function (safeApply, Logger) {
    var _logger = Logger.create('color-picker');

    // Note: This should be in sync with bootstrap css for dropdown (unlikely to change).
    var COLOR_PICKER_ARROW_OFFSET = 15;
    var DEFAULT_COLOR = '#777';

    $.fn.colorpicker.constructor.prototype.reposition = function()
    {
        if (this.options.inline !== false) {
            return false;
        }

        var jqwindow = $(window);
        var type = this.container && this.container[0] !== document.body ? 'position' : 'offset';
        var offset = this.component ? this.component[type]() : this.element[type]();
        var bottomScrollPosition =  jqwindow.scrollTop() + jqwindow.height();
        var rightScrollPosition = jqwindow.scrollLeft() + jqwindow.width();
        var componentOuterHeight = (this.component ? this.component.outerHeight() : this.element.outerHeight());

        // reposition and add class as needed
        if (offset.top + this.picker[0].clientHeight > bottomScrollPosition) {
            var offsetHeight = this.element.parent().outerHeight();
            this.picker.css({
                left: offset.left,
                top: offset.top - COLOR_PICKER_ARROW_OFFSET -offsetHeight - this.picker.outerHeight() - componentOuterHeight
            });

            this.picker.removeClass('arrow-right');
            this.picker.addClass('arrow-down');
        } else if (offset.left+this.picker[0].clientWidth > rightScrollPosition) {
            var parentOffset = this.element.parent().offset();
            this.picker.css({
                left: parentOffset.left - this.picker.outerWidth() - COLOR_PICKER_ARROW_OFFSET,
                top: parentOffset.top - COLOR_PICKER_ARROW_OFFSET/2
            });

            this.picker.removeClass('arrow-down');
            this.picker.addClass('arrow-right');
        } else {
            this.picker.removeClass('arrow-down arrow-right');
            this.picker.css({
                top: offset.top + componentOuterHeight,
                left: offset.left
            });
        }
    };

    function linker(scope, $colorPicker) {
        if (!scope.color) {
            scope.color = DEFAULT_COLOR;
        }

        // If this is not editable, don't even bother with rest of the stuff.
        if (scope.isNotEditable()) {
            return;
        }

        var width = $colorPicker.width(),
            anchorLeft = width / 2 - COLOR_PICKER_ARROW_OFFSET;

        var $colorPickerAnchor = $colorPicker.find('.bk-color-picker-anchor');
        $colorPickerAnchor.css({left: anchorLeft + 'px'});

        function convertColorToCSSValue(rgbaColor) {
            return 'rgba({r}, {g}, {b}, {a})'.assign(rgbaColor);
        }

        function handleColorChanged(ev) {
            scope.color = convertColorToCSSValue(ev.color.toRGB());
            safeApply(scope);
        }

        var colorBeforeShow;
        function handleShowPicker(ev) {
            colorBeforeShow = scope.color;
        }

        function handleHidePicker(ev) {
            if (scope.color === colorBeforeShow) {
                return;
            }

            safeApply(scope, function () {
                scope.onChange();
            });
        }

        function showColorPicker() {
            if (!isInitialized) {
                isInitialized = true;
                $colorPickerAnchor.colorpicker({
                    format: 'rgba',
                    color: scope.color
                })
                    .on('changeColor', handleColorChanged)
                    .on('showPicker', handleShowPicker)
                    .on('hidePicker', handleHidePicker);
            }
            $colorPickerAnchor.colorpicker('show');
        }

        var isInitialized = false;
        scope.onClick = function () {
            if (scope.isNotEditable() || scope.isTriggeredExternally) {
                return;
            }

            showColorPicker();
        };

        function destroy() {
            if (!isInitialized) {
                return;
            }

            try { $colorPickerAnchor.colorpicker('destroy'); } catch (e) {
                _logger.log(e);
            }
        }

        $colorPicker.on('showColorPicker', showColorPicker);
        $colorPicker.on('$destroy', destroy);
        scope.$on('$destroy', destroy);
    }

    return {
        restrict: 'E',
        replace: true,
        require: 'ngModel',
        scope: {
            color: '=ngModel',
            shouldFill: '&fill',
            isNotEditable: '&notEditable',
            isTriggeredExternally: '=',
            onChange: '&onChange'
        },
        templateUrl: 'src/common/widgets/color-picker/color-picker.html',
        link: linker
    };
}]);
