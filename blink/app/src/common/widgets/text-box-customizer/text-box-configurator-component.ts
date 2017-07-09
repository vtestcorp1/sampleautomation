import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';
import {strings} from '../../../base/strings';

@Component({
    name: 'bkTextBoxConfigurator',
    templateUrl: 'src/common/widgets/text-box-customizer/text-box-configurator-component.html'
})
export class TextBoxConfiguratorComponent extends BaseComponent {

    public textBoxModel:string;
    public placeHolderText:string;
    public textBoxLength: number;

    constructor(public inputValue:string,
                public maxLength:number,
                private onChange:(updatedValue:string) => void) {

        super();
        this.onChange = this.onChange || _.noop;

        this.textBoxModel = '';
        this.placeHolderText = strings.textBoxConfigurator.PLACEHOLDER;
        this.textBoxLength = this.maxLength;
    }

    public setTextBox() {
        this.onChange(this.textBoxModel);
    }

    public updateTextBoxValue() {
        this.inputValue = '';
        this.textBoxModel = '';
    }
}
