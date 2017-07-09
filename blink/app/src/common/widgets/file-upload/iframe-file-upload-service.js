/**
 * Copyright: ThoughtSpot Inc. 2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Service that uploads a file through a hidden iframe
 */

'use strict';

blink.app.factory('iframeFileUploadService', ['Logger', function (Logger) {

    var me = {},
        logger = Logger.create('iframe-file-upload-service');

    /**
     * Prcess server response and clean up
     * @param {Object} $iframe         A jquery reference to the iframe
     * @param {Object} successCallback A success callback function
     * @param {Object} errorCallback   An error callback function
     */
    function onFrameLoad($iframe, successCallback, errorCallback, responseProcessor) {
        // Unbind the load event
        $iframe.off('load');

        // Capture the server's response
        var response = $iframe.contents().find('body').text();

        responseProcessor = responseProcessor || function (res) {
            return {
                status: res === '',
                response: res
            };
        };

        var processedResponse = responseProcessor(response);

        if (processedResponse.status) {
            // Server has responded with an empty response, success
            successCallback(processedResponse.response);
        } else {
            // Server has responded with a non-empty response, error
            if (errorCallback) {
                errorCallback(processedResponse.response);
            }
        }

        // Delete the iframe
        setTimeout(function () {
            $iframe.remove();
        }, 250);
    }

    /**
     * Upload a file
     * @param {Object} params    An object with the following properties:
     *
     * @param {Object.<$form>}   A jquery reference to the HTML form
     * @param {string.<path>}    The path to upload to
     * @param {Object.<success>} A success callback function
     * @param {Object.<error>}   An error callback function
     */
    me.upload = function (params) {
        // Create the iframe
        var $form = params.$form,
            $iframe = $('<iframe />');
        $iframe.attr('id', 'upload-iframe');
        $iframe.attr('name', 'upload-iframe');
        $iframe.attr('width', '0');
        $iframe.attr('height', '0');
        $iframe.attr('border', '0');
        $iframe.attr('style', 'width: 0; height: 0; border: none;');

        // Add to document
        params.$form.parent().append($iframe);
        window.frames['upload-iframe'].name = 'upload-iframe';

        // Listen to iframe load event
        $iframe.on('load', function () {
            onFrameLoad($iframe, params.success, params.error, params.responseProcessor);
        });

        // Set properties of form
        $form.attr('target', 'upload-iframe');
        $form.attr('action', params.path);
        $form.attr('method', 'post');
        $form.attr('enctype', 'multipart/form-data');
        $form.attr('encoding', 'multipart/form-data');

        var $hiddenInputs = [];
        if (params.postParams) {
            angular.forEach(params.postParams, function (parameterValue, parameter) {
                var $newHiddenInput = $('<input type="hidden" name="' + parameter + '" value="' + parameterValue + '" />');
                $form.append($newHiddenInput);
                $hiddenInputs.push($newHiddenInput);
            });
        }

        // Submit the form
        $form.submit();

        angular.forEach($hiddenInputs, function ($el) {
            $el.remove();
        });
    };

    return me;

}]);
