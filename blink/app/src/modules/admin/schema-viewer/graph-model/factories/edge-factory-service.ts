/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview  This service converts a join to the appropriate edge
 */

'use strict';

import {ngRequire} from '../../../../../base/decorators';
import {jsonConstants} from '../../../../viz-layout/answer/json-constants';
import {JoinItem} from '../../schema-fetcher/schema-model';
import Edge from '../edge-model';

let schemaTemplatesService = ngRequire('schemaTemplatesService');
let Logger = ngRequire('Logger');
let joinType = jsonConstants.queryJoinType;


/**
 * This class exposes properties used by the template
 *
 */
export class FullSchemaEdge extends Edge {
    public text: string;
    public name: string;
    public from: string;
    public to: string;
    public htmlToolTip: any;
    public color: string;
    public opacity: number;
    public visible: boolean = true;
}

class FullSchemaEdgeJoin extends FullSchemaEdge {

    public sourceColumns: any[];
    public destinationColumns: any[];

    public constructor(join) {
        super(
            join.getSourceTable(),
            join.getDestinationTable(),
            join
        );
        this.text = join.getName();
        // exposes graph property at top level
        this.from = join.getSourceTable().getId();
        this.to = join.getDestinationTable().getId();
        this.htmlToolTip = join.getTooltip();
        this.sourceColumns = join.getRelationShips().getSourceColumns();
        this.destinationColumns = join.getRelationShips().getDestinationColumns();
    }
}

class FullSchemaGenericJoinEdge extends FullSchemaEdgeJoin {
    public constructor(join: JoinItem) {
        super(join);
        this.color = schemaTemplatesService.canvasStyle.fullSchema.genericJoinColor;
    }
}

class FullSchemaSystemJoinEdge extends FullSchemaEdgeJoin {
    public constructor(join: JoinItem) {
        super(join);
        this.color = schemaTemplatesService.canvasStyle.fullSchema.pkfkJoinColor;
    }
}

class FullSchemaUserJoinEdge extends FullSchemaEdgeJoin {
    public constructor(join: JoinItem) {
        super(join);
        this.color = schemaTemplatesService.canvasStyle.fullSchema.userDefinedJoinColor;
    }
}

/**
 *
 * @param join
 * @param override - in case of worksheet, all joins are determinted by the rules chosen b
 * by the user
 * @returns {*}
 */
function determinePictureForJoin(join: JoinItem, override: string) {
    let type = !!override ? override : join.getJoinType();
    switch (type) {
        case joinType.INNER:
            return schemaTemplatesService.canvasStyle.fullSchema.innerJoinPicture;
        case joinType.LEFT_OUTER:
            return schemaTemplatesService.canvasStyle.fullSchema.leftJoinPicture;
        case joinType.RIGHT_OUTER:
            return schemaTemplatesService.canvasStyle.fullSchema.rightJoinPicture;
        case joinType.FULL_OUTER:
            return schemaTemplatesService.canvasStyle.fullSchema.outerJoinPicture;
    }
}

/**
 *
 * @param {JoinItem} join
 * @param {string} override
 * @returns {*}
 */
export default function getEdgeForJoin(join: JoinItem, override?: string): FullSchemaEdgeJoin {
    let _logger = Logger.create('graph-factory');
    let edge;
    switch (join.getType()) {
        case jsonConstants.relationshipMetadataType.GENERIC:
            edge = new FullSchemaGenericJoinEdge(join);
            break;
        case jsonConstants.relationshipMetadataType.USER_DEFINED:
            edge = new FullSchemaUserJoinEdge(join);
            break;
        case jsonConstants.relationshipMetadataType.SYSTEM_RELATIONSHIP:
            edge = new FullSchemaSystemJoinEdge(join);
            break;
        default:
            _logger.error('Bad join type', join.getType());
            return null;
    }
    edge.joinPictureSource = determinePictureForJoin(join, override);
    return edge;
}
