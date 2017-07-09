import {ColorPalette} from '../../../../base/base-types/color-palette';
import {Component} from '../../../../base/decorators';
import {EditableListComponent} from '../../editable-list/editable-list-component';
import {ColorPaletteEditorComponent} from '../color-palette-editor/color-palette-editor-component';

type ColorPaletteListChangeHandler = (updatedList: ColorPalette[]) => void;

@Component({
    name: 'bkColorPaletteListEditor',
    templateUrl: 'src/common/widgets/color-palette/' +
                 'color-palette-list-editor/color-palette-list-editor.html'
})
export class ColorPaletteListEditorComponent
extends EditableListComponent<ColorPaletteEditorComponent> {

    private colorPaletteEditors: ColorPaletteEditorComponent[];
    private colorPaletteListChangeHandler: ColorPaletteListChangeHandler;
    private minColorsInPalette: number;
    private maxColorsInPalette: number;

    constructor(palettes: ColorPalette[],
                minPalettes: number = 0,
                maxPalettes: number = Number.POSITIVE_INFINITY,
                minColorsInPalette: number = 0,
                maxColorsInPalette: number = Number.POSITIVE_INFINITY,
                colorPaletteListChangeHandler: ColorPaletteListChangeHandler) {

        super([], minPalettes, maxPalettes);

        this.colorPaletteListChangeHandler = colorPaletteListChangeHandler;
        this.minColorsInPalette = minColorsInPalette;
        this.maxColorsInPalette = maxColorsInPalette;
        this.setColorPalettes(palettes);
    }

    public setColorPalettes(colorPalettes: ColorPalette[]): void {
        this.colorPaletteEditors = colorPalettes.map(
            (palette: ColorPalette) => new ColorPaletteEditorComponent(
                palette,
                (changedPalette: ColorPalette) => {
                    this.handleColorPaletteChange(changedPalette);
                },
                this.minColorsInPalette,
                this.maxColorsInPalette
            )
        );

        // Note (sunny): First version only supports editing existing colors in
        // existing color palettes.
        this.colorPaletteEditors.forEach(
            (colorPaletteEditor: ColorPaletteEditorComponent) => {
                colorPaletteEditor.setIsReadOnly(true);
            }
        );
        this.setIsReadOnly(true);

        this.setItems(this.colorPaletteEditors);
    }

    private handleColorPaletteChange(changedPalette: ColorPalette) {
        this.colorPaletteListChangeHandler(this.getColorPalettes());
    }

    private getColorPalettes(): ColorPalette[] {
        return this.colorPaletteEditors.map(
            (colorPaletteEditor: ColorPaletteEditorComponent) => {
                return colorPaletteEditor.getColorPalette();
            }
        );
    }
}
