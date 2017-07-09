/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview View for profile picture uploader
 */

'use strict';

blink.app.directive('blinkProfilePicUpload', ['$q',
    '$timeout',
    '$rootScope',
    'alertConstants',
    'alertService',
    'blinkConstants',
    'strings',
    'Command',
    'env',
    'events',
    'iframeFileUploadService',
    'imageUtil',
    'Logger',
    'safeDigest',
    'UserAction',
    'userService',
    function ($q,
              $timeout,
              $rootScope,
              alertConstants,
              alertService,
              blinkConstants,
              strings,
              Command,
              env,
              events,
              iframeFileUploadService,
              imageUtil,
              Logger,
              safeDigest,
              UserAction,
              userService) {

        var logger = Logger.create('profile-pic-upload-ui');

        function linker(scope, $el, attr) {
            scope.fileTooBig = false;
            scope.alertTooBigMessage = strings.alert.PICTURE_FILE_TOO_BIG;
            scope.uploadInstructions = strings.profilePic.UPLOAD_INSTRUCTIONS;
            $el.find('#bk-profile-pic-file-input').on('change', function () {
                if (!this.files[0]) {
                // user opened file browser, and clicked cancel
                    scope.fileTooBig = false;
                    return;
                }
                imageUtil.shrinkImage(
                this.files[0],
                blinkConstants.profilePic.DIMENSION,
                blinkConstants.profilePic.DIMENSION
            ).
                then(
                uploadImage,
                function(blob) {
                    scope.fileTooBig = true;
                    return $q.reject(null);
                }
            ).
                then(userService.invalidateCurrentUserProfilePicUrlCache);
            });

            function uploadImage(blob) {
                var command = new Command()
                .setPath('/image/uploadprofile')
                .setPostMethod()
                .setIsMultipart(true)
                .setPostParams({
                    id: scope.currentUserId,
                    content: blob
                });
                var userAction = new UserAction(UserAction.UPLOAD_PROFILE_PIC);
                return command.execute().then(
                function(response) {
                    alertService.showUserActionSuccessAlert(userAction, response);
                    return response;
                },
                function(response) {
                    alertService.showUserActionFailureAlert(userAction, response);
                    return $q.reject(response.data);
                }
            );
            }
        }

        return {
            restrict: 'A',
            replace: true,
            scope: {},
            link: linker,
            templateUrl: 'src/modules/user-preference/profile-pic-upload/profile-pic-upload.html',
            controller: 'ProfilePicUploadController'
        };
    }]);
