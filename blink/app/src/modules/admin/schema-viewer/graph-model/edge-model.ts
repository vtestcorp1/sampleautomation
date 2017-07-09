/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Chabbey Francois (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Vertex Model
 *
 */

import  Vertex from './vertex-model';

export default class Edge {
    // TODO(chab) make vertex read-only or private
    // graph classes needs to reassign those properties due to the current design
    public constructor(public sourceVertex: Vertex,
                       public destinationVertex: Vertex,
                       readonly data,
                       public isDangling: boolean = false) { }
}


