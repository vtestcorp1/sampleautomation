/**
 * Copyright: ThoughtSpot Inc. 2014
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview A side list for the worksheet-viewer
 */

'use strict';


import _ from 'lodash';
import {Provide} from 'src/base/decorators';
import {strings} from 'src/base/strings';
import {ListItem} from './navigation-list-controller';
import SchemaNavigationListController from './schema-navigation-list-controller';


@Provide('WorksheetNavigationListController')
export default class WorksheetNavigationListController extends SchemaNavigationListController {

    public constructor(items: ListItem[],
                       onListItemClicked: (id, string) => void) {
        let itemUrl =
            'src/modules/admin/schema-viewer/schema-navigation-list/worksheet-item.html';
        super(items,
            onListItemClicked,
            _.noop,  // no action for double click
            strings.schemaViewer.WKS_TITLE,
            itemUrl);
    }
}

