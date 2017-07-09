/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 */

'use strict';

blink.app.factory('BlinkPositionablePopover', ['$rootScope',
    'angularUtil',
    'Logger',
    'safeApply',
    function ($rootScope,
              angularUtil,
              Logger,
              safeApply) {

        var logger = Logger.create('blink-popover');

        var MOUSE_POPOVER_DELTA = 20;

        function BlinkPositionablePopover($anchor, additionalCssClasses) {
            var $popover = $('<div blink-positionable-popover></div>');

            this.scope = $rootScope.$new();
            this.scope.x = -1;
            this.scope.y = -1;
            this.scope.data = null;
            this.scope.show = false;
            this.scope.additionalCssClasses = additionalCssClasses || [];

            this.$popover = angularUtil.getCompiledElement($popover, this.scope);
            this.setAnchor($anchor);
        }

        BlinkPositionablePopover.prototype.setAnchor = function ($anchor) {
            $anchor = $anchor || $(document.body);
            $anchor.append(this.$popover);
        };

        BlinkPositionablePopover.prototype.show = function (x, y, data) {
            this.scope.x = x + MOUSE_POPOVER_DELTA;
            this.scope.y = y + MOUSE_POPOVER_DELTA;
            this.scope.data = data;
            this.scope.show = true;

            safeApply(this.scope);
        // we need to be sure that the DOM element has been updated before repositioning the tooltip
            this.repositionIfNeeded();
        };
        BlinkPositionablePopover.prototype.repositionIfNeeded = function() {

            var h = this.$popover.children().outerHeight(),
                w = this.$popover.children().outerWidth(),
                _w = $(window);
            var bottomScrollPosition =  _w.scrollTop() + _w.height();
            var rightScrollPosition = _w.scrollLeft() + _w.width();
            var deltaX = rightScrollPosition - (this.scope.x + w);
            var deltaY = bottomScrollPosition - (this.scope.y + h);

            if (deltaX >=0 && deltaY >=  0) {
                return;
            }
            if (deltaX < 0) {
                this.scope.x = this.scope.x - w - 2 * MOUSE_POPOVER_DELTA;
            }
            if (deltaY < 0) {
                this.scope.y = this.scope.y - h - 2 * MOUSE_POPOVER_DELTA;
            }

            safeApply(this.scope);
        };

        BlinkPositionablePopover.prototype.hide = function () {
            this.scope.data = null;
            this.scope.show = false;
            safeApply(this.scope);
        };

        BlinkPositionablePopover.prototype.destroy = function () {
            this.$popover.remove();
            this.scope.$destroy();
        };

        return BlinkPositionablePopover;
    }]);
