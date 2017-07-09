/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jordie Hannel (jordie@thoughtspot.com)
 *
 * @fileoverview Service to record the user's screen and download resulting video
 */

'use strict';

/* eslint camelcase: 1 */
blink.app.factory('screenRecorderService', ['$http',
    '$q',
    '$timeout',
    '$window',
    'blinkConstants',
    'strings',
    'dialog',
    'loadingIndicator',
    'Logger',
    'navService',
    'sessionService',
    'util',
    function($http,
    $q,
    $timeout,
    $window,
    blinkConstants,
    strings,
    dialog,
    loadingIndicator,
    Logger,
    navService,
    sessionService,
    util) {

        var _logger = Logger.create('screen-recorder-service');

        var _recorder,
            _videoID,
            _videoTitle,
            _chunkIndex,
            _stopDeferred,
            _videoDataPromises,
            MEDIA_SOURCE = 'screen',
            IDEAL_FRAME_RATE = 10,
            NEW_VIDEO_PATH = '/recorder/newVideo',
            GET_VIDEO_PATH = '/recorder/video',
            DELETE_VIDEO_PATH = '/recorder/deletevideo',
            VIDEO_CHUNK_SIZE_MS = 500,
            WEBM_VIDEO_TYPE = 'video/webm',
            MAX_VIDEO_MS = 1000 * 60 * 10;

        function getUniqueID() {
            return new Date().getTime().toString() + sessionService.getUserGuid().toString();
        }

        function resetSelf() {
            _videoID = getUniqueID();
            _videoDataPromises = [];
            _stopDeferred = $q.defer();
            _chunkIndex = 0;
            _recorder = null;
            _videoTitle = null;
        }

        function deleteVideo(videoID) {
            $http.get(DELETE_VIDEO_PATH + '/' + videoID);
        }

        function showDownloadDialog() {
            dialog.show({
                title: strings.screenRecorder.DL_TITLE,
                message: strings.screenRecorder.DL_MESSAGE,
                confirmBtnLabel: strings.screenRecorder.DL_CONFIRM,
                cancelBtnLabel: strings.screenRecorder.DL_CANCEL,
                customData: { videoID: _videoID },
                cancelCbOnClose: true,
                onConfirm: function (customData) {
                    $window.open(GET_VIDEO_PATH+'/' + customData.videoID);
                    return true;
                },
                onCancel: function (customData) {
                    deleteVideo(customData.videoID);
                }
            });
        }

        function showVideoErrorAlertDialog() {
            dialog.show({
                title: strings.screenRecorder.ERROR_TITLE,
                message: strings.screenRecorder.ERROR_MESSAGE,
                confirmBtnLabel: strings.OK,
                skipCancelBtn: true
            });
        }

        function handleVideoDataChunk(e) {
            var videoChunkRequest = {
                method: 'POST',
                url: NEW_VIDEO_PATH,
                headers: {
                    id: _videoID,
                    index: _chunkIndex,
                    done: false,
                    videoname: _videoTitle,
                    'Content-Type': undefined
                },
                data: e.data,
                transformRequest: []
            };

            _videoDataPromises.push($http(videoChunkRequest));

            _chunkIndex++;
        }

        function waitForUploadFinish() {
            var deferred = $q.defer();

        // waiting for last bit of video data to send
            $timeout(function() {

                $q.all(_videoDataPromises)
                .then(deferred.resolve);

            }, 2 * VIDEO_CHUNK_SIZE_MS);

            return deferred.promise;
        }

        function handleVideoStop() {

            loadingIndicator.show({
                showInstantly: true,
                loadingText: strings.screenRecorder.PROCESSING_VIDEO
            });

            var finishVideoRequest = {
                method: 'POST',
                url: NEW_VIDEO_PATH,
                headers: {
                    id: _videoID,
                    index: -1,
                    done: true,
                    videoname: _videoTitle
                }
            };

            waitForUploadFinish()
            .then(
            function() {
                $http(finishVideoRequest).then(
                    function() {
                        // Uploaded.
                        _stopDeferred.resolve();

                        showDownloadDialog();
                    },
                    function(err) {
                        _stopDeferred.reject();

                        showVideoErrorAlertDialog();
                    }
                ).finally(function() {
                    loadingIndicator.hide();
                    resetSelf();
                });
            }
        );
        }

    /**
     * Starts recording the user's window, streams the data to server in 500ms chunks
     * and prompts user for download when ready
     */
        function recordStream(mediastream) {
            _recorder = new $window.MediaRecorder(mediastream);

            _recorder.ondataavailable = handleVideoDataChunk;

            _recorder.onstop = handleVideoStop;

            _recorder.onerror = function(e) {
                _logger.log("A recording error has occurred:", e.message);
                resetSelf();
                showVideoErrorAlertDialog();
            };

            _recorder.start(VIDEO_CHUNK_SIZE_MS);
        }

        function canGetUserMedia() {
            if (angular.isDefined(navigator)
            && angular.isDefined(navigator.mediaDevices)
            && angular.isDefined(navigator.mediaDevices.getUserMedia)) {
                return true;
            }

            return false;
        }

        function canRecord() {
            return !_recorder
            && sessionService.hasAdminPrivileges()
            && util.isFirefox()
            && navService.isHttps();
        }

        function startRecording(videoTitle) {
            if (!canRecord()) {
                return $q.reject();
            }

            resetSelf();

            _videoTitle = videoTitle || strings.screenRecorder.DEFAULT_VIDEO_NAME;

            var deferred = $q.defer();

            var videoParams = {
                video: {
                    mozMediaSource: MEDIA_SOURCE,
                    mediaSource: MEDIA_SOURCE,
                    width: $window.width,
                    height: $window.height,
                    frameRate: { ideal: IDEAL_FRAME_RATE }
                }
            };

            var streamReady = function(mediastream) {
                recordStream(mediastream);

                _logger.log('recording started');

                deferred.resolve();
            };

            var streamFail = function(err) {
                _logger.error('Error starting video stream:', err);

                dialog.show({
                    title: strings.screenRecorder.CANNOT_RECORD_TITLE,
                    message: strings.screenRecorder.CANNOT_RECORD_MESSAGE.assign(navService.getHost()),
                    skipCancelBtn: true,
                    confirmBtnLabel: strings.DONE,
                    customData: {
                        deferred: deferred
                    },
                    onConfirm: function(customData) {
                        customData.deferred.reject();
                        return true;
                    }
                });
            };

        // Start video capture
            navigator.mediaDevices.getUserMedia(videoParams)
            .then(streamReady)
            .catch(streamFail);

            return deferred.promise;
        }

        function stopRecording() {
            if (!_recorder) {
                return $q.reject();
            }

            _recorder.stop();
        }

        window.onbeforeunload = function (e) {
            if (!_recorder) {
                return;
            }

            _recorder.stop();
            deleteVideo(_videoID);
        };

        return {
        // Functions
            canRecord: canRecord,
            startRecording: startRecording,
            stopRecording: stopRecording
        };

    }]);
