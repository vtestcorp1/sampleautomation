/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Utility to download content using Form Submissions, this has an
 * advantage that the downloaded requests are handled by browser instead of javascript
 * which fetches file data into memory and then downloads it and since certain cases
 * file size might be too large to bring it into memory, delegating this to browser is efficient.
 */

'use strict';

blink.app.factory('FormDownloader', ['util', 'navAlertService', function(util, navAlertService) {
    var FormDownloader = function() {
        /**
         * A utility to download content by a post request at the given path using key value pair as form parameters.
         * Smaller post parameter values are to be passed in inputKeyValueMap while larger are to be part of
         * textAreaKeyValueMap.
         * @param path
         * @param inputKeyValueMap
         * @param textAreaKeyValueMap
         * @param sendAsMultiPart
         * @constructor
         */
        this.downloadForm = function(path, inputKeyValueMap, textAreaKeyValueMap, sendAsMultiPart) {
            var textAreas = [];

            if (!inputKeyValueMap) {
                inputKeyValueMap = {};
            }

            if (!textAreaKeyValueMap) {
                textAreaKeyValueMap = {};
            }

            var $form = $('<form action="{1}" method="POST" id="downloader">'.assign(path));
            if (sendAsMultiPart) {
                $form.attr('enctype', 'multipart/form-data');
            }
            util.iterateObject(inputKeyValueMap, function(key, value) {
                $form.append('<input name="{1}" value=\'{2}\' />'.assign(key, value.escapeHTML()));
            });

            util.iterateObject(textAreaKeyValueMap, function(key, value) {
                var $textArea = $('<textarea name="{1}" form="downloader"></textarea>'.assign(key));
                $textArea.val(value);
                // We need to make it hidden because otherwise textarea with large text will trigger
                // some unnecessary validation and will significantly slow down the form submission.
                // Apparently this was an issue in chrome only.
                $textArea.css('display', 'none');
                textAreas.add($textArea);
            });

            //(Note: Rahul) In certain cases, the Form submit causes a onWindowUpload event which
            //was listened by nav-alert-service to trigger Confirmation Alert. For
            //that reason we are derergistering these listeners for the form submission
            // and then re-adding these
            navAlertService.deRegisterWindowUnloadAndRouteChangeListeners();
            $form.append(textAreas);
            $form.appendTo('body');
            $form.submit();
            $form.remove();

            // Waiting for the next event loop to re-register the listeners as the window unload event is
            // called async by the form submit and it will be called after our reregister if we call sync.
            util.executeInNextEventLoop(function() {
                navAlertService.registerWindowUnloadAndRouteChangeListeners();
            });
        };
    };

    return FormDownloader;
}]);
