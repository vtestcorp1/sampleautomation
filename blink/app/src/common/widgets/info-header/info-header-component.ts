/**
 * Copyright: ThoughtSpot Inc. 2016
 * Author: Francois Chabbey
 * @fileoverview  A list of links
 *
 */

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component}   from '../../../base/decorators';


@Component({
    name: 'bkInfoHeader',
    templateUrl: 'src/common/widgets/info-header/info-header.html'
})
export default class InfoHeaderComponent extends BaseComponent {
    public constructor(public headerText: string) {
        super();
    }
}

