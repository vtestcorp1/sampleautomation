
/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A component that composes a blob uploader and an image view
* to provide the ability to show an updatable image which is backed
* by the persistent file api.
*/
import _ from 'lodash';
import {BaseComponent} from '../../../../base/base-types/base-component';
import {BlobService, BlobType} from '../../../../base/blob-service';
import {Component} from '../../../../base/decorators';
import {ImageViewComponent} from '../../image-view/image-view-component';
import {BlobUploaderComponent} from '../blob-uploader/blob-uploader-component';

@Component({
    name: 'bkImageBlobEditor',
    templateUrl: 'src/common/widgets/blob/image-blob-editor/image-blob-editor.html'
})
export class ImageBlobEditorComponent extends BaseComponent {
    private blobUploaderComponent: BlobUploaderComponent;
    private imageViewComponent: ImageViewComponent;

    constructor(private blobGuid: string,
                private blobType: BlobType,
                private defaultImageUrl: string,
                private blobUploadHandler: (blobUrl: string) => void) {
        super();

        this.blobUploadHandler = this.blobUploadHandler || _.noop;

        this.blobUploaderComponent = new BlobUploaderComponent(
            blobGuid,
            blobType,
            (blobGuid: string) => this.handleBlobUpdate(blobGuid),
            (file: File, blobType: BlobType) => {
                return this.validateNewBlobFile(file, blobType);
            }
        );

        this.imageViewComponent = new ImageViewComponent(
            this.getBlobUrl()
        );
    }

    public setBlobGuid(blobGuid: string): void {
        this.blobGuid = blobGuid;
        this.blobUploaderComponent.setBlobGuid(blobGuid);
        this.imageViewComponent.setImageUrl(this.getBlobUrl());
    }

    public setDefaultImageUrl(defaultImageUrl: string): void {
        this.defaultImageUrl = defaultImageUrl;
        this.imageViewComponent.setImageUrl(this.getBlobUrl());
    }

    public getBlobUploaderComponent(): BlobUploaderComponent {
        return this.blobUploaderComponent;
    }

    public getImageViewComponent(): ImageViewComponent {
        return this.imageViewComponent;
    }

    public getBlobUrl(): string {
        if (!this.blobGuid) {
            return this.defaultImageUrl;
        }
        return BlobService.getBlobUrl(this.blobGuid);
    }

    public hasBlobUrl(): boolean {
        return !!this.getBlobUrl();
    }

    private handleBlobUpdate(blobGuid: string): void {
        this.blobGuid = blobGuid;

        // add/update a cache busting parameter to the url
        // so that the user sees the updated preview when
        // uploading a new image.
        var url: string = this.getBlobUrl();
        var uri: any = new (<any>window).URI(url);
        url = uri.setSearch('r', Date.now()).toString();

        this.imageViewComponent.setImageUrl(url);
        this.blobUploadHandler(blobGuid);
    }

    private validateNewBlobFile(file: File, blobType: BlobType): string {
        return null;
    }
}
