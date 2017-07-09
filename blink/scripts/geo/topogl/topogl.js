/**
 * A command line utility that converts a TopoJson file into a protobuf representation suitable for the Topology
 * to be rendered using Buffered Geometry in WebGL/ThreeJS.
 *
 * Since TopoJson topologies can represent quite big geometries (e.g. US Zip Code TopoJson converts into hundreds
 * of thousands of triangles) processing them into WebGL geometries online can take significant amount of time (order
 * of seconds). While we can do this in WebWorkers and still get away with a not-too-bad UX, it is better to do this
 * offline for topologies that are known to us beforehand.
 *
 * Also note that the output of the script is a protobuffer that can then be loaded and parsed in the browser
 * using protobuf.js.
 *
 * Example invocation:
 *
 * node topogl.js -t ~/projects/scaligent/blink/app/resources/geo/topojson/us_state.topo.json \
 * -p ~/projects/scaligent/blink/app/resources/proto/topogl.proto \
 * -o ~/projects/scaligent/blink/app/resources/geo/topogl/us_state.topogl.bin
 */

var optimist = require('optimist');
var fs = require('fs');
var ProtoBuf = require("protobufjs");
var topoJsonTopoGlConverter = require('./topojson-topogl-converter.js');

function main() {
    var argv = optimist
        .options('t', {
            alias : 'topojson',
            describe : 'path to topoJSON file'
        })
        .options('p', {
            alias : 'proto',
            describe : 'path to proto file'
        })
        .options('o', {
            alias: 'output',
            describe: 'path to save the proto buffer to'
        })
        .demand(['t', 'p', 'o'])
        .argv;

    var topoJsonFilePath = argv.t,
        protoFilePath = argv.p,
        outputFilePath = argv.o;

    var topoJson = JSON.parse(fs.readFileSync(topoJsonFilePath));
    var geometryData = topoJsonTopoGlConverter.convertToGL(topoJson);

    ProtoBuf.convertFieldsToCamelCase = true;
    var builder = ProtoBuf.loadProtoFile(protoFilePath);
    var Topology = builder.build("Topology");

    var proto = new Topology();

    var features = geometryData.features.map(function(featureJson){
        return JSON.stringify(featureJson.properties);
    });
    proto.setSerializedFeatures(features);

    proto.setNumVertices(geometryData.numVertices);
    proto.setVertexPositions(geometryData.vertexPositions.buffer);
    proto.setNumTriangles(geometryData.numTriangles);
    proto.setTriangleIndices(geometryData.triangleIndices.buffer);

    var triangleBatchBoundaries = geometryData.triangleBatchBoundaries.map(function(boundaryJson){
        return new Topology.TriangleBatchBoundary(boundaryJson.triangleIndex, boundaryJson.vertexIndex);
    });
    proto.setTriangleBatchBoundaries(triangleBatchBoundaries);

    proto.setVertexHiddenStates(geometryData.vertexHiddenStates.buffer);
    proto.setVertexFeatureIndices(geometryData.vertexFeatureIndices.buffer);

    var protoBuffer = proto.encode();
    var buffer = protoBuffer.toBuffer();
    fs.writeFileSync(outputFilePath, buffer);

    console.log('successfully saved proto-buffer to', outputFilePath);
}

if (require.main === module) {
    main();
}

