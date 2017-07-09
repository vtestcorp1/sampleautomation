/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview View for ThoughtSpot component(s) embedded inside an external page.
 */

'use strict';

blink.app.directive('blinkEmbed', ['Logger', function (Logger) {

    var _logger = Logger.create('blink-embed-ui');

    function linker(scope, $el, attrs) {}

    return {
        restrict: 'E',
        scope: {},
        link: linker,
        controller: 'BlinkEmbedController',
        templateUrl: 'src/modules/embed/blink-embed.html'
    };
}]);
