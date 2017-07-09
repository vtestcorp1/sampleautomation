/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Class to represent filter content.
 * In the current model we have a Filter Object which contains all the filter conditions
 * with the filter model containing links to it.
 * All this information is contained inside of this filter content object.
 */

import _ from 'lodash';
import {ngRequire} from '../../../../base/decorators';
import {jsonConstants} from '../../answer/json-constants';
import {BaseFilterRow} from './filter-row';
import {FilterTypes} from './filter-types';
import {MultiOperatorFilterRow} from './multi-operator-filter-row';
import {SingleOperatorFilterRow} from './single-operator-filter-row';

let Logger = ngRequire('Logger');

export class FilterContent {
    private rows: BaseFilterRow[];
    private filterType: FilterTypes;
    private logger;

    constructor(json) {
        this.logger = Logger.create('filter-content');
        if (!json) {
            this.logger.error('No json passed for construction');
            return;
        }
        if (!_.isArray(json[jsonConstants.filter.ROWS])) {
            this.logger.error('Filter rows is not an array');
            return;
        }
        this.rows = getFilterRows(json[jsonConstants.filter.ROWS]);
        this.filterType = json[jsonConstants.TYPE_KEY];
    }

    public getRows() : BaseFilterRow[] {
        return this.rows;
    }

    public getRowAtIndex(index: number) : BaseFilterRow {
        return this.rows[index];
    }
}

function getFilterRows(filterRowsJson: any[] = []) : BaseFilterRow[] {
    return filterRowsJson.map((filterRowJson) => {
        let isMultiOp = filterRowJson.hasOwnProperty(
            jsonConstants.filter.MULTIPLE_OPERATORS_KEY
        );
        if (isMultiOp) {
            return new MultiOperatorFilterRow(filterRowJson);
        } else {
            return new SingleOperatorFilterRow(filterRowJson);
        }
    });
}
