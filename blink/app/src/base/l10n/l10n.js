/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Filter for l10n
 */

'use strict';

blink.app.filter('l10n', ['session', function (session) {

    /**
     * Takes input like "message {0} like {1} this" with optional arguments to fill the optional positional vars
     *
     * @param {string} input
     */
    return function (input) {
        // get the locale hash from session, having the translations from english to other language
        var hash = session.getLocaleHash();

        // get translated string
        var translated = hash[input] || input;

        // most often used case
        if (arguments.length === 1) {
            return translated;
        }

        var optArgs = Array.prototype.slice.call(arguments, 1);
        angular.forEach(optArgs, function (val, i) {
            translated = translated.replace('{'+i+'}', val);
        });

        return translated;
    };
}]);

// provide l10n service so we can use l10n() in js
blink.app.factory('l10n', ['$filter', function ($filter) {
    return $filter('l10n');
}]);
