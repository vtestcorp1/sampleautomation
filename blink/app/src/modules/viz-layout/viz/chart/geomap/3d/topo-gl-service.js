/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to de-serialize serialized protocol buffers.
 *
 */

'use strict';

blink.app.factory('topoGlService', ['$http', '$q', 'Logger', 'protobufParsingService', 'GeoUtils',
    function ($http, $q, Logger, protobufParsingService, GeoUtils) {

        var logger = Logger.create('topo-gl-service');
        var geoTypeToTopoGlCache = {};

        function postProcessParsedTopoGl(topoGl) {
            var topoGL = {};

            topoGL.projection = topoGl.projection;
            topoGL.featureProperties = topoGl.serializedFeatures.map(function(serializedProps){
                return JSON.parse(serializedProps);
            });
            topoGL.numVertices = topoGl.numVertices;
            topoGL.vertexPositions = new Float32Array(topoGl.vertexPositions.toArrayBuffer());
            topoGL.numTriangles = topoGl.numTriangles;
            topoGL.triangleIndices = new Uint16Array(topoGl.triangleIndices.toArrayBuffer());
            topoGL.triangleBatchBoundaries = topoGl.triangleBatchBoundaries;
            topoGL.vertexHiddenStates = new Float32Array(topoGl.vertexHiddenStates.toArrayBuffer());
            topoGL.vertexFeatureIndices = new Float32Array(topoGl.vertexFeatureIndices.toArrayBuffer());

            return topoGL;
        }


        function getTopoGLForGeoType(geoType) {
            var deferred = $q.defer();
            if (Object.has(geoTypeToTopoGlCache, geoType)) {
                deferred.resolve(geoTypeToTopoGlCache[geoType]);
                return deferred.promise;
            }

            var topologyLayerURL = GeoUtils.getTopoGlURLForGeoType(geoType);
            if (!topologyLayerURL) {
                deferred.resolve(null);
                return deferred.promise;
            }

            $http.get(topologyLayerURL, {responseType: "arraybuffer"})
            .success(function(topoGlBuffer, status, headers, config) {
                var topoGlPromise =
                    protobufParsingService.parse(topoGlBuffer, protobufParsingService.ProtoType.TOPOGL);

                topoGlPromise.then(function(topoGl){
                    var processedTopoGl = postProcessParsedTopoGl(topoGl);
                    geoTypeToTopoGlCache[geoType] = processedTopoGl;
                    deferred.resolve(processedTopoGl);
                }, function(error){
                    deferred.reject(error);
                });
            })
            .error(function(data, status, headers, config){
                deferred.reject(status);
            });

            return deferred.promise;
        }

        return {
            getTopoGLForGeoType: getTopoGLForGeoType
        };

    }]);
