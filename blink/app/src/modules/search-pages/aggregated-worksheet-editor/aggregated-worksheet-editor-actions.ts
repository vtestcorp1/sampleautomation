/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This file contains actions on aggregated worksheet editor answer page.
 */

import _ from 'lodash';
import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire, Provide} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {AnswerPageActionsConfig} from '../../answer-panel/answer-page/answer-page-actions-util';
import {ShareDialogComponent} from '../../share/share-dialog-component';
import {getShareDialogConfig} from '../search-pages-utils';
import {AggregatedWorksheetEditorComponent} from './aggregated-worksheet-editor';
import {updateWorksheetFromAnswer} from './aggregated-worksheet-utils';

let $q = ngRequire('$q');
let loadingIndicator = ngRequire('loadingIndicator');

export function getAggrWorksheetEditorActionsConfig(
    answer: AggregatedWorksheetEditorComponent
) : AnswerPageActionsConfig {
    let aggrWorksheetEditorActions = getAggrWorksheetEditorActions(answer);
    let aggrWorksheetEditorActionsOrder = getAggrWorksheetEditorActionsOrder();
    return new AnswerPageActionsConfig(
        aggrWorksheetEditorActions,
        aggrWorksheetEditorActionsOrder
    );
}

function getAggrWorksheetEditorActions(answer: AggregatedWorksheetEditorComponent) : Array<any> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    let saveAction = _.assign({}, menuItems.save, {
        onClick : () => {
            loadingIndicator.show({
                loadingText: strings.SAVING,
                showInstantly: true
            });
            return updateWorksheetFromAnswer(answer.savedAnswerOnServer, answer.answerModel)
                .then(() => {
                    answer.savedAnswerOnServer = answer.answerModel;
                })
                .finally(loadingIndicator.hide);
        }
    });
    let shareAction = _.assign({}, menuItems.share, {
        onClick : () => {
            answer.shareDialogComponent = new ShareDialogComponent(
                getShareDialogConfig(answer.answerModel),
                answer.onShareDialogClearCallback
            );
            answer.showShareDialog = true;
            return $q.when();
        },
        dropdownItemDisabled: true,
        dropdownItemTooltip: strings.permission.aggrWorksheetSharingDisabled
    });
    return [saveAction, shareAction];
}

function getAggrWorksheetEditorActionsOrder() : Array<string> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    return [
        menuItems.save.id,
        menuItems.saveAsWorksheet.id,
        menuItems.addFormula.id,
        menuItems.showUnderlyingData.id,
        menuItems.downloadAsCsv.id,
        menuItems.downloadAsPdf.id,
        menuItems.downloadAsXlsx.id,
        menuItems.download.id,
        menuItems.triggerA3.id,
        menuItems.share.id
    ];
}

Provide('aggregatedWorksheetEditorActions')({
    getAggrWorksheetEditorActionsConfig
});
