/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview A file input that renders as link and exposes a callback on upload success.
 */

import {UIComponent} from '../../../base/base-types/ui-component';
import {BlobService, BlobType} from '../../../base/blob-service';
import {Component, ngRequire} from '../../../base/decorators';
import {CUSTOM_REGION_FILE_CATEGORY} from '../../viz-layout/viz/chart/geomap/base/geo-constants';

let Logger = ngRequire('Logger');
let jsUtil = ngRequire('jsUtil');

@Component({
    name: 'bkCustomRegionUploader',
    templateUrl: 'src/modules/data-explorer/custom-region-uploader/custom-region-uploader.html'
})
export default class CustomRegionUploaderComponent extends UIComponent {

    private logger = Logger.create('custom-region-uploader');

    constructor(
        private label: string,
        private preUploadCallback: (file: File) => void,
        private successCallback: (fileGuid: string, fileName: string) => void
    ) {
        super();
    }

    public postLink(el: JQuery) {
        el.find('.bk-upload-link').on('click', (e) => {
            e.preventDefault();
            $('#bk-file-input:hidden').trigger('click');
        });
        let self = this;
        el.find('#bk-file-input:hidden').on('change', function () {
            let file = this.files[0];
            if (!file) {
                return;
            }
            self.preUploadCallback(file);
            let fileGuid = jsUtil.generateUUID();
            BlobService.upload(
                fileGuid,
                file,
                BlobType.CSV,
                CUSTOM_REGION_FILE_CATEGORY
            ).then(() => {
                    self.successCallback(fileGuid, file.name);
                },
                (response: any) => {
                    self.logger.error('error uploading custom region definition file', response);
                }
            );
        });
    }

    public onDestroy(el: JQuery) {
        el.find('.bk-upload-link').off('click');
        el.find('#bk-file-input:hidden').off('change');
    }

    public setLabel(label: string) {
        this.label = label;
    }
}
