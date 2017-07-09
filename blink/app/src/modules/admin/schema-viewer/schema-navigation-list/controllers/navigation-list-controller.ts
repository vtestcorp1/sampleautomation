/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This controller maintains a list of items displayed by the corresponding directive
 *
 */

import {Provide} from 'src/base/decorators';
import {BaseComponent} from '../../../../../base/base-types/base-component';

export class ListItem {
    public constructor(readonly item: any,
                       readonly id: string,
                       private values: any,
                       private selected: boolean) { }

    public setSelected(selected: boolean) {
        this.selected = selected;
    }
}

@Provide('NavigationListController')
export class NavigationListController extends BaseComponent {

    private selectedItem: ListItem;

    public static buildListItem(item:any ,
                                id: string ,
                                values: any,
                                selected: boolean) {

        return new ListItem(item, id, values, selected);
    }

    public constructor(private listItems: ListItem[],
                       private onItemClicked: (id: string, item) => void,
                       private onItemDblClicked: (id: string, item) => void,
                       public title: string,
                       public itemTemplateURL: string) {
        super();
    }

   public findItemById(id: string) {
        let listItems = this.listItems.filter((item) => item.id === id);
        return listItems.length === 0 ? null : listItems[0];
    }
    public selectItem(listItem: ListItem) {
        if (listItem) {
            if (this.selectedItem) {
                this.selectedItem.setSelected(false);
            }
            listItem.setSelected(true);
            this.selectedItem = listItem;
        }
    }
    public itemClicked(listItem: ListItem) {
        this.selectItem(listItem);
        this.onItemClicked(listItem.id, listItem.item);
    }

    public itemDblClicked(listItem: ListItem) {
        this.onItemDblClicked(listItem.id, listItem.item);
    }

    public setItems(listItems: ListItem[]) {
         this.listItems = listItems;
    }
}
