/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Provide actions for viz-context answer.
 */

import _ from 'lodash';
import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire} from '../../../base/decorators';
import {AnswerPageActionsConfig} from '../../answer-panel/answer-page/answer-page-actions-util';
import {saveAnswer} from '../../search-pages/search-pages-utils';
import {VizContextAnswerComponent} from './viz-context-answer';

let $q = ngRequire('$q');
let navService = ngRequire('navService');

declare var flags: any;

export function getVizContextActionsConfig(
    vizContextAnswer: VizContextAnswerComponent
) : AnswerPageActionsConfig {
    let vizContextActions = getVizContextActions(vizContextAnswer);
    let vizContextActionsOrder = getVizContextActionsOrder();

    return new AnswerPageActionsConfig(
        vizContextActions,
        vizContextActionsOrder
    );
}

function getVizContextActions(vizContextAnswer: VizContextAnswerComponent) : Array<any> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    let saveAction = _.assign({}, menuItems.update, {
        onClick : () => {
            return saveAnswer(vizContextAnswer.answerModel)
                .then(function() {
                    vizContextAnswer.savedAnswerOnServer = vizContextAnswer.answerModel;
                    vizContextAnswer.isVizContextAnswerUpdated = true;
                });
        },
        dropdownItemDisabled : () => {
            return vizContextAnswer.disableUpdateOfAnswer();
        }
    });
    let replaySearchAction = _.assign({}, menuItems.replaySearch, {
        onClick : () => {
            var answerId = vizContextAnswer.answerModel.getId();
            navService.goToReplayAnswer(answerId);
            return $q.when();
        }
    });

    let actions = [saveAction, replaySearchAction];

    if (flags.getValue('showRelatedItems')) {
        let relateAction = _.assign({}, menuItems.relate, {
            onClick: () => {
                // TODO: Add related items builder.
            }
        });
        actions.push(relateAction);
    }

    return actions;
}

function getVizContextActionsOrder() : Array<string> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    return [
        menuItems.update.id,
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
