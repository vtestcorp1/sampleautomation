/**
 * Copyright: ThoughtSpot Inc. 2015
 * Author: Satyam Shekhar (satyam@thoughtspot.com)
 * Author: Rahul Paliwal (rahul@thoughtspot.com)
 *
 * @fileoverview Utilities for thrift objects.
 */

'use strict';

(function () {
    /* eslint camelcase: 1, no-undef: 0 */

    var BLINK_THRIFT_SERIALIZATION_VERSION = 1;

    /**
     * @param {*} thriftObject
     * @returns {string} Serialized representation of @thriftObject.
     */
    thrift.serialize = function (thriftObject) {
        var transport = new Thrift.Transport('Irrelevant');
        var protocol = new Thrift.Protocol(transport);
        protocol.tstack = [];
        protocol.tpos = [];
        thriftObject.write(protocol);
        var serialized = protocol.tstack.join(",");
        //return JSON.stringify({
        //    blinkVersion: BLINK_THRIFT_SERIALIZATION_VERSION,
        //    serialized: serialized
        //});
        return serialized;
    };

    /**
     * Deserializes @thriftObject from @serializedString.  The object should have been serialized using @serialize
     * method above.
     *
     * @param {string} serializedString
     * @param {*} thriftObject
     */
    thrift.deserialize = function (serializedString, thriftObject) {
        // Try deserialization for the latest serialization format.  If that fails, fall back to older format.
        try {
            deserialize(serializedString, thriftObject);
        } catch (err) {
            deserializeOld(serializedString, thriftObject);
        }
    };

    /**
     * Latest implementation of deserializing thrift objects from serialized json representation.
     * @param {string} serializedString
     * @param {*} thriftObject
     */
    var deserialize = function(serializedString, thriftObject) {
        var transport = new Thrift.Transport('Irrelevant'),
            protocol  = new Thrift.Protocol(transport);
        //var parsed = JSON.parse(serializedString);
        //if (parsed.blinkVersion === undefined || parsed.blinkVersion != BLINK_THRIFT_SERIALIZATION_VERSION) {
        //    throw "No version found in serialized object.";
        //}
        //if (parsed.serialized === undefined) {
        //    throw "Corrupt serialized object=" + parsed;
        //}
        protocol.rpos = [];
        //protocol.rstack = [ JSON.parse(parsed.serialized) ];
        protocol.rstack = [JSON.parse(serializedString)];
        thriftObject.read(protocol);
    };

    /**
     * We have kept around the old deserializer for backward compatibility.
     *
     * @param {string} serializedString
     * @param {*} thriftObject
     */
    var deserializeOld = function(serializedString, thriftObject) {
        var deserializerTransport = new Thrift.Transport('Irrelevant'),
            deserializerProtocol  = new Thrift.Protocol(deserializerTransport);

        deserializerTransport.recv_buf = serializedString;
        deserializerProtocol.readMessageBegin();
        thriftObject.read(deserializerProtocol);
    };
})();
