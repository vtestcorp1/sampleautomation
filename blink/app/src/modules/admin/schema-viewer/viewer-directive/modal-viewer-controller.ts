/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview
 *
 * This component displays a modal window designed to hold an
 * arbitrary schema-viewer.
 *
 */

import {Component} from 'src/base/decorators';
import {BaseComponent} from '../../../../base/base-types/base-component';
import BaseViewerController from './controllers/base-viewer-controller';

@Component({
    name: 'bkSchemaViewerModal',
    templateUrl: 'src/modules/admin/schema-viewer/viewer-directive/schema-viewer-modal.html',
})
export default class SchemaViewerModalComponent extends BaseComponent {

    public constructor(protected title: string,
                       protected contentCtrl: BaseViewerController,
                       private closeCallback: () => void) {
       super();
    }

    public close() {
        this.closeCallback();
    }
}

