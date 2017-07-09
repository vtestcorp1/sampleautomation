
import Color = Chroma.Color;
import _ from 'lodash';
import {blinkConstants} from 'src/base/blink-constants';
import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';
import {CustomStyleBackground} from '../../../../modules/custom-styling/custom-style-config';
import {ColorConfiguratorComponent} from '../color-configurator/color-configurator-component';

@Component({
    name: 'bkBackgroundConfigurator',
    templateUrl: 'src/common/widgets/style-configuration/' +
                 'background-configurator/background-configurator.html'
})
export class BackgroundConfiguratorComponent extends BaseComponent {

    private colorConfiguratorComponent: ColorConfiguratorComponent;

    constructor(private backgroundStyle: CustomStyleBackground,
                private onChange:(updatedStyle: CustomStyleBackground) => void) {
        super();

        this.onChange = this.onChange || _.noop;

        this.colorConfiguratorComponent = new ColorConfiguratorComponent(
            backgroundStyle.color,
            (newColor: Color) => {
                backgroundStyle.color = newColor;
                this.handleChange();
            }
        );
    }

    public getColorPropertyName(): string {
        return blinkConstants
            .customizableStyleProperties
            .BACKGROUND_COLOR;
    }

    public getImagePropertyName(): string {
        return blinkConstants
            .customizableStyleProperties
            .BACKGROUND_IMAGE;
    }

    public getColorConfiguratorComponent(): ColorConfiguratorComponent {
        return this.colorConfiguratorComponent;
    }

    private handleChange(): void {
        this.onChange(this.backgroundStyle);
    }

}
