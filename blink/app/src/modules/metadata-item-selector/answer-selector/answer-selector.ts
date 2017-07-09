/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Mahesh Sharma (mahesh@thoughtspot.com)
 *
 * @fileoverview Answer selector component.
 *
 */

import {Component} from '../../../base/decorators';
import {MetadataItemSelector, MetadataItemType, SelectionHandler} from '../metadata-item-selector';

@Component({
    name: 'bkAnswerSelector',
    templateUrl: 'src/modules/metadata-item-selector/metadata-item-selector.html'
})
export default class AnswerSelectorComponent extends MetadataItemSelector {
    public constructor(selectionHandler: SelectionHandler) {
        super(
            MetadataItemType.ANSWER,
            selectionHandler
        );
    }
}
