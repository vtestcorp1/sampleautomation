/**
* Copyright: ThoughtSpot Inc. 2016
* Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
*
* @fileoverview Graph Model
*
* See GraphModel constructor for more details
*
* The GraphModel is not supposed to be used directly. You used the graphBuilder service
* which is responsible for choosing the right GraphModel subclass
*
* Subclasses of graphModel knows about the type of data the graph holds, and augment
* their edges and vertices with fields that will be used during the rendering of the graph
*
*/

'use strict';

import {ngRequire, Provide} from '../../../../base/decorators';
import Edge from './edge-model';
import Vertex from './vertex-model';

let Logger = ngRequire('Logger');
let util = ngRequire('util');

//Note(chab) we use Provide for unit-testing
@Provide('GraphModel')
export default class GraphModel {

    /**
     *
     * This class represents a directed graph. Parallel edge and self-loop are permitted.
     * Vertices are stored in a map and contains an array of their edges
     *
     * The graph is constructed by providing an array of vertices
     *
     * You then use the addEdge to add an edge to the graph.
     * Vertices and edges hold can arbitrary data objects
     *
     */

    protected nVertices: number;
    protected logger: any;
    private nEdges: number;
    private verticesMap: {[index: string]: Vertex};

    public constructor(vertices: Vertex[]) {

        this.nVertices = vertices.length;
        this.nEdges = 0;
        this.logger = Logger.create('Graph-model');
        this.verticesMap = util.mapArrayToHash(vertices, function (vertex) {
            return vertex.id;
        });
    }

    /**
     *
     * @param {Vertex} vertex
     * @return GraphModel

     */
    public addVertex(vertex: Vertex) {

        let vertexId = vertex.id;

        if (this.verticesMap[vertexId]) {
            this.logger.error('Vertex ' + vertexId + 'already exists');
            return null;
        }
        this.verticesMap[vertexId] = vertex;
        this.nVertices++;

        return this;
    }

    public getNumberOfEdges(): number {
        return this.nEdges;
    }

    public getNumberOfVertices = function () {
        return this.nVertices;
    };

    public getVertex(id: string): Vertex {
        return this.verticesMap[id];
    }

    public getVertices(): Vertex[] {
        return Object.values(this.verticesMap) as Vertex[];
    }

    /**
     *
     * Add an edge to the graph.
     * Returns null if source or destination does not exist
     *
     * The base implementation is forgiving in the sense that it tolerates dangling
     * edge ( edge that have no target..)
     *
     * @param {*} data
     * @param sourceVertex  Source vertex id
     * @param destinationVertex    Destination vertex id
     * @param throwsOnDanglingEdge if true, raise an exception when an edge is dangling
     *
     * @returns {Edge}
     */
    public addEdge(data, sourceVertexId, destinationVertexId, throwsOnDanglingEdge = false) {
        if (!data) {
            this.logger.error('No model passed');
            return null;
        }

        let sourceVertex = this.verticesMap[sourceVertexId];
        let destinationVertex = this.verticesMap[destinationVertexId];

        let edge = new Edge(sourceVertex, destinationVertex, data);
        return this.addEdgeToGraph(edge,
            sourceVertexId,
            destinationVertexId,
            throwsOnDanglingEdge);
    }

    protected addEdgeToGraph(edge: Edge,
                             sourceVertexId: string,
                             destinationVertexId: string,
                             throwsOnDanglingEdge: boolean) {

        let sourceVertex = this.verticesMap[sourceVertexId];
        let destinationVertex = this.verticesMap[destinationVertexId];

        if (!sourceVertex) {
            let err = `Source vertex ${sourceVertexId} does not belong to graph`;
            this.logger.error(err);
            return null;
        }
        edge.sourceVertex = sourceVertex;

        // we tolerate dangling edges
        if (!destinationVertex) {
            let err = `Destination vertex ${destinationVertexId} does not belong to graph`;
            if (throwsOnDanglingEdge) {
                this.logger(err);
            }
            this.logger.warn(err);
            edge.isDangling = true;
        } else {
            edge.destinationVertex = destinationVertex;
        }
        this.nEdges++;
        sourceVertex.addEdge(edge);
        return edge;
    }
}



