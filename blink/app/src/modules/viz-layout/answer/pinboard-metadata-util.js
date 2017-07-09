/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Stephane Kiss (stephane@thoughtspot.com),
 * Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service used to access a pinboard.
 */

'use strict';

blink.app.factory('pinboardMetadataUtil', [
    'jsonConstants',
    'metadataService',
    'PinboardAnswerModel',
    'routeService',
    'sessionService',
    function (jsonConstants,
              metadataService,
              PinboardAnswerModel,
              routeService,
              sessionService) {
        function processResponse(response) {
            response = _.clone(response);
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

            response.data = new PinboardAnswerModel(data);

        // Batch size for tables when they are printed in pdf is typically kept smaller than the
        // default batch size.
            if (routeService.getCurrentPage() === blink.app.pages.PRINT) {
                response.data.getCurrentAnswerSheet().getReferencedTableVisualizationsArray().forEach(
                function (tableViz) {
                    tableViz.setBatchSize(sessionService.getTablePrintDataBatchSize());
                }
            );
            }

         // Batch size for tables when they are taken via screen shot require different config (generally
         // smaller) since the form factor may be decidedly different (for instance mobile).
            if (flags.getValue('screenshotMode')) {
                response.data.getCurrentAnswerSheet().getReferencedTableVisualizationsArray().forEach(
                function (tableViz) {
                    tableViz.setBatchSize(sessionService.getTablePrintDataBatchSizeForSlack());
                }
            );
            }

            var metadataType = jsonConstants.metadataType.PINBOARD_ANSWER_BOOK;
            response.data.setMetadataType(metadataType);

            return response;
        }

        var getModelMetadata = function (pinboardId, isIgnorable) {
            var params = {
                showHidden: true,
                isIgnorable: !!isIgnorable
            };

            var metadataType = jsonConstants.metadataType.PINBOARD_ANSWER_BOOK;

            return metadataService.getMetadataObjectDetails(metadataType, pinboardId, params)
            .then(processResponse);
        };

        return {
            getModelMetadata: getModelMetadata,
            processResponse: processResponse
        };
    }]);
