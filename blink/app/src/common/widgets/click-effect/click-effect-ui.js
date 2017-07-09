/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jordie Hannel (jordie@thoughtspot.com)
 *
 * @fileoverview View for Click Effect
 */

'use strict';

blink.app.directive('blinkClickEffect', ['$filter',
    'Logger',
    function ($filter,
              Logger) {

        var logger = Logger.create('click-effect-ui'),
            DIAMETER = 60;

        function linker(scope, $el, attr) {
            $el.css({
                left: scope.xpos - DIAMETER/2,
                top: scope.ypos - DIAMETER/2,
                width: DIAMETER,
                height: DIAMETER
            });

            $el.on(
            'animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd',
            scope.onDone
        );
        }

        return {
            restrict: 'A',
            replace: true,
            link: linker,
            scope: {
                xpos: '=',
                ypos: '=',
                onDone: '='
            },
            templateUrl: 'src/common/widgets/click-effect/click-effect.html',
        };
    }]);
