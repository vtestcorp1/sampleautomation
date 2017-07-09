/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This graph class is designed to hold a
 * representation of the full schema
 *
 */

'use strict';

import {JoinItem} from '../schema-fetcher/schema-model';
import getEdgeForJoin from './factories/edge-factory-service';
import {FullSchemaEdge} from './factories/edge-factory-service';
import GraphModel from './graph-model';
import Vertex from './vertex-model';

export default class FullSchemaGraphModel extends GraphModel {
    public constructor(vertices: Vertex[]) {
        super(vertices);
    }

    public addEdge(join: JoinItem, override?: string): FullSchemaEdge {
        if (!join) {
            this.logger.error('No join passed');
            throw new Error('No join passed while adding edge to schema');
        }

        if (!join.getSourceTable()) {
            this.logger.error('missing source table', join.getSourceTableId());
            return;
        }
        if (!join.getDestinationTable()) {
            this.logger.error('missing destination table', join.getDestinationTableId());
            return;
        }

        let sourceVertexId = join.getSourceTableId();
        let destinationVertexId = join.getDestinationTableId();
        let edge = getEdgeForJoin(join, override);
        this.addEdgeToGraph(edge, sourceVertexId, destinationVertexId, false);

        return edge;
    }

    public getVertices(filterDeletedItem?: boolean): Vertex[] {
        let vertices = super.getVertices();

        if (!filterDeletedItem) {
            return super.getVertices();
        }
        return vertices.filter(function(vertex) {
            return !vertex.data.isDeleted();
        });
    }
}

