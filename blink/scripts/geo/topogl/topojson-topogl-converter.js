var earcut = require('earcut');

// WebGL index buffer values can only be 16 bits wide.
/*jshint bitwise: false*/
var MAX_INDEX = (1 << 16) - 1;

function Color() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
}
Color.prototype.setHex = function (hex) {
    this.r = (hex >>> 16)/255;
    this.g = (hex >>> 8 & 0xFF)/255;
    this.b = (hex & 0xFF)/255;
};


function extractFeatures(root, objectList) {
    Object.keys(root).forEach(function(key){
        var value = root[key];
        switch (value.type) {
            case 'GeometryCollection':
                Array.prototype.push.apply(objectList, value.geometries);
                break;
            default:
                console.warn('ignoring unsupported value of type', value.type, key, value);
                break;
        }
    });
}

function iterateOnFeatureArcs(features, callback) {
    var i, j, k, arcList;

    for (i=0; i<features.length; ++i) {
        //if (features[i].properties.STATE != 'NV') {continue;}
        var feature = features[i],
            arcs = feature.arcs,
            type = feature.type;

        if (type === 'MultiPolygon') {
            for (j=0; j<arcs.length; ++j) {
                var arcListList = arcs[j];
                for (k=0; k<arcListList.length; ++k) {
                    arcList = arcListList[k];
                    callback(i, arcList);
                }
            }
        } else if (type === 'Polygon') {
            for (j=0; j<arcs.length; ++j) {
                arcList = arcs[j];
                callback(i, arcList);
            }
        } else {
            console.warn('unhandled topology type', type);
        }
    }
}

function convertToGL(topoJson) {
    var transform = topoJson.transform,
        scale = transform.scale,
        translate = transform.translate,
        numVertices, i, j;

    numVertices = 0;
    for (i=0; i<topoJson.arcs.length; ++i) {
        numVertices += topoJson.arcs[i].length;
    }

    var arcSetVertexPositions = new Float32Array(numVertices * 2),
        arcVertexRanges = new Uint32Array(topoJson.arcs.length * 2),
        runningVertexCount = 0;

    for (i=0; i<topoJson.arcs.length; ++i) {
        var arc = topoJson.arcs[i];
        arcVertexRanges[i * 2] = runningVertexCount;
        arcVertexRanges[i * 2 + 1] = arc.length;

        var x = 0,
            y = 0;

        for (j = 0; j < arc.length; ++j, ++runningVertexCount) {
            var point = arc[j],
                longitude = (x += point[0]) * scale[0] + translate[0],
                latitude = (y += point[1]) * scale[1] + translate[1];

            var offset = runningVertexCount * 2;
            arcSetVertexPositions[offset] = latitude;
            arcSetVertexPositions[offset + 1] = longitude;
        }
    }

    var features = [];
    extractFeatures(topoJson.objects, features);

    // First run through the features to count the final number
    // of vertices we'll need. This way we'll allocate data buffers
    // just once instead of allocation memory separately for each
    // vertex.

    numVertices = 0;
    // TODO (sunny): make sure one function call per
    // arc is not a perf issue, specially in the browsers
    // that don't do a very good job of in-lining function
    // calls
    iterateOnFeatureArcs(features, function(featureIndex, arcList){
        var arcListVertexCount = 0;

        for (i=0; i<arcList.length; ++i) {
            var arcIndex = arcList[i];
            if (arcIndex < 0) {
                /*jshint bitwise: false*/
                arcIndex = ~arcIndex;
            }
            var vertexRangeSize = arcVertexRanges[arcIndex * 2 + 1];
            arcListVertexCount += vertexRangeSize;
            // Each arc's first vertex is the same as the previous
            // arc's last. We remove such vertices to minimize the
            // overall number of vertices.
            if (i !== 0) {
                arcListVertexCount -= 1;
            }
        }

        /*
         We draw the 'skeleton' of the topology by creating a single geometry containing
         all the vertices along all the arcs of all the polygons of all the features.

         This lumping into one geometry is required to get an efficiency that can support
         big topologies (like US zip boundaries). The vertices in this geometry are then
         joined using lines. Threejs provides two modes of line drawing given a set of
         vertices: Strip & Pieces (loop does not seem to be supported).
         In strip mode all vertices are joined together in one single string while in pieces
         mode 1st is joined with second, third with fourth and so on.

         If we draw all these vertices as one line geometry we'll end up drawing lines between
         the last vertex of a polygon and the first vertex of the next polygon.
         For example:
         Polygon1: A->B->C, Polygon 2: D->E->F.
         Naively drawn in Strip mode this would result in A->B->C->D->E->F adding an unwanted line between
         C and D. Naively drawn in Pieces mode we'll get A->B C->D E->F which will also lose a segment.

         There are two ways to fix this:

         A: Use Pieces mode and duplicate every internal vertex in a polygon. A->B B->C D->E E->F
         B: Use Strip mode and add transparent vertices at the beginning and the end of the polygon.
         A'->A->B->C->C'->D'->D->E->F->F'. Since C and C' overlap C->C' will be invisible
         and sine C' and D' are both transparent C'->D' will be invisible.

         Another issue is that points in polygons in TopoJson don't form a closed loop. We have to
         duplicate the first point to make sure that our polygons are closed.

         Taking this into account the number of vertices required in each case:
         Strip: num_real_vertices + two transparent vertices at beginning & end + one duplicate vertex of first
         vertex to close the loop
         Pieces: num_real_vertices * 2 (every vertex is duplicated) + two transparent vertices at start and
         end.
         For num_real_vertices > 1 Strip will require fewer vertices hence we always use that mode.
         */
        numVertices += arcListVertexCount
            + /*two transparent vertices at the ends */2
            + /*first point duplicated to close the polygon*/1;
    });


    // TODO (sunny): we would ideally like boolean attributes to be
    // packed as bit arrays. This does not seem to be possible
    // right now as buffered geometry does not allow fractional
    // itemSize.
    //
    // Since we can't predict the exact number of triangles without
    // actually going through the expensive process of triangulation
    // we create a buffer large enough to always be sufficient (the
    // number of triangles in a polygon can't be bigger than the
    // the number of vertices). We'll slice to this array to the
    // correct size before sending it off to the GPU
    var vertexPositions = new Float32Array(numVertices * 3),
        triangleIndices = new Uint16Array(numVertices * 3),
        triangleBatchBoundaries = [],
        vertexFeatureIndices = new Float32Array(numVertices),
        vertexHiddenStates = new Float32Array(numVertices),
        vertexIndex = 0,
        numTriangles = 0;

    function processVertexAtIndex(vertexIndexInArcs, featureIndex) {
        var offset = vertexIndexInArcs * 2,
            latitude = arcSetVertexPositions[offset],
            longitude = arcSetVertexPositions[offset + 1];

        offset = vertexIndex * 3;
        vertexPositions[offset] = latitude;
        vertexPositions[offset + 1] = longitude;
        vertexPositions[offset + 2] = 0.0;

        vertexFeatureIndices[vertexIndex] = featureIndex;
        vertexIndex++;
    }

    iterateOnFeatureArcs(features, function(featureIndex, arcList){
        var firstVertexIndex = vertexIndex;


        for (i=0; i<arcList.length; ++i) {
            var arcIndex = arcList[i],
                reversed = arcIndex < 0;
            if (arcIndex < 0) {
                arcIndex = ~arcIndex;
            }

            var vertexRangeStart = arcVertexRanges[arcIndex * 2],
                vertexRangeSize = arcVertexRanges[arcIndex * 2 + 1],
                vertexRangeEnd = vertexRangeStart + vertexRangeSize;

            if (!reversed) {
                // the first vertex of non-first arc is already
                // the last vertex of the previous arc in the
                // same polygon
                if (i !== 0) {
                    vertexRangeStart++;
                }
                for (j=vertexRangeStart; j<vertexRangeEnd; ++j) {
                    processVertexAtIndex(j, featureIndex);

                    // add a transparent copy of the first vertex
                    // of the first arc at the beginning
                    // we do this by making transparent the one that
                    // we already added and re-adding the colored copy
                    // of it.
                    if (i === 0 && j === vertexRangeStart && vertexIndex === firstVertexIndex + 1) {
                        vertexHiddenStates[vertexIndex - 1] = 1;
                        --j;
                    }
                }
            } else {
                // the first vertex of non-first arc is already
                // the last vertex of the previous arc in the
                // same polygon
                if (i !== 0) {
                    vertexRangeEnd--;
                }
                for (j=vertexRangeEnd - 1; j>=vertexRangeStart; --j) {
                    processVertexAtIndex(j, featureIndex);

                    // add a transparent copy of the first vertex
                    // of the first arc at the beginning
                    // we do this by making transparent the one that
                    // we already added and re-adding the colored copy
                    // of it.
                    if (i === 0 && j === vertexRangeEnd - 1 && vertexIndex === firstVertexIndex + 1) {
                        vertexHiddenStates[vertexIndex - 1] = 1;
                        ++j;
                    }
                }
            }
        }

        // add two copies of the first point at the end. one to close the loop and another
        // transparent one to work with LineStrip configuration as explained above
        for (i=0; i<2; ++i) {
            var offsetDestination = vertexIndex * 3,
                offsetSource = firstVertexIndex * 3;
            vertexPositions[offsetDestination] = vertexPositions[offsetSource];
            vertexPositions[offsetDestination + 1] = vertexPositions[offsetSource + 1];
            vertexPositions[offsetDestination + 2] = vertexPositions[offsetSource + 2];

            vertexFeatureIndices[vertexIndex] = featureIndex;

            if (i === 1) {
                // the second one is transparent
                vertexHiddenStates[vertexIndex] = 1;
            }

            vertexIndex++;
        }

        // WebGL does not allow indices to be greater than 16 bits which means we can't have entries
        // in the indices array greater than 2^16 -1 = 65535. As a workaround we store only
        // triangle_vertex_index%65535 in the indices array and store the info to allow us to get back
        // triangle_vertex_index/65535 separately.
        //
        // Since the vertex indices increase monotonically with each feature, we detect the points at which
        // we have crossed a multiple of 65535. We store this in triangleBatchBoundaries and
        // use the offsets property of BufferGeometry to draw the triangles in batches.
        //
        // More detailed explanation:
        //
        // Some browsers (guess which one!) support only 16 bits for indices of vertices of
        // triangles. This means in one draw call we can't have triangle made of up of more than
        // 65535 *distinct* vertices. To work around this big geometries are drawn in batches
        // small enough so that no single batch has more than 65535 distinct indices.
        // The way to do it in THREE.js is to set an array of offset descriptors on the geometry that
        // we want to draw in batch, each descriptor specifying how to draw each batch. Each descriptor
        // has three properties:
        // start: the index of the first triangle in this batch. the index is in the array of all triangles
        //        defining the geometry
        // count: the number of triangles we want to be drawn in this batch. the number should be small enough
        //        so that the set of distinct vertices in the batch is of size <= 65535
        // index: the offset to be applied to each vertex's index of each triangle in this batch (see example
        //        below)
        //
        // Example: for simplicity assume batch size limit is 4
        //
        // vertices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        // triangles: [0,1,2 1,2,3 4,5,6 5,6,7 7,8,9]
        //
        // Since triangle vertex indices can't hold values > 4 we'll save them as
        // originalVertexIndex - batchSpecificOffset
        //
        // first batch: [0,1,2 1,2,3] => [0,1,2 1,2,3]
        // second batch: [4,5,6 5,6,7] => [0,1,2 1,2,3] (-4 each)
        // third batch: [7,8,9] => [0,1,2] (-7 each)
        //
        // triangles indices array: [0,1,2 1,2,3 0,1,2 1,2,3 0,1,2]
        //
        // offsets passed on to THREE.js:
        // first: {start: 0, count: 2, offset: 0}
        // second: {start: 2, count: 2, offset: 4}
        // third: {start: 4, count: 1, offset: 7}
        //
        // Note that the code below uses the fact that our vertex indices increase monotonically.
        // Things would get a bit more involved if that were not true.
        // It also assumes that one sphere does not add more than 65535 vertices.

        // if this is the first set of triangles or if adding this batch to the previous one
        // would breach the threshold, create a new batch

        if (numTriangles === 0 ||
            Math.floor(firstVertexIndex/MAX_INDEX) != Math.floor((vertexIndex - 1)/MAX_INDEX))
        {
            triangleBatchBoundaries.push({
                triangleIndex: numTriangles,
                vertexIndex: firstVertexIndex
            });
        }

        // coordinates of the vertices of this polygon
        var polygonVertices = vertexPositions.subarray(firstVertexIndex * 3, vertexIndex * 3);
        // the triangles are specified as v11, v12, v13, v21, v22, v33 where vij is the index of the jth
        // vertex of the ith triangle in polygonVertices.
        // TODO (sunny): in offline mode evaluate use of more accurate but slower triangulators
        var triangles = earcut(polygonVertices, null, 3);

        if (triangles.length/3 > (vertexIndex - firstVertexIndex)) {
            console.error('the number of triangles can\'t be more than the number of vertices');
            return;
        }


        var batchStartVertexIndex = triangleBatchBoundaries[triangleBatchBoundaries.length - 1].vertexIndex;
        for (i=0; i<triangles.length; i+=3) {
            var triangleOffset = (numTriangles++) * 3,
                vertexOffset = firstVertexIndex;
            triangleIndices[triangleOffset] = triangles[i] + vertexOffset - batchStartVertexIndex;
            triangleIndices[triangleOffset + 1] = triangles[i + 1] + vertexOffset - batchStartVertexIndex;
            triangleIndices[triangleOffset + 2] = triangles[i + 2] + vertexOffset - batchStartVertexIndex;
        }
    });

    triangleIndices = triangleIndices.subarray(0, numTriangles * 3);

    return {
        features: features,
        numVertices: numVertices,
        vertexPositions: vertexPositions,
        numTriangles: numTriangles,
        triangleIndices: triangleIndices,
        triangleBatchBoundaries: triangleBatchBoundaries,
        vertexHiddenStates: vertexHiddenStates,
        vertexFeatureIndices: vertexFeatureIndices
    };
}

module.exports = {
    convertToGL: convertToGL
};