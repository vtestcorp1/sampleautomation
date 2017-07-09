/**
 * Created by rahul on 6/29/15.
 */

'use strict';

blink.app.controller('SlackAuthController', ['$routeParams', 'slackService', 'navService', 'strings', '$location',
    function($routeParams, slackService, navService, strings, $location) {
        if (!!$routeParams.code) {
            slackService.initialize().then(function() {
                slackService.getSlackAccessToken($routeParams.code).then(function(data) {
                    $location.url($location.path());
                    navService.goToUserPreference();
                });
            });
        } else {
            navService.goToUserPreference();
        }
    }
]);
