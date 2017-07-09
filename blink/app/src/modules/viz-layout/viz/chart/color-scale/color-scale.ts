/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview UI component to show a color range.
 */

import _ from 'lodash';
import {BaseComponent} from '../../../../../base/base-types/base-component';
import {Component} from '../../../../../base/decorators';
import Color = Chroma.Color;

interface ColorScaleOptions {
    colors: string[]|((t: number) => Color);
    resolution?: number;
    leftText?: string;
    rightText?: string;
}

@Component({
    name: 'bkColorScale',
    templateUrl: 'src/modules/viz-layout/viz/chart/color-scale/color-scale.html'
})
export default class ColorScaleComponent extends BaseComponent {

    private static DEFAULT_RESOLUTION = 100;
    public readonly colors: string[];
    public leftText: string|undefined;
    public rightText: string|undefined;

    public static __getExamples() {
        return [
            {
                ctrl: new ColorScaleComponent({
                    colors: ['yellow', 'red', 'green'],
                    resolution: 100,
                    leftText: '12.3K',
                    rightText: '1.3M'
                })
            }
        ];
    }

    constructor(options: ColorScaleOptions) {
        super();
        this.leftText = options.leftText;
        this.rightText = options.rightText;
        let resolution = options.resolution || ColorScaleComponent.DEFAULT_RESOLUTION;
        let colorFunc = options.colors;
        if (!_.isFunction(colorFunc)) {
            colorFunc = chroma.scale(colorFunc);
        }
        this.colors = [];
        for (let i = 0; i < resolution; i++) {
            this.colors.push(
                colorFunc(i / (resolution - 1))
                    .toString()
            );
        }
    }
}
