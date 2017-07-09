/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 */

'use strict';

var path = require('path');
var common = require('../common.js');

var imageView = require('./image-view-po.js');

var locators = {
    FILE_INPUT: by.css('.bk-blob-uploader-file-input')
};

function uploadFile(rootElement, filePath) {
    rootElement.element(locators.FILE_INPUT).sendKeys(filePath);
}

function uploadAndVerifySampleImageFile(rootElement, filePath) {
    uploadFile(rootElement, filePath);
    common.util.expectAndDismissSuccessNotif();
    var imageUrlPromise = imageView.getImageUrl(rootElement);
    common.util.verifyRemoteFileSameAsLocal(imageUrlPromise, filePath);
}


module.exports = {
    locators: locators,
    uploadFile: uploadFile,
    uploadAndVerifySampleImageFile: uploadAndVerifySampleImageFile
};
