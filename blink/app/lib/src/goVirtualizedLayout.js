/**
 * Copyright:  NorthWoodSoftware // ThoughtSpot Inc. 2016
 * Author: NorthWoodSoftware / Francois Chabbey
 * @fileoverview This layout holds a model that contains all
 * the nodes/edges of the diagram. When the viewport changes,
 * the model of the diagram is updated with the nodes/edges
 * that are in the viewport.
 *
 * This layout holds only the data of the nodes/edges, it does
 * not any graphical representation; the only graphical property
 * it holds is the "bounds" property. This allows the layout to
 * execute itself correctly. There is a 2-way binding to this property,
 * so when the user moves a table, the property is updated. This
 * allows the model to be in a consistent state after some user manipulation
 *
 * Every seconds, the diagram model is cleaned from the elements
 * that are not in the viewport anymore.
 *
 * Note that we still need to iterate over all the elements, but
 * we draw only what is needed on the canvas.
 *
 * Note that this virtualized introduces more complexity, we need to
 * use our own overview for the diagram, and if the user selects a node
 * that is node displayed, we need to center the diagram to this node,
 * and then the node would be availabe for selection...
 *
 *
 */

var VIRTUALIZATION_OFFSET = 100;

function VirtualizedForceDirectedLayout() {
    go.ForceDirectedLayout.call(this);
    this.isOngoing = false;
    this.model = null;  // add this property for holding the whole GraphLinksModel
}
go.Diagram.inherit(VirtualizedForceDirectedLayout, go.ForceDirectedLayout);

/** @override */
VirtualizedForceDirectedLayout.prototype.createNetwork = function() {
    return new VirtualizedForceDirectedNetwork();  // defined below
};

// ignore the argument, an (implicit) collection of Parts
/** @override */
VirtualizedForceDirectedLayout.prototype.makeNetwork = function(coll) {
    var net = this.createNetwork();
    net.addData(this.model);  // use the model data, not any actual Nodes and Links
    return net;
};

/** @override */
VirtualizedForceDirectedLayout.prototype.commitLayout = function() {
    go.ForceDirectedLayout.prototype.commitLayout.call(this);
    // can't depend on regular bounds computation that depends on all Nodes existing
    this.diagram.fixedBounds = computeDocumentBounds(this.model);
    // update the positions of any existing Nodes
    this.diagram.nodes.each(function(node) {
        node.updateTargetBindings();
    });
};

// The VirtualizedForceDirectedNetwork holds only the data for a give node
// The trick is that we do not need all the information that a standard
// layout node holds, as we do not display these nodes.
// the only things that we need is the "bounds" property. The 2-way bindings
// ensure that this propery is updated when the user manipulates the node
function VirtualizedForceDirectedNetwork() {
    go.ForceDirectedNetwork.call(this);
}
go.Diagram.inherit(VirtualizedForceDirectedNetwork, go.ForceDirectedNetwork);

VirtualizedForceDirectedNetwork.prototype.addData = function(model) {
    if (model instanceof go.GraphLinksModel) {
        var dataVertexMap = new go.Map();
        // create a vertex for each node data
        var ndata = model.nodeDataArray;
        for (var i = 0; i < ndata.length; i++) {
            var data = ndata[i];
            var vertex = this.createVertex();
            vertex.data = data;  // associate this Vertex with data, not a Node
            dataVertexMap.add(model.getKeyForNodeData(data), vertex);
            this.addVertex(vertex);
        }
        // create an edge for each link data
        var ldata = model.linkDataArray;
        for (var i = 0; i < ldata.length; i++) {
            var data = ldata[i];
            // now find corresponding vertexes
            var from = dataVertexMap.getValue(model.getFromKeyForLinkData(data));
            var to = dataVertexMap.getValue(model.getToKeyForLinkData(data));
            if (from === null || to === null) continue;  // skip
            // create and add VirtualizedForceDirectedEdge
            var edge = this.createEdge();
            edge.data = data;  // associate this Edge with data, not a Link
            edge.fromVertex = from;
            edge.toVertex = to;
            this.addEdge(edge);
        }
    } else {
        throw new Error("can only handle GraphLinksModel data");
    }
};

/** @override */
VirtualizedForceDirectedNetwork.prototype.deleteArtificialVertexes = function() { };


/**
 * This computes the bounds of the displayed model
 * This will takes into account node that are offscreen
 * (e.g. when a node is on the other side of a link)
 *
 * @param {go.Model} model
 * @returns {go.Rect}
 */
function computeDocumentBounds(model) {
    var documentBound = new go.Rect();
    var ndata = model.nodeDataArray;
    for (var i = 0; i < ndata.length; i++) {
        var data = ndata[i];
        if (!data.bounds) continue;
        if (i === 0) {
            documentBound.set(data.bounds);
        } else {
            documentBound.unionRect(data.bounds);
        }
    }
    documentBound.width = documentBound.width + VIRTUALIZATION_OFFSET;
    documentBound.height = documentBound.height + VIRTUALIZATION_OFFSET;
    documentBound.x = documentBound.x - VIRTUALIZATION_OFFSET;
    documentBound.y = documentBound.y - VIRTUALIZATION_OFFSET;
    return documentBound;
}