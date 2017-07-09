/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Worksheet Graph Model
 *
 */
'use strict';

import {strings} from '../../../../base/strings';
import {FullSchemaEdge} from './factories/edge-factory-service';
import FullSchemaGraphModel from './full-schema-graph-model';
import Vertex from './vertex-model';

export default class WorksheetGraphModel extends FullSchemaGraphModel {

    public constructor(vertices: Vertex[],
                       protected keyGroupId: string,
                       protected joinType: string) {

        super(vertices);
        //TODO(chab) we have to make nVertices protected and use this dirty hack
        // this is due to the fact that we have this notion of master 'vertex'
        // but this is more an implementation detail that something we want to expose
        // so we need to try to MAKE nVertices PRIVATE and do not do this trick
        this.nVertices++;
    }

    public addFormulaEdge(formula) {
        let destinationVertexId = formula.target.getSourceTableId();
        let sourceVertex = this.getVertex(strings.schemaViewer.WKS_COLUMNS_TABLE_KEY);
        let destinationVertex = this.getVertex(destinationVertexId);

        if (!destinationVertex) {
            this.logger.error('Destination vertex '
                + destinationVertexId
                + ' does not belong to graph');
            return null;
        }

        let edge  = new FormulaEdge(formula, sourceVertex, destinationVertex);
        edge.from = strings.schemaViewer.WKS_COLUMNS_TABLE_KEY;
        edge.fromPort = formula.sourcePort;
        edge.to = destinationVertexId;
        edge.toPort = formula.target;
        //TODO(chab) get rid of that once worksheet-controller is in typescript
        edge.type = 'FORMULALINK';
        edge.visible = true;
        edge.opacity = 0;
        edge.text = formula.name;
        edge.selectable = false;
        return this.addEdgeToGraph(edge, edge.from, edge.to, false);
    }

    public addEdge(join) {
        let edge: FullSchemaEdge = super.addEdge(join, this.joinType);
        let sourceVertexId = join.getSourceTableId();
        let destinationVertexId = join.getDestinationTableId();
        // if edge points or originates from the worksheet, assign it to the group
        if (sourceVertexId === this.keyGroupId) {
            edge.from = strings.schemaViewer.WKS_GROUP_KEY;
        }
        if (destinationVertexId === this.keyGroupId) {
            edge.to = strings.schemaViewer.WKS_GROUP_KEY;
        }
        return edge;
    }
}


class FormulaEdge extends FullSchemaEdge {
    public fromPort: string;
    public toPort: string;
    public type: string;
    public selectable: boolean;
}
