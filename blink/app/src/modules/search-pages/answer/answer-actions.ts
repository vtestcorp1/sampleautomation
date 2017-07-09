/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This provides the ad-hoc answer actions.
 */

import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {AnswerPageActionsConfig} from '../../answer-panel/answer-page/answer-page-actions-util';
import {
    getDocumentIdFromJson,
    showDialogToSaveDocumentBeforeShare
} from '../../document-model/document-util';
import {AnswerComponent} from './answer';
import IQService = angular.IQService;
import _ from 'lodash';
import * as dialog from '../../../common/widgets/dialog/dialog-service';
import {saveAnswer} from '../search-pages-utils';


let $q : IQService = ngRequire('$q');
let navService = ngRequire('navService');

export function getAdhocAnswerPageActionsConfig(answer: AnswerComponent) : AnswerPageActionsConfig {
    let adhocAnswerActions = getAdhocAnswerActions(answer);
    let adhocAnswerAnswerActionsOrder = getAdhocAnswerActionsOrder();

    return new AnswerPageActionsConfig(
        adhocAnswerActions,
        adhocAnswerAnswerActionsOrder
    );
}

function getAdhocAnswerActions(answer: AnswerComponent) : Array<any> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    let saveAction = _.assign({}, menuItems.saveUntitled, {
        onClick : () => {
            saveClickHandler(answer);
            return $q.when();
        }
    });
    let shareAction = _.assign({}, menuItems.share, {
        onClick : () => {
            showDialogToSaveDocumentBeforeShare(
                answer.answerModel,
                blinkConstants.ANSWER_TYPE,
                getOnSaveConfirmHandler(answer, 'documentName', '')
            );
            return $q.when();
        }
    });
    return [saveAction, shareAction];
}

function getOnSaveConfirmHandler(answer: AnswerComponent, nameProp, descProp) {
    return (customData) => {
        let answerModel = answer.answerModel;
        let name = customData[nameProp];
        let description = customData[descProp];
        if (!name) {
            return false;
        }

        answerModel.setName(name);
        answerModel.setDescription(description);

        saveAnswer(answerModel)
            .then((answerJson) => {
                navService.goToSavedAnswer(getDocumentIdFromJson(answerJson));
            });
        return true;
    };
}

function saveClickHandler(answer: AnswerComponent) {
    let answerModel = answer.answerModel;
    let questionHeader = answerModel.getName();
    let questionDescription = answerModel.getDescription();
    let title = strings.SAVE_AS_DIALOG_TITLE.assign(blinkConstants.ANSWER_TYPE);
    let onConfirm = getOnSaveConfirmHandler(answer, 'questionHeader', 'questionDescription');

    let config = {
        title: title,
        customBodyUrl: 'src/common/widgets/dialogs/templates/save-dialog.html',
        cancelBtnLabel: blinkConstants.CANCEL,
        confirmBtnLabel: blinkConstants.SAVE,
        customData: {
            questionHeader: questionHeader,
            questionDescription: questionDescription
        },
        onConfirm: onConfirm
    };

    dialog.show(config);
}

function getAdhocAnswerActionsOrder() : Array<string> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    return [
        menuItems.saveUntitled.id,
        menuItems.saveAsWorksheet.id,
        menuItems.addFormula.id,
        menuItems.showUnderlyingData.id,
        menuItems.downloadAsCsv.id,
        menuItems.downloadAsPdf.id,
        menuItems.downloadAsXlsx.id,
        menuItems.download.id,
        menuItems.triggerA3.id,
        menuItems.triggerA2.id,
        menuItems.share.id
    ];
}
