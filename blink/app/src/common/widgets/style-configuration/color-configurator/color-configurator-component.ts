/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A simple wrapper around the color-picker directive that converts
* it into a component.
*/


import Color = Chroma.Color;
import _ from 'lodash';
import {BaseComponent} from 'src/base/base-types/base-component';
import {Component} from 'src/base/decorators';

@Component({
    name: 'bkColorConfigurator',
    templateUrl: 'src/common/widgets/style-configuration/color-configurator/color-configurator.html'
})
export class ColorConfiguratorComponent extends BaseComponent {
    constructor(private colorInstance: Color,
                private changeHandler: (color: Color) => void = null) {
        super();

        this.changeHandler = this.changeHandler || _.noop;
    }

    public getColorInstance(): Color {
        return this.colorInstance;
    }

    public setColorInstance(color: Color): void {
        this.colorInstance = color;
    }

    public handleColorChange(): void {
        this.changeHandler(this.colorInstance);
    }

    public get color(): string {
        return this.colorInstance.css();
    }

    public set color(color: string) {
        // color-picker changes color model very frequently
        // as the user moves their mouse over color picker
        // UI. Hence we don't use this to trigger change handler.
        // Use explicit change handler instead.
        this.colorInstance = chroma(color);
    }
}
