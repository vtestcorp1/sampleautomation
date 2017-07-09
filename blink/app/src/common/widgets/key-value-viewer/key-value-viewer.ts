/**
 * Copyright: ThoughtSpot Inc. 2017
 * Author: Jasmeet Singh Jaggi(jasmeet@thoughtspot.com)
 *
 * @fileoverview A component to view key and value.
 * Alignments can be vertical or horizontal.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';

export enum Alignments {
    VERTICAL,
    HORIZONTAL
}

@Component({
    name: 'bkKeyValueViewer',
    templateUrl: 'src/common/widgets/key-value-viewer/key-value-viewer.html'
})
export class KeyValueViewerComponent extends BaseComponent {
    public Alignments;

    public constructor(
        public key: string,
        public value: string,
        public alignment: Alignments
    ) {
        super();
        this.Alignments = Alignments;
    }
}
