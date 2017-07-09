/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  Service that take care of the creation of graph for well-known sets of data
 *
 */

'use strict';

import {Provide} from '../../../../../base/decorators';
import {BKSchema} from '../../schema-fetcher/schema-model';
import FullSchemaGraphModel from '../full-schema-graph-model';
import WorksheetGraphModel from '../worksheet-graph-model';
import {
    getMasterVertexForWKS,
    getVertexForTable,
    getVertexForTableForWKSViewer,
    WKSColumnsVertex } from './vertex-factory-service';


/**
 * Helper Objects that holds informations used for
 * creating worksheet-graph vertices
 *
 * @params tableItem - Table Model
 * @colums columns - Column Ids that appears in the worksheet
 *
 * @constructor
 */
class VertexDefinition {
    public constructor(public table: any, public columnIds: string[] = []) {}
    public addColumnIdPartOfWorksheet(columnId) {
        this.columnIds.push(columnId);
    }
}

export function buildFullSchemaGraphForSchema(schema: BKSchema) {

    let vertices = schema.tables.map((table) => getVertexForTable(table));
    let graph = new FullSchemaGraphModel(vertices);

    schema.tables.forEach((table) => {
        table.getRelationShips()
            .forEach((relationShip) => graph.addEdge(relationShip));
    });

    return graph;
}

export function buildGraphForWorksheet(schema: BKSchema, worksheetModel) {

    let worksheetSchemaGroupId = worksheetModel.getId();

    let tableIdToVertexDefinitions = {},
        joinsIdsMap = {},
        wksColumnTable = [],
        wksColumnEdges = [],
        targets;

    // we add the worksheet itself
    tableIdToVertexDefinitions[worksheetSchemaGroupId] =
        new VertexDefinition(schema.resolver.findTableById(worksheetSchemaGroupId));

    // collect all the sources tables involved and all join paths
    worksheetModel.getColumns().forEach((column) => {
        let sources = column.getSources(),
            traversals = [];


        if (!column.isFormula()) {
            let id = sources[0].tableId;
            let columnId = sources[0].columnId;

            if (!tableIdToVertexDefinitions[id]) {
                tableIdToVertexDefinitions[id] = new VertexDefinition(
                    schema.resolver.findTableById(id),
                    [columnId]
                );
            } else {
                tableIdToVertexDefinitions[id].addColumnIdPartOfWorksheet(columnId);
            }
            let originInfo = column.getOriginInfo();
            let joinPaths = originInfo.joinPaths;

            joinPaths.forEach((joinPath) => {
                let joins = joinPath.joins;
                if (!!joins && joins.length > 0) {
                    let traversal = [];
                    joins.forEach((join) => {
                        let joinItem = schema.resolver.findJoinById(join.header.id);

                        if (!joinItem) {
                            return;
                        }
                        let sourceTableId = joinItem.getSourceTableId(),
                            destinationTableId = joinItem.getDestinationTableId();
                        // for each join path, we check if sources/destinations table
                        // have been added and add them if needed: there can be a table
                        // that have no columns belonging to the WK, such a table is part
                        // of a join path. This table will have a lighter header in the
                        // worksheet viewer
                        ensureTableIsAdded(destinationTableId);
                        ensureTableIsAdded(sourceTableId);
                        let joinId = join.header.id;
                        joinsIdsMap[joinId] = true;
                        traversal.push(joinId);
                    });
                    traversals.push(traversal);
                }
            });
        } else {
            // we do not care about formula join path for now, we just add the
            // source table of a formula if it is not already in the graph
            sources.forEach((source) => {
                let tableId = source.tableId;
                let columnId = sources.columnId;
                ensureTableIsAdded(tableId);
                tableIdToVertexDefinitions[tableId].addColumnIdPartOfWorksheet(columnId);
            });
        }
        targets = sources.map((source) => schema.resolver.findColumnById(source.columnId));
        column.targets = targets;
        column.traversals = traversals;
        wksColumnTable.add(column);
    });

    function ensureTableIsAdded(id: string) {
        if (!tableIdToVertexDefinitions[id]) {
            tableIdToVertexDefinitions[id] = new VertexDefinition(
                schema.resolver.findTableById(id),
                []
            );
        }
    }

    // for all the table involved, create a vertex
    let vertices = Object.keys(tableIdToVertexDefinitions).map((id) => {
        let value: VertexDefinition = tableIdToVertexDefinitions[id];
        if (id === worksheetSchemaGroupId) {
            return getMasterVertexForWKS(value.table);
        } else {
            return getVertexForTableForWKSViewer(
                value.table,
                value.columnIds
            );
        }
    });

    // create the vertex that holds the column of the WK
    // and add invisible edges to the source columns
    // these invisible edges are used to make a digraph layout
    if (wksColumnTable.length > 0) {
        let wksColumnsTable = new WKSColumnsVertex(wksColumnTable);
        //TODO(chab) fix the tooltip
        wksColumnsTable.htmlToolTip = worksheetModel.getTooltipInformationModel().getTemplate();
        vertices.push(wksColumnsTable);
        wksColumnTable.forEach((wksColumn) => {
            let sources = wksColumn.getSources();
            sources.forEach(function(source){
                let columnId =  source.columnId;
                let sourceId = wksColumn.getGuid();
                let targetColumn = schema.resolver.findColumnById(columnId);
                wksColumnEdges.push({
                    target: targetColumn,
                    sourcePort: sourceId,
                    name: wksColumn.getName()
                });
            });
        });
    }

    let graph: WorksheetGraphModel = new WorksheetGraphModel(vertices,
        worksheetSchemaGroupId,
        worksheetModel.getQueryJoinType());
    // add relationships that are only inside the worksheets
    vertices.forEach((vertex) => {
        if (vertex instanceof (WKSColumnsVertex) ||
            !vertex.data.getRelationShips ||
            vertex._id === worksheetSchemaGroupId) {
            return;
        }
        let relationships = vertex.data.getRelationShips();
        relationships.forEach((joinItem) => {
            if (tableIdToVertexDefinitions[joinItem.getDestinationTableId()]) {
                let edge = graph.addEdge(joinItem);
                // do not displayed non used join
                if (!joinsIdsMap[joinItem.getId()]) {
                    edge.opacity = 0.0; // we keep the join visible for the layout
                }
            }
        });
    });
    // add the formula edges
    // these edges are used to help finding targeted columns
    wksColumnEdges.forEach((wksEdge) => graph.addFormulaEdge(wksEdge));
    return graph;
}

Provide('graphFactoryService') ({
    buildFullSchemaGraphForSchema,
    buildGraphForWorksheet
});
