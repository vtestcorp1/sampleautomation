/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Ashish shubham (ashish.shubham@thoughtspot.com)
 *
 * @fileoverview Adds the capability to change the color of the zone based on
 * the current series. In other words support for the getColor(<series>) method.
 */

(function (H) {
    H.wrap(H.Series.prototype, 'getAttribs', function (proceed) {
        var series = this;
        series.zones.forEach(function(zone) {
            if(!!zone.getColor) {
                var color = zone.getColor(series);
                zone.color = color;
                zone.fillColor = color;
            }
        });
        return proceed.apply(series, Array.prototype.slice.call(arguments, 1));
    });

})(Highcharts);
