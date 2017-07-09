/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Vertex Model
 *
 */

'use strict';

import {Provide} from '../../../../base/decorators';
import Edge from './edge-model';

@Provide('Vertex')
export default class Vertex {

    /**
     *
     * @param data - opaque data
     * @param id - id of a given vertex
     * @param adjacencyList
     */
    public constructor(readonly data: any,
                       readonly id: string,
                       private adjacencyList: Edge[] = []) {}

    public getEdges(filteredEdge:boolean, filterFunction?: (edge:Edge) => boolean): Edge[] {
        if (filteredEdge) {
            return this.adjacencyList.filter(filterFunction);
        }
        return this.adjacencyList;
    }

    public addEdge(edge: Edge): void {
        this.adjacencyList.push(edge);
    }
}
