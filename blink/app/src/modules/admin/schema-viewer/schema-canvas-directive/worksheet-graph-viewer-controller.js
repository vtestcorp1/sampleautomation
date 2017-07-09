/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This controller takes care of rendering a graph holding
 * the current schema of the TS app
 *
 */
'use strict';
blink.app.factory('WorksheetGraphViewerController', ['$rootScope',
    'BaseGraphViewerController',
    'blinkConstants',
    'strings',
    'schemaTemplatesService',
    'util',
    function ($rootScope,
          BaseGraphViewerController,
          blinkConstants,
          strings,
          schemaTemplatesService,
          util) {

        var _$ = go.GraphObject.make;

    /**
     *
     * @param graph {WorksheetGraphModel}
     * @param {function} onGraphRendered
     * @param {function} onColumnSelected
     * @constructor
     */
        function WorksheetGraphViewerController(graph,
                                         onGraphRendered,
                                         onColumnSelected) {
            WorksheetGraphViewerController.__super.call(
            this,
            graph,
            onGraphRendered
        );

            this.highlightedColumns = [];
            this.lastSelectedEdges = [];
            this.onColumnSelected = onColumnSelected;

        }

        util.inherits(WorksheetGraphViewerController, BaseGraphViewerController);

        WorksheetGraphViewerController.prototype.linkSelectionChangedHandler = function (part) {
            var style = schemaTemplatesService.canvasStyle.fullSchema;
            if (part.isSelected) {
                var edge = part.findMainElement();
                edge.stroke =  style.selectedLinkColor;
                var arrow = part.findObject(schemaTemplatesService.shapesName.ARROW);
                if (arrow) {
                    arrow.stroke = style.selectedLinkColor;
                    arrow.fill = style.selectedLinkColor;
                }
            } else {
            // re-evaluate all binding,
                part.updateTargetBindings();
            }
        };

        WorksheetGraphViewerController.prototype.linkClickedHandler = function(event, link) {

            this.unHighlightHighlightedColumns();
            this.unselectEdges();
            // this will call linkSelectionChangedHandler and updates the drawing
            link.isSelected = true;

            var relationShip = link.data;
            var mapFunction = function(column){
                return {
                    tableId: column.getSourceTableId(),
                    columnIdx: column.sortedIdx
                };
            };

            var columnsToHighlight =
            relationShip.sourceColumns.map(mapFunction)
                .concat(relationShip.destinationColumns.map(mapFunction));

            this.selectColumnInTable(columnsToHighlight,
            schemaTemplatesService.canvasStyle.fullSchema.joinPathColumnBackground);

        };

    /**
     *
     * @param{Array} targets
     * @param{string} selectionColor
     */
        WorksheetGraphViewerController.prototype.selectColumnInTable = function(targets, selectionColor) {
            targets.forEach(function(target) {
                var tableId = target.tableId;
                var idx = target.columnIdx;
                var node = this.diagram.findNodeForKey(tableId);
                var insidePanel = node.findObject(schemaTemplatesService.shapesName.TABLE_COLUMNS);
                var row = insidePanel.getRowDefinition(idx);
                row.background = selectionColor;
                this.highlightedColumns.push(row);
            }, this);
        };

        WorksheetGraphViewerController.prototype.unHighlightHighlightedColumns = function() {

            if (this.highlightedColumns.length > 0) {
                this.highlightedColumns.each(function (item) {
                    item.background = schemaTemplatesService.canvasStyle.fullSchema.columnBackground;
                    item.isSelected = false;
                }, this);
                this.highlightedColumns = [];
            }
        };

        WorksheetGraphViewerController.prototype.layoutCompleted = function(e) {
            var diagram = e.diagram;
            diagram.zoomToFit();
            this.onGraphRendered(diagram);
        };

        WorksheetGraphViewerController.prototype.unselectEdges = function() {
            if (this.lastSelectedEdges.length > 0) {
                this.lastSelectedEdges.forEach(function(edge) {
                    edge.isSelected = false;
                });
            }
        };

        WorksheetGraphViewerController.prototype.highlightWorksheetColumn = function(columnItem) {
            this.unHighlightHighlightedColumns();
            this.unselectEdges();

            var columnsToHighlight;
            if (columnItem.isFormula())
        {
                columnsToHighlight = this.determineHighlightedFormulaColumn(columnItem.targets);
            }
            else {
                columnsToHighlight = this.determineHighlightedStandardColumn(
                columnItem.targets,
                columnItem.traversals
            );
            }

            if (columnsToHighlight.joinPathColumnsToHighlight) {
                this.selectColumnInTable(
                columnsToHighlight.joinPathColumnsToHighlight,
                schemaTemplatesService.canvasStyle.fullSchema.joinPathColumnBackground
            );
            }
            this.selectColumnInTable(
            columnsToHighlight.targetsToHighlight,
            schemaTemplatesService.canvasStyle.fullSchema.targetColumnBackground
        );
        };

        WorksheetGraphViewerController.prototype.determineHighlightedFormulaColumn = function(targets) {

            var columnsToHighlight = targets.map(function(column) {
                return {
                    tableId: column.getSourceTableId(),
                    columnIdx: column.sortedIdx
                };
            });

            return {
                targetsToHighlight: columnsToHighlight
            };
        };

        WorksheetGraphViewerController.prototype.determineHighlightedStandardColumn = function(targets, traversals) {
            var columnToHighlightTargets = [];
            var columnToHighlightJoinPath = [];

            function pushColumnsToHighlight(columns, array) {
                columns.forEach(function(column){
                    array.push({
                        tableId: column.getSourceTableId(),
                        columnIdx: column.sortedIdx
                    });
                });
            }

            this.lastSelectedEdges = [];
            traversals.forEach(function(traversal) {
                traversal.forEach(function(join, idx) {
                    var graphEdge = this.joinIdsToLink[join];
                    var diagramLink = this.diagram.findLinkForData(graphEdge);
                    diagramLink.isSelected = true;
                    this.lastSelectedEdges.push(diagramLink);
                    if (idx === 0) {
                        pushColumnsToHighlight(graphEdge.sourceColumns, columnToHighlightJoinPath);
                    }
                    pushColumnsToHighlight(graphEdge.destinationColumns, columnToHighlightJoinPath);
                }, this);
            }, this);

            pushColumnsToHighlight(targets, columnToHighlightTargets);

            return {
                targetsToHighlight: columnToHighlightTargets,
                joinPathColumnsToHighlight: columnToHighlightJoinPath
            };
        };

        WorksheetGraphViewerController.prototype.defineTemplates = function() {
            this.highlightedColumns = [];

            var tooltipTemplate =
            _$(go.Panel, "Auto", {background: 'black', padding: 20});
            tooltipTemplate = _$(go.Adornment, "Auto", tooltipTemplate);

            this.diagram.groupTemplate = schemaTemplatesService.groupTemplate();
            this.diagram.linkTemplate  = schemaTemplatesService.fullSchemaLinkTemplate(
            this.linkSelectionChangedHandler.bind(this),
            this.linkClickedHandler.bind(this)
        );

            this.diagram.nodeTemplate = schemaTemplatesService.fullSchemaNodeTemplate(
            this.collapseExpandHandler,
            angular.noop,
            this.nodeSelectionChangedHandler.bind(this),
            angular.noop,
            100);
        };

        WorksheetGraphViewerController.prototype.setupDiagram = function () {
        // call super class setup for common stuff
            WorksheetGraphViewerController.__super.prototype.setupDiagram.call(this);
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

            var joinIdsToEdge = {};
            this.diagram.links.each(function(link) {
                var bkEdge = link.data;
                if (bkEdge.type != 'FORMULALINK') {
                    joinIdsToEdge[bkEdge.data.getId()] = bkEdge;
                }
            });
            this.joinIdsToLink = joinIdsToEdge;
        };

        return WorksheetGraphViewerController;
    }]);

