/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview Exports a config class for Sankey Component
 */


import {getDOMClassesFromSelector} from '../../../../../base/utils/ts-utils';

export interface SankeyConfigOptions {
    iterations?: number;
    font?: string;
    labelPadding?: number;
    labelTextAnchor?: string;
    labelDownShift?: string;
    nodeWidth?: number;
    nodePadding?: number;
    minTextSize?: number;
    maxTextSize?: number;
    margin?: Spacing;
    padding?: Spacing;
    svgContainerSelector?: string;
    xAxisTopSelector?: string;
    xAxisBottomSelector?: string;
    chartSelector?: ChartSelector;
    tooltipClass?: string;
    chartAxisContainerSelector?: string;
    chartBodySelector?: string;
    sankeyClipPath?: string;
    _gradientStart?: number;
    _gradientEnd?: number;
}

let defaultConfig: SankeyConfigOptions = {
    iterations: 15,
    font: 'RetinaMP-Medium',
    labelPadding: 10,
    labelTextAnchor: 'end',
    labelDownShift: '.35em',
    nodeWidth:  10,
    nodePadding: 30,
    minTextSize:  10,
    maxTextSize: 10,
    margin: {
        top: 0, right: 30, bottom: 0, left:50
    },
    padding: {
        top: 30, right: 30, bottom: 30, left: 60
    },
    svgContainerSelector: '.sankey-chart',
    xAxisTopSelector: '.x.axis.top',
    xAxisBottomSelector: '.x.axis.bottom',
    chartSelector: {
        node: '.node',
        link: '.link'
    },
    tooltipClass: 'bk-sankey-tooltip',
    chartAxisContainerSelector: '.bk-chart-container',
    chartBodySelector: '.bk-chart-body',
    sankeyClipPath: 'chart-clip-path',
    _gradientStart: 10,
    _gradientEnd: 90
};

interface ChartSelector {
    node: string;
    link: string;
}
interface Spacing {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
interface Size {
    width: number;
    height: number;
}

export class SankeyConfig implements SankeyConfigOptions {
    public iterations?: number;
    public font?: string;
    public labelPadding?: number;
    public labelTextAnchor?: string;
    public labelDownShift?: string;
    public nodeWidth?: number;
    public nodePadding?: number;
    public minTextSize?: number;
    public maxTextSize?: number;
    public margin?: Spacing;
    public padding?: Spacing;
    public svgContainerSelector?: string;
    public xAxisTopSelector?: string;
    public xAxisBottomSelector?: string;
    public chartSelector?: ChartSelector;
    public tooltipClass?: string;
    public chartAxisContainerSelector?: string;
    public chartBodySelector?: string;
    public sankeyClipPath?: string;
    public _gradientStart?: number;
    public _gradientEnd?: number;

    public svgContainerClass: string;
    public xAxisTopClasses: string;
    public xAxisBottomClasses: string;
    public chartClasses: ChartSelector;
    public chartAxisContainerClass: string;
    public chartBodySelectorClass: string;

    constructor(config?: SankeyConfigOptions) {
        Object.assign(this, defaultConfig, config);
        this.initClassesField();
    }

    get gradientStart() {
        return `${this._gradientStart}%`;
    }
    get gradientEnd() {
        return `${this._gradientEnd}%`;
    }

    public getFullSize(_width, _height): Size {
        let width = _width - ( this.margin.left + this.margin.right);
        let height = _height - ( this.margin.bottom + this.margin.top);
        return { width, height };
    }

    public getChartSize(_width, _height): Size {
        let {width, height} = this.getFullSize(_width, _height);
        width = width - ( this.padding.left + this.padding.right);
        height = height - ( this.padding.top + this.padding.bottom);
        return { width, height };
    }

    private initClassesField() {
        this.xAxisTopClasses  = getDOMClassesFromSelector(this.xAxisTopSelector);
        this.xAxisBottomClasses  = getDOMClassesFromSelector(this.xAxisBottomSelector);
        this.svgContainerClass = getDOMClassesFromSelector(this.svgContainerSelector);
        this.chartAxisContainerClass = getDOMClassesFromSelector(this.chartAxisContainerSelector);
        this.chartBodySelectorClass = getDOMClassesFromSelector(this.chartBodySelector);
        this.chartClasses =
            Object.keys(this.chartSelector).reduce((acc, k) => {
                acc[k] = getDOMClassesFromSelector(this.chartSelector[k]);
                return acc;
            },<ChartSelector>{});
    }
}
