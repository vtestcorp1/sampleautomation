/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * Base class for the left-side list in schema-viewer.This subclass
 * add filter capacity
 *
 */

import {Provide} from 'src/base/decorators';
import {NavigationListController} from './navigation-list-controller';

@Provide('SchemaNavigationListController')
export default class SchemaNavigationListController extends NavigationListController {

    public getFilterByInput(input: string) {
        return (row) => {

            if (!input)  {
                return true;
            }
            input = input.trim();

            if (input.length === 0) {
                return true;
            }
            let itemName = row.item.getName().toLowerCase();
            input = input.toLowerCase();
            let index = itemName.indexOf(input);
            return index >= 0;
        };
    }
}
