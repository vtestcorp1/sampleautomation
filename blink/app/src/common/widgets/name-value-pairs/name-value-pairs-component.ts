/**
 * Copyright: ThoughtSpot Inc. 2016
 * Francois Chabbey (francois.chabbey@thoughtspot.com)
 *
 * @fileoverview name-value pair component
 */

'use strict';

import {BaseComponent} from '../../../base/base-types/base-component';
import {Component} from '../../../base/decorators';

declare interface NameValue {
    name: string;
    value: string;
}

@Component({
    name: 'bkNameValuePairs',
    templateUrl: 'src/common/widgets/name-value-pairs/name-value-pairs.html'
})
export default class NameValuePairsComponent extends BaseComponent {

    public constructor(
        private nameValuePairs: Array<NameValue> = []
    ) {
        super();
    }

   public addNameValuePair(name:string, value:string) {
        this.nameValuePairs.push({name:name, value: value});
   }
   public removeNameValuePair(name:string) {
        this.nameValuePairs = this.nameValuePairs.filter((nameValuePair) => {
            return nameValuePair.name === name;
        });
   }
}
