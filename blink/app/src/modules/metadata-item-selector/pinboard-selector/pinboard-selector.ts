/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Pinboard selector component.
 *
 */

import {Component} from '../../../base/decorators';
import {MetadataItemSelector, MetadataItemType, SelectionHandler} from '../metadata-item-selector';

@Component({
    name: 'bkPinboardSelector',
    templateUrl: 'src/modules/metadata-item-selector/metadata-item-selector.html'
})
export default class PinboardSelectorComponent extends MetadataItemSelector {
    public constructor(selectionHandler: SelectionHandler) {
        super(
            MetadataItemType.PINBOARD,
            selectionHandler
        );
    }
}
