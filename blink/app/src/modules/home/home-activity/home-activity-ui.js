/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview View for Activity Home Widget
 */

'use strict';

blink.app.directive('blinkHomeActivity', ['blinkConstants',
    'strings',
    'Logger',
    function (blinkConstants,
              strings,
              Logger) {

        var _logger = Logger.create('home-activity-ui');

        function linker(scope, $el) {
            var showing = false;

            scope.activityFeed = strings.activityFeed;

            scope.isShowingActivity = function () {
                return showing;
            };

            scope.toggleShow = function () {
                showing = !showing;
                scope.handleVisibilityChange(showing);
            };
        }

        return {
            restrict: 'A',
            replace: true,
            link: linker,
            scope: {},
            templateUrl: 'src/modules/home/home-activity/home-activity.html',
            controller: 'HomeActivityController'
        };

    }]);
