/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

angular.module('blink.filters', [])
    .filter('searchResultHighlight', function() {
        return function (text, filter) {
            if (!filter) {
                return text;
            }

            return text.replace(
            new RegExp('('+ filter.escapeRegExp() + ')', 'gi'),
            '<span class="bk-filtered-match">$1</span>'
        );
        };
    });

// https://gist.github.com/thomseddon/3511330
blink.app.filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
            return '-';
        }
        if (typeof precision === 'undefined') {
            precision = 1;
        }
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
});
