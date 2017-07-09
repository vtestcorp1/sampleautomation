/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provides answer page actions config for saved answers.
 */

import _ from 'lodash';
import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire, Provide} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import {AnswerPageActionsConfig} from '../../answer-panel/answer-page/answer-page-actions-util';
import {
    getDocumentIdFromJson,
    showMakeACopyDialog
} from '../../document-model/document-util';
import {ShareDialogComponent} from '../../share/share-dialog-component';
import {
    getShareDialogConfig,
    saveAnswer,
    saveAnswerAs
} from '../search-pages-utils';
import {SavedAnswerComponent} from './saved-answer';

let $q = ngRequire('$q');
let loadingIndicator = ngRequire('loadingIndicator');
let navService = ngRequire('navService');
let util = ngRequire('util');

declare var flags: any;

export function getSavedAnswerPageActionsConfig(
    answer: SavedAnswerComponent
) : AnswerPageActionsConfig {
    let savedAnswerActions = getSavedAnswerActions(answer);
    let savedAnswerAnswerActionsOrder = getSavedAnswerActionsOrder();

    return new AnswerPageActionsConfig(
        savedAnswerActions,
        savedAnswerAnswerActionsOrder
    );
}

function getSavedAnswerActions(answer: SavedAnswerComponent) : Array<any> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    let answerModel = !!answer ? answer.answerModel : null;
    let permission = !!answerModel ? answerModel.getPermission() : null;
    let isReadOnly: boolean = !!permission ? permission.isReadOnly() : false;

    let saveAction = _.assign({}, menuItems.save, {
        onClick : () => {
            return saveAnswer(answer.answerModel)
                .then(() => {
                    answer.savedAnswerOnServer = answer.answerModel;
                });
        },
        dropdownItemDisabled: isReadOnly,
        dropdownItemTooltip: strings.permission.readonlyAccess
    });
    let makeACopy = _.assign({}, menuItems.makeACopy, {
        onClick : () => {
            showMakeACopyDialog(
                answer.answerModel,
                getMakeACopyConfirmationHandler(answer)
            );
            return $q.when();
        }
    });
    let replaySearchAction = _.assign({}, menuItems.replaySearch, {
        onClick : () => {
            var answerId = answer.answerModel.getId();
            navService.goToReplayAnswer(answerId);
            return $q.when();
        }
    });
    let shareAction = _.assign({}, menuItems.share, {
        onClick : () => {
            let shareDialogConfig = getShareDialogConfig(answer.answerModel);
            answer.shareDialogComponent = new ShareDialogComponent(
                shareDialogConfig,
                answer.onShareDialogClearCallback
            );
            answer.showShareDialog = true;
            return $q.when();
        }
    });

    let actions = [saveAction, makeACopy, replaySearchAction, shareAction];

    if (flags.getValue('showRelatedItems')) {
        let relateAction = _.assign({}, menuItems.relate, {
            onClick: () => {
                // TODO: Add related items builder
            }
        });
        actions.add(relateAction);
    }
    return actions;
}

function getMakeACopyConfirmationHandler(answer: SavedAnswerComponent) {
    return (customData) => {
        let name = customData.questionHeader;
        let description = customData.questionDescription;
        if (!name) {
            return false;
        }

        loadingIndicator.show({
            loadingText: strings.SAVING,
            showInstantly: true
        });

        let answerModel = answer.answerModel;
        saveAnswerAs(answerModel, name, description)
            .then(function (answerJson) {
                answer.navAlertDeregisterer();
                navService.goToSavedAnswer(getDocumentIdFromJson(answerJson));
            })
            .finally(() => {
                util.executeInNextEventLoop(() => {
                    answer.registerNavigationAlert();
                });
                loadingIndicator.hide();
            });

        return true;
    };
}

function getSavedAnswerActionsOrder() : Array<string> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    return [
        menuItems.save.id,
        menuItems.makeACopy.id,
        menuItems.saveAsWorksheet.id,
        menuItems.addFormula.id,
        menuItems.showUnderlyingData.id,
        menuItems.downloadAsCsv.id,
        menuItems.downloadAsPdf.id,
        menuItems.downloadAsXlsx.id,
        menuItems.download.id,
        menuItems.triggerA3.id,
        menuItems.triggerA2.id,
        menuItems.replaySearch.id,
        menuItems.share.id,
        menuItems.relate.id
    ];
}

Provide('savedAnswerActions')({
    getSavedAnswerPageActionsConfig
});
