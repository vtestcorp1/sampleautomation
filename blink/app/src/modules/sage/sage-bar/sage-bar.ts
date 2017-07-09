/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview This is a component that should be used to embed a sage bar.
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';

@Component({
    name: 'bkSageBar',
    templateUrl: 'src/modules/sage/sage-bar/sage-bar.html'
})

export class SageBarComponent extends BaseComponent {
    constructor(
        public sageClient: any,
        public sageSearchOnInit: boolean,
        public canEdit: boolean,
        public readOnlyText: string,
        public onForceInvalidSearch: Function,
        public onSearchCorrected: Function,
        public onSageEdit: Function
    ) {
        super();
    }
}
