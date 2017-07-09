/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A component to select a FontFace from a list of available
* FontFaces.
*/


import IPromise = angular.IPromise;
import {blinkConstants} from 'src/base/blink-constants';
import {BaseComponent} from '../../../../base/base-types/base-component';
import {ComponentPopupService}
    from '../../../../base/component-popup-service/component-popup-service';
import {Component} from '../../../../base/decorators';
import {FontFace} from '../../../../base/font-face';
import {FontEditorComponent} from '../font-editor/font-editor-component';
import {FontPreviewComponent} from '../font-preview/font-preview-component';

type FontGuidToPreviewComponentMap = {[fontFaceGuid: string]: FontPreviewComponent};

@Component({
    name: 'bkFontSelector',
    templateUrl: 'src/common/widgets/fonts/font-selector/font-selector.html'
})
export class FontSelectorComponent extends BaseComponent {

    private _selectedFontFace: FontFace;

    private fontFaceGuidToPreviewComponent: FontGuidToPreviewComponentMap = {};

    constructor(private fontFaces: FontFace[],
                private fontSelectionHandler: (fontFace: FontFace) => angular.IPromise<void>,
                private fontAddOrUpdateHandler: (fontFace: FontFace) => angular.IPromise<void>,
                selectedFontFace: FontFace = null,
                private placeholderText: string = null) {

        super();

        if (!selectedFontFace && fontFaces.length > 0) {
            selectedFontFace = fontFaces[0];
        }

        this.setSelectedFontFace(selectedFontFace);
        this.updateFontFacePreviewComponents();
    }

    public getFontFaces(): FontFace[] {
        return this.fontFaces;
    }

    public setFontFaces(fontFaces: FontFace[]): void {
        this.fontFaces = fontFaces;
        // set the selected font-face again to ensure that the
        // selected one is in the list of all font-faces
        this.setSelectedFontFace(this.selectedFontFace);
    }

    public getPlaceholderText(): string {
        return this.placeholderText;
    }

    public isSelectedFontFaceEditable(): boolean {
        return !!this.selectedFontFace && !this.selectedFontFace.isLocal();
    }

    public getSelectedFontFace(): FontFace {
        return this.selectedFontFace;
    }

    public setSelectedFontFace(fontFace: FontFace) {
        this._selectedFontFace = fontFace;
        if (this.selectedFontFace && this.fontFaces.indexOf(this.selectedFontFace) < 0) {
            this.fontFaces.unshift(this.selectedFontFace);
        }
        this.updateFontFacePreviewComponents();
    }

    public handleFontFaceSelection(selectedFontFace: FontFace): IPromise<void> {
        return this.fontSelectionHandler(selectedFontFace);
    }

    public getSelectedFontFacePreviewComponent(): FontPreviewComponent {
        var selectedFontFace: FontFace = this.selectedFontFace;
        if (!selectedFontFace) {
            return null;
        }
        return this.fontFaceGuidToPreviewComponent[selectedFontFace.guid];
    }

    public getFontFacePreviewComponent(fontFace: FontFace): FontPreviewComponent {
        return this.fontFaceGuidToPreviewComponent[fontFace.guid];
    }

    public getEditFontActionText(): string {
        return blinkConstants.fontSelector.EDIT_FONT_BUTTON_LABEL;
    }

    public getAddFontActionText(): string {
        return blinkConstants.fontSelector.ADD_NEW_FONT_BUTTON_LABEL;
    }

    public showNewFontEditorComponent(): void {
        var fontEditorComponent: FontEditorComponent = this.getFontEditorComponent();
        fontEditorComponent.clearFontFace();

        ComponentPopupService.show('bk-font-editor', fontEditorComponent);
    }

    public showSelectedFontEditorComponent(): void {
        var fontEditorComponent: FontEditorComponent = this.getFontEditorComponent(
            this.selectedFontFace
        );
        ComponentPopupService.show('bk-font-editor', fontEditorComponent);
    }

    private set selectedFontFace(fontFace: FontFace) {
        this._selectedFontFace = fontFace;
    }

    private get selectedFontFace(): FontFace {
        return this._selectedFontFace;
    }

    private handleFontEditorSave(fontFace: FontFace): void {
        ComponentPopupService.hide();
        // once the font is added to the list of custom fonts
        // make it the selected font as well
        this.fontAddOrUpdateHandler(fontFace)
            .then(
                () => {
                    this.setSelectedFontFace(fontFace);
                    return this.handleFontFaceSelection(this.selectedFontFace);
                }
            )
            .then(
                () => this.updateFontFacePreviewComponents()
            );
    }

    private handleFontEditorCancel(): void {
        ComponentPopupService.hide();
    }

    private getFontEditorComponent(fontFace: FontFace = null): FontEditorComponent {
        return new FontEditorComponent(
            fontFace,
            (fontFace: FontFace) => {
                this.handleFontEditorSave(fontFace);
            },
            () => {
                this.handleFontEditorCancel();
            }
        );
    }

    private updateFontFacePreviewComponents(): void {
        var existingComponentsMap: FontGuidToPreviewComponentMap
            = this.fontFaceGuidToPreviewComponent || {};
        var newComponentsMap = this.fontFaceGuidToPreviewComponent = {};

        this.fontFaces.forEach(function(fontFace: FontFace){
            var existingComponent: FontPreviewComponent = existingComponentsMap[fontFace.guid];
            if (!!existingComponent) {
                newComponentsMap[fontFace.guid] = existingComponent;
            } else {
                var component:FontPreviewComponent = new FontPreviewComponent(fontFace);
                newComponentsMap[fontFace.guid] = component;
            }
        });
    }

}
