/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview View for Sage bubble
 */

'use strict';

blink.app.directive('blinkSageBubble', [function () {

    function linker(scope, element, attrs) {

        var $bubbleEl = element.find('.bk-sage-bubble');

        scope.showBubble = function (bubbleData) {
            scope.bubbleData = bubbleData;
            $bubbleEl.show();
        };

        scope.hideBubble = function () {
            $bubbleEl.hide();
        };
    }

    return {
        restrict: 'A',
        replace: true,
        scope: {},
        link: linker,
        templateUrl: 'src/modules/sage/sage-bubble/sage-bubble.html',
        controller: 'SageBubbleController'
    };

}]);
