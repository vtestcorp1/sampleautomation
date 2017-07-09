/**
 * Copyright: ThoughtSpot Inc. 2012-2014
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Widgets for showing user profile pics
 */

'use strict';

blink.app.directive('blinkProfilePic', ['$q',
    '$rootScope',
    'alertService',
    'events',
    'userService',
    'Logger',
    'avatarService',
    'UserAction',
    function ($q,
          $rootScope,
          alertService,
          events,
          userService,
          Logger,
          avatarService,
          UserAction) {

        var _logger = Logger.create('blink-profile-pic');


        function linker(scope) {

            var DEFAULT_PROFILE_PIC = '/resources/img/default-profile-pic.png';
            scope.userAvatar = null;
            scope.displayName = scope.userDisplayName && scope.userDisplayName.trim();

            function updateUserDisplayName() {
                if(!!scope.displayName || !scope.userId) {
                    return;
                }

                return userService.getUserById(scope.userId).
                then(function(user) {
                    scope.displayName = user.getDisplayName() || user.getName();
                });
            }

            function updatePic() {
                scope.picUrl = DEFAULT_PROFILE_PIC;
            //TODO(Rahul/Messaging): Handle failure here.
                userService.getProfilePicUrl(scope.userId);
            }

            function updateUserDetails() {
                updateUserDisplayName();
                updatePic();
            }

            scope.getTooltip = function () {
                return (!!scope.showTooltip) ? scope.displayName : '';
            };

            scope.$on(events.USER_PROFILE_PIC_AVAILABLE_D, function($event, userId, updatedUrl){
                if (userId === scope.userId) {
                    if (updatedUrl) {
                        scope.picUrl = updatedUrl;
                        scope.userAvatar = null;
                    } else {
                        avatarService.getAutoAvatar(scope.userId, scope.displayName).then(function (userIconProfile) {
                            if (scope.picUrl === DEFAULT_PROFILE_PIC){
                                scope.userAvatar = userIconProfile;
                            }
                        }, function (error) {
                            _logger.warn("error in creating user's avatar", error);
                        });
                    }
                }
            });

        // These watches are needed to handle cases like answer page
        // where the userId/userName can change. E.g. if the user clears
        // the answer the userId becomes empty. But if the user
        // re types a query the same dom nodes are used for
        // the directive
            scope.$watchGroup(['userId', 'userDisplayName'], function(oldUserValue, newUserValue){
                if (!!newUserValue && oldUserValue === newUserValue) {
                    return;
                }
                updateUserDetails();
            });
            updateUserDetails();
        }

    // userDisplayName is an option parameter. If its available there won't be a
    // need to get display name or username using UserId.

        return {
            restrict: 'E',
            replace: true,
            link: linker,
            scope: {
                userId: '=',
                userDisplayName: '=?',
                showTooltip: '='
            },
            templateUrl: 'src/common/widgets/profile-pic/profile-pic.html'
        };
    }]);

blink.app.controller('BlinkCurrentUserProfilePicController', ['$scope', 'sessionService',
    function ($scope, sessionService) {
        $scope.userId = sessionService.getUserGuid();
        $scope.displayName = sessionService.getUserDisplayName();
    }]);

blink.app.directive('blinkCurrentUserProfilePic', ['sessionService',  function (sessionService) {
    return {
        restrict: 'E',
        replace: true,
        controller: 'BlinkCurrentUserProfilePicController',
        template: '<span><blink-profile-pic user-id="userId" user-display-name="displayName"></blink-profile-pic></span>'
    };
}]);
