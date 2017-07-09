/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Image processing utils
 */

'use strict';

/* eslint no-bitwise: 1 */
/* global moment */

blink.app.factory('imageUtil', ['$q',
    'blinkConstants',
    'Logger',
    function ($q,
          blinkConstants,
          Logger) {

        var logger = Logger.create('image-util');
        var me = {};

    /**
     * Shrinks (reduces size and dimension) of an image file uploaded by the user.
     * @param {File} file The input file object chosen by the user for uploading.
     * @param {Number} width Desired width of the image.
     * @param {Number} height Desired height of the image.
     */
        me.shrinkImage = function (file, maxWidth, maxHeight) {
            var deferred = $q.defer();
            if (file.size > blinkConstants.MAX_PICTURE_SIZE_PRE_SCALE) {
                return $q.reject();
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = document.createElement('img');
                img.src = e.target.result;
                if (img.width <= maxWidth && img.height <= maxHeight) {
                // Image is already smaller than the required dimension
                // No need for scaling. Since File extends Blob, we can just
                // do callback on file.
                    logger.info('Image is already small, no scaling is required');
                    deferred.resolve(file);
                    return;
                }

                var scaleRatio = Math.min(maxWidth / img.width, maxHeight / img.height);
                var finalWidth = img.width * scaleRatio;
                var finalHeight = img.height * scaleRatio;
                var width = img.width, height = img.height;
                var canvas, ctx;
                while (width / 2 > finalWidth) {
                    width /= 2;
                    height /= 2;
                    canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    img.src = canvas.toDataURL("image/jpeg");
                }

                canvas = document.createElement('canvas');
                canvas.width = finalWidth;
                canvas.height = finalHeight;
                ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
            // not all browsers support toBlob
                if (typeof canvas.toBlob === 'function') {
                    canvas.toBlob(onBlobReceived);
                } else {
                    var dataUrl = canvas.toDataURL("image/jpeg");
                    var blobBin = atob(dataUrl.split(',')[1]);
                    var array = [];
                    for (var i = 0; i < blobBin.length; i++) {
                        array.push(blobBin.charCodeAt(i));
                    }
                    var blob = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
                    onBlobReceived(blob);
                }
            };
            reader.onerror = function (e) {
                deferred.reject();
            };
            reader.readAsDataURL(file);

            function onBlobReceived(blob) {
                if (blob.size >= blinkConstants.MAX_PICTURE_SIZE_POST_SCALE) {
                    deferred.reject(blob);
                }
                logger.info('Successfully scaled the image, new size = %d bytes', blob.size);
                deferred.resolve(blob);
            }

            return deferred.promise;
        };

        return me;
    }]);
