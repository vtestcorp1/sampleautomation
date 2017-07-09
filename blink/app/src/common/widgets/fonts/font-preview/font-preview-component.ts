/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Shashank Singh (sunny@thoughtspot.com)
 *
 * @fileoverview A component to preview a font-face. The intended use case
 * is preview of a user uploaded font file.
 */
import {blinkConstants} from 'src/base/blink-constants';
import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {FontFace, FontFaceCSSStyle} from '../../../../base/font-face';

@Component({
    name: 'bkFontPreview',
    templateUrl: 'src/common/widgets/fonts/font-preview/font-preview.html'
})
export class FontPreviewComponent extends BaseComponent {
    constructor(private fontFace: FontFace) {
        super();
    }

    public getFontFace(): FontFace {
        return this.fontFace;
    }

    public isFontFaceAvailable(): boolean {
        return !!this.fontFace;
    }

    public getPreviewText(): string {
        return blinkConstants.fontPreview.PREVIEW_TEXT;
    }

    public getNoFontFaceMessage(): string {
        return blinkConstants.fontPreview.NO_FONT_FACE_MESSAGE;
    }

    public getFontCSSStyle(): FontFaceCSSStyle {
        return this.fontFace.toStyle();
    }

    public getFontFamily(): string {
        return this.fontFace.family;
    }

    public getFontInfoToolTipHtml(): string {
        if (!this.fontFace) {
            return '';
        }
        return this.fontFace.toHtml();
    }

    public setFontFace(fontFace: FontFace): void {
        this.fontFace = fontFace;
    }
}
