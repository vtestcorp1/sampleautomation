/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This service provides a virtualized graph viewer
 *
 * A virtualized graph viewer manages two models. One model is hold by the layout
 * of the graph, and hold all the datas. The other model hold the
 * nodes and links that are display on the screen. This allows to make a
 * constant a number of calls when we render elements on the canvas
 *
 */
'use strict';

blink.app.factory('VirtualizedGraphViewerController', ['$timeout',
    'BaseGraphViewerController',
    'schemaTemplatesService',
    'strings',
    'util',
    function($timeout,
    BaseGraphViewerController,
    schemaTemplatesService,
    strings,
    util) {

        var myRemoveTimer;
        var TIMER_DELAY = 1000;
        var _$ = go.GraphObject.make;
        var goGraphMaker = go.GraphObject.make;

        function VirtualizedSchemaGraphViewerController(graph,
                                             onGraphRendered,
                                             onElementSelected) {

            VirtualizedSchemaGraphViewerController.__super.call(
            this,
            graph,
            onGraphRendered,
            onElementSelected
        );
            this.strings = strings;
        }

        util.inherits(VirtualizedSchemaGraphViewerController, BaseGraphViewerController);



    /**
     * This remove the offscreen nodes/links from
     * the model of a diagram
     *
     * @param {go.Diagram} diagram
     */
        function removeOffscreen(diagram) {
            myRemoveTimer = null;

            var viewb = diagram.viewportBounds;
            var model = diagram.model;
            var remove = [];  // collect for later removal
            var removeLinks = new go.Set();  // links connected to a node data to remove
            var it = diagram.nodes;

            function checkIfLinkIntersectViewBounds(link) {
                return link.actualBounds.intersectsRect(viewb);
            }

            while (it.next()) {
                var node = it.value;
                var data = node.data;
                if (data === null) {
                    continue;
                }
                if (!node.actualBounds.intersectsRect(viewb) && !node.isSelected) {
                // even if the node is out of the viewport, keep it if it is selected or
                // if any link connecting with the node is still in the viewport
                    if (!node.linksConnected.any(checkIfLinkIntersectViewBounds)) {
                        remove.push(data);
                        if (model instanceof go.GraphLinksModel) {
                            removeLinks.addAll(node.linksConnected);
                        }
                    }
                }
            }

            if (remove.length > 0) {
                var oldskips = diagram.skipsUndoManager;
                diagram.skipsUndoManager = true;
                model.removeNodeDataCollection(remove);
                if (model instanceof go.GraphLinksModel) {
                    removeLinks.each(function (link) {
                        if (!link.isSelected) {
                            model.removeLinkData(link.data);
                        }
                    });
                }
                diagram.skipsUndoManager = oldskips;
            }
        }

    // As the user scrolls or zooms, make sure the Parts (Nodes and Links) exist in the viewport.
        var onViewportChanged = function(e) {

            var diagram = e.diagram;
        // make sure there are Nodes for each node data that is in the viewport
        // or that is connected to such a Node
            var viewb = diagram.viewportBounds;  // the new viewportBounds
        // make a non read-only copy
            var rect = new go.Rect(viewb.x, viewb.y, viewb.width, viewb.height);

            var model = diagram.model;
            var overviewDiagram = this.overviewDiagram;
            var data = overviewDiagram.model.findNodeDataForKey("VIEWPORT");
            var node =   overviewDiagram.findNodeForKey("VIEWPORT");
            overviewDiagram.model.setDataProperty(data, "bounds", rect);
            node.updateTargetBindings();     // why, i thought diagram will update by itself ??


            var oldskips = diagram.skipsUndoManager;
            diagram.skipsUndoManager = true;

            var b = new go.Rect();

            var wholeModel = diagram.layout.model;
            var ndata = wholeModel.nodeDataArray;
            for (var j = 0; j < ndata.length; j++) {
                var n = ndata[j];
                if (!n.bounds) {
                    continue;
                }
                if (n.bounds.intersectsRect(viewb)) {
                    model.addNodeData(n);
                }
            }

            if (model instanceof go.GraphLinksModel) {

                var ldata = wholeModel.linkDataArray;
                for (var i = 0; i < ldata.length; i++) {
                    var l = ldata[i];
                    var fromkey = wholeModel.getFromKeyForLinkData(l);
                    if (fromkey === undefined) {
                        continue;
                    }
                    var from = wholeModel.findNodeDataForKey(fromkey);
                    if (from === null || !from.bounds) {
                        continue;
                    }

                    var tokey = wholeModel.getToKeyForLinkData(l);
                    if (tokey === undefined) {
                        continue;
                    }
                    var to = wholeModel.findNodeDataForKey(tokey);
                    if (to === null || !to.bounds) {
                        continue;
                    }

                    b.set(from.bounds);
                    b.unionRect(to.bounds);
                    if (b.intersectsRect(viewb)) {
                    // also make sure both connected nodes are present,
                    // so that link routing is authentic
                        model.addNodeData(from);
                        model.addNodeData(to);
                        model.addLinkData(l);
                        var link = diagram.findLinkForData(l);
                        if (link !== null) {
                        // do this now to avoid delayed routing outside of transaction
                            link.fromNode.ensureBounds();
                            link.toNode.ensureBounds();
                            link.updateRoute();
                        }
                    }
                }
            }

            diagram.skipsUndoManager = oldskips;

        //Note(chab) We could use myRemoveTimer.$$state.status == 1, but it's supposed to be
        // a private of angular
            if (!myRemoveTimer) {
            // only remove offscreen nodes after a delay
                myRemoveTimer = $timeout(function() { removeOffscreen(diagram); },
                TIMER_DELAY,
                false); // angular do not care about our virtualized layout
            }
        };

        VirtualizedSchemaGraphViewerController.prototype.setupDiagram = function() {
            VirtualizedSchemaGraphViewerController.__super.prototype.setupDiagram.call(this);
        };

        VirtualizedSchemaGraphViewerController.prototype.setupModel = function() {
            this.diagram.model =   // this only holds nodes that should be in the viewport
            _$(go.GraphLinksModel);  // must match the model, above

            this.diagram.model.addNodeData({
                key: "ZoomGroup",
                isGroup: true
            });
        };


        VirtualizedSchemaGraphViewerController.prototype.setupLayout = function() {
            var diagram = this.diagram;
            var nodes = this.graph.getVertices(true);
            var edges = [];

            nodes.each(function(node) {
            // we do not display deleted edges
                edges = edges.concat(node.getEdges(true));
                node.bounds = new go.Rect(0, 0, 300, 500);
                node.category = 'table';
            });

            var myWholeModel = _$(go.GraphLinksModel);  // must match the model used by the Diagram, below
            myWholeModel.nodeDataArray = nodes;
            myWholeModel.linkDataArray = edges;
            diagram.layout = new VirtualizedForceDirectedLayout();
            diagram.layout.model = myWholeModel;
        // once the layout has finished we can decide where to position the viewport

            var onLayoutComplated = function(e) {
                var firstdata = myWholeModel.findNodeDataForKey(0);
                if (firstdata !== null) {
                    this.diagram.centerRect(firstdata.bounds);
                }
                this.overviewDiagram.updateAllTargetBindings();
                this.originalScale = this.diagram.scale;
                // update the displayed model when the viewport change
                diagram.addDiagramListener("ViewportBoundsChanged", onViewportChanged.bind(this));
            };

            var onChange = function(e) {
                if (e.propertyName === 'CommittedTransaction') {
                    this.overviewDiagram.updateAllTargetBindings();
                }
            };
            diagram.addDiagramListener("InitialLayoutCompleted", onLayoutComplated.bind(this));
        // update the tables of the overview
            diagram.model.addChangedListener(onChange.bind(this));
        };

        VirtualizedSchemaGraphViewerController.prototype.defineTemplates = function() {
            var templmap = new go.Map("string", go.Node);
            templmap.add("table", schemaTemplatesService.schemaOverviewTemplate());
            templmap.add("viewport", schemaTemplatesService.schemaOverviewViewPortTemplate());
            templmap.add("", this.diagram.nodeTemplate);
            this.overviewTemplatesMap = templmap;
        };

    /**
     * This method needs to be called if we upgrade the visibility of models in bulk
     * It forces GoJS to update the bindings to the diagram object
     *
     */
        VirtualizedSchemaGraphViewerController.prototype.updateVisibility= function() {
            this.diagram.updateAllTargetBindings('visible');
            this.overviewDiagram.updateAllTargetBindings('visible');
        };

    /**
     * We need to manage ourselves the overview when we use a virtualized layout
     * The model of the overview is the whole diagram.
     *
     * In the main diagram setup, we need to listen to change in the diagram model,
     * so we can propagate these changes in the overlay.
     *
     * There, we should listen to change in the position of the viewport node,
     * if the position change, we need to center the viewport of the main
     * diagram on the new viewport
     *
     */
        VirtualizedSchemaGraphViewerController.prototype.setupOverview = function() {

            var outlineID = 'outlineContainer';
            var graphID = 'graphContainer';

            var overviewDiagram  =
            goGraphMaker(go.Diagram, outlineID, {
                initialAutoScale: go.Diagram.Uniform
            });
            this.overviewDiagram = overviewDiagram;

            overviewDiagram.nodeTemplateMap = this.overviewTemplatesMap;
            var overviewModel = _$(go.GraphLinksModel);
            var nodes = this.graph.getVertices(true);
            var viewPortBounds = this.diagram.viewportBounds;
            nodes.push({
                key :'VIEWPORT',
                bounds: new go.Rect(viewPortBounds.x,
                viewPortBounds.y,
                viewPortBounds.width,
                viewPortBounds.height),
                category: 'viewport'
            });
            overviewModel.nodeDataArray = nodes;
            overviewModel.linkDataArray = [];
            overviewDiagram.model =  overviewModel;
            overviewDiagram.nodeTemplate =  schemaTemplatesService.schemaOverviewTemplate();
            overviewDiagram.linkTemplate =   _$(go.Link,  { visible:false });
            overviewDiagram.hasHorizontalScrollbar = false;
            overviewDiagram.hasVerticalScrollbar = false;
            overviewDiagram.animationManager.isEnabled = false;

            var diagram = this.diagram;
            overviewDiagram.addModelChangedListener(function(e) {
                var data = overviewDiagram.model.findNodeDataForKey('VIEWPORT');
                diagram.centerRect(data.bounds);
            });

        // we force the width of the viewport rectangle to looks like it has
        // always a width of 2 px
            overviewDiagram.addDiagramListener("InitialLayoutCompleted", function(e) {
                var node = overviewDiagram.findNodeForKey(schemaTemplatesService.shapesName.OVERVIEW_NODE);
                var drawedViewport = node.findObject(schemaTemplatesService.shapesName.OVERVIEW_RECTANGLE);
                drawedViewport.strokeWidth = schemaTemplatesService.canvasStyle.fullSchema.overviewStrokeWidth
               / overviewDiagram.scale;
            });
        };

        return VirtualizedSchemaGraphViewerController;
    }]);
