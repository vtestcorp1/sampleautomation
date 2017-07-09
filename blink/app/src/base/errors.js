/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Error Constants used in Blink.
 */

'use strict';

blink.app.factory('blinkErrors', ['util', function (util) {
    var BaseObjectMissingError = function() {
        this.name = 'BaseObjectMissingError';
        this.message = 'Some data that this document refers to has been deleted.';
        this.stack = (new Error()).stack;
    };

    util.inherits(BaseObjectMissingError, Error);

    return {
        BaseObjectMissingError: BaseObjectMissingError
    };
}]);
