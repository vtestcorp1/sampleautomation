/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Provide a list of graphical templates
 * that are used for rendering a SchemaGraphModel, and styles for the canvas
 * the elements displayed
 *
 */

import _ from 'lodash';
import {Provide} from 'src/base/decorators';
import {strings} from 'src/base/strings';

declare const go;

let _$ = go.GraphObject.make;
// custom arrow shape
go.Shape.defineArrowheadGeometry('Triangle', 'F1 m 0,0 l 8,4.62 -8,4.62 z');

const pictureSize = {
        width: 24/2,
        height: 34/2
    }, pictureHeaderSize = {
        width: 16,
        height: 16
    },
    rightColumnWidth = 120,
    pictureMargin = 2,
    titleMargin = 40;

const textAdjust = {
    above: 1.5,
    below: -2
};

const rowHeight = pictureSize.height + pictureMargin * 2;
const linkMaxWidth = 350;
const linkMaxHeight = 40;
const tableWidth = 300;
const headerHeight = 40;
const margin = 5;
const topAndBottomSpace = 2 * margin;

const NUMBER_COLUMNS_DISPLAYED = 10;

const chevronWidth = 8;
const chevronHieght = 12;
const chevrontRotation = 90;
const chevronAlignment = new go.Spot(0.5, 1, 0, -5);

const canvasStyle = {
    layerName: {
        linkLayer: 'linkLayer',
        nodeLayer: 'nodeLayer',
        foregroundLayer: 'Foreground'
    },
    graphViewer: {
        overviewColor: '#FA5D3D',
        overviewStrokeWidth: 1
    },
    fullSchema: {
        innerJoinPicture: '/resources/img/canvasSchema/innerJoin.png',
        leftJoinPicture: '/resources/img/canvasSchema/leftJoin.png',
        rightJoinPicture: '/resources/img/canvasSchema/rightJoin.png',
        outerJoinPicture: '/resources/img/canvasSchema/outerJoin.png',
        worksheetPicture: '/resources/img/canvasSchema/Worksheet.png',
        tablePicture: '/resources/img/canvasSchema/Table.png',
        pkPicture: '/resources/img/canvasSchema/pkKey.png',
        formulaPicture: '/resources/img/canvasSchema/formulaColumn.png',
        fkPicture: '/resources/img/canvasSchema/fkKey.png',
        pkFkPicture: '/resources/img/canvasSchema/pkFkKey.png',
        worksheetColor: '#B37EF5',
        tableColor: '#F5A623',
        tableNotInWksColor: '#FBD95A',
        unknownTypeColor: '#FF0000',
        genericJoinColor: '#F36261',
        pkfkJoinColor: '#81D135',
        userDefinedJoinColor: '#5F9FF2',
        tableBackground: '#FFFFFF',
        joinStroke: '#DFE2EB',
        joinFill: '#F7F9F7',
        columnBackground: '#F7F9F7',
        selectedColumnBackground: '#CCCCCC',
        targetColumnBackground: '#FFCCCC',
        joinPathColumnBackground: '#CCCCCC',
        columnTextColor: '#000000',
        columnNotInWorksheetTextColor: '#888888',
        selectedLinkColor: '#000000',
        transparentBackground: 'transparent',
        rightPanelFont: '13px regular',
        rightPanelBoldFont: '14px regular',
        leftPanelFont: '13px regular',
        joinFontColor: '#818796',
        joinPanelFont: '12px regular bold',
        headerFont: '18px regular',
        overviewStrokeWidth: 1,
        overviewStrokeColor: '#000000',
        errorColor: '#f5615d'
    }
};

const bindingsPartProperty = {
    FILL: 'fill',
    FONT: 'font',
    ITEM_ARRAY: 'itemArray',
    HEIGHT: 'height',
    SOURCE: 'source',
    STROKE: 'stroke',
    TEXT: 'text',
    VISIBLE: 'visible',
    MAX_SIZE: 'maxSize',
    MIN_SIZE: 'minSize',
    OPACITY: 'opacity',
    DESIRED_SIZE: 'desiredSize',
    WIDTH: 'width'
};

const bindingsDataProperty = {
    BOUNDS: 'bounds',
    COLOR: 'color',
    FIELDS: 'fields',
    HEADER_COLOR: 'headerColor',
    HEADER_PICTURE: 'headerPicture',
    KEY_IMAGE: 'pkImage',
    NAME: 'name',
    OPACITY: 'opacity',
    TABLE_NAME: 'tableName',
    TEXT: 'text',
    TEXT_COLOR: 'textColor',
    TEXT_FONT: 'textFont',
    VISIBLE: 'visible'
};

const customTransactions = {
    COLLAPSE_EXPAND: 'collapse/expand'
};

const shapesName = {
    ARROW: 'arrow',
    CHEVRON: 'Chevron',
    TRIANGLE: 'Triangle',
    TRIANGLE_UP: 'TriangleUp',
    TRIANGLE_DOWN: 'TriangleDown',
    PART: 'PART',
    COLLAPSEBUTTON: 'COLLAPSEBUTTON',
    TABLE: 'TABLE',
    TABLE_COLUMNS: 'TABLECOLUMNS',
    OVERVIEW_NODE: 'VIEWPORT',
    OVERVIEW_RECTANGLE: 'VIEWPORT_RECTANGLE'
};

const linksTypes = {
    FORMULA: 'FORMULALINK'
};

const schemaLegend: {} = {},
    schemaLegendPicture: {} = {};

schemaLegend[strings.schemaViewer.relationships.GENERIC] =
    canvasStyle.fullSchema.genericJoinColor;
schemaLegend[strings.schemaViewer.relationships.PK_FK] =
    canvasStyle.fullSchema.pkfkJoinColor;
schemaLegend[strings.schemaViewer.relationships.USER_DEFINED] =
    canvasStyle.fullSchema.userDefinedJoinColor;
schemaLegend['Table'] = canvasStyle.fullSchema.tableColor;
schemaLegend['Worksheet'] = canvasStyle.fullSchema.worksheetColor;
schemaLegendPicture['Primary Key'] = canvasStyle.fullSchema.pkPicture;
schemaLegendPicture['Foreign Key'] = canvasStyle.fullSchema.fkPicture;
schemaLegendPicture['PK-FK Key'] = canvasStyle.fullSchema.pkFkPicture;

function tooltipTemplate(): go.Adornment {
    let _tooltipTemplate =
        _$(go.Panel, 'Auto', {background: 'black', padding: 20});

    return _$(go.Adornment, 'Auto', _tooltipTemplate);
}

/**
 *
 * @param{function} selectionChangedCallback
 * @param{function} linkClickCallback
 * @returns {*}
 */
function schemaLinkTemplate(selectionChangedCallback, linkClickCallback): go.Link {
    if (!linkClickCallback) {
        linkClickCallback = _.noop;
    }

    return _$(go.Link,
        new go.Binding(bindingsPartProperty.VISIBLE, bindingsDataProperty.VISIBLE),
        new go.Binding(bindingsDataProperty.OPACITY, bindingsDataProperty.OPACITY),
        {
            selectable: true,
            opacity: 1,
            click: linkClickCallback,
            visible: false,
            toolTip: tooltipTemplate(),
            selectionAdorned: false,
            selectionChanged: selectionChangedCallback,
            layerName: canvasStyle.layerName.linkLayer
        },
        {
            curve: go.Link.Bezier
        },
        _$(go.Shape, new go.Binding(bindingsPartProperty.STROKE, bindingsDataProperty.COLOR)),
        _$(go.Panel, 'Auto',  // this whole Panel is a link label
            //{ visible: hasText },
            _$(go.Shape, 'RoundedRectangle', {
                    fill: canvasStyle.fullSchema.joinFill,
                    stroke: canvasStyle.fullSchema.joinStroke
                }
            ),
            _$(go.Panel, 'Vertical',
                _$(go.TextBlock, {
                    maxSize: new go.Size(linkMaxWidth, linkMaxHeight),
                    margin: 10,
                    stroke: canvasStyle.fullSchema.joinFontColor,
                    wrap: go.TextBlock.None,
                    textAlign: 'center',
                    overflow: go.TextBlock.OverflowEllipsis
                }, new go.Binding(bindingsPartProperty.TEXT, bindingsDataProperty.TEXT)),
                _$(go.Picture, {
                        width: 50,
                        imageStretch: go.GraphObject.Uniform,
                        height: 20
                    },
                    new go.Binding(bindingsPartProperty.SOURCE, 'joinPictureSource')
                )
            )),
        _$(
            go.Shape,
            {
                toArrow: shapesName.TRIANGLE,
                name: shapesName.ARROW
            },
            new go.Binding(bindingsPartProperty.FILL, bindingsDataProperty.COLOR),
            new go.Binding(bindingsPartProperty.STROKE, bindingsDataProperty.COLOR)
        )
    );
}

// this is the template for the worksheet container
function groupTemplate(): go.Group {
    return _$(go.Group, 'Vertical',
        {
            layout: _$(go.LayeredDigraphLayout,
                {
                    direction: 0,
                    columnSpacing: 100,
                    layerSpacing: 300,
                    setsPortSpots:false
                }
            )
        },
        _$(go.Panel, 'Auto')
    );
}

/**
 *
 * @param {function} collapseButtonClickHandler
 * @param {function} tableDblClickHandler
 * @param {function} selectionChangedHandler
 * @param {function} columnClickHandler
 * @param {Number} maxColumn
 * @returns {*}
 */
function schemaNodeTemplate(collapseButtonClickHandler,
                            tableDblClickHandler,
                            selectionChangedHandler,
                            columnClickHandler,
                            maxColumn): go.Node {
    if (!maxColumn) {
        maxColumn = NUMBER_COLUMNS_DISPLAYED;
    }
    let fieldTemplate = _$(
        go.Panel,
        'TableRow',  // this Panel is a row in the containing Table
        {
            background: canvasStyle.fullSchema.transparentBackground,
            // so this port's background can be picked by the mouse
            fromSpot: go.Spot.Right,
            // links only go from the right side to the left side
            toSpot: go.Spot.Left,
            // allow drawing links from or to this port:
            fromLinkable: false,
            toLinkable: false,
            click: columnClickHandler
        },
        _$(go.Picture,
            {
                width: pictureSize.width,
                height: pictureSize.height,
                column: 0,
                margin: pictureMargin,
                background: canvasStyle.fullSchema.transparentBackground
            },
            // we are cheating by using a null string for no picture
            new go.Binding(bindingsPartProperty.SOURCE, bindingsDataProperty.KEY_IMAGE)
        ),
        _$(go.TextBlock,
            {
                column: 1,
                font: canvasStyle.fullSchema.leftPanelFont,
                margin: new go.Margin(0, margin, 0, margin),
                alignment: go.Spot.Left,
                overflow: go.TextBlock.OverflowEllipsis,
                textAlign: 'left',
                stretch: go.GraphObject.Horizontal,
                wrap: go.TextBlock.None
            },
            new go.Binding(bindingsPartProperty.TEXT, bindingsDataProperty.NAME),
            new go.Binding(bindingsPartProperty.STROKE, bindingsDataProperty.TEXT_COLOR),
            new go.Binding(bindingsPartProperty.FONT, bindingsDataProperty.TEXT_FONT)
        ),
        _$(go.TextBlock,
            {
                column: 2,
                font: canvasStyle.fullSchema.rightPanelFont,
                margin: new go.Margin(0, 20, 0, margin),
                textAlign: 'right',
                alignment: go.Spot.Right,
                overflow: go.TextBlock.OverflowEllipsis,
                stretch: go.GraphObject.Horizontal,
                minSize: new go.Size(rightColumnWidth, NaN),
                wrap: go.TextBlock.None
            },
            new go.Binding(bindingsPartProperty.TEXT, 'info'),
            new go.Binding(bindingsPartProperty.STROKE, bindingsDataProperty.TEXT_COLOR),
            new go.Binding(bindingsPartProperty.FONT, bindingsDataProperty.TEXT_FONT))
    );   // This template represents a column

    return  _$(go.Node, 'Auto', {
            toolTip: tooltipTemplate(),
            doubleClick: tableDblClickHandler,
            selectionChanged: selectionChangedHandler,
            resizable: true,
            resizeObjectName: shapesName.TABLE,
            stretch: go.GraphObject.Fill,
            layerName: canvasStyle.layerName.nodeLayer
        },
        new go.Binding(bindingsPartProperty.VISIBLE, bindingsDataProperty.VISIBLE),
        new go.Binding('htmlToolTip', 'tooltip'),
        new go.Binding('position', 'bounds', function(b) { return b.position; })
            .makeTwoWay(function(p, d) {
                d.bounds.position = p;
                return d.bounds;
            }), // two-ways bindings ensure that if the user move the object, the bounds is updated
        // this rectangular shape surrounds the content of the node
        _$(
            go.Shape, {
                fill: canvasStyle.fullSchema.columnBackground,
                stroke: canvasStyle.fullSchema.joinStroke
            },
            new go.Binding(bindingsPartProperty.STROKE, bindingsPartProperty.STROKE)
        ),
        // the content consists of a header and a list of items
        _$(
            go.Panel, 'Vertical',
            {
                name: shapesName.TABLE,
                minSize: new go.Size(tableWidth, headerHeight),
                stretch: go.GraphObject.Fill,
                background: canvasStyle.fullSchema.columnBackground
            },
            new go.Binding(bindingsPartProperty.MAX_SIZE, bindingsDataProperty.FIELDS,
                (fields) => {
                    let size = new go.Size(tableWidth * 2,
                        headerHeight + topAndBottomSpace + fields.length * rowHeight);
                    return size;
            }),
            new go.Binding(bindingsPartProperty.DESIRED_SIZE, bindingsDataProperty.FIELDS,
                (fields) => {
                    if (fields.length > maxColumn) {
                        return new go.Size(tableWidth,
                            headerHeight + topAndBottomSpace + maxColumn * rowHeight);
                    }
                    return new go.Size(tableWidth,
                        headerHeight + topAndBottomSpace + fields.length * rowHeight);
            }),
            // this is the header for the whole node
            _$(
                go.Panel,
                'Auto',
                {
                    stretch: go.GraphObject.Fill
                },
                _$(
                    go.Shape, {
                        stroke: null,
                        height: headerHeight,
                        stretch: go.GraphObject.Horizontal
                    }, new go.Binding(bindingsPartProperty.FILL, bindingsDataProperty.HEADER_COLOR)
                ),
                _$(
                    go.Picture,
                    {
                        width: pictureHeaderSize.width,
                        height: pictureHeaderSize.height,
                        column: 0,
                        margin: new go.Margin(0,0,0, 2 * pictureMargin + pictureSize.width),
                        background: canvasStyle.fullSchema.transparentBackground,
                        // but disallow drawing links from or to this shape:
                        fromLinkable: false, toLinkable: false,
                        alignment: go.Spot.Left
                    },
                    new go.Binding(bindingsPartProperty.SOURCE, bindingsDataProperty.HEADER_PICTURE)
                ),
                _$(go.TextBlock,
                    {
                        stroke: 'white',
                        margin: new go.Margin(0, titleMargin),
                        font: canvasStyle.fullSchema.headerFont,
                        wrap: go.TextBlock.None,
                        alignment: go.Spot.Center,
                        overflow: go.TextBlock.OverflowEllipsis,
                        spacingAbove: textAdjust.above,
                        spacingBelow: textAdjust.below
                    },
                    new go.Binding(bindingsPartProperty.TEXT, bindingsDataProperty.TABLE_NAME)),
                _$('Button',
                    { portId: 'BUTTON' },
                    {
                        alignment: go.Spot.TopRight,
                        'ButtonBorder.stroke': null,
                        click: collapseButtonClickHandler
                    },
                    _$(go.Shape, shapesName.TRIANGLE_UP,
                        { name: shapesName.COLLAPSEBUTTON, width: 6, height: 4 }))
            ),
            // this Panel holds a Panel for each item object in the itemArray;
            // each item Panel is defined by the itemTemplate to be a TableRow in this Table
            _$(go.Panel, 'Table',
                {
                    name: shapesName.TABLE_COLUMNS,
                    visible: true,
                    padding: new go.Margin(margin, 0),
                    itemTemplate: fieldTemplate,
                    minSize: new go.Size(tableWidth, 0),
                    rowSizing: go.RowColumnDefinition.None,
                    stretch: go.GraphObject.Fill

                },
                new go.Binding(bindingsPartProperty.ITEM_ARRAY, bindingsDataProperty.FIELDS)
            )  // end Table Panel of items
        ),  // end Vertical Panel
        _$(go.Shape, shapesName.CHEVRON, {
                angle: chevrontRotation,
                width: chevronWidth,
                height: chevronHieght,
                alignment: chevronAlignment
            },
            new go.Binding(
                bindingsPartProperty.VISIBLE,
                bindingsPartProperty.DESIRED_SIZE,
                (size, goObject) => {
                    let maxHeight =  goObject.part.findObject(shapesName.TABLE).maxSize.height;
                    let currentHeight = size.height;
                    // we display the chevron only if there are some columns and if the user
                    // has not totally reduced the table
                    return (currentHeight < maxHeight && currentHeight >
                        headerHeight + rowHeight * 0.7);
                }
            ).ofObject(shapesName.TABLE)
        )
    );  // end Node
}

function schemaOverviewTemplate(): go.Node {
    return _$(go.Node, 'Auto',
        new go.Binding(bindingsPartProperty.VISIBLE, bindingsDataProperty.VISIBLE),
        new go.Binding('position', 'bounds', function(b) {
            return b.position; }),
        _$(go.Shape, 'RoundedRectangle',
            {
                stroke: '#0079A6',
                width:140,
                height:60
            },
            new go.Binding('fill', 'headerColor')
        ),
        {
            isActionable: false,
            movable: false
        }
    );
}

function schemaOverviewViewPortTemplate(): go.Node {
    return _$(go.Node, 'Auto',
        new go.Binding('position', 'bounds',function(b){
            return b.position;
        }).makeTwoWay(function(p, d) {
            d.bounds.position = p;
            return d.bounds;
        }),
        //new go.Binding('bounds', 'bounds', function(b) { return b; }),
        _$(go.Shape, 'RoundedRectangle',
            {
                stroke: canvasStyle.fullSchema.overviewStrokeColor,
                // should be ideally calculated from the scale
                strokeWidth: canvasStyle.fullSchema.overviewStrokeWidth,
                fill: canvasStyle.fullSchema.transparentBackground,
                name: shapesName.OVERVIEW_RECTANGLE
            }

        ),
        new go.Binding(bindingsPartProperty.WIDTH, bindingsDataProperty.BOUNDS, function(b){
                return b.width;
            }
        ),
        new go.Binding(bindingsPartProperty.HEIGHT, bindingsDataProperty.BOUNDS, function(b){
                return b.height;
            }
        ),
        {
            movable: true
        }
    );
}


//TODO(chab) remove once everything is done
Provide('schemaTemplatesService')({
    bindingsDataProperty,
    bindingsPartProperty,
    canvasStyle,
    customTransactions,
    groupTemplate,
    fullSchemaLinkTemplate: schemaLinkTemplate,
    fullSchemaNodeTemplate: schemaNodeTemplate,
    linksType: linksTypes,
    shapesName,
    schemaLegend,
    schemaLegendPicture,
    schemaOverviewTemplate,
    schemaOverviewViewPortTemplate,
    tooltipTemplate
});

export {
 bindingsDataProperty,
 bindingsPartProperty,
 canvasStyle,
 customTransactions,
 groupTemplate,
 schemaLinkTemplate as fullSchemaLinkTemplate,
 schemaNodeTemplate as fullSchemaNodeTemplate,
 linksTypes as linksType,
 shapesName,
 schemaLegend,
 schemaLegendPicture,
 schemaOverviewTemplate,
 schemaOverviewViewPortTemplate,
 tooltipTemplate
};



