/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A component to render a list of components organized
* as named sections.
*/


import {blinkConstants} from 'src/base/blink-constants';
import {BaseComponent} from '../../../../base/base-types/base-component';
import {BlobService, BlobType} from '../../../../base/blob-service';
import {Component, ngRequire} from '../../../../base/decorators';
import {AutoHideComponent} from '../../auto-hide/auto-hide-component';
import IPromise = angular.IPromise;

let alertService: any = ngRequire('alertService');
let Logger: any = ngRequire('Logger');
let UserAction: any = ngRequire('UserAction');
let jsUtil: any = ngRequire('jsUtil');


type SuccessHandler = (guid: string) => void;
type FileValidator = (file: File, blobType: BlobType) => string;

@Component({
    name: 'bkBlobUploader',
    templateUrl: 'src/common/widgets/blob/blob-uploader/blob-uploader.html',
    transclude: true
})
export class BlobUploaderComponent extends BaseComponent {
    private static ERROR_MESSAGE_AUTO_HIDE_INTERVAL: number = 10000;

    private logger: any = Logger.create(
        'blob-uploader-component'
    );
    private lastError: string = null;
    private uploading: boolean = false;

    private autoHidingErrorComponent: AutoHideComponent;

    constructor(private blobGuid: string,
                private blobType: BlobType,
                private successfulUploadHandler: SuccessHandler,
                private fileValidator: FileValidator = null) {
        super();

        if (!this.fileValidator) {
            this.fileValidator = function () {
                return null;
            };
        }

        this.autoHidingErrorComponent = new AutoHideComponent(
            BlobUploaderComponent.ERROR_MESSAGE_AUTO_HIDE_INTERVAL
        );
    }

    public getBlobType(): BlobType {
        return this.blobType;
    }

    public setBlobGuid(blobGuid: string): void {
        this.blobGuid = blobGuid;
        this.autoHidingErrorComponent.hide();
    }

    public isUploading(): boolean {
        return this.uploading;
    }

    public getError(): string {
        return this.lastError;
    }

    public hasError(): boolean {
        return !!this.lastError;
    }

    public getUploadFileActionText(): string {
        return blinkConstants
            .blobUploader
            .UPLOAD_NEW_FILE_BUTTON_LABEL;
    }

    public getAutoHideErrorMessageComponent(): AutoHideComponent {
        return this.autoHidingErrorComponent;
    }

    public updateFile(file: File): void {
        if (!file) {
            return;
        }

        if (!this.blobGuid) {
            this.blobGuid = jsUtil.generateUUID();
        }
        this.lastError = this.validateFile(file);
        if (!!this.lastError) {
            this.autoHidingErrorComponent.show();
            return;
        }
        this.autoHidingErrorComponent.hide();

        var uploadPromise: IPromise<void> = BlobService.upload(
            this.blobGuid,
            file,
            this.blobType
        );


        var userAction = new UserAction(
            UserAction.UPLOAD_FILE
        );

        this.uploading = true;

        uploadPromise.then(
            () => this.successfulUploadHandler(this.blobGuid),
            (response: any) => {
                this.logger.error('Error in uploading file', response);
                alertService.showUserActionFailureAlert(userAction, response);
            }
        ).finally(
            () => this.uploading = false
        );
    }

    private validateFile(file: File): string {
        var basicValidationError: string = BlobService.validateFileForBlobType(
            file,
            this.blobType
        );
        if (!!basicValidationError) {
            return basicValidationError;
        }
        return this.fileValidator(file, this.blobType);
    }
}
