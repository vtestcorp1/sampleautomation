/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Service used to make all /formula callosum calls.
 * This service contains base network call and commonly use wrappers for these calls.
 */

'use strict';

blink.app.factory('formulaService', ['$q',
    'Command',
    'Logger',
    'LogicalTableModel',
    'perfMeter',
    function ($q,
          Command,
          Logger,
          LogicalTableModel,
          perfMeter) {

        var getFormula = function (params) {
            var deferred = $q.defer();

            var serializedExpression = sage.serialize(params.formulaExpression);

            var command = new Command()
            .setPath('/formula')
            .setIgnorable()
            .setPostMethod()
            .setPostParams({
                formula: serializedExpression,
                sagecontext: sage.serialize(params.sageContext),
                name: params.formulaName,
                save: params.save,
                // TODO (sunny): remove it once callosum api is updated
                overrideparameters: JSON.stringify({
                    dataTypeOverride: '',
                    columnTypeEnum: '',
                    aggTypeOverride: ''
                }),
                debug: Logger.isDebugLogEnabled()
            });

            perfMeter.startAnswerMetadataRequest();

            command.execute()
            .then(function (response) {
                var data = response.data;

                perfMeter.endAnswerMetadataRequest();
                if (data && data.debugInfo) {
                    perfMeter.setCallosumServerMetadataLatencyInfo(data.debugInfo);
                }

                // The client of this promise will get the parsed data model inside .then(function(response){})
                if (!data.isErrorOrWarning) {
                    response.data = LogicalTableModel.createLogicalColumn(data, -1);
                    deferred.resolve(response);
                } else {
                    deferred.reject(response);
                }
            }, function (response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        return {
            getFormula: getFormula
        };
    }]);
