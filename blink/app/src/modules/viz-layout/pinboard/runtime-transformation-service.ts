import {ngRequire} from '../../../base/decorators';
import {PbCardComponent} from '../../pinboard/pb-card/pb-card';
import {PinboardDataVizComponent} from '../../pinboard/pinboard-data-viz/pinboard-data-viz';

let autoCompleteObjectUtil = ngRequire('autoCompleteObjectUtil');
let autoCompleteService = ngRequire('autoCompleteService');
let vizContextMenuUtil = ngRequire('vizContextMenuUtil');

declare var sage: any;


/**
 *   Runtime transformation path is the path where a pinboard chart can be extended (
 *   currently only used by slack integration). There are two workflows supported by
 *   the object extensions model:
 *      1) Adding Filters for filter phrases
 *      2) Adding Columns for group by phrases
 * In the case of 1) we want to keep the same chart config and apply the filter phrase.
 * In the case of 2) we disable any fixed chart config and use the drill operation util
 * to make a transformTable request with only visualized columns. The separation of code
 * paths is necessary to achieve a UX where if a user just adds a filter on an existing
 * chart, the chart will effectively look the same except that it will have the newly
 * added token.
 * @param vizInfo the PinboardVizInfo to apply the transformation to.
 * @param serializedTransformation serialized sage.FormattedTokens.
 * @returns {Promise<void>}
 */
function applyTransformation(pinboardVizCardComponent: PbCardComponent,
                             serializedTransformation: string) : Promise<void> {
    // transformation are the tokens to add to the query
    if(!isTransformable(pinboardVizCardComponent)) {
        return Promise.resolve();
    }
    let pbCardContentComponent = <PinboardDataVizComponent>pinboardVizCardComponent.contentCtrl;
    let originalContext = pbCardContentComponent.sageClient.getContext();
    let originalIndex = pbCardContentComponent.sageClient.getCurrentIndex();
    let transformation = sage.deserialize(serializedTransformation, sage.FormattedTokens);
    let vizModel = pinboardVizCardComponent.vizModel.getReferencedVisualization();
    let vizRenderedPromise = new Promise<void>(
        resolve => pinboardVizCardComponent.setOnRenderCompleteCallback(resolve)
    );

    // Case 1)
    let areAllFilters = transformation.getPhrases().every((phrase) => {
        return phrase.getPhraseType() === sage.PhraseType.FILTER_PHRASE;
    });
    if (areAllFilters) {
        let originalTokens = originalContext.getTables()[originalIndex].getTokens();
        let recognizedTokens = transformation.token.concat(originalTokens);
        let request = autoCompleteObjectUtil.createACTableRequestFromTokens(recognizedTokens);
        pbCardContentComponent.sageClient.editTable(request);
        return vizRenderedPromise;
    }

    // Case 2)
    let originalColumns = vizModel.getVisualizedColumns().map(col => {
        return {
            column: col
        };
    });
    let queryTransformation = vizContextMenuUtil.createQueryTransformations(
        [],
        originalColumns,
        {
            includeColumnAggregations: true,
            includeFilteredColumns: true,
            answerModel: pinboardVizCardComponent
                .vizModel
                .getReferencedVisualization()
                .getContainingAnswerModel()
        }
    );

    // Unlock any chart visualizations.
    let answerSheet = pinboardVizCardComponent
        .vizModel
        .getReferencedVisualization()
        .getContainingAnswerModel()
        .getCurrentAnswerSheet();
    var chartVisualizations = !!answerSheet ? answerSheet.getChartVisualizations() : [];
    chartVisualizations.forEach(function(chartViz) {
        chartViz.setIsConfigurationLocked(false);
    });

    autoCompleteService.transformTable(originalContext, originalIndex, queryTransformation)
        .then((sageResponse) => {
            var answerResponse = sageResponse.answerResponse;
            var drillContext = answerResponse.getContext();
            let originalTokens = drillContext.getTables()[originalIndex].getTokens();
            let recognizedTokens = transformation.token.concat(originalTokens);
            let request = autoCompleteObjectUtil.createACTableRequestFromTokens(recognizedTokens);
            return pbCardContentComponent.sageClient.editTable(request);
        });
    return vizRenderedPromise;
}

function transformVisualization(pinboardVizCardComponent: PbCardComponent,
                                serializedTransformation: string): PromiseLike<void> {
    if(!serializedTransformation || !isTransformable(pinboardVizCardComponent)) {
        return Promise.resolve();
    }

    let pbCardContentComponent = <PinboardDataVizComponent>pinboardVizCardComponent.contentCtrl;
    return pbCardContentComponent.populateAnswer().then(() => {
        return applyTransformation(pinboardVizCardComponent, serializedTransformation);
    });
}

function isTransformable(pbCardComponent: PbCardComponent) {
    return pbCardComponent.contentType === 'DATA';
}

export {
    transformVisualization,
    applyTransformation
};
