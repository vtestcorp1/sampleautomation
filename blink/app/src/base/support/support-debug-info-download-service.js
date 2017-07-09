/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * A service to facilitate in-production debugging.
 */

'use strict';

blink.app.factory('supportDebugInfoDownloadService', ['$q',
    '$rootScope',
    'alertService',
    'blinkConstants',
    'strings',
    'events',
    'Logger',
    function($q,
         $rootScope,
         alertService,
         blinkConstants,
         strings,
         events,
         Logger) {

        var DEBUG_FILE_TIMESTAMP_FORMAT = 'MM_DD_YYYY_hh_mm_ss';
        var DEBUG_FILE_MIME_TYPE = 'application/json;charset=utf-8';

        var logger = Logger.create('debug-helper-service');
        var debugInfoGatheringInProgress = false;

        function setUpDebugInfoCollectionTriggerHandler(onTriggerCallback) {
            $(document).on(
            'keyup',
            function(event){
                if (!event.ctrlKey || !event.shiftKey) {
                    return;
                }
                if (event.which
                    !== blinkConstants.debugging.DEBUG_INFO_DOWNLOAD_TRIGGER_ALPHA_KEY_CODE) {
                    return;
                }
                onTriggerCallback();
            }
        );
        }

        function onDebugInfoCollectionTriggered() {
            if (!!debugInfoGatheringInProgress) {
                logger.info('debugging info gathering already in progress, trigger ignored');
                return;
            }
            debugInfoGatheringInProgress = true;

            getDebugInfo().then(function(debugInfo){
                showDebugInfoDownloadUI(debugInfo);
            }, function(error){
                logger.error('Error in gathering debug info', error);
            }).finally(function(){
                debugInfoGatheringInProgress = false;
            });
        }

        function getDebugInfo() {
            var debugInfo = CircularJSON.stringify($rootScope);
            return $q.when(debugInfo);
        }

        function getDebugInfoFileName() {
            var currentTime = moment().format(DEBUG_FILE_TIMESTAMP_FORMAT);
            return blinkConstants.debugging.DEBUG_FILE_NAME_PATTERN.assign(currentTime);
        }

        function showDebugInfoDownloadUI(debugInfo) {
            alertService.showAlert({
                message: strings.debugging.messages.DEBUG_INFO_DOWNLOAD_LINK_MESSAGE_PREFIX,
                type: alertService.alertConstants.type.SUCCESS,
                action: {
                    message: strings.debugging.messages.DEBUG_INFO_DOWNLOAD_LINK_MESSAGE_SUFFIX,
                    link: '',
                    handler: function () {
                        var blob = new Blob([debugInfo], {type: DEBUG_FILE_MIME_TYPE});
                        saveAs(blob, getDebugInfoFileName());
                        alertService.hideAlert();
                    }
                }
            });
        }

        function initialize() {
            setUpDebugInfoCollectionTriggerHandler(onDebugInfoCollectionTriggered);
        }

        return {
            initialize: initialize
        };
    }]);
