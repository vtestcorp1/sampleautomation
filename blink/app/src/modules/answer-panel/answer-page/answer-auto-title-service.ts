/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This service provides ability to auto title answers.
 */

import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire} from '../../../base/decorators';

let filterUtil = ngRequire('filterUtil');

export function autoTitleAnswer(answerModel: any) {
    // AutoTitle handling
    if (!answerModel) {
        return;
    }
    if (answerModel.hasUserDefinedName()) {
        return;
    }
    let answerSheet = answerModel.getCurrentAnswerSheet();
    let primaryViz = answerSheet && answerSheet.getPrimaryDisplayedViz();
    if (!primaryViz) {
        return;
    }

    let autoTitle = primaryViz.getAutoTitle();
    answerModel.setName(autoTitle);
    primaryViz.setTitle(autoTitle);
    let filterModels = answerSheet.getFilterVisualizations();
    let description = filterModels.map(function(filterModel) {
        let filterColumn = filterModel.getColumn();
        let val = filterColumn.getName();
        if (filterModel.isSupportedByUI()) {
            val = val + ' : ' + filterUtil.getFilterValueSummary(filterModel);
        }
        return val;
    }).join('\n');
    if (!!description) {
        description = blinkConstants.FILTERS + ':\n' + description;
    }
    answerModel.setDescription(description);
}
