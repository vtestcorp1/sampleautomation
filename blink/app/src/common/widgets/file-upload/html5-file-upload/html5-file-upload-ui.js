/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Joy Dutta (joy@thoughtspot.com)
 *
 * @fileoverview View for File Upload widget
 */

'use strict';

blink.app.directive('blinkHtml5FileUpload', ['$timeout',
    'blinkConstants',
    'strings',
    'Logger',
    'util',
    'safeApply',
    function ($timeout,
              blinkConstants,
              strings,
              Logger,
              util,
              safeApply) {

        var logger = Logger.create('html5-file-upload-ui'),
            dragOverTimer = null;

        function handleFileSelect(scope, $fileInput, evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var file = null;
            if (!evt.target.files) {
                file = {
                    name: $fileInput.val().replace(/C:\\fakepath\\/i, '')
                };
            } else {
                file = evt.target.files.item(0);
                if (!file) {
                    return;
                }
            }

            if (file.name === null || file.name === '') {
                logger.error('Invalid file name', file);
                return;
            }

        // using the $apply() function because this is a non-angular workflow. if there are errors during the
        // upload operation, an event is fired to show the error in the alert box.
            safeApply(scope, function () {
            // files is a FileList of File objects. Currently we allow at most one file upload
                scope.uploadFile(file);
            });
        }

        function handleDragOver($dropZoneEl, evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy
            if (dragOverTimer) {
                $timeout.cancel(dragOverTimer);
            }
            dragOverTimer = $timeout(function () {
                $dropZoneEl.removeClass('bk-drag-hover');
            }, 100, false);
            $dropZoneEl.addClass('bk-drag-hover');
        }

        function handleDrop(scope, evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (!evt.dataTransfer.files.length) { return; }

        // see comment for the reason to use $apply() in the handleFileSelect() function.
            safeApply(scope, function () {
                scope.uploadFile(evt.dataTransfer.files.item(0));
            });
        }

        function linker(scope, $el, attr) {
            var $inputEl = $el.find('#bk-file-input'),
                $dropZoneEl = $el.find('.bk-drop-zone'),
                uploadConfig = scope.getUploadConfig();

            scope.browseYourFiles = strings.BROWSE_YOUR_FILES;

            scope.indicateFileRead = angular.isDefined(attr.indicateFileRead);
            if (uploadConfig && uploadConfig.getExistingFileName && uploadConfig.getExistingFileName()) {
                scope.diskFileName = uploadConfig.getExistingFileName();
                scope.showFileReadCompletionUI = true;
            }
            $inputEl.change(angular.bind(null, handleFileSelect, scope, $inputEl));

            if (scope.isFileApiSupported) {
            // From: http://www.html5rocks.com/en/tutorials/file/dndfiles/
            // could not yet make it work using jQuery dragdrop
                var dropZoneEl = $dropZoneEl[0];
                dropZoneEl.addEventListener('dragover', angular.bind(null, handleDragOver, $dropZoneEl), false); // this is needed
                dropZoneEl.addEventListener('drop', angular.bind(null, handleDrop, scope), false);
            }

        //webkit fails to repaint a dom node on innerText/innerHTML change under certain circumstances (SCAL-3925)
        //we force repaint
            scope.$watch('diskFileName', function(newValue, oldValue){
                if (newValue !== oldValue) {
                    var fileNameLabel = $el.find('.bk-file-name-label')[0];
                    util.webkitForceRepaintNode(fileNameLabel);
                }
            });
        }

        return {
            restrict: 'A',
            replace: true,
            scope: {
                getUploadConfig: '&uploadConfig'
            },
            link: linker,
            templateUrl: 'src/common/widgets/file-upload/html5-file-upload/html5-file-upload.html',
            controller: 'Html5FileUploadController'
        };
    }]);
