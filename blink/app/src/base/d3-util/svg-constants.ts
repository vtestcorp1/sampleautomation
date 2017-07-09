/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview SVG constants
 */


export const SVG = {
    rect: 'rect',
    d: 'd',
    id: 'id',
    contexmenu: 'contextmenu',
    defs: 'defs',
    fill: 'fill',
    fontSize: 'font-size',
    fontFamily: 'font-family',
    linearGradient: 'linearGradient',
    svg: 'svg',
    transform: 'transform',
    path: 'path',
    gradient: 'gradient',
    x: 'x',
    y: 'y',
    dx: 'dx',
    dy: 'dy',
    x1: 'x1',
    x2: 'x2',
    y1: 'y1',
    klass: 'class',
    style: 'style',
    stroke: 'stroke',
    strokeWidth: 'stroke-width',
    text: 'text',
    textAnchor: 'text-anchor',
    title: 'title',
    width: 'width',
    height: 'height',
    stop: 'stop',
    stopColor: 'stop-color',
    offset: 'offset',
    gradientUnits: 'gradientUnits',
    userSpaceOnUse: 'userSpaceOnUse',
    g: 'g',
    translate: function(x, y) {
        return `translate(${x}, ${y})`;
    }
};
