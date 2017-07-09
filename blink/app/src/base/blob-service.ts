/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A service to allow uploading blobs of data in backend persistent storage.
*/

import {ngRequire} from './decorators';
import IPromise = angular.IPromise;
import {blinkConstants} from './blink-constants';

let Command = ngRequire('Command');

export enum BlobType {
    FONT_WOFF,
    IMAGE_JPEG,
    IMAGE_PNG,
    IMAGE,
    CSV
}

export class BlobService {
    private static API_END_POINT: string = '/file/savefile';
    private static BLOB_URL_PATTERN: string = '/callosum/v1/file/getfile/{blobGuid}';
    private static DEFAULT_BLOB_CATEGORY = 'FILE';

    public static getBlobUrl(blobGuid: string): string {
        return BlobService.BLOB_URL_PATTERN.assign({
            blobGuid: blobGuid
        });
    }

    public static upload(blobGuid: string,
                         file: File,
                         blobType: BlobType,
                         blobCategory: string = BlobService.DEFAULT_BLOB_CATEGORY): IPromise<void> {


        var mimeType: string = file.type || BlobService.getMimeTypeForBlobType(blobType);

        var command = new Command()
            .setPath(BlobService.API_END_POINT)
            .setIgnorable(false)
            .setPostMethod()
            .setIsMultipart(true)
            .setPostParams({
                id: blobGuid,
                content: file,
                category: blobCategory,
                'mime-type': mimeType
            });

        return command.execute();
    }

    public static getFileHeadersForCategory(category: string) {
        var command = new Command()
            .setPath('/file/getheaders/' + category)
            .setIgnorable(false);
        return command.execute();
    }

    public static validateFileForBlobType(file: File,
                                          blobType: BlobType): string {
        var isValid: boolean =
            BlobService.isValidFileForBlobType(file, blobType);

        if (isValid) {
            return null;
        }
        return BlobService.getInvalidFileTypeMessage(blobType);
    }

    private static isValidFileForBlobType(file: File, blobType: BlobType): boolean {
        if (file.type) {
            var expectedMimeType: string
                = BlobService.getMimeTypeForBlobType(blobType);
            // mime-type not matching does not imply bad file type
            // e.g. for BlobType.IMAGE mimeType = image/* which would not
            // match image/png or image/jpeg.
            if (file.type.toLowerCase() === expectedMimeType.toLowerCase()) {
                return true;
            }
        }

        // mime-type is not always determined by the browser
        var fileName: string = file.name;
        var fileNameParts: string[] = fileName.split('.');
        if (fileNameParts.length <= 1) {
            return false;
        }
        var extension: string = fileNameParts.last().toUpperCase();

        switch (blobType) {
            case BlobType.FONT_WOFF:
                return extension === 'WOFF';
            case BlobType.IMAGE_JPEG:
                return ['JPEG', 'JPG'].any(extension);
            case BlobType.IMAGE_PNG:
                return extension === 'PNG';
            case BlobType.IMAGE:
                return ['JPEG', 'JPG', 'PNG'].any(extension);
            case BlobType.CSV:
                return extension === 'csv';
            default:
                return true;
        }
    }

    private static getMimeTypeForBlobType(blobType: BlobType): string {
        switch (blobType) {
            case BlobType.FONT_WOFF:
                return 'application/font-woff';
            case BlobType.IMAGE_JPEG:
                return 'image/jpeg';
            case BlobType.IMAGE_PNG:
                return 'image/png';
            case BlobType.IMAGE:
                return 'image/*';
            case BlobType.CSV:
                return 'text/csv';
            default:
                return 'application/octet-stream';
        }
    }

    private static getBlobTypeName(blobType: BlobType): string {
        switch (blobType) {
            case BlobType.FONT_WOFF:
                return blinkConstants
                    .blobUploadService
                    .blobTypeNames
                    .FONT;
            case BlobType.IMAGE_JPEG:
            case BlobType.IMAGE_PNG:
            case BlobType.IMAGE:
                return blinkConstants
                    .blobUploadService
                    .blobTypeNames
                    .IMAGE;
            case BlobType.CSV:
                return 'CSV';
            default:
                return blinkConstants
                    .blobUploadService
                    .blobTypeNames
                    .GENERIC;
        }
    }

    private static getInvalidFileTypeMessage(blobType: BlobType): string {
        var template: string = blinkConstants
            .blobUploadService
            .invalidFileMessages.INVALID_TYPE;

        var fileType: string = BlobService.getBlobTypeName(blobType);
        return template.assign({
            fileType: fileType
        });
    }
}
