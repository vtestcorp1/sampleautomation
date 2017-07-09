/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview
 */
import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {ngRequire} from '../../../base/decorators';
import {DialogCloseState, DialogConfig} from './dialog-service';

let $q = ngRequire('$q');

export class DialogController extends BaseComponent {
    private data;
    private processingAsyncConfirm = false;
    private asyncConfirmError = null;
    private ngDialogData: DialogConfig;
    private closeThisDialog: Function;

    constructor() {
        super();
        this.data = this.ngDialogData;
    }

    closeDialog (noCancelCallback) {
        if(!noCancelCallback) {
            this.data.closeState = DialogCloseState.CANCEL;
        } else {
            this.data.closeState = DialogCloseState.CONFIRM;
        }
        this.closeThisDialog(this.data);
    }

    dismiss() {
        this.data.closeState = DialogCloseState.DISMISS;
        this.closeThisDialog(this.data);
    }

    cancelBtnClick () {
        if (!this.data.disableCancelBtn) {
            this.closeDialog(false);
        }
    }

    confirmSync () {
        if (this.processingAsyncConfirm) {
            return;
        }
        var isConfirmed = confirm(this.data);
        if(isConfirmed) {
            this.closeDialog(true);
        }
    }

    isConfirmDisabled() {
        return confirmDisabled(this.data);
    }

    confirmAsync () {
        if (this.processingAsyncConfirm) {
            return;
        }
        this.processingAsyncConfirm = true;
        this.asyncConfirmError = null;
        return this.data.onConfirmAsync(this.data.customData)
            .then(() => {
                this.processingAsyncConfirm = false;
                if (!this.data.noClearOnConfirm) {
                    this.closeDialog(true);
                }
            }, (errorResponse) => {
                this.processingAsyncConfirm = false;
                this.asyncConfirmError = errorResponse;
                return $q.reject(errorResponse);
            });
    }
}

function confirm(data) {
    // onConfirm callback needs to return true to clear the dialog window.
    return !data.onConfirm || !!data.onConfirm(data.customData || {});
}

function confirmDisabled(data) {
    if (_.isFunction(data.isConfirmBtnDisabled)) {
        return data.isConfirmBtnDisabled(data.customData || {});
    }
    return !!data.isConfirmBtnDisabled;
}
