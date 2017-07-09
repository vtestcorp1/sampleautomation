/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview
 */
import {ngRequire} from '../../../../base/decorators';
import {Filter} from './filter';
import {FilterModel} from './filter-model';

let Logger = ngRequire('Logger');

export class DateFilterModel extends FilterModel {
    constructor(params, filter: Filter) {
        super(params, filter);
        this.logger = Logger.create('date-filter-model');
        this.needsDataFromServer = false;
    }

    public isSupportedByUI() : boolean {
        if (!super.isSupportedByUI()) {
            return false;
        }
        let isCompoundFilter = this.filterRows.length > 1;
        if (isCompoundFilter) {
            return false;
        }
        return true;
    }
}
