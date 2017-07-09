/**
 * Copyright: ThoughtSpot Inc. 2012-2015
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview Service to de-serialize serialized protocol buffers.
 *
 */

'use strict';

blink.app.factory('protobufParsingService', ['$http', '$q', 'Logger',
    function ($http, $q, Logger) {

        var ProtoType = {
            TOPOGL: 'TOPOGL',
            MESSAGING: 'MESSAGING'
        };

        var logger = Logger.create('protobuf-parsing-service');
        var protoTypeToCachedProtoDefinition = {};

        function getProtoURLForProtoType(protoType) {
            switch (protoType) {
                case ProtoType.TOPOGL:
                    return '/resources/proto/topogl.proto';
                case ProtoType.MESSAGING:
                    return '/resources/proto/message_codes.proto';
                default:
                    logger.error('unsupported proto type', protoType);
                    return null;
            }
        }

        function getProtoDefinitionForProtoType(protoType) {
            var deferred = $q.defer();
            if (Object.has(protoTypeToCachedProtoDefinition, protoType)) {
                deferred.resolve(protoTypeToCachedProtoDefinition[protoType]);
                return deferred.promise;
            }

            var protoURL = getProtoURLForProtoType(protoType);
            if (!protoURL) {
                deferred.reject('unable to parse protobuf, no proto URL available');
                return deferred.promise;
            }

            return $http.get(protoURL)
            .then(function(response, status, headers, config){
                protoTypeToCachedProtoDefinition[protoType] = response.data;
                return response.data;
            }, function(data, status, headers, config){
                return data;
            });
        }

        function parseMessagingProto(buffer, proto) {
            var ProtoBuf = dcodeIO.ProtoBuf;
            ProtoBuf.convertFieldsToCamelCase = true;
            var builder = ProtoBuf.loadProto(proto);
            var MessageCode = builder.build("common.MessageCodeSet");
            return MessageCode.decode(buffer);
        }

        function parseTopoGlProto(buffer, proto) {
            var ProtoBuf = dcodeIO.ProtoBuf;
            ProtoBuf.convertFieldsToCamelCase = true;
            var builder = ProtoBuf.loadProto(proto);
            var Topology = builder.build("Topology");
            return Topology.decode(buffer);
        }

        function parse(buffer, protoType) {
            return getProtoDefinitionForProtoType(protoType)
            .then(function(proto){
                switch (protoType) {
                    case ProtoType.TOPOGL:
                        return parseTopoGlProto(buffer, proto);
                    case ProtoType.MESSAGING:
                        return parseMessagingProto(buffer, proto);
                    default:
                        logger.error('unsupported proto type', protoType);
                        return null;
                }

            }, function(error){
                return error;
            });
        }

        return {
            ProtoType: ProtoType,
            parse: parse
        };

    }]);
