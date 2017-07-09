/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A model repsenting color palettes used in blink charts (and possibly
* other places too in the future).
*/

import Color = Chroma.Color;

export class ColorPalette {
    public static fromJson(json: any): ColorPalette {
        var colors: Color[] = json.colors.map(
            (color: string) => {
                return chroma(color);
            }
        );
        return new ColorPalette(colors);
    }

    constructor(private colors: Color[]) {

    }

    public toJson(): any {
        var colors: string[] = this.colors.map(
            (color: Color) => {
                return color.css();
            }
        );
        return {
            colors: colors
        };
    }

    public getColors(): Color[] {
        return this.colors;
    }

    public setColors(colors: Color[]) {
        this.colors = colors;
    }

    public getCssColors(): string[] {
        return this.colors.map(
            (color: Color) => color.css()
        );
    }

    // This updated the pallete to new size using default colors.
    // We try to retain as much we can.
    public sanitizeColors (defaultColors: Color[]) {
        if (!!this.colors && this.colors.length >= defaultColors.length) {
            this.colors = this.colors.slice(0, defaultColors.length);
        } else {
            this.colors = defaultColors.slice(0);
        }
    }
}
