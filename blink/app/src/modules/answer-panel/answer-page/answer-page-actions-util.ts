/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This provides actions on answer page that are added by the virtue of
 * being an answer.
 * NOTE: We want specific actions for answer, saved answer, aggregated worksheet and viz context
 * to be passed into the answer page.
 */

import _ from 'lodash';
import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire, Provide} from '../../../base/decorators';
import {strings} from '../../../base/strings';
import * as dialog from '../../../common/widgets/dialog/dialog-service';
import {A3DialogPopupComponent} from '../../a3/a3-dialog-popup';
import {getA3VisualizationAnalysisRequest} from '../../a3/a3-request-generator';
import {triggerVisualizationAnalysis} from '../../a3/auto-analyzer-service';
import {saveAnswerAsWorksheet} from
    '../../search-pages/aggregated-worksheet-editor/aggregated-worksheet-utils';
import {launchVizLevelUnderlyingData} from '../../viz-context-menu/show-underlying-data-service';
import {AnswerPageComponent} from './answer-page';

let $q = ngRequire('$q');
let sessionService = ngRequire('sessionService');
declare var flags;

Provide('answerPageActionsUtil')(
    {
        getAnswerPageActions
    }
);

export class AnswerPageActionsConfig {
    constructor(public containerActions: Array<any>, public actionsOrder: Array<string>) {}
}

export function getAnswerPageActions(
    answerPageComponent: AnswerPageComponent,
    permission: any
) : Array<any> {
    let menuItems = blinkConstants.metadataObjectMenuItems;
    let missingUnderlyingAccess: boolean = permission.isMissingUnderlyingAccess();
    let hasDownloadPrivileges = sessionService.hasDataDownloadPrivileges();
    let userCanSaveAnswerAsWorksheet = sessionService.hasAdminPrivileges()
        || sessionService.hasDataManagementPrivileges();
    let answerModel = answerPageComponent.answerModel;
    let answerSheet = answerModel.getCurrentAnswerSheet();
    let primaryVizModel = answerSheet.getPrimaryDisplayedViz();
    let isTableView = primaryVizModel.getVizType() === blinkConstants.vizTypes.TABLE;

    let saveAsWorksheetAction = _.assign({}, menuItems.saveAsWorksheet, {
        onClick : () => {
            dialog.show(createSaveAsWorksheetDialogConfig(answerPageComponent.answerModel));
            return $q.when();
        },
        showWhen: () => {
            return userCanSaveAnswerAsWorksheet;
        }
    });
    let addFormulaAction = _.assign({}, menuItems.addFormula, {
        onClick : () => {
            answerPageComponent.addFormulaRequestHandler();
            return $q.when();
        },
        dropdownItemDisabled: missingUnderlyingAccess,
        dropdownItemTooltip: strings.permission.requestUnderlyingDataAccess
    });
    let showUnderlyingDataAction = _.assign({}, menuItems.showUnderlyingData, {
        onClick : () => {
            launchVizLevelUnderlyingData(primaryVizModel, answerPageComponent.sageClient);
            return $q.when();
        },
        showWhen: () => {
            return isTableView && !answerModel.isChasmTrapQuery();
        },
        dropdownItemDisabled: missingUnderlyingAccess,
        dropdownItemTooltip: strings.permission.requestUnderlyingDataAccess
    });
    var downloadTableAsCSVAction = _.assign({}, menuItems.downloadAsCsv, {
        onClick : () => {
            answerPageComponent.downloadTable(blinkConstants.FILE_TYPE.CSV.toUpperCase());
            return $q.when();
        },
        showWhen: () => {
            return isTableView && hasDownloadPrivileges;
        }
    });

    var downloadTableAsPDFAction = _.assign({}, menuItems.downloadAsPdf, {
        onClick : () => {
            answerPageComponent.downloadTable(blinkConstants.FILE_TYPE.PDF.toUpperCase());
            return $q.when();
        },
        showWhen : () => {
            return isTableView && hasDownloadPrivileges;
        }
    });

    var downloadTableAsXLSXAction = _.assign({}, menuItems.downloadAsXlsx, {
        onClick : () => {
            answerPageComponent.downloadTable(blinkConstants.FILE_TYPE.XLSX.toUpperCase());
            return $q.when();
        },
        showWhen: () => {
            return isTableView && hasDownloadPrivileges;
        }
    });
    var downloadChartAction = _.assign({}, menuItems.download, {
        onClick : () => {
            answerPageComponent.downloadChart();
            return $q.when();
        },
        showWhen : () => {
            return !isTableView && hasDownloadPrivileges;
        }
    });
    var triggerA3Action = _.assign({}, menuItems.triggerA3, {
        onClick : () => {
            triggerVisualizationAnalysis(primaryVizModel);
            return $q.when();
        },
        showWhen : () => {
            return sessionService.isA3Enabled();
        },
        dropdownItemDisabled: missingUnderlyingAccess,
        dropdownItemTooltip: strings.permission.requestUnderlyingDataAccess
    });
    var triggerA2Action = _.assign({}, menuItems.triggerA2, {
        onClick : () => {
            let a3Request = getA3VisualizationAnalysisRequest(primaryVizModel, void 0);
            let a3p = new A3DialogPopupComponent(a3Request, answerPageComponent.sageClient);
            a3p.show();
            return $q.when();
        },
        showWhen : () => {
            return sessionService.isA3Enabled();
        },
        dropdownItemDisabled: missingUnderlyingAccess,
        dropdownItemTooltip: strings.permission.requestUnderlyingDataAccess
    });

    let actions = [
        saveAsWorksheetAction,
        addFormulaAction,
        showUnderlyingDataAction,
        downloadTableAsCSVAction,
        downloadTableAsPDFAction,
        downloadTableAsXLSXAction,
        downloadChartAction,
        triggerA3Action,
        triggerA2Action
    ];

    if (flags.getValue('showRelatedItems')) {
        var relateAction = Object.assign({}, menuItems.relate, {
            onClick: () => {
                launchRelatedItemsEditor(answerModel, answerPageComponent.sageClient);
            },
            showWhen: () => {
                return flags.getValue('showRelatedItems');
            }
        });
        actions.push(relateAction);
    }
    return actions;
}

function createSaveAsWorksheetDialogConfig(answerModel: any) : any {
    let title = strings.SAVE_AS_DIALOG_TITLE.assign(blinkConstants.WORKSHEET_TYPE);
    let questionHeader = answerModel.getName();
    let questionDescription = answerModel.getDescription();

    // TODO(Jasmeet): add a check here if its QoQ flow.
    return {
        title: title,
        customBodyUrl: 'src/common/widgets/dialogs/templates/save-dialog.html',
        cancelBtnLabel: strings.CANCEL,
        confirmBtnLabel: strings.SAVE,
        onConfirm: function (customData) {
            var name = customData.questionHeader,
                description = customData.questionDescription;
            if (!name) {
                return false;
            }
            saveAnswerAsWorksheet(answerModel, name, description);
            return true;
        },
        customData: {
            questionHeader: questionHeader,
            questionDescription: questionDescription
        }
    };
}

function launchRelatedItemsEditor (answerModel, sageClient) {
        // TODO: Add related items builder
}
