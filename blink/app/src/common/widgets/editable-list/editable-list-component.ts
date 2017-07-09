
import _ from 'lodash';
import {BaseComponent} from '../../../base/base-types/base-component';
import {RemovableComponent} from './removable-component/removable-component';

export class EditableListComponent<T extends BaseComponent> extends BaseComponent {
    private removableListItems: RemovableComponent<T>[];

    constructor(private listItems: T[],
                private minItems: number = 0,
                private maxItems: number = Number.POSITIVE_INFINITY,
                private itemAdditionRequestHandler: () => void = null,
                private itemRemovalHandler: (removedItem: T) => void = null,
                private readOnly: boolean = false) {
        super();

        this.itemAdditionRequestHandler
            = this.itemAdditionRequestHandler || _.noop;
        this.itemRemovalHandler
            = this.itemRemovalHandler || _.noop;

        this.setItems(listItems);
    }

    public setIsReadOnly(isReadOnly: boolean): void {
        this.readOnly = isReadOnly;
        this.updateRemovability();
    }

    public getItems(): T[] {
        return this.listItems;
    }

    public setItems(items: T[]): void {
        this.removableListItems = [];
        this.addItems(items);
        this.updateRemovability();
    }

    public addItems(itemsToAdd: T[]): void {
        itemsToAdd.forEach(
            (itemToAdd: T) => {
                this.addItem(itemToAdd);
            }
        );
    }

    public addItem(itemToAdd: T): void {
        let removableComponent: RemovableComponent<T> = new RemovableComponent<T>(
            itemToAdd,
            (removedRemovableComponent: RemovableComponent<T>) => {
                this.handleRemovableItemRemoval(removedRemovableComponent);
            },
            false
        );

        this.removableListItems.add(removableComponent);
    }

    public removeItem(itemToRemove: T): void {
        this.removableListItems.remove(
            (removableListItem: RemovableComponent<T>) => {
                return removableListItem.getContainedComponent() === itemToRemove;
            }
        );
    }

    public getRemovableItems(): RemovableComponent<T>[] {
        return this.removableListItems;
    }

    public handleItemAdditionRequest(): void {
        this.itemAdditionRequestHandler();
    }

    private handleRemovableItemRemoval(removedRemovableComponent: RemovableComponent<T>): void {
        this.removableListItems.remove(removedRemovableComponent);
        this.itemRemovalHandler(
            removedRemovableComponent.getContainedComponent()
        );
    }

    private isRemovalDisabled(): boolean {
        return this.readOnly
            || this.removableListItems.length <= this.minItems
            || this.removableListItems.length >= this.maxItems;
    }

    private updateRemovability(): void {
        let removalDisabled: boolean = this.isRemovalDisabled();
        this.removableListItems.forEach(
            (removableColorComponent: RemovableComponent<T>) => {
                if (removalDisabled) {
                    removableColorComponent.disable();
                } else {
                    removableColorComponent.enable();
                }
            }
        );
    }
}
