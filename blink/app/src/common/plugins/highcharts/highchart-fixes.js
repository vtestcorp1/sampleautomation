(function (H) {
    // Note (sunny): this fix can be removed once this bug has been fixed
    // https://github.com/highslide-software/highcharts.com/issues/4077
    // Source of this workaround:
    // http://forum.highcharts.com/highcharts-usage/bar-chart-panning-bug-t32677/
    H.wrap(H.Chart.prototype, 'pan', function (proceed) {
        if (!this.inverted) {
            // Run original proceed method
            return proceed.apply(this, [].slice.call(arguments, 1));
        }

        if(this.inverted) {
            var e = arguments[1],
                panning = arguments[2],

                each = H.each,
                mathMax = Math.max,
                mathMin = Math.min,

                UNDEFINED,
                userAgent = navigator.userAgent,
                isOpera = window.opera,
                isIE = /(msie|trident)/i.test(userAgent) && !isOpera,
                SVG_NS = 'http://www.w3.org/2000/svg',
                hasSVG = !! document.createElementNS && !! document.createElementNS(SVG_NS, 'svg').createSVGRect;

            function css(el, styles) {
                if (isIE && !hasSVG) { // #2686
                    if (styles && styles.opacity !== UNDEFINED) {
                        styles.filter = 'alpha(opacity=' + (styles.opacity * 100) + ')';
                    }
                }
                H.extend(el.style, styles);
            }

            var chart = this,
                hoverPoints = chart.hoverPoints,
                doRedraw;

            // remove active points for shared tooltip
            if (hoverPoints) {
                each(hoverPoints, function (point) {
                    point.setState();
                });
            }

            each(panning === 'xy' ? [1, 0] : [1], function (isX) { // xy is used in maps
                var mousePos = e[!isX ? 'chartX' : 'chartY'],
                    axis = chart[isX ? 'xAxis' : 'yAxis'][0],
                    startPos = chart[!isX ? 'mouseDownX' : 'mouseDownY'],
                    halfPointRange = (axis.pointRange || 0) / 2,
                    extremes = axis.getExtremes(),
                    newMin = axis.toValue((startPos - mousePos)/5, true) + halfPointRange,
                    newMax = axis.toValue(chart[!isX ? 'plotWidth' : 'plotHeight'] + (startPos - mousePos)/10, true) - halfPointRange,
                    goingLeft = startPos > mousePos; // #3613

                if (axis.series.length && (goingLeft || newMin > mathMin(extremes.dataMin, extremes.min)) && (!goingLeft || newMax < mathMax(extremes.dataMax, extremes.max))) {
                    axis.setExtremes(newMin, newMax, false, false, {
                        trigger: 'pan'
                    });
                    doRedraw = true;
                }

                chart[isX ? 'mouseDownX' : 'mouseDownY'] = mousePos; // set new reference for next run
            });

            if (doRedraw) {
                chart.redraw(false);
            }
            css(chart.container, {
                cursor: 'move'
            });
        }
    });
}(Highcharts));
