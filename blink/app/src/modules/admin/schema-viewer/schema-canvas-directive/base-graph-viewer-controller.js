/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This directive draws a schema on the canvas
 *
 * BaseGraphController provides basic functionnality for displaying a graph
 * It takes care of zooming/out, provides an overview, wire up the model
 *
 * Subclasses must provide templates for nodes and links and use a specific subclass
 * of BKGraph
 *
 *
 */
'use strict';

blink.app.factory('BaseGraphViewerController', ['env',
    'schemaTemplatesService',
    'strings',
    function(env,
         schemaTemplatesService,
         strings){

        var outlineID = 'outlineContainer';
        var graphID = 'graphContainer';

        var goGraphMaker = go.GraphObject.make;
        var TABLE_SPACING = new go.Size(300, 300);
        var HOVER_DELAY = 350;
        var DEFAULT_EL_CHARGE = 300;
        var DEFAULT_SPRING_LENGTH = 270;
        var VIEWPORT_WIDTH = 600;
        var VIEWPORT_HEIGHT = 270;

    /**
     *
     *
     * @param graph {BKGraph} Graph to render
     * @param onGraphRendered {function} Callback called after the diagram has been displayed, and layout
     * have been done
     * @constructor
     */
        function BaseGraphViewerController(
        graph,
        onGraphRendered)
    {
            this.graph = graph;
            this.onGraphRendered = onGraphRendered;
            this.hasErrors = false;
            this.strings = strings;
        }

    /**
     * @param {string} cssSelector CSS selector of the canvas that will hold the DIV
     *
     * Initialize the diagram with the given div id
     *
     */
        BaseGraphViewerController.prototype.initDiagramCanvas = function(containerCssSelector) {
            if (!containerCssSelector) {
                containerCssSelector = graphID;
            }

            var myDiagram =
            goGraphMaker(go.Diagram, containerCssSelector, {
                initialContentAlignment: go.Spot.Center,
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom
            });

            this.diagram = myDiagram;

        // Every diagram stars with 6 default layers (back to front)
        // Grid < Background < Default Layer < Foreground < Decoration < Tool
        // These layers are used by different GoJS objects
        // We add 2 layers that will come in front of the standard layer, but
        // behind the "Foreground" layer, so we will have this hierarchy
        // .. < Default Layer < NodeLayer < LinkLayer < Foreground < ...
        // We will use the Foreground to put selected object on top of everything

            var forelayer = myDiagram.findLayer(schemaTemplatesService.canvasStyle.layerName.foregroundLayer);
            myDiagram.addLayerBefore(goGraphMaker(go.Layer,
                {
                    name: schemaTemplatesService.canvasStyle.layerName.linkLayer
                }
        ), forelayer);
            myDiagram.addLayerBefore(goGraphMaker(go.Layer,
                {
                    name: schemaTemplatesService.canvasStyle.layerName.nodeLayer
                }
        ), forelayer);

            if (env.e2eTest) {
                if (!blink.app.exposedObjectsForTests) {
                    blink.app.exposedObjectsForTests = {};
                }
                blink.app.exposedObjectsForTests.diagram = this.diagram;
            }

        };

        BaseGraphViewerController.prototype.zoomIn = function() {
            this.diagram.commandHandler.increaseZoom();
        };

        BaseGraphViewerController.prototype.zoomOut = function() {
            this.diagram.commandHandler.decreaseZoom();
        };

        BaseGraphViewerController.prototype.goToObject = function(id) {

        // First center on the right place, so the object will
        // be part of the diagram model
            var node = this.diagram.layout.model.findNodeDataForKey(id);
            if (!node) {
            // maybe warn
                return;
            }
            this.diagram.centerRect(node.bounds);

        // Then we have the node in the diagram, so we can select id
            node = this.diagram.findNodeForKey(id);
            if (!node) {
            // maybe warn
                return;
            }

            this.diagram.select(node);
        };

        BaseGraphViewerController.prototype.startEdit = angular.noop;

    /**
     *
     * The default implementation
     * setups a diagram and bind it with its model
     * it then a force directed layout and setups an overview
     * and install an handler for zooming behaviour
     *
     */
        BaseGraphViewerController.prototype.setupLayout = function() {
            this.diagram.layout = new go.ForceDirectedLayout();
            this.diagram.layout.defaultElectricalCharge = DEFAULT_EL_CHARGE;

        // let enough space between components
            this.diagram.layout.arrangementSpacing = TABLE_SPACING;
            this.diagram.layout.defaultSpringLength = DEFAULT_SPRING_LENGTH;
        };

        BaseGraphViewerController.prototype.setupModel = function() {

            var nodes = this.graph.getVertices();
            var edges = [];

            nodes.each(function(node) {
                edges = edges.concat(node.getEdges());
            });

            this.diagram.model = new go.GraphLinksModel(nodes, edges);
        };

        BaseGraphViewerController.prototype.setupOverview = function() {
        // draw overview
            this.overview =
            goGraphMaker(go.Overview, outlineID, { observed: this.diagram });
            this.overview.box.elt(0).stroke = schemaTemplatesService.canvasStyle.graphViewer.overviewColor;
            this.overview.box.elt(0).strokeWidth = schemaTemplatesService.canvasStyle.graphViewer.overviewStrokeWidth;

            this.overview.drawsTemporaryLayers = false;
        };

        BaseGraphViewerController.prototype.collapseExpandHandler = function(e, node) {
            var list = node.part.findObject(schemaTemplatesService.shapesName.TABLE);
            if (list !== null) {
                list.diagram.startTransaction(schemaTemplatesService.customTransactions.COLLAPSE_EXPAND);
                list.collapsed = !list.collapsed;
                if (list.collapsed) {
                    list.oldSize = list.desiredSize;
                    list.desiredSize = new go.Size(0, 0);
                } else {
                    list.desiredSize = list.oldSize;
                }
                var shape = node.findObject(schemaTemplatesService.shapesName.COLLAPSEBUTTON);
                if (shape !== null) {
                    shape.figure = (!list.collapsed ?
                        schemaTemplatesService.shapesName.TRIANGLE_UP :
                        schemaTemplatesService.shapesName.TRIANGLE_DOWN
                );
                }
                list.diagram.commitTransaction(schemaTemplatesService.customTransactions.COLLAPSE_EXPAND);
            }
        };

        BaseGraphViewerController.prototype.setupDiagram = function() {
            this.diagram.animationManager.isEnabled = false;

            var diagram = this.diagram;
        // let key events bubbles up
            this.diagram.commandHandler.doKeyDown = function () {
                var e = diagram.lastInput;
                if (e.inputEvent) {
                    e.inputEvent.bubbles = true;
                }
            };

        // let mouse move event bubbles up (this should be fix 1.7 of GoJS)
            diagram.toolManager.doMouseMove = function () {
                go.ToolManager.prototype.doMouseMove.call(this);
                if (diagram.currentTool === diagram.toolManager) {
                    diagram.lastInput.bubbles = true;
                }
            };

        // disable selection tool
        // order of tools is guaranteed to stay the same
            this.diagram.toolManager.mouseMoveTools.get(2).isEnabled = false;
            this.diagram.toolManager.hoverDelay = HOVER_DELAY;
        };

    /**
     *
     * @param graph {BKGraph}
     */
        BaseGraphViewerController.prototype.setGraph = function(graph) {
            this.graph = graph;
        };

    /**
     * This handler is called once the initial layout is done
     * Defaut behaviour is to center the graph
     *
     */
        BaseGraphViewerController.prototype.layoutCompleted = function(e) {
            var diagram = e.diagram;
            var centerX = diagram.documentBounds.centerX;
            var centerY = diagram.documentBounds.centerY;
            var rect = new go.Rect(centerX - (VIEWPORT_WIDTH / 2), centerY-(VIEWPORT_HEIGHT / 2),
            VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
            diagram.centerRect(rect);
            this.onGraphRendered(diagram);
        };

    /**
     * Select coluns in a given tableElement
     *
     * @param {Array<ColumnItem>} columns - Columns to highlight
     * @param tableElement - GoJS TableElement
     */
        BaseGraphViewerController.prototype.selectColumnsInTable = function(columns, tableElement) {
            var insidePanel = tableElement.elt(1).elt(1);
            columns.forEach(function (column) {
                var row = insidePanel.getRowDefinition(column.sortedIdx);
                row.background = schemaTemplatesService.canvasStyle.fullSchema.selectedColumnBackground;
                this.selections.push(row);
            }, this);
        };

    /**
     * clean the diagram
     *
     */
        BaseGraphViewerController.prototype.cleanDiagram = function() {
        //this.diagram.removeDiagramListener("InitialLayoutCompleted", this._initialListener);
            this.diagram.model.nodeDataArray = [];
            this.diagram.model.linkDataArray = [];
            this.diagram.clear();
            this.diagram.div = null;

            if (this.overview) {
                this.overview.clear();
                this.overview.div = null;
                this.overview.observed = null;
            }
        };

    /**
     * Setup templates and templates map
     */
        BaseGraphViewerController.prototype.defineTemplates = function() {

        };


        BaseGraphViewerController.prototype.nodeSelectionChangedHandler = function(node) {
            if (!node.isSelected) {
                node.layerName = schemaTemplatesService.canvasStyle.layerName.nodeLayer;
            } else {
                node.layerName = schemaTemplatesService.canvasStyle.layerName.foregroundLayer;
            }
        };

        return BaseGraphViewerController;
    }]);

