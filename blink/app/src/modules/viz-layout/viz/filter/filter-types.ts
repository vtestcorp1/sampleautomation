/**
 * Copyright: ThoughtSpot Inc. 2012-2016
 * Author: Jasmeet Singh Jaggi (jasmeet@thoughtspot.com)
 *
 * @fileoverview Exports different common types for filters.
 */

import _ from 'lodash';
import {ngRequire, Provide} from '../../../../base/decorators';
import {jsonConstants} from '../../answer/json-constants';

let Logger = ngRequire('Logger');


export enum FilterTypes {
    // Filter type for filters with one row.
    SIMPLE,
    // Filter type for filters with more than one row
    COMPOUND
}

export enum FilterRowType {
    // Default filter row type.
    SIMPLE,
    // Filter type when filters like near, farther are added.
    GEO
}

export enum FilterRowOperators {
    IN,
    EQ,
    GT,
    GE,
    LT,
    LE,
    NE,
    BW,
    BW_INC,
    BW_INC_MIN,
    BW_INC_MAX,
    CONTAINS,
    BEGINS_WITH,
    ENDS_WITH
}

export class FilterValue {
    private key: string;
    private keyNull: boolean;
    private selected: boolean;
    private logger;

    constructor(filterValueJson: any) {
        this.logger = Logger.create('filter-value');
        if (!filterValueJson) {
            this.logger.error('Filter Value initialized without json');
            return;
        }
        if (!_.isBoolean(filterValueJson[jsonConstants.filter.filterValue.SELECTED])) {
            this.logger.error('Filter Value initialized with non boolean selection state');
        }
        this.key = filterValueJson[jsonConstants.filter.filterValue.KEY];
        this.selected = filterValueJson[jsonConstants.filter.filterValue.SELECTED];
        this.keyNull = filterValueJson[jsonConstants.filter.filterValue.KEYNULL];
    }

    public getKey() : string {
        if (this.keyNull === true) {
            return null;
        }
        return this.key;
    }

    public isSelected() : boolean {
        return this.selected;
    }
}

Provide('filterTypes')({
    FilterRowOperators
});
