/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A model to represent a custom FontFace.
 */

import {ngRequire} from './decorators';
import Color = Chroma.Color;
import _ from 'lodash';
import {blinkConstants} from './blink-constants';

let util: any = ngRequire('util');

// Note (sunny): When extending these enums always add values
// to the list (and not remove/re-order) to avoid compatibility
// issues with older persisted configs.
export enum FontFaceFormat  {
    WOFF = 0,
    WOFF2
}

export enum FontFaceStyle {
    NORMAL = 0,
    ITALIC,
    OBLIQUE
}
export enum FontFaceWeight {
    NORMAL = 400,
    LIGHT = 200,
    BOLD = 700
}

export interface FontFaceCSSStyle {
    fontFamily: string;
    fontWeight?: number | string;
    fontStyle?: string;
    fontSize?: string;
    color?: string;
    textShadow?: string;
}

export interface FontFaceCSSRule {
    fontFamily: string;
    fontUrl: string;
    fontFormat: string;
    fontVariant?: string;
    fontStretch?: string;
    fontWeight?: number;
    fontStyle?: string;
    unicodeRange?: string;
}

export class FontFace {
    private static FontFaceDefaultValues: any = {
        VARIANT: 'normal',
        STRETCH: 'normal',
        WEIGHT: FontFaceWeight.NORMAL,
        STYLE: FontFaceStyle.NORMAL,
        UNICODE_RANGE: 'U+0-10FFFF'
    };

    public static fromJson(json: any): FontFace {
        return new FontFace(
            json.guid,
            json.family,
            json.format,
            json.url,
            json.weight,
            json.style,
            json.size,
            json.unicodeRange,
            json.variant,
            json.strectch,
            chroma(json.color)
        );
    }

    private static convertFontFaceStyleToString(fontFaceStyle: FontFaceStyle): string {
        switch (fontFaceStyle) {
            case FontFaceStyle.ITALIC:
                return 'italic';
            case FontFaceStyle.OBLIQUE:
                return 'oblique';
            default:
                return 'normal';
        }
    }

    private static convertFontFormatToString(fontFormat: FontFaceFormat): string {
        switch (fontFormat) {
            case FontFaceFormat.WOFF2:
                return 'WOFF2';
            default:
                return 'WOFF';
        }
    }

    private static getQuotedFontFamilyName(fontFamily: string): string {
        var familyNames: string[] = fontFamily.split(',');
        var quotedFamilyNames = familyNames.map(function (familyName: string) {
            familyName = familyName.trim();
            return `'${familyName}'`;
        });
        return quotedFamilyNames.join(',');
    }

    constructor(public guid: string,
                public family: string,
                public format: FontFaceFormat,
                public url: string = null,
                public weight: FontFaceWeight = null,
                public style: FontFaceStyle = null,
                public size: number = NaN,
                public unicodeRange: string = null,
                public variant: string = null,
                public stretch: string = null,
                public color: Color = null) {
    }

    public toJson(): any {
        return {
            guid: this.guid,
            family: this.family,
            format: this.format,
            url: this.url,
            weight: this.weight,
            style: this.style,
            size: this.size,
            unicodeRange: this.unicodeRange,
            variant: this.variant,
            stretch: this.stretch,
            color: this.color.css()
        };
    }

    public toStyle(): FontFaceCSSStyle {
        // TODO (sunny): Figure out a good pattern to cache
        // these values that works with updates without having
        // to declare getters and setter for all properties.
        return this.createStyle();
    }

    public toHtml(): string {
        return this.createHtml();
    }

    public toFontFaceRule(): FontFaceCSSRule {
        var fontFaceRule: FontFaceCSSRule = {
            fontFamily: FontFace.getQuotedFontFamilyName(this.family),
            fontUrl: this.url,
            fontFormat: FontFace.convertFontFormatToString(this.format)
        };

        fontFaceRule.fontStyle = this.style !== null
            ? FontFace.convertFontFaceStyleToString(this.style)
            : FontFace.convertFontFaceStyleToString(FontFace.FontFaceDefaultValues.STYLE);

        fontFaceRule.fontWeight = _.isNumber(this.weight)
            ? this.weight : FontFace.FontFaceDefaultValues.WEIGHT;

        fontFaceRule.unicodeRange = this.unicodeRange !== null
            ? this.unicodeRange : FontFace.FontFaceDefaultValues.UNICODE_RANGE;

        fontFaceRule.fontVariant = this.variant !== null
            ? this.variant : FontFace.FontFaceDefaultValues.VARIANT;

        fontFaceRule.fontStretch = this.stretch !== null
            ? this.stretch : FontFace.FontFaceDefaultValues.STRETCH;

        return fontFaceRule;
    }

    public isLocal(): boolean {
        // if the font-doesn't have guid it is not backed by
        // a blob (this could be a FontFace representing a system
        // provided font or one loaded with the app)
        return !this.guid;
    }

    private createStyle(): FontFaceCSSStyle {
        var style: FontFaceCSSStyle = {
            fontFamily: FontFace.getQuotedFontFamilyName(this.family)
        };

        if (_.isNumber(this.weight)) {
            style.fontWeight = this.weight;
        } else {
            style.fontWeight = 'inherit';
        }

        if (this.style !== null) {
            style.fontStyle = FontFace.convertFontFaceStyleToString(this.style);
        } else {
            style.fontStyle = 'inherit';
        }

        if (_.isNumber(this.size)) {
            style.fontSize = `${this.size}px`;
        } else {
            style.fontSize = 'inherit';
        }

        if (this.color !== null) {
            style.color = this.color.css();
        } else {
            style.color = 'inherit';
        }

        // TODO (sunny): support configuring text-shadows.
        style.textShadow = 'none';

        return style;
    }

    private createHtml(): string {
        var propertyKeysRoot: any
            = blinkConstants.fontPreview.fontProperties;

        var tooltipData: any = new util.NameValuePairs();
        tooltipData.add(propertyKeysRoot.FAMILY, this.family);
        if (_.isNumber(this.weight)) {
            tooltipData.add(propertyKeysRoot.WEIGHT, FontFaceWeight[this.weight]);
        }
        if (!!this.style) {
            tooltipData.add(propertyKeysRoot.STYLE, FontFaceStyle[this.style]);
        }
        if (_.isNumber(this.size)) {
            tooltipData.add(propertyKeysRoot.SIZE, this.size.toString());
        }
        if (!!this.unicodeRange) {
            tooltipData.add(propertyKeysRoot.UNICODE_RANGE, this.unicodeRange);
        }
        if (!!this.variant) {
            tooltipData.add(propertyKeysRoot.VARIANT, this.variant);
        }
        if (!!this.stretch) {
            tooltipData.add(propertyKeysRoot.VARIANT, this.stretch);
        }
        if (!!this.color) {
            tooltipData.add(propertyKeysRoot.COLOR, this.color.css());
        }
        return tooltipData.getTemplate();
    }
}
