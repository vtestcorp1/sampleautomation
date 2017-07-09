/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This controller takes care of rendering a graph holding
 * the current schema of the TS app
 *
 */
'use strict';

blink.app.factory('FullSchemaGraphViewerController', ['$rootScope',
    '$location',
    '$route',
    'BaseGraphViewerController',
    'Logger',
    'VirtualizedGraphViewerController',
    'blinkConstants',
    'strings',
    'jsonConstants',
    'safeApply',
    'schemaTemplatesService',
    'util',
    function ($rootScope,
          $location,
          $route,
          BaseGraphViewerController,
          Logger,
          VirtualizedGraphViewerController,
          blinkConstants,
          strings,
          jsonConstants,
          safeApply,
          schemaTemplatesService,
          util) {

        var _$ = go.GraphObject.make,
            MAX_ZOOM = 5,
            MIN_ZOOM = 0.2,
            _logger = Logger.create('full-schema-graph');

    /**
     *
     * @param graph
     * @param onGraphRendered
     * @constructor
     */

        function FullSchemaGraphViewerController(graph,
                                             onGraphRendered,
                                             onVertexSelected,
                                             onVertexDblClicked) {

            FullSchemaGraphViewerController.__super.call(
            this,
            graph,
            onGraphRendered,
            onVertexSelected
        );

            this.selections = [];
            this.onVertexSelected = onVertexSelected;
            this.onVertexDblClicked = onVertexDblClicked;
        }

        util.inherits(FullSchemaGraphViewerController, VirtualizedGraphViewerController);

        FullSchemaGraphViewerController.prototype.defineTemplates = function () {
            FullSchemaGraphViewerController.__super.prototype.defineTemplates.call(this);
            var diagram = this.diagram;
            var selections = [];
            var tooltipTemplate =
            _$(go.Panel, "Auto", {background: 'black', padding: 20});

            tooltipTemplate = _$(go.Adornment, "Auto", tooltipTemplate);

            this.diagram.nodeTemplate = schemaTemplatesService.fullSchemaNodeTemplate(
            this.collapseExpandHandler,      // collapse button handler
            this.vertexDoubleClickedHandler.bind(this), // double click handler
            this.nodeSelectionChangedHandler.bind(this), // selection handler
            angular.noop); // column clicked handler

            this.diagram.linkTemplate = schemaTemplatesService.fullSchemaLinkTemplate(
            this.edgeSelectionChangedHandler.bind(this), // edge selection handler
            angular.noop);  // edge click handler

            this.diagram.groupTemplate = schemaTemplatesService.groupTemplate();

        };

        FullSchemaGraphViewerController.prototype.unhighlightHighlightedColumns = function() {
            this.selections.each(function (item) {
                item.background = schemaTemplatesService.canvasStyle.fullSchema.columnBackground;
            });
            this.selections = [];
        };

        FullSchemaGraphViewerController.prototype.nodeSelectionChangedHandler = function(node) {

            FullSchemaGraphViewerController.__super.prototype
            .nodeSelectionChangedHandler.call(this, node);

            var self = this;
        // Note(chab) this handler is executed by the GoJS library,  so we need to propagate
        // change to angular context, i'll be happy to take any proposed pattern
            safeApply($rootScope, function(){
                self.onVertexSelected(node.data.key);
            });
        };

        FullSchemaGraphViewerController.prototype.edgeSelectionChangedHandler = function (edge) {
        // deselect everything
            this.unhighlightHighlightedColumns();
            if (edge.isSelected) {
                var edgeLine = edge.findMainElement();
                edgeLine.stroke = schemaTemplatesService.canvasStyle.fullSchema.selectedLinkColor;
                var arrow = edge.findObject(schemaTemplatesService.shapesName.ARROW);
                arrow.stroke = schemaTemplatesService.canvasStyle.fullSchema.selectedLinkColor;
                arrow.fill = schemaTemplatesService.canvasStyle.fullSchema.selectedLinkColor;
            } else {
            // if part is deselected, we re-evaluate all bindings to bring the part back to its normal state
                edge.updateTargetBindings();
                return;
            }

        // select tables
            var sourceTableElement = this.diagram.findNodeForKey(edge.data.from);
            var destinationTableElement = this.diagram.findNodeForKey(edge.data.to);
            sourceTableElement.isSelected = true;
            destinationTableElement.isSelected = true;

        //select columns
            var sourceColumns = edge.data.sourceColumns;
            var destinationColumns = edge.data.destinationColumns;
            this.selectColumnsInTable(sourceColumns, sourceTableElement);
            this.selectColumnsInTable(destinationColumns, destinationTableElement);
        };

        FullSchemaGraphViewerController.prototype.vertexDoubleClickedHandler = function(e, vertex) {

            var schemaTable = vertex.data.data;

            var type = schemaTable.getType();
            var name = schemaTable.getName();
            var self = this;
            safeApply($rootScope, function(){
                self.onVertexDblClicked(type, vertex.data.key, name);
            });
        };

        FullSchemaGraphViewerController.prototype.setupDiagram = function () {
        // call super class setup for common stuff
            FullSchemaGraphViewerController.__super.prototype.setupDiagram.call(this);
        // install tooltip
            var d = this.diagram;
            var _tooltip = $('.graph .tooltip');
            this.diagram.toolManager.showToolTip = function (tooltip, graph) {
                var p2 = d.lastInput.viewPoint;
                var divElement = d.div;
                var leftOffset = $(divElement).offset().left;

                _tooltip.css({display: 'block', top: p2.y + 'px', left: (leftOffset + p2.x) + 'px'});
                _tooltip.addClass('in');

                if (!!graph.data.htmlToolTip) {
                    _tooltip.find('.tooltip-inner').html(graph.data.htmlToolTip);

                } else {
                // fallback to default behaviour
                    go.ToolManager.prototype.showToolTip.call(this.diagram.toolManager, tooltip, graph);
                }
            };

            this.diagram.toolManager.hideToolTip = function () {
                _tooltip.removeClass('in');
                _tooltip.css({display: 'none'});

                go.ToolManager.prototype.hideToolTip.call(this.diagram.toolManager);
            };

            this.diagram.addDiagramListener("InitialLayoutCompleted", this.layoutCompleted.bind(this));
            this.diagram.maxScale = MAX_ZOOM;
            this.diagram.minScale = MIN_ZOOM;


        };

    /**
     *
     * Turns a vertex off
     *
     * @param vertexId
     * @param visible
     */
        FullSchemaGraphViewerController.prototype.setVertexVisibility = function(vertexId, visible) {
            var data = this.diagram.layout.model.findNodeDataForKey(vertexId);

            if (!data) {
                _logger.warn('error finding data for vertex id', vertexId);
            } else {
                this.diagram.model.setDataProperty(data, schemaTemplatesService.bindingsDataProperty.VISIBLE,visible);
            }

        // overviewDiagram
            data = this.overviewDiagram.model.findNodeDataForKey(vertexId);

            if (!data) {
                _logger.warn('error find data on diagram overview for id', vertexId);
                return;
            }

            this.overviewDiagram.model.setDataProperty(data, schemaTemplatesService.bindingsDataProperty.VISIBLE,
            visible);
            this.overviewDiagram.updateAllTargetBindings();
        };

        return FullSchemaGraphViewerController;
    }]);


