/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Client side class representing the Filter Object returned from callosum
 * as part of the Answersheet. This is the container of all the filter contitions.
 */

import {ngRequire} from '../../../../base/decorators';
import {jsonConstants} from '../../answer/json-constants';
import {FilterContent} from './filter-content';

let Logger = ngRequire('Logger');

export class Filter {
    private logger;
    private complete: boolean;
    private filterContent: FilterContent;
    private headers: any;
    private incompleteDetail: any[];

    constructor(json) {
        this.logger = Logger.create('filter');
        if (!json) {
            this.logger.error('Undefined Json in construction');
            return;
        }
        this.complete = json[jsonConstants.VIZ_COMPLETE_KEY];
        this.filterContent = new FilterContent(json[jsonConstants.filter.FILTER_CONTENT]);
        this.headers = json[jsonConstants.HEADER_KEY];
        this.incompleteDetail = json[jsonConstants.INCOMPLETE_DETAIL];
    }

    public isComplete() : boolean {
        return this.complete;
    }

    public getFilterContent() : FilterContent {
        return this.filterContent;
    }
}
