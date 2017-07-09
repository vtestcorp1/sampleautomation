/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Actions that are specific to pinboard data viz.
 */

import _ from 'lodash';
import {blinkConstants} from '../../../base/blink-constants';
import {ngRequire} from '../../../base/decorators';
import {A3DialogPopupComponent} from '../../a3/a3-dialog-popup';
import {getA3VisualizationAnalysisRequest} from '../../a3/a3-request-generator';
import {triggerVisualizationAnalysis} from '../../a3/auto-analyzer-service';
import {hasDataDownloadPrivileges, isA3Enabled} from '../../callosum/service/session-service';
import {RelatedLinkPopupComponent} from '../../related-link/editor/related-link-popup';
import {jsonConstants} from '../../viz-layout/answer/json-constants';
import {PinboardDataVizComponent} from './pinboard-data-viz';

let answerReplayService = ngRequire('answerReplayService');
let dialog = ngRequire('dialog');
let embeddingInfoDialogService = ngRequire('embeddingInfoDialogService');
let env = ngRequire('env');
let navService = ngRequire('navService');
let util = ngRequire('util');

declare let flags: any;

export function getDataVizActions(pinboardDataVizComponent: PinboardDataVizComponent) {
    let menu = blinkConstants.metadataObjectMenuItems;

    let replay = _.assign({}, menu.replaySearch, {
        onClick: function() {
            var refAnswerModelId = pinboardDataVizComponent
                .vizModel
                .getAnswerBookIdThroughReferencingViz();
            navService.goToReplayAnswer(refAnswerModelId);
        },
        showWhen: function() {
            if (pinboardDataVizComponent.vizModel.isTransformed()) {
                return false;
            }
            let refAnswerModelId = pinboardDataVizComponent
                .vizModel
                .getAnswerBookIdThroughReferencingViz();
            let replayableVizTypes = [
                blinkConstants.vizTypes.TABLE,
                blinkConstants.vizTypes.CHART
            ];
            let referencedVizType = pinboardDataVizComponent
                .vizModel
                .getReferencedVisualization()
                .getVizType();
            let containingAnswer = pinboardDataVizComponent
                .vizModel
                .getContainingAnswerModel();

            return replayableVizTypes.any(referencedVizType)
                && (navService.isCurrentSavedAnswerPath(refAnswerModelId)
                || navService.isCurrentPinboardPath()
                || navService.isCurrentHomePath())
                && answerReplayService.canPlayDocument(containingAnswer);
        }
    });

    let edit = _.assign({}, menu.edit, {
        onClick: function() {
            pinboardDataVizComponent.onEdit();
        },
        showWhen: () => {
            return !pinboardDataVizComponent.isTransformed()
                && pinboardDataVizComponent.config.isContextEditable;
        }
    });

    let downloadChart = _.assign({}, menu.download, {
        showWhen: function () {
            return pinboardDataVizComponent.vizModel.getReferencedVisualization().getVizType()
                === jsonConstants.vizType.CHART;
        },
        onClick : function() {
            pinboardDataVizComponent.downloadChart();
        },
        dropdownItemDisabled: !hasDataDownloadPrivileges()
    });
    let downloadCsv = _.assign({}, menu.downloadAsCsv, {
        onClick: function() {
            pinboardDataVizComponent.downloadTable('CSV');
        },
        showWhen: function () {
            return pinboardDataVizComponent.vizModel.getReferencedVisualization().getVizType()
                === jsonConstants.vizType.TABLE;
        },
        dropdownItemDisabled: !hasDataDownloadPrivileges()
    });
    let downloadXlsx = _.assign({}, menu.downloadAsXlsx, {
        onClick: function() {
            pinboardDataVizComponent.downloadTable('XLSX');
        },
        showWhen: function () {
            return pinboardDataVizComponent.vizModel.getReferencedVisualization().getVizType()
                === jsonConstants.vizType.TABLE;
        },
        dropdownItemDisabled: !hasDataDownloadPrivileges()
    });
    let downloadPdf = _.assign({}, menu.downloadAsPdf, {
        onClick: function() {
            pinboardDataVizComponent.downloadTable('PDF');
        },
        showWhen: function () {
            return pinboardDataVizComponent.vizModel.getReferencedVisualization().getVizType()
                === jsonConstants.vizType.TABLE;
        },
        dropdownItemDisabled: !hasDataDownloadPrivileges()
    });

    let allowA3Transformation = () => {
        return !pinboardDataVizComponent.isTransformed()
            && isA3Enabled()
            && pinboardDataVizComponent.vizModel.getReferencedVisualization().allowAnalysis();
    };
    let a3 = _.assign({}, menu.triggerA3, {
        showWhen: allowA3Transformation,
        onClick: function () {
            triggerVisualizationAnalysis(
                pinboardDataVizComponent.vizModel.getReferencedVisualization()
            );
        }
    });
    let a2 = _.assign({}, menu.triggerA2, {
        showWhen: allowA3Transformation,
        onClick: function () {
            var a3Request = getA3VisualizationAnalysisRequest(
                pinboardDataVizComponent.vizModel.getReferencedVisualization(),
                void 0
            );
            var a3p = new A3DialogPopupComponent(a3Request, pinboardDataVizComponent.sageClient);
            a3p.show();
        }
    });

    let relate = _.assign({}, menu.relate, {
        onClick: function () {
            let referencedViz = pinboardDataVizComponent.vizModel.getReferencedVisualization();
            let popup = new RelatedLinkPopupComponent(referencedViz);
            popup.show();
        },
        showWhen: function() {
            return flags.getValue('showRelatedLinks');
        }
    });

    var actions = [
        downloadChart,
        downloadCsv,
        downloadXlsx,
        downloadPdf,
        edit,
        replay,
        a3,
        a2,
        relate
    ];

    return {
        placement: 'auto bottom-left',
        actions: actions
    };
}
