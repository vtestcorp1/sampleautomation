/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Priyanshi Deshwal (priyanshi@thoughtspot.com)
 *
 * @fileoverview Carousel widget
 */

'use strict';

blink.app.controller('CarouselController', ['blinkConstants',
    'strings',
    '$scope',
    '$rootScope',
    '$sce',
    '$q',
    'alertService',
    'Spotlight',
    'supportService',
    'UserAction',
    'util',
    function(blinkConstants,
         strings,
         $scope,
         $rootScope,
         $sce,
         $q,
         alertService,
         Spotlight,
         supportService,
         UserAction,
         util) {

        $scope.highlightColumnsPanel = function($event) {
            $event.stopPropagation();
            Spotlight.focus({
                selector: '.bk-sage-data-columns.bk-highlight-area',
                rightMargin: 19,
                top: 0
            });
        };

        $scope.highlightChooseSources = function($event) {
            $event.stopPropagation();
            Spotlight.focus({
                selector: '.bk-manage-sources .bk-choose-sources-btn',
                rightMargin: 45,
                top: -3
            });
        };

        var userAction = new UserAction(UserAction.HELP_PORTAL_TOKEN);

        var authTokenPromise = supportService.getHelpPortalAuthToken()
        .then(function (response) {
            return response.data;
        }, function (response) {
            // TODO (Priyanshi) - Fallback for when error getting authentication token
            alertService.showUserActionFailureAlert(userAction, response);
            return $q.reject(response.data);
        });

        var releaseNamePromise = supportService.getReleaseVersion();

        util.getAggregatedPromise([authTokenPromise, releaseNamePromise])
        .then(function (data) {
            var authToken = data[0],
                versionName = data[1];
            var versionNameForLink = versionName.slice(0, 3);
            $scope.mindTouchUrlKeywords = $sce.trustAsResourceUrl(
                blinkConstants.help.mindTouchUrl.keywords.URL.assign({
                    authToken: authToken,
                    versionNameForLink: versionNameForLink
                }));
        });
    }]);

blink.app.directive('blinkCarousel', [function () {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'src/common/widgets/carousel/carousel.html',
        controller: 'CarouselController',
        scope: {
            carousel: '=model'
        }
    };
}]);
