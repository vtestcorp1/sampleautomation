/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Directive for alert panel. Displays success/error messages below sage bar or a specifiable element.
 */

'use strict';

blink.app.directive('blinkAlert', ['util', function (util) {

    function linker (scope, $el) {
        scope.showAlertUI = function () {
            scope.hidden = false;
            // we need for the current digest cycle to end
            // before we try to add the animation inducing
            // class.
            util.executeInNextEventLoop(function(){
                $el.addClass('bk-alert-open-animation');
            });
        };

        scope.hideAlertUI = function () {
            if (scope.hidden) {
                return;
            }
            if (scope.successHidingDelay === 0) {
                scope.hidden = true;
            } else {
                $el.one('transitionend webkitTransitionEnd', function () {
                    scope.hidden = true;
                    scope.$apply();
                });
            }

            $el.removeClass('bk-alert-open-animation');
        };
        scope.onCloseAlertAction = function () {
            scope.hideAlertUI();
        };
    }

    return {
        restrict: 'A',
        replace: true,
        scope:  {},
        link: linker,
        templateUrl: 'src/common/alert/alert.html',
        controller: 'AlertController'
    };

}]);
