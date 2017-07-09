/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Controller for profile picture uploader
 */

'use strict';

blink.app.controller('ProfilePicUploadController', ['$scope', 'Logger', 'env', 'sessionService', 'strings',
    function ($scope, Logger, env, sessionService, strings) {

        var logger = Logger.create('profile-pic-upload-controller');

        $scope.currentUserId = sessionService.getUserGuid();

    }]);
