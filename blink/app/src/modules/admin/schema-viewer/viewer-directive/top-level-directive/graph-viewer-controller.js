/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This controller is responsible for instantiating the correct
 * baseViewerController subtype
 *
 *
 */

'use strict';
blink.app.factory('GraphViewerController', ['blinkConstants',
    'strings',
    'Logger',
    'schemaTemplatesService',
    'FullSchemaViewerController',
    'WorksheetViewerController',
    function(blinkConstants,
             strings,
             Logger,
             schemaTemplatesService,
             FullSchemaViewerController,
             WorksheetViewerController) {

        var logger = Logger.create('graph-viewer-controller');

        function GraphViewerController(schemaType, objectId) {
            this.defineController(schemaType, objectId);
            this.viewerCtrl.loadSchema();
            this.showModal = false;
        }

        GraphViewerController.prototype.defineController = function(schemaType, objectId) {

            switch (schemaType.toLowerCase()) {
                // instantiate right type of controller
                case blinkConstants.schemaType.TABLE:
                    this.viewerCtrl = new FullSchemaViewerController(objectId,
                    schemaTemplatesService.schemaLegend,
                    schemaTemplatesService.schemaLegendPicture,
                    this.switchToController.bind(this));
                    break;
                case blinkConstants.schemaType.WORKSHEET:
                    if (!objectId) {
                        logger.error('No id passed for worksheet viewer');
                    }
                    this.viewerCtrl = new WorksheetViewerController(objectId,
                    schemaTemplatesService.schemaLegend,
                    schemaTemplatesService.schemaLegendPicture
                );
                    break;
                case blinkConstants.schemaType.ANSWER:
                    //this.viewerCtrl = new AnswerViewerController(objectId, schemaTemplatesService.schemaLegend);
                    break;
                default:
                    logger.error('Bad type ', schemaType, 'passed');
            }
        };


        /**
         *
         * This method allows to navigate between the different viewer
         *
         * @param {string} schemaType
         * @param {string} objectId
         */
        GraphViewerController.prototype.switchToController = function(schemaType, objectId) {
            var schema = this.viewerCtrl.schema;
            this.defineController(schemaType, objectId);
            this.viewerCtrl.graphViewerController.cleanDiagram();
            this.viewerCtrl.onSchemaLoaded(schema);
        };

        return GraphViewerController;
    }
]);
