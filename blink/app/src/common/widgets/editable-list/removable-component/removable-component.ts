
import {BaseComponent} from '../../../../base/base-types/base-component';
import {Component} from '../../../../base/decorators';

@Component({
    name: 'bkRemovable',
    templateUrl: 'src/common/widgets/editable-list/removable-component/removable-component.html',
    transclude: true
})
export class RemovableComponent<T extends BaseComponent> extends BaseComponent {
    constructor(private containedComponent: T,
                private removalHandler: (removedItem: RemovableComponent<T>) => void,
                private disabled: boolean) {

        super();
    }

    public getContainedComponent(): T {
        return this.containedComponent;
    }

    public disable() {
        this.disabled = true;
    }

    public enable() {
        this.disabled = false;
    }

    public isDisabled(): boolean {
        return this.disabled;
    }

    public handleRemoval() {
        this.removalHandler(this);
    }

}
