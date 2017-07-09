/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Service used to upload file
 */

'use strict';

blink.app.factory('fileUploadService', ['$q',
    'Command',
    'iframeFileUploadService',
    '$rootScope',
    'safeApply',
    function ($q,
          Command,
          iframeFileUploadService,
          $rootScope,
          safeApply) {
        var me = {};

    /**
     * @param uploadTargetPath
     * @param uploadApiPostParams
     */
        me.uploadFileContent = function (uploadTargetPath, uploadApiPostParams) {
            var command = new Command()
            .setPath(uploadTargetPath)
            .setPostMethod()
            .setPostParams(uploadApiPostParams);

            return command.execute();
        };

        me.uploadFileMultiPart = function (multiPartFormPath) {
            var deferred = $q.defer();

            iframeFileUploadService.upload({
                path: '/callosum/v1' + multiPartFormPath,
                $form: $('.bk-html5-upload-form'),
                success: function (data) {
                    safeApply($rootScope, function () {
                        deferred.resolve(data);
                    });
                },
                error: function (error) {
                    safeApply($rootScope, function () {
                        deferred.reject(error);
                    });
                }
            });

            return deferred.promise;
        };

        return me;

    }]);
