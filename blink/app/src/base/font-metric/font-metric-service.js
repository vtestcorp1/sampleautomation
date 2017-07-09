/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to measure text dimensions
 */

'use strict';

blink.app.factory('fontMetricService', ['$q', 'Logger', 'util', '$rootScope', 'env', '$http',
    function ($q, Logger, util, $rootScope, env, $http) {

        var me = {},
            _logger = Logger.create('font-metric-service'),
            _$canvas = null,
            canvasId = 'bk-text-measurement-canvas',
            ellipses = '...';

        function getMeasurementCanvas() {
            if (_$canvas !== null) {
                return _$canvas;
            }

            _$canvas = $('<canvas id="{1}"></canvas>'.assign(canvasId));
            $('body').append(_$canvas);
            return _$canvas;
        }

        /**
         * Truncates a string so that if rendered with the given font it would fit
         * within maxWidth. Truncated strings are always suffixed by ellipses (...)
         * @param text
         * @param maxWidth
         * @param {string} font e.g. "11px regular, 'Lucida Grande', sans-serif";
         * @returns {*}
         */
        me.truncateTextToWidth = function (text, maxWidth, font) {
            if (!text) {
                return text;
            }

            var $canvas = getMeasurementCanvas();
            $canvas.show();

            var ctx = $canvas[0].getContext("2d");
            ctx.font = font;

            // first try to check if the whole label will fit the width
            // this should take care of a big fraction of cases
            var fullTextWidth = ctx.measureText(text).width;
            if (fullTextWidth <= maxWidth) {
                $canvas.hide();
                return text;
            }

            // use fixed width font assumption to improve the initial range
            // for the binary search that we are about to do
            var averagePerCharacterWidth = fullTextWidth/text.length,
                fixedWidthFontBestGuessFitSlice = text.substr(0, maxWidth/averagePerCharacterWidth);

            var beginIndex = 0,
                endIndex = text.length,
                ellipsesWidth = ctx.measureText(ellipses).width;
            if (ctx.measureText(fixedWidthFontBestGuessFitSlice).width <= maxWidth - ellipsesWidth) {
                beginIndex = fixedWidthFontBestGuessFitSlice.length;
            } else {
                endIndex = fixedWidthFontBestGuessFitSlice.length;
            }

            while (beginIndex < endIndex - 1) {
                var mid = Math.floor((beginIndex + endIndex)/2),
                    sub = text.substr(0, mid);
                if (ctx.measureText(sub).width < maxWidth - ellipsesWidth) {
                    beginIndex = mid;
                } else {
                    endIndex = mid;
                }
            }

            $canvas.hide();
            return endIndex > 1 ?  text.substr(0, beginIndex) + ellipses : '';
        };

        me.getTextWidth = function (text, font) {
            var $canvas = getMeasurementCanvas();
            $canvas.show();

            var ctx = $canvas[0].getContext("2d");
            ctx.font = font;

            var rv = ctx.measureText(text).width;
            $canvas.hide();
            return rv;
        };

        return me;

    }]);
