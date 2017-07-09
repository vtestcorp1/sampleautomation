/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Service that builds the natural language representation of the query(s) executed to get the answer.
 */

'use strict';

blink.app.directive('blinkNaturalQuery', function () {
    return {
        restrict: 'E',
        scope: {
            answerModel: '=',
            maxGroupingColumnsToShow: '<',
            maxMeasuresToShow: '<',
            maxListColumnsToShow: '<'
        },
        templateUrl: 'src/modules/natural-query/natural-query/natural-query.html',
        controller: 'NaturalQueryController'
    };
});
