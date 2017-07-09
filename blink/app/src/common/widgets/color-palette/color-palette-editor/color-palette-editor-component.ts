

import {ColorPalette} from '../../../../base/base-types/color-palette';
import {Component} from '../../../../base/decorators';
import {EditableListComponent} from '../../editable-list/editable-list-component';
// tslint:disable-next-line
import {ColorConfiguratorComponent} from '../../style-configuration/color-configurator/color-configurator-component';
import Color = Chroma.Color;

type ChangeHandler = (changedPalette: ColorPalette) => void;

@Component({
    name: 'bkColorPaletteEditor',
    templateUrl: 'src/common/widgets/color-palette/color-palette-editor/color-palette-editor.html'
})
export class ColorPaletteEditorComponent extends EditableListComponent<ColorConfiguratorComponent> {

    private colorPalette: ColorPalette;
    private changeHandler: ChangeHandler;

    constructor(colorPalette: ColorPalette,
                changeHandler: ChangeHandler,
                minColors: number = 0,
                maxColors: number = Number.POSITIVE_INFINITY) {

        let colorConfiguratorComponents: ColorConfiguratorComponent[]
            = colorPalette.getColors().map(
                (color: Color) => {
                    return new ColorConfiguratorComponent(
                        color,
                        (color: Color) => this.handleColorChange(color)
                    );
                }
            );

        super(colorConfiguratorComponents, minColors, maxColors);

        this.colorPalette = colorPalette;
        this.changeHandler = changeHandler;
    }

    public getColorPalette(): ColorPalette {
        return this.colorPalette;
    }

    private handleColorChange(color: Color): void {
        this.colorPalette.setColors(this.getColors());
        this.changeHandler(this.colorPalette);
    }

    // TODO (sunny): implement this.
    // private handleColorRemoval(color: Color): void {
    // }

    private getColors(): Color[] {
        return this.getItems().map(
            (colorConfigurator: ColorConfiguratorComponent) => {
                return colorConfigurator.getColorInstance();
            }
        );
    }
}
