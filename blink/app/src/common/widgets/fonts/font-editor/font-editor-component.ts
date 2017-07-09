/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A component to allow the user to create or update a FontFace
*/


import Color = Chroma.Color;
import {BaseComponent} from 'src/base/base-types/base-component';
import {blinkConstants} from 'src/base/blink-constants';
import {Component} from 'src/base/decorators';
import {BlobService, BlobType} from '../../../../base/blob-service';
import {FontFace, FontFaceFormat, FontFaceStyle, FontFaceWeight} from '../../../../base/font-face';
import {CustomStylingService} from '../../../../modules/custom-styling/custom-styling-service';
import {BlobUploaderComponent} from '../../blob/blob-uploader/blob-uploader-component';
import {ColorConfiguratorComponent}
    from '../../style-configuration/color-configurator/color-configurator-component';
import {FontPreviewComponent} from '../font-preview/font-preview-component';



@Component({
    name: 'bkFontEditor',
    templateUrl: 'src/common/widgets/fonts/font-editor/font-editor.html'
})
export class FontEditorComponent extends BaseComponent {
    private static FONT_FACE_WEIGHTS: FontFaceWeight[] = [
        FontFaceWeight.NORMAL,
        FontFaceWeight.BOLD,
        FontFaceWeight.LIGHT
    ];

    private static FONT_FACE_STYLES: FontFaceStyle[] = [
        FontFaceStyle.NORMAL,
        FontFaceStyle.ITALIC,
        FontFaceStyle.OBLIQUE
    ];

    private static DefaultFontProperties: any = {
        COLOR: 'black',
        WEIGHT: FontFaceWeight.NORMAL,
        STYLE: FontFaceStyle.NORMAL,
        SIZE: 13
    };

    private defaultFontFace: FontFace = FontEditorComponent.createDefaultFontFace();
    private fontUploaderComponent: BlobUploaderComponent = null;
    private fontPreviewComponent: FontPreviewComponent = null;
    private colorConfiguratorComponent: ColorConfiguratorComponent = null;

    private static createDefaultFontFace(): FontFace {

        var fontFace = new FontFace(
            null,
            blinkConstants
                .fontEditor
                .DEFAULT_FONT_FAMILY_NAME,
            FontFaceFormat.WOFF
        );
        fontFace.color = chroma(FontEditorComponent.DefaultFontProperties.COLOR);
        fontFace.weight = FontEditorComponent.DefaultFontProperties.WEIGHT;
        fontFace.style = FontEditorComponent.DefaultFontProperties.STYLE;
        fontFace.size = FontEditorComponent.DefaultFontProperties.SIZE;

        return fontFace;
    }

    constructor(private fontFace: FontFace = null,
                private saveHandler: (fontFace: FontFace) => void,
                private cancelHandler: ()=> void) {
        super();

        if (!fontFace) {
            fontFace = this.defaultFontFace;
        }

        this.fontUploaderComponent = new BlobUploaderComponent(
            fontFace.guid,
            BlobType.FONT_WOFF,
            (blobGuid: string) => this.handleFontUpload(blobGuid),
            (file: File) => {
                return this.validateFontFile(file);
            }
        );
        this.fontPreviewComponent = new FontPreviewComponent(this.fontFace);

        this.colorConfiguratorComponent = new ColorConfiguratorComponent(
            fontFace.color,
            function (newColor: Color): void {
                fontFace.color = newColor;
            }
        );
    }

    public getFontFace(): FontFace {
        return this.fontFace;
    }

    public isCustomFontFace(): boolean {
        return !this.fontFace.isLocal();
    }

    public setFontFace(fontFace: FontFace): void {
        this.fontFace = fontFace;
        this.fontPreviewComponent.setFontFace(this.fontFace);
    }

    public clearFontFace(): void {
        this.setFontFace(this.defaultFontFace);
    }

    public set fontFamily(fontFamily: string) {
        this.fontFace.family = fontFamily;
    }

    public get fontFamily(): string {
        return this.fontFace.family;
    }

    public set fontColor(fontColor: Color) {
        this.fontFace.color = fontColor;
    }

    public get fontColor(): Color {
        return this.fontFace.color;
    }

    public set fontWeight(fontWeight: FontFaceWeight) {
        this.fontFace.weight = fontWeight;
    }

    public get fontWeight(): FontFaceWeight {
        return this.fontFace.weight;
    }

    public set fontStyle(fontStyle: FontFaceStyle) {
        this.fontFace.style = fontStyle;
    }

    public get fontStyle(): FontFaceStyle {
        return this.fontFace.style;
    }

    public getFontUploaderComponent(): BlobUploaderComponent {
        return this.fontUploaderComponent;
    }

    public getFontPreviewComponent(): FontPreviewComponent {
        return this.fontPreviewComponent;
    }

    public getColorConfiguratorComponent(): ColorConfiguratorComponent {
        return this.colorConfiguratorComponent;
    }

    public getFontFamilyPropertyName(): string {
        return blinkConstants.fontPreview.fontProperties.FAMILY;
    }

    public getFontColorPropertyName(): string {
        return blinkConstants.fontPreview.fontProperties.COLOR;
    }

    public getFontWeightPropertyName(): string {
        return blinkConstants.fontPreview.fontProperties.WEIGHT;
    }

    public getFontStylePropertyName(): string {
        return blinkConstants.fontPreview.fontProperties.STYLE;
    }

    public getSaveButtonLabel(): string {
        return blinkConstants.SAVE;
    }

    public getCancelButtonLabel(): string {
        return blinkConstants.CANCEL;
    }

    public getFontFaceWeights(): FontFaceWeight[] {
        return FontEditorComponent.FONT_FACE_WEIGHTS;
    }

    public getFontFaceStyles(): FontFaceStyle[] {
        return FontEditorComponent.FONT_FACE_STYLES;
    }

    public convertFontFaceWeightToLabel(fontWeight: FontFaceWeight): string {
        var constantsRoot: any = blinkConstants
            .fontEditor
            .fontFaceWeight;

        switch (fontWeight) {
            case FontFaceWeight.BOLD:
                return constantsRoot.BOLD;
            case FontFaceWeight.LIGHT:
                return constantsRoot.LIGHT;
            default:
                return constantsRoot.NORMAL;
        }
    }

    public convertFontFaceStyleToLabel(fontStyle: FontFaceStyle): string {
        var constantsRoot: any = blinkConstants
            .fontEditor
            .fontFaceStyle;

        switch (fontStyle) {
            case FontFaceStyle.ITALIC:
                return constantsRoot.ITALIC;
            case FontFaceStyle.OBLIQUE:
                return constantsRoot.OBLIQUE;
            default:
                return constantsRoot.NORMAL;
        }
    }

    public handleSave(): void {
        this.saveHandler(this.fontFace);
    }

    public handleCancel(): void {
        this.cancelHandler();
    }

    private handleFontUpload(fontBlobGuid: string): void {
        this.fontFace.guid = fontBlobGuid;
        this.fontFace.url = BlobService.getBlobUrl(fontBlobGuid);

        CustomStylingService.addCustomFontFaceStyle(this.fontFace);
    }

    private validateFontFile(file: File): string {
        return null;
    }
}
