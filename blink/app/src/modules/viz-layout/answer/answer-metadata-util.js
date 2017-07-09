/**
 * Copyright: ThoughtSpot Inc. 2012-2013
 * Author: Stephane Kiss (stephane@thoughtspot.com)
 *
 * @fileoverview Service used to access an answer
 */

'use strict';

blink.app.factory('answerMetadataUtil', ['AnswerModel',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'metadataService',
    function (AnswerModel,
          blinkConstants,
          strings,
          jsonConstants,
          metadataService) {

        function processResponseData(metadataType, response) {
            var data = response.data;

        //the structure of the json reported is needs to have some extra fields added to make it similar
        //to the one returned when we fetch full model so that the parsing logic can stay the same
            var dataNode = {};
            data.reportContent.sheets.each(function(sheet){
                dataNode[sheet.header.id] = {
                    vizData: {}
                };
            });
            data = {
                completionRatio: 1,
                reportBookData: dataNode,
                reportBookMetadata: data
            };

        //TODO: update AnswerModel to accept data-less json in constructor
            response.data = new AnswerModel(data, true);
            response.data.setMetadataType(metadataType);

            var answerModel, answerSheet;
        // NOTE: 1. In answer page redesign to remove redundant titles between answer and viz we end
        // up in the situation where users might have old pinned answer where the answer name was
        // never set instead user sets the viz title that was getting pinned.
        // To avoid the jarring experience to showing UNTITLED as the title we display the title
        // of the viz that was pinned.
        // 2. The migration is done while loading the page as for the app this is not a change in
        // answer model. If the name is changed upstream we run into issues when comparing answer
        // model snapshots.
            if (response.data.isHidden()) {
                answerModel = response.data;
                if (answerModel.getName() === strings.UNTITLED_OBJECT_NAME) {
                    answerSheet = answerModel && answerModel.getCurrentAnswerSheet();
                    var primaryViz = answerSheet && answerSheet.getPrimaryDisplayedViz();
                    if (!!primaryViz) {
                        answerModel.setName(primaryViz.getName());
                        answerModel.setDescription(primaryViz.description);
                    }
                }
            }

        // NOTE: User can have a chart which is unlocked and yet the answer is saved. Now user
        // would expect the same chart to be displayed. Hence we should lock the the chart in case
        // of retrieval of saved answer.
            answerModel = response.data;
            answerSheet = answerModel && answerModel.getCurrentAnswerSheet();
            var chartVisualizations = !!answerSheet ? answerSheet.getChartVisualizations() : [];
            chartVisualizations.forEach(function(chartViz) {
                chartViz.setIsConfigurationLocked(true);
            });

            return response;
        }

        var getModelMetadata = function (answerBookId, isIgnorable, metadataType) {
            var params = {
                showHidden: true,
                isIgnorable: !!isIgnorable
            };

            var responseProcessor = processResponseData.bind(undefined, metadataType);

            return metadataService.getMetadataObjectDetails(metadataType, answerBookId, params)
            .then(responseProcessor);
        };

        return {
            getModelMetadata: getModelMetadata
        };
    }]);
