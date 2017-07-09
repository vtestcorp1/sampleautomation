/**
 * Copyright: ThoughtSpot Inc. 2012-2017
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Name description component. This is used in visualization
 * cards and answer name etc to allow viewing of name and description and
 *
 */

import {BaseComponent} from '../../base/base-types/base-component';
import {Component} from '../../base/decorators';

@Component({
    name: 'bkNameDescription',
    templateUrl: 'src/modules/name-description/name-description.html'
})
export default class NameDescriptionComponent extends BaseComponent {
    constructor(public name: () => string, public description: () => string) {
        super();
    }
}
