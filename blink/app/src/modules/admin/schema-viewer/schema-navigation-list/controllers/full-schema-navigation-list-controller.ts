/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview This controller maintains a list of tables
 *
 */

import {ngRequire, Provide} from 'src/base/decorators';
import {strings} from 'src/base/strings'; // because only public prop are accessible
import {ListItem} from './navigation-list-controller';
import SchemaNavigationListController from './schema-navigation-list-controller';

let labelsService = ngRequire('labelsService');

@Provide('FullSchemaNavigationListController')
export default class FullSchemaNavigationListController extends SchemaNavigationListController {

    public labelsRegistry: any;

    public constructor (items: ListItem[],
                        onListItemClicked: (id: string, item: any) => void,
                        onListItemDblClicked: (id: string, item: any) => void) {

        let itemTemplateUrl =
            'src/modules/admin/schema-viewer/schema-navigation-list/schema-item.html';
        super(
            items,
            onListItemClicked,
            onListItemDblClicked,
            strings.schemaViewer.TABLE_TITLE,
            itemTemplateUrl
        );
        this.labelsRegistry = labelsService.labelsRegistry;
    }
}

