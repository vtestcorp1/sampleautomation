/**
* Copyright: ThoughtSpot Inc. 2012-2016
* Author: Shashank Singh (sunny@thoughtspot.com)
*
* @fileoverview A component that allows selecting a list of fonts. Each item
* in the list is mapped to a named label. Used to map different configurable
* parts of chart/table to their corresponding text style configuration.
*/

import {Component} from 'src/base/decorators';
import {BaseComponent} from '../../../../base/base-types/base-component';
import {FontFace} from '../../../../base/font-face';
import {FontSelectorComponent} from '../font-selector/font-selector-component';

export interface MultiFontSelectorItem {
    getLabel(): string;
    getSelectedFontFace(): FontFace;
    setSelectedFontFace(selectedFont: FontFace): angular.IPromise<void>;
}

@Component({
    name: 'bkMultiFontSelector',
    templateUrl: 'src/common/widgets/fonts/multi-font-selector/multi-font-selector.html'
})
export class MultiFontSelectorComponent<T extends MultiFontSelectorItem> extends BaseComponent {
    private _selectedItem: T = null;
    private _selectedFontFace: FontFace = null;
    private fontSelectorComponent: FontSelectorComponent = null;

    constructor(private items: T[],
                private availableFonts: FontFace[],
                private fontAddOrUpdateHandler: (fontFace: FontFace) => angular.IPromise<void>) {
        super();

        if (items.length > 0) {
            let firstItem: T = items[0];
            this._selectedFontFace = firstItem.getSelectedFontFace();
            this._selectedItem = firstItem;
        }

        this.fontSelectorComponent = new FontSelectorComponent(
            this.availableFonts,
            (selectedFontFace: FontFace) => {
                return this.setSelectedFontFace(selectedFontFace);
            },
            this.fontAddOrUpdateHandler,
            this._selectedFontFace
        );
    }

    public getItems(): T[] {
        return this.items;
    }

    public getSelectedItem(): T {
        return this.selectedItem;
    }

    public setSelectedItem(item: T): void {
        this.selectedItem = item;
    }

    public getSelectedItemLabel(): string {
        return this.selectedItem.getLabel();
    }

    public setAvailableFonts(availableFonts: FontFace[]): void {
        this.availableFonts = availableFonts;
        this.fontSelectorComponent.setFontFaces(availableFonts);
    }

    public setSelectedFontFace(fontFace: FontFace): angular.IPromise<void> {
        this._selectedFontFace = fontFace;
        return this._selectedItem.setSelectedFontFace(fontFace)
            .then(
                () => {
                    this.fontSelectorComponent.setSelectedFontFace(this._selectedFontFace);
                }
            );
    }

    public getFontSelectorComponent(): FontSelectorComponent {
        return this.fontSelectorComponent;
    }

    public handleItemSelection(item: T): void {
        this.setSelectedFontFace(item.getSelectedFontFace());
    }

    private get selectedItem(): T {
        return this._selectedItem;
    }

    private set selectedItem(item: T) {
        this._selectedItem = item;
    }
}
