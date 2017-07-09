/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Model for representing data result set.
 */

import {ngRequire, Provide} from 'src/base/decorators';

let jsonConstants = ngRequire('jsonConstants');

@Provide('QueryData')
export class QueryData {
    private info: any;
    private data: Array<Array<any>>;

    constructor(infoJson: any) {
        this.info = infoJson;
        this.data = this.info[jsonConstants.queryInfo.DATA];
    }

    public getData() : Array<Array<any>> {
        return this.data;
    }
}
