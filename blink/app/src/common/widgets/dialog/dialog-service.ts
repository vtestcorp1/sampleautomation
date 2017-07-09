import _ from 'lodash';
import {ngRequire, Provide} from '../../../base/decorators';
import {DialogController} from './dialog';

/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Ashish Shubham (ashish@thoughtspot.com)
 *
 * @fileoverview
 */

let ngDialog = ngRequire('ngDialog');

Provide('dialog')({
    show: show
});

export enum DialogCloseState {
    NONE,
    DISMISS,
    CONFIRM,
    CANCEL
}

export interface DialogConfig {
    isConfirmBtnDisabled?: boolean | {(val: any) : boolean};
    customCssClass?: string;
    onDismiss?: (val:any) => boolean;
    onConfirm?: (val: any) => boolean;
    onCancel?: (val: any) => boolean;
    onOpen?: () => void;
    customData?: any;
    onConfirmAsync?: (value: any) => PromiseLike<undefined>;
    disableCancelBtn?: boolean;
    noClearOnConfirm?: boolean;
    cancelCbOnClose?: boolean;
    cancelBtnLabel?: string;
    doNotCloseOnNavigation?: boolean;
    confirmAsyncBtnLabel?: string;
    confirmBtnLabel?: string;
    customBodyUrl?: string;
    skipConfirmBtn?: boolean;
    title?: string;
    noCancelOnEsc?: boolean;
    message?: string;
    closeState?: DialogCloseState;
}

export interface Dialog {
    id: string;
    close: (value: any) => void;
    closePromise: PromiseLike<any>;
    update: (config: DialogConfig) => void;
}

export function show(config: DialogConfig): Dialog {
    config = config || {};
    config.closeState = DialogCloseState.NONE;

    config.customData = config.customData || {};
    let dlg = ngDialog.open({
        closeByNavigation: !config.doNotCloseOnNavigation,
        className: 'bk-dialog-container',
        appendClassName: config.customCssClass,
        template: 'src/common/widgets/dialog/dialog.html',
        data: config,
        controller: DialogController,
        showClose: false,
        closeByEscape: !config.noCancelOnEsc,
        closeByDocument: true,
        bindToController: true,
        controllerAs: '$ctrl',
        onOpenCallback: config.onOpen,
        preCloseCallback: dismiss.bind(null, config)
    });

    dlg.closePromise.then((data) => {
        if(config.closeState === DialogCloseState.CANCEL
            && _.isFunction(config.onCancel)) {
            config.onCancel(data.customData);
        }
    });

    return {
        ...dlg,
        update: Object.assign.bind(Object, config)
    };
}


function dismiss(config, data) {
    if(config.closeState === DialogCloseState.CONFIRM
        || config.closeState === DialogCloseState.CANCEL) {
        return true;
    }
    // onDismiss callback needs to return true to clear the dialog window.
    let canDismiss = !config.onDismiss || !!config.onDismiss(config.customData || {});
    if(config.cancelCbOnClose) {
        config.closeState = DialogCloseState.CANCEL;
    }
    return canDismiss;
}
