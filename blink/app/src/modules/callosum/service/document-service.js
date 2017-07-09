/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Vibhor Nanavati (vibhor@thoughtspot.com)
 *
 * @fileoverview Service containing callosum api calls around metadata.
 */

'use strict';

// TODO(Jasmeet): Remove this service and make callers use the metadataService directly.
blink.app.factory('documentService', ['$q', 'Logger', 'metadataService',
    function ($q, Logger, metadataService) {
        var _logger = Logger.create('document-service');

        var me = {};

    /**
     * Saves the model and resolves with updated json.
     * @param {Object} model
     * @returns {Promise.promise|*}
     */
        me.saveModel = function (model) {
            var metadataJson = model.getMetadataJson();

            if(model.getValidationError) {
                var err = model.getValidationError();
                if(!!err) {
                    return $q.reject({msg: err});
                }
            }

            return metadataService.save(
            model.getMetadataType(),
            JSON.stringify(metadataJson),
            model.shouldForceSave()
        );
        };

    /**
     * Implements copy and save as functionality.
     * @param model
     * @returns {Promise.promise|*}
     */
        me.saveAsModel = function (model, name, desc) {
            var metadataJson = model.getMetadataJson();

            return metadataService.saveAs(
            model.getMetadataType(),
            JSON.stringify(metadataJson),
            model.shouldForceSave(),
            name,
            desc
        );
        };

        return me;
    }]);
