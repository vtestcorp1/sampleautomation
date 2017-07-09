/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provide utilities shared across all documents.
 */

import _ from 'lodash';
import {ngRequire, Provide} from '../../base/decorators';
import {strings} from '../../base/strings';
import * as dialog from '../../common/widgets/dialog/dialog-service';

let jsonConstants = ngRequire('jsonConstants');

Provide('documentUtil')({
    getDocumentIdFromJson,
    getUnsavedDocumentAlertConfig
});

export function getDocumentIdFromJson(json: any) {
    return _.get(json, [jsonConstants.HEADER_KEY, jsonConstants.ID_KEY]);
}

export function showDialogToSaveDocumentBeforeShare(
    documentModel: any,
    documentType: string,
    onConfirm: (any) => boolean
) {
    dialog.show({
        title: strings.NAME_BEFORE_SHARING_DIALOG_TITLE.assign(documentType),
        customBodyUrl: 'src/common/widgets/dialogs/templates/simple-save-dialog.html',
        cancelBtnLabel: strings.CANCEL,
        confirmBtnLabel: strings.SAVE,
        onConfirm: onConfirm,
        customData: {
            documentName: documentModel.getName()
        }
    });
}

export function showMakeACopyDialog(
    documentModel: any,
    onConfirm: (any) => boolean
) {
    let title = strings.MAKE_A_COPY;
    let questionHeader = strings.COPY_OF.assign(documentModel.getName());
    let questionDescription = documentModel.getDescription();

    dialog.show({
        title: title,
        customBodyUrl: 'src/common/widgets/dialogs/templates/save-dialog.html',
        cancelBtnLabel: strings.CANCEL,
        confirmBtnLabel: strings.SAVE,
        customData: {
            questionHeader: questionHeader,
            questionDescription: questionDescription
        },
        onConfirm: onConfirm
    });
}

export function getShareDialogConfig(documentModel: any) {
    let shareDialogConfig = {
        objects: [{
            id: documentModel.getId(),
            name: documentModel.getName(),
            authorId: documentModel.getAuthorId()
        }],
        type: documentModel.getMetadataType(),
        subtype: documentModel.getMetadataSubType()
    };
    return shareDialogConfig;
}

export function getUnsavedDocumentAlertConfig(
    currentDocType: string,
    disableSave: boolean,
    onConfirmAsync: Function
) {
    let message = strings.documentUnsavedChangesAlert.MESSAGE.assign(currentDocType);

    let config: any = {
        title: strings.documentUnsavedChangesAlert.UNSAVED_CHANGES,
        message: message,
        cancelBtnLabel: strings.documentUnsavedChangesAlert.STAY_HERE,
        confirmBtnLabel: strings.documentUnsavedChangesAlert.DISCARD
    };

    if (!disableSave) {
        config.confirmAsyncBtnLabel = strings.documentUnsavedChangesAlert.SAVE;
        config.onConfirmAsync = onConfirmAsync;
    }

    return config;
}
