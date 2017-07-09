/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview Controller for File uploading
 */

'use strict';

blink.app.controller('Html5FileUploadController', ['$rootScope',
    '$q',
    '$scope',
    'blinkConstants',
    'strings',
    'Logger',
    'env',
    'util',
    'events',
    'alertConstants',
    'alertService',
    'fileUploadService',
    'iframeFileUploadService',
    'loadingIndicator',
    'safeApply',
    'UserAction',
    function ($rootScope,
          $q,
          $scope,
          blinkConstants,
          strings,
          Logger,
          env,
          util,
          events,
          alertConstants,
          alertService,
          fileUploadService,
          iframeFileUploadService,
          loadingIndicator,
          safeApply,
          UserAction) {

        var logger = Logger.create('html5-file-upload-controller');

    // Check for the various File API support.
        $scope.isFileApiSupported = !!(window.File && window.FileReader && window.FileList && window.Blob);
    // If true, the widget will show the file name that was read.
        $scope.showFileReadCompletionUI = false;

        $scope.fileSizeInfo = strings.MAX_FILE_SIZE_MESSAGE.assign({size: "50MB"});

    /**
     * Does client side validation of file.
     * As of now check extension, but in future we can put size checking, etc
     * @param file
     */
        function validateFile(file) {
            var uploadConfig = $scope.getUploadConfig();

        // Check for the valid file extensions
            var lastIndexOfDot = file.name.lastIndexOf('.');
            if (lastIndexOfDot > -1) {
                var extension = file.name.substr(lastIndexOfDot + 1) || '';
                if (!!uploadConfig.validFileExtensions && !uploadConfig.validFileExtensions.some(extension.toLowerCase())) {
                    logger.error('Invalid file extension');
                    var extensionString = uploadConfig.validFileExtensions.map(function (exten) {
                        return exten;
                    }).join(', ');
                    var errorMsg = 'Invalid file type. We only support the following types: ' + extensionString;
                    if (uploadConfig.onFileUploadClientValidation) {
                        uploadConfig.onFileUploadClientValidation(false, {message: errorMsg});
                    }
                    return false;
                }
            }

            if (uploadConfig.onFileUploadClientValidation) {
                uploadConfig.onFileUploadClientValidation(true);
            }

            return true;
        }

    /**
     * @param {File} file
     */
        function uploadFile(file) {
            var uploadConfig = $scope.getUploadConfig();

            if (!uploadConfig) {
                logger.error('No upload configuration specified. Can not continue');
                return;
            }

            if (!uploadConfig.onFileLoad && !uploadConfig.onFileLoadLegacy &&
            (!uploadConfig.targetPath || !uploadConfig.fileName)) {
                logger.error('Need either a user specified file load handler or upload parameters like targetPath and target name');
                return;
            }

        // Does client side validation
            if (!validateFile(file)) {
                return;
            }

            logger.log('File to upload:', file);

            $scope.showFileReadCompletionUI = $scope.indicateFileRead;
            $scope.diskFileName = file.name;

            if (!$scope.isFileApiSupported) {
                if (uploadConfig.onFileLoadLegacy) {
                    uploadConfig.onFileLoadLegacy(file.name);
                } else {
                    var userAction = new UserAction(UserAction.UPLOAD_FILE);
                    fileUploadService.uploadFileMultiPart(uploadConfig.multiPartFormPath)
                    .then(function(response) {
                        alertService.showUserActionSuccessAlert(userAction, response);
                    }, function(response) {
                        alertService.showUserActionFailureAlert(userAction, response);
                        return $q.reject(response.data);
                    })
                    .finally(loadingIndicator.hide);
                }
                return;
            }

            var reader = new FileReader();

        // Closure to capture the file information.
            reader.onload = function(e) {
                safeApply($scope, function () {
                // If a parent scope wish to use this component for all the file upload functionality except for what happens
                // after the file is read into the client, then they need to supply an onFileLoad handler.
                    if (!!uploadConfig.onFileLoad) {
                        loadingIndicator.hide();
                        uploadConfig.onFileLoad(e, file);
                    } else {
                        logger.log('result after reading file, to be sent to callosum (first few chars):', util.truncate(e.target.result, 200));
                        var userAction = new UserAction(UserAction.UPLOAD_FILE);
                        fileUploadService.uploadFileContent(uploadConfig.targetPath, {
                            name: uploadConfig.fileName,
                            content: e.target.result
                        }).then(function(response) {
                            alertService.showUserActionSuccessAlert(userAction, response);
                        }, function(response) {
                            alertService.showUserActionFailureAlert(userAction, response);
                            return $q.reject(response.data);
                        }).finally(loadingIndicator.hide);
                    }
                });
            };

        // show loading spinner
            loadingIndicator.show();
        // Read in the image file as a data URL
            reader.readAsText(file);
        }

        $scope.uploadFile = uploadFile;

    }]);
